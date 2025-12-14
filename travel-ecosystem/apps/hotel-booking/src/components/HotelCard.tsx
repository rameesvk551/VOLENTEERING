/**
 * Hotel Card Component
 */

import React from 'react';
import { Star, MapPin, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Hotel, HotelSource } from '../types';

interface HotelCardProps {
  hotel: Hotel;
}

export function HotelCard({ hotel }: HotelCardProps) {
  const isInternal = hotel.source === 'INTERNAL';
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
      {/* Hotel Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={hotel.images[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'}
          alt={hotel.name}
          className="w-full h-full object-cover"
        />
        {!isInternal && (
          <div className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded text-xs font-semibold flex items-center gap-1">
            <ExternalLink className="w-3 h-3" />
            Partner
          </div>
        )}
        {isInternal && (
          <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-semibold">
            Book Direct
          </div>
        )}
      </div>

      {/* Hotel Info */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold text-gray-800 line-clamp-2">
            {hotel.name}
          </h3>
          {hotel.starRating && (
            <div className="flex items-center gap-1 text-yellow-500 ml-2">
              {Array.from({ length: hotel.starRating }).map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
          <MapPin className="w-4 h-4" />
          <span>{hotel.city}, {hotel.country}</span>
        </div>

        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
          {hotel.description}
        </p>

        {/* Rating */}
        {hotel.rating > 0 && (
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center gap-1 bg-primary-600 text-white px-2 py-1 rounded font-semibold">
              <Star className="w-4 h-4 fill-current" />
              <span>{hotel.rating.toFixed(1)}</span>
            </div>
            {hotel.reviewCount && (
              <span className="text-sm text-gray-600">
                ({hotel.reviewCount} reviews)
              </span>
            )}
          </div>
        )}

        {/* Amenities */}
        {hotel.amenities && hotel.amenities.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {hotel.amenities.slice(0, 3).map((amenity, index) => (
              <span
                key={index}
                className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
              >
                {amenity}
              </span>
            ))}
            {hotel.amenities.length > 3 && (
              <span className="text-xs text-gray-500">
                +{hotel.amenities.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Price and CTA */}
        <div className="flex items-center justify-between border-t pt-3">
          <div>
            <div className="text-sm text-gray-600">Starting from</div>
            <div className="text-2xl font-bold text-primary-600">
              {hotel.price.currency} {hotel.price.amount}
              <span className="text-sm text-gray-600 font-normal">/night</span>
            </div>
          </div>
          
          <Link
            to={`/hotels/${hotel.id}`}
            className="bg-primary-600 hover:bg-primary-700 text-white font-semibold px-6 py-2 rounded-lg transition-colors"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}
