import React from 'react';
import { Button, cn } from '@/design-system';

/* ========================================
   CTA SECTION
   Call-to-action for signup
   ======================================== */

export const CTASection: React.FC = () => {
  return (
    <section className="py-20 md:py-28">
      <div className="container">
        <div className="relative bg-gradient-to-br from-primary-600 to-primary-800 rounded-3xl overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                  <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100" height="100" fill="url(#grid)" />
            </svg>
          </div>

          {/* Decorative Elements */}
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />

          {/* Content */}
          <div className="relative px-6 py-16 md:px-12 md:py-20 lg:px-20 text-center">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
              Ready to start your journey?
            </h2>
            <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto mb-10 leading-relaxed">
              Join our community of travelers and hosts. Create meaningful connections, 
              learn new skills, and explore the world in a whole new way.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="xl"
                className="bg-white text-primary-700 hover:bg-gray-100 shadow-xl font-semibold"
              >
                Sign Up as Volunteer
              </Button>
              <Button
                size="xl"
                variant="outline"
                className="border-2 border-white text-white hover:bg-white/10 font-semibold"
              >
                Become a Host
              </Button>
            </div>

            {/* Trust Text */}
            <p className="mt-10 text-sm text-white/80 font-medium">
              Free to join • Verified hosts • Secure messaging • 24/7 support
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

/* ========================================
   NEWSLETTER SECTION
   Email subscription
   ======================================== */

export const NewsletterSection: React.FC = () => {
  return (
    <section className="py-12 bg-gray-50 border-t border-gray-100">
      <div className="container">
        <div className="max-w-2xl mx-auto text-center">
          <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
            Get travel inspiration
          </h3>
          <p className="text-gray-600 mb-6">
            Subscribe to our newsletter for the latest opportunities, travel tips, 
            and inspiring volunteer stories.
          </p>

          <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className={cn(
                'flex-1 h-12 px-4 rounded-xl border border-gray-200',
                'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
                'transition-all duration-200'
              )}
            />
            <Button size="lg" className="rounded-xl shrink-0">
              Subscribe
            </Button>
          </form>

          <p className="mt-4 text-xs text-gray-500">
            By subscribing, you agree to our Privacy Policy. Unsubscribe anytime.
          </p>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
