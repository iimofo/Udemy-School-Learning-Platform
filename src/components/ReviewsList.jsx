import { useState } from 'react';
import { Star, MoreVertical, Edit, Trash2, User } from 'lucide-react';
import StarRating from './StarRating';

const ReviewsList = ({ 
  reviews = [], 
  currentUserId,
  onEditReview,
  onDeleteReview,
  loading = false,
  className = ''
}) => {
  const [expandedReviews, setExpandedReviews] = useState(new Set());

  const toggleReviewExpansion = (reviewId) => {
    setExpandedReviews(prev => {
      const newSet = new Set(prev);
      if (newSet.has(reviewId)) {
        newSet.delete(reviewId);
      } else {
        newSet.add(reviewId);
      }
      return newSet;
    });
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Recently';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
    return `${Math.floor(diffInDays / 365)} years ago`;
  };

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <div className="text-gray-400 mb-4">
          <Star className="h-12 w-12 mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
        <p className="text-gray-500">Be the first to share your experience with this course!</p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {reviews.map((review) => {
        const isExpanded = expandedReviews.has(review.id);
        const isOwnReview = currentUserId && review.userId === currentUserId;
        const hasLongReview = review.review && review.review.length > 200;

        return (
          <div key={review.id} className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-start space-x-3">
              {/* User Avatar */}
              <div className="flex-shrink-0">
                {review.user?.photoURL ? (
                  <img
                    src={review.user.photoURL}
                    alt={review.user.displayName}
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-white" />
                  </div>
                )}
              </div>

              {/* Review Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="text-sm font-medium text-gray-900">
                        {review.user?.displayName || 'Anonymous User'}
                      </h4>
                      <span className="text-xs text-gray-500">
                        {formatDate(review.createdAt)}
                      </span>
                    </div>

                    {/* Rating */}
                    <div className="mb-2">
                      <StarRating
                        rating={review.rating}
                        size="sm"
                        showValue={false}
                      />
                    </div>

                    {/* Review Title */}
                    {review.title && (
                      <h5 className="text-sm font-semibold text-gray-900 mb-2">
                        {review.title}
                      </h5>
                    )}

                    {/* Review Text */}
                    {review.review && (
                      <div className="text-sm text-gray-700">
                        {hasLongReview && !isExpanded ? (
                          <>
                            <p>{review.review.substring(0, 200)}...</p>
                            <button
                              onClick={() => toggleReviewExpansion(review.id)}
                              className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-1"
                            >
                              Read more
                            </button>
                          </>
                        ) : (
                          <>
                            <p>{review.review}</p>
                            {hasLongReview && isExpanded && (
                              <button
                                onClick={() => toggleReviewExpansion(review.id)}
                                className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-1"
                              >
                                Show less
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    )}

                    {/* Updated indicator */}
                    {review.updatedAt && review.updatedAt !== review.createdAt && (
                      <p className="text-xs text-gray-500 mt-2">
                        (edited {formatDate(review.updatedAt)})
                      </p>
                    )}
                  </div>

                  {/* Actions Menu */}
                  {isOwnReview && (
                    <div className="relative">
                      <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                      <div className="absolute right-0 top-6 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px]">
                        <button
                          onClick={() => onEditReview(review)}
                          className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </button>
                        <button
                          onClick={() => onDeleteReview(review.id)}
                          className="w-full flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ReviewsList;
