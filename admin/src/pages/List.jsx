import axios from 'axios'
import React, { useEffect } from 'react'
import { backendUrl } from '../App'
import { toast } from 'react-toastify'
import { currency } from '../App'

const List = ({ token }) => {

  const [list, setList] = React.useState([])

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
    }
  }

  const removeProduct = async (id) => {
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
    }
  }


  useEffect(() => {
    fetchList()
  }, [])

  return (
    <>
      <p className='mb-2'>All Products</p>
      <div className='flex flex-col gap-2'>
        {/* -------------- List Table title ------------- */}
        <div className='hidden md:grid grid-cols-[1fr_3fr_1fr_1fr_1fr] items-center py-1 px-2 border bg-gray-100 text-sm'>
          <b>Image</b>
          <b>Name</b>
          <b>Category</b>
          <b>Price</b>
          <b className='text-center'>Actions</b>
        </div>

        {/* ------------ Product List ------------- */}
        {
          list.map((item, index) => (
            <div className='grid grid-cols-[1fr_3fr_1fr] md:grid-cols-[1fr_3fr_1fr_1fr_1fr] items-center gap-2 py-1 px-2 border text-sm' key={index}>
              <img className='w-12' src={item.image[0]} alt={item.name}/>
              <p>{item.name}</p>
              <p>{item.category}</p>
              <p>{currency} {item.price}</p>
              <button
                type='button'
                onClick={() => removeProduct(item._id)}
                className='justify-self-end md:justify-self-center cursor-pointer text-xs md:text-sm bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded'
              >
                Delete
              </button>
            </div>
          ) )
        }
      </div>
    </>
  )
}

export default List