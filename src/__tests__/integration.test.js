import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from '../App';
import { getWorkoutHistory, saveWorkoutToHistory, logExerciseSet } from '../utils/progressTracker';
import { workouts } from '../data/workouts';

// Mock localStorage
const mockLocalStorage = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = value.toString();
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
});

// Mock progress tracker
jest.mock('../utils/progressTracker');

jest.mock('../utils/workoutSessionManager', () => ({
  getActiveSession: jest.fn().mockReturnValue(null),
  updateCurrentSet: jest.fn(),
  completeCurrentSet: jest.fn(),
  updateRestTimer: jest.fn(),
  getCurrentSetData: jest.fn().mockReturnValue(null),
  isSetCompleted: jest.fn().mockReturnValue(false),
  getExerciseCompletion: jest.fn().mockReturnValue({ percentage: 0, completed: 0, total: 0 }),
  startSession: jest.fn(),
  completeSession: jest.fn(),
  getSessionHistory: jest.fn().mockReturnValue([]),
  getSessionStats: jest.fn().mockReturnValue({
    totalWorkouts: 2,
    totalExercises: 4,
    totalSets: 14,
    totalVolume: 12000,
    averageWorkoutDuration: 45
  })
}));

jest.mock('../utils/enhancedProgressTracker', () => ({
  logEnhancedExerciseSet: jest.fn(),
  getProgressionData: jest.fn().mockReturnValue({}),
  getMuscleGroupVolumeSummary: jest.fn().mockReturnValue([]),
  getAllProgressionSuggestions: jest.fn().mockReturnValue([])
}));

describe('Integration Tests - Complete User Flows', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.clear();
    // Reset URL to root before each test to avoid state bleeding
    window.history.pushState({}, '', '/');
    
    // Set up default mocks
    getWorkoutHistory.mockReturnValue([]);
    saveWorkoutToHistory.mockImplementation((workoutData) => {
      const history = getWorkoutHistory();
      history.push({
        ...workoutData,
        timestamp: new Date().toISOString(),
        date: new Date().toLocaleDateString(),
        id: Date.now()
      });
      mockLocalStorage.setItem('workout_history', JSON.stringify(history));
    });
    
    logExerciseSet.mockImplementation((workoutName, exerciseName, setNumber, weight, reps, notes) => {
      const logs = JSON.parse(mockLocalStorage.getItem('exercise_logs') || '{}');
      const key = `${workoutName}-${exerciseName}`;
      
      if (!logs[key]) {
        logs[key] = [];
      }
      
      logs[key].push({
        workoutName,
        exerciseName,
        setNumber,
        weight: weight || null,
        reps,
        notes,
        timestamp: new Date().toISOString(),
        date: new Date().toLocaleDateString()
      });
      
      mockLocalStorage.setItem('exercise_logs', JSON.stringify(logs));
    });
  });

  // App already includes its own BrowserRouter; render it directly
  const renderWithRouter = (component) => {
    return render(component);
  };

  test('Complete workout flow: select workout → complete exercises → view progress', async () => {
    renderWithRouter(<App />);

    // 1. Start on landing page - verify workout selection is available
    expect(screen.getByText('Select a workout')).toBeInTheDocument();

    // 2. Select a workout
    const pushWorkoutButton = screen.getByText('Push 1').closest('button');
    fireEvent.click(pushWorkoutButton);

    // Should navigate to workout page - verify workout name appears
    expect(screen.getAllByText('Push 1').length).toBeGreaterThan(0);

    // 3. Complete first exercise (Slight Incline DB Bench Press - 4 sets)
    // Exercise name appears in both header and list; click the list item
    const firstExerciseMatches = screen.getAllByText('Slight Incline DB Bench Press');
    const firstExercise = firstExerciseMatches[firstExerciseMatches.length - 1].closest('div');
    fireEvent.click(firstExercise);

    // Complete all 4 sets
    for (let i = 1; i <= 4; i++) {
      const completeButton = screen.getByText(`Completed Set ${i}`);
      fireEvent.click(completeButton);
      
      if (i < 4) {
        // Should show rest timer between sets
        expect(screen.getByText('Rest Time')).toBeInTheDocument();
      }
    }

    // 4. Move to second exercise (Incline DB Press - 3 sets)
    expect(screen.getAllByText('Incline DB Press').length).toBeGreaterThan(0);
    
    for (let i = 1; i <= 3; i++) {
      const completeButton = screen.getByText(`Completed Set ${i}`);
      fireEvent.click(completeButton);
      
      if (i < 3) {
        expect(screen.getByText('Rest Time')).toBeInTheDocument();
      }
    }

    // 5. Verify progress tracking was called
    expect(logExerciseSet).toHaveBeenCalledWith(
      'Push 1',
      'Slight Incline DB Bench Press',
      1,
      null,
      8,
      'Completed set 1'
    );
    
    expect(logExerciseSet).toHaveBeenCalledWith(
      'Push 1',
      'Incline DB Press',
      1,
      null,
      10,
      'Completed set 1'
    );

    // 6. Navigate to dashboard to view progress
    const dashboardLink = screen.getByText('Dashboard');
    fireEvent.click(dashboardLink);

    // Should show progress dashboard - verify dashboard title appears
    expect(screen.getAllByText('Progress Dashboard').length).toBeGreaterThan(0);
  });

  test('Workout selection and navigation flow', async () => {
    renderWithRouter(<App />);

    // 1. Start on landing page
    expect(screen.getByText('Select a workout')).toBeInTheDocument();

    // 2. Navigate to workouts category
    const workoutsLink = screen.getByText('Workouts');
    fireEvent.click(workoutsLink);

    // Should show workout categories
    expect(screen.getByText('Push Pull Legs Split')).toBeInTheDocument();
    expect(screen.getByText('Full Body Workouts')).toBeInTheDocument();
    expect(screen.getByText('Upper / Lower Split')).toBeInTheDocument();

    // 3. Navigate to specific workout category
    const pushPullLegsLink = screen.getByText('Push Pull Legs Split');
    fireEvent.click(pushPullLegsLink);

    // Should show push/pull/legs workouts
    expect(screen.getByText('Push 1')).toBeInTheDocument();
    expect(screen.getByText('Pull 1')).toBeInTheDocument();
    expect(screen.getByText('Legs 1')).toBeInTheDocument();

    // 4. Select a specific workout
    const pullWorkoutButton = screen.getByText('Pull 1').closest('button');
    fireEvent.click(pullWorkoutButton);

    // Should navigate to pull workout
    expect(screen.getByText('Pull 1')).toBeInTheDocument();
    expect(screen.getByText('Pull (Back/Biceps/Rear Delts) - Volume Focus')).toBeInTheDocument();
  });

  test('Progress tracking and analytics flow', async () => {
    // Set up mock history with some completed workouts
    const mockHistory = [
      {
        id: 1,
        workoutKey: 'Push 1',
        exercises: [
          { name: 'DB Bench Press', sets: 4, reps: '6-8' },
          { name: 'DB Row', sets: 3, reps: '8-10' }
        ],
        startTime: '2024-01-01T10:00:00Z',
        totalVolume: 5000,
        averageRPE: 7.5
      },
      {
        id: 2,
        workoutKey: 'Pull 1',
        exercises: [
          { name: 'Pull-ups', sets: 4, reps: '6-8' },
          { name: 'DB Row', sets: 3, reps: '8-10' }
        ],
        startTime: '2024-01-03T10:00:00Z',
        totalVolume: 5500,
        averageRPE: 8.0
      }
    ];

    // Mock getSessionHistory to return the mock history
    const { getSessionHistory } = require('../utils/workoutSessionManager');
    getSessionHistory.mockReturnValue(mockHistory);

    renderWithRouter(<App />);

    // Navigate to dashboard
    const dashboardLink = screen.getByText('Dashboard');
    fireEvent.click(dashboardLink);

    // Should show progress dashboard with analytics
    expect(screen.getByText('Enhanced Progress Dashboard')).toBeInTheDocument();

    // Should show stats based on mock data - use more specific selectors
    expect(screen.getByText('Total Workouts')).toBeInTheDocument();
    expect(screen.getByText('Consistency Score')).toBeInTheDocument();

    // Should show recent workouts
    expect(screen.getByText('Push 1')).toBeInTheDocument();
    expect(screen.getByText('Pull 1')).toBeInTheDocument();
  });

  test('Error handling in workout flow', async () => {
    // Mock validation error
    const originalConsoleError = console.error;
    console.error = jest.fn();

    renderWithRouter(<App />);

    // Try to select a workout (this should work normally)
    const pushWorkoutButton = screen.getByText('Push 1').closest('button');
    fireEvent.click(pushWorkoutButton);

    expect(screen.getByText('Push 1')).toBeInTheDocument();

    // Try to complete an exercise (should work)
    const firstExerciseMatches = screen.getAllByText('Slight Incline DB Bench Press');
    const firstExercise = firstExerciseMatches[firstExerciseMatches.length - 1].closest('div');
    fireEvent.click(firstExercise);

    const completeButton = screen.getByText('Completed Set 1');
    fireEvent.click(completeButton);

    // Should not have errors
    expect(console.error).not.toHaveBeenCalled();

    console.error = originalConsoleError;
  });

  test('LocalStorage persistence flow', async () => {
    // Track localStorage calls
    const localStorageCalls = [];
    const originalSetItem = mockLocalStorage.setItem.bind(mockLocalStorage);
    mockLocalStorage.setItem = jest.fn((key, value) => {
      localStorageCalls.push({ key, value });
      return originalSetItem(key, value);
    });

    renderWithRouter(<App />);

    // Complete a workout
    const pushWorkoutButton = screen.getByText('Push 1').closest('button');
    fireEvent.click(pushWorkoutButton);

    const firstExerciseMatches = screen.getAllByText('Slight Incline DB Bench Press');
    const firstExercise = firstExerciseMatches[firstExerciseMatches.length - 1].closest('div');
    fireEvent.click(firstExercise);

    const completeButton = screen.getByText('Completed Set 1');
    fireEvent.click(completeButton);

    // Verify localStorage.setItem was called with expected data
    const exerciseLogCalls = localStorageCalls.filter(call => call.key === 'exercise_logs');
    expect(exerciseLogCalls.length).toBeGreaterThan(0);
    
    // Verify the logged data structure
    const lastCall = exerciseLogCalls[exerciseLogCalls.length - 1];
    const logs = JSON.parse(lastCall.value);
    expect(logs['Push 1-Slight Incline DB Bench Press']).toBeDefined();
    expect(logs['Push 1-Slight Incline DB Bench Press'][0].setNumber).toBe(1);
  });

  test('Navigation between components', async () => {
    renderWithRouter(<App />);

    // 1. Start on landing page
    expect(screen.getByText('Select a workout')).toBeInTheDocument();

    // 2. Navigate to workouts
    const workoutsLink = screen.getByText('Workouts');
    fireEvent.click(workoutsLink);

    expect(screen.getByText('Workout Categories')).toBeInTheDocument();

    // 3. Navigate to dashboard
    const dashboardLink = screen.getByText('Dashboard');
    fireEvent.click(dashboardLink);

    expect(screen.getByText('Progress Dashboard')).toBeInTheDocument();

    // 4. Navigate to nutrition - use nav link specifically
    const nutritionNavLink = screen.getByRole('link', { name: /Nutrition/i });
    fireEvent.click(nutritionNavLink);

    // 5. Navigate back to landing - use the nav link specifically
    const homeLinks = screen.getAllByText('Home');
    fireEvent.click(homeLinks[0]);

    expect(screen.getByText('Select a workout')).toBeInTheDocument();
  });
});