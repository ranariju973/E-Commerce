import React, { useContext } from 'react'
import { useLocation } from 'react-router-dom'
import Title from '../components/Title'
import CartTotal from '../components/CartTotal'
import { assets } from '../assets/assets'
import { ShopContext } from '../context/ShopContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { formatWeightDisplay, parseWeightInput, sanitizeWeightInput } from '../utils/weightInput'

const EMPTY_FORM_DATA = {
  firstName: '',
  lastName: '',
  email: '',
  address: '',
  city: '',
  state: '',
  pincode: '',
  country: '',
  phone: ''
}

const hasAddressData = (address = {}) => (
  Object.keys(EMPTY_FORM_DATA).some((field) => `${address?.[field] || ''}`.trim() !== '')
)

const formatAddressPreview = (address = {}) => (
  [address.city, address.state, address.country]
    .filter(Boolean)
    .join(', ') || address.address || ''
)

const PlaceOrder = () => {
  const defaultWeight = ''
  const location = useLocation()
  const initializedAddressRef = React.useRef(false)

  const [method, setMethod] = React.useState('cod')
  const [buyNowQuantity, setBuyNowQuantity] = React.useState(() => Number(location.state?.buyNowQuantity || 1))
  const [buyNowWeight, setBuyNowWeight] = React.useState(() => {
    const initialWeight = location.state?.buyNowWeight
    return initialWeight ? formatWeightDisplay(initialWeight) : defaultWeight
  })
  const [formData, setFormData] = React.useState(EMPTY_FORM_DATA)
  const [selectedAddressId, setSelectedAddressId] = React.useState('')
  const [saveAddress, setSaveAddress] = React.useState(true)
  const [isAddressFormOpen, setIsAddressFormOpen] = React.useState(false)

  const {
    navigate,
    backendUrl,
    token,
    setToken,
    cartItems,
    setCartItems,
    getCartAmount,
    delivery_fee,
    products,
    savedAddresses,
    setSavedAddresses,
    defaultAddressId,
    setDefaultAddressId
  } = useContext(ShopContext)

  const buyNowItemId = location.state?.buyNowItemId || ''
  const isBuyNowFlow = Boolean(buyNowItemId)
  const buyNowProduct = isBuyNowFlow ? products.find((product) => product._id === buyNowItemId) : null
  const hasSavedAddresses = savedAddresses.length > 0
  const selectedSavedAddress = savedAddresses.find((address) => address.id === selectedAddressId) || null

  const handleAuthFailure = (error) => {
    if (!axios.isAxiosError(error) || error.response?.status !== 401) {
      return false
    }

    setToken('')
    localStorage.removeItem('token')
    setCartItems({})
    setSavedAddresses([])
    setDefaultAddressId('')
    toast.error('Session expired. Please log in again.')
    navigate('/login')
    return true
  }

  const onChangeHandler = (event) => {
    const name = event.target.name
    const value = event.target.value
    setFormData((currentData) => ({ ...currentData, [name]: value }))
  }

  const selectSavedAddress = (addressId) => {
    const selectedAddress = savedAddresses.find((address) => address.id === addressId)
    if (!selectedAddress) {
      return
    }

    setSelectedAddressId(addressId)
    setIsAddressFormOpen(false)
    initializedAddressRef.current = true
  }

  const handleAddNewAddress = () => {
    setSelectedAddressId('')
    setFormData(EMPTY_FORM_DATA)
    setSaveAddress(true)
    setIsAddressFormOpen(true)
    initializedAddressRef.current = true
  }

  React.useEffect(() => {
    setBuyNowQuantity(Number(location.state?.buyNowQuantity || 1))
    setBuyNowWeight(location.state?.buyNowWeight ? formatWeightDisplay(location.state.buyNowWeight) : defaultWeight)
  }, [buyNowItemId, defaultWeight, location.state?.buyNowQuantity, location.state?.buyNowWeight])

  React.useEffect(() => {
    if (!hasSavedAddresses) {
      return
    }

    if (initializedAddressRef.current) {
      return
    }

    const preferredAddress = savedAddresses.find((address) => address.id === defaultAddressId) || savedAddresses[0]
    if (!preferredAddress) {
      return
    }

    setSelectedAddressId(preferredAddress.id)
    setIsAddressFormOpen(false)
    initializedAddressRef.current = true
  }, [defaultAddressId, hasSavedAddresses, savedAddresses])

  React.useEffect(() => {
    initializedAddressRef.current = false
  }, [token])

  React.useEffect(() => {
    if (!hasSavedAddresses) {
      setIsAddressFormOpen(true)
      setSelectedAddressId('')
    }
  }, [hasSavedAddresses])

  React.useEffect(() => {
    if (isBuyNowFlow && products.length > 0 && !buyNowProduct) {
      toast.error('This product is no longer available for direct checkout.')
      navigate('/collection', { replace: true })
    }
  }, [buyNowProduct, isBuyNowFlow, navigate, products.length])

  const cartOrderItems = Object.entries(cartItems).reduce((items, [itemId, cartItem]) => {
    const quantity = Number(cartItem?.quantity || 0)
    if (quantity <= 0) {
      return items
    }

    const itemInfo = products.find((product) => product._id === itemId)
    if (itemInfo) {
      items.push({
        ...structuredClone(itemInfo),
        quantity,
        weight: Number(cartItem?.weight || defaultWeight)
      })
    }

    return items
  }, [])

  const checkoutItems = isBuyNowFlow
    ? (buyNowProduct ? [{
        ...structuredClone(buyNowProduct),
        quantity: buyNowQuantity,
        weight: parseWeightInput(buyNowWeight)
      }] : [])
    : cartOrderItems

  const checkoutSubtotal = isBuyNowFlow
    ? (buyNowProduct ? buyNowProduct.price * buyNowQuantity : 0)
    : getCartAmount()

  const checkoutAmount = checkoutSubtotal === 0 ? 0 : checkoutSubtotal + delivery_fee

  const onSubmitHandler = async (event) => {
    event.preventDefault()

    try {
      if (checkoutItems.length === 0) {
        toast.error(isBuyNowFlow ? 'This product is not available for checkout.' : 'Your cart is empty.')
        return
      }

      if (checkoutItems.some((item) => !item.weight || Number(item.weight || 0) <= 0)) {
        toast.error('Please enter a gold weight greater than 0 gm')
        return
      }

      const orderAddress = isAddressFormOpen || !selectedSavedAddress ? formData : selectedSavedAddress

      if (!hasAddressData(orderAddress)) {
        toast.error('Please enter a delivery address.')
        return
      }

      const authToken = token || localStorage.getItem('token')
      if (!authToken) {
        toast.error('Please log in to place your order')
        navigate('/login')
        return
      }

      const orderData = {
        items: checkoutItems,
        amount: checkoutAmount,
        address: orderAddress,
        clearCart: !isBuyNowFlow,
        saveAddress: isAddressFormOpen ? saveAddress : true,
        selectedAddressId
      }

      switch (method) {
        case 'cod': {
          const response = await axios.post(`${backendUrl}/api/order/place`, orderData, {
            headers: {
              token: authToken
            }
          })

          if (response.data.success) {
            setSavedAddresses(response.data.savedAddresses || [])
            setDefaultAddressId(response.data.defaultAddressId || '')
            setSelectedAddressId(response.data.defaultAddressId || '')
            setIsAddressFormOpen(false)
            if (!isBuyNowFlow) {
              setCartItems({})
            }
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
  const canDecreaseBuyNowQuantity = buyNowQuantity > 1

  const getPaymentClass = (value) =>
    `flex w-full items-center justify-between rounded-md border px-3 py-2.5 transition ${
      method === value ? 'border-black bg-gray-50' : 'border-gray-300 hover:border-gray-400'
    }`

  return (
    <form className='border-t pt-6 sm:pt-12' onSubmit={onSubmitHandler}>
      <div className='grid min-h-[80vh] grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_420px] lg:gap-8'>
        <div className='rounded-xl border border-gray-200 bg-white p-4 sm:p-6'>
          <div className='text-xl whitespace-nowrap sm:text-2xl'>
            <Title text1={'DELIVERY'} text2={'INFORMATION'}/>
          </div>

          {hasSavedAddresses && (
            <div className='mb-6 rounded-xl border border-gray-200 bg-gray-50 p-4'>
              <div className='flex items-center justify-between gap-3'>
                <div>
                  <p className='text-sm font-medium text-gray-800'>Saved Addresses</p>
                  <p className='mt-1 text-xs text-gray-500'>Choose a saved address or add a new one.</p>
                </div>
                <button
                  type='button'
                  onClick={handleAddNewAddress}
                  className='rounded-md border border-black px-3 py-2 text-xs font-medium text-black transition hover:bg-black hover:text-white'
                >
                  ADD NEW
                </button>
              </div>

              <div className='mt-4 grid gap-3'>
                {savedAddresses.map((savedAddress) => {
                  const isSelected = selectedAddressId === savedAddress.id

                  return (
                    <button
                      type='button'
                      key={savedAddress.id}
                      onClick={() => selectSavedAddress(savedAddress.id)}
                      className={`rounded-lg border p-4 text-left transition ${
                        isSelected ? 'border-black bg-white shadow-sm' : 'border-gray-200 bg-white hover:border-gray-400'
                      }`}
                    >
                      <div className='flex items-start justify-between gap-3'>
                        <div>
                          <p className='text-sm font-medium text-gray-800'>
                            {[savedAddress.firstName, savedAddress.lastName].filter(Boolean).join(' ') || 'Saved Address'}
                          </p>
                          <p className='mt-1 text-sm text-gray-500'>{formatAddressPreview(savedAddress)}</p>
                          <p className='mt-1 text-sm text-gray-500'>{savedAddress.phone}</p>
                        </div>
                        <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${isSelected ? 'bg-black text-white' : 'bg-gray-100 text-gray-600'}`}>
                          {isSelected ? 'SELECTED' : 'USE'}
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {!hasSavedAddresses && (
            <p className='mb-4 mt-1 text-sm text-gray-500'>
              Add your delivery address once and we will save it for faster checkout next time.
            </p>
          )}

          {isAddressFormOpen && (
            <>
              <div className='mb-4 rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-600'>
                Fill in a new delivery address. It will be saved for your future orders.
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

              <label className='mt-4 flex items-center gap-3 rounded-lg border border-gray-200 px-3.5 py-3 text-sm text-gray-700'>
                <input
                  type='checkbox'
                  checked={saveAddress}
                  onChange={(event) => setSaveAddress(event.target.checked)}
                  className='h-4 w-4 accent-black'
                />
                <span>Save this address for future orders</span>
              </label>
            </>
          )}
        </div>

        <div className='space-y-6'>
          {isBuyNowFlow && buyNowProduct && (
            <div className='rounded-xl border border-gray-200 bg-white p-4 sm:p-6'>
              <div className='text-xl sm:text-2xl'>
                <Title text1={'ORDER'} text2={'SUMMARY'}/>
              </div>

              <div className='mt-4 flex items-start gap-4'>
                <img className='w-20 rounded-md border border-gray-100 object-cover' src={buyNowProduct.image?.[0]} alt={buyNowProduct.name}/>
                <div className='flex-1'>
                  <p className='font-medium text-gray-800'>{buyNowProduct.name}</p>
                  <p className='mt-1 text-sm text-gray-500'>{buyNowProduct.category} / {buyNowProduct.subCategory}</p>
                  <p className='mt-2 text-base font-medium text-gray-900'>₹{buyNowProduct.price}.00</p>

                  <div className='mt-4 grid grid-cols-2 gap-3'>
                    <div>
                      <span className='mb-2 block text-sm text-gray-600'>Quantity</span>
                      <div className='flex items-center overflow-hidden rounded-md border border-gray-300'>
                        <button
                          type='button'
                          onClick={() => setBuyNowQuantity((current) => Math.max(1, current - 1))}
                          disabled={!canDecreaseBuyNowQuantity}
                          className='px-3 py-1.5 text-base text-gray-700 disabled:cursor-not-allowed disabled:text-gray-300'
                        >
                          -
                        </button>
                        <input
                          type='number'
                          min={1}
                          value={buyNowQuantity}
                          onChange={(event) => {
                            const nextQuantity = Number(event.target.value)
                            if (Number.isFinite(nextQuantity) && nextQuantity >= 1) {
                              setBuyNowQuantity(nextQuantity)
                            }
                          }}
                          className='w-full border-x border-gray-300 py-1.5 text-center text-sm outline-none'
                        />
                        <button
                          type='button'
                          onClick={() => setBuyNowQuantity((current) => current + 1)}
                          className='px-3 py-1.5 text-base text-gray-700'
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div>
                      <span className='mb-2 block text-sm text-gray-600'>Gold Weight (gm)</span>
                      <input
                        type='text'
                        inputMode='decimal'
                        value={buyNowWeight}
                        onChange={(event) => {
                          setBuyNowWeight(sanitizeWeightInput(event.target.value))
                        }}
                        placeholder='0.10'
                        className='w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none'
                      />
                      <p className='mt-2 text-xs text-gray-500'>
                        Selected weight: {buyNowWeight === '' ? '' : `${buyNowWeight} gm`}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className='rounded-xl border border-gray-200 bg-white p-4 sm:p-6'>
            <CartTotal
              subtotal={checkoutSubtotal}
              titleText1={isBuyNowFlow ? 'ORDER' : 'CART'}
              titleText2='TOTAL'
            />
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
