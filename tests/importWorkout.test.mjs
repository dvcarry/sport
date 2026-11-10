import assert from 'node:assert/strict';
import test from 'node:test';
import {readFileSync} from 'node:fs';
import {parseWorkout,importWorkout} from '../src/importWorkout.ts';
import {durationMinutes} from '../src/timing.ts';
import {previousSets} from '../src/performance.ts';
const source=readFileSync(new URL('./fixtures/workout.txt',import.meta.url),'utf8');
let serial=0;const id=()=>`test-${++serial}`;
const library=[{id:'bench',name:'Жим штанги лёжа',muscles:['Грудь'],equipment:'Штанга'}];
test('parses the supplied workout, HTML tabs, escaped stars, warmups and difficulty',()=>{
 const parsed=parseWorkout(source);
 assert.equal(parsed.minutes,50);assert.equal(parsed.exercises.length,5);
 assert.equal(parsed.exercises.reduce((sum,e)=>sum+e.sets.length,0),22);
 assert.equal(parsed.exercises[0].sets[0].warmup,true);
 assert.equal(parsed.exercises[0].sets[2].effort,'hard');
 assert.equal(parsed.exercises[1].sets[0].effort,'normal');
 assert.equal(parsed.exercises[3].sets[0].weight,0);
});
test('adds history and only missing exercises without changing the original data',()=>{
 const original={library,workouts:[]};const result=importWorkout(original,parseWorkout(source),id);
 assert.equal(original.library.length,1);assert.equal(original.workouts.length,0);
 assert.equal(result.library.length,5);assert.equal(result.workouts.length,1);
 const w=result.workouts[0];assert.equal(w.exercises[0].exercise.id,'bench');
 assert.equal(w.exercises.every(e=>e.sets.every(s=>s.done)),true);
 assert.equal(durationMinutes(w),50);
 assert.equal(new Set(w.exercises.flatMap(e=>e.sets.map(s=>s.id))).size,22);
 assert.equal(previousSets(result.workouts,'bench','2026-11-10T10:00:00Z').length,6);
 assert.throws(()=>importWorkout(result,parseWorkout(source),id),/уже загружена/);
});
test('validates dates and prevents partial imports on malformed text',()=>{
 for(const bad of [source.replace('9 нояб.','31 нояб.'),source.replace('80кг*8','-80кг*8'),source.replace('тяжел','непонятно'),source.replace('50 мин','0 мин'),'9 нояб. 2026 | 50 мин\n🔹 Жим'])assert.throws(()=>parseWorkout(bad));
});
test('allows decimal weights and merges repeated exercise names',()=>{
 const parsed=parseWorkout('9 нояб. 2026 | 20 мин\n🔹 Новое упражнение\n2,5кг*12, легко\n🔹 Новое упражнение\n5кг*8, норм');
 const result=importWorkout({library:[],workouts:[]},parsed,id);
 assert.equal(result.library.length,1);assert.equal(result.workouts[0].exercises[0].sets[0].weight,2.5);
});
