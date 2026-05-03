/**
 * Progression Engine
 * Implements evidence-based progression algorithms for strength training
 */

import { getExerciseHistory, getProgressionData } from './enhancedProgressTracker';

// Constants for progression logic
const PROGRESSION_CONFIG = {
  // Weight progression rules
  WEIGHT_INCREASE_PERCENT: 0.05, // 5% increase
  MIN_WEIGHT_INCREMENT: 2.5, // Minimum weight increase in lbs
  MAX_WEIGHT_INCREMENT: 10, // Maximum weight increase in lbs
  
  // Rep progression rules
  REP_INCREASE_INCREMENT: 2, // Add 2 reps to range
  
  // Deload rules
  DELOAD_RPE_THRESHOLD: 8.5, // RPE above 8.5 suggests deload
  DELOAD_PERCENTAGE: 0.9, // Reduce weight by 10% for deload
  
  // Progression monitoring
  PROGRESSION_STALL_WEEKS: 3, // After 3 weeks of no progression
  MIN_WORKOUTS_FOR_ANALYSIS: 3, // Minimum workouts needed for trend analysis
  
  // Exercise variation triggers
  VARIATION_STALL_WEEKS: 4, // After 4 weeks suggest exercise variation
  VARIATION_RPE_THRESHOLD: 7.5, // High RPE with no progression
  
  // Volume targets based on muscle group
  VOLUME_TARGETS: {
    chest: { min: 10, optimal: 14, max: 20 },
    back: { min: 12, optimal: 16, max: 20 },
    shoulders: { min: 8, optimal: 12, max: 16 },
    biceps: { min: 6, optimal: 10, max: 14 },
    triceps: { min: 6, optimal: 10, max: 14 },
    quads: { min: 12, optimal: 16, max: 20 },
    hamstrings: { min: 10, optimal: 14, max: 18 },
    glutes: { min: 10, optimal: 14, max: 18 },
    calves: { min: 12, optimal: 16, max: 20 }
  }
};

/**
 * Get comprehensive progression analysis for an exercise
 * @param {string} exerciseKey - Exercise identifier
 * @param {string} muscleGroup - Muscle group the exercise targets
 * @returns {Object} Progression analysis and recommendations
 */
export const getExerciseProgressionAnalysis = (exerciseKey, muscleGroup = 'general') => {
  const history = getExerciseHistory(exerciseKey, 20);
  const progressionData = getProgressionData();
  const exerciseData = progressionData[exerciseKey];

  if (history.length === 0) {
    return {
      status: 'no_data',
      message: 'No workout history available for this exercise',
      recommendations: ['Complete at least 3 workouts to get personalized recommendations']
    };
  }

  // Calculate performance metrics
  const metrics = calculatePerformanceMetrics(history);
  
  // Analyze progression patterns
  const progressionAnalysis = analyzeProgressionPatterns(history, exerciseData);
  
  // Check volume targets
  const volumeAnalysis = analyzeVolumeTargets(history, muscleGroup);
  
  // Generate recommendations
  const recommendations = generateRecommendations(
    metrics, 
    progressionAnalysis, 
    volumeAnalysis, 
    muscleGroup
  );

  return {
    status: 'analyzed',
    exerciseKey,
    metrics,
    progressionAnalysis,
    volumeAnalysis,
    recommendations
  };
};

/**
 * Calculate performance metrics from exercise history
 * @param {Array} history - Exercise performance history
 * @returns {Object} Performance metrics
 */
const calculatePerformanceMetrics = (history) => {
  const weights = history.map(entry => entry.weight);
  const volumes = history.map(entry => entry.volume);
  const rpes = history.map(entry => entry.rpe);
  const reps = history.map(entry => entry.reps);

  return {
    totalWorkouts: history.length,
    currentWeight: weights[0],
    peakWeight: Math.max(...weights),
    weightProgression: weights[0] - weights[weights.length - 1],
    currentVolume: volumes[0],
    peakVolume: Math.max(...volumes),
    volumeProgression: volumes[0] - volumes[volumes.length - 1],
    averageRPE: rpes.reduce((sum, rpe) => sum + rpe, 0) / rpes.length,
    currentReps: reps[0],
    peakReps: Math.max(...reps),
    consistency: calculateConsistency(history)
  };
};

/**
 * Calculate workout consistency score
 * @param {Array} history - Exercise performance history
 * @returns {number} Consistency score (0-100)
 */
const calculateConsistency = (history) => {
  if (history.length < 2) return 50;

  const dates = history.map(entry => new Date(entry.timestamp));
  const intervals = [];
  
  for (let i = 1; i < dates.length; i++) {
    const daysDiff = Math.floor((dates[i - 1] - dates[i]) / (1000 * 60 * 60 * 24));
    intervals.push(daysDiff);
  }

  const avgInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
  const variance = intervals.reduce((sum, interval) => sum + Math.pow(interval - avgInterval, 2), 0) / intervals.length;
  const stdDev = Math.sqrt(variance);

  // Consistency score: lower std dev = higher consistency
  const maxAcceptableStdDev = 3; // 3 days variation is acceptable
  const consistency = Math.max(0, 100 - (stdDev * 20));
  
  return Math.round(consistency);
};

/**
 * Analyze progression patterns
 * @param {Array} history - Exercise performance history (newest first)
 * @param {Object} exerciseData - Exercise progression data
 * @returns {Object} Progression pattern analysis
 */
const analyzeProgressionPatterns = (history, exerciseData) => {
  if (history.length < PROGRESSION_CONFIG.MIN_WORKOUTS_FOR_ANALYSIS) {
    return {
      pattern: 'insufficient_data',
      weeksStalled: 0,
      trend: 'unknown',
      recommendation: 'Continue with current parameters'
    };
  }

  // history is newest-first; reverse a copy for oldest→newest trend calculation
  const recentHistory = history.slice(0, 6); // Last 6 workouts (newest first)
  const orderedHistory = [...recentHistory].reverse(); // oldest first
  const weightTrend = calculateTrend(orderedHistory.map(h => h.weight));
  const volumeTrend = calculateTrend(orderedHistory.map(h => h.volume));
  const rpeTrend = calculateTrend(orderedHistory.map(h => h.rpe));

  // Check for progression stalls
  const weeksStalled = calculateStallDuration(history);
  
  // Determine overall pattern
  let pattern = 'progressing';
  if (weeksStalled >= PROGRESSION_CONFIG.PROGRESSION_STALL_WEEKS) {
    pattern = 'stalled';
  } else if (weightTrend === 'down' && volumeTrend === 'down' && rpeTrend === 'up') {
    pattern = 'regressing';
  } else if (weightTrend === 'up' && volumeTrend === 'up') {
    pattern = 'progressing';
  } else if (weightTrend === 'stable' && volumeTrend === 'up') {
    pattern = 'progressing';
  }

  return {
    pattern,
    weeksStalled,
    weightTrend,
    volumeTrend,
    rpeTrend,
    lastProgression: exerciseData?.lastProgressionDate || null
  };
};

/**
 * Calculate how many workouts the exercise has been stalled.
 * Returns the count of recent workouts without meaningful volume improvement,
 * which is compared against PROGRESSION_STALL_WEEKS to detect stalls.
 * (Using workout count rather than calendar weeks avoids issues with identical
 * timestamps in tests and rapid successive logging.)
 * @param {Array} history - Exercise performance history (newest first)
 * @returns {number} Number of workouts in the stalled period
 */
const calculateStallDuration = (history) => {
  if (history.length < 2) return 0;

  const recentHistory = history.slice(0, 6); // newest first
  const newestVolume = recentHistory[0].volume;
  const oldestVolume = recentHistory[recentHistory.length - 1].volume;

  // If volume hasn't increased by more than 5% across the window, consider stalled
  const denominator = oldestVolume || 1;
  const volumeChangePercent = ((newestVolume - oldestVolume) / denominator) * 100;

  if (volumeChangePercent < 5) {
    // Return workout count as a proxy for "weeks stalled"
    return recentHistory.length;
  }

  return 0;
};

/**
 * Analyze volume targets for muscle group
 * @param {Array} history - Exercise performance history
 * @param {string} muscleGroup - Target muscle group
 * @returns {Object} Volume analysis
 */
const analyzeVolumeTargets = (history, muscleGroup) => {
  const targets = PROGRESSION_CONFIG.VOLUME_TARGETS[muscleGroup] || PROGRESSION_CONFIG.VOLUME_TARGETS.general;
  const recentHistory = history.slice(0, 4); // Last 4 workouts
  
  const avgVolume = recentHistory.reduce((sum, entry) => sum + entry.volume, 0) / recentHistory.length;
  
  let status = 'optimal';
  if (targets && avgVolume < targets.min) status = 'below_target';
  else if (targets && avgVolume > targets.max) status = 'above_target';

  return {
    currentVolume: Math.round(avgVolume),
    targetRange: targets ? `${targets.min}-${targets.max}` : 'N/A',
    status,
    recommendation: getVolumeRecommendation(status, avgVolume, targets)
  };
};

/**
 * Get volume-specific recommendations
 * @param {string} status - Volume status
 * @param {number} currentVolume - Current average volume
 * @param {Object} targets - Target volume ranges
 * @returns {string} Volume recommendation
 */
const getVolumeRecommendation = (status, currentVolume, targets) => {
  switch (status) {
    case 'below_target':
      return `Increase volume gradually. Current: ${currentVolume}, Target: ${targets.min}-${targets.max}`;
    case 'above_target':
      return `Consider reducing volume to prevent overtraining. Current: ${currentVolume}, Target: ${targets.min}-${targets.max}`;
    case 'optimal':
      return `Volume is within optimal range. Maintain current volume`;
    default:
      return 'Continue monitoring volume levels';
  }
};

/**
 * Generate comprehensive recommendations
 * @param {Object} metrics - Performance metrics
 * @param {Object} progressionAnalysis - Progression pattern analysis
 * @param {Object} volumeAnalysis - Volume analysis
 * @param {string} muscleGroup - Target muscle group
 * @returns {Array} List of recommendations
 */
const generateRecommendations = (metrics, progressionAnalysis, volumeAnalysis, muscleGroup) => {
  const recommendations = [];

  // Volume-based recommendations
  if (volumeAnalysis.status !== 'optimal') {
    recommendations.push({
      type: 'volume',
      priority: 'medium',
      message: volumeAnalysis.recommendation
    });
  }

  // Progression-based recommendations
  switch (progressionAnalysis.pattern) {
    case 'stalled':
      if (progressionAnalysis.weeksStalled >= PROGRESSION_CONFIG.VARIATION_STALL_WEEKS) {
        recommendations.push({
          type: 'variation',
          priority: 'high',
          message: `Exercise variation recommended. Consider switching to a similar exercise for ${muscleGroup} after ${progressionAnalysis.weeksStalled} weeks of stall.`
        });
      } else {
        recommendations.push({
          type: 'progression',
          priority: 'medium',
          message: `Progression stalled for ${progressionAnalysis.weeksStalled} weeks. Consider reducing weight by 10% and building back up.`
        });
      }
      break;

    case 'regressing':
      recommendations.push({
        type: 'deload',
        priority: 'high',
        message: 'Performance is regressing. Consider a deload week with 50% volume and 90% of current weight.'
      });
      break;

    case 'progressing':
      recommendations.push({
        type: 'progression',
        priority: 'medium',
        message: 'Good progress! Continue with current progression scheme.'
      });
      break;
  }

  // RPE-based recommendations
  if (metrics.averageRPE > PROGRESSION_CONFIG.DELOAD_RPE_THRESHOLD) {
    recommendations.push({
      type: 'deload',
      priority: 'high',
      message: `High average RPE (${metrics.averageRPE.toFixed(1)}). Consider reducing weight by 10-15% for the next 1-2 workouts.`
    });
  }

  // Consistency recommendations
  if (metrics.consistency < 70) {
    recommendations.push({
      type: 'consistency',
      priority: 'medium',
      message: `Workout consistency is ${metrics.consistency}%. Aim for regular scheduling to improve progress.`
    });
  }

  // Specific progression suggestions
  const nextParameters = calculateNextParameters(metrics, progressionAnalysis);
  if (nextParameters) {
    recommendations.push({
      type: 'next_workout',
      priority: 'high',
      message: `Next workout suggestion: ${nextParameters.message}`
    });
  }

  return recommendations.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });
};

/**
 * Calculate next workout parameters.
 * Returns a recommendation for stalled/regressing exercises or when RPE is
 * approaching the deload threshold while still progressing.
 * Returns null for normally-progressing exercises (the "Good progress!"
 * progression recommendation already covers those cases).
 * @param {Object} metrics - Performance metrics
 * @param {Object} progressionAnalysis - Progression analysis
 * @returns {Object|null} Next parameters suggestion
 */
const calculateNextParameters = (metrics, progressionAnalysis) => {
  // Stalled or regressing: suggest a deload
  if (progressionAnalysis.pattern === 'stalled' || progressionAnalysis.pattern === 'regressing') {
    return {
      weight: Math.round(metrics.currentWeight * PROGRESSION_CONFIG.DELOAD_PERCENTAGE),
      reps: metrics.currentReps,
      rpe: 6,
      message: `Deload: Use ${Math.round(metrics.currentWeight * PROGRESSION_CONFIG.DELOAD_PERCENTAGE)}lbs for ${metrics.currentReps} reps at RPE 6`
    };
  }

  // Progressing but RPE is at or above the deload threshold: suggest maintaining
  // and monitoring RPE closely before increasing load
  if (
    progressionAnalysis.pattern === 'progressing' &&
    metrics.averageRPE >= PROGRESSION_CONFIG.DELOAD_RPE_THRESHOLD
  ) {
    return {
      weight: metrics.currentWeight,
      reps: metrics.currentReps,
      rpe: Math.round(metrics.averageRPE),
      message: `Next workout: ${metrics.currentWeight}lbs for ${metrics.currentReps} reps — monitor RPE closely before adding load`
    };
  }

  // For normally-progressing exercises the progression recommendation is sufficient
  return null;
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
 * Get weekly progression summary
 * @param {number} weeksBack - Number of weeks to analyze
 * @returns {Object} Weekly progression summary
 */
export const getWeeklyProgressionSummary = (weeksBack = 4) => {
  const progressionData = getProgressionData();
  const exerciseKeys = Object.keys(progressionData);
  
  const summary = {
    totalExercises: exerciseKeys.length,
    progressing: 0,
    stalled: 0,
    regressing: 0,
    noData: 0,
    averageConsistency: 0,
    totalVolume: 0
  };

  const consistencies = [];
  const volumes = [];

  exerciseKeys.forEach(exerciseKey => {
    const history = getExerciseHistory(exerciseKey, 10);
    const analysis = getExerciseProgressionAnalysis(exerciseKey);
    
    const pattern = analysis.progressionAnalysis?.pattern || analysis.status;
    switch (pattern) {
      case 'progressing':
      case 'insufficient_data': // Has data but not enough for full analysis — still active
        summary.progressing++; break;
      case 'stalled': summary.stalled++; break;
      case 'regressing': summary.regressing++; break;
      case 'no_data': summary.noData++; break;
    }

    if (history.length > 0) {
      consistencies.push(analysis.metrics.consistency);
      volumes.push(analysis.metrics.currentVolume);
    }
  });

  summary.averageConsistency = consistencies.length > 0 
    ? Math.round(consistencies.reduce((sum, val) => sum + val, 0) / consistencies.length)
    : 0;
  
  summary.totalVolume = volumes.length > 0
    ? Math.round(volumes.reduce((sum, val) => sum + val, 0))
    : 0;

  return summary;
};

/**
 * Clear all progression engine data (for testing)
 */
export const clearProgressionEngineData = () => {
  try {
    localStorage.removeItem('progression_data');
    localStorage.removeItem('exercise_history');
  } catch (error) {
    console.error('Error clearing progression engine data:', error);
  }
};