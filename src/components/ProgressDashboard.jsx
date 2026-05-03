import React, { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  Calendar, 
  TrendingUp, 
  Target, 
  Clock, 
  Activity, 
  BarChart3,
  AlertCircle
} from 'lucide-react';
import { getWorkoutHistory, getExerciseTrends, getTrainingFrequency, getWeeklyVolumeSummary } from '../utils/progressTracker';

const ProgressDashboard = ({ onBackToWorkout }) => {
  const [selectedExercise, setSelectedExercise] = useState('');
  const [timeRange, setTimeRange] = useState('30'); // days

  let history;
  try { history = getWorkoutHistory(); } catch (e) { history = []; }

  let frequency;
  try {
    frequency = getTrainingFrequency();
  } catch (e) {
    frequency = { totalWorkouts: 0, averagePerWeek: 0, workoutsByType: {}, consistency: 0 };
  }

  let volumeData;
  try { volumeData = getWeeklyVolumeSummary('chest', 4); } catch (e) { volumeData = []; }

  // Get unique exercises from history
  const allExercises = Array.from(new Set(
    history.flatMap(workout => 
      workout.exercises ? workout.exercises.map(ex => ex.name) : []
    )
  ));

  // Calculate basic stats
  const totalWorkouts = history.length;
  const totalVolume = history.reduce((acc, workout) => {
    if (!workout.exercises) return acc;
    return acc + workout.exercises.reduce((sum, ex) => {
      const sets = ex.sets || 0;
      // Parse rep range (e.g., "6-8" -> 8, "10-12" -> 12)
      let reps = 0;
      if (typeof ex.reps === 'string') {
        const repMatch = ex.reps.match(/(\d+)-(\d+)/);
        if (repMatch) {
          reps = parseInt(repMatch[2]); // Use the higher end of the range
        } else {
          reps = parseInt(ex.reps) || 0;
        }
      } else {
        reps = ex.reps || 0;
      }
      return sum + (sets * reps);
    }, 0);
  }, 0);

  // Prepare volume chart data
  const volumeChartData = volumeData.map(week => ({
    name: `Week ${week.week}`,
    volume: week.volume,
    workouts: week.workouts
  }));

  // Prepare frequency chart data
  const frequencyChartData = Object.entries(frequency.workoutsByType).map(([type, count]) => ({
    name: type,
    value: count
  }));

  // Get exercise trends if selected
  const exerciseTrendData = selectedExercise 
    ? getExerciseTrends(selectedExercise, parseInt(timeRange))
    : [];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="min-h-screen bg-[url('/background.png')] bg-cover bg-center bg-no-repeat text-black p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={onBackToWorkout}
              className="text-sm px-4 py-2 bg-white/75 hover:bg-white/100 transition-all transform shadow-2xl text-black"
            >
              Back
            </button>
            <div>
              <h1 className="text-3xl font-bold text-black">Progress Dashboard</h1>
              <p className="text-black">Track your fitness journey and performance</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-white/75 hover:bg-white/100 transition-all transform shadow-2xl text-black">
              Sign in
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/75 transition-all shadow-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-black">Total Workouts</p>
                <p className="text-2xl font-bold text-black">{totalWorkouts}</p>
              </div>
              <Calendar size={32} className="text-black" />
            </div>
          </div>

          <div className="bg-white/75 transition-all shadow-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-black">Weekly Average</p>
                <p className="text-2xl font-bold text-black">{frequency.averagePerWeek.toFixed(1)}</p>
              </div>
              <Clock size={32} className="text-black" />
            </div>
          </div>

          <div className="bg-white/75 transition-all shadow-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-black">Total Volume</p>
                <p className="text-2xl font-bold text-black">{totalVolume}</p>
              </div>
              <BarChart3 size={32} className="text-black" />
            </div>
          </div>

          <div className="bg-white/75 transition-all shadow-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-black">Consistency</p>
                <p className="text-2xl font-bold text-black">{Math.round(frequency.consistency * 100)}%</p>
              </div>
              <Activity size={32} className="text-black" />
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Weekly Volume Chart */}
          <div className="bg-white/75 transition-all shadow-2xl p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-black">
              <TrendingUp size={20} className="text-black" />
              Weekly Volume
            </h3>
            {volumeChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={volumeChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="name" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Legend />
                  <Bar dataKey="volume" fill="#000000" name="Volume" />
                  <Bar dataKey="workouts" fill="#737373" name="Workouts" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-8 text-black">
                <AlertCircle size={32} className="mx-auto mb-2 text-black" />
                No volume data available yet. Complete some workouts to see progress.
              </div>
            )}
          </div>

          {/* Workout Frequency Pie Chart */}
          <div className="bg-white/75 transition-all shadow-2xl p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-black">
              <PieChart size={20} className="text-black" />
              Workout Distribution
            </h3>
            {frequencyChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={frequencyChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {frequencyChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-8 text-black">
                <AlertCircle size={32} className="mx-auto mb-2 text-black" />
                No workout data available yet. Complete some workouts to see distribution.
              </div>
            )}
          </div>
        </div>

        {/* Exercise Performance */}
        <div className="bg-white/75 transition-all shadow-2xl p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2 text-black">
              <Target size={20} className="text-black" />
              Exercise Performance
            </h3>
            <div className="flex gap-4 items-center">
              <select
                value={selectedExercise}
                onChange={(e) => setSelectedExercise(e.target.value)}
                className="bg-white/75 hover:bg-white/100 text-black px-3 py-2 border transition-all transform shadow-2xl"
              >
                <option value="">Select an exercise</option>
                {allExercises.map(exercise => (
                  <option key={exercise} value={exercise}>{exercise}</option>
                ))}
              </select>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="bg-white/75 hover:bg-white/100 text-black px-3 py-2 border transition-all transform shadow-2xl"
              >
                <option value="7">Last 7 days</option>
                <option value="14">Last 14 days</option>
                <option value="30">Last 30 days</option>
                <option value="60">Last 60 days</option>
              </select>
            </div>
          </div>
          
          {selectedExercise && exerciseTrendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={exerciseTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Legend />
                <Line type="monotone" dataKey="reps" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6' }} />
                <Line type="monotone" dataKey="volume" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981' }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12 text-black">
              {selectedExercise ? 'No data available for this exercise' : 'Select an exercise to view performance trends'}
            </div>
          )}
        </div>

        {/* Recent Workouts */}
        <div className="bg-white/75 transition-all shadow-2xl p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-black">
              <Calendar size={20} className="text-black" />
              Recent Workouts
            </h3>
          <div className="space-y-3">
            {history.slice(0, 10).map((workout, index) => (
              <div key={workout.id || index} className="bg-white/75 hover:bg-white/100 transition-all transform shadow-2xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">{workout.name}</h4>
                    <p className="text-sm text-black">{workout.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-black">Exercises: {workout.exercises?.length || 0}</p>
                    <p className="text-sm text-black">Volume: {workout.exercises ? workout.exercises.reduce((sum, ex) => {
                      const sets = ex.sets || 0;
                      let reps = 0;
                      if (typeof ex.reps === 'string') {
                        const repMatch = ex.reps.match(/(\d+)-(\d+)/);
                        if (repMatch) {
                          reps = parseInt(repMatch[2]);
                        } else {
                          reps = parseInt(ex.reps) || 0;
                        }
                      } else {
                        reps = ex.reps || 0;
                      }
                      return sum + (sets * reps);
                    }, 0) : 0}</p>
                  </div>
                </div>
              </div>
            ))}
            {history.length === 0 && (
              <div className="text-center py-8 text-black">
                No workouts completed yet. Start your first workout to see progress here!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressDashboard;