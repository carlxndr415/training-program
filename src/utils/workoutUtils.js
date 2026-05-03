// Constants for validation
export const REST_TIME_MIN = 30;
export const REST_TIME_MAX = 180;

/**
 * Workout utility functions for handling workout progression logic
 * and data validation
 */



/**
 * Handle normal (non-superset) exercise progression
 * @param {Object} params - Progression parameters
 * @param {number} currentExerciseIndex - Current exercise index
 * @param {number} currentSet - Current set number
 * @param {number} totalExercises - Total number of exercises
 * @param {number} exerciseSets - Number of sets for current exercise
 * @param {number} restTime - Rest time for current exercise
 * @param {boolean} fromRest - Whether this is called from rest state
 * @returns {Object} - Updated state values
 */
export const handleNormalProgression = ({
  currentExerciseIndex,
  currentSet,
  totalExercises,
  exerciseSets,
  restTime
}) => {
  if (currentSet < exerciseSets) {
    return {
      newExerciseIndex: currentExerciseIndex,
      newSet: currentSet + 1,
      shouldRest: true,
      timeLeft: restTime,
      isTimerRunning: true
    };
  } else {
    if (currentExerciseIndex < totalExercises - 1) {
      return {
        newExerciseIndex: currentExerciseIndex + 1,
        newSet: 1,
        shouldRest: false,
        timeLeft: 0,
        isTimerRunning: false
      };
    } else {
      return {
        newExerciseIndex: currentExerciseIndex,
        newSet: currentSet,
        shouldRest: false,
        timeLeft: 0,
        isTimerRunning: false
      };
    }
  }
};

/**
 * Format time in MM:SS format
 * @param {number} seconds - Time in seconds
 * @returns {string} - Formatted time string
 */
export const formatTime = (seconds) => {
  const isNegative = seconds < 0;
  const absSeconds = Math.abs(seconds);
  const mins = Math.floor(absSeconds / 60);
  const secs = absSeconds % 60;
  return `${isNegative ? '+' : ''}${mins}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Validate workout data structure
 * @param {Object} workout - Workout object to validate
 * @throws {Error} - If workout data is invalid
 */
export const validateWorkoutData = (workout) => {
  console.log('Validating workout:', workout.name);
  if (!workout || typeof workout !== 'object') {
    throw new Error('Workout must be an object');
  }

  const requiredProperties = ['name', 'description', 'exercises'];
  for (const prop of requiredProperties) {
    if (!workout[prop]) {
      throw new Error(`Workout missing required property: ${prop}`);
    }
  }

  if (!Array.isArray(workout.exercises) || workout.exercises.length === 0) {
    throw new Error('Workout must have at least one exercise');
  }

  workout.exercises.forEach((exercise, index) => {
    const exerciseRequiredProps = ['name', 'sets', 'reps', 'rest', 'group'];
    for (const prop of exerciseRequiredProps) {
      if (!(prop in exercise)) {
        throw new Error(`Exercise ${index + 1} missing required property: ${prop}`);
      }
    }

    if (!Number.isInteger(exercise.sets) || exercise.sets <= 0) {
      throw new Error(`Exercise ${index + 1} must have positive integer sets`);
    }

    // Validate rest time is within acceptable range
    if (exercise.rest < REST_TIME_MIN || exercise.rest > REST_TIME_MAX) {
      throw new Error(`Exercise ${index + 1} rest time must be between ${REST_TIME_MIN}-${REST_TIME_MAX} seconds`);
    }
  });

  console.log('Workout validation completed successfully');
};
