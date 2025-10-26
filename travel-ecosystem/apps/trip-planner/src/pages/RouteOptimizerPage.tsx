/**
 * Route Optimizer Page
 * Dedicated page for multi-destination route optimization
 */

import { useState } from 'react';
import { ArrowLeft, Navigation2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import RouteOptimizer from '../components/RouteOptimizer';

export default function RouteOptimizerPage() {
  const navigate = useNavigate();
  const [showOptimizer, setShowOptimizer] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-gray-600 hover:text-gray-900 transition"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </button>
            <h1 className="text-2xl font-bold text-gray-900">AI Route Optimizer</h1>
            <div className="w-20" /> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      {showOptimizer ? (
        /* Optimizer View */
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <button
              onClick={() => setShowOptimizer(false)}
              className="mb-4 flex items-center text-gray-600 hover:text-gray-900 transition bg-white px-4 py-2 rounded-lg shadow-sm"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Overview
            </button>
            <RouteOptimizer />
          </div>
        </div>
      ) : (
        /* Landing View */
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <div className="inline-block p-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-6">
              <Navigation2 className="w-12 h-12 text-white" />
            </div>
            
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Plan Your Perfect Multi-City Journey
            </h2>
            
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              Enter your destinations and let our AI optimize the route, calculate distances,
              and provide personalized travel guides for each stop.
            </p>

            <button
              onClick={() => setShowOptimizer(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition transform hover:scale-105 shadow-lg"
            >
              Start Optimizing →
            </button>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🗺️</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Smart Route Optimization</h3>
              <p className="text-gray-600">
                Our TSP algorithm finds the most efficient path through all your destinations,
                minimizing travel time and distance.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🤖</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">AI Travel Guides</h3>
              <p className="text-gray-600">
                Get AI-powered recommendations for things to do, local cuisine, cultural tips,
                and budget estimates for each stop.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Detailed Analytics</h3>
              <p className="text-gray-600">
                View total distance, estimated duration, budget breakdown, and best times
                to visit each destination.
              </p>
            </div>
          </div>

          {/* How It Works */}
          <div className="mt-16 bg-white rounded-xl p-8 shadow-lg">
            <h3 className="text-2xl font-bold text-center mb-8">How It Works</h3>
            
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-3">
                  1
                </div>
                <h4 className="font-semibold mb-2">Enter Destinations</h4>
                <p className="text-sm text-gray-600">
                  Add 2-10 places you want to visit
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-3">
                  2
                </div>
                <h4 className="font-semibold mb-2">AI Optimizes</h4>
                <p className="text-sm text-gray-600">
                  Algorithm finds the best route
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-pink-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-3">
                  3
                </div>
                <h4 className="font-semibold mb-2">Get Travel Guides</h4>
                <p className="text-sm text-gray-600">
                  Receive AI-powered recommendations
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-3">
                  4
                </div>
                <h4 className="font-semibold mb-2">Export & Travel</h4>
                <p className="text-sm text-gray-600">
                  Save your optimized itinerary
                </p>
              </div>
            </div>
          </div>

          {/* Example */}
          <div className="mt-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">✨ Example Route</h3>
            <p className="mb-4">
              Try optimizing these popular Indian destinations:
            </p>
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur">
              <p className="font-mono text-sm">
                Delhi → Manali → Kasol → Shimla → Chandigarh → Kullu →
                Spiti Valley → Leh → Amritsar → Rishikesh
              </p>
            </div>
            <p className="mt-4 text-sm text-blue-100">
              The optimizer will calculate the shortest route, estimated travel time (~42 hours),
              and provide detailed guides for each destination.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
