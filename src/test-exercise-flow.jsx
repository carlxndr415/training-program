import React, { useState } from 'react';
import { workouts } from './data/workouts';
import WorkoutProgress from './components/WorkoutProgress';

const TestExerciseFlow = () => {
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [completedSets, setCompletedSets] = useState({});
  
  const workout = workouts.workoutD;

  const isSetCompleted = (exerciseIdx, setNum) => {
    return completedSets[`test-${exerciseIdx}-${setNum}`];
  };

  const completeSet = () => {
    const key = `test-${currentExerciseIndex}-${Object.keys(completedSets)
      .filter(k => k.startsWith(`test-${currentExerciseIndex}-`))
      .length + 1}`;
    setCompletedSets(prev => ({ ...prev, [key]: true }));
  };

  const goToNextExercise = () => {
    if (currentExerciseIndex < workout.exercises.length - 1) {
      setCurrentExerciseIndex(prev => prev + 1);
    }
  };

  const skipToExercise = (index) => {
    setCurrentExerciseIndex(index);
  };

  const skipToSet = (setNum) => {
    console.log('Skip to set:', setNum);
  };

  return (
    <div>
      <h1>Workout C Flow Test</h1>
      
      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ccc' }}>
        <h2>Current Exercise: {workout.exercises[currentExerciseIndex].name}</h2>
        <p>Group: {workout.exercises[currentExerciseIndex].group}</p>
        <p>Current Index: {currentExerciseIndex}</p>
        
        <div style={{ marginTop: '10px' }}>
          <button 
            onClick={completeSet} 
            style={{ marginRight: '10px', padding: '8px 16px', cursor: 'pointer' }}
          >
            Complete Set
          </button>
          <button 
            onClick={goToNextExercise} 
            style={{ padding: '8px 16px', cursor: 'pointer' }}
          >
            Next Exercise
          </button>
        </div>
      </div>

      <WorkoutProgress
        exercises={workout.exercises}
        currentExerciseIndex={currentExerciseIndex}
        completedSets={completedSets}
        skipToExercise={skipToExercise}
        skipToSet={skipToSet}
        isSetCompleted={isSetCompleted}
      />
    </div>
  );
};

export default TestExerciseFlow;