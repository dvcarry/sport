import type {Workout} from './data';

// Old sets have no timestamp; never infer their duration from opening/closing the diary.
export function durationMinutes(workout: Workout): number {
  if (workout.importedDurationMinutes !== undefined) return workout.importedDurationMinutes;
  const times = workout.exercises.flatMap(exercise => exercise.sets)
    .flatMap(set => set.addedAt ? [Date.parse(set.addedAt)] : [])
    .filter(Number.isFinite);
  if (times.length < 2) return 0;
  return (Math.max(...times) - Math.min(...times)) / 60000;
}

