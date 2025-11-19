import React from 'react';
import CarouselWrapper from './CarouselWrapper';

export interface TopDestination {
  id: number;
  title: string;
  image: string;
  label: string;
}

interface TopDestinationsCarouselProps {
  data: TopDestination[];
}

const TopDestinationsCarousel: React.FC<TopDestinationsCarouselProps> = ({ data }) => {
  return (
    <CarouselWrapper
      title="Trending Destinations"
      cardWidth="w-[260px] md:w-[300px] lg:w-[320px] xl:w-[340px]"
      cardGap="gap-6 md:gap-7 lg:gap-8"
      className="mb-12"
    >
      {data.map((item) => (
        <div
          key={item.id}
          className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer flex flex-col h-full"
        >
          <div className="relative aspect-[4/3] w-full overflow-hidden">
            <img
              src={item.image}
              alt={item.title}
              className="object-cover w-full h-full group-hover:scale-105 transition-all duration-300"
            />
            <span className="absolute left-3 top-3 bg-black/60 text-white text-xs px-2 py-1 rounded font-semibold tracking-wide">
              {item.label}
            </span>
          </div>
          <div className="p-4 flex flex-col flex-1">
            <h3 className="font-bold text-lg text-gray-900 leading-tight line-clamp-2 mb-1">{item.title}</h3>
          </div>
        </div>
      ))}
    </CarouselWrapper>
  );
};

export default TopDestinationsCarousel;
