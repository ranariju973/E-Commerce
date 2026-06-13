import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { GoogleLogin } from '@react-oauth/google'

const Login = () => {

  const [currentState, setCurrentState] = React.useState('Login')
  const {token, setToken, navigate, backendUrl } = useContext(ShopContext)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const response = await axios.post(`${backendUrl}/api/user/google`, {
        credential: credentialResponse.credential
      })
      if (response.data.success) {
        setToken(response.data.token)
        localStorage.setItem('token', response.data.token)
        toast.success(response.data.message || 'Logged in successfully')
      } else {
        toast.error(response.data.message || 'Google login failed')
      }
    } catch (error) {
      console.error(error)
      toast.error('Google login failed')
    }
  }

  const handleGoogleError = () => {
    toast.error('Google login failed')
  }

  const onSubmitHandler = async (event) => {
    event.preventDefault()

    try {
      if(currentState === 'Sign up') {
        // Sign up logic
        const response = await axios.post(`${backendUrl}/api/user/register`, { name, email, password })
        if(response.data.success) {
          setToken(response.data.token)
          localStorage.setItem('token', response.data.token)
        } else {
          toast.error(response.data.message || 'Failed to register user')
        }
      } else {
        // Login logic
        const response = await axios.post(`${backendUrl}/api/user/login`, { email, password })
        if(response.data.success) {
          setToken(response.data.token)
          localStorage.setItem('token', response.data.token)
        } else {
          toast.error(response.data.message || 'Failed to login user')
        }
      }
    } catch (error) {
      console.log(error)
      toast.error('An error occurred while processing your request')
    }
  }

  useEffect(() => {
    if(token) {
      navigate('/')
    }
  }, [token, navigate])

  useEffect(() => {
    if(!token && localStorage.getItem('token')) {
      setToken(localStorage.getItem('token'))
    }
  }, [token])

  return (
    <div className='flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800'>
      <div className='inline-flex items-center gap-2 mb-2 mt-10'>
        <p className='prata-regular text-3xl'>{currentState}</p>
        <hr className='border-none h-[1.5px] w-8 bg-gray-800'/>
      </div>

      <div className='w-full flex justify-center mb-4'>
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={handleGoogleError}
          useOneTap
          theme="outline"
          shape="rectangular"
          text={currentState === 'Login' ? 'signin_with' : 'signup_with'}
          width="100%"
        />
      </div>
      
      <div className='flex items-center w-full gap-3 text-gray-400 mb-2'>
        <hr className='flex-1 border-gray-300' />
        <span className='text-xs uppercase tracking-wide'>OR</span>
        <hr className='flex-1 border-gray-300' />
      </div>

      <form onSubmit={onSubmitHandler} className='w-full flex flex-col gap-4'>
        {currentState === 'Login' ? '' : <input onChange={(e) => setName(e.target.value)} value={name} className='w-full px-3 py-2 border border-gray-800' placeholder='Name' type="text" required/>}
        <input onChange={(e) => setEmail(e.target.value)} value={email} className='w-full px-3 py-2 border border-gray-800' placeholder='Email' type="email" required/>
        <input onChange={(e) => setPassword(e.target.value)} value={password} className='w-full px-3 py-2 border border-gray-800' placeholder='Password' type="password" required/>
        <div className='w-full flex justify-between text-sm mt-[-8px]'>
          <p className='cursor-pointer'>Forgot your password ?</p> 
          {
            currentState === 'Login'
            ? <p onClick={() => setCurrentState('Sign up')} className='cursor-pointer'>Sign Up</p>
            : <p onClick={() => setCurrentState('Login')} className='cursor-pointer'>Login</p>
          }
        </div>
        <button className='bg-black text-white font-light px-8 py-2 mt-4'>{currentState === 'Login' ? 'Login' : 'Sign Up'}</button>
      </form>
    </div>
  )
}

export default Login