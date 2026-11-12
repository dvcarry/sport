import type {Meal} from './foodProducts';
import type {FoodEntry} from './nutrition';
export type DailyHabit='fruit'|'vegetable'|'vitamin';
export type HabitDay={day:string;fruit?:boolean;vegetable?:boolean;vitamin?:boolean};
export type WaterGlass={id:string;day:string;addedAt:string};
export function foodHabit(name:string,typeName:string):DailyHabit|'water'|null{
 const text=(name+' '+typeName).toLowerCase().replace(/ё/g,'е');
 if(/витамин/.test(text))return 'vitamin';
 if(/овощ/.test(text))return 'vegetable';
 if(/фрукт|ягод/.test(text))return 'fruit';
 if(/^(вода|стакан воды)$/i.test(name.trim())||/^вода$/i.test(typeName.trim()))return 'water';
 return null;
}
export function dailyWellness(day:string,meals:Meal[]=[],legacy:FoodEntry[]=[],marks:HabitDay[]=[],water:WaterGlass[]=[]){
 const eaten={fruit:false,vegetable:false,vitamin:false};let glasses=water.filter(w=>w.day===day).length;
 for(const meal of meals.filter(m=>m.day===day))for(const item of meal.items){if(item.portions<=0)continue;const kind=foodHabit(item.name,item.typeName);if(kind==='water')glasses+=item.portions;else if(kind)eaten[kind]=true;}
 for(const entry of legacy.filter(e=>e.day===day)){if(entry.kind==='vegetables')eaten.vegetable=true;if(entry.kind==='vitamin')eaten.vitamin=true;if(entry.kind==='water')glasses++;}
 const override=marks.find(m=>m.day===day);
 return {fruit:override?.fruit??eaten.fruit,vegetable:override?.vegetable??eaten.vegetable,vitamin:override?.vitamin??eaten.vitamin,water:glasses};
}
export function markDailyHabit(marks:HabitDay[],day:string,habit:DailyHabit,value:boolean):HabitDay[]{const current=marks.find(m=>m.day===day);return current?marks.map(m=>m.day===day?{...m,[habit]:value}:m):[...marks,{day,[habit]:value}];}
