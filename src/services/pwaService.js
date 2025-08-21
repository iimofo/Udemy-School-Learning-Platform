class PWAService {
  constructor() {
    this.deferredPrompt = null;
    this.isInstalled = false;
    this.isOnline = navigator.onLine;
    this.init();
  }

  async init() {
    this.registerServiceWorker();
    this.setupInstallPrompt();
    this.setupNetworkListeners();
    this.checkInstallationStatus();
  }

  // Register service worker
  async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered:', registration);
        
        // Handle updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              this.showUpdateNotification();
            }
          });
        });
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  }

  // Setup install prompt
  setupInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      this.showInstallPrompt();
    });

    window.addEventListener('appinstalled', () => {
      this.isInstalled = true;
      this.deferredPrompt = null;
      console.log('App installed successfully');
    });
  }

  // Setup network listeners
  setupNetworkListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.onNetworkChange(true);
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.onNetworkChange(false);
    });
  }

  // Check if app is installed
  checkInstallationStatus() {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      this.isInstalled = true;
    }
  }

  // Show install prompt
  showInstallPrompt() {
    if (this.deferredPrompt && !this.isInstalled) {
      const installButton = document.getElementById('install-app');
      if (installButton) {
        installButton.style.display = 'block';
        installButton.addEventListener('click', () => {
          this.installApp();
        });
      }
    }
  }

  // Install app
  async installApp() {
    if (this.deferredPrompt) {
      this.deferredPrompt.prompt();
      const { outcome } = await this.deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      
      this.deferredPrompt = null;
    }
  }

  // Show update notification
  showUpdateNotification() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.showNotification('App Update Available', {
          body: 'A new version is available. Click to update.',
          icon: '/icon-192x192.png',
          badge: '/icon-192x192.png',
          tag: 'update-notification',
          requireInteraction: true,
          actions: [
            {
              action: 'update',
              title: 'Update Now'
            },
            {
              action: 'dismiss',
              title: 'Later'
            }
          ]
        });
      });
    }
  }

  // Request notification permission
  async requestNotificationPermission() {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }

  // Send notification
  async sendNotification(title, options = {}) {
    if ('Notification' in window && Notification.permission === 'granted') {
      const defaultOptions = {
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
        vibrate: [100, 50, 100],
        data: {
          dateOfArrival: Date.now(),
          primaryKey: 1
        }
      };

      const notification = new Notification(title, { ...defaultOptions, ...options });
      
      notification.addEventListener('click', () => {
        window.focus();
        notification.close();
      });

      return notification;
    }
  }

  // Network change handler
  onNetworkChange(isOnline) {
    const event = new CustomEvent('networkChange', { detail: { isOnline } });
    window.dispatchEvent(event);

    if (isOnline) {
      this.syncOfflineData();
    }
  }

  // Sync offline data
  async syncOfflineData() {
    try {
      // Sync pending actions
      await this.syncPendingActions();
      
      // Sync offline progress
      await this.syncOfflineProgress();
      
      console.log('Offline data synced successfully');
    } catch (error) {
      console.error('Failed to sync offline data:', error);
    }
  }

  // Sync pending actions
  async syncPendingActions() {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      if ('sync' in registration) {
        await registration.sync.register('background-sync');
      }
    }
  }

  // Sync offline progress
  async syncOfflineProgress() {
    // This would sync any offline progress data
    // Implementation depends on your specific needs
  }

  // Cache lesson for offline viewing
  async cacheLesson(lessonId, lessonData) {
    if ('caches' in window) {
      try {
        const cache = await caches.open('learnapp-lessons');
        const response = new Response(JSON.stringify(lessonData), {
          headers: { 'Content-Type': 'application/json' }
        });
        await cache.put(`/lesson/${lessonId}`, response);
        console.log('Lesson cached for offline viewing:', lessonId);
      } catch (error) {
        console.error('Failed to cache lesson:', error);
      }
    }
  }

  // Get cached lesson
  async getCachedLesson(lessonId) {
    if ('caches' in window) {
      try {
        const cache = await caches.open('learnapp-lessons');
        const response = await cache.match(`/lesson/${lessonId}`);
        if (response) {
          return await response.json();
        }
      } catch (error) {
        console.error('Failed to get cached lesson:', error);
      }
    }
    return null;
  }

  // Check if lesson is cached
  async isLessonCached(lessonId) {
    const cachedLesson = await this.getCachedLesson(lessonId);
    return cachedLesson !== null;
  }

  // Get storage usage
  async getStorageUsage() {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      return {
        used: estimate.usage,
        quota: estimate.quota,
        percentage: (estimate.usage / estimate.quota) * 100
      };
    }
    return null;
  }

  // Clear cache
  async clearCache() {
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
        console.log('Cache cleared successfully');
      } catch (error) {
        console.error('Failed to clear cache:', error);
      }
    }
  }

  // Get app info
  getAppInfo() {
    return {
      isInstalled: this.isInstalled,
      isOnline: this.isOnline,
      isPWA: window.matchMedia('(display-mode: standalone)').matches,
      hasServiceWorker: 'serviceWorker' in navigator,
      hasNotifications: 'Notification' in window,
      notificationPermission: 'Notification' in window ? Notification.permission : 'denied'
    };
  }
}

// Create singleton instance
const pwaService = new PWAService();
export default pwaService;
