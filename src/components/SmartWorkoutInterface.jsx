import React, { useState, useEffect } from 'react';
import { 
  Check, 
  Plus, 
  Minus, 
  Clock, 
  Target, 
  TrendingUp, 
  BarChart3,
  Play, 
  Pause, 
  SkipForward,
  Save,
  RefreshCw,
  Smartphone,
  Wifi,
  WifiOff,
  Trophy,
  Star,
  Zap,
  Heart,
  Shield,
  Download,
  Share2,
  Volume2,
  VolumeX,
  Settings,
  Moon,
  Sun
} from 'lucide-react';
import { formatTime } from '../utils/workoutUtils';
import { 
  getActiveSession, 
  updateCurrentSet,
  updateSetByIndex,
  completeCurrentSet, 
  updateRestTimer,
  getCurrentSetData,
  isSetCompleted,
  getExerciseCompletion
} from '../utils/workoutSessionManager';
import { logEnhancedExerciseSet } from '../utils/enhancedProgressTracker';
import { playLyreSound } from '../utils/audioUtils';
import { autoSaveManager } from '../utils/offlineStorage';
import { gamificationSystem } from '../utils/gamificationSystem';
import { predictiveAnalytics } from '../utils/predictiveAnalytics';
import { RESPONSIVE_CONFIG } from '../utils/responsiveUtils';
import { useAchievementNotifications } from './AchievementNotification';

const SmartWorkoutInterface = ({ 
  exercises, 
  currentExerciseIndex, 
  currentSet, 
  isResting, 
  timeLeft, 
  isTimerRunning,
  onSkipToExercise,
  onSkipToSet,
  onCompleteSet,
  onCompleteSetFromRest,
  onAutoAdvance,
  autoAdvanceEnabled = true,
  completedSets = {},
  workoutKey = '',
  onFinishWorkout,
  getSetData
}) => {
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [rpe, setRpe] = useState(7);
  const [notes, setNotes] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [showProgression, setShowProgression] = useState(false);
  
  // Achievement notifications
  const { showAchievement, NotificationComponent } = useAchievementNotifications();

  const session = getActiveSession();
  const currentSetData = getCurrentSetData();

  // Derive completion from parent completedSets state so it updates reactively
  const totalSets = exercises ? exercises.reduce((sum, ex) => sum + ex.sets, 0) : 0;
  const completedCount = Object.keys(completedSets).filter(k => k.startsWith(workoutKey + '-')).length;
  const completion = {
    total: exercises ? exercises.length : 0,
    completed: completedCount,
    percentage: totalSets > 0 ? Math.round((completedCount / totalSets) * 100) : 0
  };

  // When navigating to a set: load saved data if it exists, otherwise keep current values
  // Only clear inputs when switching to a different exercise
  useEffect(() => {
    setWeight('');
    setReps('');
    setRpe(7);
    setNotes('');
  }, [currentExerciseIndex]);

  useEffect(() => {
    if (getSetData) {
      const setData = getSetData(currentExerciseIndex, currentSet);
      if (setData && setData.completed && (setData.weight || setData.reps)) {
        setWeight(setData.weight ? setData.weight.toString() : '');
        setReps(setData.reps ? setData.reps.toString() : '');
        setRpe(setData.rpe || 7);
      }
    }
  }, [currentExerciseIndex, currentSet]);

  // Timer effect
  useEffect(() => {
    let interval;
    if (isTimerRunning && isResting && timeLeft > 0) {
      interval = setInterval(() => {
        // Play sound when rest time reaches 0
        if (timeLeft === 1) {
          playLyreSound();
        }
      }, 1000);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isTimerRunning, isResting, timeLeft]);

  const currentExercise = exercises?.[currentExerciseIndex];
  const isCurrentSetCompleted = !!completedSets[workoutKey + "-" + currentExerciseIndex + "-" + currentSet];

  const handleWeightChange = (value) => {
    // Allow empty string or valid numbers
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setWeight(value);
    }
  };

  const handleRepsChange = (value) => {
    // Allow empty string or valid integers
    if (value === '' || /^\d+$/.test(value)) {
      setReps(value);
    }
  };

  const handleRpeChange = (value) => {
    const numValue = parseInt(value);
    if (numValue >= 1 && numValue <= 10) {
      setRpe(numValue);
    }
  };

  const handleCompleteSet = () => {
    const weightNum = parseFloat(weight) || 0;
    const repsNum = parseInt(reps) || 0;

    // Log to enhanced tracker
    logEnhancedExerciseSet(
      session?.workoutKey || '',
      currentExercise.name,
      currentSet,
      weightNum,
      repsNum,
      rpe,
      notes
    );

    // Write to the exact exercise/set index regardless of session pointer
    updateSetByIndex(currentExerciseIndex, currentSet, weightNum, repsNum, rpe);

    // Notify parent — triggers completedSets state update and auto-advance
    if (onCompleteSet) {
      onCompleteSet({ weight: weightNum, reps: repsNum, rpe });
    }

    setNotes('');
  };

  const handleQuickComplete = () => {
    completeCurrentSet();
    if (autoAdvanceEnabled) {
      onAutoAdvance();
    }
  };

  const handleRestTimerControl = () => {
    if (isResting) {
      // Complete rest and move to next set
      onCompleteSetFromRest();
    } else {
      // Start rest timer
      updateRestTimer(true, currentExercise.restTime, true);
    }
  };

  const getRpeColor = (rpe) => {
    if (rpe <= 3) return 'text-green-600';
    if (rpe <= 5) return 'text-yellow-600';
    if (rpe <= 7) return 'text-orange-600';
    return 'text-red-600';
  };

  const getVolumeEstimate = () => {
    const weightNum = parseFloat(weight) || 0;
    const repsNum = parseInt(reps) || 0;
    return weightNum * repsNum;
  };

  const getProgressionSuggestion = () => {
    // Simple progression logic based on RPE and performance
    if (rpe <= 5 && repsNum >= parseInt(currentExercise.reps.split('-')[1] || currentExercise.reps)) {
      return {
        type: 'weight',
        suggestion: 'Consider increasing weight next set',
        color: 'text-green-600'
      };
    } else if (rpe >= 8) {
      return {
        type: 'deload',
        suggestion: 'Consider reducing weight or reps',
        color: 'text-red-600'
      };
    } else {
      return {
        type: 'maintain',
        suggestion: 'Maintain current parameters',
        color: 'text-blue-600'
      };
    }
  };

  const repsNum = parseInt(reps) || 0;
  const volumeEstimate = getVolumeEstimate();
  const progressionSuggestion = getProgressionSuggestion();

  return (
    <div className="space-y-4">
      {/* Exercise Header */}
      <div className="bg-white/90 transition-all shadow-2xl p-4 border border-gray-300">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-black bg-gray-200 px-2 py-1 rounded">
              {currentExercise.group}
            </span>
            <h3 className="text-xl font-bold text-black">{currentExercise.name}</h3>
          </div>
          <div className="text-right">
            <div className="text-sm text-black">
              Set {currentSet} of {currentExercise.sets}
            </div>
            <div className="text-xs text-black">
              Target: {currentExercise.reps} reps | {currentExercise.rest}s rest
            </div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${completion.percentage}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-sm text-black mt-1">
          <span>{completion.completed} of {completion.total} exercises completed</span>
          <span>{completion.percentage}%</span>
        </div>
      </div>

      {/* Current Set Status */}
      <div className="bg-white/90 transition-all shadow-2xl p-4 border border-gray-300">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-black">Current Set</h4>
          <div className="flex gap-2">

            <button
              onClick={() => setShowProgression(!showProgression)}
              className={`px-3 py-1 rounded text-sm transition-all transform shadow-2xl border ${
                showProgression 
                  ? 'bg-green-500 hover:bg-green-600 text-white border-green-600' 
                  : 'bg-white/90 hover:bg-white/100 text-black border-gray-300'
              }`}
            >
              {showProgression ? 'Hide' : 'Show'} Progression
            </button>
          </div>
        </div>

        {/* Input Fields */}
        {(
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-xs text-black mb-1">Weight (lbs)</label>
              <input
                type="number"
                value={weight}
                onChange={(e) => handleWeightChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white"
                placeholder="0"
                step="2.5"
              />
            </div>
            <div>
              <label className="block text-xs text-black mb-1">Reps</label>
              <input
                type="number"
                value={reps}
                onChange={(e) => handleRepsChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-xs text-black mb-1">RPE (1-10)</label>
              <select
                value={rpe}
                onChange={(e) => handleRpeChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white"
              >
                {[1,2,3,4,5,6,7,8,9,10].map(num => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-black mb-1">Notes</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white"
                placeholder="Optional notes"
              />
            </div>
          </div>
        )}

        {/* Progression Info */}
        {showProgression && (
          <div className="bg-gray-50 p-3 rounded-md mb-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={16} className="text-black" />
              <span className="font-semibold text-black">Progression Analysis</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
              <div className="flex items-center gap-2">
                <BarChart3 size={14} className="text-black" />
                <span className="text-black">Volume: {volumeEstimate}</span>
              </div>
              <div className="flex items-center gap-2">
                <Target size={14} className={`text-black ${getRpeColor(rpe)}`} />
                <span className={`text-black ${getRpeColor(rpe)}`}>RPE: {rpe}/10</span>
              </div>
              <div className="flex items-center gap-2">
                <RefreshCw size={14} className="text-black" />
                <span className={`text-black ${progressionSuggestion.color}`}>
                  {progressionSuggestion.suggestion}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Finish Workout Button */}
        {completion.percentage === 100 && (
          <div className="bg-green-100 border border-green-400 rounded-md p-4 text-center">
            <p className="font-bold text-green-800 text-lg mb-3">Workout Complete!</p>
            <button
              onClick={onFinishWorkout}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-md transition-all shadow-lg"
            >
              Finish Workout
            </button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleCompleteSet}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md transition-all transform shadow-2xl"
          >
            <Check size={20} />
            Completed Set {currentSet}
          </button>

          <button
            onClick={handleQuickComplete}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-all transform shadow-2xl"
          >
            <Save size={20} />
            Quick Complete
          </button>

          <button
            onClick={handleRestTimerControl}
            className={`flex items-center gap-2 px-4 py-2 transition-all transform shadow-2xl ${
              isResting 
                ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                : 'bg-yellow-500 hover:bg-yellow-600 text-white'
            }`}
          >
            <Clock size={20} />
            {isResting ? 'End Rest' : 'Start Rest'} ({currentExercise.restTime}s)
          </button>

          <button
            onClick={onAutoAdvance}
            className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-md transition-all transform shadow-2xl"
          >
            <SkipForward size={20} />
            Next Set
          </button>
        </div>

        {/* Rest Timer Display */}
        {isResting && (
          <div className="mt-4 p-4 bg-gray-100 rounded-md text-center">
            <div className="text-3xl font-bold text-black mb-2">
              {formatTime(timeLeft)}
            </div>
            <div className="text-black">Rest Time</div>
            {timeLeft <= 0 && (
              <div className="mt-2 text-red-600 font-semibold">
                Rest Complete! Ready for next set.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Exercise List */}
      <div className="bg-white/90 transition-all shadow-2xl p-4 border border-gray-300">
        <h4 className="font-semibold text-black mb-3">Exercise Progress</h4>
        <div className="space-y-2">
          {exercises.map((exercise, idx) => {
            const isCurrent = idx === currentExerciseIndex;
            const exerciseCompletion = session?.exercises[idx];
            const completedSets = exerciseCompletion?.setsData.filter(set => set.completed).length || 0;
            
            return (
              <div
                key={idx}
                onClick={() => onSkipToExercise(idx)}
                className={`p-4 cursor-pointer transition-all border rounded-md ${
                  isCurrent
                    ? 'bg-blue-50 border-blue-300'
                    : 'bg-white/90 hover:bg-white/100 border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-black bg-gray-200 px-2 py-1 rounded">
                      {exercise.group}
                    </span>
                    <div>
                      <span className={`font-medium ${isCurrent ? 'text-blue-700' : 'text-black'}`}>
                        {exercise.name}
                      </span>
                      <div className="text-xs text-gray-600 mt-0.5">
                        {exercise.sets} x {exercise.reps} &bull; {exercise.rest}s rest
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-black">
                    <span>{completedSets}/{exercise.sets} sets</span>
                    <div className="flex gap-1 flex-wrap">
                      {[...Array(exercise.sets)].map((_, setIdx) => {
                        const sd = getSetData ? getSetData(idx, setIdx + 1) : null;
                        const isCompleted = setIdx < completedSets;
                        return (
                          <div key={setIdx} className="flex flex-col items-center">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onSkipToSet(idx, setIdx + 1);
                              }}
                              className={`w-8 h-8 rounded-full text-xs font-semibold transition-all transform shadow-2xl border ${
                                isCompleted
                                  ? 'bg-green-500 hover:bg-green-600 text-white border-green-600'
                                  : isCurrent && setIdx + 1 === currentSet
                                  ? 'bg-blue-500 hover:bg-blue-600 text-white border-blue-600'
                                  : 'bg-white/90 hover:bg-white/100 text-black border-gray-300'
                              }`}
                            >
                              {setIdx + 1}
                            </button>
                            {isCompleted && sd && sd.weight ? (
                              <span className="text-xs text-gray-500 mt-0.5 whitespace-nowrap">
                                {sd.weight}×{sd.reps}
                              </span>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Achievement Notification */}
      <NotificationComponent />
    </div>
  );
};

export default SmartWorkoutInterface;