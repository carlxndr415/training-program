/**
 * Gamification System
 * Provides achievements, streaks, and motivation features
 */

import { profileKey } from './profileManager.js';
import { getSessionHistory } from './workoutSessionManager';
import { getExerciseHistory } from './enhancedProgressTracker';

// Achievement definitions
export const ACHIEVEMENTS = {
  // Consistency achievements
  daily_streak: {
    id: 'daily_streak',
    name: 'Daily Warrior',
    description: 'Complete workouts for 7 consecutive days',
    icon: '🔥',
    type: 'consistency',
    threshold: 7,
    rewards: { points: 100, badge: 'bronze' }
  },
  
  weekly_streak: {
    id: 'weekly_streak',
    name: 'Weekly Champion',
    description: 'Complete workouts for 30 consecutive days',
    icon: '🏆',
    type: 'consistency',
    threshold: 30,
    rewards: { points: 500, badge: 'silver' }
  },
  
  monthly_streak: {
    id: 'monthly_streak',
    name: 'Monthly Legend',
    description: 'Complete workouts for 90 consecutive days',
    icon: '👑',
    type: 'consistency',
    threshold: 90,
    rewards: { points: 2000, badge: 'gold' }
  },

  // Volume achievements
  volume_1000: {
    id: 'volume_1000',
    name: 'Volume Master',
    description: 'Complete 1000 total volume in a single workout',
    icon: '💪',
    type: 'volume',
    threshold: 1000,
    rewards: { points: 200, badge: 'bronze' }
  },
  
  volume_5000: {
    id: 'volume_5000',
    name: 'Volume God',
    description: 'Complete 5000 total volume in a single workout',
    icon: '🔥',
    type: 'volume',
    threshold: 5000,
    rewards: { points: 1000, badge: 'silver' }
  },

  // Progression achievements
  first_progression: {
    id: 'first_progression',
    name: 'First Step',
    description: 'Increase weight on any exercise',
    icon: '📈',
    type: 'progression',
    threshold: 1,
    rewards: { points: 50, badge: 'bronze' }
  },
  
  consistent_progression: {
    id: 'consistent_progression',
    name: 'Progress Machine',
    description: 'Progress on 10 different exercises',
    icon: '🚀',
    type: 'progression',
    threshold: 10,
    rewards: { points: 500, badge: 'silver' }
  },

  // Exercise achievements
  exercise_master: {
    id: 'exercise_master',
    name: 'Exercise Master',
    description: 'Complete 50 sets of any single exercise',
    icon: '🎯',
    type: 'exercise',
    threshold: 50,
    rewards: { points: 300, badge: 'bronze' }
  },
  
  variety_champion: {
    id: 'variety_champion',
    name: 'Variety Champion',
    description: 'Complete workouts with 20 different exercises',
    icon: '🌈',
    type: 'variety',
    threshold: 20,
    rewards: { points: 400, badge: 'silver' }
  },

  // PR achievements
  personal_record: {
    id: 'personal_record',
    name: 'Personal Record',
    description: 'Hit a personal best on any exercise',
    icon: '⭐',
    type: 'pr',
    threshold: 1,
    rewards: { points: 100, badge: 'bronze' }
  },
  
  pr_streak: {
    id: 'pr_streak',
    name: 'PR Streak',
    description: 'Hit personal records in 5 consecutive workouts',
    icon: '🔥',
    type: 'pr',
    threshold: 5,
    rewards: { points: 1000, badge: 'gold' }
  }
};

// Challenge definitions
export const CHALLENGES = {
  // Weekly challenges
  volume_challenge: {
    id: 'volume_challenge',
    name: 'Volume Week',
    description: 'Complete 15000 total volume this week',
    icon: '🏋️',
    duration: 7,
    type: 'volume',
    goal: 15000,
    rewards: { points: 500, badge: 'weekly' }
  },
  
  consistency_challenge: {
    id: 'consistency_challenge',
    name: 'Consistency Week',
    description: 'Complete 5 workouts this week',
    icon: '📅',
    duration: 7,
    type: 'consistency',
    goal: 5,
    rewards: { points: 300, badge: 'weekly' }
  },
  
  progression_challenge: {
    id: 'progression_challenge',
    name: 'Progression Week',
    description: 'Progress on 3 different exercises this week',
    icon: '📈',
    duration: 7,
    type: 'progression',
    goal: 3,
    rewards: { points: 400, badge: 'weekly' }
  },

  // Monthly challenges
  monthly_volume: {
    id: 'monthly_volume',
    name: 'Volume Month',
    description: 'Complete 60000 total volume this month',
    icon: '💪',
    duration: 30,
    type: 'volume',
    goal: 60000,
    rewards: { points: 2000, badge: 'monthly' }
  },
  
  monthly_variety: {
    id: 'monthly_variety',
    name: 'Variety Month',
    description: 'Complete 50 different workouts this month',
    icon: '🌈',
    duration: 30,
    type: 'variety',
    goal: 50,
    rewards: { points: 1500, badge: 'monthly' }
  }
};

// Motivation messages
export const MOTIVATION_MESSAGES = {
  // After workout completion
  post_workout: [
    "Great job! You're one step closer to your goals!",
    "Consistency is key, and you're nailing it!",
    "Another workout down, more progress made!",
    "You're building a stronger, healthier you!",
    "Keep up the amazing work!"
  ],

  // During rest periods
  rest_period: [
    "Rest is just as important as the work. Recharge!",
    "You've got this! Take a breath and get ready.",
    "Recovery time is growth time. Make the most of it!",
    "Stay focused, the next set is going to be great!",
    "Use this time to visualize your success!"
  ],

  // When hitting plateaus
  plateau: [
    "Plateaus are just progress in disguise. Keep going!",
    "Every expert was once a beginner who didn't give up.",
    "Progress isn't always linear. Trust the process!",
    "Small steps still move you forward!",
    "You're stronger than any plateau!"
  ],

  // For streaks
  streak: [
    "🔥 {streak} day streak! You're on fire!",
    "🏆 {streak} days in a row! That's dedication!",
    "👑 {streak} days strong! Keep dominating!",
    "💪 {streak} days of consistency! You're building greatness!",
    "🚀 {streak} days and counting! The sky's the limit!"
  ]
};

// Gamification system class
export class GamificationSystem {
  constructor() {
    this.achievements = this.loadAchievements();
    this.challenges = this.loadChallenges();
    this.points = this.loadPoints();
    this.level = this.calculateLevel();
  }

  // Achievement system
  checkAchievements() {
    const history = getSessionHistory();
    const exerciseHistory = this.getAllExerciseHistory();
    
    const newAchievements = [];
    
    // Check consistency achievements
    const streak = this.getCurrentStreak();
    const consistencyAchievements = [
      ACHIEVEMENTS.daily_streak,
      ACHIEVEMENTS.weekly_streak,
      ACHIEVEMENTS.monthly_streak
    ];

    for (const achievement of consistencyAchievements) {
      if (streak >= achievement.threshold && !this.hasAchievement(achievement.id)) {
        newAchievements.push(this.unlockAchievement(achievement));
      }
    }

    // Check volume achievements
    const maxVolume = this.getMaxVolumeWorkout();
    const volumeAchievements = [
      ACHIEVEMENTS.volume_1000,
      ACHIEVEMENTS.volume_5000
    ];

    for (const achievement of volumeAchievements) {
      if (maxVolume >= achievement.threshold && !this.hasAchievement(achievement.id)) {
        newAchievements.push(this.unlockAchievement(achievement));
      }
    }

    // Check progression achievements
    const progressionCount = this.getProgressionCount();
    const progressionAchievements = [
      ACHIEVEMENTS.first_progression,
      ACHIEVEMENTS.consistent_progression
    ];

    for (const achievement of progressionAchievements) {
      if (progressionCount >= achievement.threshold && !this.hasAchievement(achievement.id)) {
        newAchievements.push(this.unlockAchievement(achievement));
      }
    }

    // Check exercise achievements
    const maxExerciseSets = this.getMaxExerciseSets();
    const varietyCount = this.getVarietyCount();
    
    if (maxExerciseSets >= ACHIEVEMENTS.exercise_master.threshold && !this.hasAchievement(ACHIEVEMENTS.exercise_master.id)) {
      newAchievements.push(this.unlockAchievement(ACHIEVEMENTS.exercise_master));
    }

    if (varietyCount >= ACHIEVEMENTS.variety_champion.threshold && !this.hasAchievement(ACHIEVEMENTS.variety_champion.id)) {
      newAchievements.push(this.unlockAchievement(ACHIEVEMENTS.variety_champion));
    }

    // Check PR achievements
    const prCount = this.getPRCount();
    const prAchievements = [
      ACHIEVEMENTS.personal_record,
      ACHIEVEMENTS.pr_streak
    ];

    for (const achievement of prAchievements) {
      if (prCount >= achievement.threshold && !this.hasAchievement(achievement.id)) {
        newAchievements.push(this.unlockAchievement(achievement));
      }
    }

    return newAchievements;
  }

  // Challenge system
  updateChallenges() {
    const now = new Date();
    const history = getSessionHistory();
    
    for (const challenge of this.challenges) {
      if (challenge.status === 'active') {
        const challengeHistory = this.getChallengeHistory(challenge, history);
        challenge.progress = this.calculateChallengeProgress(challenge, challengeHistory);
        
        if (challenge.progress >= challenge.goal) {
          challenge.status = 'completed';
          challenge.completedAt = now.toISOString();
          this.addPoints(challenge.rewards.points);
        } else if (now > new Date(challenge.expiresAt)) {
          challenge.status = 'expired';
        }
      }
    }

    this.saveChallenges();
  }

  // Create new challenge
  createChallenge(type) {
    const challengeTemplate = CHALLENGES[type];
    if (!challengeTemplate) return null;

    const now = new Date();
    const challenge = {
      ...challengeTemplate,
      id: `challenge_${Date.now()}`,
      createdAt: now.toISOString(),
      expiresAt: new Date(now.getTime() + (challengeTemplate.duration * 24 * 60 * 60 * 1000)).toISOString(),
      status: 'active',
      progress: 0
    };

    this.challenges.push(challenge);
    this.saveChallenges();
    return challenge;
  }

  // Motivation system
  getMotivationMessage(type, context = {}) {
    const messages = MOTIVATION_MESSAGES[type] || [];
    if (messages.length === 0) return '';

    let message = messages[Math.floor(Math.random() * messages.length)];
    
    // Replace placeholders
    if (context.streak) {
      message = message.replace('{streak}', context.streak);
    }

    return message;
  }

  // Level system
  calculateLevel() {
    const level = Math.floor(Math.sqrt(this.points / 100)) + 1;
    return level;
  }

  getCurrentLevelProgress() {
    const currentLevelPoints = Math.pow(this.level - 1, 2) * 100;
    const nextLevelPoints = Math.pow(this.level, 2) * 100;
    const progress = ((this.points - currentLevelPoints) / (nextLevelPoints - currentLevelPoints)) * 100;
    
    return {
      current: this.level,
      progress: Math.max(0, Math.min(100, progress)),
      nextLevelPoints
    };
  }

  // Helper methods
  hasAchievement(achievementId) {
    return this.achievements.some(a => a.id === achievementId && a.unlocked);
  }

  unlockAchievement(achievement) {
    const unlockedAchievement = {
      ...achievement,
      unlocked: true,
      unlockedAt: new Date().toISOString()
    };

    this.achievements.push(unlockedAchievement);
    this.addPoints(achievement.rewards.points);
    this.saveAchievements();

    return unlockedAchievement;
  }

  addPoints(points) {
    this.points += points;
    this.level = this.calculateLevel();
    this.savePoints();
  }

  getCurrentStreak() {
    const history = getSessionHistory();
    if (history.length === 0) return 0;

    let streak = 1;
    const dates = history.map(s => new Date(s.startTime)).sort((a, b) => b - a);

    for (let i = 1; i < dates.length; i++) {
      const diff = Math.floor((dates[i - 1] - dates[i]) / (1000 * 60 * 60 * 24));
      if (diff <= 1) streak++;
      else break;
    }

    return streak;
  }

  getMaxVolumeWorkout() {
    const history = getSessionHistory();
    return Math.max(...history.map(s => s.totalVolume || 0), 0);
  }

  getProgressionCount() {
    // Count progressions from exercise history
    const exerciseHistory = this.getAllExerciseHistory();
    let progressionCount = 0;

    for (const exercise of Object.values(exerciseHistory)) {
      for (let i = 1; i < exercise.length; i++) {
        if (exercise[i].weight > exercise[i - 1].weight) {
          progressionCount++;
        }
      }
    }

    return progressionCount;
  }

  getMaxExerciseSets() {
    const exerciseHistory = this.getAllExerciseHistory();
    const exerciseCounts = {};

    for (const exercise of Object.values(exerciseHistory)) {
      const name = exercise[0]?.exerciseName || 'unknown';
      exerciseCounts[name] = (exerciseCounts[name] || 0) + exercise.length;
    }

    return Math.max(...Object.values(exerciseCounts), 0);
  }

  getVarietyCount() {
    const history = getSessionHistory();
    const exercises = new Set();
    
    history.forEach(session => {
      if (session.exercises) {
        session.exercises.forEach(ex => exercises.add(ex.name));
      }
    });

    return exercises.size;
  }

  getPRCount() {
    // Count personal records
    const exerciseHistory = this.getAllExerciseHistory();
    let prCount = 0;

    for (const exercise of Object.values(exerciseHistory)) {
      let maxVolume = 0;
      exercise.forEach(set => {
        const volume = set.weight * set.reps;
        if (volume > maxVolume) {
          maxVolume = volume;
          prCount++;
        }
      });
    }

    return prCount;
  }

  getAllExerciseHistory() {
    // Get all exercise history from all exercises
    const allExercises = [];
    const history = getSessionHistory();

    history.forEach(session => {
      if (session.exercises) {
        session.exercises.forEach(ex => {
          if (ex.setsData) {
            ex.setsData.forEach(set => {
              allExercises.push({
                exerciseName: ex.name,
                weight: set.weight,
                reps: set.reps,
                timestamp: session.startTime
              });
            });
          }
        });
      }
    });

    return allExercises;
  }

  getChallengeHistory(challenge, history) {
    const startDate = new Date(challenge.createdAt);
    const endDate = new Date(challenge.expiresAt);
    
    return history.filter(session => {
      const sessionDate = new Date(session.startTime);
      return sessionDate >= startDate && sessionDate <= endDate;
    });
  }

  calculateChallengeProgress(challenge, history) {
    switch (challenge.type) {
      case 'volume':
        return history.reduce((sum, session) => sum + (session.totalVolume || 0), 0);
      case 'consistency':
        return history.length;
      case 'progression':
        return this.countProgressionsInHistory(history);
      case 'variety':
        return this.countUniqueWorkouts(history);
      default:
        return 0;
    }
  }

  countProgressionsInHistory(history) {
    let count = 0;
    const exerciseHistory = {};

    history.forEach(session => {
      if (session.exercises) {
        session.exercises.forEach(ex => {
          if (!exerciseHistory[ex.name]) exerciseHistory[ex.name] = [];
          if (ex.setsData) {
            ex.setsData.forEach(set => {
              exerciseHistory[ex.name].push({
                weight: set.weight,
                timestamp: session.startTime
              });
            });
          }
        });
      }
    });

    Object.values(exerciseHistory).forEach(exercises => {
      for (let i = 1; i < exercises.length; i++) {
        if (exercises[i].weight > exercises[i - 1].weight) {
          count++;
        }
      }
    });

    return count;
  }

  countUniqueWorkouts(history) {
    const uniqueWorkouts = new Set();
    history.forEach(session => {
      uniqueWorkouts.add(session.workoutKey);
    });
    return uniqueWorkouts.size;
  }

  // Storage methods
  loadAchievements() {
    try {
      const saved = localStorage.getItem(profileKey('gamification_achievements'));
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }

  saveAchievements() {
    localStorage.setItem(profileKey('gamification_achievements'), JSON.stringify(this.achievements));
  }

  loadChallenges() {
    try {
      const saved = localStorage.getItem(profileKey('gamification_challenges'));
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }

  saveChallenges() {
    localStorage.setItem(profileKey('gamification_challenges'), JSON.stringify(this.challenges));
  }

  loadPoints() {
    try {
      return parseInt(localStorage.getItem(profileKey('gamification_points')) || '0', 10);
    } catch {
      return 0;
    }
  }

  savePoints() {
    localStorage.setItem(profileKey('gamification_points'), this.points.toString());
  }

  // Export data
  exportData() {
    return {
      achievements: this.achievements,
      challenges: this.challenges,
      points: this.points,
      level: this.level,
      exportDate: new Date().toISOString()
    };
  }

  // Import data
  importData(data) {
    if (data.achievements) this.achievements = data.achievements;
    if (data.challenges) this.challenges = data.challenges;
    if (data.points) this.points = data.points;
    if (data.level) this.level = data.level;
    
    this.saveAchievements();
    this.saveChallenges();
    this.savePoints();
  }
}

// Create global instance
export const gamificationSystem = new GamificationSystem();

// Export default
export default {
  ACHIEVEMENTS,
  CHALLENGES,
  MOTIVATION_MESSAGES,
  GamificationSystem,
  gamificationSystem
};