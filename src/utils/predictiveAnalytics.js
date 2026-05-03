/**
 * Predictive Analytics System
 * Provides advanced analytics, trend prediction, and performance forecasting
 */

import { getExerciseHistory, getExerciseTrends } from './enhancedProgressTracker';
import { getWeeklyProgressionSummary } from './progressionEngine';

// Prediction models configuration
const PREDICTION_CONFIG = {
  // Performance prediction
  PERFORMANCE_MODELS: {
    linear: 'linear',
    exponential: 'exponential',
    logarithmic: 'logarithmic',
    polynomial: 'polynomial'
  },
  
  // Trend analysis
  TREND_THRESHOLDS: {
    improving: 0.1,    // 10% improvement trend
    declining: -0.05,  // 5% decline trend
    stable: 0.02      // 2% variation = stable
  },
  
  // Plateau detection
  PLATEAU_CONFIG: {
    windowSize: 6,     // Look at last 6 data points
    threshold: 0.02,   // 2% change threshold
    duration: 3        // 3 weeks minimum
  },
  
  // Recovery prediction
  RECOVERY_MODELS: {
    sleepImpact: 0.15,    // Sleep quality impact on performance
    stressImpact: 0.20,   // Stress impact on performance
    nutritionImpact: 0.10 // Nutrition impact on performance
  }
};

// Predictive analytics class
export class PredictiveAnalytics {
  constructor() {
    this.models = new Map();
    this.predictions = new Map();
  }

  // Performance forecasting
  async forecastPerformance(exerciseName, weeksAhead = 4) {
    const history = getExerciseHistory(exerciseName, 20);
    
    if (history.length < 6) {
      return {
        status: 'insufficient_data',
        message: 'Need at least 6 data points for accurate prediction',
        forecast: null
      };
    }

    // Calculate trends
    const trends = this.calculateTrends(history);
    
    // Select best model
    const bestModel = this.selectBestModel(history, trends);
    
    // Generate forecast
    const forecast = this.generateForecast(history, bestModel, weeksAhead);
    
    // Calculate confidence
    const confidence = this.calculateConfidence(history, bestModel);
    
    const result = {
      exercise: exerciseName,
      model: bestModel.type,
      confidence: confidence,
      currentTrend: trends.overall,
      forecast: forecast,
      recommendations: this.generateRecommendations(forecast, trends, confidence)
    };

    this.predictions.set(exerciseName, result);
    return result;
  }

  // Plateau detection
  detectPlateaus(exerciseName, windowSize = 6) {
    const history = getExerciseHistory(exerciseName, windowSize * 2);
    
    if (history.length < windowSize) {
      return {
        status: 'insufficient_data',
        isPlateau: false,
        duration: 0,
        message: 'Need more data to detect plateaus'
      };
    }

    // Calculate rolling averages
    const rollingAverages = this.calculateRollingAverages(history, windowSize);
    
    // Check for minimal change
    const changes = this.calculateChanges(rollingAverages);
    const maxChange = Math.max(...changes.map(c => Math.abs(c)));
    
    // Determine if plateau
    const isPlateau = maxChange < PREDICTION_CONFIG.PLATEAU_CONFIG.threshold;
    const duration = isPlateau ? this.calculatePlateauDuration(changes) : 0;

    return {
      exercise: exerciseName,
      isPlateau,
      duration,
      maxChange: maxChange * 100, // Convert to percentage
      rollingAverages,
      recommendations: isPlateau ? this.getPlateauRecommendations() : []
    };
  }

  // Recovery optimization
  optimizeRecovery(workoutData, userMetrics = {}) {
    const { sleepHours = 7, stressLevel = 3, nutritionScore = 7 } = userMetrics;
    
    // Calculate recovery score
    const baseRecovery = this.calculateBaseRecovery(workoutData);
    const sleepImpact = (sleepHours - 7) * PREDICTION_CONFIG.RECOVERY_MODELS.sleepImpact;
    const stressImpact = (stressLevel - 5) * PREDICTION_CONFIG.RECOVERY_MODELS.stressImpact;
    const nutritionImpact = (nutritionScore - 7) * PREDICTION_CONFIG.RECOVERY_MODELS.nutritionImpact;
    
    const recoveryScore = Math.max(0, Math.min(100, baseRecovery + sleepImpact + stressImpact + nutritionImpact));
    
    return {
      recoveryScore,
      factors: {
        sleep: { score: sleepHours, impact: sleepImpact },
        stress: { score: stressLevel, impact: stressImpact },
        nutrition: { score: nutritionScore, impact: nutritionImpact }
      },
      recommendations: this.getRecoveryRecommendations(recoveryScore, userMetrics),
      nextWorkoutOptimal: recoveryScore > 70
    };
  }

  // Volume optimization
  optimizeVolume(muscleGroup, currentVolume, goal = 'hypertrophy') {
    const targets = this.getVolumeTargets(muscleGroup, goal);
    const currentLevel = this.assessVolumeLevel(currentVolume, targets);
    
    return {
      muscleGroup,
      currentVolume,
      optimalRange: targets,
      currentLevel,
      recommendations: this.getVolumeRecommendations(currentLevel, targets, currentVolume)
    };
  }

  // Overtraining detection
  detectOvertraining(userMetrics = {}) {
    const {
      workoutFrequency = 0,
      sleepQuality = 7,
      stressLevel = 3,
      performanceTrend = 0,
      rpeTrend = 0
    } = userMetrics;

    // Calculate overtraining score (0-100, higher = more overtrained)
    let score = 0;
    
    // Frequency impact
    if (workoutFrequency > 6) score += 20;
    else if (workoutFrequency > 4) score += 10;
    
    // Sleep impact
    if (sleepQuality < 6) score += 25;
    else if (sleepQuality < 7) score += 10;
    
    // Stress impact
    if (stressLevel > 7) score += 20;
    else if (stressLevel > 5) score += 10;
    
    // Performance impact
    if (performanceTrend < -0.1) score += 20;
    else if (performanceTrend < -0.05) score += 10;
    
    // RPE impact
    if (rpeTrend > 0.2) score += 15;
    else if (rpeTrend > 0.1) score += 5;

    const riskLevel = this.getOvertrainingRiskLevel(score);
    
    return {
      score,
      riskLevel,
      indicators: {
        frequency: workoutFrequency,
        sleep: sleepQuality,
        stress: stressLevel,
        performance: performanceTrend,
        rpe: rpeTrend
      },
      recommendations: this.getOvertrainingRecommendations(riskLevel, userMetrics)
    };
  }

  // Personalized workout recommendations
  generatePersonalizedRecommendations(userProfile = {}) {
    const {
      trainingAge = 1,
      goals = 'hypertrophy',
      availableTime = 60,
      equipment = ['dumbbells', 'bench']
    } = userProfile;

    const progressionSummary = getWeeklyProgressionSummary(4);
    const exerciseHistory = this.getAllExerciseHistory();
    
    // Analyze current state
    const currentState = this.analyzeCurrentState(progressionSummary, exerciseHistory);
    
    // Generate recommendations
    const recommendations = {
      workoutSplit: this.recommendWorkoutSplit(trainingAge, goals, availableTime),
      exerciseSelection: this.recommendExercises(currentState, goals, equipment),
      progressionStrategy: this.recommendProgressionStrategy(trainingAge, currentState),
      volumeRecommendations: this.recommendVolume(currentState, goals),
      deloadTiming: this.predictDeloadTiming(progressionSummary)
    };

    return recommendations;
  }

  // Helper methods for calculations

  calculateTrends(history) {
    if (history.length < 2) return { overall: 0, recent: 0, volatility: 0 };

    // Calculate linear trend
    const n = history.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const y = history.map(h => h.volume);
    
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
    const sumXX = x.reduce((sum, val) => sum + val * val, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    
    // Calculate recent trend (last 3 data points)
    const recentHistory = history.slice(-3);
    const recentTrend = this.calculateSimpleTrend(recentHistory);
    
    // Calculate volatility
    const volatility = this.calculateVolatility(history);

    return {
      overall: slope,
      recent: recentTrend,
      volatility: volatility
    };
  }

  calculateSimpleTrend(data) {
    if (data.length < 2) return 0;
    const first = data[0].volume;
    const last = data[data.length - 1].volume;
    return (last - first) / first;
  }

  calculateVolatility(history) {
    const volumes = history.map(h => h.volume);
    const mean = volumes.reduce((a, b) => a + b, 0) / volumes.length;
    const variance = volumes.reduce((sum, vol) => sum + Math.pow(vol - mean, 2), 0) / volumes.length;
    return Math.sqrt(variance) / mean;
  }

  selectBestModel(history, trends) {
    // Simple model selection based on data characteristics
    const volatility = trends.volatility;
    const overallTrend = trends.overall;
    
    if (volatility < 0.1) {
      // Low volatility - use linear model
      return { type: PREDICTION_CONFIG.PERFORMANCE_MODELS.linear, params: { slope: overallTrend } };
    } else if (overallTrend > 0.1) {
      // Strong positive trend - use exponential
      return { type: PREDICTION_CONFIG.PERFORMANCE_MODELS.exponential, params: { growthRate: overallTrend } };
    } else {
      // Use polynomial for complex patterns
      return { type: PREDICTION_CONFIG.PERFORMANCE_MODELS.polynomial, params: { degree: 2 } };
    }
  }

  generateForecast(history, model, weeksAhead) {
    const lastVolume = history[0].volume;
    const forecasts = [];
    
    for (let i = 1; i <= weeksAhead; i++) {
      let forecastVolume;
      
      switch (model.type) {
        case PREDICTION_CONFIG.PERFORMANCE_MODELS.linear:
          forecastVolume = lastVolume + (model.params.slope * i);
          break;
        case PREDICTION_CONFIG.PERFORMANCE_MODELS.exponential:
          forecastVolume = lastVolume * Math.pow(1 + model.params.growthRate, i);
          break;
        case PREDICTION_CONFIG.PERFORMANCE_MODELS.polynomial:
          forecastVolume = lastVolume * Math.pow(1 + (model.params.degree * 0.05), i);
          break;
        default:
          forecastVolume = lastVolume;
      }
      
      forecasts.push({
        week: i,
        predictedVolume: Math.max(0, forecastVolume),
        confidence: this.calculateWeekConfidence(i)
      });
    }
    
    return forecasts;
  }

  calculateConfidence(history, model) {
    // Simple confidence calculation based on data quality
    const dataPoints = history.length;
    const volatility = this.calculateVolatility(history);
    
    let confidence = 0.8; // Base confidence
    
    // Adjust based on data points
    if (dataPoints >= 10) confidence += 0.1;
    else if (dataPoints >= 6) confidence += 0.05;
    else confidence -= 0.1;
    
    // Adjust based on volatility
    if (volatility < 0.05) confidence += 0.1;
    else if (volatility > 0.2) confidence -= 0.2;
    
    return Math.max(0, Math.min(1, confidence));
  }

  calculateWeekConfidence(week) {
    // Confidence decreases with time
    return Math.max(0.3, 1 - (week * 0.1));
  }

  calculateRollingAverages(history, windowSize) {
    const averages = [];
    
    for (let i = 0; i <= history.length - windowSize; i++) {
      const window = history.slice(i, i + windowSize);
      const avg = window.reduce((sum, h) => sum + h.volume, 0) / windowSize;
      averages.push(avg);
    }
    
    return averages;
  }

  calculateChanges(values) {
    const changes = [];
    for (let i = 1; i < values.length; i++) {
      changes.push((values[i] - values[i - 1]) / values[i - 1]);
    }
    return changes;
  }

  calculatePlateauDuration(changes) {
    let duration = 0;
    for (const change of changes) {
      if (Math.abs(change) < PREDICTION_CONFIG.PLATEAU_CONFIG.threshold) {
        duration++;
      } else {
        break;
      }
    }
    return duration;
  }

  calculateBaseRecovery(workoutData) {
    // Base recovery calculation from workout intensity and volume
    const intensity = workoutData.averageRPE || 7;
    const volume = workoutData.totalVolume || 0;
    
    // Higher intensity and volume = lower recovery score
    let score = 100 - (intensity * 5) - (volume / 1000);
    return Math.max(0, Math.min(100, score));
  }

  getVolumeTargets(muscleGroup, goal) {
    const baseTargets = {
      chest: { min: 10, optimal: 14, max: 20 },
      back: { min: 12, optimal: 16, max: 20 },
      shoulders: { min: 8, optimal: 12, max: 16 },
      biceps: { min: 6, optimal: 10, max: 14 },
      triceps: { min: 6, optimal: 10, max: 14 },
      quads: { min: 12, optimal: 16, max: 20 },
      hamstrings: { min: 10, optimal: 14, max: 18 },
      glutes: { min: 10, optimal: 14, max: 18 }
    };

    const targets = baseTargets[muscleGroup] || baseTargets.chest;
    
    // Adjust based on goal
    if (goal === 'strength') {
      targets.optimal = Math.floor(targets.optimal * 0.8);
      targets.max = Math.floor(targets.max * 0.9);
    } else if (goal === 'endurance') {
      targets.optimal = Math.floor(targets.optimal * 1.2);
      targets.max = Math.floor(targets.max * 1.1);
    }
    
    return targets;
  }

  assessVolumeLevel(currentVolume, targets) {
    if (currentVolume < targets.min) return 'below';
    if (currentVolume <= targets.optimal) return 'optimal';
    if (currentVolume <= targets.max) return 'high';
    return 'excessive';
  }

  getOvertrainingRiskLevel(score) {
    if (score >= 70) return 'high';
    if (score >= 40) return 'moderate';
    if (score >= 20) return 'low';
    return 'minimal';
  }

  // Recommendation generation methods

  generateRecommendations(forecast, trends, confidence) {
    const recommendations = [];
    
    if (confidence < 0.5) {
      recommendations.push('Low confidence in prediction. Collect more data points.');
    }
    
    if (trends.overall < -0.05) {
      recommendations.push('Declining trend detected. Consider deloading or technique review.');
    }
    
    if (trends.volatility > 0.2) {
      recommendations.push('High performance variability. Focus on consistency.');
    }
    
    const lastForecast = forecast[forecast.length - 1];
    if (lastForecast.predictedVolume < forecast[0].predictedVolume) {
      recommendations.push('Predicted decline in performance. Monitor recovery and adjust training.');
    }
    
    return recommendations;
  }

  getPlateauRecommendations() {
    return [
      'Consider exercise variation to break through plateau',
      'Implement deload week to allow supercompensation',
      'Review nutrition and sleep quality',
      'Focus on technique improvements',
      'Consider changing rep ranges or tempo'
    ];
  }

  getRecoveryRecommendations(recoveryScore, userMetrics) {
    const recommendations = [];
    
    if (recoveryScore < 50) {
      recommendations.push('Poor recovery detected. Consider reducing training volume.');
    }
    
    if (userMetrics.sleepHours < 7) {
      recommendations.push('Increase sleep duration to 7-9 hours per night.');
    }
    
    if (userMetrics.stressLevel > 5) {
      recommendations.push('Implement stress management techniques.');
    }
    
    if (userMetrics.nutritionScore < 7) {
      recommendations.push('Improve nutrition quality and timing.');
    }
    
    return recommendations;
  }

  getVolumeRecommendations(currentLevel, targets, currentVolume) {
    switch (currentLevel) {
      case 'below':
        return [`Increase volume to ${targets.optimal} sets per week`, 'Focus on progressive overload'];
      case 'optimal':
        return ['Maintain current volume', 'Focus on exercise variation and technique'];
      case 'high':
        return ['Consider reducing volume slightly', 'Monitor for signs of overtraining'];
      case 'excessive':
        return [`Reduce volume to ${targets.optimal} sets per week`, 'Implement deload week'];
      default:
        return ['Monitor progress and adjust as needed'];
    }
  }

  getOvertrainingRecommendations(riskLevel, userMetrics) {
    const recommendations = [];
    
    switch (riskLevel) {
      case 'high':
        recommendations.push('High overtraining risk. Immediate deload required.');
        recommendations.push('Reduce training frequency and intensity.');
        break;
      case 'moderate':
        recommendations.push('Moderate overtraining risk. Consider reducing volume.');
        recommendations.push('Focus on recovery strategies.');
        break;
      case 'low':
        recommendations.push('Low overtraining risk. Monitor for symptoms.');
        break;
      default:
        recommendations.push('Minimal overtraining risk. Continue current program.');
    }
    
    return recommendations;
  }

  recommendWorkoutSplit(trainingAge, goals, availableTime) {
    if (trainingAge <= 1) {
      return 'Full Body 3x per week';
    } else if (availableTime < 45) {
      return 'Upper/Lower 4x per week';
    } else if (goals === 'hypertrophy') {
      return 'Push/Pull/Legs 6x per week';
    } else {
      return 'Upper/Lower 4x per week';
    }
  }

  recommendExercises(currentState, goals, equipment) {
    // Logic to recommend specific exercises based on current state
    return [
      'Focus on compound movements for overall development',
      'Include isolation exercises for lagging muscle groups',
      'Use equipment available to maximize variety'
    ];
  }

  recommendProgressionStrategy(trainingAge, currentState) {
    if (trainingAge <= 1) {
      return 'Linear progression with 2.5-5lb increases';
    } else if (currentState.progressing) {
      return 'Periodized progression with planned deloads';
    } else {
      return 'Exercise variation and technique focus';
    }
  }

  recommendVolume(currentState, goals) {
    return `Current volume appears ${currentState.volumeLevel}. ${goals === 'strength' ? 'Focus on intensity over volume' : 'Maintain optimal volume range'}.`;
  }

  predictDeloadTiming(progressionSummary) {
    const stalledCount = progressionSummary.stalled;
    const totalExercises = progressionSummary.totalExercises;
    
    const stallPercentage = totalExercises > 0 ? stalledCount / totalExercises : 0;
    
    if (stallPercentage > 0.5) {
      return 'Deload recommended next week';
    } else if (stallPercentage > 0.3) {
      return 'Consider deload in 2-3 weeks';
    } else {
      return 'Continue current program';
    }
  }

  analyzeCurrentState(progressionSummary, exerciseHistory) {
    return {
      progressing: progressionSummary.progressing,
      stalled: progressionSummary.stalled,
      regressing: progressionSummary.regressing,
      totalVolume: progressionSummary.totalVolume,
      volumeLevel: progressionSummary.totalVolume > 10000 ? 'high' : 'moderate'
    };
  }

  getAllExerciseHistory() {
    // Get all exercise history for analysis
    const allHistory = {};
    // This would integrate with your existing data sources
    return allHistory;
  }
}

// Create global instance
export const predictiveAnalytics = new PredictiveAnalytics();

// Export default
export default {
  PREDICTION_CONFIG,
  PredictiveAnalytics,
  predictiveAnalytics
};