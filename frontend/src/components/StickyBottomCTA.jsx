import React from 'react'

const StickyBottomCTA = ({ onAddToCart, onBuyNow, visible }) => {
  if (!visible) return null

  return (
    <div
      className='fixed bottom-[60px] sm:bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-xl border-t border-gray-100 px-4 py-3 safe-bottom'
      style={{ boxShadow: '0 -4px 20px rgba(0,0,0,0.06)' }}
    >
      <div className='flex gap-3 max-w-lg mx-auto'>
        <button
          onClick={onAddToCart}
          className='btn-outline flex-1 py-3'
        >
          Add to Cart
        </button>
        <button
          onClick={onBuyNow}
          className='btn-primary flex-1 py-3'
        >
          Buy Now
        </button>
      </div>
    </div>
  )
}

export default StickyBottomCTA
