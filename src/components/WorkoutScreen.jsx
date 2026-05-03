import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getProfileProgram } from '../utils/programManager';
import { getPrescription, recordSet } from '../utils/periodization';
import { initBlock } from '../utils/periodization';
import { recordSetRemote, getPrescriptionRemote, getOrCreateBlock } from '../lib/supabaseData';
import { useAuth } from '../contexts/AuthContext';

// ── Icons ────────────────────────────────────────────────────────────────────
const ListIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
    <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const TimerIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);

// ── Rest timer hook ───────────────────────────────────────────────────────────
function useRestTimer() {
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef(null);

  const start = useCallback((seconds) => {
    setTimeLeft(seconds);
    setIsRunning(true);
  }, []);

  const stop = useCallback(() => {
    setIsRunning(false);
    setTimeLeft(0);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) { setIsRunning(false); return 0; }
          return t - 1;
        });
      }, 1000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning, timeLeft]);

  const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return { timeLeft, isRunning, start, stop, fmt };
}

// ── Exercise drawer ───────────────────────────────────────────────────────────
function ExerciseDrawer({ exercises, currentIdx, completedSets, onSelect, onClose }) {
  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <div className="drawer">
        <div style={{ padding: '20px 16px 12px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700 }}>Exercises</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-2)', cursor: 'pointer', fontSize: 20, lineHeight: 1 }}>×</button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
          {exercises.map((ex, idx) => {
            const done = completedSets[ex.id] === ex.sets;
            const partial = completedSets[ex.id] > 0 && !done;
            const isCurrent = idx === currentIdx;
            return (
              <button
                key={ex.id}
                onClick={() => { onSelect(idx); onClose(); }}
                style={{
                  width: '100%', textAlign: 'left', padding: '12px 16px',
                  background: isCurrent ? 'var(--green-glow)' : 'transparent',
                  border: 'none', cursor: 'pointer',
                  borderLeft: `3px solid ${isCurrent ? 'var(--green)' : done ? 'var(--green-dim)' : 'transparent'}`,
                  transition: 'background 0.15s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: isCurrent ? 600 : 400, color: done ? 'var(--text-3)' : 'var(--text)', marginBottom: 2 }}>
                      {ex.name}
                    </p>
                    <p style={{ fontSize: 12, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>
                      {ex.sets} × {ex.repRange[0]}–{ex.repRange[1]}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {done && <span style={{ color: 'var(--green)', fontSize: 14 }}>✓</span>}
                    {partial && (
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--orange)' }}>
                        {completedSets[ex.id]}/{ex.sets}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}

// ── Prescription banner ───────────────────────────────────────────────────────
function PrescriptionBanner({ prescription }) {
  if (!prescription) return null;
  const { hasHistory, targetWeight, targetReps, targetRepRange, lastWeight, lastReps, lastRpe, note, phase } = prescription;

  return (
    <div className="prescription">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--green)', fontFamily: 'var(--font-mono)' }}>
          Today's Target
        </p>
        {phase && (
          <span className={`tag phase-${phase}`} style={{ fontSize: 10 }}>{phase}</span>
        )}
      </div>
      <div style={{ display: 'flex', gap: 16, marginBottom: 10 }}>
        {targetWeight && (
          <div className="stat">
            <span className="stat-label">Weight</span>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, color: 'var(--green)' }}>
              {targetWeight}<span style={{ fontSize: 13, fontWeight: 400, color: 'var(--text-2)' }}> lbs</span>
            </span>
          </div>
        )}
        <div className="stat">
          <span className="stat-label">Reps</span>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, color: 'var(--text)' }}>
            {targetRepRange[0]}–{targetRepRange[1]}
          </span>
        </div>
      </div>
      {hasHistory && lastWeight && (
        <div style={{ display: 'flex', gap: 16, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div>
            <p style={{ fontSize: 10, color: 'var(--text-3)', fontFamily: 'var(--font-mono)', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Last Session</p>
            <p style={{ fontSize: 13, color: 'var(--text-2)', fontFamily: 'var(--font-mono)' }}>
              {lastWeight}lbs × {lastReps} @ RPE {lastRpe}
            </p>
          </div>
        </div>
      )}
      {note && (
        <p style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 8, lineHeight: 1.5 }}>{note}</p>
      )}
    </div>
  );
}

// ── Set logger ────────────────────────────────────────────────────────────────
function SetLogger({ exercise, setNum, onLogSet, prescription, previousSet }) {
  const [weight, setWeight] = useState('');
  const [reps, setReps]     = useState('');
  const [rpe, setRpe]       = useState(7);

  // Pre-fill from previous set or prescription
  useEffect(() => {
    if (previousSet) {
      setWeight(previousSet.weight ? String(previousSet.weight) : '');
      setReps(previousSet.reps ? String(previousSet.reps) : '');
      setRpe(previousSet.rpe || 7);
    } else if (prescription?.targetWeight) {
      setWeight(String(prescription.targetWeight));
      setReps(String(prescription.targetReps || prescription.targetRepRange[0]));
    }
  }, [exercise.id, setNum]);

  const handleLog = () => {
    const w = parseFloat(weight) || 0;
    const r = parseInt(reps) || 0;
    onLogSet(w, r, rpe);
    // Keep values for next set
  };

  return (
    <div className="card" style={{ marginBottom: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Set {setNum} of {exercise.sets}
        </p>
        {exercise.notes && (
          <p style={{ fontSize: 11, color: 'var(--text-3)', maxWidth: 180, textAlign: 'right', lineHeight: 1.4 }}>
            {exercise.notes}
          </p>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
        <div>
          <label style={{ display: 'block', fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--font-mono)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Weight (lbs)
          </label>
          <input
            type="number"
            className="input"
            value={weight}
            onChange={e => setWeight(e.target.value)}
            placeholder={prescription?.targetWeight || '0'}
            inputMode="decimal"
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--font-mono)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Reps
          </label>
          <input
            type="number"
            className="input"
            value={reps}
            onChange={e => setReps(e.target.value)}
            placeholder={`${exercise.repRange[0]}–${exercise.repRange[1]}`}
            inputMode="numeric"
          />
        </div>
      </div>

      {/* RPE selector */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <label style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            RPE
          </label>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 15, fontWeight: 500, color: rpe >= 9 ? 'var(--red)' : rpe >= 7 ? 'var(--orange)' : 'var(--green)' }}>
            {rpe}/10
          </span>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {[5,6,7,8,9,10].map(v => (
            <button
              key={v}
              onClick={() => setRpe(v)}
              style={{
                flex: 1, padding: '8px 0', borderRadius: 8, border: 'none', cursor: 'pointer',
                background: rpe === v
                  ? v >= 9 ? 'var(--red)' : v >= 7 ? 'var(--orange)' : 'var(--green)'
                  : 'var(--bg-3)',
                color: rpe === v ? '#000' : 'var(--text-2)',
                fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: rpe === v ? 700 : 400,
                transition: 'all 0.1s',
              }}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      <button
        className="btn btn-primary btn-lg btn-full"
        onClick={handleLog}
        style={{ gap: 8 }}
      >
        <CheckIcon />
        Log Set {setNum}
      </button>
    </div>
  );
}

// ── Workout selection screen ──────────────────────────────────────────────────
function WorkoutSelector({ program, onSelect }) {
  return (
    <div className="page">
      <div className="page-content">
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, marginBottom: 20, paddingTop: 8 }}>
          {program.name}
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {Object.values(program.workouts).map(w => (
            <button
              key={w.id}
              onClick={() => onSelect(w.id)}
              style={{
                textAlign: 'left', padding: '16px', background: 'var(--bg-1)',
                border: '1px solid var(--border)', borderRadius: 14, cursor: 'pointer',
                transition: 'border-color 0.15s',
              }}
            >
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>{w.name}</p>
              <p style={{ fontSize: 12, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>{w.focus}</p>
              <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 6 }}>
                {w.exercises.length} exercises
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main WorkoutScreen ────────────────────────────────────────────────────────
export default function WorkoutScreen({ activeWorkout, onSelectWorkout, onWorkoutComplete }) {
  const { user } = useAuth();
  const program = getProfileProgram();
  const timer = useRestTimer();
  const [block, setBlock] = React.useState(null);
  const [prescriptions, setPrescriptions] = React.useState({});

  const [workoutId, setWorkoutId]       = useState(activeWorkout?.workoutId || null);
  const [exerciseIdx, setExerciseIdx]   = useState(0);
  const [currentSet, setCurrentSet]     = useState(1);
  const [completedSets, setCompletedSets] = useState({}); // { exerciseId: count }
  const [loggedSets, setLoggedSets]     = useState({}); // { `${exId}_${setNum}`: {weight,reps,rpe} }
  const [showDrawer, setShowDrawer]     = useState(false);
  const [showDone, setShowDone]         = useState(false);

  // Sync activeWorkout prop
  useEffect(() => {
    if (activeWorkout?.workoutId && activeWorkout.workoutId !== workoutId) {
      setWorkoutId(activeWorkout.workoutId);
      setExerciseIdx(0);
      setCurrentSet(1);
      setCompletedSets({});
      setLoggedSets({});
      setShowDone(false);
      timer.stop();
      if (program) initBlock(program.id, program.blockLength);
    }
  }, [activeWorkout]);

  if (!program) return null;

  const workout = workoutId ? program.workouts[workoutId] : null;

  if (!workout) {
    return <WorkoutSelector program={program} onSelect={(id) => {
      setWorkoutId(id);
      setExerciseIdx(0);
      setCurrentSet(1);
      setCompletedSets({});
      setLoggedSets({});
      setShowDone(false);
      timer.stop();
      initBlock(program.id, program.blockLength);
    }} />;
  }

  const exercises = workout.exercises;
  const exercise = exercises[exerciseIdx];
  const prescription = getPrescription(exercise);
  const previousSetKey = `${exercise.id}_${currentSet - 1}`;
  const previousSet = loggedSets[previousSetKey] || null;
  const setKey = `${exercise.id}_${currentSet}`;
  const isSetLogged = !!loggedSets[setKey];

  // Total progress
  const totalSets = exercises.reduce((s, e) => s + e.sets, 0);
  const doneSets = Object.values(completedSets).reduce((s, n) => s + n, 0);
  const pct = Math.round((doneSets / totalSets) * 100);

  const handleLogSet = (weight, reps, rpe) => {
    // Record locally and remotely
    recordSet(exercise.id, exercise.name, currentSet, weight, reps, rpe);
    if (user) recordSetRemote(user.id, exercise.id, exercise.name, currentSet, weight, reps, rpe);

    // Track locally
    const logKey = `${exercise.id}_${currentSet}`;
    setLoggedSets(prev => ({ ...prev, [logKey]: { weight, reps, rpe } }));

    const newCount = (completedSets[exercise.id] || 0) + 1;
    setCompletedSets(prev => ({ ...prev, [exercise.id]: newCount }));

    // Start rest timer
    timer.start(exercise.rest);

    // Auto-advance to next set
    if (currentSet < exercise.sets) {
      setCurrentSet(s => s + 1);
    } else {
      // All sets done for this exercise — move to next
      const nextIdx = exerciseIdx + 1;
      if (nextIdx < exercises.length) {
        setExerciseIdx(nextIdx);
        setCurrentSet(1);
      } else {
        // Workout complete
        setShowDone(true);
        timer.stop();
      }
    }
  };

  const handleJumpToSet = (exIdx, setNum) => {
    setExerciseIdx(exIdx);
    setCurrentSet(setNum);
  };

  if (showDone) {
    return (
      <div className="page">
        <div className="page-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '70vh', textAlign: 'center' }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🎯</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>
            Workout Complete
          </h2>
          <p style={{ color: 'var(--text-2)', marginBottom: 8 }}>{workout.name} — {workout.focus}</p>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--green)', marginBottom: 32 }}>
            {doneSets} sets logged
          </p>
          <button className="btn btn-primary btn-lg btn-full" onClick={onWorkoutComplete}>
            Done
          </button>
          <button className="btn btn-ghost btn-full" style={{ marginTop: 10 }} onClick={() => setShowDone(false)}>
            Review Workout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      {showDrawer && (
        <ExerciseDrawer
          exercises={exercises}
          currentIdx={exerciseIdx}
          completedSets={completedSets}
          onSelect={(idx) => { setExerciseIdx(idx); setCurrentSet((completedSets[exercises[idx].id] || 0) + 1); }}
          onClose={() => setShowDrawer(false)}
        />
      )}

      <div className="page-content">

        {/* Top bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <p style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {workout.name}
            </p>
            <p style={{ fontSize: 12, color: 'var(--text-3)' }}>
              {exerciseIdx + 1}/{exercises.length} exercises
            </p>
          </div>
          <button
            className="btn btn-ghost"
            style={{ padding: '8px 12px', gap: 6 }}
            onClick={() => setShowDrawer(true)}
          >
            <ListIcon />
            <span style={{ fontSize: 13 }}>All</span>
          </button>
        </div>

        {/* Progress bar */}
        <div style={{ marginBottom: 20 }}>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${pct}%` }} />
          </div>
          <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 6, fontFamily: 'var(--font-mono)' }}>
            {pct}% — {doneSets}/{totalSets} sets
          </p>
        </div>

        {/* Rest timer (persistent, non-blocking) */}
        {timer.isRunning && (
          <div className="rest-timer animate-fade-in" style={{ marginBottom: 14 }}>
            <TimerIcon />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 15, fontWeight: 500, color: 'var(--orange)' }}>
              {timer.fmt(timer.timeLeft)}
            </span>
            <span style={{ fontSize: 12, color: 'var(--text-2)' }}>rest</span>
            <button
              onClick={timer.stop}
              style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-3)', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Skip
            </button>
          </div>
        )}

        {/* Exercise name */}
        <div className="animate-fade-up" style={{ marginBottom: 14 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, color: 'var(--text)', lineHeight: 1.1, marginBottom: 6 }}>
            {exercise.name}
          </h2>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <span className="tag tag-grey">{exercise.sets} sets</span>
            <span className="tag tag-grey">{exercise.repRange[0]}–{exercise.repRange[1]} reps</span>
            <span className="tag tag-grey">{exercise.rest}s rest</span>
            {exercise.isMainLift && <span className="tag tag-green">Main Lift</span>}
          </div>
        </div>

        {/* Set indicators */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {Array.from({ length: exercise.sets }, (_, i) => {
            const sn = i + 1;
            const logKey = `${exercise.id}_${sn}`;
            const logged = loggedSets[logKey];
            const isCurrent = sn === currentSet;
            return (
              <button
                key={sn}
                onClick={() => handleJumpToSet(exerciseIdx, sn)}
                style={{
                  flex: 1, padding: '10px 6px', borderRadius: 10, border: 'none', cursor: 'pointer',
                  background: logged ? 'var(--green)' : isCurrent ? 'var(--bg-3)' : 'var(--bg-2)',
                  transition: 'all 0.15s',
                  outline: isCurrent ? '2px solid var(--green)' : 'none',
                  outlineOffset: 2,
                }}
              >
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600, color: logged ? '#000' : isCurrent ? 'var(--text)' : 'var(--text-3)' }}>
                    {sn}
                  </p>
                  {logged && (
                    <p style={{ fontSize: 10, color: 'rgba(0,0,0,0.7)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
                      {logged.weight}×{logged.reps}
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Prescription */}
        <div style={{ marginBottom: 14 }}>
          <PrescriptionBanner prescription={prescription} />
        </div>

        {/* Set logger */}
        <SetLogger
          exercise={exercise}
          setNum={currentSet}
          onLogSet={handleLogSet}
          prescription={prescription}
          previousSet={previousSet}
        />

        {/* Skip exercise */}
        <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
          {exerciseIdx > 0 && (
            <button
              className="btn btn-ghost"
              style={{ flex: 1, fontSize: 13 }}
              onClick={() => { setExerciseIdx(i => i - 1); setCurrentSet(1); }}
            >
              ← Prev
            </button>
          )}
          {exerciseIdx < exercises.length - 1 && (
            <button
              className="btn btn-ghost"
              style={{ flex: 1, fontSize: 13 }}
              onClick={() => { setExerciseIdx(i => i + 1); setCurrentSet(1); }}
            >
              Next →
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
