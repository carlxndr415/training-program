// Cardio Programs — evidence-based VO2max training
// Research: HIIT > Zone2 per minute at 1-4hr/week volumes (2025 meta-analysis)
// Structure: REHIIT (max stimulus/min), HIIT (4x4), Threshold, Zone2 (base)

export const carlCardioProgram = {
  id: 'carl_cardio',
  name: 'Cardio — VO2Max',
  sessionsPerWeek: 3,
  sessions: {
    rehiit: {
      id: 'rehiit',
      name: 'REHIIT',
      subtitle: 'Reduced Exertion HIIT',
      duration: 10,
      description: 'Maximum VO2max stimulus per minute. 2×20s all-out sprints.',
      equipment: ['Assault Bike', 'Hill Sprints'],
      defaultEquipment: 'Assault Bike',
      color: 'var(--red)',
      // Flat structure — no sub-phases needed for 20s sprints
      phases: [
        { id: 'warmup',    label: 'Warm-up',    duration: 180, rpeTarget: '2-3', type: 'easy' },
        { id: 'sprint1',   label: 'Sprint 1',   duration: 20,  rpeTarget: '10',  type: 'max', logPerInterval: true },
        { id: 'recovery1', label: 'Recovery',   duration: 150, rpeTarget: '2',   type: 'easy' },
        { id: 'sprint2',   label: 'Sprint 2',   duration: 20,  rpeTarget: '10',  type: 'max', logPerInterval: true },
        { id: 'cooldown',  label: 'Cool-down',  duration: 180, rpeTarget: '2',   type: 'easy' },
      ],
    },
    hiit: {
      id: 'hiit',
      name: 'HIIT',
      subtitle: '4×4 Intervals',
      duration: 25,
      description: '4 intervals at 90-95% HRmax with full recovery.',
      equipment: ['Outdoor Running', 'Outdoor Hills', 'Treadmill', 'Assault Bike'],
      defaultEquipment: 'Outdoor Running',
      color: 'var(--orange)',
      intervals: 4,
      workDuration: 240,   // 4 min
      restDuration: 180,   // 3 min
      // Phases built dynamically from intervals
      phases: [
        { id: 'warmup', label: 'Warm-up', duration: 300, rpeTarget: '3-4', type: 'easy' },
        // intervals injected at runtime
        { id: 'cooldown', label: 'Cool-down', duration: 300, rpeTarget: '3', type: 'easy' },
      ],
    },
    threshold: {
      id: 'threshold',
      name: 'Threshold',
      subtitle: 'Lactate Threshold Tempo',
      duration: 30,
      description: 'Sustained effort at aerobic-anaerobic threshold. RPE 6-7.',
      equipment: ['Outdoor Running', 'Treadmill', 'Bike', 'Rower'],
      defaultEquipment: 'Outdoor Running',
      color: 'var(--blue)',
      phases: [
        { id: 'warmup',    label: 'Warm-up',   duration: 300, rpeTarget: '3',   type: 'easy' },
        { id: 'threshold', label: 'Threshold', duration: 1200, rpeTarget: '6-7', type: 'work' },
        { id: 'cooldown',  label: 'Cool-down', duration: 300, rpeTarget: '2-3', type: 'easy' },
      ],
    },
    zone2: {
      id: 'zone2',
      name: 'Zone 2',
      subtitle: 'Aerobic Base',
      duration: 40,
      description: 'Conversational pace below aerobic threshold. RPE 3-4.',
      equipment: ['Outdoor Running', 'Treadmill', 'Assault Bike', 'Rower'],
      defaultEquipment: 'Outdoor Running',
      color: 'var(--green)',
      phases: [
        { id: 'zone2', label: 'Zone 2', duration: 2400, rpeTarget: '3-4', type: 'easy' },
      ],
    },
  },
};

export const sonCardioProgram = {
  id: 'son_cardio',
  name: 'Cardio — VO2Max',
  sessionsPerWeek: 3,
  sessions: {
    rehiit: {
      id: 'rehiit',
      name: 'REHIIT',
      subtitle: 'Sprint Intervals',
      duration: 10,
      description: '2×20s all-out rowing sprints.',
      equipment: ['Rower'],
      defaultEquipment: 'Rower',
      color: 'var(--red)',
      phases: [
        { id: 'warmup',    label: 'Warm-up',   duration: 180, rpeTarget: '2-3', type: 'easy' },
        { id: 'sprint1',   label: 'Sprint 1',  duration: 20,  rpeTarget: '10',  type: 'max', logPerInterval: true },
        { id: 'recovery1', label: 'Recovery',  duration: 150, rpeTarget: '2',   type: 'easy' },
        { id: 'sprint2',   label: 'Sprint 2',  duration: 20,  rpeTarget: '10',  type: 'max', logPerInterval: true },
        { id: 'cooldown',  label: 'Cool-down', duration: 180, rpeTarget: '2',   type: 'easy' },
      ],
    },
    hiit: {
      id: 'hiit',
      name: 'HIIT',
      subtitle: 'Hill / Running Intervals',
      duration: 20,
      description: '4 hard intervals with full recovery.',
      equipment: ['Outdoor Running', 'Hills'],
      defaultEquipment: 'Outdoor Running',
      color: 'var(--orange)',
      intervals: 4,
      workDuration: 180,  // 3 min
      restDuration: 180,  // 3 min
      phases: [
        { id: 'warmup', label: 'Warm-up', duration: 300, rpeTarget: '3', type: 'easy' },
        { id: 'cooldown', label: 'Cool-down', duration: 300, rpeTarget: '3', type: 'easy' },
      ],
    },
    zone2: {
      id: 'zone2',
      name: 'Zone 2',
      subtitle: 'Easy Run',
      duration: 25,
      description: 'Easy conversational run. RPE 3-4.',
      equipment: ['Outdoor Running'],
      defaultEquipment: 'Outdoor Running',
      color: 'var(--green)',
      phases: [
        { id: 'zone2', label: 'Easy Run', duration: 1500, rpeTarget: '3-4', type: 'easy' },
      ],
    },
  },
};

export const cardioRegistry = {
  carl_cardio: carlCardioProgram,
  son_cardio: sonCardioProgram,
};

// Build full phase list for HIIT with individual interval sub-phases
export const buildHiitPhases = (session) => {
  const phases = [];
  // Warm-up
  phases.push(session.phases[0]);
  // Interval rounds
  for (let i = 1; i <= session.intervals; i++) {
    phases.push({
      id: `work_${i}`,
      label: `Interval ${i} — Work`,
      duration: session.workDuration,
      rpeTarget: '8-9',
      type: 'work',
      intervalNum: i,
      logPerInterval: true,
    });
    if (i < session.intervals) {
      phases.push({
        id: `rest_${i}`,
        label: `Interval ${i} — Recovery`,
        duration: session.restDuration,
        rpeTarget: '2-3',
        type: 'easy',
        intervalNum: i,
      });
    }
  }
  // Cool-down
  phases.push(session.phases[session.phases.length - 1]);
  return phases;
};

export const getSessionPhases = (session) => {
  if (session.id === 'hiit') return buildHiitPhases(session);
  return session.phases;
};

export const calcHrZones = (labValues) => {
  const { peakHr, aerobicThresholdHr, anaerobicThresholdHr } = labValues || {};
  if (!peakHr) return null;
  const z2Top = aerobicThresholdHr || Math.round(peakHr * 0.77);
  const z3Top = anaerobicThresholdHr || Math.round(peakHr * 0.88);
  const z4Top = Math.round(peakHr * 0.95);
  return [
    { zone: 1, name: 'Recovery',  color: '#64748b', range: [0, Math.round(z2Top * 0.85)] },
    { zone: 2, name: 'Aerobic',   color: '#22c55e', range: [Math.round(z2Top * 0.85), z2Top] },
    { zone: 3, name: 'Threshold', color: '#3b82f6', range: [z2Top, z3Top] },
    { zone: 4, name: 'HIIT',      color: '#f97316', range: [z3Top, z4Top] },
    { zone: 5, name: 'Max',       color: '#ef4444', range: [z4Top, peakHr + 10] },
  ];
};
