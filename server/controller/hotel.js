exports.getHotels=async()=>{
    try {
      const {destination,checkout,checkin}  =req.body
      const options = {
        method: 'GET',
        url: 'https://booking-com.p.rapidapi.com/v1/hotels/search',
        params: {
          dest_id: destination,
          checkin_date: checkin,
          checkout_date: checkout,
          dest_type: 'city',
          units: 'metric',
          order_by: 'popularity',
          adults_number: '2',
          filter_by_currency: 'INR',
          locale: 'en-gb',
          room_number: '1',
          page_number: '0',
        },
        headers: {
          'X-RapidAPI-Key':"",
          'X-RapidAPI-Host': 'booking-com.p.rapidapi.com',
        },
      };
      const response = await axios.request(options);
      const hotels = response.data.result.map((hotet) => ({
        id: hotel.hotel_id,
        name: hotel.hotel_name,
        city: hotel.city,
        image: hotel.main_photo_url,
        rating: hotel.review_score,
        ratingText: hotel.review_score_word,
        price: hotel.composite_price_breakdown?.gross_amount_hotel_currency?.value,
        currency: hotel.currencycode,
        checkIn: hotel.checkin?.from,
        checkOut: hotel.checkout?.until,
        roomType: hotel.unit_configuration_label,
        badges: hotel.badges?.map((b) => b.text),
      }));
response.json({succes:true,hotels})  
    } catch (error) {
        console.error('Error fetching hotels:', error);
        res.status(500).json({ error: 'Failed to fetch hotel data' });
    }
}