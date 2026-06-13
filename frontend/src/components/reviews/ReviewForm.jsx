import React, { useState, useContext } from 'react'
import StarRating from './StarRating'
import Spinner from '../Spinner'
import { ShopContext } from '../../context/ShopContext'
import { toast } from 'react-hot-toast'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'

const ReviewForm = ({ productId, onReviewAdded, onClose }) => {
  const { token, backendUrl } = useContext(ShopContext)
  const [rating, setRating] = useState(0)
  const [title, setTitle] = useState('')
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!token) {
      toast.error('Please login to write a review')
      return
    }

    if (rating === 0) {
      toast.error('Please select a rating')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await axios.post(
        `${backendUrl}/api/reviews`,
        { productId, rating, title: title.trim(), comment: comment.trim() },
        { headers: { token } }
      )

      if (response.data.success) {
        toast.success('Review added successfully!')
        setRating(0)
        setTitle('')
        setComment('')
        onReviewAdded?.()
        onClose?.()
      } else {
        toast.error(response.data.message || 'Failed to add review')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit review')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!token) {
    return (
      <div className='glass-card-solid p-5 text-center'>
        <p className='text-gray-500 text-sm'>Please login to write a review</p>
      </div>
    )
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className='glass-card-solid p-5'
    >
      <h3 className='font-semibold text-gray-800 mb-4'>Write a Review</h3>

      {/* Star Rating */}
      <div className='mb-4'>
        <p className='text-sm text-gray-600 mb-2'>Your Rating</p>
        <StarRating rating={rating} onChange={setRating} size='lg' />
      </div>

      {/* Title */}
      <div className='mb-4'>
        <input
          type='text'
          placeholder='Review title (optional)'
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={100}
          className='w-full border border-gray-200 px-4 py-2.5 text-sm rounded-lg outline-none focus:border-black transition'
        />
      </div>

      {/* Comment */}
      <div className='mb-4'>
        <textarea
          placeholder='Share your experience with this product...'
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          maxLength={1000}
          rows={4}
          className='w-full border border-gray-200 px-4 py-2.5 text-sm rounded-lg outline-none focus:border-black transition resize-none'
        />
        <p className='text-xs text-gray-400 text-right mt-1'>{comment.length}/1000</p>
      </div>

      {/* Actions */}
      <div className='flex gap-3'>
        {onClose && (
          <button type='button' onClick={onClose} className='btn-outline btn-sm flex-1'>
            Cancel
          </button>
        )}
        <button
          type='submit'
          disabled={isSubmitting || rating === 0}
          className='btn-primary btn-sm flex-1'
        >
          {isSubmitting ? <Spinner size='sm' color='white' /> : 'Submit Review'}
        </button>
      </div>
    </motion.form>
  )
}

export default ReviewForm
