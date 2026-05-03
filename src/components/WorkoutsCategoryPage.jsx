import React from 'react';
import { useNavigate } from 'react-router-dom';

const WorkoutsCategoryPage = ({ onBack }) => {
  const navigate = useNavigate();

  const selectWorkoutCategory = (category) => {
    navigate(`/workouts/${category}`);
  };

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

        <h1 className="text-5xl font-bold text-center mb-3 text-black">Workout Categories</h1>
        <p className="text-center text-black mb-8">Choose your training style and split</p>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Push Pull Legs Split */}
          <button
            onClick={() => selectWorkoutCategory('push-pull-legs')}
            className="bg-white/90 hover:bg-white/100 transition-all transform shadow-2xl p-8 text-left border border-gray-300 h-full"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-3xl font-bold text-black mb-2">Push Pull Legs Split</h2>
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                  3-Day Split
                </span>
              </div>
              <div className="text-right">
                <span className="text-4xl font-bold text-gray-300">6</span>
                <p className="text-sm text-gray-600">Workouts</p>
              </div>
            </div>
            
            <p className="text-black mb-6">
              Traditional bodybuilding split that targets different muscle groups on separate days. 
              Perfect for focused muscle development and progressive overload.
            </p>

            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="bg-gray-100 p-3 rounded text-center">
                <div className="font-bold text-black">Push</div>
                <div className="text-sm text-gray-600">Chest/Shoulders/Triceps</div>
              </div>
              <div className="bg-gray-100 p-3 rounded text-center">
                <div className="font-bold text-black">Pull</div>
                <div className="text-sm text-gray-600">Back/Biceps/Rear Delts</div>
              </div>
              <div className="bg-gray-100 p-3 rounded text-center">
                <div className="font-bold text-black">Legs</div>
                <div className="text-sm text-gray-600">Quads/Hamstrings/Glutes</div>
              </div>
            </div>

            <div className="text-sm text-gray-600">
              <p>✓ Heavy and Volume variations for each muscle group</p>
              <p>✓ Progressive overload programming</p>
              <p>✓ Optimal muscle recovery and growth</p>
            </div>
          </button>

          {/* Full Body Workouts */}
          <button
            onClick={() => selectWorkoutCategory('full-body')}
            className="bg-white/90 hover:bg-white/100 transition-all transform shadow-2xl p-8 text-left border border-gray-300 h-full"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-3xl font-bold text-black mb-2">Full Body Workouts</h2>
                <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                  Complete Body
                </span>
              </div>
              <div className="text-right">
                <span className="text-4xl font-bold text-gray-300">3</span>
                <p className="text-sm text-gray-600">Workouts</p>
              </div>
            </div>
            
            <p className="text-black mb-6">
              Complete body stimulation in single sessions. Ideal for beginners, 
              those with limited time, or anyone looking to mix up their training routine.
            </p>

            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="bg-gray-100 p-3 rounded text-center">
                <div className="font-bold text-black">Stimulation</div>
                <div className="text-sm text-gray-600">All Muscle Groups</div>
              </div>
              <div className="bg-gray-100 p-3 rounded text-center">
                <div className="font-bold text-black">Metabolic</div>
                <div className="text-sm text-gray-600">High Intensity</div>
              </div>
              <div className="bg-gray-100 p-3 rounded text-center">
                <div className="font-bold text-black">Compound</div>
                <div className="text-sm text-gray-600">Multi-Joint Focus</div>
              </div>
            </div>

            <div className="text-sm text-gray-600">
              <p>✓ Train each muscle group 2-3 times per week</p>
              <p>✓ Complete workouts in 45-60 minutes</p>
              <p>✓ Adaptable to different fitness levels</p>
            </div>
          </button>

          {/* Upper / Lower Split */}
          <button
            onClick={() => selectWorkoutCategory('upper-lower')}
            className="bg-white/90 hover:bg-white/100 transition-all transform shadow-2xl p-8 text-left border border-gray-300 h-full"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-3xl font-bold text-black mb-2">Upper / Lower Split</h2>
                <span className="inline-block px-3 py-1 bg-purple-100 text-purple-800 text-sm font-medium rounded-full">
                  2-Day Split
                </span>
              </div>
              <div className="text-right">
                <span className="text-4xl font-bold text-gray-300">2</span>
                <p className="text-sm text-gray-600">Workouts</p>
              </div>
            </div>

            <p className="text-black mb-6">
              Classic upper/lower split targeting all muscle groups across two focused days.
              Ideal for 4-day training weeks with balanced volume and recovery.
            </p>

            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="bg-gray-100 p-3 rounded text-center">
                <div className="font-bold text-black">Upper</div>
                <div className="text-sm text-gray-600">Chest/Back/Shoulders/Arms</div>
              </div>
              <div className="bg-gray-100 p-3 rounded text-center">
                <div className="font-bold text-black">Lower</div>
                <div className="text-sm text-gray-600">Quads/Hams/Glutes/Calves</div>
              </div>
            </div>

            <div className="text-sm text-gray-600">
              <p>✓ Heavy compound lifts with accessory work</p>
              <p>✓ Train each muscle group twice per week</p>
              <p>✓ Great balance of volume and recovery</p>
            </div>
          </button>
        </div>

        <div className="mt-8 text-center">
          <div className="bg-white/90 p-6 border border-gray-300">
            <h3 className="text-xl font-bold text-black mb-4">How to Choose</h3>
            <div className="grid md:grid-cols-3 gap-4 text-black text-sm">
              <div>
                <h4 className="font-semibold mb-2">Choose Push Pull Legs If:</h4>
                <ul className="text-gray-600 space-y-1 text-left">
                  <li>• You prefer focused muscle group training</li>
                  <li>• You can train 4-6 days per week</li>
                  <li>• You want to maximize muscle growth potential</li>
                  <li>• You enjoy tracking progressive overload</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Choose Full Body If:</h4>
                <ul className="text-gray-600 space-y-1 text-left">
                  <li>• You have limited training time</li>
                  <li>• You prefer variety in your workouts</li>
                  <li>• You want to train 2-4 days per week</li>
                  <li>• You're a beginner or returning from break</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Choose Upper / Lower If:</h4>
                <ul className="text-gray-600 space-y-1 text-left">
                  <li>• You want to train 4 days per week</li>
                  <li>• You prefer hitting each muscle twice weekly</li>
                  <li>• You want a balance of strength and volume</li>
                  <li>• You like structured, simple scheduling</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkoutsCategoryPage;