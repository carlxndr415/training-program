import React, { useState, useEffect } from 'react';
import { gamificationSystem, ACHIEVEMENTS, CHALLENGES, MOTIVATION_MESSAGES } from '../utils/gamificationSystem';

const AchievementDashboard = ({ isOpen, onClose }) => {
  const [achievements, setAchievements] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [stats, setStats] = useState({ points: 0, level: 1, streak: 0 });
  const [selectedTab, setSelectedTab] = useState('achievements');

  useEffect(() => {
    if (isOpen) {
      loadGamificationData();
    }
  }, [isOpen]);

  const loadGamificationData = () => {
    // Load current state from gamification system
    setAchievements(gamificationSystem.achievements);
    setChallenges(gamificationSystem.challenges);
    
    // Get current stats
    const levelProgress = gamificationSystem.getCurrentLevelProgress();
    const streak = gamificationSystem.getCurrentStreak();
    
    setStats({
      points: gamificationSystem.points,
      level: levelProgress.current,
      streak: streak,
      levelProgress: levelProgress.progress
    });
  };

  const getAchievementStatus = (achievement) => {
    const userAchievement = achievements.find(a => a.id === achievement.id);
    return userAchievement ? 'unlocked' : 'locked';
  };

  const getChallengeProgress = (challenge) => {
    if (challenge.status === 'completed') return 100;
    if (challenge.status === 'expired') return 0;
    
    const progress = challenge.progress || 0;
    const percentage = Math.min(100, Math.round((progress / challenge.goal) * 100));
    return percentage;
  };

  const formatChallengeProgress = (challenge) => {
    if (challenge.status === 'completed') return 'Completed!';
    if (challenge.status === 'expired') return 'Expired';
    
    const progress = challenge.progress || 0;
    return `${progress} / ${challenge.goal}`;
  };

  const getMotivationMessage = () => {
    return gamificationSystem.getMotivationMessage('streak', { streak: stats.streak });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Achievement Center</h2>
              <p className="text-purple-100">Track your progress and earn rewards</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="bg-white/10 rounded-lg p-4">
              <div className="text-2xl font-bold">{stats.points}</div>
              <div className="text-sm text-purple-200">Points</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <div className="text-2xl font-bold">Level {stats.level}</div>
              <div className="text-sm text-purple-200">Current Level</div>
              <div className="w-full bg-white/20 rounded-full h-2 mt-2">
                <div 
                  className="bg-white h-2 rounded-full transition-all duration-300"
                  style={{ width: `${stats.levelProgress}%` }}
                />
              </div>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <div className="text-2xl font-bold">{stats.streak}</div>
              <div className="text-sm text-purple-200">Day Streak</div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-200">
          {[
            { key: 'achievements', label: 'Achievements', icon: '🏆' },
            { key: 'challenges', label: 'Challenges', icon: '🎯' },
            { key: 'rewards', label: 'Rewards', icon: '💎' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setSelectedTab(tab.key)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${
                selectedTab === tab.key 
                  ? 'text-purple-600 border-b-2 border-purple-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Achievements Tab */}
          {selectedTab === 'achievements' && (
            <div className="space-y-4">
              <div className="text-center text-gray-500 mb-4">
                {getMotivationMessage()}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.values(ACHIEVEMENTS).map(achievement => {
                  const status = getAchievementStatus(achievement);
                  const isUnlocked = status === 'unlocked';
                  
                  return (
                    <div
                      key={achievement.id}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        isUnlocked
                          ? 'border-green-200 bg-green-50'
                          : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{achievement.icon}</span>
                          <div>
                            <div className={`font-semibold ${
                              isUnlocked ? 'text-green-800' : 'text-gray-600'
                            }`}>
                              {achievement.name}
                            </div>
                            <div className={`text-xs ${
                              isUnlocked ? 'text-green-600' : 'text-gray-400'
                            }`}>
                              {achievement.type}
                            </div>
                          </div>
                        </div>
                        {isUnlocked && (
                          <div className="text-green-600 font-bold text-sm">UNLOCKED</div>
                        )}
                      </div>
                      <div className={`text-sm mb-3 ${
                        isUnlocked ? 'text-green-700' : 'text-gray-500'
                      }`}>
                        {achievement.description}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-500">
                          Threshold: {achievement.threshold}
                        </div>
                        <div className="text-xs font-medium text-purple-600">
                          +{achievement.rewards.points} pts
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Challenges Tab */}
          {selectedTab === 'challenges' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.values(CHALLENGES).map(challenge => {
                  const progress = getChallengeProgress(challenge);
                  const status = challenge.status;
                  
                  return (
                    <div key={challenge.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{challenge.icon}</span>
                          <div>
                            <div className="font-semibold text-gray-800">
                              {challenge.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {challenge.type} • {challenge.duration} days
                            </div>
                          </div>
                        </div>
                        <div className={`px-2 py-1 rounded text-xs font-medium ${
                          status === 'completed' 
                            ? 'bg-green-100 text-green-800'
                            : status === 'expired'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {status.toUpperCase()}
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        {challenge.description}
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Progress</span>
                          <span className="font-medium">{formatChallengeProgress(challenge)}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div 
                            className={`h-3 rounded-full transition-all duration-300 ${
                              status === 'completed' ? 'bg-green-500' :
                              status === 'expired' ? 'bg-red-500' : 'bg-blue-500'
                            }`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                      {status === 'active' && (
                        <div className="mt-2 text-xs text-gray-500">
                          Rewards: +{challenge.rewards.points} points
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Rewards Tab */}
          {selectedTab === 'rewards' && (
            <div className="space-y-6">
              {/* Level Rewards */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Level Progression</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[1, 2, 3, 4, 5].map(level => {
                    const levelPoints = Math.pow(level, 2) * 100;
                    const isCurrent = stats.level === level;
                    const isUnlocked = stats.level >= level;
                    
                    return (
                      <div
                        key={level}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          isCurrent
                            ? 'border-yellow-400 bg-yellow-50'
                            : isUnlocked
                            ? 'border-green-200 bg-green-50'
                            : 'border-gray-200 bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-semibold">Level {level}</div>
                          {isCurrent && (
                            <div className="text-yellow-600 font-bold text-sm">CURRENT</div>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 mb-2">
                          Required: {levelPoints} points
                        </div>
                        <div className="text-xs text-gray-500">
                          Unlock exclusive features and badges
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Badge Collection */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Badge Collection</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { name: 'Consistency', icon: '🔥', color: 'red' },
                    { name: 'Strength', icon: '💪', color: 'orange' },
                    { name: 'Progress', icon: '📈', color: 'green' },
                    { name: 'Volume', icon: '🏋️', color: 'blue' }
                  ].map(badge => (
                    <div key={badge.name} className="text-center p-4 border border-gray-200 rounded-lg">
                      <div className="text-3xl mb-2">{badge.icon}</div>
                      <div className="text-sm font-medium text-gray-700">{badge.name}</div>
                      <div className="text-xs text-gray-500 mt-1">Collect to unlock</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AchievementDashboard;