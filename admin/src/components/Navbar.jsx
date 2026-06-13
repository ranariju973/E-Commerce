import React from 'react'
import { assets } from '../assets/assets'

const Navbar = ({ setToken }) => {
  return (
    <div className='admin-topnav bg-[#111111]/80 backdrop-blur-md border-b border-white/10 z-50 sticky top-0'>
      <div className='flex items-center justify-between py-3 px-4 md:px-6'>
        <div className='flex items-center gap-3'>
          <img className='w-[max(10%,80px)] invert brightness-0' src={assets.logo} alt='Logo' />
        </div>

        <div className='flex items-center gap-4'>
          {/* Admin badge */}
          <div className='hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10'>
            <div className='w-6 h-6 rounded-full bg-white flex items-center justify-center'>
              <span className='text-[10px] font-bold text-black'>A</span>
            </div>
            <span className='text-xs text-gray-400 font-medium'>Admin</span>
          </div>

          {/* Logout */}
          <button
            className='admin-btn admin-btn-outline admin-btn-sm'
            onClick={() => setToken('')}
          >
            <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
              <path d='M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4'/>
              <polyline points='16 17 21 12 16 7'/>
              <line x1='21' y1='12' x2='9' y2='12'/>
            </svg>
            <span className='hidden sm:inline'>Logout</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default Navbar