import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getProfileProgram } from '../utils/programManager';
import { getAllSessionsRemote, getPRsRemote } from '../lib/supabaseData';

const COLORS = { weight: 'var(--green)', volume: 'var(--blue)', rpe: 'var(--orange)' };

function MiniChart({ sessions, metric }) {
  if (!sessions || sessions.length < 2) return (
    <div style={{ height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ fontSize: 12, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>
        {sessions && sessions.length === 1 ? 'Log one more session to see trend' : 'No sessions yet'}
      </p>
    </div>
  );

  const values = sessions.map(s =>
    metric === 'weight' ? s.maxWeight : metric === 'volume' ? s.volume : s.avgRpe
  ).filter(v => v != null && v > 0);

  if (values.length < 2) return null;

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const w = 100 / (values.length - 1);
  const color = COLORS[metric];

  const points = values.map((v, i) => `${i * w},${100 - ((v - min) / range) * 100}`).join(' ');

  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: '100%', height: 60 }}>
      <polyline points={points} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      {values.map((v, i) => (
        <circle key={i} cx={i * w} cy={100 - ((v - min) / range) * 100} r="2.5" fill={color} vectorEffect="non-scaling-stroke" />
      ))}
    </svg>
  );
}

function ExerciseCard({ exercise, userId }) {
  const [metric, setMetric] = useState('weight');
  const [sessions, setSessions] = useState([]);
  const [prs, setPrs] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    Promise.all([
      getAllSessionsRemote(userId, exercise.id),
      getPRsRemote(userId, exercise.id),
    ]).then(([s, p]) => {
      setSessions(s);
      setPrs(p);
      setLoading(false);
    });
  }, [userId, exercise.id]);

  const latest = sessions[sessions.length - 1];

  return (
    <div className="card" style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>
            {exercise.name}
          </p>
          {exercise.isMainLift && <span className="tag tag-green" style={{ fontSize: 10 }}>Main Lift</span>}
        </div>
        {prs && prs.maxWeight > 0 && (
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: 10, color: 'var(--text-3)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>PR</p>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 15, fontWeight: 600, color: 'var(--orange)' }}>{prs.maxWeight}lbs</p>
          </div>
        )}
      </div>

      {loading ? (
        <p style={{ fontSize: 12, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>Loading…</p>
      ) : sessions.length === 0 ? (
        <p style={{ fontSize: 12, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>No sessions logged yet</p>
      ) : (
        <>
          <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
            {['weight', 'volume', 'rpe'].map(m => (
              <button key={m} onClick={() => setMetric(m)} style={{
                padding: '4px 10px', borderRadius: 999, border: 'none', cursor: 'pointer',
                fontSize: 11, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.05em',
                background: metric === m ? COLORS[m] : 'var(--bg-3)',
                color: metric === m ? '#000' : 'var(--text-3)',
                transition: 'all 0.15s',
              }}>
                {m}
              </button>
            ))}
          </div>

          <MiniChart sessions={sessions} metric={metric} />

          {latest && (
            <div style={{ display: 'flex', gap: 16, marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--border)' }}>
              <div className="stat">
                <span className="stat-label">Last</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--text)' }}>
                  {latest.maxWeight}lbs × {latest.totalReps}
                </span>
              </div>
              <div className="stat">
                <span className="stat-label">Sessions</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--text)' }}>{sessions.length}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Avg RPE</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: latest.avgRpe >= 9 ? 'var(--red)' : latest.avgRpe >= 7 ? 'var(--orange)' : 'var(--green)' }}>
                  {latest.avgRpe ? latest.avgRpe.toFixed(1) : '—'}
                </span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function ProgressScreen() {
  const { user } = useAuth();
  const program = getProfileProgram();
  const [selectedWorkout, setSelectedWorkout] = useState(null);

  if (!program) return (
    <div className="page"><div className="page-content" style={{ paddingTop: 32 }}>
      <p style={{ color: 'var(--text-2)' }}>No program selected.</p>
    </div></div>
  );

  const workouts = Object.values(program.workouts);
  const activeId = selectedWorkout || workouts[0].id;
  const activeWorkout = program.workouts[activeId];

  return (
    <div className="page">
      <div className="page-content">
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, marginBottom: 16, paddingTop: 8 }}>
          Progress
        </h2>

        <div style={{ display: 'flex', gap: 6, marginBottom: 20, overflowX: 'auto', paddingBottom: 4 }}>
          {workouts.map(w => (
            <button key={w.id} onClick={() => setSelectedWorkout(w.id)} style={{
              padding: '6px 14px', borderRadius: 999, border: 'none', cursor: 'pointer',
              background: activeId === w.id ? 'var(--green)' : 'var(--bg-2)',
              color: activeId === w.id ? '#000' : 'var(--text-2)',
              fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', transition: 'all 0.15s',
            }}>
              {w.name}
            </button>
          ))}
        </div>

        {activeWorkout.exercises.map(ex => (
          <ExerciseCard key={ex.id} exercise={ex} userId={user?.id} />
        ))}
      </div>
    </div>
  );
}
