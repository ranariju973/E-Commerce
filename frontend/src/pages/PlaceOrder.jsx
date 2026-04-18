import React, { useContext } from 'react'
import Title from '../components/Title'
import CartTotal from '../components/CartTotal'
import { assets } from '../assets/assets'
import { ShopContext } from '../context/ShopContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const PlaceOrder = () => {


  const [method, setMethod] = React.useState('cod')


  const {navigate, backendUrl, token, setToken, cartItems, setCartItems, getCartAmount, delivery_fee, products } = useContext(ShopContext)

  const handleAuthFailure = (error) => {
    if (!axios.isAxiosError(error) || error.response?.status !== 401) {
      return false
    }

    setToken('')
    localStorage.removeItem('token')
    setCartItems({})
    toast.error('Session expired. Please log in again.')
    navigate('/login')
    return true
  }

  const [formData, setFormData] = React.useState({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    country: '',
    phone: ''
  })

  const onChangeHandler = (event) => {
    const name = event.target.name
    const value = event.target.value
    setFormData((data) => ({ ...data, [name]: value }))
  }

  const onSubmitHandler = async (event) => {
    event.preventDefault()
    try {
      let orderItems = []
      for (const items in cartItems) {
        for (const item in cartItems[items]) {
          if (cartItems[items][item] > 0) {
            const itemInfo = structuredClone(products.find((product) => product._id === items))
            if (itemInfo) {
              itemInfo.size = item
              itemInfo.quantity = cartItems[items][item]
              orderItems.push(itemInfo)
            }
          }
        }
      }

      let orderData = {
        items: orderItems,
        amount: getCartAmount() + delivery_fee,
        address: formData,
      }

      switch (method) {
        // api calls for cod
        case 'cod': {
          const authToken = token || localStorage.getItem('token')
          if (!authToken) {
            toast.error('Please log in to place your order')
            navigate('/login')
            return
          }

          const response = await axios.post(`${backendUrl}/api/order/place`, orderData, {
            headers: {
              token: authToken
            }
          })

          if (response.data.success) {
            setCartItems({})
            navigate('/orders')
          } else {
            toast.error(response.data.message || 'Failed to place order')
          }
          break
        }

        default:
          toast.error('Selected payment method is not available yet')
          break
      }

    } catch (error) {
      if (handleAuthFailure(error)) {
        return
      }

      console.log(error)
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || 'Failed to place order')
        return
      }

      toast.error('Failed to place order')
    }

  }

  const inputClass = 'w-full rounded-md border border-gray-300 px-3.5 py-2 text-sm outline-none transition focus:border-black'

  const getPaymentClass = (value) =>
    `flex w-full items-center justify-between rounded-md border px-3 py-2.5 transition ${
      method === value ? 'border-black bg-gray-50' : 'border-gray-300 hover:border-gray-400'
    }`

  return (
    <form className='border-t pt-6 sm:pt-12' onSubmit={onSubmitHandler}>
      <div className='grid min-h-[80vh] grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_420px] lg:gap-8'>
        {/* -------------------- left side -------------------- */}
        <div className='rounded-xl border border-gray-200 bg-white p-4 sm:p-6'>
          <div className='text-xl sm:text-2xl whitespace-nowrap'>
            <Title text1={'DELIVERY'} text2={'INFORMATION'}/>
          </div>

          <div className='mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2'>
                  <input required onChange={onChangeHandler} name='firstName' value={formData.firstName} className={inputClass} type='text' placeholder='First name'/>
                  <input required onChange={onChangeHandler} name='lastName' value={formData.lastName} className={inputClass} type='text' placeholder='Last name'/>
          </div>

          <div className='mt-3 grid grid-cols-1 gap-3'>
            <input required onChange={onChangeHandler} name='email' value={formData.email} className={inputClass} type='email' placeholder='Email Address'/>
            <input required onChange={onChangeHandler} name='address' value={formData.address} className={inputClass} type='text' placeholder='Address'/>
          </div>

          <div className='mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2'>
            <input required onChange={onChangeHandler} name='city' value={formData.city} className={inputClass} type='text' placeholder='City'/>
            <input required onChange={onChangeHandler} name='state' value={formData.state} className={inputClass} type='text' placeholder='State'/>
          </div>

          <div className='mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2'>
            <input required onChange={onChangeHandler} name='pincode' value={formData.pincode} className={inputClass} type='number' placeholder='Pincode'/>
            <input required onChange={onChangeHandler} name='country' value={formData.country} className={inputClass} type='text' placeholder='Country'/>
          </div>

          <input required onChange={onChangeHandler} name='phone' value={formData.phone} className={`${inputClass} mt-3`} type='number' placeholder='Phone Number'/>
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
              <button type='button' onClick={() => toast.error('This payment option is not available. Please choose Cash on Delivery.')} className={getPaymentClass('stripe')}>
                <div className='flex items-center gap-3'>
                  <p className={`h-3.5 w-3.5 rounded-full border ${method === 'stripe' ? 'border-green-400 bg-green-400' : 'border-gray-400'}`}></p>
                  <p className='text-sm text-gray-700'>Pay with Stripe</p>
                </div>
                <img className='h-5' src={assets.stripe_logo} alt='Stripe'/>
              </button>

              <button type='button' onClick={() => toast.error('This payment option is not available. Please choose Cash on Delivery.')} className={getPaymentClass('razorpay')}>
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
              type='submit'
              className='mt-6 w-full rounded-md bg-black px-6 py-3 text-sm text-white transition hover:bg-gray-800'
            >
              PLACE ORDER
            </button>
          </div>
        </div>
      </div>
    </form>
  )
}

export default PlaceOrder