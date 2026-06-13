import React from 'react'

const Skeleton = ({ width, height, borderRadius = 8, className = '', style = {} }) => {
  return (
    <div
      className={`skeleton ${className}`}
      style={{
        width: width || '100%',
        height: height || '16px',
        borderRadius,
        ...style,
      }}
    />
  )
}

export default Skeleton
