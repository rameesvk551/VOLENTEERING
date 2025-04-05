export type HotelCardProps = {
    name: string;
    location: string;
    distance: string;
    rating: number;
    reviews: number;
    tags: string[];
    highlights: string[];
    price: number;
    images: string[];
    perNightLabel?: string;
    ctaLink: string;
    starRating: string;
    reviewRating: string;
    type: string;
    facilities: string[];
  };
  
  export const dummyProperties: HotelCardProps[] = Array.from({ length: 50 }, (_, index) => {
    const tags = ["Couple friendly", "Breakfast Included", "Pet Friendly", "Free WiFi", "Beach Access"];
    const highlights = [
      "Free cancellation",
      "1+1 Happy Hours",
      "Breakfast included",
      "No prepayment needed",
      "24/7 Support",
    ];
  
    const propertyTypes = [
      "Homestays",
      "Hostels",
      "Hotels",
      "Resorts",
      "Villas",
      "Farmstay",
      "Lodges",
      "Tent",
      "GustHouses",
    ];
  
    const facilities = [
      "Parking",
      "Wifi",
      "Spa",
      "AC",
      "Pool",
      "Restaurent",
      "Family room",
      "Room Service",
      "Kitchenette",
    ];
  
    const starRatings = ["2 Star", "3 Star", "4 Star", "5 Star"];
    const reviewRatings = ["5 stars", "4 stars & up", "3 stars & up"];
  
    const getRandomItems = (array: string[], count: number) => {
      const shuffled = [...array].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, count);
    };
  
    return {
      name: `Valentines Retreat ${index + 1}`,
      location: `Location ${index + 1}`,
      distance: `${Math.floor(Math.random() * 15) + 1} min to beach`,
      rating: parseFloat((Math.random() * 2 + 3).toFixed(1)), // Between 3.0 - 5.0
      reviews: Math.floor(Math.random() * 500) + 20,
      tags: getRandomItems(tags, 2),
      highlights: getRandomItems(highlights, 3),
      price: Math.floor(Math.random() * 10000) + 1000,
      images: [
        `https://source.unsplash.com/random/400x300?sig=${index}`,
        `https://source.unsplash.com/random/100x100?sig=${index + 50}`,
        `https://source.unsplash.com/random/100x100?sig=${index + 100}`,
        `https://source.unsplash.com/random/100x100?sig=${index + 150}`,
      ],
      perNightLabel: "per night for 2 guests",
      ctaLink: `https://example.com/property/${index + 1}`,
      starRating: starRatings[Math.floor(Math.random() * starRatings.length)],
      reviewRating: reviewRatings[Math.floor(Math.random() * reviewRatings.length)],
      type: propertyTypes[Math.floor(Math.random() * propertyTypes.length)],
      facilities: getRandomItems(facilities, 3),
    };
  });
  