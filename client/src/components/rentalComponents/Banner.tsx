import React from 'react';
import { motion } from 'framer-motion';

const Banner = () => {
  return (
    <section
      className="relative h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: 'url(https://your-background-image.jpg)' }}
    >
      {/* Banner Text */}
      <motion.div
        className="text-center text-white backdrop-blur-sm bg-black/30 p-8 rounded-xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <h1 className="text-4xl md:text-6xl font-bold mb-4">Rent Your Adventure Gear!</h1>
        <p className="text-xl md:text-2xl">Travel Light. Explore More.</p>
      </motion.div>
    </section>
  );
};

export default Banner;
