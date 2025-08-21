import { useState, useEffect } from 'react';
import { notificationService } from '../services/notificationService';

export const useNotifications = (userId) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) return;

    let unsubscribeNotifications;
    let unsubscribeUnreadCount;

    const setupListeners = async () => {
      try {
        setLoading(true);
        setError(null);

        // Set up real-time notifications listener
        unsubscribeNotifications = notificationService.getNotificationsListener(
          userId,
          (notifications) => {
            setNotifications(notifications);
            setLoading(false);
          }
        );

        // Set up real-time unread count listener
        unsubscribeUnreadCount = notificationService.getUnreadCountListener(
          userId,
          (count) => {
            setUnreadCount(count);
          }
        );

        // Request browser notification permission
        if ('Notification' in window && Notification.permission === 'default') {
          Notification.requestPermission();
        }

      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    setupListeners();

    return () => {
      if (unsubscribeNotifications) unsubscribeNotifications();
      if (unsubscribeUnreadCount) unsubscribeUnreadCount();
    };
  }, [userId]);

  const markAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, read: true, readAt: new Date() }
            : notification
        )
      );
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      setError(err.message);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead(userId);
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => ({
          ...notification,
          read: true,
          readAt: new Date()
        }))
      );
      
      setUnreadCount(0);
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await notificationService.deleteNotification(notificationId);
      
      // Update local state
      const deletedNotification = notifications.find(n => n.id === notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      
      // Update unread count if notification was unread
      if (deletedNotification && !deletedNotification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const sendDirectMessage = async (recipientId, message) => {
    try {
      await notificationService.sendDirectMessage(userId, recipientId, message);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const createCourseAnnouncement = async (courseId, announcement) => {
    try {
      await notificationService.createCourseAnnouncement(courseId, userId, announcement);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Filter notifications by type
  const getNotificationsByType = (type) => {
    return notifications.filter(notification => notification.type === type);
  };

  // Get unread notifications
  const getUnreadNotifications = () => {
    return notifications.filter(notification => !notification.read);
  };

  // Get high priority notifications
  const getHighPriorityNotifications = () => {
    return notifications.filter(notification => notification.priority === 'high');
  };

  // Show browser notification
  const showBrowserNotification = (title, message) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body: message,
        icon: '/favicon.ico',
        badge: '/favicon.ico'
      });
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    sendDirectMessage,
    createCourseAnnouncement,
    getNotificationsByType,
    getUnreadNotifications,
    getHighPriorityNotifications,
    showBrowserNotification
  };
};
