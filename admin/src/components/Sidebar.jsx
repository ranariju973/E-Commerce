import React from 'react'
import { NavLink } from 'react-router-dom'

const Sidebar = () => {
  return (
    <div className='admin-sidebar hidden md:block w-[220px] flex-shrink-0'>
      <div className='flex flex-col gap-2 pt-6 pb-4'>
        <p className='text-[10px] uppercase tracking-widest text-gray-600 font-semibold px-8 mb-2'>Menu</p>

        <NavLink className='admin-sidebar-link' to='/add'>
          <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
            <line x1='12' y1='5' x2='12' y2='19'/><line x1='5' y1='12' x2='19' y2='12'/>
          </svg>
          <span>Add Product</span>
        </NavLink>

        <NavLink className='admin-sidebar-link' to='/list'>
          <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
            <rect x='3' y='3' width='7' height='7'/><rect x='14' y='3' width='7' height='7'/><rect x='14' y='14' width='7' height='7'/><rect x='3' y='14' width='7' height='7'/>
          </svg>
          <span>Products</span>
        </NavLink>

        <NavLink className='admin-sidebar-link' to='/orders'>
          <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
            <path d='M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z'/>
            <polyline points='3.27 6.96 12 12.01 20.73 6.96'/><line x1='12' y1='22.08' x2='12' y2='12'/>
          </svg>
          <span>Orders</span>
        </NavLink>
      </div>
    </div>
  )
}

export default Sidebar