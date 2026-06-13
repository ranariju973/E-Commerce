import React, { useContext } from 'react'
import StarRating from './StarRating'
import { ShopContext } from '../../context/ShopContext'
import { motion } from 'framer-motion'

const ReviewCard = ({ review, onHelpful, index = 0 }) => {
  const { token } = useContext(ShopContext)
  const date = new Date(review.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className='glass-card-solid p-4 mb-3'
    >
      {/* Header */}
      <div className='flex items-start justify-between'>
        <div>
          <StarRating rating={review.rating} readonly size='sm' />
          {review.title && (
            <p className='font-semibold text-gray-800 mt-1'>{review.title}</p>
          )}
        </div>
      </div>

      {/* User info */}
      <div className='flex items-center gap-2 mt-2'>
        <div className='w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600'>
          {(review.userName || 'A')[0].toUpperCase()}
        </div>
        <span className='text-sm text-gray-600'>{review.userName || 'Anonymous'}</span>
        {review.verifiedPurchase && (
          <span className='text-xs text-green-600 font-medium flex items-center gap-0.5'>
            ✅ Verified
          </span>
        )}
        <span className='text-xs text-gray-400 ml-auto'>{date}</span>
      </div>

      {/* Comment */}
      {review.comment && (
        <p className='mt-3 text-sm text-gray-600 leading-relaxed'>{review.comment}</p>
      )}

      {/* Images */}
      {review.images && review.images.length > 0 && (
        <div className='flex gap-2 mt-3 overflow-x-auto hide-scrollbar'>
          {review.images.map((img, i) => (
            <img
              key={i}
              src={img}
              alt={`Review image ${i + 1}`}
              className='w-16 h-16 rounded-lg object-cover flex-shrink-0'
              loading='lazy'
            />
          ))}
        </div>
      )}

      {/* Helpful */}
      <div className='mt-3 pt-3 border-t border-gray-100'>
        <button
          onClick={() => token && onHelpful?.(review._id)}
          className={`text-xs flex items-center gap-1 transition ${
            token ? 'text-gray-400 hover:text-gray-700 cursor-pointer' : 'text-gray-300 cursor-default'
          }`}
          disabled={!token}
        >
          👍 Helpful ({review.helpfulCount || 0})
        </button>
      </div>
    </motion.div>
  )
}

export default ReviewCard
