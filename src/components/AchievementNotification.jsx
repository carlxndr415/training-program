import React, { useState, useEffect } from 'react';

const AchievementNotification = ({ achievement, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (achievement) {
      setIsVisible(true);
      setIsAnimating(true);
      
      // Auto-hide after 5 seconds
      const timer = setTimeout(() => {
        handleClose();
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [achievement]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 300);
  };

  if (!isVisible || !achievement) return null;

  return (
    <div 
      className={`fixed top-4 right-4 z-50 transform transition-all duration-300 ${
        isAnimating ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white p-6 rounded-2xl shadow-2xl min-w-80">
        {/* Celebration Animation */}
        <div className="absolute inset-0 rounded-2xl overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-transparent via-white/20 to-transparent animate-pulse" />
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/30 rounded-full animate-bounce" />
          <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-white/20 rounded-full animate-pulse delay-1000" />
        </div>

        {/* Content */}
        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-2xl">{achievement.icon}</span>
              </div>
              <div>
                <div className="font-bold text-lg">Achievement Unlocked!</div>
                <div className="text-yellow-100 text-sm">+{achievement.rewards.points} points</div>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Achievement Details */}
          <div className="mb-4">
            <div className="font-semibold text-xl mb-1">{achievement.name}</div>
            <div className="text-yellow-100 text-sm">{achievement.description}</div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-yellow-100">Progress</span>
              <span className="font-medium">100%</span>
            </div>
            <div className="w-full bg-white/30 rounded-full h-2">
              <div className="bg-white h-2 rounded-full animate-pulse" style={{ width: '100%' }} />
            </div>
          </div>

          {/* Celebration Text */}
          <div className="mt-4 text-center text-yellow-100 font-medium">
            Keep up the amazing work! 🎉
          </div>
        </div>
      </div>
    </div>
  );
};

// Hook for managing achievement notifications
export const useAchievementNotifications = () => {
  const [currentAchievement, setCurrentAchievement] = useState(null);

  const showAchievement = (achievement) => {
    setCurrentAchievement(achievement);
  };

  const hideAchievement = () => {
    setCurrentAchievement(null);
  };

  const NotificationComponent = () => (
    <AchievementNotification 
      achievement={currentAchievement} 
      onClose={hideAchievement} 
    />
  );

  return {
    showAchievement,
    hideAchievement,
    NotificationComponent,
    currentAchievement
  };
};

export default AchievementNotification;