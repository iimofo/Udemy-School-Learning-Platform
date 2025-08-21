import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Lesson Service
export const lessonService = {
  // Get lessons by course ID
  async getLessonsByCourse(courseId) {
    try {
      const lessonsRef = collection(db, 'courses', courseId, 'lessons');
      const q = query(lessonsRef, orderBy('order', 'asc'));
      const querySnapshot = await getDocs(q);
      
      const lessons = [];
      querySnapshot.forEach((doc) => {
        lessons.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return lessons;
    } catch (error) {
      console.error('Error fetching lessons:', error);
      throw error;
    }
  },

  // Get lesson by ID
  async getLessonById(courseId, lessonId) {
    try {
      const lessonRef = doc(db, 'courses', courseId, 'lessons', lessonId);
      const lessonSnap = await getDoc(lessonRef);
      
      if (lessonSnap.exists()) {
        return {
          id: lessonSnap.id,
          ...lessonSnap.data()
        };
      } else {
        throw new Error('Lesson not found');
      }
    } catch (error) {
      console.error('Error fetching lesson:', error);
      throw error;
    }
  },

  // Create new lesson
  async createLesson(courseId, lessonData) {
    try {
      const lessonsRef = collection(db, 'courses', courseId, 'lessons');
      const docRef = await addDoc(lessonsRef, {
        ...lessonData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      // Update course lesson count
      const courseRef = doc(db, 'courses', courseId);
      const courseSnap = await getDoc(courseRef);
      if (courseSnap.exists()) {
        const currentLessons = courseSnap.data().lessons || 0;
        await updateDoc(courseRef, {
          lessons: currentLessons + 1
        });
      }
      
      return docRef.id;
    } catch (error) {
      console.error('Error creating lesson:', error);
      throw error;
    }
  },

  // Update lesson
  async updateLesson(courseId, lessonId, updateData) {
    try {
      const lessonRef = doc(db, 'courses', courseId, 'lessons', lessonId);
      await updateDoc(lessonRef, {
        ...updateData,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating lesson:', error);
      throw error;
    }
  },

  // Delete lesson
  async deleteLesson(courseId, lessonId) {
    try {
      const lessonRef = doc(db, 'courses', courseId, 'lessons', lessonId);
      await deleteDoc(lessonRef);
      
      // Update course lesson count
      const courseRef = doc(db, 'courses', courseId);
      const courseSnap = await getDoc(courseRef);
      if (courseSnap.exists()) {
        const currentLessons = courseSnap.data().lessons || 0;
        await updateDoc(courseRef, {
          lessons: Math.max(0, currentLessons - 1)
        });
      }
    } catch (error) {
      console.error('Error deleting lesson:', error);
      throw error;
    }
  },

  // Mark lesson as completed
  async markLessonComplete(courseId, lessonId, userId) {
    try {
      const progressRef = collection(db, 'progress');
      const q = query(
        progressRef,
        where('courseId', '==', courseId),
        where('userId', '==', userId)
      );
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        // Create new progress record
        await addDoc(progressRef, {
          courseId,
          userId,
          completedLessons: [lessonId],
          lastUpdated: serverTimestamp()
        });
      } else {
        // Update existing progress record
        const progressDoc = querySnapshot.docs[0];
        const progressData = progressDoc.data();
        const completedLessons = progressData.completedLessons || [];
        
        if (!completedLessons.includes(lessonId)) {
          completedLessons.push(lessonId);
          await updateDoc(progressDoc.ref, {
            completedLessons,
            lastUpdated: serverTimestamp()
          });

          // Check if course is completed
          const courseRef = doc(db, 'courses', courseId);
          const courseSnap = await getDoc(courseRef);
          if (courseSnap.exists()) {
            const courseData = courseSnap.data();
            const totalLessons = courseData.lessons || 0;
            
            if (completedLessons.length >= totalLessons) {
              // Notify about course completion
              const { notificationService } = await import('./notificationService');
              await notificationService.notifyCourseCompletion(userId, courseId, courseData.title);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error marking lesson complete:', error);
      throw error;
    }
  },

  // Get user progress for a course
  async getUserProgress(courseId, userId) {
    try {
      const progressRef = collection(db, 'progress');
      const q = query(
        progressRef,
        where('courseId', '==', courseId),
        where('userId', '==', userId)
      );
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return {
          completedLessons: [],
          progress: 0
        };
      }
      
      const progressData = querySnapshot.docs[0].data();
      return {
        completedLessons: progressData.completedLessons || [],
        progress: progressData.progress || 0
      };
    } catch (error) {
      console.error('Error fetching user progress:', error);
      throw error;
    }
  },

  // Check if lesson is completed
  async isLessonCompleted(courseId, lessonId, userId) {
    try {
      const progress = await this.getUserProgress(courseId, userId);
      return progress.completedLessons.includes(lessonId);
    } catch (error) {
      console.error('Error checking lesson completion:', error);
      throw error;
    }
  }
};
