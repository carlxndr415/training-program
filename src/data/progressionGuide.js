/**
 * Progression Guide based on Lyle McDonald's Hypertrophy Research
 * 
 * This guide provides evidence-based progression strategies for optimal muscle growth
 */

export const progressionGuide = {
  /**
   * Volume Guidelines (Sets per Muscle Group per Week)
   * Based on McDonald's research on optimal training volume and volume counting methodology
   * Enhanced with McDonald's volume counting methodology (0.5:1 ratio for smaller muscles in compound movements)
   */
  volumeGuidelines: {
    chest: { min: 10, optimal: 14, max: 20 },
    back: { min: 12, optimal: 16, max: 20 },
    shoulders: { min: 8, optimal: 12, max: 16 },
    biceps: { min: 6, optimal: 10, max: 14 },
    triceps: { min: 6, optimal: 10, max: 14 },
    quads: { min: 12, optimal: 16, max: 20 },
    hamstrings: { min: 10, optimal: 14, max: 18 },
    glutes: { min: 10, optimal: 14, max: 18 },
    calves: { min: 12, optimal: 16, max: 20 }
  },

  /**
   * McDonald's Volume Counting Methodology
   * Addresses the critical issue of overestimating effective volume from compound exercises
   * Based on McDonald's principle that compound exercises should not count as full sets for all involved muscles
   */
  volumeCountingMethodology: {
    /**
     * Exercise Volume Distribution Ratios
     * Based on McDonald's 0.5:1 ratio for smaller muscles in compound movements
     * This prevents overestimation of effective volume that can lead to overtraining
     */
    exerciseVolumeDistribution: {
      // Chest/Shoulder/Tricep Compounds
      'Slight Incline DB Bench Press': {
        chest: 1.0,
        shoulders: 0.5,  // Anterior delts
        triceps: 0.5
      },
      'Incline DB Press': {
        chest: 1.0,
        shoulders: 0.5,  // Anterior delts
        triceps: 0.5
      },
      'DB Overhead Press': {
        shoulders: 1.0,
        triceps: 0.5
      },
      'Ring Dips': {
        chest: 1.0,
        shoulders: 0.5,  // Anterior delts
        triceps: 0.5
      },
      'DB Pull Over': {
        chest: 1.0,
        lats: 0.5,
        serratus: 0.5
      },

      // Back/Bicep Compounds
      'Pull-ups (Various Grips)': {
        back: 1.0,
        biceps: 0.5
      },
      'Chin-ups (Close Grip)': {
        back: 1.0,
        biceps: 0.5
      },
      'DB Row (Chest Supported)': {
        back: 1.0,
        biceps: 0.5
      },
      'Single-Arm DB Row': {
        back: 1.0,
        biceps: 0.5
      },
      'Ring Rows': {
        back: 1.0,
        biceps: 0.5
      },

      // Leg Compounds
      'DB Goblet Squat': {
        quads: 1.0,
        glutes: 0.5,
        hamstrings: 0.3
      },
      'DB Romanian Deadlift': {
        hamstrings: 1.0,
        glutes: 0.5,
        lower back: 0.3
      },
      'Bulgarian Split Squat': {
        quads: 1.0,
        glutes: 0.5,
        hamstrings: 0.3
      },
      'DB Single-Leg Romanian Deadlift': {
        hamstrings: 1.0,
        glutes: 0.5,
        lower back: 0.3
      },


      // Isolation Exercises (Count as 1.0 for target muscle)
      'DB Lateral Raises': { shoulders: 1.0 },
      'DB Rear Delt Fly': { shoulders: 1.0 },
      'DB Curl (Standing)': { biceps: 1.0 },
      'DB Hammer Curl': { biceps: 1.0 },
      'DB Preacher Curl': { biceps: 1.0 },
      'DB Overhead Triceps Extension': { triceps: 1.0 },
      'DB Skull Crushers': { triceps: 1.0 },
      'Leg Extension': { quads: 1.0 },
      'Leg Curl': { hamstrings: 1.0 },
      'DB Calf Raise (Single Leg)': { calves: 1.0 },
      'DB Seated Calf Raise': { calves: 1.0 }
    },

    /**
     * Effective Volume Calculation
     * Converts raw set counts to effective volume using McDonald's methodology
     */
    calculateEffectiveVolume: (rawVolume) => {
      const distribution = progressionGuide.volumeCountingMethodology.exerciseVolumeDistribution;
      const effectiveVolume = {};

      Object.keys(rawVolume).forEach(muscleGroup => {
        effectiveVolume[muscleGroup] = 0;
      });

      // Apply distribution ratios to calculate effective volume
      Object.keys(distribution).forEach(exercise => {
        const ratios = distribution[exercise];
        Object.keys(ratios).forEach(muscleGroup => {
          if (effectiveVolume[muscleGroup] !== undefined) {
            effectiveVolume[muscleGroup] += ratios[muscleGroup];
          }
        });
      });

      return effectiveVolume;
    }
  },

  /**
   * Rep Range Guidelines
   * Based on McDonald's research on myofibrillar vs sarcoplasmic hypertrophy
   */
  repRanges: {
    strength: { range: '1-5', sets: 3-5, rest: '2-3 min', purpose: 'Neural adaptations, myofibrillar hypertrophy' },
    hypertrophy: { range: '6-12', sets: 3-4, rest: '1-2 min', purpose: 'Sarcoplasmic hypertrophy, metabolic stress' },
    endurance: { range: '15-30', sets: 2-3, rest: '30-60 sec', purpose: 'Mitochondrial adaptations, capillary density' }
  },

  /**
   * Training Frequency Guidelines
   * Based on McDonald's research on optimal training frequency
   */
  frequencyGuidelines: {
    beginners: { frequency: '2x/week', intensity: '60-70% 1RM', volume: '10-14 sets/muscle/week' },
    intermediates: { frequency: '2-3x/week', intensity: '70-85% 1RM', volume: '12-18 sets/muscle/week' },
    advanced: { frequency: '3-4x/week', intensity: '80-90% 1RM', volume: '14-20 sets/muscle/week' }
  },

  /**
   * Progression Methods
   * Based on McDonald's evidence-based progression principles
   */
  progressionMethods: {
    loadProgression: {
      description: 'Increase weight while maintaining rep range',
      method: 'Add 2.5-5lbs (1-2.5kg) when you can complete all sets/reps with good form',
      frequency: 'Weekly or bi-weekly',
      example: 'Bench Press: 3x8 @ 185lbs to 3x8 @ 190lbs'
    },
    volumeProgression: {
      description: 'Increase number of sets or reps',
      method: 'Add 1 set OR add 1-2 reps to last set when hitting rep targets',
      frequency: 'Every 2-3 weeks',
      example: 'Lat Pulldown: 3x10 to 4x10 OR 3x12'
    },
    densityProgression: {
      description: 'Decrease rest time or increase tempo',
      method: 'Reduce rest by 15-30 seconds OR slow eccentric phase',
      frequency: 'Monthly',
      example: 'Squat: 3x8 @ 2min rest to 3x8 @ 90sec rest'
    },
    intensityProgression: {
      description: 'Increase training intensity techniques',
      method: 'Add drop sets, rest-pause, or partial reps',
      frequency: 'Every 4-6 weeks',
      example: 'Curl: 3x10 to 3x10 + 1x failure drop set'
    }
  },

  /**
   * Weekly Programming Template
   * 6-day Push/Pull/Legs split with proper frequency management
   */
  weeklyTemplate: {
    week1: {
      day1: 'Workout A (Push - Heavy)',
      day2: 'Workout B (Pull - Volume)', 
      day3: 'Workout C (Legs - Compound)',
      day4: 'Workout D (Push - Hypertrophy)',
      day5: 'Workout E (Pull - Metabolic)',
      day6: 'Workout F (Legs - Unilateral)',
      day7: 'Rest'
    },
    week2: {
      day1: 'Workout A (Push - Heavy)',
      day2: 'Workout B (Pull - Volume)',
      day3: 'Workout C (Legs - Compound)',
      day4: 'Workout D (Push - Hypertrophy)',
      day5: 'Workout E (Pull - Metabolic)',
      day6: 'Workout F (Legs - Unilateral)',
      day7: 'Rest'
    },
    deload: {
      day1: 'Workout A (Push - Light: 60% load, 2 sets each)',
      day2: 'Workout B (Pull - Light: 60% load, 2 sets each)',
      day3: 'Workout C (Legs - Light: 60% load, 2 sets each)',
      day4: 'Active Recovery (Mobility, Light Cardio)',
      day5: 'Workout D (Push - Light: 60% load, 2 sets each)',
      day6: 'Workout E (Pull - Light: 60% load, 2 sets each)',
      day7: 'Rest'
    }
  },

  /**
   * Exercise Selection Guidelines
   * Based on muscle activation research and functional anatomy
   */
  exerciseSelection: {
    compoundLifts: {
      priority: 'Primary focus (70% of volume)',
      examples: [
        'Squat variations (Barbell, Front, Bulgarian)',
        'Deadlift variations (Conventional, Romanian, Deficit)',
        'Press variations (Bench, Incline, Overhead)',
        'Row variations (Barbell, DB, Cable)',
        'Pull-up/Chin-up variations'
      ],
      setsPerWeek: 6-10
    },
    accessoryWork: {
      priority: 'Secondary focus (30% of volume)',
      examples: [
        'Isolation movements (Curls, Extensions, Flyes)',
        'Unilateral work (Split squats, Single-arm rows)',
        'Stabilizer work (Face pulls, Rear delts, Core)'
      ],
      setsPerWeek: 4-8
    }
  },

  /**
   * Recovery Guidelines
   * Based on research on muscle protein synthesis and recovery
   */
  recoveryGuidelines: {
    proteinIntake: {
      amount: '1.6-2.2g per kg bodyweight',
      timing: '20-40g per meal, every 3-4 hours',
      sources: 'Lean meats, dairy, eggs, legumes, protein supplements'
    },
    sleep: {
      duration: '7-9 hours per night',
      quality: 'Consistent sleep schedule, dark/cool room',
      importance: 'Critical for muscle protein synthesis and hormone regulation'
    },
    activeRecovery: {
      activities: 'Light cardio, mobility work, stretching',
      duration: '20-30 minutes',
      frequency: '2-3 times per week on rest days'
    }
  },

  /**
   * Periodization Model
   * 12-week block with systematic progression
   */
  periodization: {
    accumulationPhase: {
      weeks: '1-4',
      focus: 'Volume accumulation',
      intensity: '65-75% 1RM',
      volume: 'High (16-20 sets/muscle/week)',
      goal: 'Muscle damage and metabolic stress'
    },
    intensificationPhase: {
      weeks: '5-8', 
      focus: 'Strength and intensity',
      intensity: '75-85% 1RM',
      volume: 'Moderate (12-16 sets/muscle/week)',
      goal: 'Neural adaptations and myofibrillar hypertrophy'
    },
    peakPhase: {
      weeks: '9-11',
      focus: 'Power and density',
      intensity: '85-90% 1RM',
      volume: 'Low (8-12 sets/muscle/week)',
      goal: 'Rate of force development and muscle density'
    },
    deloadPhase: {
      week: '12',
      focus: 'Recovery and supercompensation',
      intensity: '50-60% 1RM',
      volume: 'Very low (4-6 sets/muscle/week)',
      goal: 'Full recovery and preparation for next cycle'
    }
  }
};

/**
 * Progression Calculator
 * Helper function to calculate optimal progression
 */
export const calculateProgression = (currentLoad, currentReps, targetReps) => {
  if (currentReps >= targetReps) {
    return {
      type: 'Load Progression',
      recommendation: `Increase weight by 2.5-5lbs (1-2.5kg)`,
      newLoad: currentLoad + (currentLoad * 0.025), // 2.5% increase
      maintainReps: targetReps
    };
  } else {
    return {
      type: 'Volume Progression', 
      recommendation: `Maintain weight, aim for ${currentReps + 1} reps next session`,
      maintainLoad: currentLoad,
      targetReps: currentReps + 1
    };
  }
};

/**
 * Volume Tracking Helper
 * Calculate weekly volume per muscle group
 */
export const calculateWeeklyVolume = () => {
  const muscleGroups = {
    chest: 0, back: 0, shoulders: 0, biceps: 0, triceps: 0,
    quads: 0, hamstrings: 0, glutes: 0, calves: 0
  };

  // This would need to be implemented based on your tracking system
  // For now, returns structure for volume calculation
  return muscleGroups;
};
