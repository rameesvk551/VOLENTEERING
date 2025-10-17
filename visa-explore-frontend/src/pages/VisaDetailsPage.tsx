import React from "react";
import Navbar from "../components/shared/Navbar";

const VisaDetailsPage = () => {
  return (
    <>
      <Navbar />
      <main className="pt-24 pb-16 px-4 min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <section className="max-w-2xl mx-auto">
          <div className="card p-10 flex flex-col items-center text-center shadow-xl">
            <span className="text-6xl mb-4">🛂</span>
            <h1 className="text-4xl font-extrabold text-primary-700 dark:text-primary-400 mb-4">Visa Details</h1>
            <p className="text-lg text-gray-700 dark:text-gray-200 mb-6">Detailed information about visa requirements, fees, and processing times for your selected country.</p>
            {/* ...visa details content... */}
            <a href="/compare" className="btn btn-primary text-lg mt-4">Compare with Others</a>
          </div>
        </section>
      </main>
    </>
  );
};

export default VisaDetailsPage;