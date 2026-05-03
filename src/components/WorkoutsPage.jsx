import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfileWorkouts } from '../utils/workoutStorage';
import { validateWorkoutData, handleNormalProgression } from '../utils/workoutUtils';

import { playLyreSound } from '../utils/audioUtils';
import { 
  getActiveSession, 
  startSession,
  clearActiveSession,
  getExerciseCompletion,
  updateRestTimer,
  updateCurrentExercise,
  completeSession,
  isSetCompleted,
  getSetData
} from '../utils/workoutSessionManager';
import { logEnhancedExerciseSet } from '../utils/enhancedProgressTracker';
import { getSessionHistory } from '../utils/workoutSessionManager';
import SmartWorkoutInterface from './SmartWorkoutInterface';

const WorkoutsPage = ({ onBack, initialWorkout }) => {
  const navigate = useNavigate();
  // Load once - prevents re-render from recreating workouts object and resetting session
  const [workouts] = useState(() => getProfileWorkouts());

  // Restore session from localStorage - runs once at init
  const getInitialState = () => {
    const session = getActiveSession();
    if (session && session.workoutKey && !initialWorkout) {
      const restoredSets = {};
      session.exercises.forEach((ex, exIdx) => {
        ex.setsData.forEach((set, setIdx) => {
          if (set.completed) {
            restoredSets[`${session.workoutKey}-${exIdx}-${setIdx + 1}`] = true;
          }
        });
      });
      return {
        workout: session.workoutKey,
        exerciseIndex: session.currentExerciseIndex || 0,
        set: session.currentSet || 1,
        sets: restoredSets
      };
    }
    return null;
  };

  const [selectedWorkout, setSelectedWorkout] = useState(() => {
    if (initialWorkout) return initialWorkout;
    const session = getActiveSession();
    return session?.workoutKey || null;
  });
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(() => {
    if (initialWorkout) return 0;
    return getActiveSession()?.currentExerciseIndex || 0;
  });
  const [currentSet, setCurrentSet] = useState(() => {
    if (initialWorkout) return 1;
    return getActiveSession()?.currentSet || 1;
  });
  const [isResting, setIsResting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [completedSets, setCompletedSets] = useState(() => {
    if (initialWorkout) return {};
    const session = getActiveSession();
    if (!session) return {};
    const restoredSets = {};
    session.exercises.forEach((ex, exIdx) => {
      ex.setsData.forEach((set, setIdx) => {
        if (set.completed) {
          restoredSets[`${session.workoutKey}-${exIdx}-${setIdx + 1}`] = true;
        }
      });
    });
    return restoredSets;
  });

  const isSignedIn = false; // Profile functionality removed for now

  // Weekly completion state - refreshes on mount and after finishing a workout
  const getWeeklyCompletionData = () => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    monday.setHours(0, 0, 0, 0);
    const history = getSessionHistory();
    const completedThisWeek = new Set(
      history
        .filter(s => s.endTime && new Date(s.endTime) >= monday)
        .map(s => s.workoutKey)
    );
    const workoutOrder = ['push1', 'pull1', 'legs1', 'push2', 'pull2', 'legs2'];
    const nextWorkout = workoutOrder.find(k => !completedThisWeek.has(k)) || null;
    return { completedThisWeek, nextWorkout };
  };

  const [weeklyData, setWeeklyData] = useState(getWeeklyCompletionData);

  // Sync state when initialWorkout prop changes (e.g. navigating to a new workout URL)
  useEffect(() => {
    if (initialWorkout && initialWorkout !== selectedWorkout) {
      setSelectedWorkout(initialWorkout);
    }
  }, [initialWorkout, selectedWorkout]);

  const currentWorkout = selectedWorkout ? workouts[selectedWorkout] : null;
  const currentExercise = currentWorkout?.exercises?.[currentExerciseIndex];

  // Start a session when a workout is loaded
  useEffect(() => {
    if (selectedWorkout && currentWorkout) {
      const existing = getActiveSession();
      if (!existing || existing.workoutKey !== selectedWorkout) {
        clearActiveSession();
        startSession(selectedWorkout, currentWorkout);
      }
    }
  }, [selectedWorkout]);

  useEffect(() => {
    let interval;
    if (isTimerRunning && currentExercise) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          // Play sound when rest time reaches 0
          if (prev === 1) {
            playLyreSound();
          }
          // Allow overtime to continue counting indefinitely
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isTimerRunning, currentExercise]);


  const applyNavigationResult = (result) => {
    if (result) {
      setCurrentExerciseIndex(result.newExerciseIndex);
      setCurrentSet(result.newSet);
      setIsResting(result.shouldRest);
      setTimeLeft(result.timeLeft);
      setIsTimerRunning(result.isTimerRunning);
      updateCurrentExercise(result.newExerciseIndex, result.newSet);
      return true;
    }
    return false;
  };

  const completeSetFromRest = () => {
    const setKey = `${selectedWorkout}-${currentExerciseIndex}-${currentSet}`;
    setCompletedSets(prev => ({ ...prev, [setKey]: true }));

    // Use normal progression for all exercises
    const normalResult = handleNormalProgression({
      currentExerciseIndex,
      currentSet,
      totalExercises: currentWorkout.exercises.length,
      exerciseSets: currentExercise.sets,
      restTime: currentExercise.rest,
      fromRest: true
    });

    applyNavigationResult(normalResult);
  };

  const completeSet = ({ weight, reps, rpe } = {}) => {
    const setKey = `${selectedWorkout}-${currentExerciseIndex}-${currentSet}`;
    setCompletedSets(prev => ({ ...prev, [setKey]: true }));

    // Use normal progression for all exercises
    const normalResult = handleNormalProgression({
      currentExerciseIndex,
      currentSet,
      totalExercises: currentWorkout.exercises.length,
      exerciseSets: currentExercise.sets,
      restTime: currentExercise.rest,
      fromRest: false
    });

    applyNavigationResult(normalResult);
  };

  const skipToSet = (exerciseIdx, setNum) => {
    setCurrentExerciseIndex(exerciseIdx);
    setCurrentSet(setNum);
    setIsResting(false);
    setTimeLeft(0);
    setIsTimerRunning(false);
    updateCurrentExercise(exerciseIdx, setNum);
  };

  const skipToExercise = (index) => {
    setCurrentExerciseIndex(index);
    setCurrentSet(1);
    setIsResting(false);
    setTimeLeft(0);
    setIsTimerRunning(false);
  };

  const selectWorkout = (workoutKey) => {
    try {
      validateWorkoutData(workouts[workoutKey]);
      // Reset state for new workout
      setCurrentExerciseIndex(0);
      setCurrentSet(1);
      setCompletedSets({});
      setIsResting(false);
      setTimeLeft(0);
      setIsTimerRunning(false);
      clearActiveSession();
      navigate(`/workouts/${workoutKey}`);
    } catch (error) {
      console.error('Invalid workout data:', error.message);
    }
  };


  const finishWorkout = () => {
    completeSession();
    setSelectedWorkout(null);
    setCurrentExerciseIndex(0);
    setCurrentSet(1);
    setCompletedSets({});
    setIsResting(false);
    setTimeLeft(0);
    setIsTimerRunning(false);
    setWeeklyData(getWeeklyCompletionData());
    navigate('/workouts');
  };

  const backToMenu = () => {
    setSelectedWorkout(null);
    setCurrentExerciseIndex(0);
    setCurrentSet(1);
    setIsResting(false);
    setTimeLeft(0);
    setIsTimerRunning(false);
  };

  const isSetCompleted = (exerciseIdx, setNum) => {
    return completedSets[`${selectedWorkout}-${exerciseIdx}-${setNum}`];
  };

  if (!selectedWorkout) {
    return (
      <div className="min-h-screen bg-[url('/background.png')] bg-cover bg-center bg-no-repeat text-black p-4 flex items-center justify-center">
        <div className="max-w-4xl w-full">
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={onBack}
              className="text-sm px-4 py-2 bg-white/90 hover:bg-white/100 transition-all transform shadow-2xl text-black border border-gray-300"
              aria-label="Back"
            >
              Back
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-white/90 hover:bg-white/100 transition-all transform shadow-2xl text-black border border-gray-300">
            {isSignedIn ? 'Profile' : 'Sign in'}
          </button>
          </div>
          <div className="text-center mb-12">
            <br></br>
            <h1 className="text-5xl font-bold mb-3 text-black">Select a workout</h1>
            <br></br>
          </div>

          {(() => {
            const { completedThisWeek, nextWorkout } = weeklyData;
            return (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
                {Object.entries(workouts).map(([workoutKey, workout]) => {
                  const isDone = completedThisWeek.has(workoutKey);
                  const isNext = workoutKey === nextWorkout;
                  return (
                    <button
                      key={workoutKey}
                      onClick={() => selectWorkout(workoutKey)}
                      className={`transition-all transform shadow-2xl p-8 cursor-pointer flex flex-col w-full text-left border relative
                        ${isDone ? 'bg-gray-300/80 border-gray-400 opacity-60' : isNext ? 'bg-green-50/95 border-green-500 border-2' : 'bg-white/90 hover:bg-white/100 border-gray-300'}`}
                      aria-label={`Select ${workout.name}`}
                    >
                      {isDone && (
                        <span className="absolute top-2 right-2 text-xs bg-gray-500 text-white px-2 py-1 rounded">Done this week</span>
                      )}
                      {isNext && !isDone && (
                        <span className="absolute top-2 right-2 text-xs bg-green-600 text-white px-2 py-1 rounded">Up Next</span>
                      )}
                      <div className="text-left flex-1">
                        <h2 className={`text-3xl font-bold mb-2 ${isDone ? 'text-gray-500' : 'text-black'}`}>{workout.name}</h2>
                        <p className={`text-sm mb-4 ${isDone ? 'text-gray-500' : 'text-black'}`}>{workout.description}</p>
                        <div className={`space-y-1 text-sm ${isDone ? 'text-gray-400' : 'text-black'}`}>
                          {workout.exercises?.map((exercise, index) => (
                            <p key={index}>- {exercise.name}</p>
                          ))}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            );
          })()}
        </div>
      </div>
    );
  }

  if (!currentWorkout) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <p className="text-center text-black">Workout not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="flex items-center mb-4">
        <button
          onClick={backToMenu}
          className="text-sm px-4 py-2 bg-white/90 hover:bg-white/100 transition-all transform shadow-2xl text-black border border-gray-300"
        >
          Back
        </button>
      </div>
      <h1 className="text-3xl font-bold text-center mb-2 text-black">{currentWorkout.name}</h1>
      <p className="text-center text-black mb-8">{currentWorkout.description}</p>

      {currentWorkout.exercises ? (
        <SmartWorkoutInterface
          exercises={currentWorkout.exercises}
          currentExerciseIndex={currentExerciseIndex}
          currentSet={currentSet}
          isResting={isResting}
          timeLeft={timeLeft}
          isTimerRunning={isTimerRunning}
          onSkipToExercise={skipToExercise}
          onSkipToSet={skipToSet}
          onCompleteSet={completeSet}
          onCompleteSetFromRest={completeSetFromRest}
          onAutoAdvance={() => {
            // Auto-advance logic using the existing progression system
            const normalResult = handleNormalProgression({
              currentExerciseIndex,
              currentSet,
              totalExercises: currentWorkout.exercises.length,
              exerciseSets: currentExercise?.sets,
              restTime: currentExercise?.rest,
              fromRest: false
            });
            applyNavigationResult(normalResult);
          }}
          autoAdvanceEnabled={true}
          completedSets={completedSets}
          workoutKey={selectedWorkout || ""}
          onFinishWorkout={finishWorkout}
          getSetData={getSetData}
        />
      ) : (
        <div className="text-center text-black py-8">No exercises available for this workout.</div>
      )}
    </div>
  );
};

export default WorkoutsPage;