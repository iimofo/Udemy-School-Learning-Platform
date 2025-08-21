import { useState } from 'react';
import { Star } from 'lucide-react';

const StarRating = ({ 
  rating = 0, 
  onRatingChange, 
  size = 'md', 
  interactive = false, 
  showValue = false,
  className = ''
}) => {
  const [hoverRating, setHoverRating] = useState(0);
  const [localRating, setLocalRating] = useState(rating);

  const sizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
    xl: 'h-6 w-6'
  };

  const handleMouseEnter = (starIndex) => {
    if (interactive) {
      setHoverRating(starIndex);
    }
  };

  const handleMouseLeave = () => {
    if (interactive) {
      setHoverRating(0);
    }
  };

  const handleClick = (starIndex) => {
    if (interactive) {
      setLocalRating(starIndex);
      if (onRatingChange) {
        onRatingChange(starIndex);
      }
    }
  };

  const displayRating = hoverRating || localRating;

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      {[1, 2, 3, 4, 5].map((starIndex) => (
        <button
          key={starIndex}
          type="button"
          className={`transition-colors duration-200 ${
            interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'
          }`}
          onMouseEnter={() => handleMouseEnter(starIndex)}
          onMouseLeave={handleMouseLeave}
          onClick={() => handleClick(starIndex)}
          disabled={!interactive}
        >
          <Star
            className={`${sizes[size]} ${
              starIndex <= displayRating
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
            }`}
          />
        </button>
      ))}
      {showValue && (
        <span className="ml-2 text-sm text-gray-600">
          {displayRating > 0 ? displayRating.toFixed(1) : '0.0'}
        </span>
      )}
    </div>
  );
};

export default StarRating;
