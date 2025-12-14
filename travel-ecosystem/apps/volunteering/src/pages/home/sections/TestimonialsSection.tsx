import React from 'react';
import { cn } from '@/design-system';
import { FallbackImage } from '@/components/FallbackImage';

/* ========================================
   TESTIMONIALS SECTION
   Social proof with volunteer stories
   ======================================== */

const testimonials = [
  {
    id: '1',
    quote: 'This platform changed my life. I spent 3 months volunteering at an eco-farm in Portugal and made friends for life. The experience was authentic, meaningful, and I learned so much about sustainable living.',
    author: 'Sarah Johnson',
    role: 'Digital Nomad',
    location: 'United States',
    avatar: '/images/testimonials/sarah.jpg',
    rating: 5,
  },
  {
    id: '2',
    quote: 'As a host, I\'ve welcomed over 50 volunteers from around the world. The platform makes it easy to find reliable, passionate people who genuinely want to contribute. It\'s been an incredible journey.',
    author: 'Miguel Santos',
    role: 'Eco-Lodge Owner',
    location: 'Costa Rica',
    avatar: '/images/testimonials/miguel.jpg',
    rating: 5,
  },
  {
    id: '3',
    quote: 'I was nervous about my first volunteering trip, but the community here is amazing. The reviews and verification system gave me confidence, and my host went above and beyond to make me feel welcome.',
    author: 'Emma Chen',
    role: 'Teacher',
    location: 'Canada',
    avatar: '/images/testimonials/emma.jpg',
    rating: 5,
  },
];

export const TestimonialsSection: React.FC = () => {
  return (
    <section className="py-20 md:py-28 bg-primary-900 overflow-hidden">
      <div className="container">
        {/* Section Header */}
        <div className="text-center mb-14">
          <span className="inline-block text-sm font-semibold text-primary-300 uppercase tracking-wider mb-3">
            Community Stories
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Loved by travelers worldwide
          </h2>
          <p className="text-primary-100 max-w-2xl mx-auto">
            Join thousands of volunteers and hosts who have created meaningful 
            connections and unforgettable experiences.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {testimonials.map((testimonial) => (
            <TestimonialCard key={testimonial.id} {...testimonial} />
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 pt-12 border-t border-primary-800/60">
          <StatItem value="50K+" label="Active Volunteers" />
          <StatItem value="12K+" label="Verified Hosts" />
          <StatItem value="180+" label="Countries" />
          <StatItem value="4.9" label="Average Rating" />
        </div>
      </div>
    </section>
  );
};

/* Testimonial Card */
interface TestimonialCardProps {
  quote: string;
  author: string;
  role: string;
  location: string;
  avatar: string;
  rating: number;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({
  quote,
  author,
  role,
  location,
  avatar,
  rating,
}) => {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-white/10">
      {/* Rating */}
      <div className="flex gap-1 mb-4">
        {Array.from({ length: rating }).map((_, i) => (
          <svg key={i} className="w-5 h-5 text-amber-400 fill-current" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        ))}
      </div>

      {/* Quote */}
      <blockquote className="text-white leading-relaxed mb-6">
        "{quote}"
      </blockquote>

      {/* Author */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-primary-700 overflow-hidden">
          <FallbackImage
            src={avatar}
            alt={author}
            className="w-full h-full object-cover"
            loading="lazy"
            figureClassName="w-full h-full"
          />
        </div>
        <div>
          <div className="font-semibold text-white">{author}</div>
          <div className="text-sm text-primary-200">
            {role} • {location}
          </div>
        </div>
      </div>
    </div>
  );
};

/* Stat Item */
const StatItem: React.FC<{ value: string; label: string }> = ({ value, label }) => (
  <div className="text-center">
    <div className="text-3xl md:text-4xl font-bold text-white mb-2">{value}</div>
    <div className="text-sm text-primary-200 font-medium">{label}</div>
  </div>
);

export default TestimonialsSection;
