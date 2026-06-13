import axios from 'axios'
import React, { useState, useEffect, useCallback } from 'react'
import { backendUrl } from '../App'
import { toast } from 'react-toastify'

const MAX_ATTEMPTS = 5
const LOCKOUT_SECONDS = 60

const Login = ({ setToken }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [lockoutEnd, setLockoutEnd] = useState(null)
  const [countdown, setCountdown] = useState(0)
  const [shakeForm, setShakeForm] = useState(false)

  // Countdown timer for lockout
  useEffect(() => {
    if (!lockoutEnd) return
    const tick = () => {
      const remaining = Math.ceil((lockoutEnd - Date.now()) / 1000)
      if (remaining <= 0) {
        setLockoutEnd(null)
        setCountdown(0)
        setAttempts(0)
      } else {
        setCountdown(remaining)
      }
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [lockoutEnd])

  const triggerShake = useCallback(() => {
    setShakeForm(true)
    setTimeout(() => setShakeForm(false), 500)
  }, [])

  const onSubmitHandler = async (e) => {
    e.preventDefault()
    if (lockoutEnd) return

    if (attempts >= MAX_ATTEMPTS) {
      setLockoutEnd(Date.now() + LOCKOUT_SECONDS * 1000)
      toast.error(`Too many failed attempts. Locked for ${LOCKOUT_SECONDS}s.`)
      triggerShake()
      return
    }

    setIsLoading(true)
    try {
      const response = await axios.post(backendUrl + '/api/user/admin', { email, password })
      if (response.data.success) {
        setToken(response.data.token)
        setAttempts(0)
      } else {
        setAttempts(prev => prev + 1)
        triggerShake()
        const remaining = MAX_ATTEMPTS - attempts - 1
        toast.error(remaining > 0
          ? `Invalid credentials. ${remaining} attempt${remaining !== 1 ? 's' : ''} left.`
          : 'Account locked. Please wait.')
        if (remaining <= 0) {
          setLockoutEnd(Date.now() + LOCKOUT_SECONDS * 1000)
        }
      }
    } catch (error) {
      console.log(error)
      toast.error('An error occurred while logging in.')
    } finally {
      setIsLoading(false)
    }
  }

  const isLocked = !!lockoutEnd

  return (
    <div className='min-h-screen flex items-center justify-center w-full admin-login-bg px-4'>
      <div className={`admin-login-card px-8 py-10 w-full max-w-[400px] animate-admin-scale-in ${shakeForm ? 'animate-admin-shake' : ''}`}>
        {/* Header */}
        <div className='text-center mb-8'>
          <div className='w-14 h-14 rounded-2xl bg-white flex items-center justify-center mx-auto mb-4'>
            <svg width='28' height='28' viewBox='0 0 24 24' fill='none' stroke='#000' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
              <path d='M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z'/>
            </svg>
          </div>
          <h1 className='text-2xl font-bold text-white tracking-tight'>Admin Panel</h1>
          <p className='text-sm text-gray-500 mt-2'>Sign in to manage your store</p>
        </div>

        <form onSubmit={onSubmitHandler} className='flex flex-col gap-5'>
          <div>
            <label className='admin-label'>Email Address</label>
            <input
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              className='w-full px-4 py-3 text-sm'
              type='email'
              placeholder='admin@example.com'
              required
              disabled={isLocked}
              autoComplete='email'
            />
          </div>
          <div>
            <label className='admin-label'>Password</label>
            <div className='relative'>
              <input
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                className='w-full px-4 py-3 text-sm pr-12'
                type={showPassword ? 'text' : 'password'}
                placeholder='Enter your password'
                required
                disabled={isLocked}
                autoComplete='current-password'
              />
              <button
                type='button'
                onClick={() => setShowPassword(p => !p)}
                className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition p-1'
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'><path d='M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94'/><path d='M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19'/><line x1='1' y1='1' x2='23' y2='23'/></svg>
                ) : (
                  <svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'><path d='M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z'/><circle cx='12' cy='12' r='3'/></svg>
                )}
              </button>
            </div>
          </div>

          {/* Security indicator */}
          {attempts > 0 && !isLocked && (
            <div className='flex items-center gap-2 text-xs'>
              <div className='flex gap-1'>
                {Array.from({ length: MAX_ATTEMPTS }).map((_, i) => (
                  <div key={i} className={`w-2 h-2 rounded-full transition-all ${i < attempts ? 'bg-red-500' : 'bg-gray-700'}`} />
                ))}
              </div>
              <span className='text-gray-500'>{MAX_ATTEMPTS - attempts} attempts remaining</span>
            </div>
          )}

          {isLocked && (
            <div className='flex items-center gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20'>
              <svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='#ef4444' strokeWidth='2'><rect x='3' y='11' width='18' height='11' rx='2' ry='2'/><path d='M7 11V7a5 5 0 0 1 10 0v4'/></svg>
              <div>
                <p className='text-red-400 text-sm font-medium'>Account locked</p>
                <p className='text-red-400/70 text-xs'>Try again in {countdown}s</p>
              </div>
            </div>
          )}

          <button
            className='admin-btn admin-btn-primary w-full py-3 mt-1'
            type='submit'
            disabled={isLoading || isLocked}
          >
            {isLoading ? (
              <svg className='animate-spin' width='20' height='20' viewBox='0 0 24 24' fill='none'><circle cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='3' opacity='0.25'/><path d='M4 12a8 8 0 0 1 8-8' stroke='currentColor' strokeWidth='3' strokeLinecap='round'/></svg>
            ) : isLocked ? (
              'Locked'
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <p className='text-center text-[11px] text-gray-600 mt-6'>Protected by rate limiting • {MAX_ATTEMPTS} max attempts</p>
      </div>
    </div>
  )
}

export default Login