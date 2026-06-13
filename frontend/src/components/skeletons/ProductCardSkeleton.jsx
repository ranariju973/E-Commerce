import React from 'react'
import Skeleton from './SkeletonLoader'

const ProductCardSkeleton = () => {
  return (
    <div className='card-enhanced p-0 overflow-hidden'>
      <Skeleton height='0' style={{ paddingBottom: '100%' }} borderRadius={0} />
      <div style={{ padding: '12px' }}>
        <Skeleton width='70%' height='12px' style={{ marginBottom: 8 }} />
        <Skeleton width='90%' height='12px' style={{ marginBottom: 8 }} />
        <Skeleton width='50%' height='14px' style={{ marginBottom: 8 }} />
        <Skeleton width='40%' height='16px' />
      </div>
    </div>
  )
}

export const ProductCardSkeletonGrid = ({ count = 8 }) => {
  return (
    <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 gap-y-6'>
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  )
}

export default ProductCardSkeleton
