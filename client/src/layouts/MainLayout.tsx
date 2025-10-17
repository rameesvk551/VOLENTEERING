import React from 'react';
import Navbar from '../components/Navbar';
import { Outlet } from 'react-router-dom';
import FooterSection from '@/components/HomeComponents/FooterSection';

const MainLayout = () => {
  return (
    <>
      <Navbar />
      <main>
        <Outlet /> {/* This renders nested routes */}
        <FooterSection/>
      </main>
    </>
  );
};

export default MainLayout;
