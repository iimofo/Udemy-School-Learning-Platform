import { useState, useEffect } from 'react';
import { ratingService } from '../services/ratingService';

export const useRatings = (courseId, userId) => {
  const [ratings, setRatings] = useState([]);
  const [userRating, setUserRating] = useState(null);
  const [ratingStats, setRatingStats] = useState({
    averageRating: 0,
    totalRatings: 0,
    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    totalReviews: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!courseId) return;

    let unsubscribeRatings;
    let unsubscribeStats;

    const setupListeners = async () => {
      try {
        setLoading(true);
        setError(null);

        // Set up real-time ratings listener
        unsubscribeRatings = ratingService.getRatingsListener(courseId, (ratings) => {
          setRatings(ratings);
          setLoading(false);
        });

        // Set up real-time stats listener
        unsubscribeStats = ratingService.getRatingStatsListener(courseId, (stats) => {
          setRatingStats(stats);
        });

        // Get user's rating if userId is provided
        if (userId) {
          try {
            const userRatingData = await ratingService.getUserRating(courseId, userId);
            setUserRating(userRatingData);
          } catch (err) {
            console.error('Error fetching user rating:', err);
          }
        }

      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    setupListeners();

    return () => {
      if (unsubscribeRatings) unsubscribeRatings();
      if (unsubscribeStats) unsubscribeStats();
    };
  }, [courseId, userId]);

  const submitRating = async (ratingData) => {
    try {
      setError(null);
      await ratingService.submitRating(courseId, userId, ratingData);
      
      // Update local user rating
      setUserRating({
        ...userRating,
        ...ratingData,
        updatedAt: new Date()
      });

      return { success: true, message: 'Rating submitted successfully' };
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteRating = async (ratingId) => {
    try {
      setError(null);
      await ratingService.deleteRating(ratingId, courseId);
      
      // Remove from local state
      setRatings(prev => prev.filter(rating => rating.id !== ratingId));
      setUserRating(null);

      return { success: true, message: 'Rating deleted successfully' };
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateRating = async (ratingData) => {
    try {
      setError(null);
      await ratingService.submitRating(courseId, userId, ratingData);
      
      // Update local user rating
      setUserRating({
        ...userRating,
        ...ratingData,
        updatedAt: new Date()
      });

      return { success: true, message: 'Rating updated successfully' };
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Get reviews only (ratings with review text)
  const getReviews = () => {
    return ratings.filter(rating => rating.review && rating.review.trim());
  };

  // Get ratings without reviews
  const getRatingsOnly = () => {
    return ratings.filter(rating => !rating.review || !rating.review.trim());
  };

  // Get average rating
  const getAverageRating = () => {
    return ratingStats.averageRating;
  };

  // Get total ratings count
  const getTotalRatings = () => {
    return ratingStats.totalRatings;
  };

  // Get rating distribution
  const getRatingDistribution = () => {
    return ratingStats.ratingDistribution;
  };

  // Get total reviews count
  const getTotalReviews = () => {
    return ratingStats.totalReviews;
  };

  // Check if user has rated
  const hasUserRated = () => {
    return userRating !== null;
  };

  // Get user's rating value
  const getUserRatingValue = () => {
    return userRating ? userRating.rating : 0;
  };

  // Get user's review
  const getUserReview = () => {
    return userRating ? userRating.review : '';
  };

  // Get user's review title
  const getUserReviewTitle = () => {
    return userRating ? userRating.title : '';
  };

  return {
    ratings,
    userRating,
    ratingStats,
    loading,
    error,
    submitRating,
    deleteRating,
    updateRating,
    getReviews,
    getRatingsOnly,
    getAverageRating,
    getTotalRatings,
    getRatingDistribution,
    getTotalReviews,
    hasUserRated,
    getUserRatingValue,
    getUserReview,
    getUserReviewTitle
  };
};

// Hook for teacher rating analytics
export const useTeacherRatingAnalytics = (teacherId) => {
  const [analytics, setAnalytics] = useState({
    totalCourses: 0,
    totalRatings: 0,
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    courses: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!teacherId) return;

    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const analyticsData = await ratingService.getTeacherRatingAnalytics(teacherId);
        setAnalytics(analyticsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [teacherId]);

  return {
    analytics,
    loading,
    error
  };
};

// Hook for recent reviews across all courses
export const useRecentReviews = (limit = 10) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecentReviews = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const reviewsData = await ratingService.getRecentReviews(limit);
        setReviews(reviewsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentReviews();
  }, [limit]);

  return {
    reviews,
    loading,
    error
  };
};

// Hook for top rated courses
export const useTopRatedCourses = (limit = 10) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTopRatedCourses = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const coursesData = await ratingService.getTopRatedCourses(limit);
        setCourses(coursesData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTopRatedCourses();
  }, [limit]);

  return {
    courses,
    loading,
    error
  };
};
