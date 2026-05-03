import React, { useState } from 'react';
import { Plus, Trash2, RotateCcw, Save, ChevronDown, ChevronUp, GripVertical, X } from 'lucide-react';
import { getProfileWorkouts, saveWorkout, resetWorkoutToDefault, isWorkoutCustomized } from '../utils/workoutStorage';
import { workouts as defaultWorkouts } from '../data/workouts';

const WORKOUT_ORDER = ['push1', 'pull1', 'legs1', 'push2', 'pull2', 'legs2'];

const emptyExercise = () => ({
  name: '',
  sets: 3,
  reps: '8-10',
  rest: 90,
  group: '',
  notes: '',
  equipment: ''
});

const WorkoutEditor = ({ onClose, onSave }) => {
  const [workouts, setWorkouts] = useState(getProfileWorkouts());
  const [selectedKey, setSelectedKey] = useState('push1');
  const [expandedIdx, setExpandedIdx] = useState(null);
  const [saved, setSaved] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const workout = workouts[selectedKey];

  const updateExercise = (idx, field, value) => {
    const updated = { ...workouts };
    updated[selectedKey] = {
      ...updated[selectedKey],
      exercises: updated[selectedKey].exercises.map((ex, i) =>
        i === idx ? { ...ex, [field]: value } : ex
      )
    };
    setWorkouts(updated);
    setSaved(false);
  };

  const addExercise = () => {
    const updated = { ...workouts };
    const exercises = [...updated[selectedKey].exercises, emptyExercise()];
    updated[selectedKey] = { ...updated[selectedKey], exercises };
    setWorkouts(updated);
    setExpandedIdx(exercises.length - 1);
    setSaved(false);
  };

  const removeExercise = (idx) => {
    const updated = { ...workouts };
    updated[selectedKey] = {
      ...updated[selectedKey],
      exercises: updated[selectedKey].exercises.filter((_, i) => i !== idx)
    };
    setWorkouts(updated);
    if (expandedIdx === idx) setExpandedIdx(null);
    setSaved(false);
  };

  const moveExercise = (idx, direction) => {
    const exercises = [...workout.exercises];
    const newIdx = idx + direction;
    if (newIdx < 0 || newIdx >= exercises.length) return;
    [exercises[idx], exercises[newIdx]] = [exercises[newIdx], exercises[idx]];
    const updated = { ...workouts };
    updated[selectedKey] = { ...updated[selectedKey], exercises };
    setWorkouts(updated);
    setExpandedIdx(newIdx);
    setSaved(false);
  };

  const handleSave = () => {
    saveWorkout(selectedKey, workouts[selectedKey]);
    setSaved(true);
    if (onSave) onSave(workouts);
  };

  const handleReset = () => {
    resetWorkoutToDefault(selectedKey);
    const fresh = getProfileWorkouts();
    setWorkouts(fresh);
    setShowResetConfirm(false);
    setSaved(false);
    setExpandedIdx(null);
  };

  const updateWorkoutMeta = (field, value) => {
    const updated = { ...workouts };
    updated[selectedKey] = { ...updated[selectedKey], [field]: value };
    setWorkouts(updated);
    setSaved(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center p-2 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl my-4">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">Edit Workouts</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        {/* Workout selector */}
        <div className="flex gap-1 px-4 pt-3 flex-wrap">
          {WORKOUT_ORDER.map(key => (
            <button
              key={key}
              onClick={() => { setSelectedKey(key); setExpandedIdx(null); setSaved(false); }}
              className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                selectedKey === key
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
              }`}
            >
              {workouts[key]?.name || key}
              {isWorkoutCustomized(key) && (
                <span className="ml-1 text-xs opacity-70">●</span>
              )}
            </button>
          ))}
        </div>

        {/* Workout meta */}
        <div className="px-4 pt-3 pb-2 grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Workout Name</label>
            <input
              type="text"
              value={workout.name}
              onChange={e => updateWorkoutMeta('name', e.target.value)}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Description</label>
            <input
              type="text"
              value={workout.description || ''}
              onChange={e => updateWorkoutMeta('description', e.target.value)}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900"
            />
          </div>
        </div>

        {/* Exercise list */}
        <div className="px-4 pb-2 space-y-2 max-h-[55vh] overflow-y-auto">
          {workout.exercises.map((exercise, idx) => (
            <div key={idx} className="border border-gray-200 rounded-lg overflow-hidden">
              {/* Exercise header row */}
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-50">
                <div className="flex flex-col gap-0.5">
                  <button onClick={() => moveExercise(idx, -1)} disabled={idx === 0} className="text-gray-400 hover:text-gray-600 disabled:opacity-20">
                    <ChevronUp size={12} />
                  </button>
                  <button onClick={() => moveExercise(idx, 1)} disabled={idx === workout.exercises.length - 1} className="text-gray-400 hover:text-gray-600 disabled:opacity-20">
                    <ChevronDown size={12} />
                  </button>
                </div>
                <span className="text-xs text-gray-400 w-4">{idx + 1}</span>
                <button
                  className="flex-1 text-left text-sm font-medium text-gray-900 truncate"
                  onClick={() => setExpandedIdx(expandedIdx === idx ? null : idx)}
                >
                  {exercise.name || <span className="text-gray-400 italic">New exercise</span>}
                </button>
                <span className="text-xs text-gray-500 flex-shrink-0">
                  {exercise.sets}×{exercise.reps} • {exercise.rest}s
                </span>
                <button
                  onClick={() => setExpandedIdx(expandedIdx === idx ? null : idx)}
                  className="text-gray-400 hover:text-gray-600 ml-1"
                >
                  {expandedIdx === idx ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                <button
                  onClick={() => removeExercise(idx)}
                  className="text-gray-300 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              {/* Expanded exercise fields */}
              {expandedIdx === idx && (
                <div className="p-3 grid grid-cols-2 gap-2 border-t border-gray-100">
                  <div className="col-span-2">
                    <label className="block text-xs text-gray-500 mb-1">Exercise Name</label>
                    <input
                      type="text"
                      value={exercise.name}
                      onChange={e => updateExercise(idx, 'name', e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900"
                      placeholder="e.g. DB Bench Press"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Sets</label>
                    <input
                      type="number"
                      value={exercise.sets}
                      min={1} max={10}
                      onChange={e => updateExercise(idx, 'sets', parseInt(e.target.value) || 1)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Reps</label>
                    <input
                      type="text"
                      value={exercise.reps}
                      onChange={e => updateExercise(idx, 'reps', e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900"
                      placeholder="e.g. 8-10"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Rest (seconds)</label>
                    <input
                      type="number"
                      value={exercise.rest}
                      min={0}
                      onChange={e => updateExercise(idx, 'rest', parseInt(e.target.value) || 0)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Equipment</label>
                    <input
                      type="text"
                      value={exercise.equipment || ''}
                      onChange={e => updateExercise(idx, 'equipment', e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900"
                      placeholder="e.g. Dumbbells"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs text-gray-500 mb-1">Notes</label>
                    <textarea
                      value={exercise.notes || ''}
                      onChange={e => updateExercise(idx, 'notes', e.target.value)}
                      rows={2}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900 resize-none"
                      placeholder="Coaching cues, technique notes..."
                    />
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Add exercise */}
          <button
            onClick={addExercise}
            className="w-full flex items-center justify-center gap-2 py-2 border border-dashed border-blue-400 text-blue-600 hover:bg-blue-50 rounded-lg text-sm transition-colors"
          >
            <Plus size={16} />
            Add Exercise
          </button>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
          <div>
            {showResetConfirm ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-600">Reset to default?</span>
                <button onClick={handleReset} className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700">Yes</button>
                <button onClick={() => setShowResetConfirm(false)} className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300">No</button>
              </div>
            ) : (
              <button
                onClick={() => setShowResetConfirm(true)}
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-600 transition-colors"
              >
                <RotateCcw size={14} />
                Reset to Default
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="px-4 py-2 text-sm text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors">
              Cancel
            </button>
            <button
              onClick={handleSave}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                saved ? 'bg-green-600 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              <Save size={14} />
              {saved ? 'Saved' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkoutEditor;
