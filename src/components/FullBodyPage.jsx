import React from 'react';
import { useNavigate } from 'react-router-dom';
import { workouts } from '../data/workouts';

const FullBodyPage = ({ onBack }) => {
  const navigate = useNavigate();

  const selectWorkout = (workoutKey) => {
    navigate(`/workouts/${workoutKey}`);
  };

  const fullBodyWorkouts = ['workoutCatchupA', 'workoutCatchupB', 'workoutCatchupC'];

  return (
    <div className="min-h-screen bg-[url('/background.png')] bg-cover bg-center bg-no-repeat text-black p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={onBack}
            className="text-sm px-4 py-2 bg-white/90 hover:bg-white/100 transition-all transform shadow-2xl text-black border border-gray-300"
            aria-label="Back"
          >
            Back
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white/90 hover:bg-white/100 transition-all transform shadow-2xl text-black border border-gray-300">
            Sign in
          </button>
        </div>

        <h1 className="text-5xl font-bold text-center mb-3 text-black">Full Body Workouts</h1>
        <p className="text-center text-black mb-8">Complete body stimulation in a single session</p>

        <div className="grid gap-6">
          {fullBodyWorkouts.map((workoutKey) => {
            const workout = workouts[workoutKey];
            return (
              <button
                key={workoutKey}
                onClick={() => selectWorkout(workoutKey)}
                className="bg-white/90 hover:bg-white/100 transition-all transform shadow-2xl p-6 text-left border border-gray-300 w-full"
              >
                <div className="grid lg:grid-cols-4 gap-4 items-center">
                  <div className="lg:col-span-1">
                    <h2 className="text-2xl font-bold text-black">{workout.name}</h2>
                    <span className="inline-block mt-2 px-3 py-1 bg-gray-200 text-black text-sm font-medium rounded-full">
                      Full Body
                    </span>
                  </div>
                  
                  <div className="lg:col-span-2">
                    <p className="text-black mb-4">{workout.description}</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-gray-600">
                      <div>
                        <span className="font-semibold">Exercises:</span>
                        <span className="ml-1">{workout.exercises.length}</span>
                      </div>
                      <div>
                        <span className="font-semibold">Focus:</span>
                        <span className="ml-1">All Muscle Groups</span>
                      </div>
                      <div>
                        <span className="font-semibold">Duration:</span>
                        <span className="ml-1">45-60 min</span>
                      </div>
                      <div>
                        <span className="font-semibold">Intensity:</span>
                        <span className="ml-1">High</span>
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-1">
                    <div className="text-right">
                      <p className="text-sm text-gray-600 mb-2">Key Exercises:</p>
                      <div className="space-y-1 text-xs text-gray-600">
                        {workout.exercises.slice(0, 3).map((exercise, index) => (
                          <div key={index} className="flex justify-between">
                            <span>- {exercise.name}</span>
                            <span>{exercise.sets}x{exercise.reps}</span>
                          </div>
                        ))}
                        {workout.exercises.length > 3 && (
                          <div className="text-center text-gray-500">...and {workout.exercises.length - 3} more</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-8 text-center">
          <div className="bg-white/90 p-6 border border-gray-300">
            <h3 className="text-xl font-bold text-black mb-4">Full Body Training Benefits</h3>
            <div className="grid md:grid-cols-3 gap-4 text-black text-sm">
              <div>
                <h4 className="font-semibold mb-2">Frequency</h4>
                <p>Train each muscle group 2-3 times per week for optimal growth</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Efficiency</h4>
                <p>Complete workouts in 45-60 minutes with compound movements</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Flexibility</h4>
                <p>Adaptable to different schedules and fitness levels</p>
              </div>
            </div>
            <p className="mt-4 text-gray-600 text-sm">
              Perfect for beginners, those with limited time, or anyone looking to mix up their training routine
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FullBodyPage;