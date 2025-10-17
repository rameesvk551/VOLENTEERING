import React from 'react';

interface ReviewProps {
  rating: number;
  comment: string;
  hostName: string;
  date:string
}

const Review: React.FC<ReviewProps> = React.memo(({ rating, comment, hostName,date }) => {
  // Generate star elements dynamically based on the rating
  const renderStars = () => {
    const filledStars = new Array(rating).fill(true);
    const emptyStars = new Array(5 - rating).fill(false);
    
  
    return (
      <>
        {filledStars.map((_, index) => (
          <svg
            key={`filled-${index}`}
            className="w-5 h-5 fill-current text-yellow-400"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
          >
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
          </svg>
        ))}
        {emptyStars.map((_, index) => (
          <svg
            key={`empty-${index}`}
            className="w-5 h-5 text-gray-300"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
          >
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
          </svg>
        ))}
      </>
    );
  };

  const formatDate = (isoDate: string | Date): string => {
    const date = new Date(isoDate);
    return `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
  };
  return (
    <div className="bg-white shadow-lg rounded-lg w-full p-6 mb-4">
      <div className="flex items-center space-x-4">
        {/* Reviewer Profile Picture with lazy loading */}
        <div className="flex flex-col items-center">
      

          {/* Star Rating */}
          <div className="flex mt-2">{renderStars()}</div>
        </div>

        {/* Review Content */}
        <div className="flex-1">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Left To {hostName}</span>
            <span className="text-sm text-gray-500">{formatDate(date)}</span>
          </div>

          <p className="mt-2 text-gray-600 text-base">{comment}</p>
        </div>
      </div>
    </div>
  );
});

export default Review;
