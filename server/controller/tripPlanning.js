// controllers/attractionController.js
const axios = require("axios");

exports.getAttractions = async (req, res) => {
  try {
    console.log("Fetching attractions...");

    // Optionally get searched place from query parameter (e.g. /api/attractions?place=india)
    const searchedPlace = req.query.place || "rajasthan";

    if (!searchedPlace) {
      return res.status(400).json({ error: "No searched place provided." });
    }

    const response = await axios.get("https://api.foursquare.com/v3/places/search", {
      params: {
        near: searchedPlace,
        limit: 10,
        fields: "fsq_id,name,categories,location,geocodes",
      },
      headers: {
        Authorization: process.env.FOURSQUARE_API_KEY,
      },
    });

    // Optional: log entire response for debugging
    console.log("Response received from Foursquare:");
    console.log(JSON.stringify(response.data.results, null, 2));

    const attractions = response.data.results.map((place) => ({
      id: place.fsq_id,
      name: place.name,
      categories: place.categories?.map((cat) => cat.name) || [],
      location: place.location,
      geocodes: place.geocodes?.main || {},
    }));

    res.status(200).json({ attractions });
  } catch (error) {
    console.error(
      "Error fetching attractions:",
      error.response?.data || error.message
    );
    res.status(500).json({ error: "Failed to fetch attractions." });
  }
};
