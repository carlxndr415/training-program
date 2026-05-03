/**
 * Enhanced Workout Session Manager
 * Manages active workout sessions with real-time tracking and auto-save functionality
 */

import { logEnhancedExerciseSet } from './enhancedProgressTracker';

// Constants for session management
import { profileKey } from './profileManager.js';

const STORAGE_KEYS = {
  ACTIVE_SESSION: 'active_workout_session',
  SESSION_HISTORY: 'workout_session_history'
};

const pKey = (k) => profileKey(k);

const DEFAULT_SESSION = {
  id: null,
  workoutKey: null,
  startTime: null,
  endTime: null,
  exercises: [],
  currentExerciseIndex: 0,
  currentSet: 1,
  isResting: false,
  timeLeft: 0,
  isTimerRunning: false,
  totalVolume: 0,
  averageRPE: 0
};

/**
 * Get the current active workout session
 * @returns {Object} Active session object or null if no active session
 */
export const getActiveSession = () => {
  try {
    const sessionData = localStorage.getItem(pKey(STORAGE_KEYS.ACTIVE_SESSION));
    if (!sessionData) {
      return null;
    }
    
    const session = JSON.parse(sessionData);
    
    // Validate session structure
    if (!session.workoutKey || !session.exercises || session.exercises.length === 0) {
      clearActiveSession();
      return null;
    }
    
    return session;
  } catch (error) {
    console.error('Error loading active session:', error);
    clearActiveSession();
    return null;
  }
};

/**
 * Start a new workout session
 * @param {string} workoutKey - Key of the workout to start
 * @param {Object} workoutData - Complete workout data object
 * @returns {Object} New session object
 */
export const startSession = (workoutKey, workoutData) => {
  if (!workoutKey || !workoutData) {
    throw new Error('Workout key and data are required to start a session');
  }

  const session = {
    ...DEFAULT_SESSION,
    id: `session_${Date.now()}`,
    workoutKey,
    startTime: new Date().toISOString(),
    exercises: workoutData.exercises.map((exercise, index) => ({
      exerciseKey: `${workoutKey}_${index}`,
      name: exercise.name,
      sets: exercise.sets,
      targetReps: exercise.reps,
      restTime: exercise.rest,
      group: exercise.group,
      setsData: Array(exercise.sets).fill(null).map((_, i) => ({
        setNumber: i + 1,
        weight: null,
        reps: null,
        rpe: null,
        completed: false,
        timestamp: null
      })),
      completed: false
    }))
  };

  saveSession(session);
  return session;
};

/**
 * Save the current session state
 * @param {Object} session - Session object to save
 */
export const saveSession = (session) => {
  try {
    localStorage.setItem(pKey(STORAGE_KEYS.ACTIVE_SESSION), JSON.stringify(session));
  } catch (error) {
    console.error('Error saving session:', error);
  }
};

/**
 * Update the current exercise and set
 * @param {number} exerciseIndex - Index of current exercise
 * @param {number} setNumber - Current set number
 */
export const updateCurrentExercise = (exerciseIndex, setNumber) => {
  const session = getActiveSession();
  if (!session) return;

  session.currentExerciseIndex = exerciseIndex;
  session.currentSet = setNumber;
  
  saveSession(session);
};

/**
 * Update the current set with performance data
 * @param {number} weight - Weight used for the set
 * @param {number} reps - Reps completed
 * @param {number} rpe - Rate of Perceived Exertion (1-10)
 */
export const updateCurrentSet = (weight, reps, rpe) => {
  const session = getActiveSession();
  if (!session) return;

  const currentExercise = session.exercises[session.currentExerciseIndex];
  const currentSetData = currentExercise.setsData[session.currentSet - 1];

  currentSetData.weight = weight;
  currentSetData.reps = reps;
  currentSetData.rpe = rpe;
  currentSetData.completed = true;
  currentSetData.timestamp = new Date().toISOString();

  // Calculate volume for this set
  const setVolume = (weight || 0) * (reps || 0);
  
  // Update exercise completion
  const allSetsCompleted = currentExercise.setsData.every(set => set.completed);
  currentExercise.completed = allSetsCompleted;

  // Update session totals
  session.totalVolume += setVolume;
  
  // Recalculate average RPE
  const allCompletedSets = session.exercises.flatMap(ex => ex.setsData).filter(set => set.completed);
  if (allCompletedSets.length > 0) {
    const totalRPE = allCompletedSets.reduce((sum, set) => sum + (set.rpe || 0), 0);
    session.averageRPE = totalRPE / allCompletedSets.length;
  }

  saveSession(session);
};

/**
 * Mark current set as completed without performance data (for quick skip)
 */
export const completeCurrentSet = () => {
  const session = getActiveSession();
  if (!session) return;

  const currentExercise = session.exercises[session.currentExerciseIndex];
  const currentSetData = currentExercise.setsData[session.currentSet - 1];

  currentSetData.completed = true;
  currentSetData.timestamp = new Date().toISOString();

  // Update exercise completion
  const allSetsCompleted = currentExercise.setsData.every(set => set.completed);
  currentExercise.completed = allSetsCompleted;

  saveSession(session);
};

/**
 * Update rest timer state
 * @param {boolean} isResting - Whether currently resting
 * @param {number} timeLeft - Time left in rest
 * @param {boolean} isTimerRunning - Whether timer is running
 */
export const updateRestTimer = (isResting, timeLeft, isTimerRunning) => {
  const session = getActiveSession();
  if (!session) return;

  session.isResting = isResting;
  session.timeLeft = timeLeft;
  session.isTimerRunning = isTimerRunning;

  saveSession(session);
};

/**
 * Complete the current workout session
 * Logs all completed sets to the enhanced progress tracker before saving.
 * @returns {Object} Completed session data
 */
export const completeSession = () => {
  const session = getActiveSession();
  if (!session) return null;

  session.endTime = new Date().toISOString();

  // Log all completed sets with full data to the enhanced progress tracker
  session.exercises.forEach(exercise => {
    exercise.setsData.forEach(setData => {
      if (
        setData.completed &&
        setData.weight !== null &&
        setData.reps !== null &&
        setData.rpe !== null
      ) {
        try {
          logEnhancedExerciseSet(
            session.workoutKey,
            exercise.name,
            setData.setNumber,
            setData.weight,
            setData.reps,
            setData.rpe,
            ''
          );
        } catch {
          // Silently ignore individual set logging errors so the session still completes
        }
      }
    });
  });

  // Save to history
  saveSessionToHistory(session);
  
  // Clear active session
  clearActiveSession();

  return session;
};

/**
 * Clear the active session
 */
export const clearActiveSession = () => {
  try {
    localStorage.removeItem(pKey(STORAGE_KEYS.ACTIVE_SESSION));
  } catch (error) {
    console.error('Error clearing active session:', error);
  }
};

/**
 * Save completed session to history
 * @param {Object} session - Completed session to save
 */
export const saveSessionToHistory = (session) => {
  try {
    const history = getSessionHistory();
    history.push(session);
    localStorage.setItem(pKey(STORAGE_KEYS.SESSION_HISTORY), JSON.stringify(history));
  } catch (error) {
    console.error('Error saving session to history:', error);
  }
};

/**
 * Get workout session history
 * @param {number} limit - Maximum number of sessions to return (default: 50)
 * @returns {Array} Array of completed sessions
 */
export const getSessionHistory = (limit = 50) => {
  try {
    const historyData = localStorage.getItem(pKey(STORAGE_KEYS.SESSION_HISTORY));
    const history = historyData ? JSON.parse(historyData) : [];
    
    // Sort by start time (most recent first) and apply limit
    return history
      .sort((a, b) => new Date(b.startTime) - new Date(a.startTime))
      .slice(0, limit);
  } catch (error) {
    console.error('Error loading session history:', error);
    return [];
  }
};

/**
 * Get session statistics
 * @returns {Object} Session statistics
 */
export const getSessionStats = () => {
  const history = getSessionHistory();
  
  if (history.length === 0) {
    return {
      totalWorkouts: 0,
      totalVolume: 0,
      averageRPE: 0,
      averageDuration: 0,
      mostFrequentWorkout: null,
      lastWorkoutDate: null
    };
  }

  const totalWorkouts = history.length;
  const totalVolume = history.reduce((sum, session) => sum + (session.totalVolume || 0), 0);
  const averageRPE = history.reduce((sum, session) => sum + (session.averageRPE || 0), 0) / totalWorkouts;
  
  const durations = history.map(session => {
    const start = new Date(session.startTime);
    const end = new Date(session.endTime || session.startTime);
    return (end - start) / 1000 / 60; // Convert to minutes
  });
  const averageDuration = durations.reduce((sum, dur) => sum + dur, 0) / durations.length;

  // Find most frequent workout
  const workoutCounts = {};
  history.forEach(session => {
    workoutCounts[session.workoutKey] = (workoutCounts[session.workoutKey] || 0) + 1;
  });
  const mostFrequentWorkout = Object.keys(workoutCounts).reduce((a, b) => 
    workoutCounts[a] > workoutCounts[b] ? a : b, null
  );

  const lastWorkoutDate = history[0]?.startTime;

  return {
    totalWorkouts,
    totalVolume,
    averageRPE: Math.round(averageRPE * 10) / 10,
    averageDuration: Math.round(averageDuration * 10) / 10,
    mostFrequentWorkout,
    lastWorkoutDate
  };
};

/**
 * Get current set data for the active session
 * @returns {Object|null} Current set data or null if no active session
 */
export const getCurrentSetData = () => {
  const session = getActiveSession();
  if (!session) return null;

  const currentExercise = session.exercises[session.currentExerciseIndex];
  const currentSetData = currentExercise.setsData[session.currentSet - 1];

  return {
    exercise: currentExercise,
    set: currentSetData,
    session: {
      currentExerciseIndex: session.currentExerciseIndex,
      currentSet: session.currentSet,
      isResting: session.isResting,
      timeLeft: session.timeLeft,
      isTimerRunning: session.isTimerRunning
    }
  };
};

/**
 * Check if a set is completed
 * @param {number} exerciseIndex - Exercise index
 * @param {number} setNumber - Set number
 * @returns {boolean} Whether the set is completed
 */
export const updateSetByIndex = (exerciseIndex, setNumber, weight, reps, rpe) => {
  const session = getActiveSession();
  if (!session) return;

  const exercise = session.exercises[exerciseIndex];
  if (!exercise || !exercise.setsData[setNumber - 1]) return;

  const setData = exercise.setsData[setNumber - 1];
  setData.weight = weight;
  setData.reps = reps;
  setData.rpe = rpe;
  setData.completed = true;
  setData.timestamp = new Date().toISOString();

  const setVolume = (weight || 0) * (reps || 0);
  const allSetsCompleted = exercise.setsData.every(s => s.completed);
  exercise.completed = allSetsCompleted;

  session.totalVolume += setVolume;

  const allCompleted = session.exercises.flatMap(ex => ex.setsData).filter(s => s.completed);
  if (allCompleted.length > 0) {
    session.averageRPE = allCompleted.reduce((sum, s) => sum + (s.rpe || 0), 0) / allCompleted.length;
  }

  saveSession(session);
};

export const getSetData = (exerciseIndex, setNumber) => {
  const session = getActiveSession();
  if (!session) return null;
  const exercise = session.exercises[exerciseIndex];
  if (!exercise || !exercise.setsData[setNumber - 1]) return null;
  return exercise.setsData[setNumber - 1];
};

export const isSetCompleted = (exerciseIndex, setNumber) => {
  const session = getActiveSession();
  if (!session) return false;

  const exercise = session.exercises[exerciseIndex];
  if (!exercise || !exercise.setsData[setNumber - 1]) return false;

  return exercise.setsData[setNumber - 1].completed;
};

/**
 * Get exercise completion status
 * @returns {Object} Object with completion percentages
 */
export const getExerciseCompletion = () => {
  const session = getActiveSession();
  if (!session) return { total: 0, completed: 0, percentage: 0 };

  const totalExercises = session.exercises.length;
  const completedExercises = session.exercises.filter(ex => ex.completed).length;

  return {
    total: totalExercises,
    completed: completedExercises,
    percentage: totalExercises > 0 ? Math.round((completedExercises / totalExercises) * 100) : 0
  };
};