import React from 'react'
import {assets} from '../assets/assets'

const OurPolicy = () => {
  return (
    <div className='flex flex-col sm:flex-row justify-around gap-12 sm:gap-2 text-center py-20 text-xc sm:text-sm md:text-base text-gray-700'>

      <div>
        <img className='w-12 m-auto mb-5' src={assets.exchange_icon} alt=""/>
        <p className='font-semibold'>Easy Exchange Policy</p>
        <p className='text-gray-400'>We offer a simple and hassle-free exchange process for all our products.</p>
      </div>

      <div>
        <img className='w-12 m-auto mb-5' src={assets.quality_icon} alt=""/>
        <p className='font-semibold'>7 Days return policy</p>
        <p className='text-gray-400'>You can return any item within 7 days of purchase for a full refund.</p>
      </div>

      <div>
        <img className='w-12 m-auto mb-5' src={assets.support_img} alt=""/>
        <p className='font-semibold'>24/7 Customer Support</p>
        <p className='text-gray-400'>Our dedicated support team is available around the clock to assist you with any queries.</p>
      </div>

    </div>
  )
}

export default OurPolicy