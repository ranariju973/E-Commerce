import React from 'react'
import Title from '../components/Title'
import { assets } from '../assets/assets'

const Contact = () => {
  const contactInfo = [
    {
      heading: 'Visit Our Store',
      details: ['54709 Willms Station', 'Suite 350, Washington, USA']
    },
    {
      heading: 'Get In Touch',
      details: ['Tel: (415) 555-0132', 'Email: support@forever.com']
    },
    {
      heading: 'Business Hours',
      details: ['Mon - Fri: 10:00 AM - 8:00 PM', 'Sat - Sun: 10:00 AM - 6:00 PM']
    },
    {
      heading: 'Customer Care',
      details: ['Quick help for orders, returns, and payments', 'Average reply time: under 24 hours']
    }
  ]

  return (
    <div className='border-t pt-8 sm:pt-10'>
      <div className='text-center text-2xl'>
        <Title text1={'CONTACT'} text2={'US'} />
        <p className='mx-auto mt-1 max-w-2xl text-sm text-gray-500'>
          Have a question, a custom order request, or need support with your purchase? We are here to help.
        </p>
      </div>

      <div className='my-10 grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-start'>
        <div className='overflow-hidden rounded-xl border border-gray-200 bg-white'>
          <img className='h-full w-full object-cover' src={assets.contact_img} alt='Contact' />
        </div>

        <div className='space-y-6'>
          <div className='rounded-xl border border-gray-200 bg-white p-5 sm:p-6'>
            <h3 className='text-lg font-medium text-gray-800'>Store And Support</h3>
            <div className='mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2'>
              {contactInfo.map((item) => (
                <div key={item.heading} className='rounded-lg border border-gray-100 bg-gray-50 p-4'>
                  <p className='text-sm font-semibold text-gray-800'>{item.heading}</p>
                  <div className='mt-2 space-y-1'>
                    {item.details.map((line) => (
                      <p key={line} className='text-sm text-gray-600'>
                        {line}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <form
            className='rounded-xl border border-gray-200 bg-white p-5 sm:p-6'
            onSubmit={(event) => event.preventDefault()}
          >
            <h3 className='text-lg font-medium text-gray-800'>Send Us A Message</h3>
            <p className='mt-1 text-sm text-gray-500'>
              Fill out the form and our team will get back to you as soon as possible.
            </p>

            <div className='mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2'>
              <input
                className='w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-black'
                type='text'
                placeholder='Your name'
                autoComplete='name'
              />
              <input
                className='w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-black'
                type='email'
                placeholder='Email address'
                autoComplete='email'
              />
            </div>

            <input
              className='mt-4 w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-black'
              type='text'
              placeholder='Subject'
            />

            <textarea
              className='mt-4 w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-black'
              rows={5}
              placeholder='Write your message here...'
            ></textarea>

            <button
              type='submit'
              className='mt-5 rounded-md bg-black px-7 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800'
            >
              SEND MESSAGE
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Contact