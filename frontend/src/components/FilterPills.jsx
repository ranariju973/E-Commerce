import React from 'react'

const FilterPills = ({ options, activeValue, onChange }) => {
  return (
    <div className='flex gap-2 overflow-x-auto hide-scrollbar py-2'>
      {options.map((option) => (
        <button
          key={option.value}
          type='button'
          className={`pill-btn ${activeValue === option.value ? 'active' : ''}`}
          onClick={() => onChange(option.value)}
        >
          {option.icon && <span>{option.icon}</span>}
          {option.label}
        </button>
      ))}
    </div>
  )
}

export default FilterPills
