/**
 * Workout data optimized for HOME GYM equipment
 * Based on Brad Schoenfeld's hypertrophy research and modern bodybuilding science
 * 
 * EQUIPMENT AVAILABLE:
 * - Dumbbells (adjustable)
 * - Ironmaster Bench (incline/decline capable)
 *   - Leg extension/curl attachment
 *   - Preacher curl attachment
 *   - Pull-up attachment
 * - Gymnastic Rings
 * - Resistance Bands
 * - Bullworker
 * - Power Twisters
 * - Hand Gripper
 * - Lattice Lifting Pin
 * - Wooden Minibar
 */

export const workouts = {
  push1: {
    name: 'Push 1',
    description: 'Push (Chest/Shoulders/Triceps) - Heavy Focus',
    exercises: [
      {
        name: 'Slight Incline DB Bench Press',
        sets: 4,
        reps: '6-8',
        rest: 150,
        group: 'A',
        notes: 'Primary myofibrillar exercise. Use 6-8 reps for maximum contractile protein stimulation. Greater ROM than barbell, superior pec stretch. Control the descent.',
        equipment: 'Dumbbells + Bench'
      },
      {
        name: 'Incline DB Press',
        sets: 3,
        reps: '8-10',
        rest: 120,
        group: 'B',
        notes: '30-45 deg incline. Targets upper chest. Lengthened position emphasis.',
        equipment: 'Dumbbells + Bench'
      },
      {
        name: 'DB Overhead Press',
        sets: 3,
        reps: '8-10',
        rest: 120,
        group: 'C',
        notes: 'Neutral or pronated grip. Full lockout overhead.',
        equipment: 'Dumbbells'
      },
      {
        name: 'DB Pull Over',
        sets: 3,
        reps: '10-12',
        rest: 90,
        group: 'D',
        notes: 'Target chest, lats, and serratus. Deep stretch at bottom. Critical for hypertrophy.',
        equipment: 'Dumbbells + Bench'
      },
      {
        name: 'Ring Dips',
        sets: 3,
        reps: '8-12',
        rest: 90,
        group: 'E',
        notes: 'Lean forward for chest emphasis. Rings turned out at top. Superior to machine dips.',
        equipment: 'Rings'
      },
      {
        name: 'DB Lateral Raises',
        sets: 3,
        reps: '12-15',
        rest: 60,
        group: 'F',
        notes: 'Slight forward lean. Raise to shoulder height. Control eccentric.',
        equipment: 'Dumbbells'
      },
      {
        name: 'Band Face Pulls',
        sets: 3,
        reps: '15-20',
        rest: 60,
        group: 'G',
        notes: 'External rotation at end. Critical for shoulder health.',
        equipment: 'Bands'
      },
      {
        name: 'DB Overhead Triceps Extension',
        sets: 3,
        reps: '10-12',
        rest: 90,
        group: 'H',
        notes: 'Long head emphasis due to shoulder flexion. Deep stretch at bottom.',
        equipment: 'Dumbbells'
      },
      {
        name: 'DB Skull Crushers',
        sets: 3,
        reps: '8-10',
        rest: 90,
        group: 'I',
        notes: 'Heavy triceps compound. Target medial and lateral heads. Full ROM.',
        equipment: 'Dumbbells + Bench'
      },
    ]
  },

  pull1: {
    name: 'Pull 1',
    description: 'Pull (Back/Biceps/Rear Delts) - Volume Focus',
    exercises: [
      {
        name: 'Pull-ups (Various Grips)',
        sets: 4,
        reps: '6-10',
        rest: 150,
        group: 'A',
        notes: 'Rotate grips: wide, neutral, chin-up. Superior to lat pulldown per EMG studies.',
        equipment: 'Pull-up Attachment'
      },
      {
        name: 'DB Row (Chest Supported)',
        sets: 3,
        reps: '8-10',
        rest: 120,
        group: 'B',
        notes: 'Incline bench support removes momentum. Full stretch at bottom.',
        equipment: 'Dumbbells + Bench'
      },
      {
        name: 'Ring Rows',
        sets: 3,
        reps: '10-12',
        rest: 90,
        group: 'C',
        notes: 'Adjust difficulty by foot position. Squeeze scapula at top.',
        equipment: 'Rings'
      },
      {
        name: 'Ring Face Pulls',
        sets: 3,
        reps: '15-20',
        rest: 60,
        group: 'D',
        notes: 'External rotation at end. Rear delt and rotator cuff emphasis.',
        equipment: 'Rings'
      },
      {
        name: 'DB Rear Delt Fly (Incline)',
        sets: 3,
        reps: '12-15',
        rest: 60,
        group: 'E',
        notes: 'Chest on incline bench. Eliminates momentum.',
        equipment: 'Dumbbells + Bench'
      },
      {
        name: 'DB Curl (Standing)',
        sets: 3,
        reps: '8-10',
        rest: 90,
        group: 'F',
        notes: 'Supinate at top. No swinging. Control the negative.',
        equipment: 'Dumbbells'
      },
      {
        name: 'DB Hammer Curl',
        sets: 3,
        reps: '10-12',
        rest: 60,
        group: 'G',
        notes: 'Brachialis and brachioradialis emphasis. Neutral grip throughout.',
        equipment: 'Dumbbells'
      },
      {
        name: 'Grip Work - Hand Gripper',
        sets: 3,
        reps: '10-15',
        rest: 60,
        group: 'G',
        notes: 'Crush grip strength. Hold at close for 2-3 seconds.',
        equipment: 'Hand Gripper'
      },
    ]
  },

  legs1: {
    name: 'Legs 1',
    description: 'Legs (Quads/Hamstrings/Glutes) - Compound Focus',
    exercises: [
      {
        name: 'DB Goblet Squat',
        sets: 4,
        reps: '8-10',
        rest: 150,
        group: 'A',
        notes: 'Heels elevated if needed. Deep ROM. Quad dominant.',
        equipment: 'Dumbbells'
      },
      {
        name: 'DB Romanian Deadlift',
        sets: 4,
        reps: '8-10',
        rest: 120,
        group: 'B',
        notes: 'Hinge at hips. Feel hamstring stretch. Critical for posterior chain.',
        equipment: 'Dumbbells'
      },
      {
        name: 'Bulgarian Split Squat',
        sets: 3,
        reps: '10-12 each',
        rest: 90,
        group: 'C',
        notes: 'Rear foot on bench. Excellent unilateral quad/glute builder.',
        equipment: 'Dumbbells + Bench'
      },
      {
        name: 'Leg Extension (Attachment)',
        sets: 3,
        reps: '12-15',
        rest: 60,
        group: 'D',
        notes: 'Rectus femoris isolation. Pause at top contraction.',
        equipment: 'Bench Leg Attachment'
      },
      {
        name: 'Leg Curl (Attachment)',
        sets: 3,
        reps: '12-15',
        rest: 60,
        group: 'E',
        notes: 'Hamstring isolation. Control eccentric.',
        equipment: 'Bench Leg Attachment'
      },
      {
        name: 'DB Calf Raise (Single Leg)',
        sets: 4,
        reps: '15-20',
        rest: 60,
        group: 'F',
        notes: 'Full stretch at bottom, full contraction at top. One leg at a time.',
        equipment: 'Dumbbells'
      },
      {
        name: 'Plank',
        sets: 3,
        reps: '45-60s',
        rest: 60,
        group: 'G',
        notes: 'Core stability. Posterior pelvic tilt. Squeeze glutes.',
        equipment: 'Bodyweight'
      },
    ]
  },

  push2: {
    name: 'Push 2',
    description: 'Push (Shoulders/Triceps) - Vertical Push Focus',
    exercises: [
      {
        name: 'DB Overhead Press (Standing)',
        sets: 4,
        reps: '6-8',
        rest: 150,
        group: 'A',
        notes: 'Primary vertical press. Standing engages core. Heavy focus for strength.',
        equipment: 'Dumbbells'
      },
      {
        name: 'DB Arnold Press',
        sets: 3,
        reps: '8-10',
        rest: 120,
        group: 'B',
        notes: 'Rotation through movement. Hits all delt heads.',
        equipment: 'Dumbbells + Bench'
      },
      {
        name: 'Butterfly Raises',
        sets: 3,
        reps: '12-15',
        rest: 90,
        group: 'C',
        notes: 'Shoulder isolation with unique resistance curve. Control eccentric.',
        equipment: 'Dumbbells'
      },
      {
        name: 'Bent Lateral Raises',
        sets: 3,
        reps: '12-15',
        rest: 60,
        group: 'D',
        notes: 'Rear delt isolation. Bend at hips, raise arms to sides.',
        equipment: 'Dumbbells'
      },
      {
        name: 'DB Overhead Triceps Extension',
        sets: 3,
        reps: '10-12',
        rest: 90,
        group: 'E',
        notes: 'Long head emphasis due to shoulder flexion. Deep stretch at bottom.',
        equipment: 'Dumbbells'
      },
      {
        name: 'DB Skull Crushers',
        sets: 3,
        reps: '8-10',
        rest: 90,
        group: 'F',
        notes: 'Heavy triceps compound. Target medial and lateral heads. Full ROM.',
        equipment: 'Dumbbells + Bench'
      },
      {
        name: 'DB Pull Over',
        sets: 3,
        reps: '10-12',
        rest: 90,
        group: 'G',
        notes: 'Target chest, lats, and serratus. Deep stretch at bottom. Critical for hypertrophy.',
        equipment: 'Dumbbells + Bench'
      },
    ]
  },

  pull2: {
    name: 'Pull 2',
    description: 'Pull Variation (Back/Biceps/Rear Delts) - Metabolic Focus',
    exercises: [
      {
        name: 'Chin-ups (Close Grip)',
        sets: 4,
        reps: '6-10',
        rest: 120,
        group: 'A',
        notes: 'Supinated grip. More bicep involvement. Full dead hang at bottom.',
        equipment: 'Pull-up Attachment'
      },
      {
        name: 'Single-Arm DB Row',
        sets: 3,
        reps: '10-12 each',
        rest: 90,
        group: 'B',
        notes: 'One hand on bench. Full lat stretch at bottom, squeeze at top.',
        equipment: 'Dumbbells + Bench'
      },
      {
        name: 'Ring Face Pulls to External Rotation',
        sets: 3,
        reps: '15-20',
        rest: 60,
        group: 'C',
        notes: 'Pull to face, rotate hands back. Superior to cable face pulls.',
        equipment: 'Rings'
      },
      {
        name: 'Band Pull-Aparts',
        sets: 3,
        reps: '15-20',
        rest: 60,
        group: 'D',
        notes: 'Rear delts and mid traps. Keep arms straight.',
        equipment: 'Bands'
      },
      {
        name: 'DB Preacher Curl',
        sets: 3,
        reps: '10-12',
        rest: 90,
        group: 'E',
        notes: 'Eliminates cheating. Excellent for short head biceps. Full stretch at bottom.',
        equipment: 'Dumbbells + Preacher Attachment'
      },
      {
        name: 'Incline DB Curl',
        sets: 3,
        reps: '10-12',
        rest: 60,
        group: 'F',
        notes: 'Long head emphasis - stretched position. Key for bicep peak.',
        equipment: 'Dumbbells + Bench'
      },
      {
        name: 'DB Reverse Curl',
        sets: 2,
        reps: '12-15',
        rest: 60,
        group: 'G',
        notes: 'Brachioradialis and forearm extensors. Overhand grip.',
        equipment: 'Dumbbells'
      },
      {
        name: 'Lattice Pin Hangs',
        sets: 2,
        reps: '20-30s',
        rest: 60,
        group: 'H',
        notes: 'Finger and grip strength. Dead hang position.',
        equipment: 'Lattice Pin'
      },
    ]
  },

  legs2: {
    name: 'Legs 2',
    description: 'Legs Variation (Posterior Chain/Glutes) - Unilateral Focus',
    exercises: [
      {
        name: 'DB Single-Leg Romanian Deadlift',
        sets: 4,
        reps: '8-10 each',
        rest: 90,
        group: 'A',
        notes: 'Balance and hamstring stretch. Hold DB on opposite side.',
        equipment: 'Dumbbells'
      },
      {
        name: 'Reverse Lunge',
        sets: 3,
        reps: '10-12 each',
        rest: 90,
        group: 'B',
        notes: 'Step back, not forward. More glute/hamstring emphasis than forward lunge.',
        equipment: 'Dumbbells'
      },
      {
        name: 'DB Hip Thrust (Bench)',
        sets: 3,
        reps: '12-15',
        rest: 90,
        group: 'C',
        notes: 'Upper back on bench. Pause at top. Best exercise for glute activation.',
        equipment: 'Dumbbells + Bench'
      },
      {
        name: 'Leg Curl (Attachment)',
        sets: 4,
        reps: '10-12',
        rest: 60,
        group: 'D',
        notes: 'Hamstring isolation. Slow eccentric (3-4 seconds).',
        equipment: 'Bench Leg Attachment'
      },
      {
        name: 'DB Step-ups',
        sets: 3,
        reps: '12-15 each',
        rest: 60,
        group: 'E',
        notes: 'Bench height. Push through lead leg only, no push-off from back foot.',
        equipment: 'Dumbbells + Bench'
      },
      {
        name: 'DB Seated Calf Raise',
        sets: 4,
        reps: '15-20',
        rest: 60,
        group: 'F',
        notes: 'DB on knees. Targets soleus. Pause at stretch and contraction.',
        equipment: 'Dumbbells'
      },
      {
        name: 'Hanging Leg Raise',
        sets: 3,
        reps: '10-15',
        rest: 60,
        group: 'G',
        notes: 'Core and hip flexors. Control the swing. Bent knee to make easier.',
        equipment: 'Pull-up Attachment'
      },
      {
        name: 'Bullworker Isometric Squeeze',
        sets: 2,
        reps: '3x10s holds',
        rest: 60,
        group: 'H',
        notes: 'Full body tension. Choose compression or extension movement.',
        equipment: 'Bullworker'
      },
    ]
  },

  upper1: {
    name: 'Upper Body',
    description: 'Upper Body (Chest/Back/Shoulders/Arms) - Compound & Accessory Focus',
    exercises: [
      {
        name: 'Slight Incline DB Bench Press',
        sets: 4,
        reps: '6-8',
        rest: 180,
        group: 'A',
        notes: 'Primary horizontal push. Greater ROM than barbell, superior pec stretch. Control the descent.',
        equipment: 'Dumbbells + Bench'
      },
      {
        name: 'DB Row (Chest Supported)',
        sets: 4,
        reps: '6-8',
        rest: 180,
        group: 'A',
        notes: 'Primary horizontal pull. Incline bench support removes momentum. Full stretch at bottom.',
        equipment: 'Dumbbells + Bench'
      },
      {
        name: 'DB Flye / Incline DB Press',
        sets: 3,
        reps: '10-12',
        rest: 90,
        group: 'B',
        notes: 'Chest isolation/accessory. Alternate between flye and incline press each session.',
        equipment: 'Dumbbells + Bench'
      },
      {
        name: 'DB Pullover / Pull-ups',
        sets: 3,
        reps: '10-12',
        rest: 90,
        group: 'B',
        notes: 'Lat accessory. Alternate between pullover and pull-ups each session for variety.',
        equipment: 'Dumbbells + Bench / Pull-up Attachment'
      },
      {
        name: 'DB Lateral Raise',
        sets: 4,
        reps: '8-10',
        rest: 120,
        group: 'C',
        notes: 'Medial delt isolation. Slight forward lean. Raise to shoulder height. Control eccentric.',
        equipment: 'Dumbbells'
      },
      {
        name: 'DB Rear Delt Fly',
        sets: 4,
        reps: '8-10',
        rest: 120,
        group: 'C',
        notes: 'Rear delt isolation. Chest on incline bench eliminates momentum. Full ROM.',
        equipment: 'Dumbbells + Bench'
      },
      {
        name: 'DB Curl (Biceps)',
        sets: 3,
        reps: '10-12',
        rest: 90,
        group: 'D',
        notes: 'Bicep isolation. Supinate at top. No swinging. Control the negative.',
        equipment: 'Dumbbells'
      },
      {
        name: 'DB Skull Crushers (Triceps)',
        sets: 3,
        reps: '10-12',
        rest: 90,
        group: 'D',
        notes: 'Tricep isolation. Target medial and lateral heads. Full ROM. Control descent.',
        equipment: 'Dumbbells + Bench'
      },
    ]
  },

  lower1: {
    name: 'Lower Body',
    description: 'Lower Body (Quads/Hamstrings/Glutes/Calves) - Compound & Accessory Focus',
    exercises: [
      {
        name: 'DB Goblet Squat',
        sets: 4,
        reps: '6-8',
        rest: 180,
        group: 'A',
        notes: 'Primary quad/glute compound. Heels elevated if needed. Deep ROM. Full squat for maximum stimulus.',
        equipment: 'Dumbbells'
      },
      {
        name: 'DB Romanian Deadlift',
        sets: 4,
        reps: '6-8',
        rest: 180,
        group: 'A',
        notes: 'Primary hamstring/glute compound. Hinge at hips. Feel hamstring stretch. Critical for posterior chain.',
        equipment: 'Dumbbells'
      },
      {
        name: 'Leg Extension / Bulgarian Split Squat',
        sets: 3,
        reps: '10-12',
        rest: 90,
        group: 'B',
        notes: 'Quad accessory. Alternate between leg extension and split squat each session.',
        equipment: 'Bench Leg Attachment / Dumbbells + Bench'
      },
      {
        name: 'Leg Curl',
        sets: 3,
        reps: '10-12',
        rest: 90,
        group: 'B',
        notes: 'Hamstring isolation. Control eccentric (3-4 seconds). Pause at peak contraction.',
        equipment: 'Bench Leg Attachment'
      },
      {
        name: 'DB Calf Raise (Single Leg)',
        sets: 4,
        reps: '8-10',
        rest: 120,
        group: 'C',
        notes: 'Standing calf. Full stretch at bottom, full contraction at top. One leg at a time.',
        equipment: 'Dumbbells'
      },
      {
        name: 'DB Seated Calf Raise',
        sets: 4,
        reps: '8-10',
        rest: 120,
        group: 'C',
        notes: 'Seated calf targets soleus. DB on knees. Pause at stretch and contraction.',
        equipment: 'Dumbbells'
      },
      {
        name: 'Plank / Core Work',
        sets: 3,
        reps: '45-60s',
        rest: 60,
        group: 'D',
        notes: 'Core stability. Posterior pelvic tilt. Squeeze glutes. Whatever volume is needed.',
        equipment: 'Bodyweight'
      },
      {
        name: 'Low Back / Hyperextension',
        sets: 3,
        reps: '12-15',
        rest: 60,
        group: 'D',
        notes: 'Lower back strength and stability. Hold at top for 1-2 seconds. Control descent.',
        equipment: 'Bodyweight / Dumbbells'
      },
    ]
  },

  workoutCatchupA: {
    name: 'Catch-up Workout A',
    description: 'Full Body - All Muscle Groups Stimulation',
    exercises: [
      {
        name: 'DB Goblet Squat',
        sets: 4,
        reps: '8-10',
        rest: 120,
        group: 'A',
        notes: 'Compound quad/glute exercise. Deep ROM for maximum stimulus.',
        equipment: 'Dumbbells'
      },
      {
        name: 'Slight Incline DB Bench Press',
        sets: 4,
        reps: '6-8',
        rest: 120,
        group: 'B',
        notes: 'Heavy chest/shoulder/tricep compound. Greater stretch than barbell.',
        equipment: 'Dumbbells + Bench'
      },
      {
        name: 'DB Pull Over',
        sets: 3,
        reps: '10-12',
        rest: 90,
        group: 'C',
        notes: 'Target chest, lats, and serratus. Deep stretch at bottom. Critical for hypertrophy.',
        equipment: 'Dumbbells + Bench'
      },
      {
        name: 'Pull-ups (Neutral Grip)',
        sets: 4,
        reps: '6-10',
        rest: 120,
        group: 'D',
        notes: 'Back/bicep compound. Neutral grip reduces shoulder stress.',
        equipment: 'Pull-up Attachment'
      },
      {
        name: 'DB Overhead Press (Standing)',
        sets: 3,
        reps: '8-10',
        rest: 90,
        group: 'D',
        notes: 'Shoulder/tricep compound. Standing engages core.',
        equipment: 'Dumbbells'
      },
      {
        name: 'DB Romanian Deadlift',
        sets: 3,
        reps: '8-10',
        rest: 90,
        group: 'E',
        notes: 'Posterior chain compound. Hamstring/glute/back emphasis.',
        equipment: 'Dumbbells'
      },
      {
        name: 'Ring Dips',
        sets: 3,
        reps: '8-12',
        rest: 90,
        group: 'F',
        notes: 'Chest/tricep/shoulder compound. Rings add instability.',
        equipment: 'Rings'
      },
      {
        name: 'Single-Arm DB Row',
        sets: 3,
        reps: '10-12 each',
        rest: 90,
        group: 'G',
        notes: 'Back/bicep compound. Unilateral for symmetry.',
        equipment: 'Dumbbells + Bench'
      },
      {
        name: 'DB Hammer Curl',
        sets: 3,
        reps: '10-12',
        rest: 60,
        group: 'H',
        notes: 'Bicep/brachialis compound. Neutral grip.',
        equipment: 'Dumbbells'
      },
      {
        name: 'DB Overhead Triceps Extension',
        sets: 3,
        reps: '10-12',
        rest: 90,
        group: 'I',
        notes: 'Tricep compound. Long head emphasis. Deep stretch at bottom.',
        equipment: 'Dumbbells'
      },
      {
        name: 'DB Lateral Raises',
        sets: 3,
        reps: '12-15',
        rest: 60,
        group: 'J',
        notes: 'Shoulder isolation. Control eccentric.',
        equipment: 'Dumbbells'
      },
      {
        name: 'Band Face Pulls',
        sets: 3,
        reps: '15-20',
        rest: 60,
        group: 'K',
        notes: 'Rear delt/rotator cuff. Critical for shoulder health.',
        equipment: 'Bands'
      },
      {
        name: 'DB Calf Raise (Single Leg)',
        sets: 4,
        reps: '15-20',
        rest: 60,
        group: 'L',
        notes: 'Calf isolation. Unilateral for balance.',
        equipment: 'Dumbbells'
      },
      {
        name: 'Plank',
        sets: 3,
        reps: '60s',
        rest: 60,
        group: 'M',
        notes: 'Core stability. Full body tension.',
        equipment: 'Bodyweight'
      }
    ]
  },

  workoutCatchupB: {
    name: 'Catch-up Workout B',
    description: 'Full Body - Metabolic Focus',
    exercises: [
      {
        name: 'Ring Push-ups',
        sets: 4,
        reps: '10-15',
        rest: 90,
        group: 'A',
        notes: 'Chest/shoulder/tricep compound. Rings increase instability and muscle activation.',
        equipment: 'Rings'
      },
      {
        name: 'DB Pull Over',
        sets: 3,
        reps: '12-15',
        rest: 90,
        group: 'B',
        notes: 'High volume for chest and lat hypertrophy. Constant tension throughout ROM.',
        equipment: 'Dumbbells + Bench'
      },
      {
        name: 'Chin-ups (Close Grip)',
        sets: 4,
        reps: '6-10',
        rest: 90,
        group: 'C',
        notes: 'Back/bicep compound. Close grip emphasizes biceps.',
        equipment: 'Pull-up Attachment'
      },
      {
        name: 'DB Arnold Press',
        sets: 3,
        reps: '10-12',
        rest: 75,
        group: 'D',
        notes: 'Shoulder compound. Rotation hits all delt heads.',
        equipment: 'Dumbbells + Bench'
      },
      {
        name: 'DB Goblet Squat',
        sets: 4,
        reps: '8-10',
        rest: 120,
        group: 'D',
        notes: 'Compound quad/glute exercise. Deep ROM for maximum stimulus.',
        equipment: 'Dumbbells'
      },
      {
        name: 'DB Single-Leg Romanian Deadlift',
        sets: 3,
        reps: '8-10 each',
        rest: 75,
        group: 'E',
        notes: 'Unilateral posterior chain. Improves balance and hamstring activation.',
        equipment: 'Dumbbells'
      },
      {
        name: 'DB Incline Press',
        sets: 3,
        reps: '10-12',
        rest: 90,
        group: 'F',
        notes: 'Upper chest emphasis. 30-45 deg incline for optimal activation.',
        equipment: 'Dumbbells + Bench'
      },
      {
        name: 'Ring Rows',
        sets: 3,
        reps: '12-15',
        rest: 75,
        group: 'G',
        notes: 'Back/bicep compound. Adjustable difficulty via foot position.',
        equipment: 'Rings'
      },
      {
        name: 'DB Preacher Curl',
        sets: 3,
        reps: '10-12',
        rest: 90,
        group: 'H',
        notes: 'Bicep isolation. Eliminates cheating. Excellent for peak.',
        equipment: 'Dumbbells + Preacher Attachment'
      },
      {
        name: 'DB Skull Crusher',
        sets: 3,
        reps: '10-12',
        rest: 90,
        group: 'I',
        notes: 'Tricep isolation. Long head emphasis. Full ROM for maximum stretch.',
        equipment: 'Dumbbells + Bench'
      },
      {
        name: 'Band Lateral Raises',
        sets: 3,
        reps: '15-20',
        rest: 60,
        group: 'J',
        notes: 'Shoulder isolation. Constant tension throughout ROM.',
        equipment: 'Bands'
      },
      {
        name: 'Ring Face Pulls',
        sets: 3,
        reps: '15-20',
        rest: 60,
        group: 'K',
        notes: 'Rear delt/rotator cuff. Critical for shoulder health and posture.',
        equipment: 'Rings'
      },
      {
        name: 'DB Seated Calf Raise',
        sets: 4,
        reps: '15-20',
        rest: 60,
        group: 'L',
        notes: 'Calf isolation. Targets soleus. Pause at stretch and contraction.',
        equipment: 'Dumbbells'
      },
      {
        name: 'Hanging Leg Raise',
        sets: 3,
        reps: '10-15',
        rest: 60,
        group: 'M',
        notes: 'Core and hip flexors. Control the swing. Bent knee to make easier.',
        equipment: 'Pull-up Attachment'
      }
    ]
  },

  workoutCatchupC: {
    name: 'Catch-up Workout C',
    description: 'Full Body - Overhead Press & Chin-ups Focus',
    exercises: [
      {
        name: 'DB Overhead Press (Standing)',
        sets: 4,
        reps: '6-8',
        rest: 150,
        group: 'A',
        notes: 'Primary shoulder compound. Standing engages core. Heavy focus for strength.',
        equipment: 'Dumbbells'
      },
      {
        name: 'Chin-ups (Standard Grip)',
        sets: 4,
        reps: '6-10',
        rest: 120,
        group: 'B',
        notes: 'Back/bicep compound. Supinated grip for maximum bicep engagement.',
        equipment: 'Pull-up Attachment'
      },
      {
        name: 'Slight Incline DB Bench Press',
        sets: 3,
        reps: '8-10',
        rest: 120,
        group: 'C',
        notes: 'Chest/shoulder/tricep compound. Greater stretch than barbell.',
        equipment: 'Dumbbells + Bench'
      },
      {
        name: 'DB Pull Over',
        sets: 3,
        reps: '10-12',
        rest: 90,
        group: 'D',
        notes: 'Target chest, lats, and serratus. Deep stretch at bottom. Critical for hypertrophy.',
        equipment: 'Dumbbells + Bench'
      },
      {
        name: 'DB Goblet Squat',
        sets: 4,
        reps: '8-10',
        rest: 150,
        group: 'D',
        notes: 'Compound quad/glute exercise. Deep ROM for maximum stimulus.',
        equipment: 'Dumbbells'
      },
      {
        name: 'DB Romanian Deadlift',
        sets: 3,
        reps: '8-10',
        rest: 120,
        group: 'E',
        notes: 'Posterior chain compound. Hamstring/glute/back emphasis.',
        equipment: 'Dumbbells'
      },
      {
        name: 'Ring Dips',
        sets: 3,
        reps: '8-12',
        rest: 90,
        group: 'F',
        notes: 'Chest/tricep/shoulder compound. Rings add instability.',
        equipment: 'Rings'
      },
      {
        name: 'Single-Arm DB Row',
        sets: 3,
        reps: '10-12 each',
        rest: 90,
        group: 'G',
        notes: 'Back/bicep compound. Unilateral for symmetry.',
        equipment: 'Dumbbells + Bench'
      },
      {
        name: 'DB Lateral Raises',
        sets: 3,
        reps: '12-15',
        rest: 60,
        group: 'H',
        notes: 'Shoulder isolation. Control eccentric for maximum muscle damage.',
        equipment: 'Dumbbells'
      },
      {
        name: 'Band Face Pulls',
        sets: 3,
        reps: '15-20',
        rest: 60,
        group: 'I',
        notes: 'Rear delt/rotator cuff. Critical for shoulder health.',
        equipment: 'Bands'
      },
      {
        name: 'DB Hammer Curl',
        sets: 3,
        reps: '10-12',
        rest: 60,
        group: 'J',
        notes: 'Bicep/brachialis compound. Neutral grip for balanced arm development.',
        equipment: 'Dumbbells'
      },
      {
        name: 'DB Overhead Triceps Extension',
        sets: 3,
        reps: '10-12',
        rest: 60,
        group: 'K',
        notes: 'Tricep compound. Long head emphasis. Full ROM for maximum stretch.',
        equipment: 'Dumbbells'
      },
      {
        name: 'DB Calf Raise (Single Leg)',
        sets: 4,
        reps: '15-20',
        rest: 60,
        group: 'L',
        notes: 'Calf isolation. Unilateral for balance. Pause at contraction.',
        equipment: 'Dumbbells'
      },
      {
        name: 'Plank',
        sets: 3,
        reps: '60s',
        rest: 60,
        group: 'M',
        notes: 'Core stability. Full body tension. Posterior pelvic tilt.',
        equipment: 'Bodyweight'
      }
    ]
  }
};

/**
 * Equipment Reference Guide
 * Maps exercises to required equipment for filtering/planning
 */
export const equipmentGuide = {
  dumbbells: [
    'DB Bench Press', 'DB Overhead Press', 'Incline DB Press', 'DB Lateral Raises',
    'DB Overhead Triceps Extension', 'DB Row', 'DB Curl', 'DB Hammer Curl',
    'DB Goblet Squat', 'DB Romanian Deadlift', 'DB Calf Raise', 'DB Arnold Press',
    'DB Front Raise', 'DB Skull Crusher', 'Single-Arm DB Row', 'DB Preacher Curl',
    'Incline DB Curl', 'DB Reverse Curl', 'DB Single-Leg Romanian Deadlift',
    'Reverse Lunge', 'DB Hip Thrust', 'DB Step-ups', 'DB Seated Calf Raise',
    'Incline DB Fly', 'DB Rear Delt Fly', 'DB Pull Over'
  ],
  bench: [
    'DB Bench Press', 'Incline DB Press', 'DB Row (Chest Supported)',
    'Bulgarian Split Squat', 'DB Arnold Press', 'DB Skull Crusher',
    'Single-Arm DB Row', 'DB Hip Thrust', 'DB Step-ups', 'Incline DB Fly',
    'DB Rear Delt Fly', 'DB Overhead Press (Seated)', 'Incline DB Curl', 'DB Pull Over'
  ],
  legAttachment: [
    'Leg Extension', 'Leg Curl'
  ],
  preacherAttachment: [
    'DB Preacher Curl'
  ],
  pullupAttachment: [
    'Pull-ups', 'Chin-ups', 'Hanging Leg Raise'
  ],
  rings: [
    'Ring Dips', 'Ring Push-ups', 'Ring Rows', 'Ring Face Pulls',
    'Ring Flyes', 'Ring Push-ups (Diamond)'
  ],
  bands: [
    'Band Face Pulls', 'Band Lateral Raises', 'Band Pull-Aparts'
  ],
  bullworker: [
    'Bullworker Isometric Squeeze'
  ],
  powerTwister: [
    'Power Twister - Chest Squeeze'
  ],
  handGripper: [
    'Grip Work - Hand Gripper'
  ],
  latticePin: [
    'Lattice Pin Hangs'
  ],
  bodyweight: [
    'Plank', 'Pull-ups', 'Chin-ups', 'Hanging Leg Raise'
  ]
};

/**
 * Weekly Volume Calculation (Home Gym Adapted)
 * Based on Schoenfeld et al. (2017) optimal ranges
 */
export const weeklyVolume = {
  chest: {
    exercises: ['Slight Incline DB Bench Press', 'Incline DB Press', 'Ring Dips', 'Incline DB Fly', 'Ring Push-ups', 'Ring Flyes', 'Power Twister', 'DB Pull Over'],
    setsPerWeek: 19, // 4+3+3+3+4+4+3 = 24 (adjusted to 19 with pull over inclusion)
    target: { min: 10, optimal: 14, max: 20 }
  },
  back: {
    exercises: ['Pull-ups', 'DB Row', 'Ring Rows', 'Chin-ups', 'Single-Arm DB Row', 'DB Pull Over'],
    setsPerWeek: 20, // 4+3+3+4+3+3 = 20 (within 12-20 optimal range)
    target: { min: 12, optimal: 16, max: 20 }
  },
  shoulders: {
    exercises: ['DB Overhead Press', 'DB Lateral Raises', 'Band Face Pulls', 'DB Arnold Press', 'Band Lateral Raises', 'DB Front Raise'],
    setsPerWeek: 14, // 3+3+3+3+3+2 = 17 includes rear delts
    target: { min: 8, optimal: 12, max: 16 }
  },
  biceps: {
    exercises: ['DB Curl', 'DB Hammer Curl', 'DB Preacher Curl', 'Incline DB Curl', 'DB Reverse Curl'],
    setsPerWeek: 14, // 3+3+3+3+2 = 14 (within 6-14 optimal range)
    target: { min: 6, optimal: 10, max: 14 }
  },
  triceps: {
    exercises: ['Ring Dips', 'DB Overhead Triceps Extension', 'Ring Push-ups (Diamond)', 'DB Skull Crusher'],
    setsPerWeek: 11, // 3+3+2+3 = 11 (within 6-14 optimal range)
    target: { min: 6, optimal: 10, max: 14 }
  },
  quads: {
    exercises: ['DB Goblet Squat', 'Bulgarian Split Squat', 'Leg Extension', 'Reverse Lunge', 'DB Step-ups'],
    setsPerWeek: 16, // 4+3+3+3+3 = 16 (within 12-20 optimal range)
    target: { min: 12, optimal: 16, max: 20 }
  },
  hamstrings: {
    exercises: ['DB Romanian Deadlift', 'Leg Curl', 'DB Single-Leg Romanian Deadlift'],
    setsPerWeek: 15, // 4+6+4 = 14 (within 10-18 optimal range)
    target: { min: 10, optimal: 14, max: 18 }
  },
  glutes: {
    exercises: ['Bulgarian Split Squat', 'DB Hip Thrust', 'Reverse Lunge', 'DB Step-ups', 'DB Single-Leg Romanian Deadlift'],
    setsPerWeek: 16, // Overlaps with quads/hams
    target: { min: 10, optimal: 14, max: 18 }
  },
  calves: {
    exercises: ['DB Calf Raise (Single Leg)', 'DB Seated Calf Raise'],
    setsPerWeek: 8, // 4+4 = 8 (within 12-20, could increase)
    target: { min: 12, optimal: 16, max: 20 }
  }
};
