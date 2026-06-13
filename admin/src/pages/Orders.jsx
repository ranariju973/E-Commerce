import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import axios from 'axios'
import { backendUrl, currency } from '../App'
import { toast } from 'react-toastify'

const formatWeightDisplay = (value) => {
  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed <= 0) return ''
  return `${parsed}`
}

const cancelColors = {
  pending: 'admin-badge-warning',
  rejected: 'admin-badge-danger',
  approved: 'admin-badge-success',
  none: 'admin-badge-neutral',
}

const Orders = ({ token }) => {
  const [orders, setOrders] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [lightboxImage, setLightboxImage] = useState(null)

  const fetchAllOrders = async () => {
    if (!token) return
    try {
      const response = await axios.post(
        `${backendUrl}/api/order/list`,
        {},
        { headers: { token } }
      )
      if (response.data.success) {
        setOrders(response.data.orders)
      } else {
        toast.error(response.data.message || 'Failed to fetch orders')
      }
    } catch (error) {
      toast.error('Failed to fetch orders')
      console.log(error)
    } finally {
      setIsLoading(false)
    }
  }

  const statusHandler = async (event, orderId) => {
    try {
      const response = await axios.post(
        `${backendUrl}/api/order/status`,
        { orderId, status: event.target.value },
        { headers: { token } }
      )
      if (response.data.success) {
        await fetchAllOrders()
      } else {
        toast.error(response.data.message || 'Failed to update status')
      }
    } catch (error) {
      console.log(error)
      toast.error('Error updating status')
    }
  }

  const reviewCancelRequest = async (orderId, decision) => {
    try {
      const response = await axios.post(
        `${backendUrl}/api/order/cancel/review`,
        { orderId, decision },
        { headers: { token } }
      )
      if (response.data.success) {
        toast.success(response.data.message || 'Cancellation request updated')
        await fetchAllOrders()
      } else {
        toast.error(response.data.message || 'Failed to review cancellation request')
      }
    } catch (error) {
      console.log(error)
      toast.error(error.response?.data?.message || 'Failed to review cancellation request')
    }
  }

  useEffect(() => {
    fetchAllOrders()
  }, [token])

  return (
    <div className='animate-admin-fade-in'>
      <div className='mb-6'>
        <h2 className='text-xl font-bold text-white'>Orders</h2>
        <p className='text-sm text-gray-500 mt-1'>{orders.length} total orders</p>
      </div>

      {isLoading ? (
        <div className='flex items-center justify-center py-20'>
          <svg className='animate-spin text-gray-500' width='32' height='32' viewBox='0 0 24 24' fill='none'>
            <circle cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='3' opacity='0.15'/>
            <path d='M4 12a8 8 0 0 1 8-8' stroke='currentColor' strokeWidth='3' strokeLinecap='round'/>
          </svg>
        </div>
      ) : orders.length === 0 ? (
        <div className='glass-card p-12 text-center'>
          <svg width='48' height='48' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1' className='mx-auto mb-4 text-gray-600'>
            <path d='M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z'/>
          </svg>
          <p className='text-gray-500'>No orders yet.</p>
        </div>
      ) : (
        <div className='flex flex-col gap-4'>
          {orders.map((order, index) => (
            <div
              key={order._id || index}
              className='glass-card glass-card-hover p-5 md:p-6 animate-admin-fade-in'
              style={{ animationDelay: `${Math.min(index * 0.04, 0.4)}s` }}
            >
              {/* Header Row */}
              <div className='flex items-start justify-between gap-4 mb-4 pb-4 border-b border-white/5'>
                <div className='flex items-center gap-3'>
                  <div className='w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0'>
                    <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.5' className='text-gray-400'>
                      <path d='M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z'/>
                    </svg>
                  </div>
                  <div>
                    <p className='text-sm font-semibold text-white'>{order.address.firstName} {order.address.lastName}</p>
                    <p className='text-xs text-gray-500 mt-0.5'>{new Date(order.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </div>
                </div>
                <p className='text-lg font-bold text-white whitespace-nowrap'>{currency}{order.amount.toFixed(2)}</p>
              </div>

              {/* Order Items with Images */}
              <div className='mb-4'>
                <p className='admin-label mb-3'>Ordered Items</p>
                <div className='flex flex-col gap-3'>
                  {order.items.map((item, i) => (
                    <div key={i} className='flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5'>
                      {/* Product Image - Clickable */}
                      {item.image && item.image.length > 0 ? (
                        <button
                          type='button'
                          onClick={() => setLightboxImage(item.image[0])}
                          className='flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border border-white/10 cursor-pointer transition hover:border-white/30 hover:scale-105 active:scale-95'
                          title='Click to enlarge'
                        >
                          <img src={item.image[0]} alt={item.name} className='w-full h-full object-cover' />
                        </button>
                      ) : (
                        <div className='flex-shrink-0 w-14 h-14 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center'>
                          <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1' className='text-gray-600'>
                            <rect x='3' y='3' width='18' height='18' rx='2' ry='2'/><circle cx='8.5' cy='8.5' r='1.5'/><polyline points='21 15 16 10 5 21'/>
                          </svg>
                        </div>
                      )}
                      <div className='flex-1 min-w-0'>
                        <p className='text-sm text-gray-200 truncate'>{item.name}</p>
                        <p className='text-xs text-gray-500 mt-0.5'>
                          Qty: {item.quantity}
                          {formatWeightDisplay(item.weight || 0.1) && ` • ${formatWeightDisplay(item.weight || 0.1)} gm`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Content Grid */}
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4'>
                {/* Address */}
                <div>
                  <p className='admin-label'>Shipping</p>
                  <div className='text-sm text-gray-400'>
                    <p>{order.address.address}</p>
                    <p>{order.address.city}, {order.address.state} {order.address.pincode}</p>
                    <p className='mt-1'>📞 {order.address.phone}</p>
                  </div>
                </div>

                {/* Info */}
                <div>
                  <p className='admin-label'>Details</p>
                  <div className='text-sm text-gray-400 space-y-1.5'>
                    <p>Items: <span className='text-gray-200'>{order.items.length}</span></p>
                    <p>Method: <span className='text-gray-200'>{order.paymentMethod}</span></p>
                    <p>Payment: <span className={order.payment ? 'admin-badge admin-badge-success' : 'admin-badge admin-badge-danger'}>{order.payment ? 'Paid' : 'Not Paid'}</span></p>
                    <p className='flex items-center gap-2'>Cancel: <span className={`admin-badge ${cancelColors[order.cancelRequestStatus] || 'admin-badge-neutral'}`}>{order.cancelRequestStatus || 'none'}</span></p>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className='flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-4 border-t border-white/5'>
                <div className='flex items-center gap-2 flex-1 w-full sm:w-auto'>
                  <span className='text-xs text-gray-500 flex-shrink-0'>Status:</span>
                  <select
                    onChange={(event) => statusHandler(event, order._id)}
                    value={order.status}
                    className='flex-1 px-3 py-2 text-sm font-medium'
                  >
                    <option value='Order Placed'>Order Placed</option>
                    <option value='Packing'>Packing</option>
                    <option value='Shipped'>Shipped</option>
                    <option value='Out for delivery'>Out for delivery</option>
                    <option value='Delivered'>Delivered</option>
                    <option value='Cancelled'>Cancelled</option>
                  </select>
                </div>

                {order.cancelRequestStatus === 'pending' && (
                  <div className='flex gap-2'>
                    <button
                      onClick={() => reviewCancelRequest(order._id, 'approve')}
                      className='admin-btn admin-btn-success admin-btn-sm'
                    >
                      ✓ Approve
                    </button>
                    <button
                      onClick={() => reviewCancelRequest(order._id, 'reject')}
                      className='admin-btn admin-btn-danger admin-btn-sm'
                    >
                      ✕ Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========== IMAGE LIGHTBOX ========== */}
      {lightboxImage && createPortal(
        <div
          className='fixed inset-0 z-[9999] flex items-center justify-center p-4'
          onClick={() => setLightboxImage(null)}
        >
          {/* Backdrop */}
          <div className='absolute inset-0 bg-black/80 backdrop-blur-md' style={{ animation: 'adminFadeIn 0.2s ease both' }} />

          {/* Image Container */}
          <div
            className='relative z-10 max-w-[90vw] max-h-[85vh] animate-admin-scale-in'
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={lightboxImage}
              alt='Order product'
              className='max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl'
            />
            {/* Close Button */}
            <button
              onClick={() => setLightboxImage(null)}
              className='absolute -top-3 -right-3 w-8 h-8 rounded-full bg-white text-black flex items-center justify-center hover:bg-gray-200 transition shadow-lg'
            >
              <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5'>
                <line x1='18' y1='6' x2='6' y2='18'/><line x1='6' y1='6' x2='18' y2='18'/>
              </svg>
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}

export default Orders
