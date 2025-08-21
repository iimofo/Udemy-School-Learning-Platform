import { Star, Users, MessageSquare } from 'lucide-react';
import StarRating from './StarRating';

const RatingDisplay = ({ 
  averageRating = 0, 
  totalRatings = 0, 
  totalReviews = 0,
  ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  showDistribution = true,
  size = 'md',
  className = ''
}) => {
  const getRatingPercentage = (rating) => {
    if (totalRatings === 0) return 0;
    return Math.round((ratingDistribution[rating] / totalRatings) * 100);
  };

  const getRatingLabel = (rating) => {
    const labels = {
      5: 'Excellent',
      4: 'Very Good',
      3: 'Good',
      2: 'Fair',
      1: 'Poor'
    };
    return labels[rating] || '';
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main Rating Display */}
      <div className="flex items-center space-x-4">
        <div className="text-center">
          <div className="text-3xl font-bold text-gray-900">
            {averageRating > 0 ? averageRating.toFixed(1) : '0.0'}
          </div>
          <StarRating
            rating={averageRating}
            size={size}
            showValue={false}
            className="justify-center"
          />
          <div className="text-sm text-gray-500 mt-1">
            {totalRatings} rating{totalRatings !== 1 ? 's' : ''}
          </div>
        </div>

        {showDistribution && (
          <div className="flex-1">
            {/* Rating Distribution */}
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => (
                <div key={rating} className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1 w-16">
                    <span className="text-sm text-gray-600">{rating}</span>
                    <Star className="h-3 w-3 text-yellow-400 fill-current" />
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${getRatingPercentage(rating)}%` }}
                    ></div>
                  </div>
                  <div className="w-12 text-right">
                    <span className="text-sm text-gray-600">
                      {ratingDistribution[rating]}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Rating Stats */}
      <div className="flex items-center space-x-6 text-sm text-gray-600">
        <div className="flex items-center space-x-1">
          <Users className="h-4 w-4" />
          <span>{totalRatings} total ratings</span>
        </div>
        {totalReviews > 0 && (
          <div className="flex items-center space-x-1">
            <MessageSquare className="h-4 w-4" />
            <span>{totalReviews} reviews</span>
          </div>
        )}
      </div>

      {/* Rating Summary */}
      {averageRating > 0 && (
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-sm text-gray-700">
            <span className="font-medium">
              {averageRating >= 4.5 ? 'Excellent' :
               averageRating >= 4.0 ? 'Very Good' :
               averageRating >= 3.5 ? 'Good' :
               averageRating >= 3.0 ? 'Fair' : 'Poor'}
            </span>
            {' '}course based on {totalRatings} rating{totalRatings !== 1 ? 's' : ''}
          </div>
        </div>
      )}
    </div>
  );
};

export default RatingDisplay;
