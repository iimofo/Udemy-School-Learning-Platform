import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Download, Wifi, WifiOff, Bell, Shield, 
  Smartphone, Trash2, RefreshCw, Settings as SettingsIcon,
  User, Moon, Sun, Volume2, VolumeX
} from 'lucide-react';
import pwaService from '../services/pwaService';

const Settings = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [storageUsage, setStorageUsage] = useState(null);
  const [appInfo, setAppInfo] = useState({});
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [autoPlay, setAutoPlay] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSettings();
    setupNetworkListener();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      // Get app info
      const info = pwaService.getAppInfo();
      setAppInfo(info);

      // Get storage usage
      const usage = await pwaService.getStorageUsage();
      setStorageUsage(usage);

      // Check notification permission
      setNotificationsEnabled(Notification.permission === 'granted');

      // Load user preferences from localStorage
      const savedDarkMode = localStorage.getItem('darkMode') === 'true';
      const savedAutoPlay = localStorage.getItem('autoPlay') !== 'false';
      setDarkMode(savedDarkMode);
      setAutoPlay(savedAutoPlay);

    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupNetworkListener = () => {
    const handleNetworkChange = (event) => {
      setIsOnline(event.detail.isOnline);
    };
    window.addEventListener('networkChange', handleNetworkChange);
    setIsOnline(navigator.onLine);
  };

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
  };

  const handleRequestNotifications = async () => {
    try {
      const granted = await pwaService.requestNotificationPermission();
      setNotificationsEnabled(granted);
    } catch (error) {
      console.error('Failed to request notification permission:', error);
    }
  };

  const handleClearCache = async () => {
    try {
      setLoading(true);
      await pwaService.clearCache();
      // Reload storage usage
      const usage = await pwaService.getStorageUsage();
      setStorageUsage(usage);
    } catch (error) {
      console.error('Failed to clear cache:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
    // Apply dark mode to document
    document.documentElement.classList.toggle('dark', newDarkMode);
  };

  const handleToggleAutoPlay = () => {
    const newAutoPlay = !autoPlay;
    setAutoPlay(newAutoPlay);
    localStorage.setItem('autoPlay', newAutoPlay.toString());
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStoragePercentage = () => {
    if (!storageUsage) return 0;
    return Math.round((storageUsage.used / storageUsage.quota) * 100);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigate(-1)}
                className="mr-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <h1 className="text-xl font-bold text-gray-900">Settings</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {loading && (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
          </div>
        )}

        <div className="space-y-6">
          {/* User Profile */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <User className="h-5 w-5 mr-2" />
              Profile
            </h2>
            <div className="flex items-center space-x-4">
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName}
                  className="w-16 h-16 rounded-full"
                />
              ) : (
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-lg">
                    {user?.displayName?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
              )}
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{user?.displayName}</h3>
                <p className="text-gray-600">{user?.email}</p>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                  {user?.role || 'student'}
                </span>
              </div>
            </div>
          </div>

          {/* PWA Settings */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Smartphone className="h-5 w-5 mr-2" />
              App Settings
            </h2>
            
            <div className="space-y-4">
              {/* Install App */}
              {!appInfo.isInstalled && !appInfo.isPWA && (
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center space-x-3">
                    <Download className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium text-green-900">Install App</p>
                      <p className="text-sm text-green-700">Get the full app experience</p>
                    </div>
                  </div>
                  <button
                    onClick={handleInstallApp}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Install
                  </button>
                </div>
              )}

              {/* Network Status */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  {isOnline ? (
                    <Wifi className="h-5 w-5 text-green-600" />
                  ) : (
                    <WifiOff className="h-5 w-5 text-red-600" />
                  )}
                  <div>
                    <p className="font-medium text-gray-900">Network Status</p>
                    <p className="text-sm text-gray-600">
                      {isOnline ? 'Connected' : 'Offline'}
                    </p>
                  </div>
                </div>
                <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
              </div>

              {/* Storage Usage */}
              {storageUsage && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">Storage Usage</span>
                    <span className="text-sm text-gray-600">
                      {formatBytes(storageUsage.used)} / {formatBytes(storageUsage.quota)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${getStoragePercentage()}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-500">
                      {getStoragePercentage()}% used
                    </span>
                    <button
                      onClick={handleClearCache}
                      className="text-xs text-red-600 hover:text-red-700 flex items-center"
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Clear Cache
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Preferences */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <SettingsIcon className="h-5 w-5 mr-2" />
              Preferences
            </h2>
            
            <div className="space-y-4">
              {/* Notifications */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Bell className="h-5 w-5 text-gray-600" />
                  <div>
                    <p className="font-medium text-gray-900">Notifications</p>
                    <p className="text-sm text-gray-600">Get updates about your courses</p>
                  </div>
                </div>
                <button
                  onClick={handleRequestNotifications}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    notificationsEnabled
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {notificationsEnabled ? 'Enabled' : 'Enable'}
                </button>
              </div>

              {/* Dark Mode */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {darkMode ? (
                    <Moon className="h-5 w-5 text-gray-600" />
                  ) : (
                    <Sun className="h-5 w-5 text-gray-600" />
                  )}
                  <div>
                    <p className="font-medium text-gray-900">Dark Mode</p>
                    <p className="text-sm text-gray-600">Switch between light and dark themes</p>
                  </div>
                </div>
                <button
                  onClick={handleToggleDarkMode}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    darkMode ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      darkMode ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Auto-play Videos */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {autoPlay ? (
                    <Volume2 className="h-5 w-5 text-gray-600" />
                  ) : (
                    <VolumeX className="h-5 w-5 text-gray-600" />
                  )}
                  <div>
                    <p className="font-medium text-gray-900">Auto-play Videos</p>
                    <p className="text-sm text-gray-600">Automatically play lesson videos</p>
                  </div>
                </div>
                <button
                  onClick={handleToggleAutoPlay}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    autoPlay ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      autoPlay ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Account Actions */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Account
            </h2>
            
            <div className="space-y-3">
              <button
                onClick={() => navigate('/profile')}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 rounded-lg transition-colors"
              >
                <span className="font-medium text-gray-900">Edit Profile</span>
                <ArrowLeft className="h-4 w-4 text-gray-400 rotate-180" />
              </button>
              
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center p-4 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </button>
            </div>
          </div>

          {/* App Info */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">App Information</h2>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Version</span>
                <span className="text-gray-900">1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Service Worker</span>
                <span className={`${appInfo.hasServiceWorker ? 'text-green-600' : 'text-red-600'}`}>
                  {appInfo.hasServiceWorker ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Installation</span>
                <span className={`${appInfo.isInstalled ? 'text-green-600' : 'text-gray-600'}`}>
                  {appInfo.isInstalled ? 'Installed' : 'Not Installed'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">PWA Mode</span>
                <span className={`${appInfo.isPWA ? 'text-green-600' : 'text-gray-600'}`}>
                  {appInfo.isPWA ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;
