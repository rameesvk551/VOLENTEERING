import React from 'react';
import { cn } from '@/design-system';

/* ========================================
   HOW IT WORKS SECTION
   Step-by-step guide
   ======================================== */

const steps = [
  {
    step: 1,
    title: 'Create Your Profile',
    description: 'Sign up and tell us about your skills, interests, and travel preferences. The more detailed, the better matches you\'ll get.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    step: 2,
    title: 'Discover Opportunities',
    description: 'Browse thousands of verified hosts worldwide. Filter by location, type of work, duration, and accommodation.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
  },
  {
    step: 3,
    title: 'Connect & Apply',
    description: 'Send applications to hosts that interest you. Chat directly to discuss details and expectations before committing.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
  },
  {
    step: 4,
    title: 'Travel & Volunteer',
    description: 'Pack your bags and embark on a life-changing adventure. Exchange your skills for accommodation and cultural experiences.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

export const HowItWorksSection: React.FC = () => {
  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="container">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block text-sm font-semibold text-primary-600 uppercase tracking-wider mb-3">
            Simple Process
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            How it works
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Start your volunteering journey in four simple steps. 
            We've made it easy to connect with amazing hosts around the world.
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {steps.map((step, index) => (
            <StepCard key={step.step} {...step} isLast={index === steps.length - 1} />
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-14">
          <a
            href="/signup"
            className={cn(
              'inline-flex items-center gap-2 px-8 py-4',
              'bg-primary-500 text-white font-semibold rounded-xl',
              'hover:bg-primary-600 hover:shadow-lg hover:shadow-primary-500/25',
              'transition-all duration-300'
            )}
          >
            Get Started Free
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
};

/* Step Card */
interface StepCardProps {
  step: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  isLast: boolean;
}

const StepCard: React.FC<StepCardProps> = ({
  step,
  title,
  description,
  icon,
  isLast,
}) => {
  return (
    <div className="relative">
      {/* Connector Line */}
      {!isLast && (
        <div className="hidden lg:block absolute top-10 left-[calc(50%+40px)] w-[calc(100%-80px)] h-0.5 bg-gradient-to-r from-primary-200 to-primary-100" />
      )}

      <div className="text-center">
        {/* Step Number & Icon */}
        <div className="relative inline-flex mb-6">
          <div className="w-20 h-20 rounded-2xl bg-primary-50 flex items-center justify-center text-primary-600">
            {icon}
          </div>
          <span className="absolute -top-2 -right-2 w-8 h-8 bg-primary-500 text-white text-sm font-bold rounded-full flex items-center justify-center shadow-lg">
            {step}
          </span>
        </div>

        {/* Content */}
        <h3 className="text-xl font-semibold text-gray-900 mb-3">
          {title}
        </h3>
        <p className="text-gray-600 leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
};

export default HowItWorksSection;
