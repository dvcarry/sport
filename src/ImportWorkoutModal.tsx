import {useEffect,useMemo,useRef,useState} from 'react';
import {Upload,X} from 'lucide-react';
import {findExercise,parseWorkout} from './importWorkout';
import type {ParsedWorkout} from './importWorkout';
import type {Data} from './data';
export default function ImportWorkoutModal({data,onImport,onClose}:{data:Data;onImport:(parsed:ParsedWorkout)=>void;onClose:()=>void}){
 const ref=useRef<HTMLDialogElement>(null);const [text,setText]=useState('');const [preview,setPreview]=useState(false);
 const result=useMemo(()=>{try{return {parsed:parseWorkout(text),error:''};}catch(e){return {parsed:null,error:(e as Error).message};}},[text]);
 useEffect(()=>{const dialog=ref.current!;dialog.showModal();const original=document.body.style.overflow;document.body.style.overflow='hidden';return()=>{document.body.style.overflow=original;dialog.close();};},[]);
 const duplicate=result.parsed&&data.workouts.some(w=>w.importFingerprint===result.parsed!.fingerprint);
 return <dialog ref={ref} className="import-dialog" aria-labelledby="import-title" onCancel={e=>{e.preventDefault();onClose();}} onClick={e=>{if(e.target===e.currentTarget){const r=e.currentTarget.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)onClose();}}}>
  <div className="section-head"><div><h2 id="import-title">Загрузить тренировку</h2><p>Вставьте запись из старого дневника</p></div><button className="icon-btn" aria-label="Закрыть загрузку" onClick={onClose}><X/></button></div>
  {!preview?<><label className="import-label" htmlFor="import-text">Текст тренировки</label><textarea id="import-text" autoFocus value={text} onChange={e=>setText(e.target.value)} placeholder={'9 нояб. 2026 | 50 мин\n\n🔹 Жим лежа · штанга\n20кг*20, размин\n80кг*8, тяжел\n80кг*7, норм'}/><p className="import-hint">«размин» — разминка · «норм» — обычный · «тяжел» — сложный</p>{text&&result.error&&<p className="import-error" role="alert">{result.error}</p>}<button className="primary full" disabled={!result.parsed} onClick={()=>setPreview(true)}>Посмотреть перед загрузкой</button></>:result.parsed&&<>
  <div className="import-summary"><strong>{new Date(result.parsed.startedAt).toLocaleDateString('ru-RU',{day:'numeric',month:'long',year:'numeric'})}</strong><span>{result.parsed.minutes} мин · {result.parsed.exercises.length} упражнений · {result.parsed.exercises.reduce((n,e)=>n+e.sets.length,0)} подходов</span></div>
  <div className="import-preview">{result.parsed.exercises.map((e,i)=>{const existing=findExercise(data.library,e);return <div className="import-exercise" key={i}><div><h3>{existing?.name??e.name}</h3><span className={'import-badge '+(existing?'':'is-new')}>{existing?'В библиотеке':'Новое упражнение'}</span></div><div className="import-set-list">{e.sets.map((s,j)=><span key={j} className={s.effort==='hard'?'reps-hard':''}>{s.weight} кг × {s.reps}{s.warmup&&<small> разм.</small>}</span>)}</div></div>})}</div>
  <p className="import-hint">Новые упражнения добавятся в библиотеку. Группы мышц можно указать позже.</p>{duplicate&&<p className="import-error" role="alert">Эта тренировка уже загружена.</p>}<div className="import-actions"><button className="secondary" onClick={()=>setPreview(false)}>Изменить текст</button><button className="primary" disabled={!!duplicate} onClick={()=>onImport(result.parsed!)}><Upload size={17}/>Загрузить тренировку</button></div>
  </>}
 </dialog>;
}
