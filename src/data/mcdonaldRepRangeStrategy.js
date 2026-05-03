/**
 * Lyle McDonald's Rep Range Strategy
 * 
 * This module implements McDonald's evidence-based rep range recommendations
 * for optimizing myofibrillar vs sarcoplasmic hypertrophy
 */

export const mcdonaldRepRangeStrategy = {
  /**
   * Exercise Classification by Hypertrophic Potential
   * Based on McDonald's principle of prioritizing myofibrillar hypertrophy exercises
   */
  exerciseClassification: {
    // Primary (Myofibrillar Focus) - Heavy compounds that maximize contractile protein growth
    primary: [
      'Slight Incline DB Bench Press',
      'Incline DB Press', 
      'DB Overhead Press',
      'DB Row (Chest Supported)',
      'Single-Arm DB Row',
      'Pull-ups (Various Grips)',
      'Chin-ups (Close Grip)',
      'DB Goblet Squat',
      'DB Romanian Deadlift',
      'Bulgarian Split Squat',
      'DB Single-Leg Romanian Deadlift'
    ],

    // Secondary (Balanced) - Accessories that provide balanced growth
    secondary: [
      'DB Lateral Raises',
      'DB Rear Delt Fly',
      'DB Curl (Standing)',
      'DB Hammer Curl',
      'DB Preacher Curl',
      'DB Overhead Triceps Extension',
      'DB Skull Crushers',
      'Leg Extension',
      'Leg Curl',
      'DB Calf Raise (Single Leg)',
      'DB Seated Calf Raise'
    ],

    // Tertiary (Sarcoplasmic Focus) - High-rep work for metabolic stress and size
    tertiary: [
      'Ring Dips',
      'Ring Push-ups',
      'Ring Rows',
      'Ring Face Pulls',
      'Band Face Pulls',
      'Band Lateral Raises',
      'Band Pull-Aparts',
      'DB Pull Over'
    ]
  },

  /**
   * Rep Range Recommendations by Exercise Type
   * Based on McDonald's research on myofibrillar vs sarcoplasmic hypertrophy
   */
  repRangeRecommendations: {
    // Myofibrillar Hypertrophy (Heavy Compounds)
    // Focus: 6-8 reps for maximum contractile protein stimulation
    primary: {
      repRange: '6-8',
      restTime: '150-180',
      intensity: '75-85% 1RM',
      purpose: 'Myofibrillar hypertrophy, neural adaptations, strength gains',
      progression: 'Weight increases when hitting 8 reps on all sets'
    },

    // Balanced Hypertrophy (Accessories)
    // Focus: 8-12 reps for balanced myofibrillar and sarcoplasmic growth
    secondary: {
      repRange: '8-12',
      restTime: '90-120',
      intensity: '65-75% 1RM',
      purpose: 'Balanced hypertrophy, muscle thickness, metabolic stress',
      progression: 'Weight increases when hitting 12 reps on all sets'
    },

    // Sarcoplasmic Hypertrophy (Metabolic)
    // Focus: 12-20 reps for metabolic stress and sarcoplasmic expansion
    tertiary: {
      repRange: '12-20',
      restTime: '60-90',
      intensity: '50-65% 1RM',
      purpose: 'Sarcoplasmic hypertrophy, metabolic stress, muscle pump',
      progression: 'Volume increases (more sets/reps) rather than weight'
    }
  },

  /**
   * Exercise-Specific Rep Range Mapping
   * Direct mapping for each exercise in the program
   */
  exerciseRepRanges: {
    // Push Exercises
    'Slight Incline DB Bench Press': { repRange: '6-8', classification: 'primary' },
    'Incline DB Press': { repRange: '6-8', classification: 'primary' },
    'DB Overhead Press': { repRange: '6-8', classification: 'primary' },
    'DB Pull Over': { repRange: '12-15', classification: 'tertiary' },
    'Ring Dips': { repRange: '8-12', classification: 'tertiary' },
    'DB Lateral Raises': { repRange: '12-15', classification: 'secondary' },
    'Band Face Pulls': { repRange: '15-20', classification: 'tertiary' },
    'DB Overhead Triceps Extension': { repRange: '10-12', classification: 'secondary' },
    'DB Skull Crushers': { repRange: '8-10', classification: 'secondary' },

    // Pull Exercises
    'Pull-ups (Various Grips)': { repRange: '6-10', classification: 'primary' },
    'DB Row (Chest Supported)': { repRange: '8-10', classification: 'primary' },
    'Ring Rows': { repRange: '10-12', classification: 'tertiary' },
    'Ring Face Pulls': { repRange: '15-20', classification: 'tertiary' },
    'DB Rear Delt Fly': { repRange: '12-15', classification: 'secondary' },
    'DB Curl (Standing)': { repRange: '8-10', classification: 'secondary' },
    'DB Hammer Curl': { repRange: '10-12', classification: 'secondary' },
    'Grip Work - Hand Gripper': { repRange: '10-15', classification: 'tertiary' },

    // Leg Exercises
    'DB Goblet Squat': { repRange: '8-10', classification: 'primary' },
    'DB Romanian Deadlift': { repRange: '8-10', classification: 'primary' },
    'Bulgarian Split Squat': { repRange: '10-12', classification: 'primary' },
    'Leg Extension': { repRange: '12-15', classification: 'secondary' },
    'Leg Curl': { repRange: '12-15', classification: 'secondary' },
    'DB Calf Raise (Single Leg)': { repRange: '15-20', classification: 'secondary' },
    'Plank': { repRange: '45-60s', classification: 'tertiary' },

    // Additional Exercises
    'DB Arnold Press': { repRange: '8-10', classification: 'secondary' },
    'Butterfly Raises': { repRange: '12-15', classification: 'secondary' },
    'Bent Lateral Raises': { repRange: '12-15', classification: 'secondary' },
    'Chin-ups (Close Grip)': { repRange: '6-10', classification: 'primary' },
    'Band Pull-Aparts': { repRange: '15-20', classification: 'tertiary' },
    'DB Preacher Curl': { repRange: '10-12', classification: 'secondary' },
    'Incline DB Curl': { repRange: '10-12', classification: 'secondary' },
    'DB Reverse Curl': { repRange: '12-15', classification: 'secondary' },
    'Lattice Pin Hangs': { repRange: '20-30s', classification: 'tertiary' },
    'DB Hip Thrust': { repRange: '12-15', classification: 'secondary' },
    'DB Step-ups': { repRange: '12-15', classification: 'primary' },
    'DB Seated Calf Raise': { repRange: '15-20', classification: 'secondary' },
    'Hanging Leg Raise': { repRange: '10-15', classification: 'tertiary' },
    'Bullworker Isometric Squeeze': { repRange: '3x10s', classification: 'tertiary' }
  },

  /**
   * Periodization-Based Rep Range Adjustments
   * Adjusts rep ranges based on training phase
   */
  periodizationRepRanges: {
    accumulationPhase: {
      // Focus on myofibrillar hypertrophy with slightly higher volume
      primary: { repRange: '6-8', sets: 4 },
      secondary: { repRange: '8-12', sets: 3 },
      tertiary: { repRange: '12-15', sets: 3 }
    },
    intensificationPhase: {
      // Maintain myofibrillar focus while increasing intensity
      primary: { repRange: '5-7', sets: 3 },
      secondary: { repRange: '8-10', sets: 3 },
      tertiary: { repRange: '10-12', sets: 2 }
    },
    peakPhase: {
      // Shift toward sarcoplasmic hypertrophy for size
      primary: { repRange: '6-8', sets: 3 },
      secondary: { repRange: '10-12', sets: 3 },
      tertiary: { repRange: '15-20', sets: 3 }
    },
    deloadPhase: {
      // Reduce intensity and volume for recovery
      primary: { repRange: '8-10', sets: 2 },
      secondary: { repRange: '10-12', sets: 2 },
      tertiary: { repRange: '12-15', sets: 2 }
    }
  },

  /**
   * Training Age Adjustments
   * Modifies rep ranges based on training experience
   */
  trainingAgeAdjustments: {
    beginners: {
      // Focus on learning movement patterns with moderate intensity
      primary: { repRange: '8-10', restTime: '120-150' },
      secondary: { repRange: '10-12', restTime: '90-120' },
      tertiary: { repRange: '12-15', restTime: '60-90' }
    },
    intermediates: {
      // Standard McDonald recommendations
      primary: { repRange: '6-8', restTime: '150-180' },
      secondary: { repRange: '8-12', restTime: '90-120' },
      tertiary: { repRange: '12-20', restTime: '60-90' }
    },
    advanced: {
      // More sophisticated periodization and intensity techniques
      primary: { repRange: '4-6', restTime: '180-240' },
      secondary: { repRange: '6-10', restTime: '120-150' },
      tertiary: { repRange: '10-15', restTime: '90-120' }
    }
  },

  /**
   * Get Exercise Classification
   * Determines which category an exercise falls into
   */
  getClassification: (exerciseName) => {
    const strategy = mcdonaldRepRangeStrategy;
    
    if (strategy.exerciseClassification.primary.includes(exerciseName)) {
      return 'primary';
    } else if (strategy.exerciseClassification.secondary.includes(exerciseName)) {
      return 'secondary';
    } else if (strategy.exerciseClassification.tertiary.includes(exerciseName)) {
      return 'tertiary';
    }
    
    return 'secondary'; // Default classification
  },

  /**
   * Get Recommended Rep Range
   * Returns the optimal rep range for an exercise
   */
  getRepRange: (exerciseName, trainingPhase = 'standard', trainingAge = 'intermediates') => {
    const strategy = mcdonaldRepRangeStrategy;
    const classification = strategy.getClassification(exerciseName);
    
    // Check for specific exercise mapping first
    if (strategy.exerciseRepRanges[exerciseName]) {
      return strategy.exerciseRepRanges[exerciseName].repRange;
    }
    
    // Fall back to classification-based recommendations
    const phase = strategy.periodizationRepRanges[trainingPhase] || strategy.periodizationRepRanges.accumulationPhase;
    const ageAdjustment = strategy.trainingAgeAdjustments[trainingAge] || strategy.trainingAgeAdjustments.intermediates;
    
    return phase[classification].repRange;
  },

  /**
   * Get Exercise Purpose
   * Explains the hypertrophic goal of an exercise
   */
  getExercisePurpose: (exerciseName) => {
    const strategy = mcdonaldRepRangeStrategy;
    const classification = strategy.getClassification(exerciseName);
    
    const purposes = {
      primary: 'Myofibrillar hypertrophy - maximizes contractile protein growth and strength',
      secondary: 'Balanced hypertrophy - combines myofibrillar and sarcoplasmic growth',
      tertiary: 'Sarcoplasmic hypertrophy - emphasizes metabolic stress and muscle size'
    };
    
    return purposes[classification] || purposes.secondary;
  },

  /**
   * Get Progression Strategy
   * Returns the recommended progression method for an exercise
   */
  getProgressionStrategy: (exerciseName) => {
    const strategy = mcdonaldRepRangeStrategy;
    const classification = strategy.getClassification(exerciseName);
    
    const progressionStrategies = {
      primary: 'Weight progression - increase load when hitting top of rep range',
      secondary: 'Balanced progression - weight increases or rep increases',
      tertiary: 'Volume progression - increase sets or reps rather than weight'
    };
    
    return progressionStrategies[classification] || progressionStrategies.secondary;
  }
};

/**
 * Exercise Notes Enhancement
 * Enhanced exercise notes with McDonald's principles
 */
export const enhancedExerciseNotes = {
  'Slight Incline DB Bench Press': 'Primary myofibrillar exercise. Use 6-8 reps for maximum contractile protein stimulation. Focus on controlled eccentric and explosive concentric.',
  'DB Overhead Press': 'Primary myofibrillar exercise. Standing position engages core. Use 6-8 reps for optimal strength and size gains.',
  'Pull-ups (Various Grips)': 'Primary myofibrillar exercise. Supinated grip emphasizes biceps. Use 6-10 reps for maximum muscle fiber recruitment.',
  'DB Goblet Squat': 'Primary myofibrillar exercise. Deep squat position maximizes quad and glute activation. Use 8-10 reps for balanced strength and hypertrophy.',
  'DB Lateral Raises': 'Secondary balanced exercise. Use 12-15 reps with strict form to isolate medial delts without cheating.',
  'DB Curl (Standing)': 'Secondary balanced exercise. Use 8-10 reps with controlled tempo to maximize bicep tension.',
  'Ring Dips': 'Tertiary sarcoplasmic exercise. Use 8-12 reps with full range of motion. Rings increase instability and muscle activation.',
  'Band Face Pulls': 'Tertiary sarcoplasmic exercise. Use 15-20 reps for rear delt and rotator cuff health. Critical for shoulder balance.'
};