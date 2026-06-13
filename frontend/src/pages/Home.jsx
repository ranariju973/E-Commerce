import React from 'react'
import Hero from '../components/Hero'
import LatestCollection from '../components/LatestCollection'
import BestSeller from '../components/BestSeller'
import OurPolicy from '../components/OurPolicy'
import NewsletterBox from '../components/NewsletterBox'
import AnimateOnScroll from '../components/AnimateOnScroll'

const Home = () => {
  return (
    <div>
      <AnimateOnScroll variant="fadeUp">
        <Hero />
      </AnimateOnScroll>
      <AnimateOnScroll variant="fadeUp" delay={0.1}>
        <LatestCollection />
      </AnimateOnScroll>
      <AnimateOnScroll variant="fadeUp" delay={0.1}>
        <BestSeller />
      </AnimateOnScroll>
      <AnimateOnScroll variant="fadeUp" delay={0.1}>
        <OurPolicy />
      </AnimateOnScroll>
      <AnimateOnScroll variant="fadeUp" delay={0.1}>
        <NewsletterBox />
      </AnimateOnScroll>
    </div>
  )
}

export default Home