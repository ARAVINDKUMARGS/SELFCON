import React from 'react';
import HeroSection from '../components/home/HeroSection';
import FeaturedProperties from '../components/home/FeaturedProperties';
import PopularDestinations from '../components/home/PopularDestinations';
import HowItWorks from '../components/home/HowItWorks';
import Testimonials from '../components/home/Testimonials';

const HomePage = () => {
  return (
    <div className="space-y-4">
      <HeroSection />
      <FeaturedProperties />
      <PopularDestinations />
      <HowItWorks />
      <Testimonials />
    </div>
  );
};

export default HomePage;

