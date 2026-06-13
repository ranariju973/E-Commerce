import React from 'react'
import { NavLink } from 'react-router-dom'

const BottomNav = () => {
  return (
    <>
      <div className='admin-bottom-spacer' />
      <nav className='admin-bottom-nav' aria-label='Admin navigation'>
        <NavLink to='/add' className={({ isActive }) => `admin-bottom-nav-item ${isActive ? 'active' : ''}`}>
          <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
            <circle cx='12' cy='12' r='10'/><line x1='12' y1='8' x2='12' y2='16'/><line x1='8' y1='12' x2='16' y2='12'/>
          </svg>
          <span>Add</span>
        </NavLink>

        <NavLink to='/list' className={({ isActive }) => `admin-bottom-nav-item ${isActive ? 'active' : ''}`}>
          <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
            <rect x='3' y='3' width='7' height='7'/><rect x='14' y='3' width='7' height='7'/><rect x='14' y='14' width='7' height='7'/><rect x='3' y='14' width='7' height='7'/>
          </svg>
          <span>Products</span>
        </NavLink>

        <NavLink to='/orders' className={({ isActive }) => `admin-bottom-nav-item ${isActive ? 'active' : ''}`}>
          <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
            <path d='M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z'/>
            <polyline points='3.27 6.96 12 12.01 20.73 6.96'/><line x1='12' y1='22.08' x2='12' y2='12'/>
          </svg>
          <span>Orders</span>
        </NavLink>
      </nav>
    </>
  )
}

export default BottomNav
