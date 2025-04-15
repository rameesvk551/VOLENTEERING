// controllers/attractionController.js
const axios = require("axios");

exports.getAttractions = async (req, res) => {
  try {
    console.log("Fetching attractions...");

    // Optionally get searched place from query parameter (e.g. /api/attractions?place=india)
    const searchedPlace = req.params.place || "kerala";

    if (!searchedPlace) {
      return res.status(400).json({ error: "No searched place provided." });
    }

    const response = await axios.get("https://api.foursquare.com/v3/places/search", {
      params: {
        near: searchedPlace,
        limit: 30,
        fields: "fsq_id,name,categories,location,geocodes",
      },
      headers: {
        Authorization: process.env.FOURSQUARE_API_KEY,
      },
    });

    // Check if attractions are found
    if (!response.data.results || response.data.results.length === 0) {
      return res.status(404).json({ message: "No attractions found." });
    }

    // Process and map the results from Foursquare API
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

    res.status(400).json({ error: "Failed to fetch attractions." });
  }
};
