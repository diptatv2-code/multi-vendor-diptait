'use client';

import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onChange?: (rating: number) => void;
  showCount?: boolean;
  count?: number;
}

const sizes = { sm: 'w-3.5 h-3.5', md: 'w-4 h-4', lg: 'w-5 h-5' };

export function StarRating({
  rating,
  maxRating = 5,
  size = 'sm',
  interactive = false,
  onChange,
  showCount,
  count,
}: StarRatingProps) {
  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {Array.from({ length: maxRating }).map((_, i) => (
          <button
            key={i}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onChange?.(i + 1)}
            className={interactive ? 'cursor-pointer' : 'cursor-default'}
          >
            <Star
              className={`${sizes[size]} ${
                i < Math.round(rating)
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'fill-gray-200 text-gray-200 dark:fill-gray-600 dark:text-gray-600'
              }`}
            />
          </button>
        ))}
      </div>
      {showCount && count !== undefined && (
        <span className="text-xs text-gray-500 dark:text-gray-400">({count})</span>
      )}
    </div>
  );
}
