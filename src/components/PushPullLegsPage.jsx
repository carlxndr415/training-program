import React from 'react';
import { useNavigate } from 'react-router-dom';
import { workouts } from '../data/workouts';

const PushPullLegsPage = ({ onBack }) => {
  const navigate = useNavigate();

  const selectWorkout = (workoutKey) => {
    navigate(`/workouts/${workoutKey}`);
  };

  const pushWorkouts = ['push1', 'push2'];
  const pullWorkouts = ['pull1', 'pull2'];
  const legWorkouts = ['legs1', 'legs2'];

  return (
    <div className="min-h-screen bg-[url('/background.png')] bg-cover bg-center bg-no-repeat text-black p-4">
      <div className="max-w-6xl mx-auto">
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

        <h1 className="text-5xl font-bold text-center mb-3 text-black">Push Pull Legs Split</h1>
        <p className="text-center text-black mb-8">Choose your training day and focus</p>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Push Days */}
          <div className="bg-white/90 hover:bg-white/100 transition-all transform shadow-2xl p-6 border border-gray-300">
            <h2 className="text-3xl font-bold mb-4 text-black text-center">Push Days</h2>
            <p className="text-center text-black mb-6">Chest, Shoulders, Triceps</p>
            <div className="space-y-4">
              {pushWorkouts.map((workoutKey) => {
                const workout = workouts[workoutKey];
                return (
                  <button
                    key={workoutKey}
                    onClick={() => selectWorkout(workoutKey)}
                    className="w-full text-left p-4 bg-gray-100 hover:bg-gray-200 transition-colors border border-gray-300"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold text-black">{workout.name}</h3>
                      <span className="text-sm text-gray-600">Push</span>
                    </div>
                    <p className="text-sm text-black mb-3">{workout.description}</p>
                    <div className="text-xs text-gray-600 space-y-1">
                      {workout.exercises.slice(0, 4).map((exercise, index) => (
                        <div key={index} className="flex justify-between">
                          <span>- {exercise.name}</span>
                          <span>{exercise.sets}x{exercise.reps}</span>
                        </div>
                      ))}
                      {workout.exercises.length > 4 && (
                        <div className="text-center text-gray-500">...and {workout.exercises.length - 4} more</div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Pull Days */}
          <div className="bg-white/90 hover:bg-white/100 transition-all transform shadow-2xl p-6 border border-gray-300">
            <h2 className="text-3xl font-bold mb-4 text-black text-center">Pull Days</h2>
            <p className="text-center text-black mb-6">Back, Biceps, Rear Delts</p>
            <div className="space-y-4">
              {pullWorkouts.map((workoutKey) => {
                const workout = workouts[workoutKey];
                return (
                  <button
                    key={workoutKey}
                    onClick={() => selectWorkout(workoutKey)}
                    className="w-full text-left p-4 bg-gray-100 hover:bg-gray-200 transition-colors border border-gray-300"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold text-black">{workout.name}</h3>
                      <span className="text-sm text-gray-600">Pull</span>
                    </div>
                    <p className="text-sm text-black mb-3">{workout.description}</p>
                    <div className="text-xs text-gray-600 space-y-1">
                      {workout.exercises.slice(0, 4).map((exercise, index) => (
                        <div key={index} className="flex justify-between">
                          <span>- {exercise.name}</span>
                          <span>{exercise.sets}x{exercise.reps}</span>
                        </div>
                      ))}
                      {workout.exercises.length > 4 && (
                        <div className="text-center text-gray-500">...and {workout.exercises.length - 4} more</div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Leg Days */}
          <div className="bg-white/90 hover:bg-white/100 transition-all transform shadow-2xl p-6 border border-gray-300">
            <h2 className="text-3xl font-bold mb-4 text-black text-center">Leg Days</h2>
            <p className="text-center text-black mb-6">Quads, Hamstrings, Glutes</p>
            <div className="space-y-4">
              {legWorkouts.map((workoutKey) => {
                const workout = workouts[workoutKey];
                return (
                  <button
                    key={workoutKey}
                    onClick={() => selectWorkout(workoutKey)}
                    className="w-full text-left p-4 bg-gray-100 hover:bg-gray-200 transition-colors border border-gray-300"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold text-black">{workout.name}</h3>
                      <span className="text-sm text-gray-600">Legs</span>
                    </div>
                    <p className="text-sm text-black mb-3">{workout.description}</p>
                    <div className="text-xs text-gray-600 space-y-1">
                      {workout.exercises.slice(0, 4).map((exercise, index) => (
                        <div key={index} className="flex justify-between">
                          <span>- {exercise.name}</span>
                          <span>{exercise.sets}x{exercise.reps}</span>
                        </div>
                      ))}
                      {workout.exercises.length > 4 && (
                        <div className="text-center text-gray-500">...and {workout.exercises.length - 4} more</div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-black text-sm">
            Follow a traditional Push Pull Legs split: Push Day → Pull Day → Rest → Legs Day → Rest → Repeat
          </p>
        </div>
      </div>
    </div>
  );
};

export default PushPullLegsPage;