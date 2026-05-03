import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getProfileProgram } from '../utils/programManager';
import { getAllSessionsRemote, projectStrengthGoalRemote, getDaysSinceLastWorkoutRemote, getOrCreateBlock, getCurrentWeekRemote, getPhaseRemote } from '../lib/supabaseData';

const PhaseLabel = ({ phase }) => {
  const labels = { accumulation: 'Accumulation', intensification: 'Intensification', peak: 'Peak' };
  return <span className={`tag phase-${phase}`}>{labels[phase] || phase}</span>;
};

const WorkoutCard = ({ workout, isDone, isNext, onClick }) => (
  <button onClick={onClick} style={{
    width: '100%', textAlign: 'left', padding: '14px 16px',
    background: isDone ? 'rgba(34,197,94,0.04)' : isNext ? 'rgba(34,197,94,0.06)' : 'var(--bg-2)',
    border: `1px solid ${isDone ? 'rgba(34,197,94,0.2)' : isNext ? 'rgba(34,197,94,0.25)' : 'var(--border)'}`,
    borderRadius: 14, cursor: 'pointer', transition: 'all 0.15s', opacity: isDone ? 0.7 : 1,
  }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600, color: isDone ? 'var(--text-2)' : 'var(--text)' }}>
            {workout.name}
          </span>
          {isNext && <span className="tag tag-green" style={{ fontSize: 10 }}>Up Next</span>}
          {isDone && <span className="tag tag-green" style={{ fontSize: 10 }}>Done</span>}
        </div>
        <span style={{ fontSize: 12, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>{workout.focus}</span>
      </div>
      <div style={{
        width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
        background: isDone ? 'var(--green)' : isNext ? 'rgba(34,197,94,0.15)' : 'var(--bg-3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: isDone ? '#000' : isNext ? 'var(--green)' : 'var(--text-3)',
        fontSize: isDone ? 14 : 16, fontWeight: 700,
      }}>
        {isDone ? '✓' : '→'}
      </div>
    </div>
  </button>
);

export default function HomeScreen({ onStartWorkout }) {
  const { user, profile: authProfile } = useAuth();
  const program = getProfileProgram();
  const [block, setBlock] = useState(null);
  const [completedThisWeek, setCompletedThisWeek] = useState(new Set());
  const [daysSince, setDaysSince] = useState(null);
  const [mainLiftProjections, setMainLiftProjections] = useState({});

  const phase = block ? getPhaseRemote(block) : 'accumulation';
  const hiatus = daysSince !== null && daysSince >= 14;

  useEffect(() => {
    if (!user || !program) return;

    getOrCreateBlock(user.id, program.id, program.blockLength).then(setBlock);
    getDaysSinceLastWorkoutRemote(user.id).then(setDaysSince);

    const now = new Date();
    const dow = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - (dow === 0 ? 6 : dow - 1));
    monday.setHours(0, 0, 0, 0);

    const checkWorkouts = async () => {
      const done = new Set();
      for (const [wid, workout] of Object.entries(program.workouts)) {
        const firstEx = workout.exercises[0];
        if (firstEx) {
          const sessions = await getAllSessionsRemote(user.id, firstEx.id);
          if (sessions.some(s => new Date(s.date) >= monday)) done.add(wid);
        }
      }
      setCompletedThisWeek(done);
    };
    checkWorkouts();

    const loadProjections = async () => {
      const projections = {};
      for (const lift of (program.mainLifts || [])) {
        const firstEx = Object.values(program.workouts)
          .flatMap(w => w.exercises)
          .find(e => e.name === lift.exerciseName);
        if (firstEx) {
          projections[lift.exerciseName] = await projectStrengthGoalRemote(user.id, firstEx.id, 5);
        }
      }
      setMainLiftProjections(projections);
    };
    loadProjections();
  }, [user?.id, program?.id]);

  const workoutOrder = program ? Object.keys(program.workouts) : [];
  const totalWorkoutsThisWeek = workoutOrder.length;
  const doneThisWeek = completedThisWeek.size;
  const weeklyPct = totalWorkoutsThisWeek > 0 ? Math.round((doneThisWeek / totalWorkoutsThisWeek) * 100) : 0;

  const currentWeek = block ? getCurrentWeekRemote(block) : 1;
  const totalWeeks = block ? block.block_length_weeks : 4;
  const totalWorkoutsInBlock = totalWorkoutsThisWeek * totalWeeks;
  // Count completed workouts across entire block from lift_history
  // For now derive from completedThisWeek + assume past weeks were complete
  const completedWeeksFullyDone = Math.max(0, currentWeek - 1);
  const totalDoneInBlock = (completedWeeksFullyDone * totalWorkoutsThisWeek) + doneThisWeek;
  const blockPct = totalWorkoutsInBlock > 0 ? Math.round((totalDoneInBlock / totalWorkoutsInBlock) * 100) : 0;

  const blockProgress = block ? {
    week: currentWeek,
    totalWeeks,
    phase,
    weeklyPct,
    doneThisWeek,
    totalWorkoutsThisWeek,
    blockPct,
    totalDoneInBlock,
    totalWorkoutsInBlock,
  } : null;

  const nextWorkout = workoutOrder.find(id => !completedThisWeek.has(id));
  const mainLifts = program?.mainLifts || [];
  const greetingHour = new Date().getHours();
  const greeting = greetingHour < 12 ? 'Good morning' : greetingHour < 17 ? 'Good afternoon' : 'Good evening';

  if (!program) return (
    <div className="page"><div className="page-content" style={{ paddingTop: 32 }}>
      <div className="card" style={{ textAlign: 'center', padding: 32 }}>
        <p style={{ color: 'var(--text-2)', marginBottom: 16 }}>No program assigned yet.</p>
        <p style={{ fontSize: 13, color: 'var(--text-3)' }}>Go to Settings to select a program.</p>
      </div>
    </div></div>
  );

  return (
    <div className="page">
      <div className="page-content">

        <div className="animate-fade-up" style={{ marginBottom: 24 }}>
          <p style={{ fontSize: 13, color: 'var(--text-3)', fontFamily: 'var(--font-mono)', marginBottom: 4 }}>{greeting},</p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, color: 'var(--text)', lineHeight: 1.1 }}>
            {authProfile?.name || 'Athlete'}
          </h1>
        </div>

        {hiatus && (
          <div className="animate-fade-up delay-1" style={{
            background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.25)',
            borderRadius: 14, padding: '12px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <span style={{ fontSize: 18 }}>⚠️</span>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--orange)' }}>Welcome back</p>
              <p style={{ fontSize: 12, color: 'var(--text-2)' }}>{daysSince} days since last session — weights reduced 10%.</p>
            </div>
          </div>
        )}

        {blockProgress && (
          <div className="card animate-fade-up delay-1" style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
              <div>
                <p className="stat-label" style={{ marginBottom: 6 }}>Training Block</p>
                <PhaseLabel phase={phase} />
              </div>
              <div style={{ textAlign: 'right' }}>
                <p className="stat-label">Week</p>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--text)' }}>
                  {blockProgress.week}<span style={{ fontSize: 13, color: 'var(--text-3)', fontWeight: 400 }}>/{blockProgress.totalWeeks}</span>
                </p>
              </div>
            </div>

            {/* Weekly progress */}
            <p style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--font-mono)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              This Week
            </p>
            <div className="progress-bar" style={{ marginBottom: 6 }}>
              <div className="progress-fill" style={{ width: `${blockProgress.weeklyPct}%` }} />
            </div>
            <p style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--font-mono)', marginBottom: 14 }}>
              {blockProgress.doneThisWeek}/{blockProgress.totalWorkoutsThisWeek} workouts · {blockProgress.weeklyPct}%
            </p>

            {/* Block progress */}
            <p style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--font-mono)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Block Progress
            </p>
            <div className="progress-bar" style={{ marginBottom: 6 }}>
              <div className="progress-fill progress-fill-orange" style={{ width: `${blockProgress.blockPct}%` }} />
            </div>
            <p style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>
              {blockProgress.totalDoneInBlock}/{blockProgress.totalWorkoutsInBlock} workouts · {blockProgress.blockPct}%
            </p>
          </div>
        )}

        <div className="animate-fade-up delay-2" style={{ marginBottom: 16 }}>
          <p className="stat-label" style={{ marginBottom: 10 }}>This Week</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {workoutOrder.map(wid => (
              <WorkoutCard key={wid} workout={program.workouts[wid]}
                isDone={completedThisWeek.has(wid)} isNext={wid === nextWorkout}
                onClick={() => onStartWorkout(program.id, wid)} />
            ))}
          </div>
        </div>

        {mainLifts.length > 0 && (
          <div className="animate-fade-up delay-3" style={{ marginBottom: 24 }}>
            <p className="stat-label" style={{ marginBottom: 10 }}>Strength Goals — 5 Weeks</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {mainLifts.map(lift => {
                const projection = mainLiftProjections[lift.exerciseName];
                return (
                  <div key={lift.exerciseName} className="card-sm" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', marginBottom: 2 }}>{lift.exerciseName}</p>
                      <p style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--font-mono)', textTransform: 'capitalize' }}>{lift.muscle}</p>
                    </div>
                    {projection ? (
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 15, fontWeight: 500, color: 'var(--green)' }}>{projection.projected}lbs</p>
                        <p style={{ fontSize: 11, color: 'var(--text-3)' }}>from {projection.current}lbs</p>
                      </div>
                    ) : (
                      <p style={{ fontSize: 12, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>No data yet</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
