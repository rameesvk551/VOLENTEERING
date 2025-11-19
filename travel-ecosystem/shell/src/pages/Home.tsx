import React, { useState } from 'react';

import HeroSection from '../components/Home/HeroSection';
import FeaturesSection from '../components/Home/FeaturesSection';
import DestinationsSection from '../components/Home/DestinationsSection';
import ServicesSection from '../components/Home/ServicesSection';
import CallToActionSection from '../components/Home/CallToActionSection';
import Navbar from '../components/Navbar/Navbar';
import Sidebar from '../components/Sidebar/Sidebar';
// Carousel imports
import TopActivitiesCarousel from '../components/Carousel/TopActivitiesCarousel';
import RelatedProductsCarousel from '../components/Carousel/RelatedProductsCarousel';
import TopDestinationsCarousel from '../components/Carousel/TopDestinationsCarousel';
import TopAttractionsList from '../components/Carousel/TopAttractionsList';
import WarmDestinationsCarousel from '../components/Carousel/WarmDestinationsCarousel';
import {
  topActivities,
  relatedProducts,
  topDestinations,
  topAttractions,
  warmDestinations,
} from '../components/Carousel/carouselData';

const Home: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-purple-50">
      <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="pt-16 space-y-16 md:space-y-20">
        <HeroSection />
        <TopActivitiesCarousel data={topActivities} />
        <TopDestinationsCarousel data={topDestinations} />
        <WarmDestinationsCarousel data={warmDestinations} />
        <TopAttractionsList data={topAttractions} />
        <RelatedProductsCarousel data={relatedProducts} />
        <FeaturesSection />
        <DestinationsSection />
        <ServicesSection />
        <CallToActionSection />
      </div>
    </div>
  );
};

export default Home;
