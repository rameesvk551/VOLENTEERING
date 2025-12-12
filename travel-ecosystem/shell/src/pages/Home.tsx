import React, { useState } from 'react';

import HeroSection from '../components/Home/HeroSection';
import BenefitsSection from '../components/Home/BenefitsSection';
import FlexibilitySection from '../components/Home/FlexibilitySection';
import RouteFinderSection from '../components/Home/RouteFinderSection';
import Navbar from '../components/Navbar/Navbar';
import Sidebar from '../components/Sidebar/Sidebar';
import Footer from '../components/Footer/Footer';
// Carousel imports
import TopDestinationsCarousel from '../components/Carousel/TopDestinationsCarousel';
import TopAttractionsList from '../components/Carousel/TopAttractionsList';
import ToursCarousel from '../components/Carousel/ToursCarousel';
import WarmDestinationsCarousel from '../components/Carousel/WarmDestinationsCarousel';
import ExcursionsCarousel from '../components/Carousel/ExcursionsCarousel';
import BlogCarousel from '../components/Carousel/BlogCarousel';
import {
  topDestinations,
  topAttractions,
  warmDestinations,
  topTours,
  frenchRivieraExcursions,
  blogPosts,
} from '../components/Carousel/carouselData';

const Home: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="pt-16">
        {/* Viator-inspired section order */}
        <HeroSection />
        <BenefitsSection />
        <TopDestinationsCarousel data={topDestinations} />
        <FlexibilitySection />
        <TopAttractionsList data={topAttractions} />
        <ExcursionsCarousel data={frenchRivieraExcursions} />
        <ToursCarousel data={topTours} />
        <WarmDestinationsCarousel data={warmDestinations} />
        <BlogCarousel data={blogPosts} />
        <RouteFinderSection />
      </div>
      
      <Footer />
    </div>
  );
};

export default Home;
