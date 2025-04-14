import React from 'react';
import Navbar from '../components/Navbar';
import { Outlet } from 'react-router-dom';

const MainLayout = () => {
  return (
    <>
      <Navbar />
      <main>
        <Outlet /> {/* This renders nested routes */}
      </main>
    </>
  );
};

export default MainLayout;
