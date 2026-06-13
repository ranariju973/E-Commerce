import React from 'react'
import Skeleton from './SkeletonLoader'

const BannerSkeleton = () => {
  return (
    <Skeleton
      width='100%'
      height='0'
      style={{ paddingBottom: '35%' }}
      borderRadius={16}
    />
  )
}

export default BannerSkeleton
