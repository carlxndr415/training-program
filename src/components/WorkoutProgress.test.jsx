import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import WorkoutProgress from './WorkoutProgress';

describe('WorkoutProgress Component', () => {
  const mockExercises = [
    { name: 'Exercise 1', sets: 3, reps: '8-10', rest: 60, group: 'A' },
    { name: 'Exercise 2', sets: 3, reps: '8-10', rest: 60, group: 'B' },
    { name: 'Exercise 3', sets: 4, reps: '10-12', rest: 90, group: 'C' }
  ];

  const mockCompletedSets = {
    'workout-0-1': true,
    'workout-0-2': true,
    'workout-1-1': true
  };

  const mockProps = {
    exercises: mockExercises,
    currentExerciseIndex: 0,
    completedSets: mockCompletedSets,
    skipToExercise: jest.fn(),
    skipToSet: jest.fn(),
    isSetCompleted: (exerciseIdx, setNum) => !!mockCompletedSets[`workout-${exerciseIdx}-${setNum}`],
    isResting: false,
    timeLeft: 0,
    currentSet: 1,
    completeSet: jest.fn(),
    completeSetFromRest: jest.fn()
  };

  test('renders workout progress component with exercises', () => {
    render(<WorkoutProgress {...mockProps} />);

    expect(screen.getByText('Exercise 1')).toBeInTheDocument();
    expect(screen.getByText('Exercise 2')).toBeInTheDocument();
    expect(screen.getByText('Exercise 3')).toBeInTheDocument();
  });

  test('shows correct exercise information', () => {
    render(<WorkoutProgress {...mockProps} />);

    // Check exercise details are displayed correctly
    expect(screen.getAllByText('3 x 8-10 | 60s rest')).toHaveLength(2); // Exercise 1 and 2
    expect(screen.getByText('4 x 10-12 | 90s rest')).toBeInTheDocument();
  });

  test('highlights current exercise', () => {
    render(<WorkoutProgress {...mockProps} />);

    // First exercise should have active styling
    const firstExercise = screen.getByText('Exercise 1').closest('.p-4');
    expect(firstExercise).toHaveClass('bg-white');
    expect(firstExercise).toHaveClass('shadow-3xl');
    expect(firstExercise).toHaveClass('border-yellow-500');
    expect(firstExercise).toHaveClass('transition-all');
  });

  test('non-current exercises have hover styling', () => {
    render(<WorkoutProgress {...mockProps} />);

    // Second exercise should have hover styling
    const secondExercise = screen.getByText('Exercise 2').closest('.p-4');
    expect(secondExercise).toHaveClass('bg-white/90');
    expect(secondExercise).toHaveClass('hover:bg-white/100');
    expect(secondExercise).toHaveClass('transform');
    expect(secondExercise).toHaveClass('shadow-2xl');
  });

  test('shows completed sets correctly', () => {
    render(<WorkoutProgress {...mockProps} />);

    // Check that completed sets are shown as green buttons
    const completedButtons = screen.getAllByTitle(/Go to Set/);
    expect(completedButtons[0]).toHaveClass('bg-green-600'); // Set 1 of Exercise 1
    expect(completedButtons[1]).toHaveClass('bg-green-600'); // Set 2 of Exercise 1
    expect(completedButtons[2]).toHaveClass('bg-white/90'); // Set 3 of Exercise 1 (not completed)
    expect(completedButtons[0]).toHaveClass('px-2');
    expect(completedButtons[0]).toHaveClass('py-1');
    expect(completedButtons[0]).toHaveClass('border');
  });

  test('calls skipToExercise when exercise is clicked', () => {
    render(<WorkoutProgress {...mockProps} />);

    const exercise2 = screen.getByText('Exercise 2').closest('div');
    fireEvent.click(exercise2);

    expect(mockProps.skipToExercise).toHaveBeenCalledWith(1);
  });

  test('calls skipToSet when set dot is clicked', () => {
    render(<WorkoutProgress {...mockProps} />);

    const setDots = screen.getAllByTitle(/Go to Set/);
    fireEvent.click(setDots[2]); // Click set 3 of exercise 1

    expect(mockProps.skipToSet).toHaveBeenCalledWith(3);
  });

});
