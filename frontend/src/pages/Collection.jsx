import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from '../components/Title'
import ProductItem from '../components/ProductItem'
import FilterPills from '../components/FilterPills'
import BottomSheet from '../components/BottomSheet'
import { ProductCardSkeletonGrid } from '../components/skeletons/ProductCardSkeleton'
import { JEWELRY_CATEGORIES, JEWELRY_TAXONOMY } from '../constants/jewelryTaxonomy'
import { motion } from 'framer-motion'

const SORT_OPTIONS = [
  { value: 'relevant', label: 'All' },
  { value: 'low-high', label: 'Price ↑' },
  { value: 'high-low', label: 'Price ↓' },
  { value: 'newest', label: 'New' },
]

const Collection = () => {
  const { products, search, showSearch } = useContext(ShopContext)
  const [showFilter, setShowFilter] = useState(false)
  const [filterProducts, setFilterProducts] = useState([])
  const [category, setCategory] = useState([])
  const [subCategory, setSubCategory] = useState([])
  const [sortType, setSortType] = useState('relevant')
  const [isLoading, setIsLoading] = useState(true)
  const [showMobileFilter, setShowMobileFilter] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (products.length > 0) {
      setIsLoading(false)
    }
  }, [products])

  const toggleCategory = (selectedCategory) => {
    setCategory((prev) =>
      prev.includes(selectedCategory)
        ? prev.filter((item) => item !== selectedCategory)
        : [...prev, selectedCategory]
    )
  }

  const toggleSubCategory = (selectedSubCategory) => {
    setSubCategory((prev) =>
      prev.includes(selectedSubCategory)
        ? prev.filter((item) => item !== selectedSubCategory)
        : [...prev, selectedSubCategory]
    )
  }

  useEffect(() => {
    const allowedSubCategories = new Set(
      category.flatMap((selectedCategory) => JEWELRY_TAXONOMY[selectedCategory] || [])
    )
    setSubCategory((prev) =>
      prev.filter((selectedSubCategory) => allowedSubCategories.has(selectedSubCategory))
    )
  }, [category])

  const applyFilter = () => {
    let productsCopy = products.slice()

    if (showSearch && search) {
      productsCopy = productsCopy.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase())
      )
    }

    if (category.length > 0) {
      productsCopy = productsCopy.filter((item) => category.includes(item.category))
    }

    if (subCategory.length > 0) {
      productsCopy = productsCopy.filter((item) => subCategory.includes(item.subCategory))
    }

    switch (sortType) {
      case 'low-high':
        productsCopy = productsCopy.sort((a, b) => a.price - b.price)
        break
      case 'high-low':
        productsCopy = productsCopy.sort((a, b) => b.price - a.price)
        break
      case 'newest':
        productsCopy = productsCopy.sort((a, b) => (b.date || 0) - (a.date || 0))
        break
      default:
        break
    }

    setFilterProducts(productsCopy)
  }

  useEffect(() => {
    applyFilter()
  }, [products, category, subCategory, search, showSearch, sortType])

  const activeFilterCount = category.length + subCategory.length

  // Filter content (shared between desktop sidebar and mobile bottom sheet)
  const FilterContent = () => (
    <>
      {/* Category filter */}
      <div className='mb-5'>
        <p className='mb-3 text-sm font-semibold text-gray-800 uppercase tracking-wide'>Category</p>
        <div className='flex flex-col gap-2 text-sm text-gray-700'>
          {JEWELRY_CATEGORIES.map((categoryOption) => (
            <label className='flex items-center gap-3 cursor-pointer py-1' key={categoryOption}>
              <input
                className='w-4 h-4 accent-black'
                type='checkbox'
                value={categoryOption}
                checked={category.includes(categoryOption)}
                onChange={() => toggleCategory(categoryOption)}
              />
              <span>{categoryOption}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Subcategory filter */}
      <div>
        <p className='mb-3 text-sm font-semibold text-gray-800 uppercase tracking-wide'>Sub Category</p>
        {category.length === 0 ? (
          <p className='text-xs text-gray-400'>Select a category to view sub categories.</p>
        ) : (
          category.map((selectedCategory) => (
            <div className='mb-4' key={selectedCategory}>
              <p className='text-xs font-semibold text-gray-400 uppercase mb-2'>
                {selectedCategory}
              </p>
              <div className='flex flex-col gap-2 text-sm text-gray-700'>
                {(JEWELRY_TAXONOMY[selectedCategory] || []).map((subCategoryOption) => (
                  <label className='flex items-center gap-3 cursor-pointer py-1' key={`${selectedCategory}-${subCategoryOption}`}>
                    <input
                      className='w-4 h-4 accent-black'
                      type='checkbox'
                      value={subCategoryOption}
                      checked={subCategory.includes(subCategoryOption)}
                      onChange={() => toggleSubCategory(subCategoryOption)}
                    />
                    <span>{subCategoryOption}</span>
                  </label>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </>
  )

  return (
    <div className='pt-6 pb-10'>
      {/* Sticky Sort Pills */}
      <div className='sticky top-[60px] z-30 bg-white/80 backdrop-blur-md py-2 -mx-4 px-4 sm:-mx-0 sm:px-0 mb-4 border-b border-gray-100'>
        <div className='flex items-center gap-3'>
          <FilterPills
            options={SORT_OPTIONS}
            activeValue={sortType}
            onChange={setSortType}
          />
          {/* Mobile filter button */}
          {isMobile && (
            <button
              type='button'
              className='pill-btn relative flex-shrink-0'
              onClick={() => setShowMobileFilter(true)}
            >
              <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                <line x1='4' y1='21' x2='4' y2='14' /><line x1='4' y1='10' x2='4' y2='3' />
                <line x1='12' y1='21' x2='12' y2='12' /><line x1='12' y1='8' x2='12' y2='3' />
                <line x1='20' y1='21' x2='20' y2='16' /><line x1='20' y1='12' x2='20' y2='3' />
                <line x1='1' y1='14' x2='7' y2='14' /><line x1='9' y1='8' x2='15' y2='8' />
                <line x1='17' y1='16' x2='23' y2='16' />
              </svg>
              Filter
              {activeFilterCount > 0 && (
                <span className='w-5 h-5 rounded-full bg-black text-white text-[10px] flex items-center justify-center'>
                  {activeFilterCount}
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      <div className='flex flex-col sm:flex-row gap-1 sm:gap-8'>
        {/* Desktop Filter Sidebar */}
        <div className='min-w-60 hidden sm:block'>
          <p
            onClick={() => setShowFilter(!showFilter)}
            className='my-2 text-lg font-semibold flex items-center cursor-pointer gap-2'
          >
            FILTERS
            {activeFilterCount > 0 && (
              <span className='text-xs bg-black text-white px-2 py-0.5 rounded-full'>{activeFilterCount}</span>
            )}
          </p>
          <div className='glass-card-solid p-4 mt-3'>
            <FilterContent />
          </div>
        </div>

        {/* Products Grid */}
        <div className='flex-1'>
          <div className='flex justify-between items-center text-base sm:text-2xl mb-4'>
            <Title text1={'ALL'} text2={'COLLECTION'} />
            {/* Desktop sort */}
            <select
              onChange={(e) => setSortType(e.target.value)}
              value={sortType}
              className='hidden sm:block border border-gray-200 text-sm px-3 py-2 rounded-lg outline-none bg-white'
            >
              <option value='relevant'>Sort by: Relevant</option>
              <option value='low-high'>Low to High</option>
              <option value='high-low'>High to Low</option>
              <option value='newest'>Newest First</option>
            </select>
          </div>

          {isLoading ? (
            <ProductCardSkeletonGrid count={8} />
          ) : filterProducts.length === 0 ? (
            <div className='text-center py-20'>
              <svg width='48' height='48' viewBox='0 0 24 24' fill='none' stroke='#d1d5db' strokeWidth='1.5' className='mx-auto mb-4'>
                <circle cx='11' cy='11' r='8' /><line x1='21' y1='21' x2='16.65' y2='16.65' />
              </svg>
              <p className='text-gray-400 text-sm'>No products found matching your filters.</p>
              <button
                onClick={() => { setCategory([]); setSubCategory([]); setSortType('relevant') }}
                className='mt-4 btn-outline btn-sm'
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 gap-y-6'>
              {filterProducts.map((item, index) => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.03 }}
                >
                  <ProductItem
                    name={item.name}
                    id={item._id}
                    price={item.price}
                    image={item.image}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filter Bottom Sheet */}
      <BottomSheet
        isOpen={showMobileFilter}
        onClose={() => setShowMobileFilter(false)}
        title='Filters'
      >
        <FilterContent />
        <div className='sticky bottom-0 pt-4 mt-4 border-t bg-white'>
          <button
            className='btn-primary w-full'
            onClick={() => setShowMobileFilter(false)}
          >
            Apply Filters
            {activeFilterCount > 0 && ` (${activeFilterCount})`}
          </button>
        </div>
      </BottomSheet>
    </div>
  )
}

export default Collection