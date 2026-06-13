import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from '../components/Title'
import axios from 'axios'
import OrderTimeline from '../components/OrderTimeline'
import { OrderCardSkeletonList } from '../components/skeletons/OrderCardSkeleton'
import { getCartImage } from '../utils/cloudinaryHelper'
import { motion, AnimatePresence } from 'framer-motion'

const FILTER_TABS = [
  { id: 'all', label: 'All Orders' },
  { id: 'active', label: 'Active' },
  { id: 'delivered', label: 'Delivered' }
]

const Orders = () => {
  const { backendUrl, token, currency, navigate } = useContext(ShopContext)
  const [orderData, setOrderData] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const [expandedOrderId, setExpandedOrderId] = useState(null)

  const loadOrderData = async () => {
    try {
      setIsLoading(true)
      if (!token) return null

      const response = await axios.post(backendUrl + '/api/order/userorders', {}, { headers: { token } })
      if (response.data.success) {
        // Sort orders by most recent first
        const sortedOrders = response.data.orders.sort((a, b) => b.date - a.date)
        setOrderData(sortedOrders)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadOrderData()
  }, [token])

  // Flatten items for display, group by order
  // Actually, we should map orders directly to Order Cards, instead of splitting items
  
  const filteredOrders = orderData.filter(order => {
    if (activeTab === 'all') return true
    if (activeTab === 'active') return order.status !== 'Delivered'
    if (activeTab === 'delivered') return order.status === 'Delivered'
    return true
  })

  return (
    <div className='pt-8 pb-16'>
      <div className='text-2xl mb-4'>
        <Title text1={'MY'} text2={'ORDERS'} />
      </div>

      {/* Tabs */}
      <div className='tab-bar mb-6'>
        {FILTER_TABS.map(tab => (
          <button
            key={tab.id}
            className={`tab-item ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <OrderCardSkeletonList count={3} />
      ) : filteredOrders.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className='text-center py-16'
        >
          <div className='w-24 h-24 mx-auto mb-6 rounded-full bg-gray-50 flex items-center justify-center'>
            <svg width='40' height='40' viewBox='0 0 24 24' fill='none' stroke='#d1d5db' strokeWidth='1.5'>
              <path d='M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z' />
              <polyline points='3.27 6.96 12 12.01 20.73 6.96' />
              <line x1='12' y1='22.08' x2='12' y2='12' />
            </svg>
          </div>
          <h3 className='text-xl font-semibold text-gray-800 mb-2'>No orders yet</h3>
          <p className='text-sm text-gray-400 mb-6'>Looks like you haven't placed any orders matching this filter.</p>
          <button onClick={() => navigate('/collection')} className='btn-primary'>
            Shop Now
          </button>
        </motion.div>
      ) : (
        <div className='flex flex-col gap-4'>
          <AnimatePresence>
            {filteredOrders.map((order, index) => {
              const isExpanded = expandedOrderId === order._id
              const date = new Date(order.date).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              })
              const isDelivered = order.status === 'Delivered'

              return (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                  className='glass-card-solid overflow-hidden'
                >
                  <div className='p-4 sm:p-5'>
                    {/* Header */}
                    <div className='flex justify-between items-start mb-4'>
                      <div>
                        <p className='text-sm text-gray-500'>Order ID: <span className='text-gray-800 font-medium'>#{order._id.slice(-6).toUpperCase()}</span></p>
                        <p className='text-xs text-gray-400 mt-0.5'>{date}</p>
                      </div>
                      <div className='text-right'>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${isDelivered ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isDelivered ? 'bg-green-500' : 'bg-blue-500'}`}></span>
                          {order.status}
                        </span>
                      </div>
                    </div>

                    {/* Items row */}
                    <div className='flex gap-3 overflow-x-auto hide-scrollbar mb-4 pb-2'>
                      {order.items.slice(0, 3).map((item, i) => (
                        <div key={i} className='relative group cursor-pointer' onClick={() => navigate(`/product/${item._id}`)}>
                          <img 
                            src={getCartImage(item.image[0])} 
                            alt={item.name}
                            className='w-16 h-16 rounded-lg object-cover border border-gray-100 group-hover:border-gray-300 transition'
                          />
                          <span className='absolute -top-2 -right-2 w-5 h-5 bg-white border border-gray-200 rounded-full flex items-center justify-center text-[10px] font-medium text-gray-600 shadow-sm'>
                            {item.quantity}
                          </span>
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <div className='w-16 h-16 rounded-lg bg-gray-50 flex items-center justify-center text-sm font-medium text-gray-500 border border-gray-100'>
                          +{order.items.length - 3}
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    <div className='flex items-center justify-between pt-4 border-t border-gray-50'>
                      <div>
                        <p className='text-xs text-gray-500'>Total Amount</p>
                        <p className='text-base font-semibold text-gray-900'>{currency}{order.amount}</p>
                      </div>
                      <div className='flex gap-2'>
                        <button 
                          onClick={() => setExpandedOrderId(isExpanded ? null : order._id)}
                          className='btn-outline btn-sm'
                        >
                          {isExpanded ? 'Hide Tracker' : 'Track Order'}
                        </button>
                        {isDelivered && (
                          <button onClick={() => navigate(`/product/${order.items[0]._id}`)} className='btn-primary btn-sm hidden sm:inline-flex'>
                            Write Review
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Expandable Timeline */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className='overflow-hidden'
                        >
                          <div className='pt-6 mt-4 border-t border-gray-50 px-2 sm:px-6'>
                            <h4 className='text-sm font-semibold mb-2'>Order Status</h4>
                            <OrderTimeline currentStatus={order.status} />
                            
                            {/* Items breakdown in expanded view */}
                            <div className='mt-8'>
                              <h4 className='text-sm font-semibold mb-4'>Items ({order.items.length})</h4>
                              <div className='flex flex-col gap-4'>
                                {order.items.map((item, i) => (
                                  <div key={i} className='flex items-center gap-3'>
                                    <img src={getCartImage(item.image[0])} alt={item.name} className='w-12 h-12 rounded bg-gray-50 object-cover' />
                                    <div className='flex-1'>
                                      <p className='text-sm text-gray-800 line-clamp-1'>{item.name}</p>
                                      <p className='text-xs text-gray-500 mt-0.5'>Qty: {item.quantity} &nbsp;|&nbsp; Weight: {item.weight}gm</p>
                                    </div>
                                    <p className='text-sm font-medium text-gray-700'>{currency}{item.price}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}

export default Orders
