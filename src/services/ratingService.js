import {
  collection, doc, addDoc, updateDoc, deleteDoc, getDocs, getDoc, query, where, orderBy, serverTimestamp, onSnapshot
} from 'firebase/firestore';
import { db } from '../config/firebase';

export const ratingService = {
  // Submit a rating and review
  async submitRating(courseId, userId, ratingData) {
    try {
      const { rating, review, title } = ratingData;
      
      // Check if user has already rated this course
      const existingRating = await this.getUserRating(courseId, userId);
      
      if (existingRating) {
        // Update existing rating
        const ratingRef = doc(db, 'ratings', existingRating.id);
        await updateDoc(ratingRef, {
          rating,
          review: review || '',
          title: title || '',
          updatedAt: serverTimestamp()
        });
      } else {
        // Create new rating
        const ratingsRef = collection(db, 'ratings');
        await addDoc(ratingsRef, {
          courseId,
          userId,
          rating,
          review: review || '',
          title: title || '',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }

      // Update course average rating
      await this.updateCourseRating(courseId);
      
      return { success: true, message: 'Rating submitted successfully' };
    } catch (error) {
      console.error('Error submitting rating:', error);
      throw error;
    }
  },

  // Get user's rating for a specific course
  async getUserRating(courseId, userId) {
    try {
      const ratingsRef = collection(db, 'ratings');
      const q = query(
        ratingsRef,
        where('courseId', '==', courseId),
        where('userId', '==', userId)
      );
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return { id: doc.id, ...doc.data() };
      }
      
      return null;
    } catch (error) {
      console.error('Error getting user rating:', error);
      throw error;
    }
  },

  // Get all ratings for a course
  async getCourseRatings(courseId, limit = 50) {
    try {
      const ratingsRef = collection(db, 'ratings');
      const q = query(
        ratingsRef,
        where('courseId', '==', courseId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      const ratings = [];
      for (const doc of querySnapshot.docs) {
        const rating = { id: doc.id, ...doc.data() };
        
        // Get user info for each rating
        try {
          const userRef = doc(db, 'users', rating.userId);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            rating.user = userSnap.data();
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          rating.user = { displayName: 'Anonymous User' };
        }
        
        ratings.push(rating);
      }
      
      return ratings.slice(0, limit);
    } catch (error) {
      console.error('Error getting course ratings:', error);
      throw error;
    }
  },

  // Get course rating statistics
  async getCourseRatingStats(courseId) {
    try {
      const ratingsRef = collection(db, 'ratings');
      const q = query(ratingsRef, where('courseId', '==', courseId));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return {
          averageRating: 0,
          totalRatings: 0,
          ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
          totalReviews: 0
        };
      }
      
      let totalRating = 0;
      let totalReviews = 0;
      const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      
      querySnapshot.forEach((doc) => {
        const rating = doc.data();
        totalRating += rating.rating;
        ratingDistribution[rating.rating]++;
        
        if (rating.review && rating.review.trim()) {
          totalReviews++;
        }
      });
      
      const totalRatings = querySnapshot.size;
      const averageRating = totalRatings > 0 ? totalRating / totalRatings : 0;
      
      return {
        averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
        totalRatings,
        ratingDistribution,
        totalReviews
      };
    } catch (error) {
      console.error('Error getting course rating stats:', error);
      throw error;
    }
  },

  // Update course average rating
  async updateCourseRating(courseId) {
    try {
      const stats = await this.getCourseRatingStats(courseId);
      
      const courseRef = doc(db, 'courses', courseId);
      await updateDoc(courseRef, {
        rating: stats.averageRating,
        totalRatings: stats.totalRatings,
        totalReviews: stats.totalReviews,
        ratingDistribution: stats.ratingDistribution,
        lastRatingUpdate: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating course rating:', error);
      throw error;
    }
  },

  // Delete a rating
  async deleteRating(ratingId, courseId) {
    try {
      const ratingRef = doc(db, 'ratings', ratingId);
      await deleteDoc(ratingRef);
      
      // Update course average rating
      await this.updateCourseRating(courseId);
      
      return { success: true, message: 'Rating deleted successfully' };
    } catch (error) {
      console.error('Error deleting rating:', error);
      throw error;
    }
  },

  // Get recent reviews across all courses
  async getRecentReviews(limit = 10) {
    try {
      const ratingsRef = collection(db, 'ratings');
      const q = query(
        ratingsRef,
        where('review', '!=', ''),
        orderBy('review'),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      const reviews = [];
      for (const doc of querySnapshot.docs) {
        const review = { id: doc.id, ...doc.data() };
        
        // Get user info
        try {
          const userRef = doc(db, 'users', review.userId);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            review.user = userSnap.data();
          }
        } catch (error) {
          review.user = { displayName: 'Anonymous User' };
        }
        
        // Get course info
        try {
          const courseRef = doc(db, 'courses', review.courseId);
          const courseSnap = await getDoc(courseRef);
          if (courseSnap.exists()) {
            review.course = courseSnap.data();
          }
        } catch (error) {
          review.course = { title: 'Unknown Course' };
        }
        
        reviews.push(review);
      }
      
      return reviews.slice(0, limit);
    } catch (error) {
      console.error('Error getting recent reviews:', error);
      throw error;
    }
  },

  // Get top rated courses
  async getTopRatedCourses(limit = 10) {
    try {
      const coursesRef = collection(db, 'courses');
      const q = query(
        coursesRef,
        where('rating', '>', 0),
        orderBy('rating', 'desc'),
        orderBy('totalRatings', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      const courses = [];
      querySnapshot.forEach((doc) => {
        courses.push({ id: doc.id, ...doc.data() });
      });
      
      return courses.slice(0, limit);
    } catch (error) {
      console.error('Error getting top rated courses:', error);
      throw error;
    }
  },

  // Get rating analytics for teachers
  async getTeacherRatingAnalytics(teacherId) {
    try {
      // Get all courses by this teacher
      const coursesRef = collection(db, 'courses');
      const coursesQuery = query(coursesRef, where('instructorId', '==', teacherId));
      const coursesSnapshot = await getDocs(coursesQuery);
      
      const analytics = {
        totalCourses: 0,
        totalRatings: 0,
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        courses: []
      };
      
      for (const courseDoc of coursesSnapshot.docs) {
        const course = { id: courseDoc.id, ...courseDoc.data() };
        const stats = await this.getCourseRatingStats(course.id);
        
        analytics.totalCourses++;
        analytics.totalRatings += stats.totalRatings;
        analytics.totalReviews += stats.totalReviews;
        
        // Aggregate rating distribution
        Object.keys(stats.ratingDistribution).forEach(rating => {
          analytics.ratingDistribution[rating] += stats.ratingDistribution[rating];
        });
        
        course.ratingStats = stats;
        analytics.courses.push(course);
      }
      
      // Calculate overall average
      if (analytics.totalRatings > 0) {
        const totalRatingSum = analytics.courses.reduce((sum, course) => {
          return sum + (course.ratingStats.averageRating * course.ratingStats.totalRatings);
        }, 0);
        analytics.averageRating = Math.round((totalRatingSum / analytics.totalRatings) * 10) / 10;
      }
      
      return analytics;
    } catch (error) {
      console.error('Error getting teacher rating analytics:', error);
      throw error;
    }
  },

  // Get real-time ratings listener
  getRatingsListener(courseId, callback) {
    const ratingsRef = collection(db, 'ratings');
    const q = query(
      ratingsRef,
      where('courseId', '==', courseId),
      orderBy('createdAt', 'desc')
    );
    
    return onSnapshot(q, (snapshot) => {
      const ratings = [];
      snapshot.forEach((doc) => {
        ratings.push({ id: doc.id, ...doc.data() });
      });
      callback(ratings);
    });
  },

  // Get real-time rating stats listener
  getRatingStatsListener(courseId, callback) {
    const ratingsRef = collection(db, 'ratings');
    const q = query(ratingsRef, where('courseId', '==', courseId));
    
    return onSnapshot(q, async (snapshot) => {
      const stats = await this.getCourseRatingStats(courseId);
      callback(stats);
    });
  }
};
