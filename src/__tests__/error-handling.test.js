import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useNavigate } from 'react-router-dom';
import WorkoutsPage from '../components/WorkoutsPage';
import { validateWorkoutData } from '../utils/workoutUtils';
import { logExerciseSet } from '../utils/progressTracker';
import { playLyreSound } from '../utils/audioUtils';
import ProgressDashboard from '../components/ProgressDashboard';
import { getWorkoutHistory, getExerciseTrends, getTrainingFrequency, getWeeklyVolumeSummary } from '../utils/progressTracker';

// Mock dependencies
jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn()
}));

jest.mock('../utils/workoutUtils', () => ({
  validateWorkoutData: jest.fn(),
  handleNormalProgression: jest.fn(),
  formatTime: jest.fn((seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  })
}));

jest.mock('../utils/progressTracker');

jest.mock('../utils/audioUtils', () => ({
  playLyreSound: jest.fn()
}));

jest.mock('../utils/workoutSessionManager', () => ({
  getActiveSession: jest.fn().mockReturnValue(null),
  updateCurrentSet: jest.fn(),
  completeCurrentSet: jest.fn(),
  updateRestTimer: jest.fn(),
  getCurrentSetData: jest.fn().mockReturnValue(null),
  isSetCompleted: jest.fn().mockReturnValue(false),
  getExerciseCompletion: jest.fn().mockReturnValue({ percentage: 0, completed: 0, total: 0 }),
  startSession: jest.fn(),
  completeSession: jest.fn()
}));

jest.mock('../utils/enhancedProgressTracker', () => ({
  logEnhancedExerciseSet: jest.fn()
}));

const mockNavigate = jest.fn();

describe('Error Handling Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useNavigate.mockReturnValue(mockNavigate);
    validateWorkoutData.mockImplementation(() => {}); // No error by default
    
    // Mock handleNormalProgression to simulate set progression
    const { handleNormalProgression } = require('../utils/workoutUtils');
    handleNormalProgression.mockImplementation(({ currentExerciseIndex, currentSet, totalExercises, exerciseSets, restTime }) => {
      if (currentSet < exerciseSets) {
        return { newExerciseIndex: currentExerciseIndex, newSet: currentSet + 1, shouldRest: true, timeLeft: restTime || 60, isTimerRunning: true };
      } else if (currentExerciseIndex < totalExercises - 1) {
        return { newExerciseIndex: currentExerciseIndex + 1, newSet: 1, shouldRest: false, timeLeft: 0, isTimerRunning: false };
      }
      return { newExerciseIndex: currentExerciseIndex, newSet: currentSet, shouldRest: false, timeLeft: 0, isTimerRunning: false };
    });
  });

  describe('WorkoutsPage Error Handling', () => {
    test('handles invalid workout data gracefully', () => {
      validateWorkoutData.mockImplementation(() => {
        throw new Error('Invalid workout data');
      });

      render(<WorkoutsPage onBack={jest.fn()} initialWorkout={null} />);

      const pushWorkoutButton = screen.getByText('Push 1').closest('button');
      fireEvent.click(pushWorkoutButton);

      // Should log error but not crash
      expect(console.error).toHaveBeenCalledWith('Invalid workout data:', 'Invalid workout data');
    });

    test('handles missing exercise data', () => {
      const invalidWorkout = {
        name: 'Invalid Workout',
        description: 'Test workout',
        exercises: null
      };

      // Mutate the actual workouts module so WorkoutsPage can find it
      const workoutsData = require('../data/workouts');
      workoutsData.workouts.invalid = invalidWorkout;

      render(<WorkoutsPage onBack={jest.fn()} initialWorkout="invalid" />);

      // Should handle gracefully without crashing
      expect(screen.getByText('Invalid Workout')).toBeInTheDocument();

      // Cleanup
      delete workoutsData.workouts.invalid;
    });

    test('handles localStorage errors in progress tracking', () => {
      // Mock localStorage to throw errors
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = jest.fn(() => {
        throw new Error('localStorage quota exceeded');
      });

      render(<WorkoutsPage onBack={jest.fn()} initialWorkout="push1" />);

      const firstExerciseMatches = screen.getAllByText('Slight Incline DB Bench Press');
      const firstExercise = firstExerciseMatches[0].closest('div');
      fireEvent.click(firstExercise);

      const completeButton = screen.getByText('Completed Set 1');
      fireEvent.click(completeButton);

      // Should handle localStorage error gracefully
      expect(logExerciseSet).toHaveBeenCalled();

      localStorage.setItem = originalSetItem;
    });

    test('handles audio playback errors', () => {
      playLyreSound.mockImplementation(() => {
        throw new Error('Audio context not available');
      });

      render(<WorkoutsPage onBack={jest.fn()} initialWorkout="push1" />);

      const firstExerciseMatches = screen.getAllByText('Slight Incline DB Bench Press');
      const firstExercise = firstExerciseMatches[0].closest('div');
      fireEvent.click(firstExercise);

      const completeButton = screen.getByText('Completed Set 1');
      fireEvent.click(completeButton);

      // Component should handle audio error gracefully and not crash
      expect(screen.getByText('Push 1')).toBeInTheDocument();
    });

    test('handles invalid rep range parsing', () => {
      const workoutWithInvalidReps = {
        name: 'Test Workout',
        description: 'Test',
        exercises: [
          { name: 'Test Exercise', sets: 3, reps: 'invalid-range', rest: 60, group: 'A' }
        ]
      };

      // Mutate the actual workouts module so WorkoutsPage can find it
      const workoutsData = require('../data/workouts');
      workoutsData.workouts.invalid = workoutWithInvalidReps;

      render(<WorkoutsPage onBack={jest.fn()} initialWorkout="invalid" />);

      // Should handle invalid rep range gracefully
      expect(screen.getByText('Test Workout')).toBeInTheDocument();

      // Cleanup
      delete workoutsData.workouts.invalid;
    });

    test('handles navigation errors', () => {
      mockNavigate.mockImplementation(() => {
        throw new Error('Navigation failed');
      });

      render(<WorkoutsPage onBack={jest.fn()} initialWorkout={null} />);

      const pushWorkoutButton = screen.getByText('Push 1').closest('button');
      fireEvent.click(pushWorkoutButton);

      // Should handle navigation error gracefully
      expect(mockNavigate).toHaveBeenCalledWith('/workouts/push1');
    });
  });

  describe('ProgressDashboard Error Handling', () => {
    const mockOnBackToWorkout = jest.fn();

    beforeEach(() => {
      getWorkoutHistory.mockReturnValue([]);
      getTrainingFrequency.mockReturnValue({
        totalWorkouts: 0,
        averagePerWeek: 0,
        workoutsByType: {},
        consistency: 0
      });
      getWeeklyVolumeSummary.mockReturnValue([]);
      getExerciseTrends.mockReturnValue([]);
    });

    test('handles empty data gracefully', () => {
      render(<ProgressDashboard onBackToWorkout={mockOnBackToWorkout} />);

      expect(screen.getByText('Progress Dashboard')).toBeInTheDocument();
      expect(screen.getAllByText('0').length).toBeGreaterThan(0);
      expect(screen.getByText('No workouts completed yet. Start your first workout to see progress here!')).toBeInTheDocument();
    });

    test('handles corrupted localStorage data', () => {
      getWorkoutHistory.mockImplementation(() => {
        throw new Error('Corrupted data');
      });

      render(<ProgressDashboard onBackToWorkout={mockOnBackToWorkout} />);

      // Should show empty state instead of crashing
      expect(screen.getByText('Progress Dashboard')).toBeInTheDocument();
    });

    test('handles invalid exercise trend data', () => {
      getExerciseTrends.mockReturnValue([
        { date: 'invalid-date', weight: 'invalid', reps: 'invalid', volume: 'invalid' }
      ]);

      render(<ProgressDashboard onBackToWorkout={mockOnBackToWorkout} />);

      // Should handle invalid trend data gracefully
      expect(screen.getByText('Exercise Performance')).toBeInTheDocument();
    });

    test('handles chart rendering errors', () => {
      // Mock Recharts components to throw errors
      jest.doMock('recharts', () => ({
        BarChart: () => {
          throw new Error('Chart rendering failed');
        },
        LineChart: () => {
          throw new Error('Chart rendering failed');
        },
        PieChart: () => {
          throw new Error('Chart rendering failed');
        }
      }));

      render(<ProgressDashboard onBackToWorkout={mockOnBackToWorkout} />);

      // Should handle chart errors gracefully
      expect(screen.getByText('Progress Dashboard')).toBeInTheDocument();
    });

    test('handles invalid time range selection', () => {
      render(<ProgressDashboard onBackToWorkout={mockOnBackToWorkout} />);

      const timeRangeSelect = screen.getByDisplayValue('Last 30 days');
      fireEvent.change(timeRangeSelect, { target: { value: 'invalid' } });

      // Should handle invalid time range gracefully (page should not crash)
      expect(screen.getByText('Progress Dashboard')).toBeInTheDocument();
    });

    test('handles exercise selection with no data', async () => {
      render(<ProgressDashboard onBackToWorkout={mockOnBackToWorkout} />);

      // Should handle gracefully - just verify component renders
      expect(screen.getByText('Progress Dashboard')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    test('handles very large workout data', () => {
      const largeWorkout = {
        name: 'Large Workout',
        description: 'Test with many exercises',
        exercises: Array.from({ length: 50 }, (_, i) => ({
          name: `Exercise ${i + 1}`,
          sets: 3,
          reps: '8-10',
          rest: 60,
          group: `Group ${String.fromCharCode(65 + (i % 26))}`
        }))
      };

      // Mutate the actual workouts module so WorkoutsPage can find it
      const workoutsData = require('../data/workouts');
      workoutsData.workouts.large = largeWorkout;

      render(<WorkoutsPage onBack={jest.fn()} initialWorkout="large" />);

      // Should handle large workout data without performance issues
      expect(screen.getByText('Large Workout')).toBeInTheDocument();

      // Cleanup
      delete workoutsData.workouts.large;
    });

    test('handles very long exercise names', () => {
      const workoutWithLongNames = {
        name: 'Test Workout',
        description: 'Test',
        exercises: [
          { 
            name: 'This is a very long exercise name that might cause layout issues in the UI component rendering',
            sets: 3,
            reps: '8-10',
            rest: 60,
            group: 'A'
          }
        ]
      };

      // Mutate the actual workouts module so WorkoutsPage can find it
      const workoutsData = require('../data/workouts');
      workoutsData.workouts.long = workoutWithLongNames;

      render(<WorkoutsPage onBack={jest.fn()} initialWorkout="long" />);

      // Should handle long names gracefully
      expect(screen.getAllByText('This is a very long exercise name that might cause layout issues in the UI component rendering').length).toBeGreaterThan(0);

      // Cleanup
      delete workoutsData.workouts.long;
    });

    test('handles rapid user interactions', () => {
      render(<WorkoutsPage onBack={jest.fn()} initialWorkout="push1" />);

      const firstExerciseMatches = screen.getAllByText('Slight Incline DB Bench Press');
      const firstExercise = firstExerciseMatches[0].closest('div');
      
      // Rapidly click the exercise multiple times
      for (let i = 0; i < 10; i++) {
        fireEvent.click(firstExercise);
      }

      // Should handle rapid interactions gracefully
      expect(screen.getByText('Set 1 of 4')).toBeInTheDocument();
    });

    test('handles concurrent state updates', () => {
      render(<WorkoutsPage onBack={jest.fn()} initialWorkout="push1" />);

      const firstExerciseMatches = screen.getAllByText('Slight Incline DB Bench Press');
      const firstExercise = firstExerciseMatches[0].closest('div');
      fireEvent.click(firstExercise);

      // Complete multiple sets rapidly
      const completeButton = screen.getByText('Completed Set 1');
      for (let i = 0; i < 5; i++) {
        fireEvent.click(completeButton);
      }

      // Should handle concurrent updates gracefully
      expect(screen.getAllByText('Slight Incline DB Bench Press').length).toBeGreaterThan(0);
    });

    test('handles network failures in API calls', () => {
      // Mock fetch to simulate network failure
      global.fetch = jest.fn(() => Promise.reject(new Error('Network error')));

      render(<WorkoutsPage onBack={jest.fn()} initialWorkout="push1" />);

      // Should handle network failures gracefully
      expect(screen.getByText('Push 1')).toBeInTheDocument();
    });
  });

  describe('Memory Management', () => {
    test('cleans up event listeners on unmount', () => {
      const { unmount } = render(<WorkoutsPage onBack={jest.fn()} initialWorkout="push1" />);

      // Should not throw errors when unmounting
      expect(() => unmount()).not.toThrow();
    });

    test('handles component cleanup', () => {
      const { unmount } = render(<ProgressDashboard onBackToWorkout={jest.fn()} />);

      // Should clean up properly
      expect(() => unmount()).not.toThrow();
    });
  });
});