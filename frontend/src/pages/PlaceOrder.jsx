import React, { useContext } from 'react'
import Title from '../components/Title'
import CartTotal from '../components/CartTotal'
import { assets } from '../assets/assets'
import { ShopContext } from '../context/ShopContext'

const PlaceOrder = () => {


  const [method, setMethod] = React.useState('cod')

  const {navigate} = useContext(ShopContext)

  const inputClass = 'w-full rounded-md border border-gray-300 px-3.5 py-2 text-sm outline-none transition focus:border-black'

  const getPaymentClass = (value) =>
    `flex w-full items-center justify-between rounded-md border px-3 py-2.5 transition ${
      method === value ? 'border-black bg-gray-50' : 'border-gray-300 hover:border-gray-400'
    }`

  return (
    <div className='border-t pt-6 sm:pt-12'>
      <div className='grid min-h-[80vh] grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_420px] lg:gap-8'>
        {/* -------------------- left side -------------------- */}
        <div className='rounded-xl border border-gray-200 bg-white p-4 sm:p-6'>
          <div className='text-xl sm:text-2xl whitespace-nowrap'>
            <Title text1={'DELIVERY'} text2={'INFORMATION'}/>
          </div>

          <div className='mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2'>
            <input className={inputClass} type='text' placeholder='First name'/>
            <input className={inputClass} type='text' placeholder='Last name'/>
          </div>

          <div className='mt-3 grid grid-cols-1 gap-3'>
            <input className={inputClass} type='email' placeholder='Email Address'/>
            <input className={inputClass} type='text' placeholder='Address'/>
          </div>

          <div className='mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2'>
            <input className={inputClass} type='text' placeholder='City'/>
            <input className={inputClass} type='text' placeholder='State'/>
          </div>

          <div className='mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2'>
            <input className={inputClass} type='number' placeholder='Pincode'/>
            <input className={inputClass} type='text' placeholder='Country'/>
          </div>

          <input className={`${inputClass} mt-3`} type='number' placeholder='Phone Number'/>
        </div>

        {/* --------------------- right side --------------------  */}
        <div className='space-y-6'>

          <div className='rounded-xl border border-gray-200 bg-white p-4 sm:p-6'>
            <CartTotal/>
          </div>

          <div className='rounded-xl border border-gray-200 bg-white p-4 sm:p-6'>
            <div className='text-xl sm:text-2xl'>
              <Title text1={'PAYMENT'} text2={'METHOD'}/>
            </div>

            <div className='mt-3 flex flex-col gap-3'>
              <button type='button' onClick={() => setMethod('stripe')} className={getPaymentClass('stripe')}>
                <div className='flex items-center gap-3'>
                  <p className={`h-3.5 w-3.5 rounded-full border ${method === 'stripe' ? 'border-green-400 bg-green-400' : 'border-gray-400'}`}></p>
                  <p className='text-sm text-gray-700'>Pay with Stripe</p>
                </div>
                <img className='h-5' src={assets.stripe_logo} alt='Stripe'/>
              </button>

              <button type='button' onClick={() => setMethod('razorpay')} className={getPaymentClass('razorpay')}>
                <div className='flex items-center gap-3'>
                  <p className={`h-3.5 w-3.5 rounded-full border ${method === 'razorpay' ? 'border-green-400 bg-green-400' : 'border-gray-400'}`}></p>
                  <p className='text-sm text-gray-700'>Pay with Razorpay</p>
                </div>
                <img className='h-5' src={assets.razorpay_logo} alt='Razorpay'/>
              </button>
              <button type='button' onClick={() => setMethod('cod')} className={getPaymentClass('cod')}>
                <div className='flex items-center gap-3'>
                  <p className={`h-3.5 w-3.5 rounded-full border ${method === 'cod' ? 'border-green-400 bg-green-400' : 'border-gray-400'}`}></p>
                  <p className='text-sm text-gray-700'>Cash on Delivery</p>
                </div>
                <p className='text-xs font-medium text-gray-500'>Offline</p>
              </button>
            </div>

            <button
              type='button'
              onClick={() => navigate('/orders')}
              className='mt-6 w-full rounded-md bg-black px-6 py-3 text-sm text-white transition hover:bg-gray-800'
            >
              PLACE ORDER
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PlaceOrder