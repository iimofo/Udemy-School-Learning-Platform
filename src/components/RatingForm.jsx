import { useState } from 'react';
import { Star, X, Send } from 'lucide-react';
import StarRating from './StarRating';

const RatingForm = ({ 
  onSubmit, 
  onCancel, 
  initialRating = 0, 
  initialReview = '', 
  initialTitle = '',
  isEditing = false,
  loading = false 
}) => {
  const [rating, setRating] = useState(initialRating);
  const [review, setReview] = useState(initialReview);
  const [title, setTitle] = useState(initialTitle);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    if (title.trim().length < 3) {
      setError('Please provide a title (at least 3 characters)');
      return;
    }

    setError('');
    onSubmit({ rating, review: review.trim(), title: title.trim() });
  };

  const handleCancel = () => {
    setRating(initialRating);
    setReview(initialReview);
    setTitle(initialTitle);
    setError('');
    onCancel();
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {isEditing ? 'Edit Your Review' : 'Write a Review'}
        </h3>
        {onCancel && (
          <button
            onClick={handleCancel}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Rating Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Rating *
          </label>
          <StarRating
            rating={rating}
            onRatingChange={setRating}
            interactive={true}
            size="lg"
            showValue={true}
          />
        </div>

        {/* Review Title */}
        <div>
          <label htmlFor="reviewTitle" className="block text-sm font-medium text-gray-700 mb-2">
            Review Title *
          </label>
          <input
            type="text"
            id="reviewTitle"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Summarize your experience..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            maxLength={100}
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            {title.length}/100 characters
          </p>
        </div>

        {/* Review Text */}
        <div>
          <label htmlFor="reviewText" className="block text-sm font-medium text-gray-700 mb-2">
            Review (Optional)
          </label>
          <textarea
            id="reviewText"
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder="Share your detailed thoughts about this course..."
            rows="4"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            maxLength={500}
          />
          <p className="text-xs text-gray-500 mt-1">
            {review.length}/500 characters
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end space-x-3 pt-4">
          {onCancel && (
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={loading || rating === 0}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Submitting...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                {isEditing ? 'Update Review' : 'Submit Review'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RatingForm;
