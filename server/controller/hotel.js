const crypto = require("crypto"); // ✅ required for createHash
const querystring = require("querystring");
const axios = require("axios");

exports.getHotels = async (req, res) => {
  try {
    const { checkin, checkout } = req.body;
    const destinationCode = "PMI";

    if (!checkin || !checkout) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: checkin, checkout",
      });
    }

    const apiKey =process.env.HOTEL_BEDS_API_KEY
    const secret = process.env.SECRET
    const endpoint =process.env.ENDPOINT

    const timestamp = Math.floor(Date.now() / 1000);
    const signature = crypto
      .createHash("sha256")
      .update(apiKey + secret + timestamp)
      .digest("hex");

    const headers = {
      "Api-Key": apiKey,
      "X-Signature": signature,
      Accept: "application/json",
      "Content-Type": "application/json",
    };

    const payload = {
      stay: {
        checkIn: checkin,
        checkOut: checkout,
      },
      occupancies: [
        {
          adults: 2,
          children: 0,
          rooms: 1,
        },
      ],
      destination: {
        code: destinationCode,
      },
    };

    const response = await axios.post(endpoint, payload, { headers });
    const hotelsRaw = response.data.hotels?.hotels || [];
 


    const hotels = hotelsRaw.map((hotel) => {
      const firstRoom = hotel.rooms?.[0]?.rates?.[0];
      const price = firstRoom?.net ? parseFloat(firstRoom.net) : 0;

      return {
        name: hotel.name|| "Unnamed Hotel",
        location: `${hotel.destinationName || "Unknown"}, ${hotel.zoneName || ""}`,
        distance: "500m", // You can replace with actual logic if needed
        rating: parseInt(hotel.categoryCode) || 3, // e.g. "3EST" -> 3
        reviews: Math.floor(Math.random() * 1000), // Fake for now
        tags: [hotel.categoryName || "Standard"],
        latitude:hotel.latitude,
        longitude:hotel.longitude,
        highlights: ["Free WiFi", "Breakfast Included", "Central Location"],
        price,
        images: hotel.images?.slice(0, 5).map((img) => img.path) || [],
        perNightLabel: "per night for 2 guests",
        ctaLink: `/hotel/${hotel.code}`,
      };
    });
    console.log("Hoooootels",hotels);
    res.json({ success: true, hotels });
  } catch (error) {
    console.error("Hotelbeds API error:", error?.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch hotel data",
      error: error.message,
    });
  }
};

