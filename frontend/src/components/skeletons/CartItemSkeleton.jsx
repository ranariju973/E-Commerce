import React from 'react'
import Skeleton from './SkeletonLoader'

const CartItemSkeleton = () => {
  return (
    <div className='flex items-start gap-4 py-4 border-t'>
      <Skeleton width='80px' height='80px' borderRadius={8} />
      <div className='flex-1'>
        <Skeleton width='60%' height='14px' style={{ marginBottom: 8 }} />
        <Skeleton width='40%' height='12px' style={{ marginBottom: 8 }} />
        <Skeleton width='30%' height='16px' />
      </div>
      <Skeleton width='80px' height='32px' borderRadius={16} />
    </div>
  )
}

export const CartItemSkeletonList = ({ count = 3 }) => {
  return (
    <div>
      {Array.from({ length: count }).map((_, i) => (
        <CartItemSkeleton key={i} />
      ))}
    </div>
  )
}

export default CartItemSkeleton
