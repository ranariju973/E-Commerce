import React, { useContext } from 'react'
import { Link } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext'
import { getCardImage } from '../utils/cloudinaryHelper'

const ProductItem = ({ id, image, name, price }) => {

    const { currency } = useContext(ShopContext)

  return (
    <Link className='group text-gray-700 cursor-pointer block' to={`/product/${id}`}>
        <div className='product-image-wrapper'>
            <img
              src={getCardImage(image[0])}
              alt={name}
              loading='lazy'
            />
        </div>
        <div className='pt-3 pb-1'>
          <p className='text-sm leading-snug line-clamp-2 group-hover:text-black transition'>{name}</p>
          <p className='text-sm font-semibold mt-1'>{currency}{price}</p>
        </div>
    </Link>
  )
}

export default ProductItem