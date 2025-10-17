import Navbar from '@/components/Navbar';
import React from 'react';
import { Outlet } from 'react-router-dom';

const NoFooter = () => {
 return (
     <>
       <Navbar />
       <main>
         <Outlet /> {/* This renders nested routes */}
        
       </main>
     </>
   );
};

export default NoFooter;
