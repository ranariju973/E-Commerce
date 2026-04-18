import React, { useContext ,useState } from 'react'
import {assets} from '../assets/assets'
import { Navigate } from 'react-router-dom'
import { Link, NavLink } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext'

const Navbar = () => {

    const [visible, setVisible] = useState(false)
    const {setShowSearch, getCartCount, navigate, token, setToken, setCartItems} = useContext(ShopContext)

    const logout = () => {
        setToken('')
        localStorage.removeItem('token')
        setCartItems({})
        navigate('/login')
    }

    const handleSearchClick = () => {
        setShowSearch(true)
        navigate('/collection')
    }

  return (
    <div className='flex items-center justify-between py-5 font-medium'>

        <Link to='/'>
            <img src={assets.logo} className='w-36' alt=""/>
        </Link>

        <ul className='hidden sm:flex gap-5 text-sm text-gray-700'>
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

        <div className='flex items-center gap-6'>
            <img onClick={handleSearchClick} src={assets.search_icon} className='w-5 cursor-pointer' alt="Search"/>
            <div className='group relative'>
                {
                    token
                        ? <img src={assets.profile_icon} className='w-5 cursor-pointer' alt="User"/>
                        : <Link to='/login'><img src={assets.profile_icon} className='w-5 cursor-pointer' alt="User"/></Link>
                }
                {
                    token && (
                        <div className='group-hover:block hidden absolute dropdown-menu right-0 pt-4'>
                            <div className='flex flex-col gap-2 w-36 py-3 px-5 bg-slate-100 text-gray-500 rounded'>
                                <p className='cursor-pointer hover:text-black'>My Profile</p>
                                <p onClick={() => navigate('/orders')} className='cursor-pointer hover:text-black'>Order</p>
                                <p onClick={logout} className='cursor-pointer hover:text-black'>Logout</p>
                            </div>
                        </div>
                    )
                }
            </div>
            <Link className='relative' to='/cart'>
                <img src={assets.cart_icon} className='w-5 min-w-5 ' alt="Cart"/>
                <p className='absolute -right-2 -bottom-2 flex h-5 w-5 items-center justify-center rounded-full bg-black text-[10px] text-white'>{getCartCount()}</p>
            </Link>
            <img onClick={() => setVisible(true)} src={assets.menu_icon} className='w-5 cursor-pointer sm:hidden' alt="Menu"/>
        </div>

        {/* sidebar menu for small screens */}
        <div className={`fixed top-0 right-0 bottom-0 overflow-hidden bg-white transition-all ${visible ? 'w-full' : 'w-0'} z-50`}>
            <div className='flex flex-col text-gray-600'>
                <div onClick={() => setVisible(false)} className='flex items-center gap-4 p-3'>
                    <img className='h-4 rotate-180' src={assets.dropdown_icon} alt="Profile"/>
                    <p>Back</p>
                </div>
                <NavLink onClick={() => setVisible(false)} className='py-4 pl-8  border' to='/' end>HOME</NavLink>
                <NavLink onClick={() => setVisible(false)} className='py-4 pl-8  border' to='/collection'>COLLECTION</NavLink>
                <NavLink onClick={() => setVisible(false)} className='py-4 pl-8 border' to='/about'>ABOUT</NavLink>
                <NavLink onClick={() => setVisible(false)} className='py-4 pl-8  border' to='/contact'>CONTACT</NavLink>
            </div>
        </div>
    </div>
  )
}

export default Navbar