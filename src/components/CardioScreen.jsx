import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { carlCardioProgram, sonCardioProgram, getSessionPhases } from '../data/cardioPrograms';

function useCountdown(initialSeconds) {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const [running, setRunning] = useState(false);
  const ref = useRef(null);
  const start = useCallback(() => setRunning(true), []);
  const pause = useCallback(() => setRunning(false), []);
  const reset = useCallback((s) => { setRunning(false); setTimeLeft(s !== undefined ? s : initialSeconds); }, [initialSeconds]);
  useEffect(() => {
    if (running) { ref.current = setInterval(() => setTimeLeft(t => { if (t <= 1) { setRunning(false); return 0; } return t - 1; }), 1000); }
    else clearInterval(ref.current);
    return () => clearInterval(ref.current);
  }, [running]);
  const fmt = (s) => `${String(Math.floor(Math.abs(s) / 60)).padStart(2,'0')}:${String(Math.abs(s) % 60).padStart(2,'0')}`;
  return { timeLeft, running, start, pause, reset, fmt, done: timeLeft === 0 };
}

function PhaseTimer({ phase, equipment, onNext, onPrev, isFirst, isLast, onLogInterval }) {
  const timer = useCountdown(phase.duration);
  const isTreadmill = equipment === 'Treadmill';
  const [speed, setSpeed] = useState('');
  const [incline, setIncline] = useState('');
  const [intervalRpe, setIntervalRpe] = useState(phase.type === 'max' ? 10 : 9);
  const phaseColors = { easy: 'var(--green)', work: 'var(--orange)', max: 'var(--red)' };
  const color = phaseColors[phase.type] || 'var(--text-2)';
  const pct = Math.round(((phase.duration - timer.timeLeft) / phase.duration) * 100);

  useEffect(() => { timer.start(); }, [phase.id]);

  const handleNext = () => {
    if (phase.logPerInterval) onLogInterval(phase.id, isTreadmill ? { speed, incline, rpe: intervalRpe } : { rpe: intervalRpe });
    onNext();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: 12, color: 'var(--text-3)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>{phase.label}</p>
        <p style={{ fontSize: 13, color, fontFamily: 'var(--font-mono)' }}>Target RPE {phase.rpeTarget}</p>
      </div>
      <div style={{ textAlign: 'center', position: 'relative' }}>
        <svg viewBox="0 0 120 120" style={{ width: 160, height: 160 }}>
          <circle cx="60" cy="60" r="54" fill="none" stroke="var(--bg-3)" strokeWidth="8" />
          <circle cx="60" cy="60" r="54" fill="none" stroke={timer.done ? 'var(--text-3)' : color} strokeWidth="8" strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 54}`} strokeDashoffset={`${2 * Math.PI * 54 * (1 - pct / 100)}`}
            transform="rotate(-90 60 60)" style={{ transition: 'stroke-dashoffset 0.5s, stroke 0.3s' }} />
        </svg>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 800, color: timer.done ? 'var(--text-3)' : 'var(--text)', lineHeight: 1 }}>{timer.fmt(timer.timeLeft)}</p>
          {timer.done && <p style={{ fontSize: 12, color: 'var(--green)', marginTop: 4 }}>Done ✓</p>}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
        <button className="btn btn-ghost" style={{ padding: '8px 16px', fontSize: 13 }} onClick={timer.running ? timer.pause : timer.start}>{timer.running ? 'Pause' : 'Resume'}</button>
        <button className="btn btn-ghost" style={{ padding: '8px 12px', fontSize: 13 }} onClick={() => timer.reset(phase.duration)}>↺</button>
      </div>
      {phase.logPerInterval && (
        <div className="card-sm">
          <p style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>{phase.label}</p>
          {isTreadmill && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--font-mono)', marginBottom: 6 }}>Speed (mph)</label>
                <input type="number" className="input" value={speed} onChange={e => setSpeed(e.target.value)} placeholder="6.5" inputMode="decimal" step="0.1" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--font-mono)', marginBottom: 6 }}>Incline (%)</label>
                <input type="number" className="input" value={incline} onChange={e => setIncline(e.target.value)} placeholder="1.0" inputMode="decimal" step="0.5" />
              </div>
            </div>
          )}
          <div>
            <label style={{ display: 'block', fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--font-mono)', marginBottom: 6 }}>RPE</label>
            <div style={{ display: 'flex', gap: 4 }}>
              {(phase.type === 'max' ? [8,9,10] : [6,7,8,9,10]).map(v => (
                <button key={v} onClick={() => setIntervalRpe(v)} style={{ flex: 1, padding: '8px 0', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, background: intervalRpe === v ? (v >= 9 ? 'var(--red)' : 'var(--orange)') : 'var(--bg-3)', color: intervalRpe === v ? '#000' : 'var(--text-2)' }}>{v}</button>
              ))}
            </div>
          </div>
        </div>
      )}
      <div style={{ display: 'flex', gap: 8 }}>
        {!isFirst && <button className="btn btn-ghost" style={{ flex: 1, fontSize: 13 }} onClick={onPrev}>← Back</button>}
        <button style={{ flex: 2, border: 'none', background: isLast || timer.done ? 'var(--green)' : 'var(--bg-3)', color: isLast || timer.done ? '#000' : 'var(--text-2)', fontWeight: 600, cursor: 'pointer', borderRadius: 12, padding: '14px', transition: 'all 0.2s', fontFamily: 'var(--font-body)', fontSize: 14 }} onClick={handleNext}>
          {isLast ? 'Finish & Log →' : 'Next →'}
        </button>
      </div>
    </div>
  );
}

function EquipmentSelector({ session, onStart }) {
  const [selected, setSelected] = useState(session.defaultEquipment);
  return (
    <div>
      <p style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Select Activity</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
        {session.equipment.map(e => (
          <button key={e} onClick={() => setSelected(e)} style={{ padding: '14px 16px', borderRadius: 12, border: `2px solid ${selected === e ? session.color : 'var(--border)'}`, background: selected === e ? `${session.color}15` : 'var(--bg-2)', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 14, fontWeight: selected === e ? 600 : 400, color: 'var(--text)' }}>{e}</span>
            {selected === e && <span style={{ color: session.color }}>✓</span>}
          </button>
        ))}
      </div>
      {selected === 'Treadmill' && (
        <div className="card-sm" style={{ marginBottom: 20, borderLeft: '3px solid var(--blue)' }}>
          <p style={{ fontSize: 12, color: 'var(--blue)', fontWeight: 600, marginBottom: 4 }}>Treadmill mode</p>
          <p style={{ fontSize: 12, color: 'var(--text-2)' }}>Speed and incline logged per interval.</p>
        </div>
      )}
      <button className="btn btn-primary btn-lg btn-full" onClick={() => onStart(selected)}>Start {session.name}</button>
    </div>
  );
}

function SessionLogForm({ session, equipment, intervalLogs, totalElapsed, onSave, onBack }) {
  const [avgHr, setAvgHr] = useState('');
  const [peakHr, setPeakHr] = useState('');
  const [rpe, setRpe] = useState(7);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2,'0')}`;
  const handleSave = async () => {
    setSaving(true);
    const intervalNote = Object.keys(intervalLogs).length > 0
      ? '\n' + Object.entries(intervalLogs).map(([k,v]) => `${k}: ${v.speed ? `${v.speed}mph @${v.incline}% ` : ''}RPE ${v.rpe}`).join(', ')
      : '';
    await onSave({ session_type: session.id, equipment, duration_minutes: Math.round(totalElapsed / 60) || session.duration, avg_hr: parseInt(avgHr) || null, peak_hr: parseInt(peakHr) || null, rpe, intervals_completed: Object.keys(intervalLogs).filter(k => k.startsWith('work')).length || null, sprint1_rpe: intervalLogs['sprint1']?.rpe || null, sprint2_rpe: intervalLogs['sprint2']?.rpe || null, notes: notes + intervalNote });
    setSaving(false);
  };
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-2)', fontSize: 20 }}>←</button>
        <div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>Log Session</h3>
          <p style={{ fontSize: 12, color: 'var(--text-3)' }}>{session.name} · {equipment} · {fmt(totalElapsed)}</p>
        </div>
      </div>
      {Object.keys(intervalLogs).length > 0 && (
        <div className="card-sm" style={{ marginBottom: 12 }}>
          <p style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Interval Log</p>
          {Object.entries(intervalLogs).map(([k,v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid var(--border)' }}>
              <p style={{ fontSize: 12, color: 'var(--text-2)', fontFamily: 'var(--font-mono)' }}>{k}</p>
              <p style={{ fontSize: 12, color: 'var(--text)', fontFamily: 'var(--font-mono)' }}>{v.speed ? `${v.speed}mph · ${v.incline}% · ` : ''}RPE {v.rpe}</p>
            </div>
          ))}
        </div>
      )}
      <div className="card" style={{ marginBottom: 12 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
          <div><label style={{ display: 'block', fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Avg HR</label><input type="number" className="input" value={avgHr} onChange={e => setAvgHr(e.target.value)} placeholder="bpm" inputMode="numeric" /></div>
          <div><label style={{ display: 'block', fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Peak HR</label><input type="number" className="input" value={peakHr} onChange={e => setPeakHr(e.target.value)} placeholder="bpm" inputMode="numeric" /></div>
        </div>
        <div style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <label style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Overall RPE</label>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: rpe >= 9 ? 'var(--red)' : rpe >= 7 ? 'var(--orange)' : 'var(--green)' }}>{rpe}/10</span>
          </div>
          <div style={{ display: 'flex', gap: 4 }}>{[3,4,5,6,7,8,9,10].map(v => (<button key={v} onClick={() => setRpe(v)} style={{ flex: 1, padding: '8px 0', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 12, background: rpe === v ? (v >= 9 ? 'var(--red)' : v >= 7 ? 'var(--orange)' : 'var(--green)') : 'var(--bg-3)', color: rpe === v ? '#000' : 'var(--text-2)', transition: 'all 0.1s' }}>{v}</button>))}</div>
        </div>
        <div style={{ marginBottom: 16 }}><label style={{ display: 'block', fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Notes</label><textarea className="input" value={notes} onChange={e => setNotes(e.target.value)} rows={2} style={{ resize: 'none' }} placeholder="How did it feel?" /></div>
        <button className="btn btn-primary btn-lg btn-full" onClick={handleSave} disabled={saving} style={{ opacity: saving ? 0.6 : 1 }}>{saving ? 'Saving…' : 'Save Session'}</button>
      </div>
    </div>
  );
}

function ActiveSession({ session, onComplete, onBack }) {
  const [stage, setStage] = useState('equipment');
  const [equipment, setEquipment] = useState(session.defaultEquipment);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [intervalLogs, setIntervalLogs] = useState({});
  const [totalElapsed, setTotalElapsed] = useState(0);
  const elapsedRef = useRef(null);
  const phases = getSessionPhases(session);

  const startSession = (eq) => { setEquipment(eq); setStage('active'); elapsedRef.current = setInterval(() => setTotalElapsed(e => e + 1), 1000); };
  const handleNext = () => { if (phaseIdx < phases.length - 1) setPhaseIdx(i => i + 1); else { clearInterval(elapsedRef.current); setStage('log'); } };
  const handlePrev = () => { if (phaseIdx > 0) setPhaseIdx(i => i - 1); };
  const handleLogInterval = (id, data) => setIntervalLogs(prev => ({ ...prev, [id]: data }));
  useEffect(() => () => clearInterval(elapsedRef.current), []);

  return (
    <div className="page">
      <div className="page-content">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-2)', fontSize: 20 }}>←</button>
          <div><h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--text)' }}>{session.name}</h2><p style={{ fontSize: 12, color: 'var(--text-3)' }}>{session.subtitle}</p></div>
          {stage === 'active' && <p style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-3)' }}>{phaseIdx + 1}/{phases.length}</p>}
        </div>
        {stage === 'equipment' && <EquipmentSelector session={session} onStart={startSession} />}
        {stage === 'active' && (
          <>
            <div style={{ display: 'flex', gap: 3, marginBottom: 20 }}>{phases.map((p, i) => (<div key={p.id} style={{ flex: 1, height: 4, borderRadius: 2, background: i < phaseIdx ? 'var(--green)' : i === phaseIdx ? session.color : 'var(--bg-3)', transition: 'background 0.3s' }} />))}</div>
            <PhaseTimer key={phases[phaseIdx].id} phase={phases[phaseIdx]} equipment={equipment} onLogInterval={handleLogInterval} onNext={handleNext} onPrev={handlePrev} isFirst={phaseIdx === 0} isLast={phaseIdx === phases.length - 1} />
          </>
        )}
        {stage === 'log' && <SessionLogForm session={session} equipment={equipment} intervalLogs={intervalLogs} totalElapsed={totalElapsed} onSave={onComplete} onBack={() => { setStage('active'); setPhaseIdx(phases.length - 1); }} />}
      </div>
    </div>
  );
}

function SessionCard({ session, onStart }) {
  const phases = getSessionPhases(session);
  const totalMin = Math.round(phases.reduce((s, p) => s + p.duration, 0) / 60);
  return (
    <button onClick={() => onStart(session)} style={{ width: '100%', textAlign: 'left', padding: '16px', background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: 16, cursor: 'pointer', transition: 'border-color 0.15s', borderLeft: `4px solid ${session.color}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>{session.name}</p>
          <p style={{ fontSize: 12, color: 'var(--text-3)', fontFamily: 'var(--font-mono)', marginBottom: 6 }}>{session.subtitle}</p>
          <p style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.5 }}>{session.description}</p>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 12 }}><p style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: session.color }}>{totalMin}</p><p style={{ fontSize: 11, color: 'var(--text-3)' }}>min</p></div>
      </div>
      <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>{session.equipment.map(e => (<span key={e} className="tag tag-grey" style={{ fontSize: 10 }}>{e}</span>))}</div>
    </button>
  );
}

function Vo2MaxTracker({ userId }) {
  const [entries, setEntries] = useState([]);
  const [value, setValue] = useState('');
  const [source, setSource] = useState('garmin');
  const [saving, setSaving] = useState(false);
  useEffect(() => { supabase.from('vo2max_entries').select('*').eq('user_id', userId).order('recorded_at', { ascending: true }).then(({ data }) => setEntries(data || [])); }, [userId]);
  const handleAdd = async () => { if (!value) return; setSaving(true); const { data } = await supabase.from('vo2max_entries').insert({ user_id: userId, value: parseFloat(value), source }).select().single(); if (data) setEntries(e => [...e, data]); setValue(''); setSaving(false); };
  const latest = entries[entries.length - 1];
  const trend = entries.length >= 2 ? (latest.value - entries[0].value).toFixed(1) : null;
  return (
    <div className="card" style={{ marginBottom: 12 }}>
      <p style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>VO2Max</p>
      {latest && (<div style={{ display: 'flex', gap: 20, marginBottom: 14 }}><div className="stat"><span className="stat-label">Current</span><span style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, color: 'var(--green)' }}>{latest.value}</span><span className="stat-sub">ml/kg/min</span></div>{trend && (<div className="stat"><span className="stat-label">Change</span><span style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, color: parseFloat(trend) >= 0 ? 'var(--green)' : 'var(--red)' }}>{parseFloat(trend) >= 0 ? '+' : ''}{trend}</span><span className="stat-sub">{entries.length} entries</span></div>)}</div>)}
      {entries.length >= 2 && (<svg viewBox="0 0 100 40" preserveAspectRatio="none" style={{ width: '100%', height: 40, marginBottom: 14 }}>{(() => { const vals = entries.map(e => e.value); const min = Math.min(...vals)-1, max = Math.max(...vals)+1, range = max-min||1, w = 100/(vals.length-1); const pts = vals.map((v,i) => `${i*w},${40-((v-min)/range)*40}`).join(' '); return <polyline points={pts} fill="none" stroke="var(--green)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />; })()}</svg>)}
      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
        <div style={{ flex: 1 }}><label style={{ display: 'block', fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--font-mono)', marginBottom: 6 }}>Log value</label><input type="number" className="input" value={value} onChange={e => setValue(e.target.value)} placeholder="57.3" inputMode="decimal" /></div>
        <div><label style={{ display: 'block', fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--font-mono)', marginBottom: 6 }}>Source</label><select className="input" value={source} onChange={e => setSource(e.target.value)} style={{ width: 90 }}><option value="garmin">Garmin</option><option value="lab">Lab</option><option value="manual">Manual</option></select></div>
        <button className="btn btn-primary" onClick={handleAdd} disabled={saving || !value} style={{ padding: '12px 16px', opacity: !value ? 0.4 : 1 }}>Add</button>
      </div>
    </div>
  );
}

function FitnessProfileModal({ userId, onClose }) {
  const defaults = { test_date: new Date().toISOString().split('T')[0], vo2max: '57.3', anaerobic_threshold_vo2: '54.6', aerobic_threshold_vo2: '23.4', peak_hr: '179', hr_recovery_1min: '139', hr_recovery_2min: '129', aerobic_threshold_hr: '', anaerobic_threshold_hr: '', notes: '' };
  const [values, setValues] = useState(defaults);
  const [saving, setSaving] = useState(false);
  useEffect(() => { supabase.from('fitness_profile').select('*').eq('user_id', userId).order('test_date', { ascending: false }).limit(1).single().then(({ data }) => { if (data) setValues({ ...defaults, ...data }); }); }, [userId]);
  const field = (key, label, placeholder) => (<div key={key}><label style={{ display: 'block', fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{label}</label><input type={key === 'test_date' ? 'date' : 'number'} className="input" value={values[key]} onChange={e => setValues(v => ({ ...v, [key]: e.target.value }))} placeholder={placeholder} inputMode="decimal" /></div>);
  const handleSave = async () => { setSaving(true); await supabase.from('fitness_profile').insert({ ...values, user_id: userId }); setSaving(false); onClose(); };
  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'var(--bg-1)', borderRadius: '20px 20px 0 0', padding: '24px 16px', border: '1px solid var(--border)', maxHeight: '85vh', overflowY: 'auto', animation: 'slideUp 0.3s var(--ease)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}><h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700 }}>Lab Test Values</h3><button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-2)', cursor: 'pointer', fontSize: 20 }}>×</button></div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>{field('test_date','Test Date','')}{field('vo2max','VO2Max','57.3')}{field('anaerobic_threshold_vo2','AT VO2','54.6')}{field('aerobic_threshold_vo2','AeT VO2','23.4')}{field('peak_hr','Peak HR','179')}{field('aerobic_threshold_hr','AeT HR','')}{field('anaerobic_threshold_hr','AT HR','')}{field('hr_recovery_1min','HRR 1min','139')}{field('hr_recovery_2min','HRR 2min','129')}</div>
        <button className="btn btn-primary btn-lg btn-full" onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
      </div>
    </div>
  );
}

function RecentSessions({ userId, program }) {
  const [sessions, setSessions] = useState([]);
  useEffect(() => { supabase.from('cardio_sessions').select('*').eq('user_id', userId).order('logged_at', { ascending: false }).limit(8).then(({ data }) => setSessions(data || [])); }, [userId]);
  if (sessions.length === 0) return null;
  const def = (type) => Object.values(program.sessions).find(s => s.id === type);
  return (
    <div style={{ marginBottom: 16 }}>
      <p className="stat-label" style={{ marginBottom: 10 }}>Recent Sessions</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {sessions.map(s => { const d = def(s.session_type); return (
          <div key={s.id} className="card-sm" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: `3px solid ${d?.color || 'var(--border)'}` }}>
            <div><p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>{d?.name || s.session_type}</p><p style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>{s.equipment} · {s.duration_minutes}min{s.avg_hr ? ` · ${s.avg_hr}bpm` : ''}</p></div>
            <div style={{ textAlign: 'right' }}><p style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: s.rpe >= 9 ? 'var(--red)' : s.rpe >= 7 ? 'var(--orange)' : 'var(--green)' }}>RPE {s.rpe}</p><p style={{ fontSize: 11, color: 'var(--text-3)' }}>{new Date(s.logged_at).toLocaleDateString()}</p></div>
          </div>
        ); })}
      </div>
    </div>
  );
}

function VolumeChart({ userId }) {
  const [sessions, setSessions] = useState([]);
  useEffect(() => {
    supabase.from('cardio_sessions').select('*').eq('user_id', userId)
      .order('logged_at', { ascending: true }).limit(30)
      .then(({ data }) => setSessions(data || []));
  }, [userId]);

  const typeColors = { rehiit: 'var(--red)', hiit: 'var(--orange)', threshold: 'var(--blue)', zone2: 'var(--green)' };
  const typeLabels = { rehiit: 'REHIIT', hiit: 'HIIT', threshold: 'Threshold', zone2: 'Zone 2' };

  if (sessions.length === 0) return (
    <div className="card" style={{ marginBottom: 12, textAlign: 'center', padding: 32 }}>
      <p style={{ fontSize: 13, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>No sessions logged yet</p>
    </div>
  );

  // Weekly volume by type
  const byWeek = {};
  sessions.forEach(s => {
    const d = new Date(s.logged_at);
    const dow = d.getDay();
    const mon = new Date(d); mon.setDate(d.getDate() - (dow === 0 ? 6 : dow - 1)); mon.setHours(0,0,0,0);
    const key = mon.toISOString().split('T')[0];
    if (!byWeek[key]) byWeek[key] = { rehiit: 0, hiit: 0, threshold: 0, zone2: 0, total: 0 };
    byWeek[key][s.session_type] = (byWeek[key][s.session_type] || 0) + (s.duration_minutes || 0);
    byWeek[key].total += (s.duration_minutes || 0);
  });

  const weeks = Object.entries(byWeek).sort(([a],[b]) => a.localeCompare(b)).slice(-8);
  const maxTotal = Math.max(...weeks.map(([,v]) => v.total), 1);

  return (
    <div className="card" style={{ marginBottom: 12 }}>
      <p style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>Weekly Volume (min)</p>
      <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', height: 100, marginBottom: 8 }}>
        {weeks.map(([week, v]) => (
          <div key={week} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: 80 }}>
              {['zone2','threshold','hiit','rehiit'].map(type => v[type] > 0 && (
                <div key={type} style={{ width: '100%', height: `${(v[type] / maxTotal) * 80}px`, background: typeColors[type], borderRadius: 3, marginBottom: 1 }} />
              ))}
            </div>
            <p style={{ fontSize: 9, color: 'var(--text-3)', fontFamily: 'var(--font-mono)', writingMode: 'vertical-rl', transform: 'rotate(180deg)', whiteSpace: 'nowrap' }}>
              {new Date(week).toLocaleDateString('en',{month:'short',day:'numeric'})}
            </p>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 8 }}>
        {Object.entries(typeLabels).map(([k,v]) => (
          <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: typeColors[k] }} />
            <span style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProgressView({ userId, program }) {
  const [subTab, setSubTab] = useState('volume');
  return (
    <div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        {['volume', 'vo2max'].map(t => (
          <button key={t} onClick={() => setSubTab(t)} style={{
            flex: 1, padding: '8px', borderRadius: 10, border: 'none', cursor: 'pointer',
            background: subTab === t ? 'var(--green)' : 'var(--bg-2)',
            color: subTab === t ? '#000' : 'var(--text-2)',
            fontSize: 13, fontWeight: 500, textTransform: 'capitalize', transition: 'all 0.15s',
          }}>{t === 'vo2max' ? 'VO2Max' : 'Volume'}</button>
        ))}
      </div>
      {subTab === 'volume' ? (
        <>
          {userId && <VolumeChart userId={userId} />}
          {userId && program && <RecentSessions userId={userId} program={program} />}
        </>
      ) : (
        userId && <Vo2MaxTracker userId={userId} />
      )}
    </div>
  );
}

export default function CardioScreen() {
  const { user, profile } = useAuth();
  const [activeSession, setActiveSession] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [view, setView] = useState('sessions');
  const [justSaved, setJustSaved] = useState(false);
  const program = profile?.is_admin ? carlCardioProgram : sonCardioProgram;

  const handleComplete = async (data) => { if (!user) return; await supabase.from('cardio_sessions').insert({ ...data, user_id: user.id }); setActiveSession(null); setJustSaved(true); setTimeout(() => setJustSaved(false), 2500); };

  if (activeSession) return <ActiveSession session={activeSession} onComplete={handleComplete} onBack={() => setActiveSession(null)} />;

  return (
    <div className="page">
      <div className="page-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, paddingTop: 8 }}>Cardio</h2>
          <button className="btn btn-ghost" style={{ padding: '8px 12px', fontSize: 12 }} onClick={() => setShowProfile(true)}>Lab Values</button>
        </div>
        {justSaved && (<div className="animate-fade-in" style={{ background: 'var(--green-glow)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 12, padding: '10px 14px', marginBottom: 12, textAlign: 'center' }}><p style={{ fontSize: 13, color: 'var(--green)', fontWeight: 600 }}>Session saved ✓</p></div>)}
        <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>{['sessions','progress'].map(v => (<button key={v} onClick={() => setView(v)} style={{ flex: 1, padding: '8px', borderRadius: 10, border: 'none', cursor: 'pointer', background: view === v ? 'var(--green)' : 'var(--bg-2)', color: view === v ? '#000' : 'var(--text-2)', fontSize: 13, fontWeight: 500, textTransform: 'capitalize', transition: 'all 0.15s' }}>{v}</button>))}</div>
        {view === 'sessions' ? (
          <>
            <p className="stat-label" style={{ marginBottom: 10 }}>{program.sessionsPerWeek}x/week recommended</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
              {Object.values(program.sessions).map(s => (<SessionCard key={s.id} session={s} onStart={setActiveSession} />))}
            </div>
            {user && <RecentSessions userId={user.id} program={program} />}
          </>
        ) : (
          <ProgressView userId={user?.id} program={program} />
        )}
      </div>
      {showProfile && user && <FitnessProfileModal userId={user.id} onClose={() => setShowProfile(false)} />}
    </div>
  );
}
