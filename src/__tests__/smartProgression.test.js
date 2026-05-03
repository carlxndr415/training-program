import { 
  startSession, 
  getActiveSession, 
  updateCurrentSet, 
  completeSession,
  getSessionHistory,
  getExerciseCompletion
} from '../utils/workoutSessionManager';

import { 
  logEnhancedExerciseSet, 
  getExerciseHistory, 
  getExerciseTrends,
  getAllProgressionSuggestions
} from '../utils/enhancedProgressTracker';

import { 
  getExerciseProgressionAnalysis, 
  getWeeklyProgressionSummary 
} from '../utils/progressionEngine';

import { workouts } from '../data/workouts';

// Mock audio utils
jest.mock('../utils/audioUtils', () => ({
  playLyreSound: jest.fn()
}));

describe('Smart Progression System', () => {
  beforeEach(() => {
    // Clear all localStorage before each test
    localStorage.clear();
  });

  describe('Workout Session Manager', () => {
    test('should start a new workout session', () => {
      const workoutKey = 'push1';
      const workoutData = workouts[workoutKey];
      
      const session = startSession(workoutKey, workoutData);
      
      expect(session).toBeDefined();
      expect(session.workoutKey).toBe(workoutKey);
      expect(session.exercises).toHaveLength(workoutData.exercises.length);
      expect(session.currentExerciseIndex).toBe(0);
      expect(session.currentSet).toBe(1);
      expect(session.isResting).toBe(false);
      expect(session.totalVolume).toBe(0);
    });

    test('should update current set with performance data', () => {
      const workoutKey = 'push1';
      const workoutData = workouts[workoutKey];
      
      startSession(workoutKey, workoutData);
      
      updateCurrentSet(50, 8, 7);
      
      const session = getActiveSession();
      expect(session.exercises[0].setsData[0].weight).toBe(50);
      expect(session.exercises[0].setsData[0].reps).toBe(8);
      expect(session.exercises[0].setsData[0].rpe).toBe(7);
      expect(session.exercises[0].setsData[0].completed).toBe(true);
      expect(session.totalVolume).toBe(400); // 50 * 8
    });

    test('should complete a session and save to history', () => {
      const workoutKey = 'push1';
      const workoutData = workouts[workoutKey];
      
      startSession(workoutKey, workoutData);
      
      // Complete a few sets
      updateCurrentSet(50, 8, 7);
      
      const completedSession = completeSession();
      
      expect(completedSession).toBeDefined();
      expect(completedSession.endTime).toBeDefined();
      expect(completedSession.totalVolume).toBe(400);
      
      const history = getSessionHistory();
      expect(history).toHaveLength(1);
      expect(history[0].workoutKey).toBe(workoutKey);
    });

    test('should track exercise completion percentage', () => {
      const workoutKey = 'push1';
      const workoutData = workouts[workoutKey];
      
      startSession(workoutKey, workoutData);
      
      const completion = getExerciseCompletion();
      expect(completion.total).toBe(workoutData.exercises.length);
      expect(completion.completed).toBe(0);
      expect(completion.percentage).toBe(0);
    });
  });

  describe('Enhanced Progress Tracker', () => {
    test('should log enhanced exercise sets', () => {
      const workoutKey = 'push1';
      const exerciseName = 'Slight Incline DB Bench Press';
      
      logEnhancedExerciseSet(workoutKey, exerciseName, 1, 50, 8, 7, 'Good set');
      
      const history = getExerciseHistory(`${workoutKey}_${exerciseName.replace(/\s+/g, '_')}`);
      expect(history).toHaveLength(1);
      expect(history[0].weight).toBe(50);
      expect(history[0].reps).toBe(8);
      expect(history[0].rpe).toBe(7);
      expect(history[0].volume).toBe(400);
      expect(history[0].notes).toBe('Good set');
    });

    test('should calculate exercise trends', () => {
      const workoutKey = 'push1';
      const exerciseName = 'Slight Incline DB Bench Press';
      const exerciseKey = `${workoutKey}_${exerciseName.replace(/\s+/g, '_')}`;
      
      // Log multiple sets over time
      logEnhancedExerciseSet(workoutKey, exerciseName, 1, 45, 8, 6, 'First set');
      logEnhancedExerciseSet(workoutKey, exerciseName, 2, 50, 8, 7, 'Second set');
      logEnhancedExerciseSet(workoutKey, exerciseName, 3, 55, 8, 8, 'Third set');
      
      const trends = getExerciseTrends(exerciseKey, 30);
      
      expect(trends.hasData).toBe(true);
      expect(trends.data).toHaveLength(3);
      expect(trends.trends.weight.current).toBe(55);
      expect(trends.trends.weight.peak).toBe(55);
      expect(trends.trends.volume.current).toBe(440);
      expect(trends.trends.rpe.average).toBe(7);
    });

    test('should generate progression suggestions', () => {
      const workoutKey = 'push1';
      const exerciseName = 'Slight Incline DB Bench Press';
      
      // Log a good performance (low RPE, hit rep target)
      logEnhancedExerciseSet(workoutKey, exerciseName, 1, 50, 10, 5, 'Excellent set');
      
      const suggestions = getAllProgressionSuggestions();
      
      expect(suggestions).toHaveLength(1);
      expect(suggestions[0].exerciseName).toBe(exerciseName);
      expect(suggestions[0].suggestion.type).toBe('weight');
      expect(suggestions[0].suggestion.reason).toContain('increase weight');
    });
  });

  describe('Progression Engine', () => {
    test('should analyze exercise progression', () => {
      const workoutKey = 'push1';
      const exerciseName = 'Slight Incline DB Bench Press';
      const exerciseKey = `${workoutKey}_${exerciseName.replace(/\s+/g, '_')}`;
      
      // Log several workouts showing progression
      logEnhancedExerciseSet(workoutKey, exerciseName, 1, 45, 8, 6, 'Week 1');
      logEnhancedExerciseSet(workoutKey, exerciseName, 1, 50, 8, 7, 'Week 2');
      logEnhancedExerciseSet(workoutKey, exerciseName, 1, 55, 8, 7, 'Week 3');
      
      const analysis = getExerciseProgressionAnalysis(exerciseKey, 'chest');
      
      expect(analysis.status).toBe('analyzed');
      expect(analysis.exerciseKey).toBe(exerciseKey);
      expect(analysis.metrics.totalWorkouts).toBe(3);
      expect(analysis.metrics.currentWeight).toBe(55);
      expect(analysis.metrics.peakWeight).toBe(55);
      expect(analysis.progressionAnalysis.pattern).toBe('progressing');
      expect(analysis.recommendations).toHaveLength(2); // Volume + progression recommendations
    });

    test('should detect stalled progression', () => {
      const workoutKey = 'push1';
      const exerciseName = 'Slight Incline DB Bench Press';
      const exerciseKey = `${workoutKey}_${exerciseName.replace(/\s+/g, '_')}`;
      
      // Log workouts with no progression
      logEnhancedExerciseSet(workoutKey, exerciseName, 1, 50, 6, 8, 'Stalled set 1');
      logEnhancedExerciseSet(workoutKey, exerciseName, 1, 50, 6, 8, 'Stalled set 2');
      logEnhancedExerciseSet(workoutKey, exerciseName, 1, 50, 6, 8, 'Stalled set 3');
      
      const analysis = getExerciseProgressionAnalysis(exerciseKey, 'chest');
      
      expect(analysis.progressionAnalysis.pattern).toBe('stalled');
      expect(analysis.recommendations.some(r => r.type === 'progression')).toBe(true);
    });

    test('should provide weekly progression summary', () => {
      const workoutKey = 'push1';
      const exerciseName = 'Slight Incline DB Bench Press';
      
      // Log workouts for multiple exercises
      logEnhancedExerciseSet(workoutKey, exerciseName, 1, 50, 8, 7, 'Good progress');
      logEnhancedExerciseSet(workoutKey, 'DB Overhead Press', 1, 35, 8, 6, 'Good progress');
      
      const summary = getWeeklyProgressionSummary(4);
      
      expect(summary.totalExercises).toBeGreaterThan(0);
      expect(summary.progressing).toBeGreaterThan(0);
      expect(summary.averageConsistency).toBeGreaterThan(0);
      expect(summary.totalVolume).toBeGreaterThan(0);
    });
  });

  describe('Integration Tests', () => {
    test('should complete a full workout with tracking', () => {
      const workoutKey = 'push1';
      const workoutData = workouts[workoutKey];
      
      // Start session
      const session = startSession(workoutKey, workoutData);
      expect(session).toBeDefined();
      
      // Complete first exercise
      updateCurrentSet(50, 8, 7);
      
      // Complete session
      const completedSession = completeSession();
      expect(completedSession.totalVolume).toBe(400);
      
      // Check history
      const history = getSessionHistory();
      expect(history).toHaveLength(1);
      expect(history[0].workoutKey).toBe(workoutKey);
      
      // Check exercise history
      const exerciseHistory = getExerciseHistory(`${workoutKey}_Slight_Incline_DB_Bench_Press`);
      expect(exerciseHistory).toHaveLength(1);
      expect(exerciseHistory[0].volume).toBe(400);
    });

    test('should provide personalized recommendations after multiple workouts', () => {
      const workoutKey = 'push1';
      const exerciseName = 'Slight Incline DB Bench Press';
      
      // Simulate 4 weeks of progressive overload
      for (let week = 1; week <= 4; week++) {
        const weight = 45 + (week * 5);
        logEnhancedExerciseSet(workoutKey, exerciseName, 1, weight, 8, 6 + week, `Week ${week}`);
      }
      
      const analysis = getExerciseProgressionAnalysis(`${workoutKey}_${exerciseName.replace(/\s+/g, '_')}`, 'chest');
      
      expect(analysis.status).toBe('analyzed');
      expect(analysis.metrics.totalWorkouts).toBe(4);
      expect(analysis.metrics.currentWeight).toBe(65);
      expect(analysis.progressionAnalysis.pattern).toBe('progressing');
      
      // Should have progression recommendations
      const progressionRecs = analysis.recommendations.filter(r => r.type === 'next_workout');
      expect(progressionRecs.length).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid workout data', () => {
      expect(() => {
        startSession('invalid_workout', {});
      }).toThrow();
    });

    test('should handle missing exercise history', () => {
      const analysis = getExerciseProgressionAnalysis('nonexistent_exercise', 'chest');
      
      expect(analysis.status).toBe('no_data');
      expect(analysis.recommendations).toHaveLength(1);
      expect(analysis.recommendations[0]).toContain('Complete at least 3 workouts');
    });

    test('should validate input parameters', () => {
      expect(() => {
        logEnhancedExerciseSet('', 'Test Exercise', 1, 50, 8, 7);
      }).toThrow('Workout key and exercise name are required');
      
      expect(() => {
        logEnhancedExerciseSet('test', 'Test Exercise', 1, -10, 8, 7);
      }).toThrow('Weight must be a non-negative number');
      
      expect(() => {
        logEnhancedExerciseSet('test', 'Test Exercise', 1, 50, 8, 15);
      }).toThrow('RPE must be between 1 and 10');
    });
  });
});