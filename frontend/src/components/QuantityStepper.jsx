import React from 'react'

const QuantityStepper = ({ value, onChange, min = 1, max = 99 }) => {
  const handleDecrement = () => {
    if (value > min) {
      onChange(value - 1)
    }
  }

  const handleIncrement = () => {
    if (value < max) {
      onChange(value + 1)
    }
  }

  return (
    <div className='qty-stepper'>
      <button
        type='button'
        onClick={handleDecrement}
        disabled={value <= min}
        aria-label='Decrease quantity'
        style={{ opacity: value <= min ? 0.4 : 1 }}
      >
        −
      </button>
      <span className='qty-value'>{value}</span>
      <button
        type='button'
        onClick={handleIncrement}
        disabled={value >= max}
        aria-label='Increase quantity'
        style={{ opacity: value >= max ? 0.4 : 1 }}
      >
        +
      </button>
    </div>
  )
}

export default QuantityStepper
