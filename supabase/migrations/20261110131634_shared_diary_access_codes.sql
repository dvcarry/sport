-- Personal codes grant access to one shared diary, without email.
create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;

create table private.ritm_diary_links (
 member_id uuid primary key references auth.users(id) on delete cascade,
 owner_id uuid not null references public.training_diaries(user_id) on delete cascade
);
create table private.ritm_diary_codes (
 owner_id uuid primary key references public.training_diaries(user_id) on delete cascade,
 code_hash text not null unique,
 created_at timestamptz not null default now()
);
alter table private.ritm_diary_links enable row level security;
alter table private.ritm_diary_codes enable row level security;
revoke all on private.ritm_diary_links,private.ritm_diary_codes from public,anon,authenticated;

create function private.ritm_owner() returns uuid language plpgsql stable security definer set search_path='' as $$
declare caller uuid:=auth.uid(); owner uuid;
begin
 if caller is null then raise exception 'Authentication required' using errcode='42501'; end if;
 select owner_id into owner from private.ritm_diary_links where member_id=caller;
 return coalesce(owner,caller);
end $$;

create function private.ritm_read() returns jsonb language sql stable security definer set search_path='' as $$
 select jsonb_build_object('payload',payload,'version',updated_at) from public.training_diaries where user_id=private.ritm_owner();
$$;

create function private.ritm_save(p_payload jsonb,p_version timestamptz) returns timestamptz language plpgsql security definer set search_path='' as $$
declare owner uuid:=private.ritm_owner(); new_version timestamptz;
begin
 if jsonb_typeof(p_payload->'library') is distinct from 'array' or jsonb_typeof(p_payload->'workouts') is distinct from 'array' then raise exception 'Invalid diary'; end if;
 insert into public.training_diaries(user_id,payload,updated_at) values(owner,p_payload,clock_timestamp())
 on conflict(user_id) do update set payload=excluded.payload,updated_at=excluded.updated_at
 where training_diaries.updated_at=p_version
 returning updated_at into new_version;
 if new_version is null then raise exception 'DIARY_CONFLICT' using errcode='40001'; end if;
 return new_version;
end $$;

create function private.ritm_create_code() returns text language plpgsql security definer set search_path='' as $$
declare owner uuid:=private.ritm_owner(); code text:=upper(replace(gen_random_uuid()::text,'-',''));
begin
 if not exists(select 1 from public.training_diaries where user_id=owner) then raise exception 'Save diary first'; end if;
 insert into private.ritm_diary_codes(owner_id,code_hash) values(owner,encode(sha256(convert_to(code,'UTF8')),'hex'))
 on conflict(owner_id) do update set code_hash=excluded.code_hash,created_at=now();
 return substr(code,1,8)||'-'||substr(code,9,8)||'-'||substr(code,17,8)||'-'||substr(code,25,8);
end $$;

create function private.ritm_join(p_code text) returns void language plpgsql security definer set search_path='' as $$
declare caller uuid:=auth.uid(); normalized text:=upper(regexp_replace(p_code,'[\s-]','','g')); owner uuid;
begin
 if caller is null then raise exception 'Authentication required' using errcode='42501'; end if;
 if normalized !~ '^[0-9A-F]{32}$' then raise exception 'INVALID_DIARY_CODE'; end if;
 select owner_id into owner from private.ritm_diary_codes where code_hash=encode(sha256(convert_to(normalized,'UTF8')),'hex');
 if owner is null then raise exception 'INVALID_DIARY_CODE'; end if;
 if owner=caller then delete from private.ritm_diary_links where member_id=caller;
 else insert into private.ritm_diary_links(member_id,owner_id) values(caller,owner) on conflict(member_id) do update set owner_id=excluded.owner_id;
 end if;
end $$;

revoke all on function private.ritm_owner(),private.ritm_read(),private.ritm_save(jsonb,timestamptz),private.ritm_create_code(),private.ritm_join(text) from public,anon;
grant execute on function private.ritm_read(),private.ritm_save(jsonb,timestamptz),private.ritm_create_code(),private.ritm_join(text) to authenticated;

create function public.read_training_diary() returns jsonb language sql security invoker set search_path='' as $$ select private.ritm_read(); $$;
create function public.save_training_diary(p_payload jsonb,p_version timestamptz) returns timestamptz language sql security invoker set search_path='' as $$ select private.ritm_save(p_payload,p_version); $$;
create function public.create_diary_code() returns text language sql security invoker set search_path='' as $$ select private.ritm_create_code(); $$;
create function public.join_diary(p_code text) returns void language sql security invoker set search_path='' as $$ select private.ritm_join(p_code); $$;
revoke all on function public.read_training_diary(),public.save_training_diary(jsonb,timestamptz),public.create_diary_code(),public.join_diary(text) from public,anon;
grant execute on function public.read_training_diary(),public.save_training_diary(jsonb,timestamptz),public.create_diary_code(),public.join_diary(text) to authenticated;
