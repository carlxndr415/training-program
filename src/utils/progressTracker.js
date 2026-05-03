// Constants for storage keys
import { profileKey } from './profileManager.js';

const STORAGE_KEYS = {
  WORKOUT_HISTORY: 'workout_history',
  USER_PROFILE: 'user_profile',
  EXERCISE_LOGS: 'exercise_logs'
};

const pKey = (k) => profileKey(k);

// Constants for validation
const MIN_WEIGHT = 0;
const MAX_WEIGHT = 1000;
const MIN_REPS = 1;
const MAX_REPS = 100;

/**
 * Progress tracking utilities for storing and retrieving workout history
 * and generating analytics data
 */

/**
 * Get workout history from localStorage
 * @returns {Array} Array of completed workouts
 */
export const getWorkoutHistory = () => {
  try {
    const history = localStorage.getItem(pKey(STORAGE_KEYS.WORKOUT_HISTORY));
    return history ? JSON.parse(history) : [];
  } catch (error) {
    console.error('Error loading workout history:', error);
    return [];
  }
};

/**
 * Save a completed workout to history
 * @param {Object} workoutData - Workout completion data
 * @throws {Error} If workout data is invalid
 */
export const saveWorkoutToHistory = (workoutData) => {
  if (!workoutData || typeof workoutData !== 'object') {
    throw new Error('Workout data must be an object');
  }

  const requiredProperties = ['name', 'exercises', 'duration'];
  for (const prop of requiredProperties) {
    if (!workoutData[prop]) {
      throw new Error(`Workout data missing required property: ${prop}`);
    }
  }

  try {
    const history = getWorkoutHistory();
    const newEntry = {
      ...workoutData,
      timestamp: new Date().toISOString(),
      date: new Date().toLocaleDateString(),
      id: Date.now()
    };

    history.push(newEntry);
    localStorage.setItem(pKey(STORAGE_KEYS.WORKOUT_HISTORY), JSON.stringify(history));
  } catch (error) {
    console.error('Error saving workout history:', error);
    throw error;
  }
};

/**
 * Get exercise logs for tracking progress
 * @returns {Object} Object with exercise logs
 */
export const getExerciseLogs = () => {
  try {
    const logs = localStorage.getItem(pKey(STORAGE_KEYS.EXERCISE_LOGS));
    return logs ? JSON.parse(logs) : {};
  } catch (error) {
    console.error('Error loading exercise logs:', error);
    return {};
  }
};

/**
 * Log a completed set for an exercise
 * @param {string} workoutName - Name of the workout
 * @param {string} exerciseName - Name of the exercise
 * @param {number} setNumber - Set number
 * @param {number} weight - Weight used (optional)
 * @param {number} reps - Reps completed
 * @param {string} notes - Additional notes (optional)
 * @throws {Error} If parameters are invalid
 */
export const logExerciseSet = (workoutName, exerciseName, setNumber, weight, reps, notes = '') => {
  if (typeof workoutName !== 'string' || !workoutName.trim()) {
    throw new Error('Workout name must be a non-empty string');
  }

  if (typeof exerciseName !== 'string' || !exerciseName.trim()) {
    throw new Error('Exercise name must be a non-empty string');
  }

  if (!Number.isInteger(setNumber) || setNumber < 1) {
    throw new Error('Set number must be a positive integer');
  }

  if (weight !== null && (typeof weight !== 'number' || weight < MIN_WEIGHT || weight > MAX_WEIGHT)) {
    throw new Error(`Weight must be null or between ${MIN_WEIGHT} and ${MAX_WEIGHT}`);
  }

  if (!Number.isInteger(reps) || reps < MIN_REPS || reps > MAX_REPS) {
    throw new Error(`Reps must be between ${MIN_REPS} and ${MAX_REPS}`);
  }

  if (typeof notes !== 'string') {
    throw new Error('Notes must be a string');
  }

  try {
    const logs = getExerciseLogs();
    const logKey = `${workoutName}-${exerciseName}`;

    if (!logs[logKey]) {
      logs[logKey] = [];
    }

    logs[logKey].push({
      workoutName,
      exerciseName,
      setNumber,
      weight: weight || null,
      reps,
      notes,
      timestamp: new Date().toISOString(),
      date: new Date().toLocaleDateString()
    });

    localStorage.setItem(pKey(STORAGE_KEYS.EXERCISE_LOGS), JSON.stringify(logs));
  } catch (error) {
    console.error('Error logging exercise set:', error);
    throw error;
  }
};

/**
 * Get user profile data
 * @returns {Object} User profile object
 */
export const getUserProfile = () => {
  try {
    const profile = localStorage.getItem(pKey(STORAGE_KEYS.USER_PROFILE));
    return profile ? JSON.parse(profile) : {
      name: '',
      weight: null,
      height: null,
      experienceLevel: 'beginner',
      goals: [],
      startDate: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error loading user profile:', error);
    return {
      name: '',
      weight: null,
      height: null,
      experienceLevel: 'beginner',
      goals: [],
      startDate: new Date().toISOString()
    };
  }
};

/**
 * Update user profile
 * @param {Object} updates - Profile updates
 * @throws {Error} If updates are invalid
 */
export const updateUserProfile = (updates) => {
  if (!updates || typeof updates !== 'object') {
    throw new Error('Updates must be an object');
  }

  const validKeys = ['name', 'weight', 'height', 'experienceLevel', 'goals'];
  const invalidKeys = Object.keys(updates).filter(key => !validKeys.includes(key));

  if (invalidKeys.length > 0) {
    throw new Error(`Invalid profile keys: ${invalidKeys.join(', ')}`);
  }

  if (updates.name && (typeof updates.name !== 'string' || !updates.name.trim())) {
    throw new Error('Name must be a non-empty string');
  }

  if (updates.weight !== undefined && (typeof updates.weight !== 'number' || updates.weight < MIN_WEIGHT || updates.weight > MAX_WEIGHT)) {
    throw new Error(`Weight must be between ${MIN_WEIGHT} and ${MAX_WEIGHT}`);
  }

  if (updates.height !== undefined && (typeof updates.height !== 'number' || updates.height < 0)) {
    throw new Error('Height must be a non-negative number');
  }

  if (updates.experienceLevel !== undefined && !['beginner', 'intermediate', 'advanced'].includes(updates.experienceLevel)) {
    throw new Error('Experience level must be one of: beginner, intermediate, advanced');
  }

  if (updates.goals !== undefined && (!Array.isArray(updates.goals) || !updates.goals.every(goal => typeof goal === 'string'))) {
    throw new Error('Goals must be an array of strings');
  }

  try {
    const profile = getUserProfile();
    const newProfile = { ...profile, ...updates };
    localStorage.setItem(pKey(STORAGE_KEYS.USER_PROFILE), JSON.stringify(newProfile));
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

/**
 * Get weekly volume summary for a muscle group
 * @param {string} muscleGroup - Muscle group name
 * @param {number} weeksBack - Number of weeks to look back
 * @returns {Object} Volume summary data
 */
export const getWeeklyVolumeSummary = (muscleGroup, weeksBack = 4) => {
  const history = getWorkoutHistory();
  const now = new Date();
  const weeksAgo = new Date(now.getTime() - (weeksBack * 7 * 24 * 60 * 60 * 1000));
  
  const relevantWorkouts = history.filter(workout => 
    new Date(workout.timestamp) >= weeksAgo
  );

  const weeklyData = {};
  
  // Initialize weekly buckets
  for (let i = 0; i < weeksBack; i++) {
    const weekStart = new Date(now.getTime() - (i * 7 * 24 * 60 * 60 * 1000));
    const weekEnd = new Date(weekStart.getTime() + (6 * 24 * 60 * 60 * 1000));
    weeklyData[i] = {
      week: i + 1,
      dateRange: `${weekStart.toLocaleDateString()} - ${weekEnd.toLocaleDateString()}`,
      volume: 0,
      workouts: 0
    };
  }

  relevantWorkouts.forEach(workout => {
    const workoutDate = new Date(workout.timestamp);
    const weekIndex = Math.floor((now - workoutDate) / (7 * 24 * 60 * 60 * 1000));
    
    if (weekIndex >= 0 && weekIndex < weeksBack) {
      weeklyData[weekIndex].workouts++;
      // Add volume calculation based on workout data
      if (workout.exercises) {
        workout.exercises.forEach(ex => {
          // Simple volume calculation: sets * reps
          weeklyData[weekIndex].volume += (ex.sets || 0) * (ex.reps || 0);
        });
      }
    }
  });

  return Object.values(weeklyData);
};

/**
 * Get exercise performance trends
 * @param {string} exerciseName - Name of the exercise
 * @param {number} daysBack - Number of days to look back
 * @returns {Array} Performance trend data
 */
export const getExerciseTrends = (exerciseName, daysBack = 30) => {
  const logs = getExerciseLogs();
  const trendKey = Object.keys(logs).find(k => k.includes(exerciseName));
  
  if (!trendKey || !logs[trendKey]) {
    return [];
  }

  const now = new Date();
  const daysAgo = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000));
  
  const relevantLogs = logs[trendKey]
    .filter(log => new Date(log.timestamp) >= daysAgo)
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  return relevantLogs.map(log => ({
    date: log.date,
    weight: log.weight,
    reps: log.reps,
    volume: (log.weight || 0) * log.reps,
    timestamp: log.timestamp
  }));
};

/**
 * Calculate training frequency
 * @param {number} weeksBack - Number of weeks to analyze
 * @returns {Object} Frequency analysis
 */
export const getTrainingFrequency = (weeksBack = 4) => {
  const history = getWorkoutHistory();
  const now = new Date();
  const weeksAgo = new Date(now.getTime() - (weeksBack * 7 * 24 * 60 * 60 * 1000));
  
  const relevantWorkouts = history.filter(workout => 
    new Date(workout.timestamp) >= weeksAgo
  );

  const frequency = {
    totalWorkouts: relevantWorkouts.length,
    workoutsByType: {},
    averagePerWeek: 0,
    mostFrequentDay: '',
    consistency: 0
  };

  // Count workouts by type
  relevantWorkouts.forEach(workout => {
    const type = workout.workoutType || workout.name;
    frequency.workoutsByType[type] = (frequency.workoutsByType[type] || 0) + 1;
  });

  frequency.averagePerWeek = frequency.totalWorkouts / weeksBack;

  // Find most frequent day of week
  const dayCounts = {};
  relevantWorkouts.forEach(workout => {
    const day = new Date(workout.timestamp).getDay();
    const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][day];
    dayCounts[dayName] = (dayCounts[dayName] || 0) + 1;
  });
  
  const dayKeys = Object.keys(dayCounts);
  frequency.mostFrequentDay = dayKeys.length > 0 
    ? dayKeys.reduce((a, b) => dayCounts[a] > dayCounts[b] ? a : b)
    : 'N/A';

  // Calculate consistency (how evenly distributed workouts are)
  const weeklyDistribution = Array(weeksBack).fill(0);
  relevantWorkouts.forEach(workout => {
    const weekIndex = Math.floor((now - new Date(workout.timestamp)) / (7 * 24 * 60 * 60 * 1000));
    if (weekIndex >= 0 && weekIndex < weeksBack) {
      weeklyDistribution[weekIndex]++;
    }
  });

  const stdDev = Math.sqrt(
    weeklyDistribution.reduce((acc, val) => acc + Math.pow(val - frequency.averagePerWeek, 2), 0) / weeksBack
  );
  
  frequency.consistency = frequency.averagePerWeek > 0 ? Math.max(0, 1 - (stdDev / frequency.averagePerWeek)) : 0;

  return frequency;
};

/**
 * Clear all progress data (for testing or fresh start)
 */
export const clearProgressData = () => {
  try {
    localStorage.removeItem(pKey(STORAGE_KEYS.WORKOUT_HISTORY));
    localStorage.removeItem(pKey(STORAGE_KEYS.EXERCISE_LOGS));
    localStorage.removeItem(pKey(STORAGE_KEYS.USER_PROFILE));
  } catch (error) {
    console.error('Error clearing progress data:', error);
  }
};