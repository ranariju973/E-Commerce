import React from 'react'
import Title from '../components/Title'
import { assets } from '../assets/assets'
import NewsletterBox from '../components/NewsletterBox'

const About = () => {
  return (
    <div>


    <div className='text-2xl text-center pt-8 border-t'>
      <Title text1={'ABOUT'} text2={'US'}/>
    </div>

    <div className='my-10 flex flex-col md:flex-row gap-8 md:gap-16'>
      <img className='w-full md:max-w-112.5' src={assets.about_img} alt=""/>
      <div className='flex flex-col justify-center gap-6 md:w-2/4 text-gray-600'>
        <p>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Quod rerum molestias unde assumenda harum similique fugit est accusamus tempora, saepe id totam soluta. Laudantium esse omnis, doloremque id iste mollitia.</p>
        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Ducimus magni minima voluptates nostrum deserunt sequi obcaecati in. Dolor eum rerum, praesentium natus explicabo incidunt, vitae voluptate esse nobis itaque facilis.</p>
        <b className='text-gray-800'>Our Mission</b>
        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Sint minima animi consectetur dicta praesentium labore incidunt cumque, id laboriosam. Sint accusantium maiores at voluptatum officia repellat animi commodi veritatis aperiam?</p>
      </div>
    </div>

    <div className='text-xl py-4 '>
      <Title text1={'WHY'} text2={'CHOOSE US'} />
    </div>

    <div className='flex flex-col md:flex-row text-sm mb-20'>
      <div className='border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5'>
        <b>Quality Assurrance:</b>
        <p className='text-gray-600'>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Soluta ab eos dicta ad molestias dolorum minima asperiores cum reiciendis distinctio ipsa minus commodi nostrum autem, molestiae, magni perspiciatis dolore quia.</p>
      </div>

      <div className='border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5'>
        <b>Convinance:</b>
        <p className='text-gray-600'>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Soluta ab eos dicta ad molestias dolorum minima asperiores cum reiciendis distinctio ipsa minus commodi nostrum autem, molestiae, magni perspiciatis dolore quia.</p>
      </div>

      <div className='border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5'>
        <b>Exceptional Service:</b>
        <p className='text-gray-600'>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Soluta ab eos dicta ad molestias dolorum minima asperiores cum reiciendis distinctio ipsa minus commodi nostrum autem, molestiae, magni perspiciatis dolore quia.</p>
      </div>
    </div>

    <NewsletterBox/>

    </div>
  )
}

export default About