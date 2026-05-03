import React from 'react';
import { workouts } from './data/workouts';
import WorkoutProgress from './components/WorkoutProgress';

const TestComponent = () => {
  const workout = workouts.workoutC;
  
  console.log('Workout C exercises:', workout.exercises);
  
  return (
    <div>
      <h1>Workout C Exercises</h1>
      <WorkoutProgress
        exercises={workout.exercises}
        currentExerciseIndex={0}
        completedSets={{}}
        skipToExercise={() => {}}
        skipToSet={() => {}}
        isSetCompleted={() => false}
      />
    </div>
  );
};

export default TestComponent;