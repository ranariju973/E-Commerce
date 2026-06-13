import React, { useEffect, useState } from 'react'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import BottomNav from './components/BottomNav'
import { Routes, Route } from 'react-router-dom'
import Add from './pages/Add'
import List from './pages/List'
import Orders from './pages/Orders'
import Login from './components/Login'
import { ToastContainer } from 'react-toastify'
import { useOrderNotifications } from './hooks/useOrderNotifications'

export const backendUrl = import.meta.env.VITE_BACKEND_URL

export const currency = '₹'

const App = () => {
  const [token, setToken] = useState(localStorage.getItem('token') ? localStorage.getItem('token') : '')

  useOrderNotifications(token)

  useEffect(() => {
    localStorage.setItem('token', token)
  }, [token])

  return (
    <div className='min-h-screen' style={{ background: 'var(--admin-bg)' }}>
      <ToastContainer
        theme='dark'
        toastStyle={{
          background: '#1a1a1a',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '12px',
          color: '#f5f5f5',
          fontSize: '13px',
        }}
      />
      {token === '' ? (
        <Login setToken={setToken} />
      ) : (
        <>
          <Navbar setToken={setToken} />
          <div className='flex'>
            <Sidebar />
            <div className='admin-content flex-1 w-full md:w-auto md:ml-0 px-4 md:px-8 py-6 md:py-8'>
              <Routes>
                <Route path='/add' element={<Add token={token} />} />
                <Route path='/list' element={<List token={token} />} />
                <Route path='/orders' element={<Orders token={token} />} />
              </Routes>
            </div>
          </div>
          <BottomNav />
        </>
      )}
    </div>
  )
}

export default App