import { profileKey } from './profileManager.js';

const BLOCK_KEY = 'training_block';
const HISTORY_KEY = 'lift_history';

// ─── Storage helpers ────────────────────────────────────────────────────────

const getBlock = () => {
  try {
    const d = localStorage.getItem(profileKey(BLOCK_KEY));
    return d ? JSON.parse(d) : null;
  } catch { return null; }
};

const saveBlock = (block) => {
  localStorage.setItem(profileKey(BLOCK_KEY), JSON.stringify(block));
};

const getHistory = () => {
  try {
    const d = localStorage.getItem(profileKey(HISTORY_KEY));
    return d ? JSON.parse(d) : {};
  } catch { return {}; }
};

const saveHistory = (h) => {
  localStorage.setItem(profileKey(HISTORY_KEY), JSON.stringify(h));
};

// ─── Block management ────────────────────────────────────────────────────────

export const initBlock = (programId, blockLengthWeeks = 4) => {
  const existing = getBlock();
  if (existing && existing.programId === programId) return existing;

  const block = {
    programId,
    startDate: new Date().toISOString(),
    blockLengthWeeks,
    currentWeek: 1,
    phase: 'accumulation', // accumulation | intensification | peak
  };
  saveBlock(block);
  return block;
};

export const getTrainingBlock = () => getBlock();

export const getCurrentWeek = () => {
  const block = getBlock();
  if (!block) return 1;
  const start = new Date(block.startDate);
  const now = new Date();
  const weeks = Math.floor((now - start) / (7 * 24 * 60 * 60 * 1000)) + 1;
  return Math.min(weeks, block.blockLengthWeeks);
};

export const getPhase = () => {
  const block = getBlock();
  if (!block) return 'accumulation';
  const week = getCurrentWeek();
  const len = block.blockLengthWeeks;
  if (week <= Math.floor(len * 0.5)) return 'accumulation';
  if (week <= Math.floor(len * 0.875)) return 'intensification';
  return 'peak';
};

// Phase modifiers: RIR targets per phase (Schoenfeld)
const PHASE_RIR = {
  accumulation: 2,    // 2-3 RIR
  intensification: 1, // 1-2 RIR
  peak: 0,            // 0-1 RIR
};

// ─── Lift history ────────────────────────────────────────────────────────────

// Record a completed set
export const recordSet = (exerciseId, exerciseName, setNum, weight, reps, rpe) => {
  const history = getHistory();
  if (!history[exerciseId]) history[exerciseId] = [];

  history[exerciseId].push({
    date: new Date().toISOString(),
    setNum,
    weight,
    reps,
    rpe,
    exerciseName,
  });

  // Keep last 200 sets per exercise
  if (history[exerciseId].length > 200) {
    history[exerciseId] = history[exerciseId].slice(-200);
  }
  saveHistory(history);
};

// Get last session's sets for an exercise
export const getLastSession = (exerciseId) => {
  const history = getHistory();
  const sets = history[exerciseId];
  if (!sets || sets.length === 0) return null;

  // Group by date (session = same calendar day)
  const byDate = {};
  sets.forEach(s => {
    const day = s.date.split('T')[0];
    if (!byDate[day]) byDate[day] = [];
    byDate[day].push(s);
  });

  const dates = Object.keys(byDate).sort();
  const today = new Date().toISOString().split('T')[0];

  // Find most recent session that isn't today
  const pastDates = dates.filter(d => d < today);
  if (pastDates.length === 0) {
    // If only today's data, return it as last session
    const todayDates = dates.filter(d => d === today);
    if (todayDates.length === 0) return null;
    return byDate[todayDates[todayDates.length - 1]];
  }

  return byDate[pastDates[pastDates.length - 1]];
};

// Get all sessions for an exercise (for progress charts)
export const getAllSessions = (exerciseId) => {
  const history = getHistory();
  const sets = history[exerciseId];
  if (!sets || sets.length === 0) return [];

  const byDate = {};
  sets.forEach(s => {
    const day = s.date.split('T')[0];
    if (!byDate[day]) byDate[day] = [];
    byDate[day].push(s);
  });

  return Object.entries(byDate)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, sets]) => ({
      date,
      sets,
      avgWeight: sets.reduce((s, x) => s + (x.weight || 0), 0) / sets.length,
      maxWeight: Math.max(...sets.map(x => x.weight || 0)),
      totalReps: sets.reduce((s, x) => s + (x.reps || 0), 0),
      avgRpe: sets.reduce((s, x) => s + (x.rpe || 0), 0) / sets.length,
      volume: sets.reduce((s, x) => s + ((x.weight || 0) * (x.reps || 0)), 0),
    }));
};

// Get PRs for an exercise
export const getPRs = (exerciseId) => {
  const sessions = getAllSessions(exerciseId);
  if (sessions.length === 0) return null;

  let maxWeight = 0;
  let maxVolume = 0;
  let maxReps = 0;
  let prDate = null;

  sessions.forEach(s => {
    if (s.maxWeight > maxWeight) {
      maxWeight = s.maxWeight;
      prDate = s.date;
    }
    if (s.volume > maxVolume) maxVolume = s.volume;
    if (s.totalReps > maxReps) maxReps = s.totalReps;
  });

  return { maxWeight, maxVolume, maxReps, prDate };
};

// ─── Hiatus detection ─────────────────────────────────────────────────────────

export const getDaysSinceLastWorkout = () => {
  const history = getHistory();
  let mostRecent = null;

  Object.values(history).forEach(sets => {
    sets.forEach(s => {
      const d = new Date(s.date);
      if (!mostRecent || d > mostRecent) mostRecent = d;
    });
  });

  if (!mostRecent) return null;
  const diff = (new Date() - mostRecent) / (1000 * 60 * 60 * 24);
  return Math.floor(diff);
};

export const isHiatus = () => {
  const days = getDaysSinceLastWorkout();
  return days !== null && days >= 14;
};

// ─── Prescription engine ─────────────────────────────────────────────────────

/*
  Double progression logic (McDonald):
  1. Target rep range top. If you hit top of range at RPE <= rirTarget + 1 → increase weight next session
  2. If you didn't hit top of range → keep weight, try to add reps
  3. If RPE >= 9 for 2+ consecutive sessions → hold weight (autoregulation)
  4. Hiatus (14+ days) → regress weight 10%, drop to bottom of rep range

  Phase modifiers (Schoenfeld):
  - Accumulation: target 2-3 RIR → stay at lower intensity
  - Intensification: target 1-2 RIR → push closer to failure
  - Peak: target 0-1 RIR → near maximal effort
*/

export const getPrescription = (exercise) => {
  const { id, repRange, rirTarget, progressionType } = exercise;
  const [repMin, repMax] = repRange;
  const lastSession = getLastSession(id);
  const phase = getPhase();
  const phaseRir = PHASE_RIR[phase];

  // No history — recommend starting weights
  if (!lastSession || lastSession.length === 0) {
    return {
      hasHistory: false,
      targetWeight: null,
      targetReps: repMin,
      targetRepRange: repRange,
      lastWeight: null,
      lastReps: null,
      lastRpe: null,
      phase,
      note: 'First session — start conservative, 2-3 RIR.',
    };
  }

  // Get last session stats
  const lastWeight = lastSession[0]?.weight || 0;
  const lastReps = Math.round(
    lastSession.reduce((s, x) => s + x.reps, 0) / lastSession.length
  );
  const lastRpe = Math.round(
    lastSession.reduce((s, x) => s + (x.rpe || 7), 0) / lastSession.length
  );
  const lastRir = 10 - lastRpe;

  // Hiatus regression
  if (isHiatus()) {
    const regressedWeight = Math.round((lastWeight * 0.9) / 2.5) * 2.5;
    return {
      hasHistory: true,
      targetWeight: regressedWeight,
      targetReps: repMin,
      targetRepRange: repRange,
      lastWeight,
      lastReps,
      lastRpe,
      phase,
      note: `Welcome back after a break — weight reduced 10% to ${regressedWeight}lbs.`,
      isRegression: true,
    };
  }

  // Check for high RPE stalls (autoregulation)
  const history = getHistory();
  const allSets = history[id] || [];
  const recentSessions = [];
  const byDate = {};
  allSets.forEach(s => {
    const day = s.date.split('T')[0];
    if (!byDate[day]) byDate[day] = [];
    byDate[day].push(s);
  });
  const sortedDates = Object.keys(byDate).sort().slice(-3);
  sortedDates.forEach(d => recentSessions.push(byDate[d]));

  const highRpeStreak = recentSessions.filter(session => {
    const avgRpe = session.reduce((s, x) => s + (x.rpe || 0), 0) / session.length;
    return avgRpe >= 9;
  }).length;

  if (highRpeStreak >= 2) {
    return {
      hasHistory: true,
      targetWeight: lastWeight,
      targetReps: lastReps,
      targetRepRange: repRange,
      lastWeight,
      lastReps,
      lastRpe,
      phase,
      note: 'RPE has been high — hold weight and focus on technique.',
      isHold: true,
    };
  }

  // Double progression logic
  let targetWeight = lastWeight;
  let targetReps = repMin;
  let note = '';

  const hitTopOfRange = lastReps >= repMax;
  const goodRir = lastRir >= phaseRir;

  if (hitTopOfRange && goodRir) {
    // Ready to increase weight
    const increment = lastWeight >= 50 ? 5 : 2.5;
    targetWeight = lastWeight + increment;
    targetReps = repMin;
    note = `Hit ${repMax} reps last session → +${increment}lbs today.`;
  } else if (hitTopOfRange && !goodRir) {
    // Hit reps but was hard — hold weight, try to hit reps cleaner
    targetWeight = lastWeight;
    targetReps = repMax;
    note = `Hit ${repMax} reps but RPE was high — hold weight, aim for cleaner reps.`;
  } else {
    // Didn't hit top of range — same weight, add reps
    targetWeight = lastWeight;
    targetReps = Math.min(lastReps + 1, repMax);
    note = `Add reps today: target ${targetReps}+ at ${lastWeight}lbs.`;
  }

  // Apply phase RIR guidance
  const phaseNotes = {
    accumulation: '2-3 RIR — build volume.',
    intensification: '1-2 RIR — push intensity.',
    peak: '0-1 RIR — near maximal effort.',
  };

  return {
    hasHistory: true,
    targetWeight,
    targetReps,
    targetRepRange: repRange,
    lastWeight,
    lastReps,
    lastRpe,
    phase,
    phaseNote: phaseNotes[phase],
    note,
  };
};

// ─── Strength goal projections ────────────────────────────────────────────────

export const projectStrengthGoal = (exerciseId, weeksOut = 5) => {
  const sessions = getAllSessions(exerciseId);
  if (sessions.length < 2) return null;

  // Linear regression on max weight over time
  const recent = sessions.slice(-8); // last 8 sessions
  const n = recent.length;
  const xMean = (n - 1) / 2;
  const yMean = recent.reduce((s, x) => s + x.maxWeight, 0) / n;

  let num = 0, den = 0;
  recent.forEach((s, i) => {
    num += (i - xMean) * (s.maxWeight - yMean);
    den += (i - xMean) ** 2;
  });

  const slope = den !== 0 ? num / den : 0;
  const intercept = yMean - slope * xMean;
  const projected = intercept + slope * (n - 1 + weeksOut);

  return {
    current: recent[recent.length - 1].maxWeight,
    projected: Math.round(projected / 2.5) * 2.5,
    weeklyGain: Math.round(slope * 10) / 10,
    weeksOut,
  };
};

// ─── Block progress ───────────────────────────────────────────────────────────

export const getBlockProgress = (programWorkouts) => {
  const block = getBlock();
  if (!block) return null;

  const week = getCurrentWeek();
  const phase = getPhase();
  const totalWeeks = block.blockLengthWeeks;
  const percentComplete = Math.round((week / totalWeeks) * 100);

  return {
    week,
    totalWeeks,
    phase,
    percentComplete,
    startDate: block.startDate,
  };
};
