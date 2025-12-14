import React, { useState } from 'react';
import { MainLayout } from '../../layouts/MainLayout';
import { Button, Badge, Avatar, Breadcrumbs, cn } from '../../design-system';

/* ========================================
   OPPORTUNITY DETAILS PAGE
   Full details of a volunteering opportunity
   ======================================== */

const OpportunityDetailsPage: React.FC = () => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const images = [
    '/images/opportunities/detail-1.jpg',
    '/images/opportunities/detail-2.jpg',
    '/images/opportunities/detail-3.jpg',
    '/images/opportunities/detail-4.jpg',
    '/images/opportunities/detail-5.jpg',
  ];

  const opportunity = {
    title: 'Organic Farm & Permaculture Experience in the Hills of Sintra',
    location: 'Sintra, Portugal',
    rating: 4.9,
    reviews: 127,
    superhost: true,
    verified: true,
    hostName: 'Maria & João',
    hostImage: '/images/hosts/maria-joao.jpg',
    memberSince: 'January 2019',
    responseRate: 98,
    responseTime: 'within a few hours',
  };

  return (
    <MainLayout>
      {/* Breadcrumbs */}
      <div className="container pt-4">
        <Breadcrumbs
          items={[
            { label: 'Explore', href: '/explore' },
            { label: 'Portugal', href: '/explore?country=portugal' },
            { label: 'Sintra', href: '/explore?location=sintra' },
            { label: opportunity.title },
          ]}
        />
      </div>

      {/* Image Gallery */}
      <ImageGallery images={images} />

      <div className="container py-8">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Title Section */}
            <TitleSection opportunity={opportunity} />

            {/* Quick Info */}
            <QuickInfoSection />

            {/* Description */}
            <DescriptionSection />

            {/* Help Needed */}
            <HelpNeededSection />

            {/* What You'll Get */}
            <AccommodationSection />

            {/* Location */}
            <LocationSection />

            {/* Reviews */}
            <ReviewsSection rating={opportunity.rating} reviews={opportunity.reviews} />

            {/* Host Profile */}
            <HostProfileSection opportunity={opportunity} />
          </div>

          {/* Sticky Sidebar */}
          <div className="lg:w-[380px] shrink-0">
            <ApplyCard opportunity={opportunity} />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

/* Image Gallery */
const ImageGallery: React.FC<{ images: string[] }> = ({ images }) => {
  return (
    <section className="container mt-6">
      <div className="grid grid-cols-4 gap-2 rounded-2xl overflow-hidden h-[400px] md:h-[480px]">
        {/* Main Image */}
        <div className="col-span-2 row-span-2 relative group">
          <img
            src={images[0]}
            alt="Main"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
        </div>

        {/* Smaller Images */}
        {images.slice(1, 5).map((img, i) => (
          <div key={i} className="relative group">
            <img
              src={img}
              alt={`Gallery ${i + 2}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
          </div>
        ))}

        {/* View All Button */}
        <button className="absolute bottom-4 right-4 px-4 py-2 bg-white rounded-lg shadow-lg text-sm font-medium hover:scale-105 transition-transform">
          View all photos
        </button>
      </div>
    </section>
  );
};

/* Title Section */
const TitleSection: React.FC<{ opportunity: any }> = ({ opportunity }) => {
  return (
    <section className="mb-8 pb-8 border-b border-gray-200">
      <div className="flex flex-wrap gap-2 mb-3">
        {opportunity.superhost && (
          <Badge variant="primary">⭐ Superhost</Badge>
        )}
        {opportunity.verified && (
          <Badge variant="success" dot>Verified</Badge>
        )}
        <Badge variant="default">Instant Response</Badge>
      </div>

      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
        {opportunity.title}
      </h1>

      <div className="flex flex-wrap items-center gap-4 text-sm">
        <div className="flex items-center gap-1">
          <svg className="w-5 h-5 text-amber-400 fill-current" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          <span className="font-semibold">{opportunity.rating}</span>
          <span className="text-gray-500">({opportunity.reviews} reviews)</span>
        </div>
        <span className="text-gray-300">•</span>
        <a href="#location" className="text-gray-600 hover:underline flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          </svg>
          {opportunity.location}
        </a>
      </div>
    </section>
  );
};

/* Quick Info Section */
const QuickInfoSection: React.FC = () => {
  const quickInfo = [
    { icon: '🗓️', label: 'Duration', value: '2-8 weeks' },
    { icon: '⏰', label: 'Hours', value: '5 hours/day, 5 days/week' },
    { icon: '👥', label: 'Volunteers', value: 'Up to 3 at a time' },
    { icon: '🌍', label: 'Language', value: 'English, Portuguese' },
  ];

  return (
    <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 p-6 bg-gray-50 rounded-2xl">
      {quickInfo.map((item) => (
        <div key={item.label} className="text-center">
          <span className="text-2xl mb-2 block">{item.icon}</span>
          <p className="text-sm text-gray-500">{item.label}</p>
          <p className="font-semibold text-gray-900">{item.value}</p>
        </div>
      ))}
    </section>
  );
};

/* Description Section */
const DescriptionSection: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <section className="mb-8 pb-8 border-b border-gray-200">
      <h2 className="text-xl font-bold text-gray-900 mb-4">About this opportunity</h2>
      
      <div className={cn('prose prose-gray max-w-none', !isExpanded && 'line-clamp-6')}>
        <p>
          Welcome to our organic farm nestled in the beautiful hills of Sintra, just 30 minutes 
          from Lisbon. We are Maria and João, passionate about sustainable living and permaculture.
        </p>
        <p>
          Our 5-hectare property includes organic vegetable gardens, fruit orchards, a medicinal 
          herb garden, and a small forest. We've been practicing permaculture principles for over 
          10 years and love sharing our knowledge with curious travelers.
        </p>
        <p>
          As a volunteer, you'll be part of our daily farm life, learning practical skills while 
          contributing to a sustainable way of living. We believe in the exchange of knowledge and 
          cultures, and we've hosted over 200 volunteers from all around the world.
        </p>
        <p>
          The atmosphere here is relaxed and family-oriented. We share meals together, often made 
          with produce from our own garden. In your free time, you can explore the mystical Sintra 
          mountains, visit the stunning palaces, or take a short trip to nearby beaches.
        </p>
      </div>

      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="mt-4 text-primary-600 font-semibold hover:text-primary-700 flex items-center gap-1"
      >
        {isExpanded ? 'Show less' : 'Read more'}
        <svg
          className={cn('w-4 h-4 transition-transform', isExpanded && 'rotate-180')}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    </section>
  );
};

/* Help Needed Section */
const HelpNeededSection: React.FC = () => {
  const skills = [
    { name: 'Gardening', required: true },
    { name: 'Cooking', required: false },
    { name: 'General Help', required: true },
    { name: 'Language Exchange', required: false },
    { name: 'Building & Construction', required: false },
  ];

  return (
    <section className="mb-8 pb-8 border-b border-gray-200">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Help needed</h2>
      
      <div className="space-y-4">
        <p className="text-gray-600">
          We're looking for enthusiastic volunteers to help with various farm activities. 
          No prior experience needed - just bring your curiosity and willingness to learn!
        </p>

        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <Badge
              key={skill.name}
              variant={skill.required ? 'primary' : 'default'}
              dot={skill.required}
            >
              {skill.name}
            </Badge>
          ))}
        </div>

        <div className="bg-primary-50 rounded-xl p-4 mt-4">
          <h4 className="font-semibold text-primary-900 mb-2">Typical tasks include:</h4>
          <ul className="space-y-2 text-primary-800">
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-primary-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Planting, weeding, and harvesting vegetables
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-primary-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Caring for fruit trees and composting
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-primary-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Helping prepare farm-to-table meals
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-primary-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Light construction and maintenance projects
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
};

/* Accommodation Section */
const AccommodationSection: React.FC = () => {
  const amenities = [
    { icon: '🛏️', text: 'Private room' },
    { icon: '🍽️', text: '3 meals/day' },
    { icon: '📶', text: 'WiFi available' },
    { icon: '🧺', text: 'Laundry access' },
    { icon: '🚿', text: 'Shared bathroom' },
    { icon: '🌳', text: 'Garden access' },
    { icon: '🚗', text: 'Pickup from station' },
    { icon: '📚', text: 'Library' },
  ];

  return (
    <section className="mb-8 pb-8 border-b border-gray-200">
      <h2 className="text-xl font-bold text-gray-900 mb-4">What you'll get</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {amenities.map((amenity) => (
          <div
            key={amenity.text}
            className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
          >
            <span className="text-xl">{amenity.icon}</span>
            <span className="text-sm text-gray-700">{amenity.text}</span>
          </div>
        ))}
      </div>
    </section>
  );
};

/* Location Section */
const LocationSection: React.FC = () => {
  return (
    <section id="location" className="mb-8 pb-8 border-b border-gray-200">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Location</h2>
      
      <div className="h-[300px] bg-gray-100 rounded-2xl mb-4 flex items-center justify-center">
        <p className="text-gray-500">Map - Integrate with Leaflet/Mapbox</p>
      </div>

      <div className="flex items-start gap-3">
        <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        </svg>
        <div>
          <p className="font-medium text-gray-900">Sintra, Lisbon District, Portugal</p>
          <p className="text-sm text-gray-500 mt-1">
            30 min from Lisbon by train • 20 min from beaches • Walking distance to village
          </p>
        </div>
      </div>
    </section>
  );
};

/* Reviews Section */
const ReviewsSection: React.FC<{ rating: number; reviews: number }> = ({ rating, reviews }) => {
  const sampleReviews = [
    {
      id: '1',
      author: 'Sarah J.',
      avatar: '/images/reviews/sarah.jpg',
      date: 'November 2024',
      rating: 5,
      text: 'Amazing experience! Maria and João are incredibly welcoming hosts. I learned so much about permaculture and sustainable living. The food was delicious and the location is beautiful.',
    },
    {
      id: '2',
      author: 'Thomas K.',
      avatar: '/images/reviews/thomas.jpg',
      date: 'October 2024',
      rating: 5,
      text: 'Spent 3 weeks here and it was life-changing. The farm is beautiful, the work is meaningful, and the hosts treat you like family. Highly recommend!',
    },
  ];

  return (
    <section className="mb-8 pb-8 border-b border-gray-200">
      <div className="flex items-center gap-4 mb-6">
        <h2 className="text-xl font-bold text-gray-900">Reviews</h2>
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-amber-400 fill-current" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          <span className="font-bold text-lg">{rating}</span>
          <span className="text-gray-500">({reviews} reviews)</span>
        </div>
      </div>

      <div className="space-y-6">
        {sampleReviews.map((review) => (
          <div key={review.id} className="flex gap-4">
            <Avatar src={review.avatar} name={review.author} size="md" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-gray-900">{review.author}</span>
                <span className="text-sm text-gray-500">{review.date}</span>
              </div>
              <div className="flex gap-0.5 mb-2">
                {Array.from({ length: review.rating }).map((_, i) => (
                  <svg key={i} className="w-4 h-4 text-amber-400 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-600">{review.text}</p>
            </div>
          </div>
        ))}
      </div>

      <Button variant="outline" className="mt-6">
        Show all {reviews} reviews
      </Button>
    </section>
  );
};

/* Host Profile Section */
const HostProfileSection: React.FC<{ opportunity: any }> = ({ opportunity }) => {
  return (
    <section className="mb-8">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Meet your hosts</h2>
      
      <div className="flex flex-col md:flex-row gap-6 p-6 bg-gray-50 rounded-2xl">
        <div className="flex items-center gap-4">
          <Avatar src={opportunity.hostImage} name={opportunity.hostName} size="2xl" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{opportunity.hostName}</h3>
            {opportunity.superhost && (
              <Badge variant="primary" size="sm" className="mt-1">⭐ Superhost</Badge>
            )}
          </div>
        </div>

        <div className="flex-1">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-500">Member since</p>
              <p className="font-medium">{opportunity.memberSince}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Response rate</p>
              <p className="font-medium">{opportunity.responseRate}%</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Response time</p>
              <p className="font-medium">{opportunity.responseTime}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Languages</p>
              <p className="font-medium">English, Portuguese</p>
            </div>
          </div>

          <Button variant="outline">
            Contact Host
          </Button>
        </div>
      </div>
    </section>
  );
};

/* Apply Card (Sticky Sidebar) */
const ApplyCard: React.FC<{ opportunity: any }> = ({ opportunity }) => {
  return (
    <div className="sticky top-[160px]">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm text-gray-500">Duration</p>
            <p className="text-xl font-bold text-gray-900">2-8 weeks</p>
          </div>
          <Badge variant="success" dot>Available Now</Badge>
        </div>

        {/* Date Selection */}
        <div className="space-y-4 mb-6">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 border border-gray-200 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Arrival</p>
              <p className="font-medium">Select date</p>
            </div>
            <div className="p-3 border border-gray-200 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Departure</p>
              <p className="font-medium">Select date</p>
            </div>
          </div>

          <div className="p-3 border border-gray-200 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">Travelers</p>
            <p className="font-medium">1 volunteer</p>
          </div>
        </div>

        <Button fullWidth size="lg" className="mb-4">
          Apply Now
        </Button>

        <Button fullWidth variant="outline" size="lg">
          Save to Wishlist
        </Button>

        <p className="text-center text-sm text-gray-500 mt-4">
          Free to apply • No commitment yet
        </p>

        {/* Quick Info */}
        <div className="mt-6 pt-6 border-t border-gray-100 space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-gray-600">Verified host</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-gray-600">Responds within hours</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-gray-600">127 positive reviews</span>
          </div>
        </div>
      </div>

      {/* Report Link */}
      <div className="text-center mt-4">
        <button className="text-sm text-gray-400 hover:text-gray-600 underline">
          Report this listing
        </button>
      </div>
    </div>
  );
};

export default OpportunityDetailsPage;
