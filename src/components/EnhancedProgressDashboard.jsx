import React, { useState, useEffect } from 'react';
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
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { 
  Calendar, 
  TrendingUp, 
  Target, 
  Clock, 
  Activity, 
  BarChart3,
  AlertCircle,
  Users,
  Zap,
  Heart,
  Award,
  RefreshCw,
  Download,
  Share2,
  Smartphone,
  Wifi,
  WifiOff,
  Trophy,
  Star,
  Shield,
  Brain,
  TrendingDown,
  TrendingUp as TrendingUpIcon,
  Volume2,
  VolumeX,
  Settings,
  Moon,
  Sun,
  Eye,
  EyeOff,
  Plus,
  Minus,
  Filter,
  Search
} from 'lucide-react';
import { getSessionHistory, getSessionStats, getExerciseCompletion } from '../utils/workoutSessionManager';
import { getExerciseHistory, getExerciseTrends, getMuscleGroupVolumeSummary, getAllProgressionSuggestions } from '../utils/enhancedProgressTracker';
import { getExerciseProgressionAnalysis, getWeeklyProgressionSummary } from '../utils/progressionEngine';
import { autoSaveManager } from '../utils/offlineStorage';
import { gamificationSystem } from '../utils/gamificationSystem';
import { predictiveAnalytics } from '../utils/predictiveAnalytics';
import { RESPONSIVE_CONFIG } from '../utils/responsiveUtils';

const EnhancedProgressDashboard = ({ onBackToWorkout }) => {
  const [selectedExercise, setSelectedExercise] = useState('');
  const [timeRange, setTimeRange] = useState('30'); // days
  const [muscleGroup, setMuscleGroup] = useState('chest');
  const [viewMode, setViewMode] = useState('overview'); // overview, exercises, progression, insights

  // Safely load all dashboard data
  let history = [], stats = {}, progressionSummary = {}, allExercises = [],
      advancedStats = {}, exerciseTrendData = null, muscleGroupVolumeData = [],
      progressionSuggestions = [];

  try { history = getSessionHistory() || []; } catch(e) { history = []; }
  try { stats = getSessionStats() || {}; } catch(e) { stats = {}; }
  try { progressionSummary = getWeeklyProgressionSummary(4) || {}; } catch(e) { progressionSummary = {}; }

  try {
    allExercises = Array.from(new Set(
      history.flatMap(session =>
        session.exercises ? session.exercises.map(ex => ex.name) : []
      )
    ));
  } catch(e) { allExercises = []; }

  try {
    advancedStats = {
      totalVolume: history.reduce((acc, session) => acc + (session.totalVolume || 0), 0),
      averageSessionRPE: history.length > 0
        ? history.reduce((acc, session) => acc + (session.averageRPE || 0), 0) / history.length
        : 0,
      consistencyScore: calculateConsistencyScore(history),
      volumeTrend: calculateVolumeTrend(history),
      strengthTrend: calculateStrengthTrend(history)
    };
  } catch(e) {
    advancedStats = { totalVolume: 0, averageSessionRPE: 0, consistencyScore: 0, volumeTrend: 'stable', strengthTrend: 'stable' };
  }

  try {
    exerciseTrendData = selectedExercise
      ? getExerciseTrends(selectedExercise, parseInt(timeRange))
      : null;
  } catch(e) { exerciseTrendData = null; }

  try { muscleGroupVolumeData = getMuscleGroupVolumeSummary(muscleGroup, 4) || []; } catch(e) { muscleGroupVolumeData = []; }
  try { progressionSuggestions = getAllProgressionSuggestions() || []; } catch(e) { progressionSuggestions = []; }

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  const formatVolume = (value) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toString();
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up': return <TrendingUp size={16} className="text-green-600" />;
      case 'down': return <TrendingUp size={16} className="text-red-600 rotate-180" />;
      case 'stable': return <RefreshCw size={16} className="text-blue-600" />;
      default: return <TrendingUp size={16} className="text-gray-600" />;
    }
  };

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      case 'stable': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-black">Enhanced Progress Dashboard</h1>
          <p className="text-black">Advanced analytics and personalized insights</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white/75 hover:bg-white/100 transition-all transform shadow-2xl text-black">
            <Share2 size={20} />
            Share
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white/75 hover:bg-white/100 transition-all transform shadow-2xl text-black">
            <Download size={20} />
            Export
          </button>
        </div>
      </div>

      {/* View Mode Tabs */}
      <div className="flex gap-4 mb-6 overflow-x-auto">
        {[
          { key: 'overview', label: 'Overview', icon: Activity },
          { key: 'exercises', label: 'Exercises', icon: BarChart3 },
          { key: 'progression', label: 'Progression', icon: TrendingUp },
          { key: 'insights', label: 'Insights', icon: Target }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setViewMode(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all transform shadow-2xl border ${
              viewMode === tab.key
                ? 'bg-blue-500 hover:bg-blue-600 text-white border-blue-600'
                : 'bg-white/90 hover:bg-white/100 text-black border-gray-300'
            }`}
          >
            <tab.icon size={20} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview View */}
      {viewMode === 'overview' && (
        <>
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white/90 transition-all shadow-2xl p-6 border border-gray-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-black">Total Workouts</p>
              <p className="text-2xl font-bold text-black">{history.length}</p>
              <div className="flex items-center gap-2 mt-2">
                {getTrendIcon(advancedStats.volumeTrend)}
                <span className={`text-sm ${getTrendColor(advancedStats.volumeTrend)}`}>
                  Volume trend: {advancedStats.volumeTrend}
                </span>
              </div>
            </div>
            <BarChart3 size={32} className="text-black" />
          </div>
        </div>

            <div className="bg-white/90 transition-all shadow-2xl p-6 border border-gray-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-black">Consistency Score</p>
                  <p className="text-2xl font-bold text-black">{advancedStats.consistencyScore}%</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full"
                      style={{ width: `${advancedStats.consistencyScore}%` }}
                    ></div>
                  </div>
                </div>
                <Users size={32} className="text-black" />
              </div>
            </div>

            <div className="bg-white/90 transition-all shadow-2xl p-6 border border-gray-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-black">Average RPE</p>
                  <p className="text-2xl font-bold text-black">{advancedStats.averageSessionRPE.toFixed(1)}</p>
                  <div className="flex items-center gap-2 mt-2">
                    {getTrendIcon(advancedStats.strengthTrend)}
                    <span className={`text-sm ${getTrendColor(advancedStats.strengthTrend)}`}>
                      Strength trend: {advancedStats.strengthTrend}
                    </span>
                  </div>
                </div>
                <Heart size={32} className="text-black" />
              </div>
            </div>

            <div className="bg-white/90 transition-all shadow-2xl p-6 border border-gray-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-black">Progressing Exercises</p>
                  <p className="text-2xl font-bold text-black">{progressionSummary.progressing}</p>
                  <p className="text-xs text-black">out of {progressionSummary.totalExercises}</p>
                </div>
                <Zap size={32} className="text-black" />
              </div>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Volume Trend Chart */}
            <div className="bg-white/90 transition-all shadow-2xl p-6 border border-gray-300">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-black">
                <TrendingUp size={20} className="text-black" />
                Volume Progression
              </h3>
              {history.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={getVolumeChartData(history)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="date" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" tickFormatter={formatVolume} />
                    <Legend />
                    <Area type="monotone" dataKey="volume" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-8 text-black">
                  <AlertCircle size={32} className="mx-auto mb-2 text-black" />
                  No volume data available yet. Complete some workouts to see progress.
                </div>
              )}
            </div>

            {/* Workout Distribution */}
            <div className="bg-white/90 transition-all shadow-2xl p-6 border border-gray-300">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-black">
                <PieChart size={20} className="text-black" />
                Workout Distribution
              </h3>
              {progressionSummary.totalExercises > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Progressing', value: progressionSummary.progressing, color: '#10b981' },
                        { name: 'Stalled', value: progressionSummary.stalled, color: '#f59e0b' },
                        { name: 'Regressing', value: progressionSummary.regressing, color: '#ef4444' },
                        { name: 'No Data', value: progressionSummary.noData, color: '#94a3b8' }
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {[
                        { name: 'Progressing', value: progressionSummary.progressing, color: '#10b981' },
                        { name: 'Stalled', value: progressionSummary.stalled, color: '#f59e0b' },
                        { name: 'Regressing', value: progressionSummary.regressing, color: '#ef4444' },
                        { name: 'No Data', value: progressionSummary.noData, color: '#94a3b8' }
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
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

          {/* Recent Workouts */}
          <div className="bg-white/90 transition-all shadow-2xl p-6 border border-gray-300">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-black">
              <Calendar size={20} className="text-black" />
              Recent Workouts
            </h3>
            <div className="space-y-3">
              {history.slice(0, 8).map((session, index) => (
                <div key={session.id || index} className="bg-white/75 hover:bg-white/100 transition-all transform shadow-2xl p-4 border border-gray-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">{session.workoutKey}</h4>
                      <p className="text-sm text-black">{session.startTime}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-black">Volume: {formatVolume(session.totalVolume || 0)}</p>
                      <p className="text-sm text-black">RPE: {(session.averageRPE || 0).toFixed(1)}</p>
                      <p className="text-sm text-black">Exercises: {session.exercises?.length || 0}</p>
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
        </>
      )}

      {/* Exercises View */}
      {viewMode === 'exercises' && (
        <div className="space-y-6">
          {/* Exercise Selection */}
          <div className="bg-white/90 transition-all shadow-2xl p-4 border border-gray-300">
            <div className="flex flex-wrap gap-4 items-center">
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

          {/* Exercise Performance Chart */}
          {selectedExercise && exerciseTrendData && exerciseTrendData.hasData ? (
            <div className="bg-white/90 transition-all shadow-2xl p-6 border border-gray-300">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-black">
                <BarChart3 size={20} className="text-black" />
                {selectedExercise} Performance
              </h3>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={exerciseTrendData.data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="date" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Legend />
                  <Line type="monotone" dataKey="weight" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6' }} />
                  <Line type="monotone" dataKey="volume" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981' }} />
                  <Line type="monotone" dataKey="rpe" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b' }} />
                </LineChart>
              </ResponsiveContainer>
              
              {/* Performance Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-gray-50 p-4 rounded-md">
                  <h4 className="font-semibold text-black mb-2">Weight Progression</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-black">{exerciseTrendData.trends.weight.current}lbs</span>
                    <span className={`text-sm ${getTrendColor(exerciseTrendData.trends.weight.trend)}`}>
                      {getTrendIcon(exerciseTrendData.trends.weight.trend)}
                      {exerciseTrendData.trends.weight.change > 0 ? '+' : ''}{exerciseTrendData.trends.weight.change}lbs
                    </span>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-md">
                  <h4 className="font-semibold text-black mb-2">Volume Progression</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-black">{formatVolume(exerciseTrendData.trends.volume.current)}</span>
                    <span className={`text-sm ${getTrendColor(exerciseTrendData.trends.volume.trend)}`}>
                      {getTrendIcon(exerciseTrendData.trends.volume.trend)}
                      {exerciseTrendData.trends.volume.change > 0 ? '+' : ''}{formatVolume(exerciseTrendData.trends.volume.change)}
                    </span>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-md">
                  <h4 className="font-semibold text-black mb-2">RPE Average</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-black">{exerciseTrendData.trends.rpe.average.toFixed(1)}</span>
                    <span className={`text-sm ${getTrendColor(exerciseTrendData.trends.rpe.trend)}`}>
                      {getTrendIcon(exerciseTrendData.trends.rpe.trend)}
                      {exerciseTrendData.trends.rpe.change > 0 ? '+' : ''}{exerciseTrendData.trends.rpe.change.toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white/90 transition-all shadow-2xl p-12 border border-gray-300 text-center">
              {selectedExercise ? (
                <div>
                  <AlertCircle size={48} className="mx-auto mb-4 text-black" />
                  <p className="text-black">No data available for {selectedExercise} in the selected time range.</p>
                </div>
              ) : (
                <div>
                  <BarChart3 size={48} className="mx-auto mb-4 text-black" />
                  <p className="text-black">Select an exercise to view performance trends and analytics.</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Progression View */}
      {viewMode === 'progression' && (
        <div className="space-y-6">
          {/* Progression Suggestions */}
          <div className="bg-white/90 transition-all shadow-2xl p-6 border border-gray-300">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-black">
              <Zap size={20} className="text-black" />
              Progression Suggestions
            </h3>
            <div className="space-y-4">
              {progressionSuggestions.length > 0 ? (
                progressionSuggestions.map((suggestion, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-md border border-gray-300">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-black">{suggestion.exerciseName}</h4>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        suggestion.suggestion.type === 'weight' ? 'bg-green-100 text-green-800' :
                        suggestion.suggestion.type === 'reps' ? 'bg-blue-100 text-blue-800' :
                        suggestion.suggestion.type === 'deload' ? 'bg-orange-100 text-orange-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {suggestion.suggestion.type.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-black">{suggestion.suggestion.reason}</p>
                    {suggestion.lastWorkout && (
                      <div className="mt-2 text-sm text-black">
                        Last workout: {suggestion.lastWorkout.date} • {suggestion.lastWorkout.weight}lbs • {suggestion.lastWorkout.reps} reps • RPE {suggestion.lastWorkout.rpe}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-black">
                  <AlertCircle size={32} className="mx-auto mb-2 text-black" />
                  Complete some workouts to receive personalized progression suggestions.
                </div>
              )}
            </div>
          </div>

          {/* Muscle Group Volume */}
          <div className="bg-white/90 transition-all shadow-2xl p-6 border border-gray-300">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-black">
              <Target size={20} className="text-black" />
              Muscle Group Volume
            </h3>
            <div className="flex flex-wrap gap-4 mb-4">
              {['chest', 'back', 'shoulders', 'legs', 'arms'].map(group => (
                <button
                  key={group}
                  onClick={() => setMuscleGroup(group)}
                  className={`px-4 py-2 rounded-md transition-all transform shadow-2xl border ${
                    muscleGroup === group
                      ? 'bg-blue-500 hover:bg-blue-600 text-white border-blue-600'
                      : 'bg-white/90 hover:bg-white/100 text-black border-gray-300'
                  }`}
                >
                  {group.charAt(0).toUpperCase() + group.slice(1)}
                </button>
              ))}
            </div>
            
            {muscleGroupVolumeData && muscleGroupVolumeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={muscleGroupVolumeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="dateRange" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" tickFormatter={formatVolume} />
                  <Legend />
                  <Bar dataKey="volume" fill="#3b82f6" name="Volume" />
                  <Bar dataKey="workouts" fill="#10b981" name="Workouts" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-8 text-black">
                <AlertCircle size={32} className="mx-auto mb-2 text-black" />
                No volume data available for {muscleGroup}. Complete workouts targeting this muscle group.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Insights View */}
      {viewMode === 'insights' && (
        <div className="space-y-6">
          {/* Performance Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white/90 transition-all shadow-2xl p-6 border border-gray-300">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-black">Strength Gains</h3>
                <Award size={24} className="text-black" />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-black">Best Lift</span>
                  <span className="font-bold text-black">{getBestLift(history)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-black">Total Progress</span>
                  <span className="font-bold text-black">{getTotalProgress(history)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-black">PR Rate</span>
                  <span className="font-bold text-black">{getPRRate(history)}%</span>
                </div>
              </div>
            </div>

            <div className="bg-white/90 transition-all shadow-2xl p-6 border border-gray-300">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-black">Training Quality</h3>
                <Heart size={24} className="text-black" />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-black">Avg RPE</span>
                  <span className="font-bold text-black">{advancedStats.averageSessionRPE.toFixed(1)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-black">RPE Consistency</span>
                  <span className="font-bold text-black">{getRPEConsistency(history)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-black">Session Quality</span>
                  <span className="font-bold text-black">{getSessionQuality(history)}</span>
                </div>
              </div>
            </div>

            <div className="bg-white/90 transition-all shadow-2xl p-6 border border-gray-300">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-black">Consistency</h3>
                <Users size={24} className="text-black" />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-black">Streak</span>
                  <span className="font-bold text-black">{getCurrentStreak(history)} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-black">Monthly Avg</span>
                  <span className="font-bold text-black">{getMonthlyAverage(history)} workouts</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-black">Best Month</span>
                  <span className="font-bold text-black">{getBestMonth(history)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Actionable Insights */}
          <div className="bg-white/90 transition-all shadow-2xl p-6 border border-gray-300">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-black">
              <Target size={20} className="text-black" />
              Actionable Insights
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getActionableInsights(history, progressionSummary).map((insight, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-md border border-gray-300">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      insight.priority === 'high' ? 'bg-red-100 text-red-800' :
                      insight.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {insight.priority.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-black">{insight.message}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper functions for calculations
const calculateConsistencyScore = (history) => {
  if (history.length < 2) return 50;

  const dates = history.map(session => new Date(session.startTime));
  const intervals = [];
  
  for (let i = 1; i < dates.length; i++) {
    const daysDiff = Math.floor((dates[i - 1] - dates[i]) / (1000 * 60 * 60 * 24));
    intervals.push(daysDiff);
  }

  const avgInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
  const variance = intervals.reduce((sum, interval) => sum + Math.pow(interval - avgInterval, 2), 0) / intervals.length;
  const stdDev = Math.sqrt(variance);

  const maxAcceptableStdDev = 3;
  const consistency = Math.max(0, 100 - (stdDev * 20));
  
  return Math.round(consistency);
};

const calculateVolumeTrend = (history) => {
  if (history.length < 2) return 'stable';

  const recentVolumes = history.slice(0, 4).map(s => s.totalVolume || 0);
  const olderVolumes = history.slice(4, 8).map(s => s.totalVolume || 0);

  if (olderVolumes.length === 0) return 'stable';

  const recentAvg = recentVolumes.reduce((sum, v) => sum + v, 0) / recentVolumes.length;
  const olderAvg = olderVolumes.reduce((sum, v) => sum + v, 0) / olderVolumes.length;

  const change = (recentAvg - olderAvg) / olderAvg;

  if (change > 0.1) return 'up';
  if (change < -0.1) return 'down';
  return 'stable';
};

const calculateStrengthTrend = (history) => {
  if (history.length < 2) return 'stable';

  const recentRPE = history.slice(0, 4).map(s => s.averageRPE || 0);
  const olderRPE = history.slice(4, 8).map(s => s.averageRPE || 0);

  if (olderRPE.length === 0) return 'stable';

  const recentAvg = recentRPE.reduce((sum, r) => sum + r, 0) / recentRPE.length;
  const olderAvg = olderRPE.reduce((sum, r) => sum + r, 0) / olderRPE.length;

  const change = recentAvg - olderAvg;

  if (change < -0.5) return 'up'; // Lower RPE = stronger
  if (change > 0.5) return 'down'; // Higher RPE = weaker
  return 'stable';
};

const getVolumeChartData = (history) => {
  return history.slice(0, 10).map((session, index) => ({
    date: new Date(session.startTime).toLocaleDateString(),
    volume: session.totalVolume || 0
  })).reverse();
};

const getBestLift = (history) => {
  let best = 0;
  history.forEach(session => {
    if (session.exercises) {
      session.exercises.forEach(ex => {
        if (ex.setsData) {
          ex.setsData.forEach(set => {
            if (set.weight && set.reps) {
              const volume = set.weight * set.reps;
              if (volume > best) best = volume;
            }
          });
        }
      });
    }
  });
  return best > 0 ? `${best} volume` : 'N/A';
};

const getTotalProgress = (history) => {
  // Calculate total volume increase
  if (history.length < 2) return 'N/A';
  
  const firstVolume = history[history.length - 1].totalVolume || 0;
  const lastVolume = history[0].totalVolume || 0;
  
  if (firstVolume === 0) return 'N/A';
  
  const change = ((lastVolume - firstVolume) / firstVolume) * 100;
  return `${change > 0 ? '+' : ''}${change.toFixed(1)}%`;
};

const getPRRate = (history) => {
  // Calculate percentage of workouts with personal records
  let prCount = 0;
  let totalCount = 0;

  history.forEach(session => {
    if (session.exercises) {
      session.exercises.forEach(ex => {
        if (ex.setsData) {
          ex.setsData.forEach(set => {
            if (set.weight && set.reps) {
              totalCount++;
              // Simple PR detection - if this is the highest volume set
              const volume = set.weight * set.reps;
              // This would need more sophisticated logic in a real implementation
              if (volume > 0) prCount++;
            }
          });
        }
      });
    }
  });

  return totalCount > 0 ? Math.round((prCount / totalCount) * 100) : 0;
};

const getRPEConsistency = (history) => {
  if (history.length === 0) return 0;

  const rpes = history.map(s => s.averageRPE || 0);
  const avgRPE = rpes.reduce((sum, r) => sum + r, 0) / rpes.length;
  const variance = rpes.reduce((sum, r) => sum + Math.pow(r - avgRPE, 2), 0) / rpes.length;
  const stdDev = Math.sqrt(variance);

  // Consistency score based on RPE variance
  return Math.max(0, 100 - (stdDev * 20));
};

const getSessionQuality = (history) => {
  if (history.length === 0) return 'N/A';

  const avgRPE = history.reduce((sum, s) => sum + (s.averageRPE || 0), 0) / history.length;

  if (avgRPE <= 5) return 'Excellent';
  if (avgRPE <= 7) return 'Good';
  if (avgRPE <= 8) return 'Moderate';
  return 'Needs Work';
};

const getCurrentStreak = (history) => {
  if (history.length === 0) return 0;

  let streak = 1;
  const dates = history.map(s => new Date(s.startTime)).sort((a, b) => b - a);

  for (let i = 1; i < dates.length; i++) {
    const diff = Math.floor((dates[i - 1] - dates[i]) / (1000 * 60 * 60 * 24));
    if (diff <= 2) streak++;
    else break;
  }

  return streak;
};

const getMonthlyAverage = (history) => {
  if (history.length === 0) return 0;

  const months = {};
  history.forEach(session => {
    const date = new Date(session.startTime);
    const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
    months[monthKey] = (months[monthKey] || 0) + 1;
  });

  const avg = Object.values(months).reduce((sum, count) => sum + count, 0) / Object.keys(months).length;
  return Math.round(avg);
};

const getBestMonth = (history) => {
  if (history.length === 0) return 'N/A';

  const months = {};
  history.forEach(session => {
    const date = new Date(session.startTime);
    const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
    months[monthKey] = (months[monthKey] || 0) + 1;
  });

  const bestMonth = Object.keys(months).reduce((a, b) => months[a] > months[b] ? a : b, '');
  return bestMonth || 'N/A';
};

const getActionableInsights = (history, progressionSummary) => {
  const insights = [];

  // Volume insights
  if (progressionSummary.totalVolume < 10000) {
    insights.push({
      priority: 'medium',
      message: 'Consider increasing training volume gradually to support muscle growth.'
    });
  }

  // Consistency insights
  const consistency = calculateConsistencyScore(history);
  if (consistency < 70) {
    insights.push({
      priority: 'high',
      message: 'Work on workout consistency. Try scheduling workouts like appointments.'
    });
  }

  // Progression insights
  if (progressionSummary.stalled > progressionSummary.progressing) {
    insights.push({
      priority: 'high',
      message: 'Many exercises are stalled. Consider deloading or changing exercise variations.'
    });
  }

  // RPE insights
  const avgRPE = history.length > 0 ? history.reduce((sum, s) => sum + (s.averageRPE || 0), 0) / history.length : 0;
  if (avgRPE > 8) {
    insights.push({
      priority: 'high',
      message: 'Average RPE is high. Consider reducing intensity or increasing rest periods.'
    });
  }

  if (insights.length === 0) {
    insights.push({
      priority: 'low',
      message: 'Great job! Your training looks well-balanced. Keep up the good work.'
    });
  }

  return insights.slice(0, 6); // Limit to 6 insights
};

export default EnhancedProgressDashboard;