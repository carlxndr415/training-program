import React from 'react';
import { useNavigate } from 'react-router-dom';
import { workouts } from '../data/workouts';

const UpperLowerPage = ({ onBack }) => {
  const navigate = useNavigate();

  const selectWorkout = (workoutKey) => {
    navigate(`/workouts/${workoutKey}`);
  };

  const upperWorkouts = ['upper1'];
  const lowerWorkouts = ['lower1'];

  return (
    <div className="min-h-screen bg-[url('/background.png')] bg-cover bg-center bg-no-repeat text-black p-4">
      <div className="max-w-5xl mx-auto">
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

        <h1 className="text-5xl font-bold text-center mb-3 text-black">Upper / Lower Split</h1>
        <p className="text-center text-black mb-8">Choose your training day — upper or lower body focus</p>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Upper Body */}
          <div className="bg-white/90 hover:bg-white/100 transition-all transform shadow-2xl p-6 border border-gray-300">
            <h2 className="text-3xl font-bold mb-2 text-black text-center">Upper Body</h2>
            <p className="text-center text-black mb-6">Chest · Back · Shoulders · Arms</p>
            <div className="space-y-4">
              {upperWorkouts.map((workoutKey) => {
                const workout = workouts[workoutKey];
                return (
                  <button
                    key={workoutKey}
                    onClick={() => selectWorkout(workoutKey)}
                    className="w-full text-left p-4 bg-gray-100 hover:bg-gray-200 transition-colors border border-gray-300"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold text-black">{workout.name}</h3>
                      <span className="text-sm text-gray-600">Upper</span>
                    </div>
                    <p className="text-sm text-black mb-3">{workout.description}</p>
                    <div className="text-xs text-gray-600 space-y-1">
                      {workout.exercises.slice(0, 5).map((exercise, index) => (
                        <div key={index} className="flex justify-between">
                          <span>- {exercise.name}</span>
                          <span>{exercise.sets}×{exercise.reps}</span>
                        </div>
                      ))}
                      {workout.exercises.length > 5 && (
                        <div className="text-center text-gray-500">...and {workout.exercises.length - 5} more</div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-6 grid grid-cols-2 gap-2 text-xs text-center">
              <div className="bg-blue-50 p-2 border border-blue-200">
                <div className="font-semibold text-blue-800">Compound</div>
                <div className="text-blue-600">Bench Press · Row</div>
              </div>
              <div className="bg-blue-50 p-2 border border-blue-200">
                <div className="font-semibold text-blue-800">Accessory</div>
                <div className="text-blue-600">Delts · Biceps · Triceps</div>
              </div>
            </div>
          </div>

          {/* Lower Body */}
          <div className="bg-white/90 hover:bg-white/100 transition-all transform shadow-2xl p-6 border border-gray-300">
            <h2 className="text-3xl font-bold mb-2 text-black text-center">Lower Body</h2>
            <p className="text-center text-black mb-6">Quads · Hamstrings · Glutes · Calves</p>
            <div className="space-y-4">
              {lowerWorkouts.map((workoutKey) => {
                const workout = workouts[workoutKey];
                return (
                  <button
                    key={workoutKey}
                    onClick={() => selectWorkout(workoutKey)}
                    className="w-full text-left p-4 bg-gray-100 hover:bg-gray-200 transition-colors border border-gray-300"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold text-black">{workout.name}</h3>
                      <span className="text-sm text-gray-600">Lower</span>
                    </div>
                    <p className="text-sm text-black mb-3">{workout.description}</p>
                    <div className="text-xs text-gray-600 space-y-1">
                      {workout.exercises.slice(0, 5).map((exercise, index) => (
                        <div key={index} className="flex justify-between">
                          <span>- {exercise.name}</span>
                          <span>{exercise.sets}×{exercise.reps}</span>
                        </div>
                      ))}
                      {workout.exercises.length > 5 && (
                        <div className="text-center text-gray-500">...and {workout.exercises.length - 5} more</div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-6 grid grid-cols-2 gap-2 text-xs text-center">
              <div className="bg-green-50 p-2 border border-green-200">
                <div className="font-semibold text-green-800">Compound</div>
                <div className="text-green-600">Squat · RDL</div>
              </div>
              <div className="bg-green-50 p-2 border border-green-200">
                <div className="font-semibold text-green-800">Accessory</div>
                <div className="text-green-600">Leg Ext/Curl · Calves · Core</div>
              </div>
            </div>
          </div>
        </div>

        {/* Reference Table */}
        <div className="mt-8 bg-white/90 border border-gray-300 shadow-2xl p-6">
          <h3 className="text-xl font-bold text-black mb-4 text-center">Sample Upper/Lower Workout Reference</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-bold text-black mb-2 border-b border-gray-300 pb-1">Upper Body</h4>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-600">
                    <th className="pb-1">Exercise</th>
                    <th className="pb-1 text-right">Sets×Reps / Rest</th>
                  </tr>
                </thead>
                <tbody className="text-black space-y-1">
                  <tr><td>Bench Press</td><td className="text-right text-gray-600">4×6-8 / 3'</td></tr>
                  <tr><td>Row</td><td className="text-right text-gray-600">4×6-8 / 3'</td></tr>
                  <tr><td>Flye / Incline Bench</td><td className="text-right text-gray-600">2-3×10-12 / 1.5'</td></tr>
                  <tr><td>Cable Pullover / Pulldown</td><td className="text-right text-gray-600">2-3×10-12 / 1.5'</td></tr>
                  <tr><td>Lateral Raise</td><td className="text-right text-gray-600">4×8-10 / 2'</td></tr>
                  <tr><td>Rear Delt</td><td className="text-right text-gray-600">4×8-10 / 2'</td></tr>
                  <tr><td>Biceps</td><td className="text-right text-gray-600">2-3×10-12 / 1.5'</td></tr>
                  <tr><td>Triceps</td><td className="text-right text-gray-600">2-3×10-12 / 1.5'</td></tr>
                </tbody>
              </table>
            </div>
            <div>
              <h4 className="font-bold text-black mb-2 border-b border-gray-300 pb-1">Lower Body</h4>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-600">
                    <th className="pb-1">Exercise</th>
                    <th className="pb-1 text-right">Sets×Reps / Rest</th>
                  </tr>
                </thead>
                <tbody className="text-black space-y-1">
                  <tr><td>Squat</td><td className="text-right text-gray-600">4×6-8 / 3'</td></tr>
                  <tr><td>RDL</td><td className="text-right text-gray-600">4×6-8 / 3'</td></tr>
                  <tr><td>Leg Ext / Split Squat</td><td className="text-right text-gray-600">2-3×10-12 / 1.5'</td></tr>
                  <tr><td>Leg Curl</td><td className="text-right text-gray-600">2-3×10-12 / 1.5'</td></tr>
                  <tr><td>Calf Raise</td><td className="text-right text-gray-600">4×8-10 / 2'</td></tr>
                  <tr><td>Seated Calf</td><td className="text-right text-gray-600">4×8-10 / 2'</td></tr>
                  <tr><td>Abs</td><td className="text-right text-gray-600">Whatever</td></tr>
                  <tr><td>Low Back</td><td className="text-right text-gray-600">Whatever</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-black text-sm">
            Follow an Upper/Lower split: Upper Day → Lower Day → Rest → Repeat (4-day/week ideal)
          </p>
        </div>
      </div>
    </div>
  );
};

export default UpperLowerPage;
