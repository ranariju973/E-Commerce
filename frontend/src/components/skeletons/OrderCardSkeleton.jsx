import React from 'react'
import Skeleton from './SkeletonLoader'

const OrderCardSkeleton = () => {
  return (
    <div className='glass-card-solid p-4 sm:p-6 mb-4'>
      <div className='flex justify-between items-start mb-4'>
        <div>
          <Skeleton width='150px' height='14px' style={{ marginBottom: 8 }} />
          <Skeleton width='100px' height='12px' />
        </div>
        <Skeleton width='80px' height='24px' borderRadius={12} />
      </div>
      <div className='flex gap-3 mb-4'>
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} width='64px' height='64px' borderRadius={8} />
        ))}
      </div>
      <div className='flex justify-between items-center'>
        <Skeleton width='80px' height='14px' />
        <div className='flex gap-2'>
          <Skeleton width='100px' height='36px' borderRadius={8} />
          <Skeleton width='100px' height='36px' borderRadius={8} />
        </div>
      </div>
    </div>
  )
}

export const OrderCardSkeletonList = ({ count = 3 }) => {
  return (
    <div>
      {Array.from({ length: count }).map((_, i) => (
        <OrderCardSkeleton key={i} />
      ))}
    </div>
  )
}

export default OrderCardSkeleton
