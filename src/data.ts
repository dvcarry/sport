import { createClient } from '@supabase/supabase-js';
export type Exercise = {id:string;name:string;muscles:string[];equipment:string};
export type WorkoutSet = {id:string;weight:number;reps:number;done:boolean;addedAt?:string;warmup?:boolean;effort?:'easy'|'normal'|'hard'};
export type WorkoutExercise = {id:string;exercise:Exercise;sets:WorkoutSet[]};
export type Workout = {id:string;startedAt:string;finishedAt?:string;importedDurationMinutes?:number;importFingerprint?:string;exercises:WorkoutExercise[]};
export type Data = {library:Exercise[];workouts:Workout[]};
const env = (import.meta as unknown as {env:Record<string,string>}).env;
export const supabase = env.VITE_SUPABASE_URL && env.VITE_SUPABASE_ANON_KEY ? createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY) : null;
export const uid = () => crypto.randomUUID();
export const initial:Data = {library:[
{id:'bench',name:'Жим штанги лёжа',muscles:['Грудь','Трицепс'],equipment:'Штанга'},
{id:'squat',name:'Приседания со штангой',muscles:['Ноги','Ягодицы'],equipment:'Штанга'},
{id:'row',name:'Тяга верхнего блока',muscles:['Спина','Бицепс'],equipment:'Тренажёр'},
{id:'press',name:'Жим гантелей сидя',muscles:['Плечи','Трицепс'],equipment:'Гантели'},
{id:'deadlift',name:'Румынская тяга',muscles:['Ноги','Ягодицы','Спина'],equipment:'Штанга'},
{id:'curl',name:'Сгибания рук с гантелями',muscles:['Бицепс'],equipment:'Гантели'},
{id:'crunch',name:'Скручивания',muscles:['Пресс'],equipment:'Свой вес'},
{id:'pullup',name:'Подтягивания',muscles:['Спина','Бицепс'],equipment:'Турник'}],workouts:[]};
export function readData():Data {try {const d=JSON.parse(localStorage.getItem('ritm-data')||'null');return d?.library && d?.workouts?d:initial;}catch{return initial;}}
export async function getCloud():Promise<Data|null>{if(!supabase)return null;const {data:{session}}=await supabase.auth.getSession();if(!session){const {error}=await supabase.auth.signInAnonymously();if(error)throw error;}const {data,error}=await supabase.from('training_diaries').select('payload').maybeSingle();if(error)throw error;return data?.payload??null;}
export async function saveCloud(payload:Data){if(!supabase)return;const {data:{user}}=await supabase.auth.getUser();if(!user)throw new Error('Нет сессии Supabase');const {error}=await supabase.from('training_diaries').upsert({user_id:user.id,payload,updated_at:new Date().toISOString()});if(error)throw error;}



