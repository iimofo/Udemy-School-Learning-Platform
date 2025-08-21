import {
  collection, doc, addDoc, updateDoc, deleteDoc, getDocs, getDoc, query, where, orderBy, serverTimestamp, onSnapshot
} from 'firebase/firestore';
import { db } from '../config/firebase';

export const notificationService = {
  // Create a new notification
  async createNotification(notificationData) {
    try {
      const notificationsRef = collection(db, 'notifications');
      const docRef = await addDoc(notificationsRef, {
        ...notificationData,
        createdAt: serverTimestamp(),
        read: false,
        priority: notificationData.priority || 'medium'
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  },

  // Get notifications for a user
  async getUserNotifications(userId, limit = 50) {
    try {
      const notificationsRef = collection(db, 'notifications');
      const q = query(
        notificationsRef,
        where('recipientId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      const notifications = [];
      querySnapshot.forEach((doc) => {
        notifications.push({ id: doc.id, ...doc.data() });
      });
      
      return notifications.slice(0, limit);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  },

  // Mark notification as read
  async markAsRead(notificationId) {
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, {
        read: true,
        readAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },

  // Mark all notifications as read for a user
  async markAllAsRead(userId) {
    try {
      const notificationsRef = collection(db, 'notifications');
      const q = query(
        notificationsRef,
        where('recipientId', '==', userId),
        where('read', '==', false)
      );
      const querySnapshot = await getDocs(q);
      
      const updatePromises = querySnapshot.docs.map(doc => {
        const notificationRef = doc.ref;
        return updateDoc(notificationRef, {
          read: true,
          readAt: serverTimestamp()
        });
      });
      
      await Promise.all(updatePromises);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  },

  // Delete a notification
  async deleteNotification(notificationId) {
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await deleteDoc(notificationRef);
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  },

  // Get unread notification count
  async getUnreadCount(userId) {
    try {
      const notificationsRef = collection(db, 'notifications');
      const q = query(
        notificationsRef,
        where('recipientId', '==', userId),
        where('read', '==', false)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.size;
    } catch (error) {
      console.error('Error getting unread count:', error);
      throw error;
    }
  },

  // Create course announcement
  async createCourseAnnouncement(courseId, instructorId, announcement) {
    try {
      // Get all enrolled students for this course
      const enrollmentsRef = collection(db, 'enrollments');
      const enrollmentsQuery = query(enrollmentsRef, where('courseId', '==', courseId));
      const enrollmentsSnapshot = await getDocs(enrollmentsQuery);
      
      const notificationPromises = enrollmentsSnapshot.docs.map(enrollment => {
        const enrollmentData = enrollment.data();
        return this.createNotification({
          type: 'course_announcement',
          recipientId: enrollmentData.userId,
          senderId: instructorId,
          courseId: courseId,
          title: 'Course Announcement',
          message: announcement.message,
          priority: 'high',
          data: {
            courseId: courseId,
            announcementId: announcement.id
          }
        });
      });
      
      await Promise.all(notificationPromises);
    } catch (error) {
      console.error('Error creating course announcement:', error);
      throw error;
    }
  },

  // Notify teacher about new student enrollment
  async notifyTeacherEnrollment(courseId, studentId, courseTitle) {
    try {
      // Get course to find instructor
      const courseRef = doc(db, 'courses', courseId);
      const courseSnap = await getDoc(courseRef);
      
      if (courseSnap.exists()) {
        const courseData = courseSnap.data();
        const instructorId = courseData.instructorId;
        
        // Get student info
        const studentRef = doc(db, 'users', studentId);
        const studentSnap = await getDoc(studentRef);
        const studentName = studentSnap.exists() ? studentSnap.data().displayName : 'New Student';
        
        await this.createNotification({
          type: 'new_enrollment',
          recipientId: instructorId,
          senderId: studentId,
          courseId: courseId,
          title: 'New Student Enrolled',
          message: `${studentName} has enrolled in your course "${courseTitle}"`,
          priority: 'medium',
          data: {
            courseId: courseId,
            studentId: studentId,
            studentName: studentName
          }
        });
      }
    } catch (error) {
      console.error('Error notifying teacher about enrollment:', error);
      throw error;
    }
  },

  // Notify student about new lesson
  async notifyNewLesson(courseId, lessonTitle, courseTitle) {
    try {
      const enrollmentsRef = collection(db, 'enrollments');
      const enrollmentsQuery = query(enrollmentsRef, where('courseId', '==', courseId));
      const enrollmentsSnapshot = await getDocs(enrollmentsQuery);
      
      const notificationPromises = enrollmentsSnapshot.docs.map(enrollment => {
        const enrollmentData = enrollment.data();
        return this.createNotification({
          type: 'new_lesson',
          recipientId: enrollmentData.userId,
          courseId: courseId,
          title: 'New Lesson Available',
          message: `A new lesson "${lessonTitle}" has been added to "${courseTitle}"`,
          priority: 'medium',
          data: {
            courseId: courseId,
            lessonTitle: lessonTitle
          }
        });
      });
      
      await Promise.all(notificationPromises);
    } catch (error) {
      console.error('Error notifying about new lesson:', error);
      throw error;
    }
  },

  // Notify about course completion
  async notifyCourseCompletion(userId, courseId, courseTitle) {
    try {
      await this.createNotification({
        type: 'course_completion',
        recipientId: userId,
        courseId: courseId,
        title: 'Course Completed! 🎉',
        message: `Congratulations! You've completed "${courseTitle}"`,
        priority: 'high',
        data: {
          courseId: courseId,
          courseTitle: courseTitle
        }
      });
    } catch (error) {
      console.error('Error notifying about course completion:', error);
      throw error;
    }
  },

  // Send direct message
  async sendDirectMessage(senderId, recipientId, message) {
    try {
      await this.createNotification({
        type: 'direct_message',
        recipientId: recipientId,
        senderId: senderId,
        title: 'New Message',
        message: message,
        priority: 'medium',
        data: {
          senderId: senderId,
          message: message
        }
      });
    } catch (error) {
      console.error('Error sending direct message:', error);
      throw error;
    }
  },

  // Get real-time notifications listener
  getNotificationsListener(userId, callback) {
    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('recipientId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    return onSnapshot(q, (snapshot) => {
      const notifications = [];
      snapshot.forEach((doc) => {
        notifications.push({ id: doc.id, ...doc.data() });
      });
      callback(notifications);
    });
  },

  // Get real-time unread count listener
  getUnreadCountListener(userId, callback) {
    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('recipientId', '==', userId),
      where('read', '==', false)
    );
    
    return onSnapshot(q, (snapshot) => {
      callback(snapshot.size);
    });
  }
};
