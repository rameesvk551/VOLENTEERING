import React from 'react';
import VisaCard from '../components/molecules/VisaCard';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';

// Dummy data for demonstration
import { VisaType } from '../types/visa.types';
const visas = [
  {
    id: '1',
    destination: { name: 'Japan', flag: '🇯🇵', region: 'Asia', code: 'JP' },
    origin: { name: 'India', flag: '🇮🇳', region: 'Asia', code: 'IN' },
    visaType: 'evisa' as VisaType,
    stayDuration: 90,
  processingTime: { min: 3, max: 7, unit: 'days' },
    fees: { amount: 30, currency: 'USD' },
    complexityScore: 40,
    requirements: [
      { title: 'Passport', description: 'Valid passport required', mandatory: true },
      { title: 'Photo', description: 'Recent passport-size photo', mandatory: true },
      { title: 'Application Form', description: 'Completed visa application form', mandatory: true },
    ],
    lastUpdated: new Date('2025-10-01'),
  },
  {
    id: '2',
    destination: { name: 'France', flag: '🇫🇷', region: 'Europe', code: 'FR' },
    origin: { name: 'India', flag: '🇮🇳', region: 'Asia', code: 'IN' },
    visaType: 'visa-required' as VisaType,
    stayDuration: 60,
  processingTime: { min: 5, max: 10, unit: 'days' },
    fees: { amount: 50, currency: 'EUR' },
    complexityScore: 55,
    requirements: [
      { title: 'Passport', description: 'Valid passport required', mandatory: true },
      { title: 'Invitation Letter', description: 'Letter from French business', mandatory: true },
    ],
    lastUpdated: new Date('2025-09-15'),
  },
  {
    id: '3',
    destination: { name: 'Brazil', flag: '🇧🇷', region: 'South America', code: 'BR' },
    origin: { name: 'India', flag: '🇮🇳', region: 'Asia', code: 'IN' },
    visaType: 'voa' as VisaType,
    stayDuration: 30,
  processingTime: { min: 2, max: 5, unit: 'days' },
    fees: { amount: 20, currency: 'USD' },
    complexityScore: 30,
    requirements: [
      { title: 'Passport', description: 'Valid passport required', mandatory: true },
      { title: 'Photo', description: 'Recent passport-size photo', mandatory: true },
    ],
    lastUpdated: new Date('2025-08-20'),
  },
];

const geoUrl = 'https://raw.githubusercontent.com/deldersveld/topojson/master/world-countries.json';

const VisaExplorer = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4 pb-16">
      {/* Hero Section */}
      <section className="text-center pt-20 pb-10">
        <h1 className="text-5xl font-extrabold text-blue-700 dark:text-purple-400 mb-4 drop-shadow-lg">Visa Explorer</h1>
        <p className="text-xl text-gray-700 dark:text-gray-200 mb-6 max-w-2xl mx-auto">Discover visa requirements, compare countries, and plan your journey with confidence.</p>
        <div className="flex justify-center gap-4 mt-6">
          <input
            type="text"
            placeholder="Search country..."
            className="px-5 py-3 w-64 rounded-full border border-gray-300 shadow focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg"
          />
          <button className="px-6 py-3 rounded-full bg-blue-600 text-white font-semibold text-lg shadow hover:bg-blue-700 transition">Search</button>
        </div>
      </section>

      {/* Beautiful Map View */}
      <section className="max-w-5xl mx-auto mb-16 rounded-2xl overflow-hidden shadow-lg bg-white dark:bg-gray-900">
        <h2 className="text-2xl font-bold text-center py-6 text-blue-700 dark:text-purple-400">Explore Visas by Country</h2>
        <div className="w-full h-[500px]">
          <ComposableMap projectionConfig={{ scale: 140 }} width={900} height={500} style={{ width: '100%', height: '100%' }}>
            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies.map((geo) => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill="#e0e7ff"
                    stroke="#6366f1"
                    style={{
                      default: { outline: 'none' },
                      hover: { fill: '#6366f1', outline: 'none' },
                      pressed: { fill: '#818cf8', outline: 'none' },
                    }}
                  />
                ))
              }
            </Geographies>
          </ComposableMap>
        </div>
      </section>

      {/* Visa Cards Grid */}
      <section className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {visas.map((visa) => (
          <VisaCard key={visa.id} visa={visa} />
        ))}
      </section>
    </div>
  );
};

export default VisaExplorer;