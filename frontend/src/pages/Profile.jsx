import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import axios from 'axios'
import Title from '../components/Title'
import { toast } from 'react-hot-toast'
import Spinner from '../components/Spinner'
import { motion, AnimatePresence } from 'framer-motion'

const Profile = () => {
  const { token, backendUrl, navigate, setToken, setCartItems } = useContext(ShopContext)
  
  const [profile, setProfile] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  
  const [activeTab, setActiveTab] = useState('info') // 'info' or 'addresses'
  
  // Edit Name State
  const [isEditingName, setIsEditingName] = useState(false)
  const [editName, setEditName] = useState('')

  // Address Form State
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [editingAddressId, setEditingAddressId] = useState(null)
  const [addressForm, setAddressForm] = useState({
    firstName: '', lastName: '', email: '', phone: '', address: '', city: '', state: '', pincode: '', country: ''
  })

  const fetchProfile = async () => {
    try {
      const response = await axios.post(`${backendUrl}/api/user/profile`, {}, { headers: { token } })
      if (response.data.success) {
        setProfile(response.data.profile)
        setEditName(response.data.profile.name)
      }
    } catch (error) {
      toast.error('Failed to load profile')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!token) {
      navigate('/login')
      return
    }
    fetchProfile()
  }, [token])

  const logoutUser = () => {
    navigate('/login')
    localStorage.removeItem('token')
    setToken('')
    setCartItems({})
    toast.success('Logged out successfully')
  }

  const handleUpdateName = async () => {
    if (!editName.trim()) return toast.error('Name cannot be empty')
    try {
      setIsSaving(true)
      const res = await axios.post(`${backendUrl}/api/user/update-profile`, { name: editName }, { headers: { token } })
      if (res.data.success) {
        toast.success('Name updated')
        setProfile(prev => ({ ...prev, name: editName }))
        setIsEditingName(false)
      }
    } catch (error) {
      toast.error('Failed to update name')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveAddress = async (e) => {
    e.preventDefault()
    
    // basic validation
    if (!addressForm.firstName || !addressForm.address || !addressForm.city || !addressForm.phone) {
      return toast.error('Please fill all required fields')
    }

    try {
      setIsSaving(true)
      let newAddresses = [...(profile.addresses || [])]
      
      if (editingAddressId) {
        // Update existing
        newAddresses = newAddresses.map(addr => addr.id === editingAddressId ? { ...addr, ...addressForm } : addr)
      } else {
        // Add new
        newAddresses.push({ ...addressForm, id: Date.now().toString() })
      }

      // If it's the first address, set it as default
      let newDefaultId = profile.defaultAddressId
      if (newAddresses.length === 1 && !newDefaultId) {
        newDefaultId = newAddresses[0].id
      }

      const res = await axios.post(`${backendUrl}/api/user/update-profile`, { 
        addresses: newAddresses,
        defaultAddressId: newDefaultId
      }, { headers: { token } })

      if (res.data.success) {
        toast.success(editingAddressId ? 'Address updated' : 'Address added')
        setProfile(prev => ({ ...prev, addresses: newAddresses, defaultAddressId: newDefaultId }))
        setShowAddressForm(false)
      }
    } catch (error) {
      toast.error('Failed to save address')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteAddress = async (id) => {
    try {
      const newAddresses = profile.addresses.filter(addr => addr.id !== id)
      let newDefaultId = profile.defaultAddressId
      if (newDefaultId === id) {
        newDefaultId = newAddresses.length > 0 ? newAddresses[0].id : ''
      }

      const res = await axios.post(`${backendUrl}/api/user/update-profile`, { 
        addresses: newAddresses,
        defaultAddressId: newDefaultId
      }, { headers: { token } })

      if (res.data.success) {
        toast.success('Address deleted')
        setProfile(prev => ({ ...prev, addresses: newAddresses, defaultAddressId: newDefaultId }))
      }
    } catch (error) {
      toast.error('Failed to delete address')
    }
  }

  const handleSetDefaultAddress = async (id) => {
    try {
      const res = await axios.post(`${backendUrl}/api/user/update-profile`, { 
        defaultAddressId: id
      }, { headers: { token } })

      if (res.data.success) {
        toast.success('Default address updated')
        setProfile(prev => ({ ...prev, defaultAddressId: id }))
      }
    } catch (error) {
      toast.error('Failed to set default address')
    }
  }

  const openAddForm = () => {
    setAddressForm({ firstName: '', lastName: '', email: profile?.email || '', phone: '', address: '', city: '', state: '', pincode: '', country: '' })
    setEditingAddressId(null)
    setShowAddressForm(true)
  }

  const openEditForm = (addr) => {
    setAddressForm(addr)
    setEditingAddressId(addr.id)
    setShowAddressForm(true)
  }

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-[50vh]'>
        <Spinner />
      </div>
    )
  }

  if (!profile) return null

  return (
    <div className='pt-8 pb-16 max-w-4xl mx-auto'>
      <div className='text-2xl mb-6 text-center sm:text-left'>
        <Title text1={'MY'} text2={'PROFILE'} />
      </div>

      <div className='flex flex-col sm:flex-row gap-6'>
        {/* Sidebar / Tabs */}
        <div className='w-full sm:w-1/4 flex flex-col gap-2'>
          <button 
            onClick={() => { setActiveTab('info'); setShowAddressForm(false) }}
            className={`px-4 py-3 text-left rounded-xl transition ${activeTab === 'info' ? 'bg-black text-white' : 'glass-card-solid hover:bg-gray-50'}`}
          >
            Account Info
          </button>
          <button 
            onClick={() => setActiveTab('addresses')}
            className={`px-4 py-3 text-left rounded-xl transition ${activeTab === 'addresses' ? 'bg-black text-white' : 'glass-card-solid hover:bg-gray-50'}`}
          >
            Saved Addresses
          </button>
          
          <button 
            onClick={() => navigate('/orders')}
            className='px-4 py-3 text-left rounded-xl transition glass-card-solid hover:bg-gray-50 hidden sm:block'
          >
            My Orders
          </button>

          <button 
            onClick={logoutUser}
            className='px-4 py-3 text-left rounded-xl transition glass-card-solid text-red-500 hover:bg-red-50 mt-4 sm:hidden'
          >
            Logout
          </button>
        </div>

        {/* Content Area */}
        <div className='w-full sm:w-3/4'>
          <AnimatePresence mode='wait'>
            {activeTab === 'info' && (
              <motion.div
                key='info'
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className='glass-card-solid p-6 sm:p-8'
              >
                <h3 className='text-xl font-medium mb-6 border-b pb-4'>Account Information</h3>
                
                <div className='mb-6'>
                  <p className='text-sm text-gray-500 mb-1'>Name</p>
                  {isEditingName ? (
                    <div className='flex items-center gap-3'>
                      <input 
                        type='text' 
                        value={editName} 
                        onChange={(e) => setEditName(e.target.value)}
                        className='border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-black flex-1'
                      />
                      <button onClick={handleUpdateName} disabled={isSaving} className='btn-primary btn-sm min-w-[80px]'>
                        {isSaving ? <Spinner size='sm' color='white' /> : 'Save'}
                      </button>
                      <button onClick={() => setIsEditingName(false)} className='btn-outline btn-sm'>Cancel</button>
                    </div>
                  ) : (
                    <div className='flex items-center justify-between'>
                      <p className='text-lg font-medium text-gray-900'>{profile.name}</p>
                      <button onClick={() => setIsEditingName(true)} className='text-sm text-blue-600 hover:underline'>Edit</button>
                    </div>
                  )}
                </div>

                <div>
                  <p className='text-sm text-gray-500 mb-1'>Email Address</p>
                  <p className='text-base text-gray-700'>{profile.email}</p>
                  <p className='text-xs text-gray-400 mt-1'>Email cannot be changed.</p>
                </div>
              </motion.div>
            )}

            {activeTab === 'addresses' && !showAddressForm && (
              <motion.div
                key='addresses'
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div className='flex items-center justify-between mb-6'>
                  <h3 className='text-xl font-medium'>Saved Addresses</h3>
                  <button onClick={openAddForm} className='btn-primary btn-sm'>+ Add New</button>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  {(!profile.addresses || profile.addresses.length === 0) ? (
                    <div className='col-span-full py-10 text-center glass-card-solid'>
                      <p className='text-gray-500 mb-4'>No saved addresses found.</p>
                      <button onClick={openAddForm} className='btn-outline btn-sm'>Add an address</button>
                    </div>
                  ) : (
                    profile.addresses.map((addr) => (
                      <div key={addr.id} className={`glass-card-solid p-5 relative border-2 transition ${profile.defaultAddressId === addr.id ? 'border-black' : 'border-transparent'}`}>
                        {profile.defaultAddressId === addr.id && (
                          <span className='absolute top-3 right-3 bg-black text-white text-[10px] px-2 py-1 rounded font-medium'>DEFAULT</span>
                        )}
                        <p className='font-medium text-gray-900 mb-1'>{addr.firstName} {addr.lastName}</p>
                        <p className='text-sm text-gray-600 line-clamp-2 min-h-[40px]'>{addr.address}, {addr.city}, {addr.state} {addr.pincode}</p>
                        <p className='text-sm text-gray-600 mb-4 mt-1'>📞 {addr.phone}</p>
                        
                        <div className='flex gap-3 pt-3 border-t border-gray-100'>
                          <button onClick={() => openEditForm(addr)} className='text-sm font-medium text-blue-600 hover:underline'>Edit</button>
                          <button onClick={() => handleDeleteAddress(addr.id)} className='text-sm font-medium text-red-500 hover:underline'>Delete</button>
                          {profile.defaultAddressId !== addr.id && (
                            <button onClick={() => handleSetDefaultAddress(addr.id)} className='text-sm font-medium text-gray-500 hover:text-black ml-auto'>Set as Default</button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'addresses' && showAddressForm && (
              <motion.div
                key='addressForm'
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className='glass-card-solid p-6 sm:p-8'
              >
                <h3 className='text-xl font-medium mb-6 border-b pb-4'>{editingAddressId ? 'Edit Address' : 'Add New Address'}</h3>
                <form onSubmit={handleSaveAddress} className='flex flex-col gap-4'>
                  <div className='flex gap-4'>
                    <input required className='border border-gray-300 rounded px-3.5 py-2 text-sm w-full outline-none focus:border-black' type="text" placeholder='First name' value={addressForm.firstName} onChange={(e)=>setAddressForm({...addressForm, firstName: e.target.value})}/>
                    <input required className='border border-gray-300 rounded px-3.5 py-2 text-sm w-full outline-none focus:border-black' type="text" placeholder='Last name' value={addressForm.lastName} onChange={(e)=>setAddressForm({...addressForm, lastName: e.target.value})}/>
                  </div>
                  <input required className='border border-gray-300 rounded px-3.5 py-2 text-sm w-full outline-none focus:border-black' type="text" placeholder='Street Address (e.g. 123 Main St)' value={addressForm.address} onChange={(e)=>setAddressForm({...addressForm, address: e.target.value})}/>
                  <div className='flex gap-4'>
                    <input required className='border border-gray-300 rounded px-3.5 py-2 text-sm w-full outline-none focus:border-black' type="text" placeholder='City' value={addressForm.city} onChange={(e)=>setAddressForm({...addressForm, city: e.target.value})}/>
                    <input required className='border border-gray-300 rounded px-3.5 py-2 text-sm w-full outline-none focus:border-black' type="text" placeholder='State/Province' value={addressForm.state} onChange={(e)=>setAddressForm({...addressForm, state: e.target.value})}/>
                  </div>
                  <div className='flex gap-4'>
                    <input required className='border border-gray-300 rounded px-3.5 py-2 text-sm w-full outline-none focus:border-black' type="text" placeholder='Zip / Postal Code' value={addressForm.pincode} onChange={(e)=>setAddressForm({...addressForm, pincode: e.target.value})}/>
                    <input required className='border border-gray-300 rounded px-3.5 py-2 text-sm w-full outline-none focus:border-black' type="text" placeholder='Country' value={addressForm.country} onChange={(e)=>setAddressForm({...addressForm, country: e.target.value})}/>
                  </div>
                  <input required className='border border-gray-300 rounded px-3.5 py-2 text-sm w-full outline-none focus:border-black' type="tel" placeholder='Phone Number' value={addressForm.phone} onChange={(e)=>setAddressForm({...addressForm, phone: e.target.value})}/>

                  <div className='flex gap-3 justify-end mt-4'>
                    <button type="button" onClick={() => setShowAddressForm(false)} className='btn-outline'>Cancel</button>
                    <button type="submit" disabled={isSaving} className='btn-primary min-w-[100px]'>
                      {isSaving ? <Spinner size='sm' color='white' /> : 'Save Address'}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

export default Profile
