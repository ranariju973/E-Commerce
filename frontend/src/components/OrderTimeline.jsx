import React from 'react'
import { motion } from 'framer-motion'

const STATUS_STEPS = [
  'Order Placed',
  'Packing',
  'Shipped',
  'Out for delivery',
  'Delivered'
]

const OrderTimeline = ({ currentStatus }) => {
  // Determine current step index
  let currentIndex = STATUS_STEPS.indexOf(currentStatus)
  if (currentIndex === -1) {
    if (currentStatus === 'Payment Pending' || currentStatus === 'Processing') currentIndex = 0
    else currentIndex = 0
  }

  return (
    <div className='timeline mt-4'>
      {STATUS_STEPS.map((step, index) => {
        const isCompleted = index < currentIndex
        const isCurrent = index === currentIndex
        const isPending = index > currentIndex

        return (
          <motion.div
            key={step}
            className='timeline-step'
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className={`timeline-dot ${isCompleted ? 'completed' : isCurrent ? 'current' : ''}`}>
              {isCompleted ? (
                <svg width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='3'>
                  <polyline points='20 6 9 17 4 12' />
                </svg>
              ) : isCurrent ? (
                <div className='w-2 h-2 rounded-full bg-white' />
              ) : null}
            </div>
            <div className='ml-2'>
              <p className={`text-sm font-medium ${isPending ? 'text-gray-400' : 'text-gray-800'}`}>
                {step}
              </p>
              {isCurrent && (
                <p className='text-xs text-gray-500 mt-0.5'>
                  {step === 'Delivered' 
                    ? 'Package delivered successfully' 
                    : step === 'Order Placed' 
                    ? 'We have received your order'
                    : `Your order is currently ${step.toLowerCase()}`}
                </p>
              )}
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

export default OrderTimeline
