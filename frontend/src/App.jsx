import React from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Home from './pages/Home'
import Collection from './pages/Collection'
import About from './pages/About'
import Contact from './pages/Contact'
import Product from './pages/Product'
import Cart from './pages/Cart'
import Login from './pages/Login'
import Profile from './pages/Profile'
import PlaceOrder from './pages/PlaceOrder'
import Orders from './pages/Orders'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import SearchBox from './components/SearchBox'
import BottomNav from './components/BottomNav'
import { Toaster } from 'react-hot-toast'

const pageTransition = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
  transition: { duration: 0.25, ease: 'easeOut' },
}

const PageWrapper = ({ children }) => (
  <motion.div {...pageTransition}>
    {children}
  </motion.div>
)

const App = () => {
  const location = useLocation()

  return (
    <div className='min-h-screen flex flex-col'>
      <Toaster
        position='top-center'
        toastOptions={{
          duration: 3000,
          style: {
            background: '#fff',
            color: '#333',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            fontSize: '14px',
          },
        }}
      />
      <Navbar />
      <SearchBox />
      <main className='flex-1 px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]'>
        <AnimatePresence mode='wait'>
          <Routes location={location} key={location.pathname}>
            <Route path='/' element={<PageWrapper><Home /></PageWrapper>} />
            <Route path='/about' element={<PageWrapper><About /></PageWrapper>} />
            <Route path='/contact' element={<PageWrapper><Contact /></PageWrapper>} />
            <Route path='/collection' element={<PageWrapper><Collection /></PageWrapper>} />
            <Route path='/product/:productId' element={<PageWrapper><Product /></PageWrapper>} />
            <Route path='/cart' element={<PageWrapper><Cart /></PageWrapper>} />
            <Route path='/login' element={<PageWrapper><Login /></PageWrapper>} />
            <Route path='/profile' element={<PageWrapper><Profile /></PageWrapper>} />
            <Route path='/place-order' element={<PageWrapper><PlaceOrder /></PageWrapper>} />
            <Route path='/orders' element={<PageWrapper><Orders /></PageWrapper>} />
          </Routes>
        </AnimatePresence>
      </main>
      <footer className='px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]'>
        <Footer />
      </footer>
      {/* Spacer for mobile bottom nav */}
      <div className='bottom-nav-spacer' />
      <BottomNav />
    </div>
  )
}

export default App