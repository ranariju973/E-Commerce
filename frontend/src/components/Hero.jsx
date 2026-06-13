import React, { useContext, useEffect, useState } from 'react'
import { assets } from '../assets/assets'
import { ShopContext } from '../context/ShopContext'
import { getDetailImage } from '../utils/cloudinaryHelper'
import { motion, AnimatePresence } from 'framer-motion'

const Hero = () => {
  const { products } = useContext(ShopContext);
  const [latestImages, setLatestImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Fetch the latest 5 product images
  useEffect(() => {
    if (products && products.length > 0) {
      const latest = products.slice(0, 5).map(p => p.image[0]).filter(Boolean);
      setLatestImages(latest.length > 0 ? latest : [assets.hero_img]);
    } else {
      setLatestImages([assets.hero_img]);
    }
  }, [products]);

  // Slideshow interval (changes every 3.5 seconds)
  useEffect(() => {
    if (latestImages.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % latestImages.length);
    }, 3500);

    return () => clearInterval(interval);
  }, [latestImages]);

  return (
    <div className='flex flex-col sm:flex-row border border-gray-400 overflow-hidden'>
        {/* Left Section */}
        <div className='w-full sm:w-1/2 flex items-center justify-center py-10 sm:py-10 bg-white z-10'>
            <div className='text-[#414141]'>
                <div className='flex items-center gap-2'>
                    <p className='w-8 md:w-11 h-0.5 bg-[#414141]'></p>
                    <p className='font-medium text-sm md:text-base'>OUR BESTSELLERS</p>
                </div>
                <h1 className='prata-regular text-3xl sm:py-3 lg:text-5xl leading-relaxed'>Latest Arrivals</h1>
                <div className='flex items-center gap-2'>
                    <p className='font-semibold text-sm md:text-base'>SHOP NOW</p>
                    <p className='w-8 md:w-11 h-px bg-[#414141]'></p>
                </div>
            </div>
        </div>

        {/* Right Section (Slideshow) */}
        <div className='w-full sm:w-1/2 relative bg-gray-50 min-h-[300px] sm:min-h-[450px]'>
            <AnimatePresence initial={false}>
                <motion.div
                    key={currentIndex}
                    initial={{ x: '100%', opacity: 0.5 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: '-100%', opacity: 0.5 }}
                    transition={{ type: 'tween', ease: 'easeInOut', duration: 0.6 }}
                    className='absolute inset-0 flex items-center justify-center'
                >
                    <img
                        src={latestImages[currentIndex] === assets.hero_img ? latestImages[currentIndex] : getDetailImage(latestImages[currentIndex])}
                        alt="Latest Collection"
                        className='w-full h-full object-contain'
                    />
                </motion.div>
            </AnimatePresence>
        </div>
    </div>
  )
}

export default Hero