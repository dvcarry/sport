import {useEffect,useState} from 'react';
import {Apple,Carrot,Pill,Check,GlassWater,Plus} from 'lucide-react';
import {foodDay} from './nutrition';
import {dailyWellness} from './dailyWellness';
import type {DailyHabit} from './dailyWellness';
import type {Data} from './data';
function useToday(){const [day,setDay]=useState(foodDay);useEffect(()=>{const refresh=()=>setDay(foodDay());const interval=setInterval(refresh,30000);window.addEventListener('focus',refresh);return()=>{clearInterval(interval);window.removeEventListener('focus',refresh);};},[]);return day;}
function useWellness(data:Data){const today=useToday();return dailyWellness(today,data.meals,data.nutrition,data.dailyHabits,data.waterGlasses);}
export function DailyHabitsCard({data,onToggle}:{data:Data;onToggle:(habit:DailyHabit,value:boolean)=>void}){
 const status=useWellness(data);
 const habits=[{id:'fruit',name:'Фрукт',icon:Apple},{id:'vegetable',name:'Овощи',icon:Carrot},{id:'vitamin',name:'Витамины',icon:Pill}] as const;
 return <section className="panel daily-habits-card" aria-label="Питание сегодня"><div className="daily-habits-title"><h3>Сегодня</h3><span>Фрукт, овощи и витамины</span></div><div className="daily-habits">{habits.map(habit=><button key={habit.id} className={'daily-habit '+(status[habit.id]?'is-done':'')} aria-pressed={status[habit.id]} aria-label={`${habit.name}: ${status[habit.id]?'отмечено':'ещё нет'}`} title={status[habit.id]?'Нажмите, чтобы снять отметку':'Нажмите, чтобы отметить за сегодня'} onClick={()=>onToggle(habit.id,!status[habit.id])}><span className="daily-habit-icon"><habit.icon size={25}/>{status[habit.id]&&<span className="daily-habit-check"><Check size={11}/></span>}</span><span>{habit.name}</span></button>)}</div></section>;
}
export function WaterCard({data,onAdd}:{data:Data;onAdd:()=>void}){
 const status=useWellness(data);
 return <section className="stat water-stat"><div className="stat-top"><span>Вода сегодня</span><span className="stat-icon"><GlassWater size={20}/></span></div><div className="water-stat-value"><div className="stat-value" aria-live="polite" aria-label={`Выпито стаканов воды: ${status.water}`}>{status.water}<small>стак.</small></div><button className="water-add" title="Добавить стакан воды" aria-label="Добавить стакан воды" onClick={onAdd}><Plus size={20}/></button></div><p>По одному стакану</p></section>;
}
