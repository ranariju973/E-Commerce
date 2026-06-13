import React, { useContext } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext'

const BottomNav = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { getCartCount, setShowSearch, token } = useContext(ShopContext)
  const cartCount = getCartCount()

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  const handleSearchClick = () => {
    setShowSearch(true)
    navigate('/collection')
  }

  const tabs = [
    {
      key: 'home',
      label: 'Home',
      path: '/',
      onClick: () => navigate('/'),
      icon: (
        <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
          <path d='M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' />
          <polyline points='9 22 9 12 15 12 15 22' />
        </svg>
      ),
    },
    {
      key: 'collection',
      label: 'Categories',
      path: '/collection',
      onClick: () => navigate('/collection'),
      icon: (
        <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
          <rect x='3' y='3' width='7' height='7' />
          <rect x='14' y='3' width='7' height='7' />
          <rect x='14' y='14' width='7' height='7' />
          <rect x='3' y='14' width='7' height='7' />
        </svg>
      ),
    },
    {
      key: 'search',
      label: 'Search',
      path: null,
      onClick: handleSearchClick,
      icon: (
        <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
          <circle cx='11' cy='11' r='8' />
          <line x1='21' y1='21' x2='16.65' y2='16.65' />
        </svg>
      ),
    },
    {
      key: 'orders',
      label: 'Orders',
      path: token ? '/orders' : '/login',
      onClick: () => navigate(token ? '/orders' : '/login'),
      icon: (
        <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
          <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
          <line x1="12" y1="22.08" x2="12" y2="12"></line>
        </svg>
      ),
    },
    {
      key: 'profile',
      label: 'Profile',
      path: token ? '/profile' : '/login',
      onClick: () => navigate(token ? '/profile' : '/login'),
      icon: (
        <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
          <path d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2' />
          <circle cx='12' cy='7' r='4' />
        </svg>
      ),
    },
  ]

  return (
    <nav className='bottom-nav' aria-label='Bottom navigation'>
      {tabs.map((tab) => (
        <button
          key={tab.key}
          className={`bottom-nav-item ripple ${tab.path && isActive(tab.path) ? 'active' : ''}`}
          onClick={tab.onClick}
          aria-label={tab.label}
          type='button'
        >
          {tab.icon}
          {tab.badge != null && (
            <span className='bottom-nav-badge'>{tab.badge > 9 ? '9+' : tab.badge}</span>
          )}
          <span>{tab.label}</span>
        </button>
      ))}
    </nav>
  )
}

export default BottomNav
