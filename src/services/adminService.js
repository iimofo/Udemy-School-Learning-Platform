import {
  collection, doc, getDocs, getDoc, updateDoc, deleteDoc, query, where, orderBy, serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';

export const adminService = {
  // Get all users
  async getAllUsers() {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const users = [];
      querySnapshot.forEach((doc) => {
        users.push({ id: doc.id, ...doc.data() });
      });
      
      return users;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  // Get user by ID
  async getUserById(userId) {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        return { id: userSnap.id, ...userSnap.data() };
      } else {
        throw new Error('User not found');
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  },

  // Update user role
  async updateUserRole(userId, newRole) {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        role: newRole,
        updatedAt: serverTimestamp()
      });
      
      return { success: true, message: 'User role updated successfully' };
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error;
    }
  },

  // Delete user
  async deleteUser(userId) {
    try {
      const userRef = doc(db, 'users', userId);
      await deleteDoc(userRef);
      
      return { success: true, message: 'User deleted successfully' };
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  },

  // Get all courses for moderation
  async getAllCourses() {
    try {
      const coursesRef = collection(db, 'courses');
      const q = query(coursesRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const courses = [];
      for (const doc of querySnapshot.docs) {
        const course = { id: doc.id, ...doc.data() };
        
        // Get instructor info
        if (course.instructorId) {
          try {
            const instructor = await this.getUserById(course.instructorId);
            course.instructor = instructor;
          } catch (error) {
            course.instructor = { displayName: 'Unknown Instructor' };
          }
        }
        
        courses.push(course);
      }
      
      return courses;
    } catch (error) {
      console.error('Error fetching courses:', error);
      throw error;
    }
  },

  // Update course status
  async updateCourseStatus(courseId, status) {
    try {
      const courseRef = doc(db, 'courses', courseId);
      await updateDoc(courseRef, {
        status: status,
        updatedAt: serverTimestamp()
      });
      
      return { success: true, message: 'Course status updated successfully' };
    } catch (error) {
      console.error('Error updating course status:', error);
      throw error;
    }
  },

  // Delete course
  async deleteCourse(courseId) {
    try {
      const courseRef = doc(db, 'courses', courseId);
      await deleteDoc(courseRef);
      
      return { success: true, message: 'Course deleted successfully' };
    } catch (error) {
      console.error('Error deleting course:', error);
      throw error;
    }
  },

  // Get platform statistics
  async getPlatformStats() {
    try {
      const stats = {
        totalUsers: 0,
        totalCourses: 0,
        totalTeachers: 0,
        totalStudents: 0,
        pendingCourses: 0,
        activeUsers: 0
      };

      // Get users count
      const usersRef = collection(db, 'users');
      const usersSnapshot = await getDocs(usersRef);
      stats.totalUsers = usersSnapshot.size;

      // Get courses count
      const coursesRef = collection(db, 'courses');
      const coursesSnapshot = await getDocs(coursesRef);
      stats.totalCourses = coursesSnapshot.size;

      // Get teachers count
      const teachersQuery = query(usersRef, where('role', '==', 'teacher'));
      const teachersSnapshot = await getDocs(teachersQuery);
      stats.totalTeachers = teachersSnapshot.size;

      // Get students count
      const studentsQuery = query(usersRef, where('role', '==', 'student'));
      const studentsSnapshot = await getDocs(studentsQuery);
      stats.totalStudents = studentsSnapshot.size;

      // Get pending courses count
      const pendingCoursesQuery = query(coursesRef, where('status', '==', 'pending'));
      const pendingCoursesSnapshot = await getDocs(pendingCoursesQuery);
      stats.pendingCourses = pendingCoursesSnapshot.size;

      // For now, active users is estimated as 60% of total users
      stats.activeUsers = Math.round(stats.totalUsers * 0.6);

      return stats;
    } catch (error) {
      console.error('Error fetching platform stats:', error);
      throw error;
    }
  },

  // Get recent activity
  async getRecentActivity() {
    try {
      const activities = [];
      
      // Get recent users
      const usersRef = collection(db, 'users');
      const recentUsersQuery = query(usersRef, orderBy('createdAt', 'desc'), where('createdAt', '>', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)));
      const recentUsersSnapshot = await getDocs(recentUsersQuery);
      
      recentUsersSnapshot.forEach((doc) => {
        const user = doc.data();
        activities.push({
          id: doc.id,
          type: 'user_registration',
          title: `New ${user.role} registered`,
          description: `${user.displayName} joined the platform`,
          timestamp: user.createdAt,
          user: user
        });
      });

      // Get recent courses
      const coursesRef = collection(db, 'courses');
      const recentCoursesQuery = query(coursesRef, orderBy('createdAt', 'desc'), where('createdAt', '>', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)));
      const recentCoursesSnapshot = await getDocs(recentCoursesQuery);
      
      recentCoursesSnapshot.forEach((doc) => {
        const course = doc.data();
        activities.push({
          id: doc.id,
          type: 'course_created',
          title: 'New course submitted',
          description: `${course.title} was created`,
          timestamp: course.createdAt,
          course: course
        });
      });

      // Sort by timestamp
      activities.sort((a, b) => b.timestamp?.toDate?.() - a.timestamp?.toDate?.());
      
      return activities.slice(0, 10); // Return last 10 activities
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      throw error;
    }
  }
};
