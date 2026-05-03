import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Dumbbell, 
  BarChart3, 
  Utensils, 
  Settings, 
  Moon, 
  Sun, 
  Menu, 
  X,
  Smartphone,
  Wifi,
  WifiOff,
  Trophy,
  Star,
  Zap,
  Heart,
  Shield,
  Download,
  Share2,
  Volume2,
  VolumeX,
  Eye,
  EyeOff,
  Plus,
  Minus,
  Filter,
  Search,
  User,
  LogOut,
  ChevronDown,
  ChevronUp,
  Activity,
  Apple
} from 'lucide-react';
import { RESPONSIVE_CONFIG } from '../utils/responsiveUtils';
import { autoSaveManager } from '../utils/offlineStorage';
import { gamificationSystem } from '../utils/gamificationSystem';

const ResponsiveNavigationBar = ({ 
  darkMode, 
  onToggleDarkMode, 
  onToggleSidebar, 
  sidebarOpen,
  currentWorkout = null,
  onEndWorkout = null,
  user = null,
  isAuthenticated = false,
  onLogout = null
}) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineIndicator, setShowOfflineIndicator] = useState(false);
  const [level, setLevel] = useState(1);
  const [points, setPoints] = useState(0);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Update online status
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineIndicator(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineIndicator(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Load gamification data
    setLevel(gamificationSystem.level);
    setPoints(gamificationSystem.points);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const levelProgress = gamificationSystem.getCurrentLevelProgress();
  const deviceType = RESPONSIVE_CONFIG.SCREEN_SIZE.getDeviceType();

  // Navigation items
  const navigationItems = [
    { path: '/', icon: BarChart3, label: 'Dashboard', exact: true },
    { path: '/workouts', icon: Dumbbell, label: 'Workouts' },
    { path: '/tracking', icon: Heart, label: 'Progress' },
    { path: '/nutrition', icon: Apple, label: 'Nutrition' },
    { path: '/settings', icon: Settings, label: 'Settings' }
  ];

  const isActive = (path, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Offline Indicator */}
      {!isOnline && (
        <div className="bg-yellow-500 text-white text-center py-2 px-4 text-sm font-medium">
          <div className="flex items-center justify-center gap-2">
            <WifiOff size={16} />
            <span>You're offline. Changes will sync when connection is restored.</span>
          </div>
        </div>
      )}

      {/* Top Status Bar */}
      <div className="bg-gray-50 border-b border-gray-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-10 text-xs text-black">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Trophy size={14} className="text-yellow-600" />
                <span>Level {level}</span>
              </div>
              <div className="flex items-center gap-1">
                <Star size={14} className="text-blue-600" />
                <span>{points} points</span>
              </div>
              {currentWorkout && (
                <div className="flex items-center gap-1">
                  <Zap size={14} className="text-orange-600 animate-pulse" />
                  <span>Active: {currentWorkout}</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Wifi size={14} className={isOnline ? "text-green-600" : "text-red-600"} />
                <span>{isOnline ? "Online" : "Offline"}</span>
              </div>
              <div className="flex items-center gap-1">
                <Smartphone size={14} className="text-black" />
                <span>{deviceType}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="bg-white/90 transition-all shadow-2xl border-b border-gray-300 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Brand */}
            <div className="flex items-center gap-4">
              <Link to="/" className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                  <Dumbbell className="h-6 w-6 text-white" />
                </div>
                <div>
                  <span className="text-xl font-bold text-black">Training Program</span>
                  <div className="text-xs text-black opacity-75 hidden sm:block">Science-Based Fitness</div>
                </div>
              </Link>
              
              {/* Level Progress Bar - Desktop Only */}
              <div className="hidden lg:block w-48">
                <div className="text-xs text-black mb-1">Level Progress</div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${levelProgress.progress}%` }}
                  ></div>
                </div>
                <div className="text-xs text-black mt-1">
                  {Math.round(levelProgress.progress)}% to Level {levelProgress.current + 1}
                </div>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link 
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 text-black hover:text-gray-600 transition-colors group ${
                      isActive(item.path, item.exact) ? 'text-blue-600' : ''
                    }`}
                  >
                    <Icon size={20} className={`group-hover:text-blue-500 transition-colors ${
                      isActive(item.path, item.exact) ? 'text-blue-600' : ''
                    }`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-2">
              {/* Current Workout Indicator */}
              {currentWorkout && (
                <div className="hidden md:flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-1">
                  <Zap size={16} className="text-blue-600 animate-pulse" />
                  <span className="text-sm font-medium text-blue-700">{currentWorkout}</span>
                  <button
                    onClick={onEndWorkout}
                    className="ml-2 text-xs text-blue-600 hover:text-blue-800"
                  >
                    End
                  </button>
                </div>
              )}

              {/* User Profile */}
              {isAuthenticated && (
                <div className="relative">
                  <button
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <User size={16} className="text-white" />
                    </div>
                    <span className="hidden md:inline text-sm font-medium text-black">{user?.name || 'User'}</span>
                    {isProfileMenuOpen ? (
                      <ChevronUp size={16} className="text-black" />
                    ) : (
                      <ChevronDown size={16} className="text-black" />
                    )}
                  </button>

                  {/* Profile Dropdown */}
                  {isProfileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50 animate-in slide-in-from-top-2 duration-200">
                      <div className="px-4 py-2 border-b border-gray-200">
                        <p className="text-sm font-medium text-black">{user?.name || 'User'}</p>
                        <p className="text-xs text-black opacity-75">{user?.email || 'No email'}</p>
                      </div>
                      <button
                        onClick={onLogout}
                        className="w-full text-left px-4 py-2 text-sm text-black hover:bg-gray-100 flex items-center gap-2"
                      >
                        <LogOut size={16} />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Theme Toggle */}
              <button
                onClick={onToggleDarkMode}
                className="p-2 rounded-md hover:bg-gray-200 transition-all transform shadow-2xl border border-gray-300"
                aria-label="Toggle theme"
              >
                {darkMode ? (
                  <Sun className="h-5 w-5 text-black" />
                ) : (
                  <Moon className="h-5 w-5 text-black" />
                )}
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={onToggleSidebar}
                className="lg:hidden p-2 rounded-md hover:bg-gray-200 transition-all transform shadow-2xl border border-gray-300"
                aria-label="Toggle menu"
              >
                {sidebarOpen ? (
                  <X className="h-6 w-6 text-black" />
                ) : (
                  <Menu className="h-6 w-6 text-black" />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      {sidebarOpen && (
        <div className="lg:hidden bg-white/90 border-t border-gray-300 animate-in slide-in-from-top-2 duration-200">
          <div className="px-4 py-4 space-y-4">
            {/* User Stats */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Trophy size={20} className="text-yellow-600" />
                  <span className="font-semibold text-black">Level {level}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm text-black">{points} points</div>
                  <div className="text-xs text-black opacity-75">Progress: {Math.round(levelProgress.progress)}%</div>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full"
                  style={{ width: `${levelProgress.progress}%` }}
                ></div>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-3 py-3 rounded-md text-base font-medium text-black hover:bg-gray-200 transition-colors ${
                      isActive(item.path, item.exact) ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                    }`}
                    onClick={onToggleSidebar}
                  >
                    <Icon size={20} />
                    {item.label}
                  </Link>
                );
              })}
            </div>

            {/* Current Workout Actions */}
            {currentWorkout && (
              <div className="border-t border-gray-300 pt-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Zap size={24} className="text-blue-600 animate-pulse" />
                      <div>
                        <div className="font-semibold text-black">{currentWorkout}</div>
                        <div className="text-sm text-black opacity-75">Active Workout</div>
                      </div>
                    </div>
                    <button
                      onClick={onEndWorkout}
                      className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors"
                    >
                      End Workout
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* User Actions */}
            {isAuthenticated && (
              <div className="border-t border-gray-300 pt-4">
                <div className="px-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <User size={20} className="text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-black">{user?.name || 'User'}</p>
                        <p className="text-xs text-black opacity-75">{user?.email || 'No email'}</p>
                      </div>
                    </div>
                    <button
                      onClick={onLogout}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-black hover:bg-gray-100 rounded-md"
                    >
                      <LogOut size={16} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ResponsiveNavigationBar;