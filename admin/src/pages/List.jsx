import axios from 'axios'
import React, { useEffect, useState, useMemo } from 'react'
import { backendUrl, currency } from '../App'
import { toast } from 'react-toastify'
import { JEWELRY_CATEGORIES, JEWELRY_TAXONOMY } from '../constants/jewelryTaxonomy'

const List = ({ token }) => {
  const [list, setList] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [deletingId, setDeletingId] = useState(null)

  // Edit state
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({ name: '', description: '', price: '', category: '', subCategory: '', bestseller: false })
  const [editImages, setEditImages] = useState({ image1: false, image2: false, image3: false, image4: false })
  const [existingImages, setExistingImages] = useState([])
  const [isSaving, setIsSaving] = useState(false)

  const availableSubCategories = useMemo(() => JEWELRY_TAXONOMY[editForm.category] || [], [editForm.category])

  const fetchList = async () => {
    try {
      const response = await axios.get(backendUrl + '/api/product/list')
      if (response.data.success) {
        setList(response.data.products)
      } else {
        toast.error(response.data.message || 'Failed to fetch list')
      }
    } catch (error) {
      console.error('Error fetching list:', error)
      toast.error('Failed to fetch list')
    } finally {
      setIsLoading(false)
    }
  }

  const removeProduct = async (id) => {
    if (deletingId) return
    setDeletingId(id)
    try {
      const response = await axios.delete(`${backendUrl}/api/product/remove/${id}`, {
        headers: { token }
      })
      if (response.data.success) {
        toast.success(response.data.message || 'Product removed successfully')
        await fetchList()
      } else {
        toast.error(response.data.message || 'Failed to remove product')
      }
    } catch (error) {
      console.error('Error removing product:', error)
      toast.error('Failed to remove product')
    } finally {
      setDeletingId(null)
    }
  }

  const startEdit = (item) => {
    setEditingId(item._id)
    setEditForm({
      name: item.name,
      description: item.description || '',
      price: item.price,
      category: item.category,
      subCategory: item.subCategory,
      bestseller: item.bestseller || false,
    })
    setEditImages({ image1: false, image2: false, image3: false, image4: false })
    setExistingImages(item.image || [])
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditForm({ name: '', description: '', price: '', category: '', subCategory: '', bestseller: false })
    setEditImages({ image1: false, image2: false, image3: false, image4: false })
    setExistingImages([])
  }

  const handleCategoryChange = (e) => {
    const newCat = e.target.value
    const subs = JEWELRY_TAXONOMY[newCat] || []
    setEditForm(prev => ({ ...prev, category: newCat, subCategory: subs[0] || '' }))
  }

  const handleImageChange = (key, file) => {
    setEditImages(prev => ({ ...prev, [key]: file }))
  }

  const saveEdit = async () => {
    if (!editForm.name.trim()) return toast.error('Name cannot be empty')
    if (!editForm.price || Number(editForm.price) <= 0) return toast.error('Price must be greater than 0')

    setIsSaving(true)
    try {
      const formData = new FormData()
      formData.append('name', editForm.name)
      formData.append('description', editForm.description)
      formData.append('price', editForm.price)
      formData.append('category', editForm.category)
      formData.append('subCategory', editForm.subCategory)
      formData.append('bestseller', editForm.bestseller)

      if (editImages.image1) formData.append('image1', editImages.image1)
      if (editImages.image2) formData.append('image2', editImages.image2)
      if (editImages.image3) formData.append('image3', editImages.image3)
      if (editImages.image4) formData.append('image4', editImages.image4)

      const response = await axios.put(`${backendUrl}/api/product/update/${editingId}`, formData, { headers: { token } })

      if (response.data.success) {
        toast.success('Product updated')
        cancelEdit()
        await fetchList()
      } else {
        toast.error(response.data.message || 'Failed to update')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update product')
    } finally {
      setIsSaving(false)
    }
  }

  useEffect(() => {
    fetchList()
  }, [])

  return (
    <div className='animate-admin-fade-in'>
      <div className='flex items-center justify-between mb-6'>
        <div>
          <h2 className='text-xl font-bold text-white'>Products</h2>
          <p className='text-sm text-gray-500 mt-1'>{list.length} products in your store</p>
        </div>
      </div>

      {isLoading ? (
        <div className='flex items-center justify-center py-20'>
          <svg className='animate-spin text-gray-500' width='32' height='32' viewBox='0 0 24 24' fill='none'>
            <circle cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='3' opacity='0.15'/>
            <path d='M4 12a8 8 0 0 1 8-8' stroke='currentColor' strokeWidth='3' strokeLinecap='round'/>
          </svg>
        </div>
      ) : list.length === 0 ? (
        <div className='glass-card p-12 text-center'>
          <svg width='48' height='48' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1' className='mx-auto mb-4 text-gray-600'>
            <rect x='3' y='3' width='18' height='18' rx='2' ry='2'/><circle cx='8.5' cy='8.5' r='1.5'/><polyline points='21 15 16 10 5 21'/>
          </svg>
          <p className='text-gray-500'>No products yet. Add your first product!</p>
        </div>
      ) : (
        <>
          {/* Desktop Table Header */}
          <div className='hidden md:grid grid-cols-[60px_2fr_1fr_1fr_120px] items-center gap-4 px-5 py-3 text-xs uppercase tracking-wider text-gray-500 font-semibold border-b border-white/5 mb-2'>
            <span>Image</span>
            <span>Name</span>
            <span>Category</span>
            <span>Price</span>
            <span className='text-center'>Actions</span>
          </div>

          <div className='flex flex-col gap-3'>
            {list.map((item, index) => (
              <div
                key={item._id || index}
                className='glass-card glass-card-hover animate-admin-fade-in'
                style={{ animationDelay: `${Math.min(index * 0.03, 0.3)}s` }}
              >
                {editingId === item._id ? (
                  /* ========== EDIT MODE ========== */
                  <div className='p-5 animate-admin-scale-in'>
                    <div className='flex items-center gap-3 mb-4 pb-3 border-b border-white/5'>
                      <img className='w-14 h-14 object-cover rounded-lg flex-shrink-0' src={item.image[0]} alt={item.name} />
                      <p className='text-sm font-semibold text-white'>Editing Product</p>
                    </div>
                    <div className='flex flex-col gap-4'>
                      
                      {/* Image Upload Area */}
                      <div>
                        <label className='admin-label'>Images <span className='text-xs text-gray-500 ml-2 font-normal'>(Uploading new images will replace existing ones)</span></label>
                        <div className='flex gap-3 flex-wrap mt-2'>
                          {[
                            { key: 'image1', idx: 0 },
                            { key: 'image2', idx: 1 },
                            { key: 'image3', idx: 2 },
                            { key: 'image4', idx: 3 },
                          ].map((imgObj) => (
                            <label key={imgObj.key} className='admin-upload cursor-pointer' htmlFor={imgObj.key}>
                              {editImages[imgObj.key] ? (
                                <img src={URL.createObjectURL(editImages[imgObj.key])} alt='Preview' />
                              ) : existingImages[imgObj.idx] ? (
                                <img src={existingImages[imgObj.idx]} alt='Existing' className='opacity-70' />
                              ) : (
                                <svg width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.5' opacity='0.3'>
                                  <rect x='3' y='3' width='18' height='18' rx='2' ry='2'/><circle cx='8.5' cy='8.5' r='1.5'/><polyline points='21 15 16 10 5 21'/>
                                </svg>
                              )}
                              <input onChange={(e) => handleImageChange(imgObj.key, e.target.files[0])} type='file' id={imgObj.key} hidden accept='image/*' />
                            </label>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className='admin-label'>Name</label>
                        <input className='w-full px-3 py-2.5 text-sm' value={editForm.name} onChange={(e) => setEditForm(f => ({ ...f, name: e.target.value }))} />
                      </div>
                      <div>
                        <label className='admin-label'>Description</label>
                        <textarea className='w-full px-3 py-2.5 text-sm min-h-[80px] resize-y' value={editForm.description} onChange={(e) => setEditForm(f => ({ ...f, description: e.target.value }))} />
                      </div>
                      <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
                        <div>
                          <label className='admin-label'>Price (₹)</label>
                          <input className='w-full px-3 py-2.5 text-sm' type='number' value={editForm.price} onChange={(e) => setEditForm(f => ({ ...f, price: e.target.value }))} />
                        </div>
                        <div>
                          <label className='admin-label'>Category</label>
                          <select className='w-full px-3 py-2.5 text-sm' value={editForm.category} onChange={handleCategoryChange}>
                            {JEWELRY_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className='admin-label'>Sub Category</label>
                          <select className='w-full px-3 py-2.5 text-sm' value={editForm.subCategory} onChange={(e) => setEditForm(f => ({ ...f, subCategory: e.target.value }))}>
                            {availableSubCategories.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                      </div>
                      <div className='flex items-center gap-3'>
                        <label className='relative inline-flex items-center cursor-pointer'>
                          <input type='checkbox' className='sr-only peer' checked={editForm.bestseller} onChange={() => setEditForm(f => ({ ...f, bestseller: !f.bestseller }))} />
                          <div className="w-10 h-5 bg-gray-700 rounded-full peer peer-checked:bg-white peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-300 peer-checked:after:bg-black after:rounded-full after:h-4 after:w-4 after:transition-all" />
                        </label>
                        <span className='text-sm text-gray-400'>Best Seller</span>
                      </div>
                      <div className='flex gap-3 pt-2'>
                        <button onClick={saveEdit} disabled={isSaving} className='admin-btn admin-btn-primary admin-btn-sm'>
                          {isSaving ? (
                            <svg className='animate-spin' width='14' height='14' viewBox='0 0 24 24' fill='none'><circle cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='3' opacity='0.25'/><path d='M4 12a8 8 0 0 1 8-8' stroke='currentColor' strokeWidth='3' strokeLinecap='round'/></svg>
                          ) : 'Save'}
                        </button>
                        <button onClick={cancelEdit} className='admin-btn admin-btn-outline admin-btn-sm'>Cancel</button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* ========== VIEW MODE ========== */
                  <div className='p-4 md:p-5'>
                    {/* Mobile: Card Layout */}
                    <div className='flex md:hidden gap-4'>
                      <img className='w-16 h-16 object-cover rounded-lg flex-shrink-0' src={item.image[0]} alt={item.name} />
                      <div className='flex-1 min-w-0'>
                        <p className='text-sm font-semibold text-white truncate'>{item.name}</p>
                        <p className='text-xs text-gray-500 mt-1'>{item.category}</p>
                        <p className='text-sm font-bold text-white mt-1'>{currency} {item.price}</p>
                        <div className='flex items-center gap-2 mt-3'>
                          <button onClick={() => startEdit(item)} className='admin-btn admin-btn-outline admin-btn-sm'>
                            <svg width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'><path d='M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7'/><path d='M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z'/></svg>
                            Edit
                          </button>
                          <button onClick={() => removeProduct(item._id)} disabled={deletingId === item._id} className='admin-btn admin-btn-danger admin-btn-sm'>
                            {deletingId === item._id ? (
                              <svg className='animate-spin' width='14' height='14' viewBox='0 0 24 24' fill='none'><circle cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='3' opacity='0.25'/><path d='M4 12a8 8 0 0 1 8-8' stroke='currentColor' strokeWidth='3' strokeLinecap='round'/></svg>
                            ) : 'Delete'}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Desktop: Row Layout */}
                    <div className='hidden md:grid grid-cols-[60px_2fr_1fr_1fr_120px] items-center gap-4'>
                      <img className='w-12 h-12 object-cover rounded-lg' src={item.image[0]} alt={item.name} />
                      <p className='text-sm text-gray-200 truncate'>{item.name}</p>
                      <span className='admin-badge admin-badge-neutral'>{item.category}</span>
                      <p className='text-sm font-semibold text-white'>{currency} {item.price}</p>
                      <div className='flex items-center gap-2 justify-center'>
                        <button onClick={() => startEdit(item)} className='admin-btn admin-btn-outline admin-btn-sm' title='Edit'>
                          <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'><path d='M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7'/><path d='M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z'/></svg>
                        </button>
                        <button onClick={() => removeProduct(item._id)} disabled={deletingId === item._id} className='admin-btn admin-btn-danger admin-btn-sm' title='Delete'>
                          {deletingId === item._id ? (
                            <svg className='animate-spin' width='14' height='14' viewBox='0 0 24 24' fill='none'><circle cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='3' opacity='0.25'/><path d='M4 12a8 8 0 0 1 8-8' stroke='currentColor' strokeWidth='3' strokeLinecap='round'/></svg>
                          ) : (
                            <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'><polyline points='3 6 5 6 21 6'/><path d='M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2'/></svg>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default List