import React from 'react';

const LandingPage = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-[url('/background.png')] bg-cover bg-center bg-no-repeat text-black p-4 flex items-center justify-center">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-3 text-black">Training Program</h1>
          <p className="text-xl text-black">v 0.1.0</p>
        </div>

        <div className="grid md:grid-cols-4 gap-6 items-stretch">
          <button
            onClick={() => onNavigate('/workouts')}
            className="bg-white/90 hover:bg-white/100 transition-all transform shadow-2xl p-8 cursor-pointer flex flex-col items-center border border-gray-300"
            aria-label="Go to workouts"
          >
            <h2 className="text-2xl font-bold mb-2 text-black">Workouts</h2>
            <p className="text-sm text-black">Choose from Push Pull Legs or Full Body training splits</p>
          </button>

          <button
            onClick={() => onNavigate('/tracking')}
            className="bg-white/90 hover:bg-white/100 transition-all transform shadow-2xl p-8 cursor-pointer flex flex-col items-center border border-gray-300"
            aria-label="Go to tracking"
          >
            <h2 className="text-2xl font-bold mb-2 text-black">Tracking</h2>
            <p className="text-sm text-black">Track your daily metrics including sleep, weight, steps, and nutrition</p>
          </button>

          <button
            onClick={() => onNavigate('/dashboard')}
            className="bg-white/90 hover:bg-white/100 transition-all transform shadow-2xl p-8 cursor-pointer flex flex-col items-center border border-gray-300"
            aria-label="Go to progress dashboard"
          >
            <h2 className="text-2xl font-bold mb-2 text-black">Progress Dashboard</h2>
            <p className="text-sm text-black">Visualize your progress with detailed charts and statistics</p>
          </button>

          <button
            onClick={() => onNavigate('/nutrition')}
            className="bg-white/90 hover:bg-white/100 transition-all transform shadow-2xl p-8 cursor-pointer flex flex-col items-center border border-gray-300"
            aria-label="Go to nutrition"
          >
            <h2 className="text-2xl font-bold mb-2 text-black">Nutrition</h2>
            <p className="text-sm text-black">Log your meals and track your daily nutrition intake</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
