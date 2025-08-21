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

// Course Service
export const courseService = {
  // Get all courses
  async getAllCourses() {
    try {
      const coursesRef = collection(db, 'courses');
      const q = query(coursesRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const courses = [];
      querySnapshot.forEach((doc) => {
        courses.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return courses;
    } catch (error) {
      console.error('Error fetching courses:', error);
      throw error;
    }
  },

  // Get course by ID
  async getCourseById(courseId) {
    try {
      const courseRef = doc(db, 'courses', courseId);
      const courseSnap = await getDoc(courseRef);
      
      if (courseSnap.exists()) {
        return {
          id: courseSnap.id,
          ...courseSnap.data()
        };
      } else {
        throw new Error('Course not found');
      }
    } catch (error) {
      console.error('Error fetching course:', error);
      throw error;
    }
  },

  // Get courses by instructor
  async getCoursesByInstructor(instructorId) {
    try {
      const coursesRef = collection(db, 'courses');
      const q = query(coursesRef, where('instructorId', '==', instructorId), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const courses = [];
      querySnapshot.forEach((doc) => {
        courses.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return courses;
    } catch (error) {
      console.error('Error fetching instructor courses:', error);
      throw error;
    }
  },

  // Create new course
  async createCourse(courseData) {
    try {
      const coursesRef = collection(db, 'courses');
      const docRef = await addDoc(coursesRef, {
        ...courseData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        students: 0,
        lessons: 0,
        rating: 0,
        published: true // Auto-publish courses for now
      });
      
      return docRef.id;
    } catch (error) {
      console.error('Error creating course:', error);
      throw error;
    }
  },

  // Update course
  async updateCourse(courseId, updateData) {
    try {
      const courseRef = doc(db, 'courses', courseId);
      await updateDoc(courseRef, {
        ...updateData,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating course:', error);
      throw error;
    }
  },

  // Delete course
  async deleteCourse(courseId) {
    try {
      const courseRef = doc(db, 'courses', courseId);
      await deleteDoc(courseRef);
    } catch (error) {
      console.error('Error deleting course:', error);
      throw error;
    }
  },

  // Enroll in course
  async enrollInCourse(courseId, userId) {
    try {
      const enrollmentRef = collection(db, 'enrollments');
      await addDoc(enrollmentRef, {
        courseId,
        userId,
        enrolledAt: serverTimestamp(),
        progress: 0,
        completedLessons: []
      });
      
      // Update course student count
      const courseRef = doc(db, 'courses', courseId);
      const courseSnap = await getDoc(courseRef);
      if (courseSnap.exists()) {
        const currentStudents = courseSnap.data().students || 0;
        await updateDoc(courseRef, {
          students: currentStudents + 1
        });
      }

      // Notify teacher about new enrollment
      const courseData = courseSnap.data();
      if (courseData) {
        // Import notification service dynamically to avoid circular dependency
        const { notificationService } = await import('./notificationService');
        await notificationService.notifyTeacherEnrollment(courseId, userId, courseData.title);
      }
    } catch (error) {
      console.error('Error enrolling in course:', error);
      throw error;
    }
  },

  // Check if user is enrolled
  async isEnrolled(courseId, userId) {
    try {
      const enrollmentsRef = collection(db, 'enrollments');
      const q = query(
        enrollmentsRef, 
        where('courseId', '==', courseId), 
        where('userId', '==', userId)
      );
      const querySnapshot = await getDocs(q);
      
      return !querySnapshot.empty;
    } catch (error) {
      console.error('Error checking enrollment:', error);
      throw error;
    }
  },

  // Get user enrollments
  async getUserEnrollments(userId) {
    try {
      const enrollmentsRef = collection(db, 'enrollments');
      const q = query(enrollmentsRef, where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      
      const enrollments = [];
      for (const doc of querySnapshot.docs) {
        const enrollment = doc.data();
        const course = await this.getCourseById(enrollment.courseId);
        enrollments.push({
          id: doc.id,
          ...enrollment,
          course
        });
      }
      
      return enrollments;
    } catch (error) {
      console.error('Error fetching user enrollments:', error);
      throw error;
    }
  },

  // Get student progress for teacher's courses
  async getTeacherStudentProgress(teacherId) {
    try {
      // First get all courses by this teacher
      const coursesRef = collection(db, 'courses');
      const coursesQuery = query(coursesRef, where('instructorId', '==', teacherId));
      const coursesSnapshot = await getDocs(coursesQuery);
      
      const teacherCourses = [];
      for (const courseDoc of coursesSnapshot.docs) {
        const course = { id: courseDoc.id, ...courseDoc.data() };
        
        // Get enrollments for this course
        const enrollmentsRef = collection(db, 'enrollments');
        const enrollmentsQuery = query(enrollmentsRef, where('courseId', '==', course.id));
        const enrollmentsSnapshot = await getDocs(enrollmentsQuery);
        
        const students = [];
        for (const enrollmentDoc of enrollmentsSnapshot.docs) {
          const enrollment = enrollmentDoc.data();
          
          // Get user data
          const userRef = doc(db, 'users', enrollment.userId);
          const userSnap = await getDoc(userRef);
          const userData = userSnap.exists() ? userSnap.data() : null;
          
          // Get progress data
          const progressRef = collection(db, 'progress');
          const progressQuery = query(
            progressRef, 
            where('courseId', '==', course.id),
            where('userId', '==', enrollment.userId)
          );
          const progressSnapshot = await getDocs(progressQuery);
          
          let progress = { completedLessons: [], totalLessons: 0 };
          if (!progressSnapshot.empty) {
            progress = progressSnapshot.docs[0].data();
          }
          
          students.push({
            id: enrollment.userId,
            name: userData?.displayName || 'Unknown User',
            email: userData?.email || '',
            photoURL: userData?.photoURL || null,
            enrolledAt: enrollment.enrolledAt,
            progress: progress.completedLessons.length,
            totalLessons: progress.totalLessons || 0,
            progressPercentage: progress.totalLessons > 0 
              ? Math.round((progress.completedLessons.length / progress.totalLessons) * 100)
              : 0
          });
        }
        
        teacherCourses.push({
          ...course,
          students
        });
      }
      
      return teacherCourses;
    } catch (error) {
      console.error('Error fetching teacher student progress:', error);
      throw error;
    }
  }
};
