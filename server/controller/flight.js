const axios = require("axios");

// Helper to map airline codes to alliances
const getAirlineAlliance = (code) => {
  const alliances = {
    Oneworld: ["AA","BA","QR","CX"],
    StarAlliance: ["UA","LH","SQ","NH"],
    SkyTeam: ["DL","AF","KLM","KE"],
  };
  for (const [name, list] of Object.entries(alliances)) {
    if (list.includes(code)) return name;
  }
  return "Other";
};


const formatFlight = (quote) => {
  const { content, id } = quote;
  const leg = content.outboundLeg;
  return {
    id,
    airline: content.marketingCarrier?.name || "Unknown",
    logoUrl: `https://content.r9cdn.net/airlines/${content.marketingCarrier?.code}.png`,
    from: leg.originAirport?.name,
    fromCode: leg.originAirport?.skyCode,
    to: leg.destinationAirport?.name,
    toCode: leg.destinationAirport?.skyCode,
    departure: leg.localDepartureDateLabel,
    duration: `${leg.durationInMinutes || 0}m`,
    stops: content.direct ? "Non-stop" : `${leg.stopCount || 1} stop`,
    price: content.rawPrice,
    displayPrice: content.price,
    travelClass: content.cabinClass || "Economy",
    alliance: getAirlineAlliance(content.marketingCarrier?.code),
  };
};

exports.getFlights = async (req, res) => {
  try {
    const response = await axios.get(
      "https://skyscanner89.p.rapidapi.com/flights/one-way/list",
      {
        headers: {
          "x-rapidapi-key": process.env.RAPIDAPI_KEY || "YOUR_KEY",
          "x-rapidapi-host": "skyscanner89.p.rapidapi.com",
        },
        params: {
          origin: req.query.origin || "NYCA",
          originId: req.query.originId || "27537542",
          destination: req.query.destination || "HNL",
          destinationId: req.query.destinationId || "95673827",
          departureDate: req.query.departureDate || "2025-04-12",
          currency: "USD",
          adults: 1,
        },
      }
    );

    // Drill into data.data.flightQuotes.results
    const rawQuotes = response.data?.data?.flightQuotes?.results;
    if (!Array.isArray(rawQuotes)) {
      return res.status(502).json({
        error: "Unexpected API response format",
        sample: response.data,
      });
    }

    const flights = rawQuotes.map(formatFlight);
    return res.json({ totalResults: flights.length, results: flights });
  } catch (err) {
    console.error("❌ Skyscanner API Error:", err.response?.data || err.message);
    return res.status(500).json({ error: "Failed to fetch flight data" });
  }
};
