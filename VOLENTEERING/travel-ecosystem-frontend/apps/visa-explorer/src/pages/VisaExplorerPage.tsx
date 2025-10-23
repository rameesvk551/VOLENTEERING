import React from "react";
import Navbar from "../components/shared/Navbar";

const features = [
  {
    title: "Instant Visa Search",
    description: "Find visa requirements for any country instantly.",
    icon: "🌍",
  },
  {
    title: "Compare Countries",
    description: "Easily compare visa policies and travel options.",
    icon: "🔎",
  },
  {
    title: "Save & Track",
    description: "Bookmark countries and track your travel plans.",
    icon: "⭐",
  },
];

const VisaExplorerPage: React.FC = () => {
  return (
    <>
      <Navbar />
      <main className="pt-24 pb-16 px-4 min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <h1 className="text-5xl font-extrabold text-primary-700 dark:text-primary-400 mb-4 drop-shadow-lg">Visa Explorer</h1>
          <p className="text-xl text-gray-700 dark:text-gray-200 mb-6 max-w-2xl mx-auto">Plan your next adventure with confidence. Instantly check visa requirements, compare countries, and save your favorite destinations.</p>
          <a href="#features" className="btn btn-primary text-lg shadow-lg">Get Started</a>
        </section>

        {/* Features Section */}
        <section id="features" className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {features.map((feature) => (
            <div key={feature.title} className="card p-8 flex flex-col items-center text-center">
              <span className="text-5xl mb-4">{feature.icon}</span>
              <h2 className="text-2xl font-bold text-primary-700 dark:text-primary-400 mb-2">{feature.title}</h2>
              <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
            </div>
          ))}
        </section>

        {/* Call to Action */}
        <section className="text-center mt-12">
          <a href="/compare" className="btn btn-secondary text-lg">Compare Visas</a>
        </section>
      </main>
    </>
  );
};

export default VisaExplorerPage;
