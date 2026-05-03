/**
 * Enhanced Progress Tracker
 * Extended version of progressTracker with weight/reps tracking and progression logic
 */

// Constants for progression logic
const PROGRESSION_RULES = {
  WEIGHT_INCREASE_PERCENT: 0.05, // 5% increase
  MIN_WEIGHT_INCREMENT: 2.5, // Minimum weight increase in lbs
  MAX_WEIGHT_INCREMENT: 10, // Maximum weight increase in lbs
  DELOAD_THRESHOLD: 0.85, // If average RPE > 8.5, suggest deload
  PROGRESSION_STALL_WEEKS: 3 // After 3 weeks of no progression, suggest variation
};

import { profileKey } from './profileManager.js';

const STORAGE_KEYS = {
  PROGRESSION_DATA: 'progression_data',
  EXERCISE_HISTORY: 'exercise_history',
  SEQUENCE: 'exercise_history_sequence',
  SESSION_HISTORY: 'workout_session_history'
};

const pKey = (k) => profileKey(k);

/**
 * Get a monotonically increasing sequence number to preserve insertion order
 * even when multiple entries share the same millisecond timestamp.
 */
const _getNextSequence = () => {
  try {
    const current = parseInt(localStorage.getItem(pKey(STORAGE_KEYS.SEQUENCE)) || '0', 10);
    const next = current + 1;
    localStorage.setItem(pKey(STORAGE_KEYS.SEQUENCE), String(next));
    return next;
  } catch {
    return Date.now();
  }
};

/**
 * Get exercise history for a specific exercise
 * @param {string} exerciseKey - Unique key for the exercise
 * @param {number} limit - Number of entries to return
 * @returns {Array} Array of exercise performance entries
 */
export const getExerciseHistory = (exerciseKey, limit = 50) => {
  try {
    const historyData = localStorage.getItem(pKey(STORAGE_KEYS.EXERCISE_HISTORY));
    const history = historyData ? JSON.parse(historyData) : {};
    
    return (history[exerciseKey] || []).slice(0, limit);
  } catch (error) {
    console.error('Error loading exercise history:', error);
    return [];
  }
};

/**
 * Log a completed set with enhanced data
 * @param {string} workoutKey - Workout identifier
 * @param {string} exerciseName - Exercise name
 * @param {number} setNumber - Set number
 * @param {number} weight - Weight used
 * @param {number} reps - Reps completed
 * @param {number} rpe - Rate of Perceived Exertion (1-10)
 * @param {string} notes - Additional notes
 */
export const logEnhancedExerciseSet = (workoutKey, exerciseName, setNumber, weight, reps, rpe, notes = '') => {
  // Validate inputs
  if (!workoutKey || !exerciseName) {
    throw new Error('Workout key and exercise name are required');
  }

  if (typeof setNumber !== 'number' || setNumber < 1) {
    throw new Error('Set number must be a positive number');
  }

  if (typeof weight !== 'number' || weight < 0) {
    throw new Error('Weight must be a non-negative number');
  }

  if (typeof reps !== 'number' || reps < 0) {
    throw new Error('Reps must be a non-negative number');
  }

  if (typeof rpe !== 'number' || rpe < 1 || rpe > 10) {
    throw new Error('RPE must be between 1 and 10');
  }

  try {
    // Create exercise key
    const exerciseKey = `${workoutKey}_${exerciseName.replace(/\s+/g, '_')}`;
    
    // Get current history
    const history = getExerciseHistory(exerciseKey);
    
    // Create new entry (add sequence to guarantee unique ordering even within same millisecond)
    const sequence = _getNextSequence();
    const newEntry = {
      workoutKey,
      exerciseName,
      exerciseKey,
      setNumber,
      weight,
      reps,
      rpe,
      notes,
      volume: weight * reps,
      timestamp: new Date().toISOString(),
      sequence,
      date: new Date().toLocaleDateString()
    };

    // Add to history
    history.unshift(newEntry);
    
    // Save updated history
    saveExerciseHistory(exerciseKey, history);
    
    // Update progression data
    updateProgressionData(exerciseKey, newEntry);
    
  } catch (error) {
    console.error('Error logging enhanced exercise set:', error);
    throw error;
  }
};

/**
 * Save exercise history to localStorage
 * @param {string} exerciseKey - Exercise identifier
 * @param {Array} history - Updated history array
 */
const saveExerciseHistory = (exerciseKey, history) => {
  try {
    const allHistory = getAllExerciseHistory();
    allHistory[exerciseKey] = history;
    localStorage.setItem(pKey(STORAGE_KEYS.EXERCISE_HISTORY), JSON.stringify(allHistory));
  } catch (error) {
    console.error('Error saving exercise history:', error);
  }
};

/**
 * Get all exercise history
 * @returns {Object} Object with all exercise histories
 */
const getAllExerciseHistory = () => {
  try {
    const historyData = localStorage.getItem(pKey(STORAGE_KEYS.EXERCISE_HISTORY));
    return historyData ? JSON.parse(historyData) : {};
  } catch (error) {
    console.error('Error loading all exercise history:', error);
    return {};
  }
};

/**
 * Update progression data for an exercise
 * @param {string} exerciseKey - Exercise identifier
 * @param {Object} newEntry - New performance entry
 */
const updateProgressionData = (exerciseKey, newEntry) => {
  try {
    const progressionData = getProgressionData();
    
    if (!progressionData[exerciseKey]) {
      progressionData[exerciseKey] = {
        exerciseKey,
        currentParameters: {
          weight: newEntry.weight,
          reps: newEntry.reps,
          rpe: newEntry.rpe
        },
        history: [],
        progression: 'maintain',
        lastProgressionDate: new Date().toISOString(),
        progressionStreak: 0
      };
    }

    const exerciseData = progressionData[exerciseKey];
    
    // Add to history
    exerciseData.history.push({
      date: newEntry.date,
      weight: newEntry.weight,
      reps: newEntry.reps,
      rpe: newEntry.rpe,
      volume: newEntry.volume
    });

    // Calculate progression suggestions
    const suggestion = calculateProgressionSuggestion(exerciseData);
    exerciseData.progression = suggestion.type;
    exerciseData.nextParameters = suggestion.nextParameters;
    exerciseData.reason = suggestion.reason;

    // Update current parameters if progression occurred
    if (suggestion.type !== 'maintain') {
      exerciseData.currentParameters = suggestion.nextParameters;
      exerciseData.lastProgressionDate = new Date().toISOString();
      exerciseData.progressionStreak++;
    } else {
      exerciseData.progressionStreak = 0;
    }

    // Keep only last 20 entries in history
    if (exerciseData.history.length > 20) {
      exerciseData.history = exerciseData.history.slice(-20);
    }

    localStorage.setItem(pKey(STORAGE_KEYS.PROGRESSION_DATA), JSON.stringify(progressionData));
  } catch (error) {
    console.error('Error updating progression data:', error);
  }
};

/**
 * Get progression data for all exercises
 * @returns {Object} Progression data object
 */
export const getProgressionData = () => {
  try {
    const data = localStorage.getItem(pKey(STORAGE_KEYS.PROGRESSION_DATA));
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('Error loading progression data:', error);
    return {};
  }
};

/**
 * Calculate progression suggestion for an exercise
 * @param {Object} exerciseData - Exercise progression data
 * @returns {Object} Progression suggestion
 */
const calculateProgressionSuggestion = (exerciseData) => {
  const history = exerciseData.history;
  if (history.length === 0) {
    return { type: 'maintain', nextParameters: exerciseData.currentParameters, reason: 'No history available' };
  }

  const latestEntry = history[history.length - 1];
  const currentParams = exerciseData.currentParameters;
  
  // Check for deload suggestion (high RPE)
  if (latestEntry.rpe >= 9) {
    return {
      type: 'deload',
      nextParameters: {
        weight: currentParams.weight * 0.9,
        reps: currentParams.reps,
        rpe: 6
      },
      reason: 'High RPE detected - consider reducing weight'
    };
  }

  // Check for weight progression
  const parseReps = (reps) => {
    if (typeof reps === 'string') {
      const repMatch = reps.match(/(\d+)-(\d+)/);
      if (repMatch) {
        return parseInt(repMatch[2]); // Use the higher end of the range
      } else {
        return parseInt(reps) || 0;
      }
    } else if (typeof reps === 'number') {
      return reps;
    }
    return 0;
  };

  if (latestEntry.rpe <= 7 && latestEntry.reps >= parseReps(currentParams.reps)) {
    const weightIncrease = Math.max(
      PROGRESSION_RULES.MIN_WEIGHT_INCREMENT,
      Math.round(currentParams.weight * PROGRESSION_RULES.WEIGHT_INCREASE_PERCENT * 2) / 2
    );
    
    const newWeight = Math.min(
      currentParams.weight + weightIncrease,
      currentParams.weight + PROGRESSION_RULES.MAX_WEIGHT_INCREMENT
    );

    return {
      type: 'weight',
      nextParameters: {
        weight: newWeight,
        reps: currentParams.reps,
        rpe: Math.min(7, latestEntry.rpe + 1)
      },
      reason: 'Good performance - increase weight'
    };
  }

  // Check for rep progression (if weight progression stalled)
  if (latestEntry.rpe <= 6 && latestEntry.weight === currentParams.weight) {
    const maxReps = parseReps(currentParams.reps);
    
    if (latestEntry.reps >= maxReps) {
      return {
        type: 'reps',
        nextParameters: {
          weight: currentParams.weight,
          reps: `${maxReps + 2}-${maxReps + 4}`,
          rpe: latestEntry.rpe
        },
        reason: 'Maintain weight, increase reps'
      };
    }
  }

  return {
    type: 'maintain',
    nextParameters: currentParams,
    reason: 'Maintain current parameters'
  };
};

/**
 * Get progression suggestions for all exercises
 * @returns {Array} Array of progression suggestions
 */
export const getAllProgressionSuggestions = () => {
  const progressionData = getProgressionData();
  const suggestions = [];

  Object.values(progressionData).forEach(exerciseData => {
    const suggestion = calculateProgressionSuggestion(exerciseData);
    suggestions.push({
      exerciseKey: exerciseData.exerciseKey,
      exerciseName: exerciseData.exerciseKey.split('_').slice(1).join(' '),
      currentParameters: exerciseData.currentParameters,
      suggestion,
      lastWorkout: exerciseData.history[exerciseData.history.length - 1]
    });
  });

  return suggestions;
};

/**
 * Get performance trends for an exercise
 * @param {string} exerciseKey - Exercise identifier
 * @param {number} daysBack - Number of days to look back
 * @returns {Object} Performance trend data
 */
export const getExerciseTrends = (exerciseKey, daysBack = 30) => {
  const history = getExerciseHistory(exerciseKey);
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysBack);

  const relevantHistory = history.filter(entry => 
    new Date(entry.timestamp) >= cutoffDate
  ).sort((a, b) => {
    const timeDiff = new Date(a.timestamp) - new Date(b.timestamp);
    if (timeDiff !== 0) return timeDiff;
    // Use sequence as tiebreaker for entries with the same timestamp
    return (a.sequence || 0) - (b.sequence || 0);
  });

  if (relevantHistory.length === 0) {
    return {
      hasData: false,
      message: 'No data available for this period'
    };
  }

  // Calculate trends
  const weights = relevantHistory.map(entry => entry.weight);
  const volumes = relevantHistory.map(entry => entry.volume);
  const rpes = relevantHistory.map(entry => entry.rpe);

  const weightTrend = calculateTrend(weights);
  const volumeTrend = calculateTrend(volumes);
  const rpeTrend = calculateTrend(rpes);

  return {
    hasData: true,
    data: relevantHistory,
    trends: {
      weight: {
        current: weights[weights.length - 1],
        peak: Math.max(...weights),
        trend: weightTrend,
        change: weights.length > 1 ? weights[weights.length - 1] - weights[0] : 0
      },
      volume: {
        current: volumes[volumes.length - 1],
        peak: Math.max(...volumes),
        trend: volumeTrend,
        change: volumes.length > 1 ? volumes[volumes.length - 1] - volumes[0] : 0
      },
      rpe: {
        current: rpes[rpes.length - 1],
        average: rpes.reduce((sum, rpe) => sum + rpe, 0) / rpes.length,
        trend: rpeTrend,
        change: rpes.length > 1 ? rpes[rpes.length - 1] - rpes[0] : 0
      }
    }
  };
};

/**
 * Calculate trend direction for a series of numbers
 * @param {Array} values - Array of numeric values
 * @returns {string} Trend direction ('up', 'down', 'stable')
 */
const calculateTrend = (values) => {
  if (values.length < 2) return 'stable';

  const n = values.length;
  const x = Array.from({ length: n }, (_, i) => i);
  const y = values;

  // Calculate linear regression slope
  const sumX = x.reduce((sum, val) => sum + val, 0);
  const sumY = y.reduce((sum, val) => sum + val, 0);
  const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
  const sumXX = x.reduce((sum, val) => sum + val * val, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);

  // Determine trend based on slope
  const threshold = 0.1; // Minimum slope to consider a trend
  if (slope > threshold) return 'up';
  if (slope < -threshold) return 'down';
  return 'stable';
};

/**
 * Get volume summary by muscle group
 * @param {string} muscleGroup - Muscle group name
 * @param {number} weeksBack - Number of weeks to look back
 * @returns {Object} Volume summary data
 */
/**
 * Read session history directly from localStorage (avoids circular import with workoutSessionManager)
 */
const getSessionHistoryDirect = () => {
  try {
    const historyData = localStorage.getItem(pKey(STORAGE_KEYS.SESSION_HISTORY));
    const history = historyData ? JSON.parse(historyData) : [];
    return history.sort((a, b) => new Date(b.startTime) - new Date(a.startTime)).slice(0, 50);
  } catch {
    return [];
  }
};

export const getMuscleGroupVolumeSummary = (muscleGroup, weeksBack = 4) => {
  const history = getSessionHistoryDirect();
  const now = new Date();
  const weeksAgo = new Date(now.getTime() - (weeksBack * 7 * 24 * 60 * 60 * 1000));

  const relevantSessions = history.filter(session => 
    new Date(session.startTime) >= weeksAgo
  );

  // Map muscle groups to exercises (simplified mapping)
  // Partial-match keywords for each muscle group
  const muscleGroupKeywords = {
    chest: ['bench', 'press', 'fly', 'flye', 'dip', 'push'],
    back: ['row', 'pull-up', 'pullup', 'pullover', 'pull over', 'pull apart', 'face pull'],
    shoulders: ['overhead', 'lateral', 'arnold', 'butterfly', 'bent lateral', 'shoulder'],
    legs: ['squat', 'lunge', 'leg curl', 'calf', 'rdl', 'deadlift', 'leg raise'],
    arms: ['curl', 'extension', 'push-down', 'hammer', 'preacher', 'reverse curl']
  };

  const keywords = muscleGroupKeywords[muscleGroup] || [];

  // Get all logged exercise names from session history and filter by keyword
  const allSessions = getSessionHistoryDirect();
  const allExerciseNames = allSessions.flatMap(s =>
    (s.exercises || []).map(e => e.name).filter(Boolean)
  );
  const matchingNames = [...new Set(
    allExerciseNames.filter(name =>
      keywords.some(kw => name.toLowerCase().includes(kw.toLowerCase()))
    )
  )];

  const targetExercises = matchingNames;

  const weeklyData = {};
  
  // Initialize weekly buckets
  for (let i = 0; i < weeksBack; i++) {
    const weekStart = new Date(now.getTime() - (i * 7 * 24 * 60 * 60 * 1000));
    const weekEnd = new Date(weekStart.getTime() + (6 * 24 * 60 * 60 * 1000));
    weeklyData[i] = {
      week: i + 1,
      dateRange: `${weekStart.toLocaleDateString()} - ${weekEnd.toLocaleDateString()}`,
      volume: 0,
      workouts: 0,
      exercises: []
    };
  }

  relevantSessions.forEach(session => {
    const sessionDate = new Date(session.startTime);
    const weekIndex = Math.floor((now - sessionDate) / (7 * 24 * 60 * 60 * 1000));
    
    if (weekIndex >= 0 && weekIndex < weeksBack) {
      weeklyData[weekIndex].workouts++;
      
      // Calculate volume for target muscle group exercises
      if (session.exercises) {
        session.exercises.forEach(exercise => {
          const isTargetExercise = targetExercises.some(target => 
            exercise.name.toLowerCase().includes(target.toLowerCase())
          );
          
          if (isTargetExercise && exercise.setsData) {
            const exerciseVolume = exercise.setsData.reduce((sum, set) => {
              return sum + ((set.weight || 0) * (set.reps || 0));
            }, 0);
            
            weeklyData[weekIndex].volume += exerciseVolume;
            weeklyData[weekIndex].exercises.push({
              name: exercise.name,
              volume: exerciseVolume
            });
          }
        });
      }
    }
  });

  return Object.values(weeklyData);
};

/**
 * Clear all enhanced progress data (for testing or reset)
 */
export const clearEnhancedProgressData = () => {
  try {
    localStorage.removeItem(pKey(STORAGE_KEYS.EXERCISE_HISTORY));
    localStorage.removeItem(pKey(STORAGE_KEYS.PROGRESSION_DATA));
  } catch (error) {
    console.error('Error clearing enhanced progress data:', error);
  }
};