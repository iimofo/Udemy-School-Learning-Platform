import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home, BookOpen, User, Menu, X, Download, Settings, LogOut, Bell, Shield
} from 'lucide-react';
import pwaService from '../services/pwaService';

const MobileNavigation = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const menuRef = useRef(null);
  const touchStartRef = useRef(null);

  useEffect(() => {
    // Network status listener
    const handleNetworkChange = (event) => {
      setIsOnline(event.detail.isOnline);
    };

    window.addEventListener('networkChange', handleNetworkChange);
    setIsOnline(navigator.onLine);

    // PWA install prompt
    const checkInstallPrompt = () => {
      const appInfo = pwaService.getAppInfo();
      setShowInstallPrompt(!appInfo.isInstalled && !appInfo.isPWA);
    };

    checkInstallPrompt();

    // Close menu when route changes
    setIsOpen(false);

    return () => {
      window.removeEventListener('networkChange', handleNetworkChange);
    };
  }, [location]);

  // Touch gesture handling
  useEffect(() => {
    const handleTouchStart = (e) => {
      touchStartRef.current = e.touches[0].clientX;
    };

    const handleTouchEnd = (e) => {
      if (!touchStartRef.current) return;

      const touchEnd = e.changedTouches[0].clientX;
      const diff = touchStartRef.current - touchEnd;

      // Swipe left to open menu (from right edge)
      if (diff > 50 && touchStartRef.current > window.innerWidth - 50) {
        setIsOpen(true);
      }
      // Swipe right to close menu
      else if (diff < -50 && isOpen) {
        setIsOpen(false);
      }

      touchStartRef.current = null;
    };

    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isOpen]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleInstallApp = () => {
    pwaService.installApp();
    setShowInstallPrompt(false);
  };

  const navigationItems = [
    {
      name: 'Dashboard',
      icon: Home,
      path: '/dashboard',
      active: location.pathname === '/dashboard'
    },
    {
      name: 'Courses',
      icon: BookOpen,
      path: '/courses',
      active: location.pathname === '/courses'
    },
    {
      name: 'Profile',
      icon: User,
      path: '/profile',
      active: location.pathname === '/profile'
    }
  ];

  const adminItems = user?.role === 'admin' ? [
    {
      name: 'Admin Panel',
      icon: Shield,
      path: '/admin',
      active: location.pathname === '/admin'
    }
  ] : [];

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 right-4 z-50 p-2 bg-white rounded-lg shadow-lg border border-gray-200"
        aria-label="Toggle menu"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40" />
      )}

      {/* Mobile Menu */}
      <div
        ref={menuRef}
        className={`lg:hidden fixed top-0 right-0 h-full w-80 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName}
                  className="w-12 h-12 rounded-full"
                />
              ) : (
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">
                    {user?.displayName?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
              )}
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{user?.displayName}</h3>
                <p className="text-sm text-gray-500">{user?.email}</p>
                <div className="flex items-center mt-1">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {user?.role || 'student'}
                  </span>
                  <div className={`ml-2 w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.name}
                  onClick={() => {
                    navigate(item.path);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    item.active
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.name}</span>
                </button>
              );
            })}

            {adminItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.name}
                  onClick={() => {
                    navigate(item.path);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    item.active
                      ? 'bg-purple-50 text-purple-700 border border-purple-200'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.name}</span>
                </button>
              );
            })}
          </nav>

          {/* Quick Actions */}
          <div className="px-4 py-4 border-t border-gray-200 space-y-2">
            {showInstallPrompt && (
              <button
                onClick={handleInstallApp}
                className="w-full flex items-center space-x-3 px-4 py-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
              >
                <Download className="h-5 w-5" />
                <span className="font-medium">Install App</span>
              </button>
            )}

            <button
              onClick={() => {
                navigate('/settings');
                setIsOpen(false);
              }}
              className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <Settings className="h-5 w-5" />
              <span className="font-medium">Settings</span>
            </button>

            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>

          {/* Status */}
          <div className="px-4 py-3 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>Status: {isOnline ? 'Online' : 'Offline'}</span>
              <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileNavigation;
