export const foodKinds=['meat','side','vegetables','eggs','cottage','protein','water','creatine','vitamin'] as const;
export type FoodKind=typeof foodKinds[number];
export type FoodEntry={id:string;kind:FoodKind;day:string;addedAt:string};
const formatter=new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Moscow',year:'numeric',month:'2-digit',day:'2-digit'});
export const foodDay=(now:Date=new Date())=>formatter.format(now);
export function lastFoodDays(today:string){return Array.from({length:7},(_,i)=>{const d=new Date(today+'T12:00:00Z');d.setUTCDate(d.getUTCDate()-i);return d.toISOString().slice(0,10);});}
export function foodCounts(entries:FoodEntry[],day:string){return Object.fromEntries(foodKinds.map(kind=>[kind,entries.filter(e=>e.day===day&&e.kind===kind).length])) as Record<FoodKind,number>;}
export function removeFoodPortion(entries:FoodEntry[],day:string,kind:FoodKind){let last=-1;for(let i=entries.length-1;i>=0;i--){if(entries[i].day===day&&entries[i].kind===kind){last=i;break;}}return last<0?entries:entries.filter((_,i)=>i!==last);}

