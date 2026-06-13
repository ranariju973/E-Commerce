import React, { useContext, useEffect, useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext'
import RelatedProducts from '../components/RelatedProducts'
import QuantityStepper from '../components/QuantityStepper'
import StickyBottomCTA from '../components/StickyBottomCTA'
import ProductDetailSkeleton from '../components/skeletons/ProductDetailSkeleton'
import ReviewList from '../components/reviews/ReviewList'
import { getDetailImage, getThumbnailImage } from '../utils/cloudinaryHelper'
import { toast } from 'react-hot-toast'
import { parseWeightInput, sanitizeWeightInput } from '../utils/weightInput'
import { motion } from 'framer-motion'

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-50px' },
  transition: { duration: 0.5, ease: 'easeOut' },
}

const Product = () => {
  const defaultWeight = ''
  const { productId } = useParams()
  const { products, currency, addToCart, navigate } = useContext(ShopContext)
  const [productData, setProductData] = useState(null)
  const [image, setImage] = useState('')
  const [selectedQuantity, setSelectedQuantity] = useState(1)
  const [selectedWeight, setSelectedWeight] = useState(defaultWeight)
  const [showStickyCTA, setShowStickyCTA] = useState(false)
  const [activeTab, setActiveTab] = useState('description')
  const ctaRef = useRef(null)

  useEffect(() => {
    const found = products.find((item) => item._id === productId)
    if (found) {
      setProductData(found)
      setImage(found.image[0])
    }
  }, [productId, products])

  useEffect(() => {
    setSelectedQuantity(1)
    setSelectedWeight(defaultWeight)
  }, [productId])

  // Intersection observer for sticky CTA
  useEffect(() => {
    if (!ctaRef.current) return
    const observer = new IntersectionObserver(
      ([entry]) => setShowStickyCTA(!entry.isIntersecting),
      { threshold: 0 }
    )
    observer.observe(ctaRef.current)
    return () => observer.disconnect()
  }, [productData])

  const handleBuyNow = () => {
    if (!productData) return
    const parsedWeight = parseWeightInput(selectedWeight)
    if (!parsedWeight) {
      toast.error('Please enter a gold weight greater than 0 gm')
      return
    }
    navigate('/place-order', {
      state: {
        buyNowItemId: productData._id,
        buyNowQuantity: selectedQuantity,
        buyNowWeight: parsedWeight,
      },
    })
  }

  const handleAddToCart = () => {
    if (!productData) return
    const parsedWeight = parseWeightInput(selectedWeight)
    if (!parsedWeight) {
      toast.error('Please enter a gold weight greater than 0 gm')
      return
    }
    addToCart(productData._id, selectedQuantity, parsedWeight)
    toast.success('Added to cart!')
  }

  if (!productData) return <ProductDetailSkeleton />

  return (
    <div className='pt-6 pb-10'>
      {/* Product Data */}
      <div className='flex gap-8 sm:gap-12 flex-col sm:flex-row'>
        {/* Image Gallery */}
        <motion.div className='flex-1' {...fadeUp}>
          <div className='flex flex-col-reverse gap-3 sm:flex-row'>
            {/* Thumbnails */}
            <div className='flex sm:flex-col overflow-x-auto sm:overflow-y-auto gap-2 sm:w-[18%] hide-scrollbar'>
              {productData.image.map((item, index) => (
                <button
                  key={index}
                  onClick={() => setImage(item)}
                  className={`flex-shrink-0 w-[22%] sm:w-full rounded-lg overflow-hidden border-2 transition ${
                    image === item ? 'border-black' : 'border-transparent hover:border-gray-300'
                  }`}
                >
                  <img
                    src={getThumbnailImage(item)}
                    className='w-full aspect-square object-contain'
                    alt={`${productData.name} view ${index + 1}`}
                    loading='lazy'
                  />
                </button>
              ))}
            </div>
            {/* Main Image */}
            <div className='w-full sm:w-[80%]'>
              <div className='product-image-wrapper' style={{ borderRadius: '16px' }}>
                <img
                  src={getDetailImage(image)}
                  alt={productData.name}
                  className='w-full h-full object-contain'
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Product Info */}
        <motion.div className='flex-1' {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.1 }}>
          {/* Brand (if category can serve as brand) */}
          <p className='text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1'>
            {productData.category}
          </p>
          <h1 className='font-semibold text-2xl sm:text-3xl leading-tight text-gray-900'>
            {productData.name}
          </h1>

          {/* Rating */}
          <div className='flex items-center gap-2 mt-3'>
            <div className='flex gap-0.5'>
              {[1, 2, 3, 4, 5].map((star) => (
                <svg key={star} width='16' height='16' viewBox='0 0 24 24' fill={star <= 4 ? '#f59e0b' : '#e5e7eb'} stroke='none'>
                  <polygon points='12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2' />
                </svg>
              ))}
            </div>
            <span className='text-sm text-gray-500'>(122 ratings)</span>
          </div>

          {/* Price */}
          <div className='mt-5 flex items-baseline gap-3'>
            <span className='price-current text-3xl'>{currency}{productData.price}</span>
          </div>

          {/* Description */}
          <p className='mt-4 text-gray-500 leading-relaxed text-sm sm:text-base'>
            {productData.description}
          </p>

          {/* Quantity & Weight */}
          <div className='mt-6 grid max-w-md grid-cols-1 gap-4 sm:grid-cols-2'>
            <div>
              <p className='mb-2 text-sm font-semibold text-gray-700'>Quantity</p>
              <QuantityStepper
                value={selectedQuantity}
                onChange={setSelectedQuantity}
              />
            </div>
            <div>
              <p className='mb-2 text-sm font-semibold text-gray-700'>Gold Weight (gm)</p>
              <input
                type='text'
                inputMode='decimal'
                value={selectedWeight}
                onChange={(event) => setSelectedWeight(sanitizeWeightInput(event.target.value))}
                placeholder='0.10'
                className='w-full border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-black rounded-lg transition'
              />
            </div>
          </div>

          {/* CTA Buttons */}
          <div ref={ctaRef} className='mt-8 flex flex-col gap-3 sm:flex-row'>
            <button onClick={handleAddToCart} className='btn-outline flex-1 py-3'>
              Add to Cart
            </button>
            <button onClick={handleBuyNow} className='btn-primary flex-1 py-3'>
              Buy Now
            </button>
          </div>

          {/* Highlights */}
          <motion.div className='mt-8 glass-card-solid p-4' {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.2 }}>
            <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
              {[
                { icon: '🚚', text: 'Free Delivery' },
                { icon: '✅', text: '7-Day Returns' },
                { icon: '🛡️', text: '1-Year Warranty' },
              ].map((item, i) => (
                <div key={i} className='flex items-center gap-2 text-sm text-gray-600'>
                  <span className='text-lg'>{item.icon}</span>
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Description & Review Section */}
      <motion.div className='mt-16' {...fadeUp}>
        <div className='tab-bar'>
          <button
            className={`tab-item ${activeTab === 'description' ? 'active' : ''}`}
            onClick={() => setActiveTab('description')}
          >
            Description
          </button>
          <button
            className={`tab-item ${activeTab === 'reviews' ? 'active' : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            Reviews (122)
          </button>
        </div>

        <div className='py-6'>
          {activeTab === 'description' ? (
            <div className='flex flex-col gap-4 text-sm text-gray-500 leading-relaxed'>
              <p>Jewl Store brings elegant pieces for every occasion, from daily wear to festive celebrations. Explore our curated collection of rings, necklaces, earrings, and bracelets crafted for style and comfort. Enjoy trusted quality, secure checkout, fast delivery, and easy returns with every order you place.</p>
              <p>Jwel Store offers timeless designs, premium finishing, and modern trends to elevate your everyday style. Discover beautifully crafted jewelry collections made to match every mood, event, and outfit with confidence and charm.</p>
            </div>
          ) : (
            <ReviewList productId={productId} />
          )}
        </div>
      </motion.div>

      {/* Related Products */}
      <RelatedProducts category={productData.category} subCategory={productData.subCategory} />

      {/* Sticky Bottom CTA */}
      <StickyBottomCTA
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
        visible={showStickyCTA}
      />
    </div>
  )
}

export default Product
