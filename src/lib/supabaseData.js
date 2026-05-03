// Supabase data layer — replaces periodization.js localStorage calls
import { supabase } from '../lib/supabase';

// ── Lift history ─────────────────────────────────────────────────────────────

export const recordSetRemote = async (userId, exerciseId, exerciseName, setNum, weight, reps, rpe) => {
  const { error } = await supabase.from('lift_history').insert({
    user_id: userId,
    exercise_id: exerciseId,
    exercise_name: exerciseName,
    set_num: setNum,
    weight,
    reps,
    rpe,
  });
  if (error) console.error('recordSet error:', error);
};

export const getExerciseHistory = async (userId, exerciseId) => {
  const { data, error } = await supabase
    .from('lift_history')
    .select('*')
    .eq('user_id', userId)
    .eq('exercise_id', exerciseId)
    .order('logged_at', { ascending: true });

  if (error) { console.error('getExerciseHistory error:', error); return []; }
  return data || [];
};

// Group rows by calendar date into sessions
export const groupIntoSessions = (rows) => {
  const byDate = {};
  rows.forEach(r => {
    const day = r.logged_at.split('T')[0];
    if (!byDate[day]) byDate[day] = [];
    byDate[day].push(r);
  });
  return Object.entries(byDate)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, sets]) => ({
      date,
      sets,
      maxWeight: Math.max(...sets.map(s => s.weight || 0)),
      avgWeight: sets.reduce((a, s) => a + (s.weight || 0), 0) / sets.length,
      totalReps: sets.reduce((a, s) => a + (s.reps || 0), 0),
      avgRpe: sets.reduce((a, s) => a + (s.rpe || 0), 0) / sets.length,
      volume: sets.reduce((a, s) => a + ((s.weight || 0) * (s.reps || 0)), 0),
    }));
};

export const getLastSessionRemote = async (userId, exerciseId) => {
  const rows = await getExerciseHistory(userId, exerciseId);
  const sessions = groupIntoSessions(rows);
  if (sessions.length === 0) return null;

  const today = new Date().toISOString().split('T')[0];
  const past = sessions.filter(s => s.date < today);
  if (past.length > 0) return past[past.length - 1].sets;

  // If only today's data return it
  const todaySessions = sessions.filter(s => s.date === today);
  return todaySessions.length > 0 ? todaySessions[todaySessions.length - 1].sets : null;
};

export const getAllSessionsRemote = async (userId, exerciseId) => {
  const rows = await getExerciseHistory(userId, exerciseId);
  return groupIntoSessions(rows);
};

export const getPRsRemote = async (userId, exerciseId) => {
  const sessions = await getAllSessionsRemote(userId, exerciseId);
  if (sessions.length === 0) return null;
  let maxWeight = 0, maxVolume = 0, maxReps = 0, prDate = null;
  sessions.forEach(s => {
    if (s.maxWeight > maxWeight) { maxWeight = s.maxWeight; prDate = s.date; }
    if (s.volume > maxVolume) maxVolume = s.volume;
    if (s.totalReps > maxReps) maxReps = s.totalReps;
  });
  return { maxWeight, maxVolume, maxReps, prDate };
};

// ── Training block ────────────────────────────────────────────────────────────

export const getOrCreateBlock = async (userId, programId, blockLengthWeeks = 4) => {
  const { data, error } = await supabase
    .from('training_blocks')
    .select('*')
    .eq('user_id', userId)
    .eq('program_id', programId)
    .single();

  if (data) return data;

  const { data: newBlock } = await supabase
    .from('training_blocks')
    .insert({ user_id: userId, program_id: programId, block_length_weeks: blockLengthWeeks })
    .select()
    .single();

  return newBlock;
};

export const getCurrentWeekRemote = (block) => {
  if (!block) return 1;
  const start = new Date(block.start_date);
  const now = new Date();
  const weeks = Math.floor((now - start) / (7 * 24 * 60 * 60 * 1000)) + 1;
  return Math.min(weeks, block.block_length_weeks);
};

export const getPhaseRemote = (block) => {
  if (!block) return 'accumulation';
  const week = getCurrentWeekRemote(block);
  const len = block.block_length_weeks;
  if (week <= Math.floor(len * 0.5)) return 'accumulation';
  if (week <= Math.floor(len * 0.875)) return 'intensification';
  return 'peak';
};

// ── Days since last workout ───────────────────────────────────────────────────

export const getDaysSinceLastWorkoutRemote = async (userId) => {
  const { data } = await supabase
    .from('lift_history')
    .select('logged_at')
    .eq('user_id', userId)
    .order('logged_at', { ascending: false })
    .limit(1);

  if (!data || data.length === 0) return null;
  const diff = (new Date() - new Date(data[0].logged_at)) / (1000 * 60 * 60 * 24);
  return Math.floor(diff);
};

// ── Custom workouts ───────────────────────────────────────────────────────────

export const getCustomWorkout = async (userId, workoutKey) => {
  const { data } = await supabase
    .from('custom_workouts')
    .select('workout_data')
    .eq('user_id', userId)
    .eq('workout_key', workoutKey)
    .single();
  return data?.workout_data || null;
};

export const saveCustomWorkout = async (userId, workoutKey, workoutData) => {
  await supabase.from('custom_workouts').upsert({
    user_id: userId,
    workout_key: workoutKey,
    workout_data: workoutData,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id,workout_key' });
};

// ── Strength projection ───────────────────────────────────────────────────────

export const projectStrengthGoalRemote = async (userId, exerciseId, weeksOut = 5) => {
  const sessions = await getAllSessionsRemote(userId, exerciseId);
  if (sessions.length < 2) return null;

  const recent = sessions.slice(-8);
  const n = recent.length;
  const xMean = (n - 1) / 2;
  const yMean = recent.reduce((s, x) => s + x.maxWeight, 0) / n;

  let num = 0, den = 0;
  recent.forEach((s, i) => {
    num += (i - xMean) * (s.maxWeight - yMean);
    den += (i - xMean) ** 2;
  });

  const slope = den !== 0 ? num / den : 0;
  const projected = yMean - slope * xMean + slope * (n - 1 + weeksOut);

  return {
    current: recent[recent.length - 1].maxWeight,
    projected: Math.round(projected / 2.5) * 2.5,
    weeklyGain: Math.round(slope * 10) / 10,
    weeksOut,
  };
};

// ── Prescription (remote version) ─────────────────────────────────────────────

const PHASE_RIR = { accumulation: 2, intensification: 1, peak: 0 };

export const getPrescriptionRemote = async (userId, exercise, block) => {
  const { repRange, rirTarget, id } = exercise;
  const [repMin, repMax] = repRange;
  const phase = getPhaseRemote(block);
  const phaseRir = PHASE_RIR[phase];

  const lastSessionSets = await getLastSessionRemote(userId, id);

  if (!lastSessionSets || lastSessionSets.length === 0) {
    return {
      hasHistory: false, targetWeight: null, targetReps: repMin,
      targetRepRange: repRange, lastWeight: null, lastReps: null, lastRpe: null,
      phase, note: 'First session — start conservative, 2-3 RIR.',
    };
  }

  const lastWeight = lastSessionSets[0]?.weight || 0;
  const lastReps = Math.round(lastSessionSets.reduce((s, x) => s + x.reps, 0) / lastSessionSets.length);
  const lastRpe = Math.round(lastSessionSets.reduce((s, x) => s + (x.rpe || 7), 0) / lastSessionSets.length);
  const lastRir = 10 - lastRpe;

  // Hiatus check
  const daysSince = await getDaysSinceLastWorkoutRemote(userId);
  if (daysSince !== null && daysSince >= 14) {
    const regressedWeight = Math.round((lastWeight * 0.9) / 2.5) * 2.5;
    return {
      hasHistory: true, targetWeight: regressedWeight, targetReps: repMin,
      targetRepRange: repRange, lastWeight, lastReps, lastRpe, phase,
      note: `Welcome back after ${daysSince} days — weight reduced 10% to ${regressedWeight}lbs.`,
      isRegression: true,
    };
  }

  // High RPE stall check — last 2 sessions avg RPE >= 9
  const allRows = await getExerciseHistory(userId, id);
  const sessions = groupIntoSessions(allRows);
  const recentTwo = sessions.slice(-2);
  const highRpeStreak = recentTwo.filter(s => s.avgRpe >= 9).length;

  if (highRpeStreak >= 2) {
    return {
      hasHistory: true, targetWeight: lastWeight, targetReps: lastReps,
      targetRepRange: repRange, lastWeight, lastReps, lastRpe, phase,
      note: 'RPE has been high — hold weight and focus on technique.', isHold: true,
    };
  }

  // Double progression
  const hitTopOfRange = lastReps >= repMax;
  const goodRir = lastRir >= phaseRir;
  let targetWeight = lastWeight, targetReps = repMin, note = '';

  if (hitTopOfRange && goodRir) {
    const increment = lastWeight >= 50 ? 5 : 2.5;
    targetWeight = lastWeight + increment;
    targetReps = repMin;
    note = `Hit ${repMax} reps last session → +${increment}lbs today.`;
  } else if (hitTopOfRange && !goodRir) {
    targetWeight = lastWeight;
    targetReps = repMax;
    note = `Hit ${repMax} reps but RPE was high — hold weight, aim for cleaner reps.`;
  } else {
    targetWeight = lastWeight;
    targetReps = Math.min(lastReps + 1, repMax);
    note = `Add reps today: target ${targetReps}+ at ${lastWeight}lbs.`;
  }

  const phaseNotes = {
    accumulation: '2-3 RIR — build volume.',
    intensification: '1-2 RIR — push intensity.',
    peak: '0-1 RIR — near maximal effort.',
  };

  return {
    hasHistory: true, targetWeight, targetReps, targetRepRange: repRange,
    lastWeight, lastReps, lastRpe, phase, phaseNote: phaseNotes[phase], note,
  };
};
