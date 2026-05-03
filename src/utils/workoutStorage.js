import { workouts as defaultWorkouts } from '../data/workouts.js';
import { profileKey } from './profileManager.js';

const WORKOUTS_KEY = 'custom_workouts';

// Get workouts for active profile — falls back to defaults if none saved
export const getProfileWorkouts = () => {
  try {
    const data = localStorage.getItem(profileKey(WORKOUTS_KEY));
    if (data) {
      const parsed = JSON.parse(data);
      // Merge with defaults so new workouts added to default still appear
      return { ...defaultWorkouts, ...parsed };
    }
  } catch {}
  return { ...defaultWorkouts };
};

// Save all workouts for active profile
export const saveProfileWorkouts = (workoutsData) => {
  localStorage.setItem(profileKey(WORKOUTS_KEY), JSON.stringify(workoutsData));
};

// Reset a single workout to default
export const resetWorkoutToDefault = (workoutKey) => {
  const saved = getSavedWorkouts();
  if (saved) {
    delete saved[workoutKey];
    if (Object.keys(saved).length === 0) {
      localStorage.removeItem(profileKey(WORKOUTS_KEY));
    } else {
      localStorage.setItem(profileKey(WORKOUTS_KEY), JSON.stringify(saved));
    }
  }
};

// Reset all workouts to default
export const resetAllWorkoutsToDefault = () => {
  localStorage.removeItem(profileKey(WORKOUTS_KEY));
};

// Get only the saved (custom) workouts — not merged with defaults
const getSavedWorkouts = () => {
  try {
    const data = localStorage.getItem(profileKey(WORKOUTS_KEY));
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

// Check if a workout has been customized
export const isWorkoutCustomized = (workoutKey) => {
  const saved = getSavedWorkouts();
  return saved ? workoutKey in saved : false;
};

// Save a single workout
export const saveWorkout = (workoutKey, workoutData) => {
  const saved = getSavedWorkouts() || {};
  saved[workoutKey] = workoutData;
  localStorage.setItem(profileKey(WORKOUTS_KEY), JSON.stringify(saved));
};
