import React, { useContext, useState, useEffect } from 'react'
import { assets } from '../assets/assets'
import { Link, NavLink } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext'
import { motion, AnimatePresence } from 'framer-motion'

const Navbar = () => {

    const [visible, setVisible] = useState(false)
    const [scrolled, setScrolled] = useState(false)
    const { setShowSearch, getCartCount, navigate, token, logoutUser } = useContext(ShopContext)

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10)
        }
        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const handleSearchClick = () => {
        setShowSearch(true)
        navigate('/collection')
    }

  return (
    <div className={`sticky-header z-50 ${scrolled ? 'scrolled bg-white/80 backdrop-blur-md border-b border-gray-100' : ''}`}>
      <div className='relative z-40 flex items-center justify-between py-4 font-medium px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]'>

        <Link to='/'>
            <img src={assets.logo} className='w-36' alt="Jwell Store"/>
        </Link>

        <ul className='relative z-10 hidden sm:flex gap-5 text-sm text-gray-700'>
            <NavLink to='/' end className='flex flex-col items-center gap-1 '>
                <p>HOME</p>
                <hr className='w-2/4 border-none h-[1.5px] bg-gray-700  hidden'/>
            </NavLink>

            <NavLink to='/collection' className='flex flex-col items-center gap-1 '>
                <p>COLLECTION</p>
                <hr className='w-2/4 border-none h-[1.5px] bg-gray-700 hidden'/>
            </NavLink>

            <NavLink to='/about' className='flex flex-col items-center gap-1 '>
                <p>ABOUT</p>
                <hr className='w-2/4 border-none h-[1.5px] bg-gray-700 hidden'/>
            </NavLink>

            <NavLink to='/contact' className='flex flex-col items-center gap-1 '>
                <p>CONTACT</p>
                <hr className='w-2/4 border-none h-[1.5px] bg-gray-700 hidden'/>
            </NavLink>
        </ul>

        <div className='flex items-center gap-4 sm:gap-6'>
            <button onClick={handleSearchClick} className='p-2 hover:bg-gray-100 rounded-full transition hidden sm:block' aria-label='Search'>
                <img src={assets.search_icon} className='w-5' alt="Search"/>
            </button>
            <div className='group relative hidden sm:block'>
                {
                    token
                        ? <img src={assets.profile_icon} className='w-5 cursor-pointer' alt="User"/>
                        : <Link to='/login'><img src={assets.profile_icon} className='w-5 cursor-pointer' alt="User"/></Link>
                }
                {
                    token && (
                        <div className='group-hover:block hidden absolute dropdown-menu right-0 pt-4 z-50'>
                            <div className='flex flex-col gap-2 w-40 py-3 px-5 glass-card-solid text-gray-500 rounded-xl'>
                                <p className='cursor-pointer hover:text-black transition text-sm'>My Profile</p>
                                <p onClick={() => navigate('/orders')} className='cursor-pointer hover:text-black transition text-sm'>Orders</p>
                                <hr className='border-gray-200' />
                                <p onClick={logoutUser} className='cursor-pointer hover:text-red-500 transition text-sm'>Logout</p>
                            </div>
                        </div>
                    )
                }
            </div>
            <Link className='relative' to='/cart'>
                <img src={assets.cart_icon} className='w-5 min-w-5 ' alt="Cart"/>
                <span className='absolute -right-2 -bottom-2 flex h-5 w-5 items-center justify-center rounded-full bg-black text-[10px] text-white'>
                    {getCartCount()}
                </span>
            </Link>
            <button onClick={() => setVisible(true)} className='p-1 sm:hidden' aria-label='Open menu'>
                <img src={assets.menu_icon} className='w-5 cursor-pointer' alt="Menu"/>
            </button>
        </div>
      </div>

        {/* Slide-in Drawer for Mobile */}
        <AnimatePresence>
            {visible && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className='fixed inset-0 bg-black/40 backdrop-blur-sm z-50'
                        onClick={() => setVisible(false)}
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        className='fixed top-0 right-0 bottom-0 w-[75%] max-w-[300px] bg-white z-50 shadow-2xl'
                    >
                        <div className='flex flex-col h-full'>
                            {/* Header */}
                            <div className='flex items-center justify-between p-4 border-b'>
                                <span className='font-semibold text-gray-700'>Menu</span>
                                <button onClick={() => setVisible(false)} className='p-2 hover:bg-gray-100 rounded-full transition' aria-label='Close menu'>
                                    <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                                        <line x1='18' y1='6' x2='6' y2='18' /><line x1='6' y1='6' x2='18' y2='18' />
                                    </svg>
                                </button>
                            </div>

                            {/* Nav Links */}
                            <nav className='flex-1 py-4'>
                                <NavLink onClick={() => setVisible(false)} className='flex items-center gap-3 px-6 py-4 text-gray-700 hover:bg-gray-50 transition' to='/about'>
                                    <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'><circle cx='12' cy='12' r='10'/><line x1='12' y1='16' x2='12' y2='12'/><line x1='12' y1='8' x2='12.01' y2='8'/></svg>
                                    ABOUT
                                </NavLink>
                                <NavLink onClick={() => setVisible(false)} className='flex items-center gap-3 px-6 py-4 text-gray-700 hover:bg-gray-50 transition' to='/contact'>
                                    <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'><path d='M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z'/></svg>
                                    CONTACT
                                </NavLink>
                            </nav>

                            {/* Footer */}
                            {token && (
                                <div className='border-t p-4'>
                                    <button
                                        onClick={() => { logoutUser(); setVisible(false); }}
                                        className='w-full text-left px-2 py-3 text-sm text-red-500 hover:bg-red-50 rounded-lg transition'
                                    >
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    </div>
  )
}

export default Navbar
