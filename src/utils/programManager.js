import { profileKey } from './profileManager.js';
import { carlProgram, sonProgram, programRegistry } from '../data/programs.js';
import { getActiveProfile } from './profileManager.js';

const PROGRAM_KEY = 'selected_program';

export const getSelectedProgramId = () => {
  try {
    return localStorage.getItem(profileKey(PROGRAM_KEY));
  } catch { return null; }
};

export const setSelectedProgramId = (programId) => {
  localStorage.setItem(profileKey(PROGRAM_KEY), programId);
};

// Get the active profile's program, with smart defaults
export const getProfileProgram = () => {
  const saved = getSelectedProgramId();
  if (saved && programRegistry[saved]) return programRegistry[saved];

  // Auto-assign based on profile name (first-time setup)
  const profile = getActiveProfile();
  if (!profile) return carlProgram;

  // Admin (Carl) gets 6-day PPL by default
  if (profile.isAdmin) return carlProgram;

  // Others get 4-day by default
  return sonProgram;
};

export const getAllPrograms = () => Object.values(programRegistry);

export const getProgramById = (id) => programRegistry[id] || null;
