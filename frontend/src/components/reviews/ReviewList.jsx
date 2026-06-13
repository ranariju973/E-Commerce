import React, { useState, useEffect, useContext, useCallback } from 'react'
import axios from 'axios'
import { ShopContext } from '../../context/ShopContext'
import ReviewCard from './ReviewCard'
import RatingSummary from './RatingSummary'
import ReviewForm from './ReviewForm'
import FilterPills from '../FilterPills'
import Spinner from '../Spinner'
import { AnimatePresence } from 'framer-motion'

const SORT_OPTIONS = [
  { value: 'recent', label: 'Most Recent' },
  { value: 'helpful', label: 'Most Helpful' },
  { value: 'highest', label: 'Highest' },
  { value: 'lowest', label: 'Lowest' },
]

const FILTER_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'positive', label: 'Positive (4-5★)' },
  { value: 'critical', label: 'Critical (1-2★)' },
  { value: 'photos', label: 'With Photos' },
]

const ReviewList = ({ productId }) => {
  const { backendUrl, token } = useContext(ShopContext)
  const [reviews, setReviews] = useState([])
  const [stats, setStats] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [sort, setSort] = useState('recent')
  const [filter, setFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({})
  const [showForm, setShowForm] = useState(false)

  const fetchReviews = useCallback(async (resetPage = false) => {
    try {
      setIsLoading(true)
      const currentPage = resetPage ? 1 : page

      let queryParams = `page=${currentPage}&limit=10&sort=${sort}`
      if (filter === 'positive') queryParams += '&rating=4,5'
      if (filter === 'critical') queryParams += '&rating=1,2'
      if (filter === 'photos') queryParams += '&withPhotos=true'

      const response = await axios.get(`${backendUrl}/api/reviews/${productId}?${queryParams}`)

      if (response.data.success) {
        if (resetPage) {
          setReviews(response.data.reviews)
          setPage(1)
        } else if (currentPage === 1) {
          setReviews(response.data.reviews)
        } else {
          setReviews((prev) => [...prev, ...response.data.reviews])
        }
        setStats(response.data.stats)
        setPagination(response.data.pagination)
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error)
    } finally {
      setIsLoading(false)
    }
  }, [backendUrl, productId, page, sort, filter])

  useEffect(() => {
    fetchReviews(true)
  }, [productId, sort, filter])

  useEffect(() => {
    if (page > 1) fetchReviews()
  }, [page])

  const handleHelpful = async (reviewId) => {
    if (!token) return
    try {
      await axios.post(
        `${backendUrl}/api/reviews/${reviewId}/helpful`,
        {},
        { headers: { token } }
      )
      fetchReviews(true)
    } catch (error) {
      console.error('Failed to toggle helpful:', error)
    }
  }

  const handleSortChange = (value) => {
    setSort(value)
  }

  const handleFilterChange = (value) => {
    setFilter(value)
  }

  return (
    <div>
      {/* Rating Summary */}
      <RatingSummary
        stats={stats}
        onWriteReview={() => setShowForm(!showForm)}
      />

      {/* Review Form */}
      <AnimatePresence>
        {showForm && (
          <div className='mt-4'>
            <ReviewForm
              productId={productId}
              onReviewAdded={() => fetchReviews(true)}
              onClose={() => setShowForm(false)}
            />
          </div>
        )}
      </AnimatePresence>

      {/* Filters & Sort */}
      <div className='mt-6 mb-4'>
        <FilterPills
          options={FILTER_OPTIONS}
          activeValue={filter}
          onChange={handleFilterChange}
        />
        <div className='mt-2'>
          <FilterPills
            options={SORT_OPTIONS}
            activeValue={sort}
            onChange={handleSortChange}
          />
        </div>
      </div>

      {/* Reviews */}
      {isLoading && reviews.length === 0 ? (
        <div className='flex justify-center py-10'>
          <Spinner />
        </div>
      ) : reviews.length === 0 ? (
        <div className='text-center py-10'>
          <p className='text-gray-400 text-sm'>No reviews yet. Be the first to review!</p>
        </div>
      ) : (
        <>
          {reviews.map((review, index) => (
            <ReviewCard
              key={review._id}
              review={review}
              onHelpful={handleHelpful}
              index={index}
            />
          ))}

          {/* Load More */}
          {pagination.page < pagination.totalPages && (
            <div className='text-center mt-4'>
              <button
                onClick={() => setPage((p) => p + 1)}
                className='btn-outline btn-sm'
                disabled={isLoading}
              >
                {isLoading ? <Spinner size='sm' /> : 'Load More Reviews'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default ReviewList
