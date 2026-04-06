import React, { useContext, useEffect, useRef } from 'react'
import { ShopContext } from '../context/ShopContext'
import { assets } from '../assets/assets'
import { useLocation } from 'react-router-dom'

const SearchBox = () => {

    const {search, setSearch, showSearch, setShowSearch} = useContext(ShopContext)
    const location = useLocation()
    const searchInputRef = useRef(null)
    const visible = location.pathname.includes('collection')

    useEffect(() => {
        if (showSearch && visible) {
            const timer = setTimeout(() => {
                searchInputRef.current?.focus()
            }, 0)

            return () => clearTimeout(timer)
        }
    }, [showSearch, visible])

  return showSearch && visible ? (
    <div className='border-t border-b bg-gray-50 text-center'>
        <div className='inline-flex items-center justify-center border border-gray-400 px-5 py-2 my-5 mx-3 rounded-full w-3/4  sm:w-1/2  '>
            <input ref={searchInputRef} value={search} onChange={(e) => setSearch(e.target.value)} className='flex-1 outline-none bg-inherit text-sm' type="text" placeholder='Search...' />
            <img className='w-4' src={assets.search_icon} alt="Search"/>
        </div>
        <img onClick={() => setShowSearch(false)} className='w-3 inline cursor-pointer' src={assets.cross_icon} alt="Search"/>
    </div>
  ) : null
}

export default SearchBox