import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const BottomSheet = ({ isOpen, onClose, title, children }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className='bottom-sheet-backdrop'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            className='bottom-sheet'
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            <div className='bottom-sheet-handle' />
            {title && (
              <div className='px-5 pb-3 border-b'>
                <h3 className='text-lg font-semibold'>{title}</h3>
              </div>
            )}
            <div className='px-5 py-4 pb-8 safe-bottom'>
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default BottomSheet
