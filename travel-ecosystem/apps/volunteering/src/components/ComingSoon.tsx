import React from 'react';

interface ComingSoonProps {
  feature: string;
  description?: string;
}

const ComingSoon: React.FC<ComingSoonProps> = ({ feature, description }) => (
  <section className="min-h-screen flex items-center justify-center text-center px-4 py-8 bg-gradient-to-br from-blue-50 via-white to-indigo-100">
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <div className="text-8xl animate-bounce mb-4">🚧</div>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4 leading-tight">
          {feature} is Moving In
        </h1>
        <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 mx-auto mb-6 rounded-full"></div>
      </div>
      <p className="text-lg md:text-xl text-gray-600 leading-relaxed mb-8">
        {description ?? 'We are migrating this experience into the standalone volunteering micro-frontend. Check back soon for the fully functional flow.'}
      </p>
      <div className="flex justify-center space-x-4">
        <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
        <div className="w-3 h-3 bg-indigo-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
        <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
      </div>
    </div>
  </section>
);

export default ComingSoon;
