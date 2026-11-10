import assert from 'node:assert/strict';
import test from 'node:test';
import {previousSets, previousPerformance} from '../src/performance.ts';

const workout = (date, sets, finished = true) => ({
  startedAt: date,
  ...(finished ? {finishedAt: date} : {}),
  exercises: [{exercise: {id: 'bench'}, sets}],
});
const performed = [
  {id: 'one', weight: 60, reps: 10, done: true},
  {id: 'two', weight: 65, reps: 8, done: true},
  {id: 'three', weight: 65, reps: 6, done: true},
];

test('summary and autofill skip a newer workout with only an unperformed placeholder', () => {
  const workouts = [
    workout('2026-11-07', performed),
    workout('2026-11-08', [{weight: 0, reps: 10, done: false}]),
    workout('2026-11-09', [{weight: 100, reps: 1, done: true}], false),
  ];
  assert.deepEqual(previousSets(workouts, 'bench', '2026-11-09'), [
    {weight: 60, reps: 10}, {weight: 65, reps: 8}, {weight: 65, reps: 6},
  ]);
  assert.deepEqual(previousPerformance(workouts, 'bench', '2026-11-09'), {
    date: '2026-11-07', weight: 65, bestReps: 8, totalReps: 14,
  });
});

test('copies only performed sets and does not mutate previous records', () => {
  const workouts = [workout('2026-11-07', [...performed, {weight: 0, reps: 10, done: false}])];
  const result = previousSets(workouts, 'bench', '2026-11-09');
  assert.equal(result.length, 3);
  result[0].weight = 90;
  assert.equal(performed[0].weight, 60);
  assert.equal('done' in result[0], false);
  assert.equal('id' in result[0], false);
});

test('new exercises have no template', () => {
  assert.deepEqual(previousSets([], 'bench', '2026-11-09'), []);
  assert.deepEqual(previousSets([workout('2026-11-07', performed)], 'squat', '2026-11-09'), []);
});

test('current metrics ignore planned sets and recalculate after changes', async () => {
  const {setPerformance}=await import('../src/performance.ts');
  const sets=[{weight:60,reps:12,done:true},{weight:80,reps:8,done:true},{weight:80,reps:6,done:true},{weight:100,reps:1,done:false}];
  assert.deepEqual(setPerformance(sets),{weight:80,bestReps:8,totalReps:14});
  assert.deepEqual(setPerformance(sets.slice(0,2)),{weight:80,bestReps:8,totalReps:8});
  assert.equal(setPerformance([{weight:80,reps:8,done:false}]),null);
  assert.deepEqual(setPerformance([{weight:0,reps:20,done:true}]),{weight:0,bestReps:20,totalReps:20});
});

test('medals require a higher weight or more repetitions at exactly the same weight',async()=>{
 const {achievementMedals}=await import('../src/performance.ts');
 const previous={weight:60,bestReps:8,totalReps:24};
 assert.deepEqual(achievementMedals({weight:50,bestReps:10,totalReps:40},previous),{weight:false,bestReps:false,totalReps:false});
 assert.deepEqual(achievementMedals({weight:60,bestReps:10,totalReps:30},previous),{weight:false,bestReps:true,totalReps:true});
 assert.deepEqual(achievementMedals({weight:65,bestReps:10,totalReps:30},previous),{weight:true,bestReps:false,totalReps:false});
 assert.deepEqual(achievementMedals(previous,previous),{weight:false,bestReps:false,totalReps:false});
 assert.deepEqual(achievementMedals(null,previous),{weight:false,bestReps:false,totalReps:false});
 assert.deepEqual(achievementMedals(previous,null),{weight:false,bestReps:false,totalReps:false});
});
