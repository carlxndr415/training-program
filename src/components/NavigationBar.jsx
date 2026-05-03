import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Dumbbell, 
  Activity, 
  BarChart3, 
  Apple, 
  User, 
  LogIn, 
  LogOut,
  Menu,
  X,
  ChevronDown,
  Trophy,
  Star,
  Zap
} from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import AchievementDashboard from './AchievementDashboard';
import NotificationSettings from './NotificationSettings';
import ProfileSwitcher from './ProfileSwitcher';
import WorkoutEditor from './WorkoutEditor';
import { Bell, Pencil } from 'lucide-react';

const NavigationBar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const location = useLocation();
  const { user, isAuthenticated, logout } = useUser();

  // Mock gamification stats for now
  const gamificationStats = {
    level: 3,
    points: 1250,
    streak: 7,
    achievements: 5
  };

  const navigationItems = [
    { path: '/', icon: Home, label: 'Home', exact: true },
    { path: '/workouts', icon: Dumbbell, label: 'Workouts' },
    { path: '/tracking', icon: Activity, label: 'Tracking' },
    { path: '/dashboard', icon: BarChart3, label: 'Dashboard' },
    { path: '/nutrition', icon: Apple, label: 'Nutrition' }
  ];

  const isActive = (path, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    logout();
    setIsProfileMenuOpen(false);
  };

  return (
    <>
      <nav className="bg-white/95 backdrop-blur-sm shadow-lg sticky top-0 z-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo and Main Navigation */}
            <div className="flex items-center">
              {/* Logo */}
              <Link 
                to="/" 
                className="flex items-center space-x-3 hover:opacity-80 transition-all"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                  <Dumbbell size={24} className="text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Training Program</h1>
                  <p className="text-xs text-gray-600">v 0.1.0</p>
                </div>
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden md:ml-8 md:flex md:space-x-8">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 transition-colors duration-200 ${
                        isActive(item.path, item.exact)
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-700 hover:text-blue-600 hover:border-blue-300'
                      }`}
                    >
                      <Icon size={18} className="mr-2" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-4">
              {/* Gamification Stats (Desktop) */}
              <div className="hidden lg:flex items-center space-x-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white p-3 rounded-xl shadow-lg">
                <div className="flex items-center gap-2">
                  <Trophy size={16} />
                  <span className="text-sm font-semibold">Level {gamificationStats.level}</span>
                </div>
                <div className="w-px h-8 bg-white/30" />
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div className="text-center">
                    <div className="font-bold">{gamificationStats.points}</div>
                    <div className="text-purple-200">Points</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold">{gamificationStats.streak}</div>
                    <div className="text-purple-200">Streak</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold">{gamificationStats.achievements}</div>
                    <div className="text-purple-200">Achievements</div>
                  </div>
                </div>
                <button
                  onClick={() => setShowAchievements(true)}
                  className="ml-2 p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
                >
                  <Star size={16} />
                </button>
              </div>

              {/* Edit Workouts */}
              <button
                onClick={() => setShowEditor(true)}
                className="p-2 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
                title="Edit Workouts"
              >
                <Pencil size={20} />
              </button>

              {/* Notification Bell */}
              <button
                onClick={() => setShowNotifications(true)}
                className="p-2 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
                title="Workout Reminders"
              >
                <Bell size={20} />
              </button>

              {/* Profile Section */}
              <ProfileSwitcher onProfileChange={() => window.location.reload()} />

              {/* Mobile menu button */}
              <div className="md:hidden">
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none"
                >
                  {isMobileMenuOpen ? (
                    <X size={24} />
                  ) : (
                    <Menu size={24} />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 pt-4 pb-3">
              <div className="space-y-1">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors ${
                        isActive(item.path, item.exact)
                          ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-500'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon size={20} className="mr-3" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
              
              {/* Mobile Profile Section */}
              <div className="mt-4 border-t border-gray-200 pt-4 px-3">
                <ProfileSwitcher onProfileChange={() => { setIsMobileMenuOpen(false); window.location.reload(); }} />
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Workout Editor Modal */}
      {showEditor && (
        <WorkoutEditor
          onClose={() => setShowEditor(false)}
          onSave={() => { setShowEditor(false); window.location.reload(); }}
        />
      )}

      {/* Notification Settings Modal */}
      {showNotifications && (
        <NotificationSettings onClose={() => setShowNotifications(false)} />
      )}

      {/* Achievement Dashboard Modal */}
      {showAchievements && (
        <AchievementDashboard 
          isOpen={showAchievements}
          onClose={() => setShowAchievements(false)}
        />
      )}
    </>
  );
};

export default NavigationBar;
