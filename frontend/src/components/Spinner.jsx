import React from 'react'

const Spinner = ({ size = 'md', color = 'dark', className = '' }) => {
  const sizeClass = size === 'sm' ? 'spinner-sm' : ''
  const colorClass = color === 'white' ? 'spinner-white' : ''

  return (
    <div
      className={`spinner ${sizeClass} ${colorClass} ${className}`}
      role='status'
      aria-label='Loading'
    />
  )
}

export default Spinner
