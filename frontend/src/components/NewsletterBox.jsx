import React from 'react'

const NewsletterBox = () => {

    const onsubmitHandler = (e) => {
        e.preventDefault()
    }

  return (
    <div className='text-center pt-10'>
        <p className='text-2xl font-medium text-gray-800'>
            Subscribe and get 10% off your first purchase!
        </p>
        <p className='text-gray-400 mt-3'>
            Stay updated with our latest news and offers.
        </p>
        <form onSubmit={onsubmitHandler} className='w-full sm:w-1/2 flex items-center gap-3 mx-auto my-6 border pl-3' action="">
            <input className='w-full sm:flex-1 outline-none' type="email" placeholder='Enter your email' required name="" id=""/>
            <button type='submit' className='bg-black text-white text-xc px-10 py-4 hover:bg-gray-800'>SUBSCRIBE</button>
        </form>
    </div>
  )
}

export default NewsletterBox