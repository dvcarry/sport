import type {HabitDay,WaterGlass} from './dailyWellness';
import type {FoodProduct,ProductType,Meal} from './foodProducts';
import type {FoodEntry} from './nutrition';
import { createClient } from '@supabase/supabase-js';
export type Exercise = {id:string;name:string;muscles:string[];equipment:string};
export type WorkoutSet = {id:string;weight:number;reps:number;done:boolean;addedAt?:string;warmup?:boolean;effort?:'easy'|'normal'|'hard'};
export type WorkoutExercise = {id:string;exercise:Exercise;sets:WorkoutSet[]};
export type Workout = {id:string;startedAt:string;finishedAt?:string;importedDurationMinutes?:number;importFingerprint?:string;exercises:WorkoutExercise[]};
export type Data = {library:Exercise[];workouts:Workout[];nutrition?:FoodEntry[];foodProducts?:FoodProduct[];foodTypes?:ProductType[];meals?:Meal[];dailyHabits?:HabitDay[];waterGlasses?:WaterGlass[]};
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
let linkedDiary=false;
export const hasLinkedDiary=()=>linkedDiary;
let cloudVersion:string|null=null;
let cloudSnapshot:string|null=null;
let pendingSave:Promise<void>=Promise.resolve();

export async function getCloud(accept:()=>boolean=()=>true):Promise<Data|null>{
 if(!supabase)return null;
 await pendingSave;
 const {data:{session}}=await supabase.auth.getSession();
 if(!session){const {error}=await supabase.auth.signInAnonymously();if(error)throw error;}
 const {data,error}=await supabase.rpc('read_training_diary').abortSignal(AbortSignal.timeout(15000));
 if(error)throw error;
 if(!accept())return null;
 linkedDiary=data?.linked===true;
 cloudVersion=data?.version??null;
 cloudSnapshot=data?.payload?JSON.stringify(data.payload):null;
 return data?.payload??null;
}
export function saveCloud(payload:Data):Promise<void>{
 if(!supabase)return Promise.resolve();
 const snapshot=JSON.stringify(payload);
 const operation=pendingSave.then(async()=>{
  if(snapshot===cloudSnapshot)return;
  const {data,error}=await supabase!.rpc('save_training_diary',{p_payload:payload,p_version:cloudVersion}).abortSignal(AbortSignal.timeout(15000));
  if(error)throw error;
  cloudVersion=data;cloudSnapshot=snapshot;
 });
 pendingSave=operation.catch(()=>{});
 return operation;
}
export async function createDiaryCode(payload:Data):Promise<string>{
 if(!supabase)throw new Error('Supabase не подключён');
 await saveCloud(payload);
 const {data,error}=await supabase.rpc('create_diary_code').abortSignal(AbortSignal.timeout(15000));if(error)throw error;return data;
}
export async function joinDiary(code:string,payload:Data):Promise<void>{
 if(!supabase)throw new Error('Supabase не подключён');
 await saveCloud(payload);
 localStorage.setItem('ritm-before-link',JSON.stringify(payload));
 const {error}=await supabase.rpc('join_diary',{p_code:code}).abortSignal(AbortSignal.timeout(15000));if(error)throw error;
}







