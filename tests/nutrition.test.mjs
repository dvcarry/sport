import assert from 'node:assert/strict';
import test from 'node:test';
import {foodDay,lastFoodDays,foodCounts,removeFoodPortion} from '../src/nutrition.ts';
test('uses Moscow calendar days, including midnight and year changes',()=>{
 assert.equal(foodDay(new Date('2026-11-11T21:00:00Z')),'2026-11-12');
 assert.deepEqual(lastFoodDays('2026-01-03'),['2026-01-03','2026-01-02','2026-01-01','2025-12-31','2025-12-30','2025-12-29','2025-12-28']);
});
test('counts repeated portions independently for each day and category',()=>{
 const entries=[{id:'1',kind:'meat',day:'2026-11-12'},{id:'2',kind:'meat',day:'2026-11-12'},{id:'3',kind:'water',day:'2026-11-12'},{id:'4',kind:'meat',day:'2026-11-11'}];
 const counts=foodCounts(entries,'2026-11-12');assert.equal(counts.meat,2);assert.equal(counts.water,1);assert.equal(counts.eggs,0);
 const next=removeFoodPortion(entries,'2026-11-12','meat');assert.deepEqual(next.map(e=>e.id),['1','3','4']);assert.equal(entries.length,4);
 assert.equal(removeFoodPortion(entries,'2026-11-12','vitamin'),entries);
});
