import {useEffect,useRef,useState} from 'react';
import {Check,Trash2,X} from 'lucide-react';
import type {WorkoutSet} from './data';

export default function SetEditor({exerciseName,set,onSave,onDelete,onClose}:{exerciseName:string;set:WorkoutSet;onSave:(set:WorkoutSet)=>void;onDelete?:()=>void;onClose:()=>void}) {
 const ref=useRef<HTMLDialogElement>(null);
 const [weight,setWeight]=useState(String(set.weight));
 const [reps,setReps]=useState(String(set.reps));
 const [effort,setEffort]=useState<NonNullable<WorkoutSet['effort']>>(set.effort??'normal');
 const [done,setDone]=useState(true);
 useEffect(()=>{const dialog=ref.current!;dialog.showModal();const original=document.body.style.overflow;document.body.style.overflow='hidden';return()=>{document.body.style.overflow=original;dialog.close();};},[]);
 return <dialog ref={ref} className="set-editor" aria-labelledby="set-editor-title" onCancel={e=>{e.preventDefault();onClose();}} onClick={e=>{if(e.target===e.currentTarget){const r=e.currentTarget.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)onClose();}}}>
  <div className="section-head"><div><h2 id="set-editor-title">{onDelete?'Подход':'Новый подход'}</h2><p>{exerciseName}</p></div><button type="button" className="icon-btn" aria-label="Закрыть" onClick={onClose}><X/></button></div>
  <form onSubmit={e=>{e.preventDefault();onSave({...set,weight:Number(weight),reps:Number(reps),effort,done});}}>
   <div className="set-editor-fields"><label>Вес, кг<input autoFocus required type="number" inputMode="decimal" min="0" max="2000" step="0.5" value={weight} onChange={e=>setWeight(e.target.value)} onFocus={e=>e.target.select()}/></label><label>Повторения<input required type="number" inputMode="numeric" min="1" max="1000" step="1" value={reps} onChange={e=>setReps(e.target.value)} onFocus={e=>e.target.select()}/></label></div>
   <fieldset className="effort-field"><legend>Как было?</legend><div className="effort-options">{([{id:'easy',label:'Легко'},{id:'normal',label:'Норм'},{id:'hard',label:'Сложно'}] as const).map(option=><label key={option.id} className={`effort-option ${option.id} ${effort===option.id?'selected':''}`}><input type="radio" name="effort" value={option.id} checked={effort===option.id} onChange={()=>setEffort(option.id)}/><span>{option.label}</span></label>)}</div></fieldset>
   <label className="set-completed"><input type="checkbox" checked={done} onChange={e=>setDone(e.target.checked)}/>Подход выполнен</label>
   <button type="submit" className="primary full"><Check size={18}/>{onDelete?'Сохранить':'Добавить подход'}</button>
   {onDelete&&<button type="button" className="delete-set" onClick={onDelete}><Trash2 size={16}/>Удалить подход</button>}
  </form>
 </dialog>;
}
