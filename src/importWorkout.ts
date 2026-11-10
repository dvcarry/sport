import type {Data,Exercise,Workout,WorkoutSet} from './data';
type ParsedExercise={name:string;equipment:string;sets:Omit<WorkoutSet,'id'|'addedAt'>[]};
export type ParsedWorkout={startedAt:string;minutes:number;exercises:ParsedExercise[];fingerprint:string};
const months=['янв','фев','мар','апр','май','июн','июл','авг','сен','окт','ноя','дек'];
export function exerciseKey(name:string){return name.toLowerCase().replace(/ё/g,'е').replace(/штанги/g,'штанга').replace(/гантелей/g,'гантели').replace(/[^а-яa-z0-9]+/g,' ').trim().split(/\s+/).sort().join(' ');}
function equipment(name:string){if(/штанг/i.test(name))return 'Штанга';if(/гантел/i.test(name))return 'Гантели';if(/блок|тренаж/i.test(name))return 'Тренажёр';if(/скручив|отжиман|планк/i.test(name))return 'Свой вес';return 'Другое';}
export function parseWorkout(source:string):ParsedWorkout{
 const lines=source.replace(/&#(?:x0*9|0*9);/gi,' ').replace(/&nbsp;|&#160;/gi,' ').replace(/\\\*/g,'*').split(/\r?\n/).map(s=>s.trim()).filter(Boolean);
 if(!lines.length)throw new Error('Вставьте текст тренировки.');
 const header=lines[0].match(/^(\d{1,2})\s+([а-яё]+)\.?\s+(\d{4})(?:\s*г\.?)?\s*\|\s*(\d+)\s*мин\.?$/i);
 if(!header)throw new Error('Первая строка должна быть в формате «9 нояб. 2026 | 50 мин».');
 const day=Number(header[1]),year=Number(header[3]),month=months.findIndex(m=>header[2].toLowerCase().startsWith(m)),minutes=Number(header[4]);
 const check=new Date(Date.UTC(year,month,day));
 if(month<0||year<1900||year>2100||check.getUTCFullYear()!==year||check.getUTCMonth()!==month||check.getUTCDate()!==day)throw new Error('Проверьте дату тренировки.');
 if(minutes<1||minutes>1440)throw new Error('Длительность должна быть от 1 до 1440 минут.');
 const exercises:ParsedExercise[]=[];
 for(let i=1;i<lines.length;i++){
  const line=lines[i];
  if(/^[🔹🔸•]/u.test(line)){
   const name=line.replace(/^[🔹🔸•]\s*/u,'').trim();
   if(!name)throw new Error(`Строка ${i+1}: нет названия упражнения.`);
   exercises.push({name,equipment:equipment(name),sets:[]});continue;
  }
  const match=line.match(/^(\d+(?:[.,]\d+)?)\s*кг\s*[*×xх]\s*(\d+)\s*(?:,\s*(.+))?$/i);
  if(!match||!exercises.length)throw new Error(`Не удалось прочитать: «${line}». Ожидается упражнение с 🔹 или подход «40кг*12, норм».`);
  const weight=Number(match[1].replace(',','.')),reps=Number(match[2]),label=match[3]?.trim().toLowerCase();
  if(weight>2000||reps<1||reps>1000)throw new Error(`Проверьте вес и повторения: «${line}».`);
  const warmup=label? /^размин/.test(label):false;
  const effort=label&&/^тяж|^слож/.test(label)?'hard':label&&/^лег|^лёг/.test(label)?'easy':label&&/^норм/.test(label)?'normal':undefined;
  if(label&&!warmup&&!effort)throw new Error(`Неизвестная оценка «${label}». Используйте «размин», «легко», «норм» или «тяжел».`);
  exercises.at(-1)!.sets.push({weight,reps,done:true,...(effort?{effort}:{}),...(warmup?{warmup:true}:{})});
 }
 if(!exercises.length)throw new Error('Добавьте хотя бы одно упражнение с 🔹.');
 const empty=exercises.find(e=>!e.sets.length);if(empty)throw new Error(`У упражнения «${empty.name}» нет подходов.`);
 const startedAt=`${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}T00:00:00+03:00`;
 return {startedAt,minutes,exercises,fingerprint:JSON.stringify([startedAt,minutes,exercises.map(e=>[exerciseKey(e.name),e.sets])])};
}
export function findExercise(library:Exercise[],exercise:ParsedExercise){return library.find(e=>exerciseKey(e.name)===exerciseKey(exercise.name))??library.find(e=>exerciseKey(`${e.name} ${e.equipment}`)===exerciseKey(exercise.name));}
export function importWorkout(data:Data,parsed:ParsedWorkout,createId:()=>string):Data{
 if(data.workouts.some(w=>w.importFingerprint===parsed.fingerprint))throw new Error('Эта тренировка уже загружена.');
 const library=[...data.library];
 const exercises=parsed.exercises.map(e=>{let entry=findExercise(library,e);if(!entry){entry={id:createId(),name:e.name,muscles:[],equipment:e.equipment};library.push(entry);}return {id:createId(),exercise:{...entry},sets:e.sets.map(s=>({...s,id:createId()}))};});
 const workout:Workout={id:createId(),startedAt:parsed.startedAt,finishedAt:new Date(Date.parse(parsed.startedAt)+parsed.minutes*60000).toISOString(),importedDurationMinutes:parsed.minutes,importFingerprint:parsed.fingerprint,exercises};
 return {...data,library,workouts:[...data.workouts,workout]};
}
