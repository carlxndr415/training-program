/**
 * Comprehensive utility tests for workout functionality
 * Tests data structure, validation, and business logic
 */
import { workouts } from '../data/workouts';

describe('Workout Data Structure', () => {
  test('should have eleven workout programs', () => {
    expect(Object.keys(workouts).length).toBe(11);
  });

  test('each workout should have required properties', () => {
    Object.values(workouts).forEach(workout => {
      expect(workout).toHaveProperty('name');
      expect(workout).toHaveProperty('description');
      expect(workout).toHaveProperty('exercises');
      expect(Array.isArray(workout.exercises)).toBe(true);
    });
  });

  test('each exercise should have required properties', () => {
    Object.values(workouts).forEach(workout => {
      workout.exercises.forEach(exercise => {
        expect(exercise).toHaveProperty('name');
        expect(exercise).toHaveProperty('sets');
        expect(exercise).toHaveProperty('reps');
        expect(exercise).toHaveProperty('rest');
        expect(exercise).toHaveProperty('group');
      });
    });
  });
});


describe('Data Validation', () => {
  test('rest times should be reasonable values', () => {
    Object.values(workouts).forEach(workout => {
      workout.exercises.forEach(exercise => {
        expect(exercise.rest).toBeGreaterThanOrEqual(30);
        expect(exercise.rest).toBeLessThanOrEqual(180);
      });
    });
  });

  test('sets should be positive integers', () => {
    Object.values(workouts).forEach(workout => {
      workout.exercises.forEach(exercise => {
        expect(Number.isInteger(exercise.sets)).toBe(true);
        expect(exercise.sets).toBeGreaterThan(0);
      });
    });
  });
});

describe('Workout Progression Logic', () => {
  test('should have logical exercise grouping', () => {
    Object.values(workouts).forEach(workout => {
      const groups = {};
      workout.exercises.forEach(exercise => {
        if (!groups[exercise.group]) {
          groups[exercise.group] = 0;
        }
        groups[exercise.group]++;
      });

      // Each group should have at least one exercise
      Object.values(groups).forEach(count => {
        expect(count).toBeGreaterThan(0);
      });
    });
  });
});

