import test from 'node:test';
import assert from 'node:assert/strict';
import {dailyWellness,markDailyHabit} from '../src/dailyWellness.ts';
const day='2026-11-12';
const meal=(day,items)=>({id:day,day,addedAt:day,items:items.map(([name,typeName,portions])=>({productId:name,name,typeName,portions,protein:0,calories:0}))});
test('daily food markers are boolean regardless of portions and reset on a new day',()=>{
 const meals=[meal(day,[['Яблоко','Фрукты',3],['Салат','Овощи',2],['Витамин D','Добавки',1]])];
 assert.deepEqual(dailyWellness(day,meals),{fruit:true,vegetable:true,vitamin:true,water:0});
 assert.deepEqual(dailyWellness('2026-11-13',meals),{fruit:false,vegetable:false,vitamin:false,water:0});
});
test('water glasses combine the quick counter with food records for today only',()=>{
 const meals=[meal(day,[['Вода','Вода',2]]),meal('2026-11-11',[['Вода','Вода',5]])];
 const legacy=[{id:'old',kind:'water',day,addedAt:day}];
 const water=[{id:'one',day,addedAt:day},{id:'two',day,addedAt:day},{id:'previous',day:'2026-11-11',addedAt:''}];
 assert.equal(dailyWellness(day,meals,legacy,[],water).water,5);
});
test('manual habit corrections preserve other days and other markers',()=>{
 const original=[{day:'2026-11-11',fruit:true},{day,vegetable:true}];
 const marked=markDailyHabit(original,day,'fruit',true);
 assert.equal(marked.length,2);assert.equal(marked[1].vegetable,true);assert.equal(original[1].fruit,undefined);
 const corrected=markDailyHabit(marked,day,'fruit',false);
 assert.equal(dailyWellness(day,[],[],corrected).fruit,false);
 assert.equal(dailyWellness(day,[],[],corrected).vegetable,true);
});
