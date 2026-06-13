import React from 'react'
import Skeleton from './SkeletonLoader'

const ProductDetailSkeleton = () => {
  return (
    <div className='pt-10'>
      <div className='flex gap-12 flex-col sm:flex-row'>
        {/* Image section */}
        <div className='flex-1 flex flex-col-reverse gap-3 sm:flex-row'>
          <div className='flex sm:flex-col gap-2 sm:w-[18.7%]'>
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} height='60px' style={{ width: '24%', flexShrink: 0 }} className='sm:!w-full' />
            ))}
          </div>
          <div className='w-full sm:w-[80%]'>
            <Skeleton height='0' style={{ paddingBottom: '100%' }} borderRadius={12} />
          </div>
        </div>

        {/* Info section */}
        <div className='flex-1'>
          <Skeleton width='80%' height='24px' style={{ marginBottom: 12 }} />
          <div className='flex gap-1 mt-2'>
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} width='16px' height='16px' borderRadius={2} />
            ))}
            <Skeleton width='40px' height='16px' style={{ marginLeft: 8 }} />
          </div>
          <Skeleton width='120px' height='32px' style={{ marginTop: 20 }} />
          <Skeleton width='100%' height='14px' style={{ marginTop: 20 }} />
          <Skeleton width='90%' height='14px' style={{ marginTop: 8 }} />
          <Skeleton width='70%' height='14px' style={{ marginTop: 8 }} />
          <div className='mt-6 flex gap-3'>
            <Skeleton width='140px' height='44px' borderRadius={8} />
            <Skeleton width='140px' height='44px' borderRadius={8} />
          </div>
          <div className='mt-8 flex gap-3'>
            <Skeleton width='160px' height='44px' borderRadius={8} />
            <Skeleton width='160px' height='44px' borderRadius={8} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetailSkeleton
