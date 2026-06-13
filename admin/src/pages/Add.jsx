import React, { useMemo, useState } from 'react'
import { assets } from '../assets/assets'
import axios from 'axios'
import { backendUrl } from '../App'
import { toast } from 'react-toastify'
import { JEWELRY_CATEGORIES, JEWELRY_TAXONOMY } from '../constants/jewelryTaxonomy'

const Add = ({ token }) => {
  const defaultCategory = JEWELRY_CATEGORIES[0]
  const defaultSubCategory = JEWELRY_TAXONOMY[defaultCategory][0]

  const [image1, setImage1] = useState(false)
  const [image2, setImage2] = useState(false)
  const [image3, setImage3] = useState(false)
  const [image4, setImage4] = useState(false)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState(defaultCategory)
  const [subCategory, setSubCategory] = useState(defaultSubCategory)
  const [isBestSeller, setIsBestSeller] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const availableSubCategories = useMemo(() => JEWELRY_TAXONOMY[category] || [], [category])

  const onCategoryChange = (e) => {
    const selectedCategory = e.target.value
    const nextSubCategories = JEWELRY_TAXONOMY[selectedCategory] || []
    setCategory(selectedCategory)
    setSubCategory(nextSubCategories[0] || '')
  }

  const onSubmitHandler = async (e) => {
    e.preventDefault()
    if (isSubmitting) return

    try {
      if (!JEWELRY_CATEGORIES.includes(category)) {
        toast.error('Invalid category selected')
        return
      }
      if (!availableSubCategories.includes(subCategory)) {
        toast.error('Please choose a valid sub category for the selected category')
        return
      }

      setIsSubmitting(true)
      const formData = new FormData()
      image1 && formData.append('image1', image1)
      image2 && formData.append('image2', image2)
      image3 && formData.append('image3', image3)
      image4 && formData.append('image4', image4)

      formData.append('name', name)
      formData.append('description', description)
      formData.append('price', price)
      formData.append('category', category)
      formData.append('subCategory', subCategory)
      formData.append('bestseller', isBestSeller)

      const response = await axios.post(backendUrl + '/api/product/add', formData, {
        headers: { token }
      })

      if (response.data.success) {
        toast.success(response.data.message || 'Product added successfully')
        setName('')
        setDescription('')
        setPrice('')
        setIsBestSeller(false)
        setCategory(defaultCategory)
        setSubCategory(defaultSubCategory)
        setImage1(false)
        setImage2(false)
        setImage3(false)
        setImage4(false)
      } else {
        toast.error(response.data.message || 'Failed to add product')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Error uploading product')
    } finally {
      setIsSubmitting(false)
    }
  }

  const images = [
    { state: image1, setter: setImage1, id: 'image1' },
    { state: image2, setter: setImage2, id: 'image2' },
    { state: image3, setter: setImage3, id: 'image3' },
    { state: image4, setter: setImage4, id: 'image4' },
  ]

  return (
    <div className='animate-admin-fade-in max-w-3xl'>
      <h2 className='text-xl font-bold text-white mb-1'>Add Product</h2>
      <p className='text-sm text-gray-500 mb-6'>Fill in the details to add a new product to your store.</p>

      <form onSubmit={onSubmitHandler} className='flex flex-col gap-6'>
        {/* Image Upload */}
        <div className='glass-card p-5'>
          <label className='admin-label'>Product Images</label>
          <div className='flex gap-3 flex-wrap'>
            {images.map(({ state, setter, id }) => (
              <label key={id} className='admin-upload cursor-pointer' htmlFor={id}>
                {state ? (
                  <img src={URL.createObjectURL(state)} alt='Preview' />
                ) : (
                  <svg width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.5' opacity='0.3'>
                    <rect x='3' y='3' width='18' height='18' rx='2' ry='2'/><circle cx='8.5' cy='8.5' r='1.5'/><polyline points='21 15 16 10 5 21'/>
                  </svg>
                )}
                <input onChange={(e) => setter(e.target.files[0])} type='file' id={id} hidden accept='image/*' />
              </label>
            ))}
          </div>
        </div>

        {/* Product Details */}
        <div className='glass-card p-5 flex flex-col gap-5'>
          <div>
            <label className='admin-label'>Product Name</label>
            <input onChange={(e) => setName(e.target.value)} value={name} className='w-full px-4 py-3 text-sm' type='text' placeholder='Enter product name' required />
          </div>

          <div>
            <label className='admin-label'>Description</label>
            <textarea onChange={(e) => setDescription(e.target.value)} value={description} className='w-full px-4 py-3 text-sm min-h-[100px] resize-y' placeholder='Enter product description' required />
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            <div>
              <label className='admin-label'>Category</label>
              <select onChange={onCategoryChange} value={category} className='w-full px-4 py-3 text-sm'>
                {JEWELRY_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className='admin-label'>Sub Category</label>
              <select onChange={(e) => setSubCategory(e.target.value)} value={subCategory} className='w-full px-4 py-3 text-sm'>
                {availableSubCategories.map((sub) => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 items-end'>
            <div>
              <label className='admin-label'>Price (₹)</label>
              <input onChange={(e) => setPrice(e.target.value)} value={price} className='w-full px-4 py-3 text-sm' type='number' placeholder='0.00' required />
            </div>
            <div className='flex items-center gap-3 py-3'>
              <label className='relative inline-flex items-center cursor-pointer'>
                <input type='checkbox' className='sr-only peer' checked={isBestSeller} onChange={() => setIsBestSeller(prev => !prev)} id='bestseller' />
                <div className="w-10 h-5 bg-gray-700 rounded-full peer peer-checked:bg-white peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-300 peer-checked:after:bg-black after:rounded-full after:h-4 after:w-4 after:transition-all" />
              </label>
              <label htmlFor='bestseller' className='text-sm text-gray-400 cursor-pointer'>Best Seller</label>
            </div>
          </div>
        </div>

        <button className='admin-btn admin-btn-primary w-full sm:w-auto self-start' type='submit' disabled={isSubmitting}>
          {isSubmitting ? (
            <svg className='animate-spin' width='20' height='20' viewBox='0 0 24 24' fill='none'><circle cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='3' opacity='0.25'/><path d='M4 12a8 8 0 0 1 8-8' stroke='currentColor' strokeWidth='3' strokeLinecap='round'/></svg>
          ) : (
            <>
              <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'><line x1='12' y1='5' x2='12' y2='19'/><line x1='5' y1='12' x2='19' y2='12'/></svg>
              Add Product
            </>
          )}
        </button>
      </form>
    </div>
  )
}

export default Add