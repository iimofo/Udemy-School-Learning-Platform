import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Play, 
  Clock, 
  Users, 
  Star, 
  BookOpen,
  Plus,
  Edit,
  Download,
  CheckCircle,
  Circle,
  MessageSquare
} from 'lucide-react';
import { useCourse } from '../hooks/useCourses';
import { useLessons, useLessonProgress } from '../hooks/useLessons';
import { useRatings } from '../hooks/useRatings';
import StarRating from '../components/StarRating';
import RatingDisplay from '../components/RatingDisplay';
import RatingForm from '../components/RatingForm';
import ReviewsList from '../components/ReviewsList';

const CourseDetail = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { courseId } = useParams();
  const { course, loading: courseLoading, error: courseError } = useCourse(courseId);
  const { lessons, loading: lessonsLoading } = useLessons(courseId);
  const { progress, isLessonCompleted } = useLessonProgress(courseId, user?.uid);
  const [selectedLesson, setSelectedLesson] = useState(null);
  
  // Ratings and reviews
  const {
    ratings,
    userRating,
    ratingStats,
    loading: ratingsLoading,
    error: ratingsError,
    submitRating,
    deleteRating,
    updateRating,
    getReviews,
    getAverageRating,
    getTotalRatings,
    getTotalReviews,
    hasUserRated,
    getUserRatingValue,
    getUserReview,
    getUserReviewTitle
  } = useRatings(courseId, user?.uid);

  const [showRatingForm, setShowRatingForm] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [submittingRating, setSubmittingRating] = useState(false);

  const loading = courseLoading || lessonsLoading || ratingsLoading;

  // Calculate progress percentage
  const progressPercentage = lessons.length > 0 
    ? Math.round((progress.completedLessons.length / lessons.length) * 100)
    : 0;

  const handleLessonClick = (lesson) => {
    setSelectedLesson(lesson);
    navigate(`/courses/${courseId}/lessons/${lesson.id}`);
  };

  const handleEditCourse = () => {
    navigate(`/courses/${courseId}/edit`);
  };

  // Rating handlers
  const handleSubmitRating = async (ratingData) => {
    try {
      setSubmittingRating(true);
      if (editingReview) {
        await updateRating(ratingData);
      } else {
        await submitRating(ratingData);
      }
      setShowRatingForm(false);
      setEditingReview(null);
    } catch (error) {
      console.error('Error submitting rating:', error);
      alert('Error submitting rating. Please try again.');
    } finally {
      setSubmittingRating(false);
    }
  };

  const handleEditReview = (review) => {
    setEditingReview(review);
    setShowRatingForm(true);
  };

  const handleDeleteReview = async (ratingId) => {
    if (confirm('Are you sure you want to delete your review?')) {
      try {
        await deleteRating(ratingId);
      } catch (error) {
        console.error('Error deleting review:', error);
        alert('Error deleting review. Please try again.');
      }
    }
  };

  const handleCancelRating = () => {
    setShowRatingForm(false);
    setEditingReview(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading course...</p>
        </div>
      </div>
    );
  }

  if (courseError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading course</h3>
          <p className="text-gray-600">{courseError}</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Course not found</h3>
          <p className="text-gray-600">The course you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button 
                onClick={() => navigate('/courses')}
                className="mr-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <h1 className="text-xl font-bold text-gray-900">{course.title}</h1>
            </div>
            
            {user.role === 'teacher' && course.instructorId === user.uid && (
              <div className="flex space-x-3">
                <button 
                  onClick={() => navigate(`/courses/${courseId}/add-lesson`)}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Lesson
                </button>
                <button 
                  onClick={handleEditCourse}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Course
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Course Info */}
          <div className="lg:col-span-2">
            {/* Course Hero */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
              <div className="relative h-64 bg-gray-200">
                {course.coverImage ? (
                  <img
                    src={course.coverImage}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600">
                    <BookOpen className="h-24 w-24 text-white/80" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black bg-opacity-40"></div>
                <div className="absolute bottom-4 left-4 text-white">
                  <h2 className="text-2xl font-bold mb-2">{course.title}</h2>
                  <p className="text-white/90">by {course.instructor}</p>
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {course.duration || 'No duration set'}
                    </div>
                    <div className="flex items-center">
                      <Play className="h-4 w-4 mr-1" />
                      {lessons.length} lessons
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      {course.students || 0} students
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <StarRating
                      rating={getAverageRating()}
                      size="sm"
                      showValue={false}
                    />
                    <span className="text-sm text-gray-600">
                      {getAverageRating() > 0 ? getAverageRating().toFixed(1) : 'New'}
                      {getTotalRatings() > 0 && ` (${getTotalRatings()})`}
                    </span>
                  </div>
                </div>
                
                <p className="text-gray-700 leading-relaxed mb-4">
                  {course.description}
                </p>
                
                {progress.completedLessons.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-blue-800">Your Progress</span>
                      <span className="text-sm text-blue-600">{progressPercentage}%</span>
                    </div>
                    <div className="w-full bg-blue-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progressPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Lessons Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Course Content</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {lessons.length} lessons • {progress.completedLessons.length} completed
                </p>
              </div>
              
              <div className="divide-y divide-gray-200">
                {lessons.length > 0 ? (
                  lessons.map((lesson, index) => (
                    <div 
                      key={lesson.id}
                      className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => handleLessonClick(lesson)}
                    >
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          {isLessonCompleted(lesson.id) ? (
                            <CheckCircle className="h-6 w-6 text-green-500" />
                          ) : (
                            <Circle className="h-6 w-6 text-gray-300" />
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium text-gray-900">
                              Lesson {index + 1}: {lesson.title}
                            </h4>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-500">{lesson.duration || 'No duration'}</span>
                              {lesson.materials && lesson.materials.length > 0 && (
                                <Download className="h-4 w-4 text-gray-400" />
                              )}
                            </div>
                          </div>
                          
                          <p className="text-sm text-gray-600 mt-1">
                            {lesson.description || 'No description available'}
                          </p>
                          
                          {lesson.materials && lesson.materials.length > 0 && (
                            <div className="flex items-center space-x-2 mt-2">
                              <span className="text-xs text-gray-500">Materials:</span>
                              {lesson.materials.map((material, idx) => (
                                <span 
                                  key={idx}
                                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                                >
                                  {material.name || material}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center">
                    <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No lessons available yet</p>
                    <p className="text-sm text-gray-400">Lessons will appear here once they are added</p>
                  </div>
                )}
              </div>
            </div>

            {/* Ratings and Reviews Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mt-8">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Ratings & Reviews</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {getTotalRatings()} ratings • {getTotalReviews()} reviews
                    </p>
                  </div>
                  {user && !hasUserRated() && (
                    <button
                      onClick={() => setShowRatingForm(true)}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Star className="h-4 w-4 mr-2" />
                      Write a Review
                    </button>
                  )}
                </div>
              </div>

              <div className="p-6">
                {/* Rating Display */}
                <div className="mb-8">
                  <RatingDisplay
                    averageRating={getAverageRating()}
                    totalRatings={getTotalRatings()}
                    totalReviews={getTotalReviews()}
                    ratingDistribution={ratingStats.ratingDistribution}
                    showDistribution={true}
                  />
                </div>

                {/* User's Rating */}
                {hasUserRated() && (
                  <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-blue-900">Your Rating</h4>
                      <button
                        onClick={() => setShowRatingForm(true)}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        Edit
                      </button>
                    </div>
                    <div className="flex items-center space-x-2 mb-2">
                      <StarRating
                        rating={getUserRatingValue()}
                        size="sm"
                        showValue={false}
                      />
                      <span className="text-sm text-blue-700">{getUserRatingValue()}/5</span>
                    </div>
                    {getUserReviewTitle() && (
                      <h5 className="text-sm font-medium text-blue-900 mb-1">
                        {getUserReviewTitle()}
                      </h5>
                    )}
                    {getUserReview() && (
                      <p className="text-sm text-blue-700">{getUserReview()}</p>
                    )}
                  </div>
                )}

                {/* Rating Form */}
                {showRatingForm && (
                  <div className="mb-6">
                    <RatingForm
                      onSubmit={handleSubmitRating}
                      onCancel={handleCancelRating}
                      initialRating={editingReview ? getUserRatingValue() : 0}
                      initialReview={editingReview ? getUserReview() : ''}
                      initialTitle={editingReview ? getUserReviewTitle() : ''}
                      isEditing={!!editingReview}
                      loading={submittingRating}
                    />
                  </div>
                )}

                {/* Reviews List */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Student Reviews</h4>
                  <ReviewsList
                    reviews={getReviews()}
                    currentUserId={user?.uid}
                    onEditReview={handleEditReview}
                    onDeleteReview={handleDeleteReview}
                    loading={ratingsLoading}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Course Stats */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Overview</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Category</span>
                  <span className="text-sm font-medium text-gray-900">{course.category || 'Uncategorized'}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Duration</span>
                  <span className="text-sm font-medium text-gray-900">{course.duration || 'Not specified'}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Lessons</span>
                  <span className="text-sm font-medium text-gray-900">{lessons.length}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Students</span>
                  <span className="text-sm font-medium text-gray-900">{course.students || 0}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Rating</span>
                  <div className="flex items-center">
                    <StarRating
                      rating={getAverageRating()}
                      size="sm"
                      showValue={false}
                    />
                    <span className="ml-1 text-sm font-medium text-gray-900">
                      {getAverageRating() > 0 ? getAverageRating().toFixed(1) : 'New'}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Reviews</span>
                  <div className="flex items-center">
                    <MessageSquare className="h-4 w-4 text-gray-400" />
                    <span className="ml-1 text-sm font-medium text-gray-900">
                      {getTotalReviews()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Instructor Info */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Instructor</h3>
              
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">
                    {course.instructor.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                
                <div>
                  <p className="font-medium text-gray-900">{course.instructor}</p>
                  <p className="text-sm text-gray-600">Course Instructor</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CourseDetail;
