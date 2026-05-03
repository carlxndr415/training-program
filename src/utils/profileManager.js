const PROFILES_KEY = 'app_profiles';
const ACTIVE_PROFILE_KEY = 'app_active_profile';

// All per-profile storage keys (will be prefixed with profile id)
export const PROFILE_STORAGE_KEYS = [
  'active_workout_session',
  'workout_session_history',
  'workout_history',
  'user_profile',
  'exercise_logs',
  'exercise_history',
  'exercise_history_sequence',
  'progression_data',
  'gamification_achievements',
  'gamification_challenges',
  'gamification_points',
  'workout_notification_prefs',
];

export const getProfiles = () => {
  try {
    const data = localStorage.getItem(PROFILES_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const saveProfiles = (profiles) => {
  localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
};

export const getActiveProfileId = () => {
  return localStorage.getItem(ACTIVE_PROFILE_KEY) || null;
};

export const getActiveProfile = () => {
  const id = getActiveProfileId();
  if (!id) return null;
  return getProfiles().find(p => p.id === id) || null;
};

export const setActiveProfile = (profileId) => {
  localStorage.setItem(ACTIVE_PROFILE_KEY, profileId);
};

export const createProfile = (name) => {
  const profiles = getProfiles();
  const isFirst = profiles.length === 0;
  const profile = {
    id: `profile_${Date.now()}`,
    name: name.trim(),
    isAdmin: isFirst,
    createdAt: new Date().toISOString(),
  };
  profiles.push(profile);
  saveProfiles(profiles);
  return profile;
};

export const renameProfile = (profileId, newName) => {
  const profiles = getProfiles();
  const idx = profiles.findIndex(p => p.id === profileId);
  if (idx === -1) return;
  profiles[idx].name = newName.trim();
  saveProfiles(profiles);
};

export const deleteProfile = (profileId) => {
  // Clear all data for this profile
  PROFILE_STORAGE_KEYS.forEach(key => {
    localStorage.removeItem(`${profileId}_${key}`);
  });
  const profiles = getProfiles().filter(p => p.id !== profileId);
  saveProfiles(profiles);
  // If deleted profile was active, clear active
  if (getActiveProfileId() === profileId) {
    localStorage.removeItem(ACTIVE_PROFILE_KEY);
  }
};

// Returns a namespaced key for the active profile
export const profileKey = (key) => {
  const id = getActiveProfileId();
  if (!id) return key; // fallback — no profile selected
  return `${id}_${key}`;
};
