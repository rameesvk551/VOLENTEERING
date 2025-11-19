import React from 'react';

export interface TopAttraction {
  id: number;
  title: string;
  image: string;
  location: string;
}

interface TopAttractionsListProps {
  data: TopAttraction[];
}

const TopAttractionsList: React.FC<TopAttractionsListProps> = ({ data }) => {
  return (
    <div className="w-full mb-12">
      <div className="text-center mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Top Attractions</h2>
      </div>
      <div className="flex overflow-x-auto no-scrollbar gap-6 md:gap-7 lg:gap-8 snap-x snap-mandatory pb-2">
        {data.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer flex flex-col h-full snap-start w-[220px] md:w-[250px] lg:w-[270px] xl:w-[290px] shrink-0"
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden">
              <img
                src={item.image}
                alt={item.title}
                className="object-cover w-full h-full group-hover:scale-105 transition-all duration-300"
              />
            </div>
            <div className="p-4 flex flex-col flex-1">
              <span className="text-gray-500 text-xs mb-1">{item.location}</span>
              <h3 className="font-bold text-base text-gray-900 leading-tight line-clamp-2 mb-1">{item.title}</h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopAttractionsList;
