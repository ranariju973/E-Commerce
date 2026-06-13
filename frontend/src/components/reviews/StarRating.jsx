import React, { useState } from 'react'

const StarRating = ({ rating = 0, onChange, size = 'md', readonly = false }) => {
  const [hoverRating, setHoverRating] = useState(0)

  const sizeClass = size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : ''
  const displayRating = hoverRating || rating

  return (
    <div className={`star-rating ${sizeClass} ${readonly ? 'readonly' : ''}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className='star'
          onClick={() => !readonly && onChange?.(star)}
          onMouseEnter={() => !readonly && setHoverRating(star)}
          onMouseLeave={() => !readonly && setHoverRating(0)}
          role={readonly ? undefined : 'button'}
          aria-label={`${star} star${star > 1 ? 's' : ''}`}
        >
          <svg viewBox='0 0 24 24' fill={star <= displayRating ? '#f59e0b' : '#e5e7eb'} stroke='none'>
            <polygon points='12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2' />
          </svg>
        </span>
      ))}
    </div>
  )
}

export default StarRating
