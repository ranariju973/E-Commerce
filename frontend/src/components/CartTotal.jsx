import React, { useContext } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from './Title'

const CartTotal = ({ subtotal, titleText1 = 'CART', titleText2 = 'TOTAL' }) => {

    const {currency, delivery_fee, getCartAmount} = useContext(ShopContext)
    const resolvedSubtotal = typeof subtotal === 'number' ? subtotal : getCartAmount()
    const totalAmount = resolvedSubtotal === 0 ? 0 : resolvedSubtotal + delivery_fee

  return (
    <div className='w-full'>
        <div className='text-2xl '>
            <Title text1={titleText1} text2={titleText2}/>
        </div>

        <div className='flex flex-col gap-2 mt-2 text-sm'>
            <div className='flex justify-between'>
                <p>Subtotal</p>
                <p>{currency}{resolvedSubtotal}.00</p>
            </div>
            <hr/>
            <div className='flex justify-between'>
                <p>Shipping Fee</p>
                <p>{currency}{delivery_fee}.00</p>
            </div>
            <hr/>
            <div className='flex justify-between'>
                <b>Total</b>
                <b>{currency} {totalAmount}.00</b>
            </div>
        </div>
    </div>
  )
}

export default CartTotal
