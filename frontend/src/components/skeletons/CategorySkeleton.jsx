import React from 'react'
import Skeleton from './SkeletonLoader'

const CategorySkeleton = ({ count = 8 }) => {
  return (
    <div className='flex gap-6 overflow-hidden py-4'>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className='flex flex-col items-center gap-2 min-w-[70px]'>
          <Skeleton width='56px' height='56px' borderRadius={28} />
          <Skeleton width='48px' height='10px' />
        </div>
      ))}
    </div>
  )
}

export default CategorySkeleton
