export type ProductType={id:string;name:string};
export type FoodProduct={id:string;name:string;typeId:string;protein:number;calories:number};
export type MealItem={productId:string;name:string;typeName:string;protein:number;calories:number;portions:number};
export type Meal={id:string;day:string;addedAt:string;items:MealItem[]};
export function mealTotals(meals:Meal[],day?:string){return meals.filter(m=>!day||m.day===day).reduce((total,meal)=>meal.items.reduce((sum,item)=>({protein:sum.protein+item.protein*item.portions,calories:sum.calories+item.calories*item.portions}),total),{protein:0,calories:0});}
export function snapshotMealItems(products:FoodProduct[],types:ProductType[],selected:Record<string,number>):MealItem[]{return products.filter(p=>(selected[p.id]??0)>0).map(p=>{const portions=selected[p.id];if(!Number.isInteger(portions)||portions<1||portions>100)throw new Error('Проверьте количество порций');return {productId:p.id,name:p.name,typeName:types.find(t=>t.id===p.typeId)?.name??'',protein:p.protein,calories:p.calories,portions};});}
export const foodNumber=(n:number)=>n.toLocaleString('ru-RU',{maximumFractionDigits:1});
