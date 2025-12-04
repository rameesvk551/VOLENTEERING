import React from 'react';
import { MainLayout } from '../../layouts/MainLayout';
import { HeroSection } from './sections/HeroSection';
import { CategoriesSection } from './sections/CategoriesSection';
import { HowItWorksSection } from './sections/HowItWorksSection';
import { FeaturedHostsSection } from './sections/FeaturedHostsSection';
import { TestimonialsSection } from './sections/TestimonialsSection';
import { CTASection, NewsletterSection } from './sections/CTASection';

/* ========================================
   HOME PAGE
   Landing page with all sections
   ======================================== */

const HomePage: React.FC = () => {
  return (
    <MainLayout transparentHeader>
      {/* Hero with Search */}
      <HeroSection />

      {/* Browse Categories */}
      <CategoriesSection />

      {/* Featured Hosts */}
      <FeaturedHostsSection />

      {/* How It Works */}
      <HowItWorksSection />

      {/* Testimonials */}
      <TestimonialsSection />

      {/* Call to Action */}
      <CTASection />

      {/* Newsletter */}
      <NewsletterSection />
    </MainLayout>
  );
};

export default HomePage;
