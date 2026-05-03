import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import NotificationSettings from './NotificationSettings';
import { getProfileProgram, getAllPrograms, setSelectedProgramId } from '../utils/programManager';
import { initBlock } from '../utils/periodization';
import WorkoutEditor from './WorkoutEditor';

export default function SettingsScreen() {
  const { profile, signOut } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState(getProfileProgram()?.id);
  const allPrograms = getAllPrograms();

  const handleProgramSelect = (id) => {
    setSelectedProgramId(id);
    setSelectedProgram(id);
    initBlock(id, 4);
  };

  return (
    <div className="page">
      <div className="page-content">
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, marginBottom: 20, paddingTop: 8 }}>Settings</h2>

        {/* Account */}
        <div className="card" style={{ marginBottom: 12 }}>
          <p style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Account</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
            <div style={{
              width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
              background: profile?.is_admin ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'linear-gradient(135deg, #3b82f6, #06b6d4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: '#fff',
            }}>
              {(profile?.name || 'U')[0].toUpperCase()}
            </div>
            <div>
              <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>{profile?.name}</p>
              <p style={{ fontSize: 12, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>
                {profile?.is_admin ? 'Admin' : 'Member'}
              </p>
            </div>
          </div>
          <button className="btn btn-ghost btn-full" onClick={signOut}>Sign Out</button>
        </div>

        {/* Program */}
        <div className="card" style={{ marginBottom: 12 }}>
          <p style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Program</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {allPrograms.map(p => (
              <button key={p.id} onClick={() => handleProgramSelect(p.id)} style={{
                textAlign: 'left', padding: '12px 14px', borderRadius: 12,
                background: selectedProgram === p.id ? 'var(--green-glow)' : 'var(--bg-2)',
                border: `1px solid ${selectedProgram === p.id ? 'rgba(34,197,94,0.3)' : 'var(--border)'}`,
                cursor: 'pointer', transition: 'all 0.15s',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)', marginBottom: 2 }}>{p.name}</p>
                    <p style={{ fontSize: 12, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>{p.daysPerWeek}-day · {p.blockLength}-week blocks</p>
                  </div>
                  {selectedProgram === p.id && <span style={{ color: 'var(--green)' }}>✓</span>}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Customize */}
        <div className="card" style={{ marginBottom: 12 }}>
          <p style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Customize</p>
          <button className="btn btn-secondary btn-full" onClick={() => setShowEditor(true)}>Edit Workouts</button>
        </div>

        {/* Reminders */}
        <div className="card" style={{ marginBottom: 12 }}>
          <p style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Reminders</p>
          <button className="btn btn-secondary btn-full" onClick={() => setShowNotifications(true)}>Workout Reminders</button>
        </div>

        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          <p style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>Based on Schoenfeld & McDonald research</p>
        </div>
      </div>

      {showNotifications && <NotificationSettings onClose={() => setShowNotifications(false)} />}
      {showEditor && <WorkoutEditor onClose={() => setShowEditor(false)} onSave={() => { setShowEditor(false); window.location.reload(); }} />}
    </div>
  );
}
