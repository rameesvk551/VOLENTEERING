import { VisaInfo, Country } from '../types/visa.types';

// Popular Countries
export const countries: Country[] = [
  { code: 'IND', name: 'India', flag: '🇮🇳', region: 'Asia', population: 1400000000 },
  { code: 'USA', name: 'United States', flag: '🇺🇸', region: 'Americas', population: 331000000 },
  { code: 'GBR', name: 'United Kingdom', flag: '🇬🇧', region: 'Europe', population: 67000000 },
  { code: 'THA', name: 'Thailand', flag: '🇹🇭', region: 'Asia', population: 70000000 },
  { code: 'JPN', name: 'Japan', flag: '🇯🇵', region: 'Asia', population: 125000000 },
  { code: 'SGP', name: 'Singapore', flag: '🇸🇬', region: 'Asia', population: 6000000 },
  { code: 'AUS', name: 'Australia', flag: '🇦🇺', region: 'Oceania', population: 26000000 },
  { code: 'CAN', name: 'Canada', flag: '🇨🇦', region: 'Americas', population: 38000000 },
  { code: 'DEU', name: 'Germany', flag: '🇩🇪', region: 'Europe', population: 83000000 },
  { code: 'FRA', name: 'France', flag: '🇫🇷', region: 'Europe', population: 67000000 },
  { code: 'ESP', name: 'Spain', flag: '🇪🇸', region: 'Europe', population: 47000000 },
  { code: 'ITA', name: 'Italy', flag: '🇮🇹', region: 'Europe', population: 59000000 },
  { code: 'BRA', name: 'Brazil', flag: '🇧🇷', region: 'Americas', population: 214000000 },
  { code: 'MEX', name: 'Mexico', flag: '🇲🇽', region: 'Americas', population: 130000000 },
  { code: 'ARE', name: 'United Arab Emirates', flag: '🇦🇪', region: 'Asia', population: 10000000 },
  { code: 'TUR', name: 'Turkey', flag: '🇹🇷', region: 'Europe', population: 85000000 },
  { code: 'CHN', name: 'China', flag: '🇨🇳', region: 'Asia', population: 1400000000 },
  { code: 'KOR', name: 'South Korea', flag: '🇰🇷', region: 'Asia', population: 52000000 },
  { code: 'IDN', name: 'Indonesia', flag: '🇮🇩', region: 'Asia', population: 275000000 },
  { code: 'MYS', name: 'Malaysia', flag: '🇲🇾', region: 'Asia', population: 33000000 },
  { code: 'VNM', name: 'Vietnam', flag: '🇻🇳', region: 'Asia', population: 98000000 },
  { code: 'PHL', name: 'Philippines', flag: '🇵🇭', region: 'Asia', population: 113000000 },
  { code: 'EGY', name: 'Egypt', flag: '🇪🇬', region: 'Africa', population: 104000000 },
  { code: 'ZAF', name: 'South Africa', flag: '🇿🇦', region: 'Africa', population: 60000000 },
  { code: 'NZL', name: 'New Zealand', flag: '🇳🇿', region: 'Oceania', population: 5000000 },
];

// Find country by code
export const findCountry = (code: string): Country => {
  return countries.find(c => c.code === code) || countries[0];
};

// Dummy Visa Data (From India to various countries)
export const dummyVisas: VisaInfo[] = [
  {
    id: '1',
    origin: findCountry('IND'),
    destination: findCountry('THA'),
    visaType: 'voa',
    stayDuration: 30,
    validityPeriod: 30,
    fees: { amount: 35, currency: 'USD' },
    processingTime: { min: 0, max: 0, unit: 'days' },
    complexityScore: 25,
    requirements: [
      { title: 'Valid Passport', description: 'Passport valid for at least 6 months', mandatory: true },
      { title: 'Return Ticket', description: 'Proof of onward or return travel', mandatory: true },
      { title: 'Proof of Funds', description: 'Bank statements or cash ($10,000 equivalent)', mandatory: true },
      { title: 'Hotel Booking', description: 'Confirmed accommodation reservation', mandatory: false },
    ],
    embassy: {
      name: 'Royal Thai Embassy',
      address: '56-N, Nyaya Marg, Chanakyapuri, New Delhi - 110021',
      phone: '+91-11-2611-8103',
      email: 'thaindel@thaiembassy.org',
      website: 'https://newdelhi.thaiembassy.org',
    },
    lastUpdated: new Date('2025-10-01'),
  },
  {
    id: '2',
    origin: findCountry('IND'),
    destination: findCountry('JPN'),
    visaType: 'visa-required',
    stayDuration: 90,
    validityPeriod: 90,
    fees: { amount: 25, currency: 'USD' },
    processingTime: { min: 5, max: 7, unit: 'days' },
    complexityScore: 45,
    requirements: [
      { title: 'Valid Passport', description: 'Passport valid for duration of stay', mandatory: true },
      { title: 'Visa Application Form', description: 'Completed and signed application', mandatory: true },
      { title: 'Passport Photos', description: '2 recent passport-size photographs', mandatory: true },
      { title: 'Flight Itinerary', description: 'Confirmed round-trip tickets', mandatory: true },
      { title: 'Financial Proof', description: 'Bank statements for last 3 months', mandatory: true },
      { title: 'Hotel Reservations', description: 'Confirmed accommodation', mandatory: true },
    ],
    embassy: {
      name: 'Embassy of Japan',
      address: '50-G, Chanakyapuri, New Delhi - 110021',
      phone: '+91-11-2687-6564',
      email: 'infojpemb@nd.mofa.go.jp',
      website: 'https://www.in.emb-japan.go.jp',
    },
    lastUpdated: new Date('2025-09-28'),
  },
  {
    id: '3',
    origin: findCountry('IND'),
    destination: findCountry('SGP'),
    visaType: 'evisa',
    stayDuration: 30,
    validityPeriod: 60,
    fees: { amount: 30, currency: 'SGD' },
    processingTime: { min: 1, max: 3, unit: 'days' },
    complexityScore: 20,
    requirements: [
      { title: 'Valid Passport', description: 'Passport valid for at least 6 months', mandatory: true },
      { title: 'Online Application', description: 'Complete e-visa application online', mandatory: true },
      { title: 'Passport Photo', description: 'Recent digital photograph', mandatory: true },
      { title: 'Travel Itinerary', description: 'Flight and hotel bookings', mandatory: true },
    ],
    embassy: {
      name: 'High Commission of Singapore',
      address: 'E-6, Chandragupta Marg, Chanakyapuri, New Delhi - 110021',
      phone: '+91-11-4600-5000',
      email: 'singhc_del@mfa.gov.sg',
      website: 'https://www.mfa.gov.sg/newdelhi',
    },
    lastUpdated: new Date('2025-10-10'),
  },
  {
    id: '4',
    origin: findCountry('IND'),
    destination: findCountry('ARE'),
    visaType: 'evisa',
    stayDuration: 60,
    validityPeriod: 60,
    fees: { amount: 60, currency: 'USD' },
    processingTime: { min: 2, max: 4, unit: 'days' },
    complexityScore: 15,
    requirements: [
      { title: 'Valid Passport', description: 'Passport valid for at least 6 months', mandatory: true },
      { title: 'E-visa Application', description: 'Online visa application', mandatory: true },
      { title: 'Passport Photo', description: 'Digital photograph', mandatory: true },
    ],
    lastUpdated: new Date('2025-10-12'),
  },
  {
    id: '5',
    origin: findCountry('IND'),
    destination: findCountry('USA'),
    visaType: 'visa-required',
    stayDuration: 180,
    validityPeriod: 3650, // 10 years
    fees: { amount: 185, currency: 'USD' },
    processingTime: { min: 14, max: 30, unit: 'days' },
    complexityScore: 85,
    requirements: [
      { title: 'Valid Passport', description: 'Passport valid for at least 6 months beyond stay', mandatory: true },
      { title: 'DS-160 Form', description: 'Completed online nonimmigrant visa application', mandatory: true },
      { title: 'Interview Appointment', description: 'Scheduled embassy interview', mandatory: true },
      { title: 'Passport Photos', description: '2x2 inch photos (recent)', mandatory: true },
      { title: 'Financial Documents', description: 'Bank statements, pay slips, tax returns', mandatory: true },
      { title: 'Travel Itinerary', description: 'Detailed travel plans', mandatory: true },
      { title: 'Employment Letter', description: 'Letter from employer', mandatory: false },
    ],
    embassy: {
      name: 'U.S. Embassy',
      address: 'Shantipath, Chanakyapuri, New Delhi - 110021',
      phone: '+91-11-2419-8000',
      email: 'support-india@ustraveldocs.com',
      website: 'https://in.usembassy.gov',
    },
    lastUpdated: new Date('2025-10-05'),
  },
  {
    id: '6',
    origin: findCountry('IND'),
    destination: findCountry('GBR'),
    visaType: 'visa-required',
    stayDuration: 180,
    validityPeriod: 180,
    fees: { amount: 115, currency: 'GBP' },
    processingTime: { min: 15, max: 21, unit: 'days' },
    complexityScore: 70,
    requirements: [
      { title: 'Valid Passport', description: 'Passport valid for duration of stay', mandatory: true },
      { title: 'Online Application', description: 'Completed UK visa application', mandatory: true },
      { title: 'Biometric Appointment', description: 'Fingerprints and photograph', mandatory: true },
      { title: 'Financial Proof', description: 'Bank statements for 6 months', mandatory: true },
      { title: 'Travel History', description: 'Previous travel documents', mandatory: false },
      { title: 'Accommodation Proof', description: 'Hotel bookings or invitation letter', mandatory: true },
    ],
    embassy: {
      name: 'British High Commission',
      address: 'Shantipath, Chanakyapuri, New Delhi - 110021',
      phone: '+91-11-2419-2100',
      email: 'bhcinfo.newdelhi@fcdo.gov.uk',
      website: 'https://www.gov.uk/world/india',
    },
    lastUpdated: new Date('2025-09-30'),
  },
  {
    id: '7',
    origin: findCountry('IND'),
    destination: findCountry('AUS'),
    visaType: 'evisa',
    stayDuration: 90,
    validityPeriod: 365,
    fees: { amount: 20, currency: 'AUD' },
    processingTime: { min: 1, max: 3, unit: 'days' },
    complexityScore: 30,
    requirements: [
      { title: 'Valid Passport', description: 'Passport valid for at least 6 months', mandatory: true },
      { title: 'ETA Application', description: 'Electronic Travel Authority online', mandatory: true },
      { title: 'Health Declaration', description: 'Health and character requirements', mandatory: true },
    ],
    lastUpdated: new Date('2025-10-08'),
  },
  {
    id: '8',
    origin: findCountry('IND'),
    destination: findCountry('CAN'),
    visaType: 'evisa',
    stayDuration: 180,
    validityPeriod: 1825, // 5 years
    fees: { amount: 7, currency: 'CAD' },
    processingTime: { min: 3, max: 7, unit: 'days' },
    complexityScore: 25,
    requirements: [
      { title: 'Valid Passport', description: 'Passport valid for duration of stay', mandatory: true },
      { title: 'eTA Application', description: 'Electronic Travel Authorization online', mandatory: true },
      { title: 'Email Address', description: 'Valid email for eTA confirmation', mandatory: true },
    ],
    lastUpdated: new Date('2025-10-11'),
  },
  {
    id: '9',
    origin: findCountry('IND'),
    destination: findCountry('DEU'),
    visaType: 'visa-required',
    stayDuration: 90,
    validityPeriod: 180,
    fees: { amount: 80, currency: 'EUR' },
    processingTime: { min: 10, max: 15, unit: 'days' },
    complexityScore: 60,
    requirements: [
      { title: 'Valid Passport', description: 'Passport valid for at least 3 months beyond stay', mandatory: true },
      { title: 'Schengen Visa Application', description: 'Completed application form', mandatory: true },
      { title: 'Passport Photos', description: 'Recent biometric photographs', mandatory: true },
      { title: 'Travel Insurance', description: 'Coverage of €30,000 minimum', mandatory: true },
      { title: 'Flight Reservations', description: 'Round-trip tickets', mandatory: true },
      { title: 'Accommodation Proof', description: 'Hotel bookings or invitation', mandatory: true },
      { title: 'Financial Proof', description: 'Bank statements', mandatory: true },
    ],
    embassy: {
      name: 'German Embassy',
      address: '6/50G, Shantipath, Chanakyapuri, New Delhi - 110021',
      phone: '+91-11-4419-9199',
      email: 'info@new-delhi.diplo.de',
      website: 'https://india.diplo.de',
    },
    lastUpdated: new Date('2025-10-03'),
  },
  {
    id: '10',
    origin: findCountry('IND'),
    destination: findCountry('BRA'),
    visaType: 'evisa',
    stayDuration: 90,
    validityPeriod: 365,
    fees: { amount: 80, currency: 'USD' },
    processingTime: { min: 5, max: 10, unit: 'days' },
    complexityScore: 35,
    requirements: [
      { title: 'Valid Passport', description: 'Passport valid for at least 6 months', mandatory: true },
      { title: 'E-visa Application', description: 'Online visa application', mandatory: true },
      { title: 'Passport Photo', description: 'Recent digital photograph', mandatory: true },
      { title: 'Yellow Fever Certificate', description: 'Vaccination certificate (if applicable)', mandatory: false },
    ],
    lastUpdated: new Date('2025-10-09'),
  },
  {
    id: '11',
    origin: findCountry('IND'),
    destination: findCountry('TUR'),
    visaType: 'evisa',
    stayDuration: 90,
    validityPeriod: 180,
    fees: { amount: 50, currency: 'USD' },
    processingTime: { min: 1, max: 2, unit: 'days' },
    complexityScore: 18,
    requirements: [
      { title: 'Valid Passport', description: 'Passport valid for at least 6 months', mandatory: true },
      { title: 'E-visa Application', description: 'Online application', mandatory: true },
      { title: 'Passport Photo', description: 'Digital photograph', mandatory: true },
    ],
    lastUpdated: new Date('2025-10-13'),
  },
  {
    id: '12',
    origin: findCountry('IND'),
    destination: findCountry('IDN'),
    visaType: 'voa',
    stayDuration: 30,
    validityPeriod: 30,
    fees: { amount: 35, currency: 'USD' },
    processingTime: { min: 0, max: 0, unit: 'days' },
    complexityScore: 22,
    requirements: [
      { title: 'Valid Passport', description: 'Passport valid for at least 6 months', mandatory: true },
      { title: 'Return Ticket', description: 'Proof of onward travel', mandatory: true },
      { title: 'Cash Payment', description: 'Visa fee in USD', mandatory: true },
    ],
    lastUpdated: new Date('2025-10-07'),
  },
];

// Get visas by complexity level
export const getVisasByComplexity = (level: 'easy' | 'moderate' | 'complex'): VisaInfo[] => {
  if (level === 'easy') {
    return dummyVisas.filter(v => v.complexityScore <= 30);
  } else if (level === 'moderate') {
    return dummyVisas.filter(v => v.complexityScore > 30 && v.complexityScore <= 60);
  } else {
    return dummyVisas.filter(v => v.complexityScore > 60);
  }
};

// Get visas by type
export const getVisasByType = (type: string): VisaInfo[] => {
  return dummyVisas.filter(v => v.visaType === type);
};

// Get visas by region
export const getVisasByRegion = (region: string): VisaInfo[] => {
  return dummyVisas.filter(v => v.destination.region === region);
};

// Search visas by country name
export const searchVisas = (query: string): VisaInfo[] => {
  const lowerQuery = query.toLowerCase();
  return dummyVisas.filter(v =>
    v.destination.name.toLowerCase().includes(lowerQuery) ||
    v.destination.code.toLowerCase().includes(lowerQuery)
  );
};
