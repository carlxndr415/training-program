import React from 'react';
import { Check } from 'lucide-react';
import { formatTime } from '../utils/workoutUtils';

const WorkoutProgress = ({
  exercises,
  currentExerciseIndex,
  skipToExercise,
  skipToSet,
  isSetCompleted,
  isResting,
  timeLeft,
  currentSet,
  completeSet,
  completeSetFromRest
}) => {

  return (
    <div className="space-y-2">
      {exercises.map((exercise, idx) => {
        const isCurrent = idx === currentExerciseIndex;
        
        return (
          <div
            key={idx}
            onClick={() => skipToExercise(idx)}
            className={`p-4 cursor-pointer transition-all border-2 ${
              isCurrent
                ? 'bg-white shadow-3xl border-yellow-500'
                : 'bg-white/90 hover:bg-white/100 transform shadow-2xl border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-black">{exercise.group}</span>
                  <span className="font-semibold text-black">{exercise.name}</span>
                </div>
                <p className="text-sm text-black">
                  {exercise.sets} x {exercise.reps} | {exercise.rest}s rest
                </p>
              </div>
              <div className="flex gap-2">
                {[...Array(exercise.sets)].map((_, i) => (
                  <button
                    key={i}
                    onClick={(e) => {
                      e.stopPropagation();
                      skipToExercise(idx);
                      skipToSet(i + 1);
                    }}
                    className={`px-2 py-1 text-xs cursor-pointer transition-all transform shadow-2xl border ${
                      isSetCompleted(idx, i + 1)
                        ? 'bg-green-600 hover:bg-green-500 text-black border-gray-400'
                        : 'bg-white/90 hover:bg-white/100 text-black border-gray-300'
                    }`}
                    title={`Go to Set ${i + 1}`}
                    aria-label={`Go to set ${i + 1} of ${exercise.name}`}
                  >
                    Set {i + 1}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Show current exercise details and controls */}
            {isCurrent && (
              <div className="mt-4 pt-4 border-t border-gray-300">
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-lg text-black">Set {currentSet} of {exercise.sets}</span>
                </div>
                
                {isResting ? (
                  <div className="text-center mb-4">
                    <div className="text-4xl font-bold mb-2 text-black">
                      {formatTime(timeLeft)}
                    </div>
                    <p className="text-black">{timeLeft < 0 ? 'Overtime!' : 'Rest Time'}</p>

                    <div className="mt-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          completeSetFromRest();
                        }}
                        className="w-full bg-white/90 hover:bg-white/100 py-2 font-semibold flex items-center justify-center gap-2 transition-all transform shadow-2xl text-black border border-gray-300"
                        aria-label={`Complete set ${currentSet} during rest`}
                      >
                        <Check size={20} />
                        Completed Set {currentSet}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        completeSet();
                      }}
                      className="w-full bg-white/90 hover:bg-white/100 py-2 font-semibold flex items-center justify-center gap-2 transition-all transform shadow-2xl text-black border border-gray-300"
                      aria-label={`Complete set ${currentSet}`}
                    >
                      <Check size={20} />
                      Completed Set {currentSet}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default WorkoutProgress;
