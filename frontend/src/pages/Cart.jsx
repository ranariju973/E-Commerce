import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from '../components/Title'
import CartTotal from '../components/CartTotal'
import QuantityStepper from '../components/QuantityStepper'
import { CartItemSkeletonList } from '../components/skeletons/CartItemSkeleton'
import { getCartImage } from '../utils/cloudinaryHelper'
import { formatWeightDisplay, parseWeightInput, sanitizeWeightInput } from '../utils/weightInput'
import { motion, AnimatePresence } from 'framer-motion'

const Cart = () => {
  const defaultWeight = 0.1
  const { products, currency, cartItems, updateQuantity, navigate } = useContext(ShopContext)
  const [weightInputs, setWeightInputs] = useState({})
  const [removingId, setRemovingId] = useState(null)

  const cartData = Object.entries(cartItems)
    .filter(([, cartItem]) => Number(cartItem?.quantity || 0) > 0)
    .map(([itemId, cartItem]) => ({
      _id: itemId,
      quantity: Number(cartItem.quantity),
      weight: Number(cartItem.weight || defaultWeight),
      productData: products.find((product) => product._id === itemId) || null,
    }))

  const visibleCartItems = cartData.filter((item) => item.productData)
  const hasCartItems = cartData.length > 0
  const isWaitingForProducts = hasCartItems && products.length === 0

  useEffect(() => {
    const nextWeightInputs = Object.fromEntries(
      visibleCartItems.map((item) => [item._id, formatWeightDisplay(item.weight)])
    )
    setWeightInputs((currentInputs) => {
      const nextKeys = Object.keys(nextWeightInputs)
      if (
        Object.keys(currentInputs).length === nextKeys.length &&
        nextKeys.every((key) => currentInputs[key] === nextWeightInputs[key])
      ) {
        return currentInputs
      }
      return nextWeightInputs
    })
  }, [cartItems, products])

  const handleQuantityChange = (itemId, newQuantity, weight) => {
    updateQuantity(itemId, newQuantity, weight)
  }

  const handleWeightChange = (itemId, quantity, value) => {
    const nextWeight = sanitizeWeightInput(value)
    setWeightInputs((currentInputs) => ({ ...currentInputs, [itemId]: nextWeight }))
    const parsedWeight = parseWeightInput(nextWeight)
    if (parsedWeight === null) return
    updateQuantity(itemId, quantity, parsedWeight)
  }

  const handleRemove = async (itemId) => {
    setRemovingId(itemId)
    await new Promise((r) => setTimeout(r, 300))
    updateQuantity(itemId, 0)
    setRemovingId(null)
  }

  // Calculate savings (placeholder — MRP not in current model)
  const subtotal = visibleCartItems.reduce((sum, item) => sum + item.productData.price * item.quantity, 0)

  return (
    <div className='pt-8 pb-10'>
      <div className='text-2xl mb-6'>
        <Title text1={'YOUR'} text2={'CART'} />
      </div>

      {isWaitingForProducts && <CartItemSkeletonList count={3} />}

      {/* Empty Cart */}
      {!hasCartItems && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className='text-center py-16'
        >
          <div className='w-24 h-24 mx-auto mb-6 rounded-full bg-gray-50 flex items-center justify-center'>
            <svg width='40' height='40' viewBox='0 0 24 24' fill='none' stroke='#d1d5db' strokeWidth='1.5'>
              <circle cx='9' cy='21' r='1' /><circle cx='20' cy='21' r='1' />
              <path d='M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6' />
            </svg>
          </div>
          <h3 className='text-xl font-semibold text-gray-800 mb-2'>Your cart is empty</h3>
          <p className='text-sm text-gray-400 mb-6'>Add a few pieces you love and they will show up here.</p>
          <button onClick={() => navigate('/collection')} className='btn-primary'>
            Start Shopping
          </button>
        </motion.div>
      )}

      {/* Cart Items */}
      <AnimatePresence>
        {visibleCartItems.map((item) => (
          <motion.div
            key={item._id}
            layout
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: removingId === item._id ? 0 : 1, x: removingId === item._id ? -100 : 0 }}
            exit={{ opacity: 0, x: -100, height: 0, marginBottom: 0 }}
            transition={{ duration: 0.3 }}
            className='glass-card-solid p-4 mb-3'
          >
            <div className='flex gap-4'>
              {/* Product Image */}
              <img
                className='w-20 h-20 rounded-xl object-cover flex-shrink-0 cursor-pointer'
                src={getCartImage(item.productData.image?.[0])}
                alt={item.productData.name}
                onClick={() => navigate(`/product/${item._id}`)}
              />

              {/* Product Info */}
              <div className='flex-1 min-w-0'>
                <p
                  className='text-sm font-semibold text-gray-800 truncate cursor-pointer hover:text-black transition'
                  onClick={() => navigate(`/product/${item._id}`)}
                >
                  {item.productData.name}
                </p>
                <p className='text-xs text-gray-400 mt-0.5'>{item.productData.category}</p>

                <div className='flex items-center gap-3 mt-2'>
                  <span className='text-sm font-bold text-gray-800'>{currency}{item.productData.price}</span>
                  <span className='text-xs text-gray-400'>• {formatWeightDisplay(item.weight)} gm</span>
                </div>

                {/* Quantity & Actions */}
                <div className='flex items-center justify-between mt-3'>
                  <QuantityStepper
                    value={item.quantity}
                    onChange={(newQty) => handleQuantityChange(item._id, newQty, item.weight)}
                  />
                  <button
                    onClick={() => handleRemove(item._id)}
                    className='text-xs text-gray-400 hover:text-red-500 transition flex items-center gap-1'
                  >
                    <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                      <polyline points='3 6 5 6 21 6' /><path d='M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2' />
                    </svg>
                    Remove
                  </button>
                </div>
              </div>
            </div>

            {/* Weight Input (collapsed row) */}
            <div className='mt-3 pt-3 border-t border-gray-100'>
              <div className='flex items-center gap-2'>
                <label className='text-xs text-gray-400 flex-shrink-0'>Weight (gm):</label>
                <input
                  onChange={(event) => handleWeightChange(item._id, item.quantity, event.target.value)}
                  className='flex-1 max-w-[100px] border border-gray-200 px-3 py-1.5 text-sm rounded-lg outline-none focus:border-black transition'
                  type='text'
                  inputMode='decimal'
                  placeholder='0.10'
                  value={weightInputs[item._id] ?? formatWeightDisplay(item.weight)}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Price Breakdown & Checkout */}
      {visibleCartItems.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className='mt-8 flex flex-col items-end'
        >
          <div className='w-full sm:w-[450px]'>
            {/* Price Breakdown Card */}
            <div className='glass-card-solid p-5'>
              <CartTotal />
              {subtotal > 0 && (
                <div className='mt-3 pt-3 border-t border-gray-100'>
                  <p className='text-sm text-green-600 font-medium flex items-center gap-1'>
                    💰 You save on this order!
                  </p>
                </div>
              )}
            </div>

            {/* Checkout Button */}
            <div className='w-full mt-4'>
              <button
                onClick={() => navigate('/place-order')}
                className='btn-primary w-full py-4 text-base pulse-once'
                disabled={!visibleCartItems.length}
              >
                Place Order ({visibleCartItems.reduce((sum, item) => sum + item.quantity, 0)} items)
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default Cart
