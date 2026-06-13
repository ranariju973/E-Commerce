import React, { useContext, useEffect, useRef, useState, useCallback } from 'react'
import { ShopContext } from '../context/ShopContext'
import { useLocation, useNavigate } from 'react-router-dom'
import { getCardImage } from '../utils/cloudinaryHelper'
import debounce from 'lodash.debounce'
import { motion, AnimatePresence } from 'framer-motion'

const MAX_RECENT = 5

const getRecentSearches = () => {
  try {
    return JSON.parse(localStorage.getItem('recentSearches') || '[]')
  } catch {
    return []
  }
}

const saveRecentSearch = (term) => {
  if (!term.trim()) return
  const recent = getRecentSearches().filter((s) => s !== term.trim())
  recent.unshift(term.trim())
  localStorage.setItem('recentSearches', JSON.stringify(recent.slice(0, MAX_RECENT)))
}

const clearRecentSearches = () => {
  localStorage.removeItem('recentSearches')
}

const highlightMatch = (text, query) => {
  if (!query) return text
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  const parts = text.split(regex)
  return parts.map((part, i) =>
    regex.test(part) ? <strong key={i} className='match'>{part}</strong> : part
  )
}

const SearchBox = () => {
  const { search, setSearch, showSearch, setShowSearch, backendUrl, products } = useContext(ShopContext)
  const location = useLocation()
  const navigate = useNavigate()
  const searchInputRef = useRef(null)
  const [suggestions, setSuggestions] = useState([])
  const [recentSearches, setRecentSearches] = useState([])
  const [activeIndex, setActiveIndex] = useState(-1)
  const [isOverlayOpen, setIsOverlayOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (showSearch) {
      setRecentSearches(getRecentSearches())
      if (isMobile) {
        setIsOverlayOpen(true)
      }
      setTimeout(() => searchInputRef.current?.focus(), 100)
    } else {
      setIsOverlayOpen(false)
    }
  }, [showSearch, isMobile])

  // Debounced search — use local product data for instant results
  const debouncedSearch = useCallback(
    debounce((query) => {
      if (!query.trim()) {
        setSuggestions([])
        return
      }
      const q = query.toLowerCase()
      const matches = products
        .filter((p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          (p.subCategory && p.subCategory.toLowerCase().includes(q))
        )
        .slice(0, 8)
        .map((p) => ({
          _id: p._id,
          name: p.name,
          category: p.category,
          image: p.image?.[0],
          price: p.price,
        }))
      setSuggestions(matches)
    }, 300),
    [products]
  )

  useEffect(() => {
    debouncedSearch(search)
    setActiveIndex(-1)
    return () => debouncedSearch.cancel()
  }, [search, debouncedSearch])

  const handleClose = () => {
    setShowSearch(false)
    setIsOverlayOpen(false)
    setSuggestions([])
    setActiveIndex(-1)
  }

  const handleSelect = (productId, term) => {
    saveRecentSearch(term)
    setSearch('')
    setSuggestions([])
    setShowSearch(false)
    setIsOverlayOpen(false)
    navigate(`/product/${productId}`)
  }

  const handleSearchSubmit = (e) => {
    e?.preventDefault()
    if (search.trim()) {
      saveRecentSearch(search.trim())
      setSuggestions([])
      setIsOverlayOpen(false)
      if (!location.pathname.includes('collection')) {
        navigate('/collection')
      }
    }
  }

  const handleRecentClick = (term) => {
    setSearch(term)
    if (!location.pathname.includes('collection')) {
      navigate('/collection')
    }
  }

  const handleKeyDown = (e) => {
    const total = suggestions.length
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((prev) => (prev < total - 1 ? prev + 1 : 0))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : total - 1))
    } else if (e.key === 'Enter' && activeIndex >= 0 && suggestions[activeIndex]) {
      e.preventDefault()
      const item = suggestions[activeIndex]
      handleSelect(item._id, item.name)
    } else if (e.key === 'Escape') {
      handleClose()
    }
  }

  const handleClearRecent = () => {
    clearRecentSearches()
    setRecentSearches([])
  }

  const showDropdown = showSearch && (search.trim() || recentSearches.length > 0)

  // Mobile overlay mode
  if (isMobile && isOverlayOpen) {
    return (
      <motion.div
        className='search-overlay'
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <div className='p-4'>
          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className='flex items-center gap-3 mb-4'>
            <div className='search-input-wrapper flex-1'>
              <svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='#9ca3af' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                <circle cx='11' cy='11' r='8' /><line x1='21' y1='21' x2='16.65' y2='16.65' />
              </svg>
              <input
                ref={searchInputRef}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder='Search for jewelry...'
                autoFocus
              />
              {search && (
                <button type='button' onClick={() => setSearch('')} className='p-1'>
                  <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='#9ca3af' strokeWidth='2'>
                    <line x1='18' y1='6' x2='6' y2='18' /><line x1='6' y1='6' x2='18' y2='18' />
                  </svg>
                </button>
              )}
            </div>
            <button type='button' onClick={handleClose} className='text-sm font-medium text-gray-500 px-2'>
              Cancel
            </button>
          </form>

          {/* Recent Searches */}
          {!search.trim() && recentSearches.length > 0 && (
            <div className='mb-4'>
              <div className='flex items-center justify-between mb-2 px-1'>
                <p className='text-xs font-semibold text-gray-500 uppercase tracking-wide'>Recent Searches</p>
                <button onClick={handleClearRecent} className='text-xs text-gray-400 hover:text-gray-600'>Clear All</button>
              </div>
              {recentSearches.map((term, i) => (
                <div
                  key={i}
                  className='search-suggestion-item'
                  onClick={() => handleRecentClick(term)}
                >
                  <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='#9ca3af' strokeWidth='2'>
                    <circle cx='12' cy='12' r='10' /><polyline points='12 6 12 12 16 14' />
                  </svg>
                  <span className='text-sm text-gray-700'>{term}</span>
                </div>
              ))}
            </div>
          )}

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div>
              <p className='text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 px-1'>Suggestions</p>
              {suggestions.map((item, i) => (
                <div
                  key={item._id}
                  className={`search-suggestion-item ${i === activeIndex ? 'active' : ''}`}
                  onClick={() => handleSelect(item._id, item.name)}
                >
                  <img
                    src={getCardImage(item.image)}
                    alt={item.name}
                    className='w-10 h-10 rounded-lg object-cover'
                    loading='lazy'
                  />
                  <div className='flex-1 min-w-0'>
                    <p className='text-sm text-gray-800 truncate'>{highlightMatch(item.name, search)}</p>
                    <p className='text-xs text-gray-400'>{item.category}</p>
                  </div>
                  <p className='text-sm font-semibold text-gray-700'>₹{item.price}</p>
                </div>
              ))}
            </div>
          )}

          {/* No results */}
          {search.trim() && suggestions.length === 0 && (
            <div className='text-center py-10'>
              <p className='text-gray-400 text-sm'>No results found for "{search}"</p>
            </div>
          )}
        </div>
      </motion.div>
    )
  }

  // Desktop inline mode
  if (!showSearch) return null

  return (
    <div className='relative border-t border-b bg-gray-50/80 backdrop-blur-sm'>
      <div className='flex items-center justify-center py-4 px-3'>
        <form onSubmit={handleSearchSubmit} className='relative w-full sm:w-1/2'>
          <div className='search-input-wrapper'>
            <svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='#9ca3af' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
              <circle cx='11' cy='11' r='8' /><line x1='21' y1='21' x2='16.65' y2='16.65' />
            </svg>
            <input
              ref={searchInputRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder='Search for jewelry...'
            />
            {search && (
              <button type='button' onClick={() => setSearch('')} className='p-1'>
                <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='#9ca3af' strokeWidth='2'>
                  <line x1='18' y1='6' x2='6' y2='18' /><line x1='6' y1='6' x2='18' y2='18' />
                </svg>
              </button>
            )}
          </div>

          {/* Dropdown */}
          <AnimatePresence>
            {showDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
                className='absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden z-50'
              >
                {/* Recent Searches */}
                {!search.trim() && recentSearches.length > 0 && (
                  <div className='p-3'>
                    <div className='flex items-center justify-between mb-2'>
                      <p className='text-xs font-semibold text-gray-500 uppercase tracking-wide'>Recent</p>
                      <button onClick={handleClearRecent} className='text-xs text-gray-400 hover:text-gray-600'>Clear</button>
                    </div>
                    {recentSearches.map((term, i) => (
                      <div
                        key={i}
                        className='search-suggestion-item'
                        onClick={() => handleRecentClick(term)}
                      >
                        <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='#9ca3af' strokeWidth='2'>
                          <circle cx='12' cy='12' r='10' /><polyline points='12 6 12 12 16 14' />
                        </svg>
                        <span className='text-sm text-gray-600'>{term}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Suggestions */}
                {suggestions.length > 0 && (
                  <div className='p-3 border-t border-gray-50'>
                    {suggestions.map((item, i) => (
                      <div
                        key={item._id}
                        className={`search-suggestion-item ${i === activeIndex ? 'active' : ''}`}
                        onClick={() => handleSelect(item._id, item.name)}
                      >
                        <img
                          src={getCardImage(item.image)}
                          alt={item.name}
                          className='w-9 h-9 rounded-lg object-cover'
                          loading='lazy'
                        />
                        <div className='flex-1 min-w-0'>
                          <p className='text-sm text-gray-800 truncate'>{highlightMatch(item.name, search)}</p>
                          <p className='text-xs text-gray-400'>{item.category}</p>
                        </div>
                        <p className='text-sm font-medium text-gray-600'>₹{item.price}</p>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </form>

        <button onClick={handleClose} className='ml-3 p-2 hover:bg-gray-200 rounded-full transition'>
          <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='#666' strokeWidth='2'>
            <line x1='18' y1='6' x2='6' y2='18' /><line x1='6' y1='6' x2='18' y2='18' />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default SearchBox