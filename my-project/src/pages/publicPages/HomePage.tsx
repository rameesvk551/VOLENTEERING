import React from 'react'
import FeaturesSection from '../../components/HomeComponents/FeaturesSection'
import HeroSection from '../../components/HomeComponents/HeroSection'
import CallToActionSection from '../../components/HomeComponents/CallToActionSection'
import FooterSection from '../../components/HomeComponents/FooterSection'
import DiscoverSection from '../../components/HomeComponents/DiscoverSection'
import BlogSection from '../../components/HomeComponents/BlogSection'

const HomePage = () => {
  return (
    <div>
        <HeroSection />
            <FeaturesSection />
            <DiscoverSection />
            <BlogSection/>
            <CallToActionSection />
            <FooterSection />
    </div>
  )
}

export default HomePage
