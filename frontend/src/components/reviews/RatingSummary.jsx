import React from 'react'
import StarRating from './StarRating'

const RatingSummary = ({ stats, onWriteReview }) => {
  const { averageRating = 0, totalReviews = 0, ratingDistribution = {} } = stats || {}

  const maxCount = Math.max(...Object.values(ratingDistribution), 1)

  return (
    <div className='glass-card-solid p-5'>
      <div className='flex flex-col sm:flex-row gap-6'>
        {/* Left — Average */}
        <div className='flex flex-col items-center justify-center sm:min-w-[140px]'>
          <span className='text-4xl font-bold text-gray-900'>{averageRating || '—'}</span>
          <StarRating rating={Math.round(averageRating)} readonly size='sm' />
          <p className='text-sm text-gray-400 mt-1'>{totalReviews} rating{totalReviews !== 1 ? 's' : ''}</p>
          {onWriteReview && (
            <button onClick={onWriteReview} className='btn-outline btn-sm mt-3 text-xs'>
              Write a Review
            </button>
          )}
        </div>

        {/* Right — Distribution bars */}
        <div className='flex-1 flex flex-col gap-2'>
          {[5, 4, 3, 2, 1].map((star) => {
            const count = ratingDistribution[star] || 0
            const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0

            return (
              <div key={star} className='flex items-center gap-2 text-sm'>
                <span className='w-6 text-right text-gray-500'>{star}★</span>
                <div className='rating-bar-track'>
                  <div className='rating-bar-fill' style={{ width: `${percentage}%` }} />
                </div>
                <span className='w-8 text-xs text-gray-400'>{Math.round(percentage)}%</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default RatingSummary
