import React, { useState } from 'react';
import {
  getProfiles, getActiveProfileId, setActiveProfile,
  createProfile, renameProfile, deleteProfile,
} from '../utils/profileManager';

export default function ProfileSwitcher({ onProfileChange, setupMode = false, onProfileCreated }) {
  const [profiles, setProfiles] = useState(getProfiles());
  const [activeId, setActiveId]   = useState(getActiveProfileId());
  const [newName, setNewName]     = useState('');
  const [adding, setAdding]       = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName]   = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);

  const refresh = () => {
    setProfiles(getProfiles());
    setActiveId(getActiveProfileId());
  };

  const handleSelect = (id) => {
    setActiveProfile(id);
    refresh();
    if (onProfileChange) onProfileChange(id);
  };

  const handleAdd = () => {
    if (!newName.trim()) return;
    const p = createProfile(newName);
    setActiveProfile(p.id);
    refresh();
    setNewName('');
    setAdding(false);
    if (setupMode && onProfileCreated) { onProfileCreated(p.id); return; }
    if (onProfileChange) onProfileChange(p.id);
  };

  const handleRename = (id) => {
    if (!editName.trim()) return;
    renameProfile(id, editName);
    refresh();
    setEditingId(null);
  };

  const handleDelete = (id) => {
    deleteProfile(id);
    const remaining = getProfiles();
    if (remaining.length > 0) {
      setActiveProfile(remaining[0].id);
      if (onProfileChange) onProfileChange(remaining[0].id);
    }
    refresh();
    setConfirmDelete(null);
  };

  const activeProfile = profiles.find(p => p.id === activeId);
  const isAdmin = activeProfile?.isAdmin;

  // Setup mode — full screen welcome
  if (setupMode && profiles.length === 0) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: 'var(--bg)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: 20, padding: 32, width: '100%', maxWidth: 360 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>Welcome</h2>
          <p style={{ fontSize: 14, color: 'var(--text-2)', marginBottom: 24, lineHeight: 1.5 }}>Create your profile to get started. The first profile becomes the admin.</p>
          <input type="text" value={newName} onChange={e => setNewName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAdd()} placeholder="Your name" className="input" style={{ marginBottom: 12 }} autoFocus />
          <button onClick={handleAdd} disabled={!newName.trim()} className="btn btn-primary btn-lg btn-full" style={{ opacity: newName.trim() ? 1 : 0.4 }}>
            Get Started
          </button>
        </div>
      </div>
    );
  }

  // Settings mode — list of profile buttons
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {profiles.map(p => {
        const isActive = p.id === activeId;
        const isEditing = editingId === p.id;
        const isDeleting = confirmDelete === p.id;

        if (isEditing) {
          return (
            <div key={p.id} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                type="text" value={editName} onChange={e => setEditName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleRename(p.id)}
                className="input" style={{ flex: 1 }} autoFocus
              />
              <button className="btn btn-primary" style={{ padding: '10px 16px' }} onClick={() => handleRename(p.id)}>Save</button>
              <button className="btn btn-ghost" style={{ padding: '10px 16px' }} onClick={() => setEditingId(null)}>Cancel</button>
            </div>
          );
        }

        if (isDeleting) {
          return (
            <div key={p.id} style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 12, padding: '12px 14px' }}>
              <p style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 10 }}>Delete <strong style={{ color: 'var(--text)' }}>{p.name}</strong> and all their data?</p>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-full" style={{ background: 'var(--red)', color: '#fff', flex: 1 }} onClick={() => handleDelete(p.id)}>Delete</button>
                <button className="btn btn-ghost btn-full" style={{ flex: 1 }} onClick={() => setConfirmDelete(null)}>Cancel</button>
              </div>
            </div>
          );
        }

        return (
          <div
            key={p.id}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '12px 14px', borderRadius: 12,
              background: isActive ? 'var(--green-glow)' : 'var(--bg-2)',
              border: `1px solid ${isActive ? 'rgba(34,197,94,0.3)' : 'var(--border)'}`,
              transition: 'all 0.15s',
            }}
          >
            {/* Avatar */}
            <div style={{
              width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
              background: p.isAdmin ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'linear-gradient(135deg, #3b82f6, #06b6d4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: '#fff',
            }}>
              {p.name[0].toUpperCase()}
            </div>

            {/* Name + role */}
            <button
              onClick={() => handleSelect(p.id)}
              style={{ flex: 1, textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <p style={{ fontSize: 14, fontWeight: isActive ? 600 : 400, color: 'var(--text)' }}>{p.name}</p>
              <p style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>
                {p.isAdmin ? 'Admin' : 'Member'}{isActive ? ' · Active' : ''}
              </p>
            </button>

            {/* Active indicator */}
            {isActive && (
              <span style={{ color: 'var(--green)', fontSize: 16, flexShrink: 0 }}>✓</span>
            )}

            {/* Admin actions — only shown for active admin on their own card or any card */}
            {isAdmin && (
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                <button
                  onClick={() => { setEditingId(p.id); setEditName(p.name); }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', fontSize: 13, padding: '4px 6px', borderRadius: 6 }}
                  title="Rename"
                >✎</button>
                {profiles.length > 1 && (
                  <button
                    onClick={() => setConfirmDelete(p.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', fontSize: 13, padding: '4px 6px', borderRadius: 6 }}
                    title="Delete"
                  >✕</button>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Add profile */}
      {adding ? (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 4 }}>
          <input type="text" value={newName} onChange={e => setNewName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAdd()} placeholder="Name" className="input" style={{ flex: 1 }} autoFocus />
          <button className="btn btn-primary" style={{ padding: '10px 16px' }} onClick={handleAdd}>Add</button>
          <button className="btn btn-ghost" style={{ padding: '10px 16px' }} onClick={() => { setAdding(false); setNewName(''); }}>✕</button>
        </div>
      ) : (
        <button
          className="btn btn-ghost btn-full"
          style={{ marginTop: 4, borderStyle: 'dashed' }}
          onClick={() => setAdding(true)}
        >
          + Add Profile
        </button>
      )}
    </div>
  );
}
