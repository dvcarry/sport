import type {Workout,WorkoutSet} from './data';

function previousExercise(workouts: Workout[], exerciseId: string, before: string) {
  const previous = workouts
    .filter(w => w.finishedAt && w.startedAt < before && w.exercises.some(e => e.exercise.id === exerciseId && e.sets.some(s => s.done)))
    .sort((a, b) => b.startedAt.localeCompare(a.startedAt))[0];
  if (!previous) return null;
  return {
    date: previous.startedAt,
    sets: previous.exercises.filter(e => e.exercise.id === exerciseId)
      .flatMap(e => e.sets).filter(s => s.done),
  };
}

export function setPerformance(sets: WorkoutSet[]) {
  const completed = sets.filter(s => s.done);
  if (!completed.length) return null;
  const weight = Math.max(...completed.map(s => s.weight));
  const heaviest = completed.filter(s => s.weight === weight);
  return {weight, bestReps: Math.max(...heaviest.map(s => s.reps)), totalReps: heaviest.reduce((total, s) => total + s.reps, 0)};
}

export function previousPerformance(workouts: Workout[], exerciseId: string, before: string) {
  const previous = previousExercise(workouts, exerciseId, before);
  if (!previous) return null;
  return {date: previous.date, ...setPerformance(previous.sets)!};
}
export function previousSets(workouts: Workout[], exerciseId: string, before: string) {
  return previousExercise(workouts, exerciseId, before)?.sets
    .map(set => ({weight: set.weight, reps: set.reps, ...(set.warmup ? {warmup: true} : {})})) ?? [];
}



export function achievementMedals(current: ReturnType<typeof setPerformance>, previous: ReturnType<typeof setPerformance>) {
  return {
    weight: !!current && !!previous && current.weight > previous.weight,
    bestReps: !!current && !!previous && current.weight === previous.weight && current.bestReps > previous.bestReps,
    totalReps: !!current && !!previous && current.weight === previous.weight && current.totalReps > previous.totalReps,
  };
}
