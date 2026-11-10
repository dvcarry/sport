create or replace function private.ritm_read() returns jsonb language sql stable security definer set search_path='' as $$
 select jsonb_build_object('payload',payload,'version',updated_at,'linked',private.ritm_owner()<>auth.uid())
 from public.training_diaries where user_id=private.ritm_owner();
$$;
