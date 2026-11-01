const { Itinerary } = require("../models");
const axios = require("axios");

// Fields a user may set on create/update; userId, id, and timestamps are never client-controlled
const EDITABLE_FIELDS = ["title", "startDate", "endDate", "budget", "location", "activities"];

const pickEditable = (body) =>
  Object.fromEntries(
    EDITABLE_FIELDS.filter((field) => body[field] !== undefined).map((field) => [
      field,
      body[field],
    ])
  );

// Photos are served through our own proxy so the Google API key never reaches the browser
const photoProxyBase = (req) => `${req.protocol}://${req.get("host")}/api/places/photos`;

// Helper function to fetch place images for a location
const fetchPlaceImagesForLocation = async (location, photoBaseUrl) => {
  if (!location) return [];

  try {
    // Search for tourist attractions in the location
    const placesResponse = await axios.get(
      `https://maps.googleapis.com/maps/api/place/textsearch/json`,
      {
        params: {
          query: `${location} tourist attractions`,
          key: process.env.GOOGLE_PLACES_API_KEY,
        },
      }
    );

    if (
      placesResponse.data.status !== "OK" ||
      !placesResponse.data.results.length
    ) {
      console.log(`No places found for ${location}`);
      return [];
    }

    // Get top 3 places with photos
    const places = placesResponse.data.results.slice(0, 3).map((place) => ({
      place_id: place.place_id,
      name: place.name,
      formatted_address: place.formatted_address,
      rating: place.rating,
      photos: place.photos
        ? place.photos.slice(0, 1).map((photo) => ({
            photo_reference: photo.photo_reference,
            url: `${photoBaseUrl}/${encodeURIComponent(photo.photo_reference)}`,
            fallback_url: `https://placehold.co/400x300?text=${encodeURIComponent(
              place.name
            )}`,
          }))
        : [],
    }));

    return places;
  } catch (error) {
    console.error(`Error fetching places for ${location}:`, error.message);
    return [];
  }
};

const itineraryController = {
  getAllItineraries: async (req, res) => {
    try {
      const itineraries = await Itinerary.findAll({
        where: { userId: req.user.id },
        order: [["createdAt", "DESC"]],
      });

      // Fetch place images for the 5 most recent itineraries
      const itinerariesWithPlaces = await Promise.all(
        itineraries.slice(0, 5).map(async (itinerary) => {
          const places = await fetchPlaceImagesForLocation(
            itinerary.location,
            photoProxyBase(req)
          );
          return {
            ...itinerary.toJSON(),
            placesWithPhotos: places,
          };
        })
      );

      // Combine with remaining itineraries
      const result = [
        ...itinerariesWithPlaces,
        ...itineraries.slice(5).map((itinerary) => itinerary.toJSON()),
      ];

      res.json(result);
    } catch (error) {
      console.error("Error getting itineraries:", error.message);
      res.status(500).json({ error: "Failed to load itineraries" });
    }
  },

  createItinerary: async (req, res) => {
    try {
      const { title, startDate, endDate, budget, location } = req.body;

      // Get current date and calculate days until start date
      const today = new Date();
      const startDateObj = new Date(startDate);
      const daysUntilStart = Math.ceil(
        (startDateObj - today) / (1000 * 60 * 60 * 24)
      );

      let weatherData = [];

      try {
        const weatherResponse = await axios.get(
          `https://api.openweathermap.org/data/2.5/forecast`,
          {
            params: {
              q: location,
              appid: process.env.OPENWEATHER_API_KEY,
              units: "metric",
            },
          }
        );

        // Since the trip is in the future, store the location coordinates
        weatherData = {
          coordinates: weatherResponse.data.city.coord,
          location: location,
          message: "Weather forecast will be available closer to trip date",
          sampleData: weatherResponse.data.list.slice(0, 3).map((entry) => ({
            date: entry.dt_txt,
            temp: entry.main.temp,
            feels_like: entry.main.feels_like,
            description: entry.weather[0].description,
            icon: entry.weather[0].icon,
            humidity: entry.main.humidity,
            wind_speed: entry.wind.speed,
          })),
        };

      } catch (weatherError) {
        console.error("Error fetching weather data:", weatherError.message);
      }

      // Create itinerary with weather data
      const itinerary = await Itinerary.create({
        title,
        startDate,
        endDate,
        budget,
        location,
        userId: req.user.id,
        weatherData,
        activities: req.body.activities || [],
      });

      res.status(201).json(itinerary);
    } catch (error) {
      console.error("Error creating itinerary:", error.message);
      res.status(400).json({ error: "Failed to create itinerary" });
    }
  },

  updateItinerary: async (req, res) => {
    try {
      const itinerary = await Itinerary.findOne({
        where: { id: req.params.id, userId: req.user.id },
      });

      if (!itinerary) {
        return res.status(404).json({ error: "Itinerary not found" });
      }

      await itinerary.update(pickEditable(req.body));
      res.json(itinerary);
    } catch (error) {
      console.error("Error updating itinerary:", error.message);
      res.status(400).json({ error: "Failed to update itinerary" });
    }
  },

  deleteItinerary: async (req, res) => {
    try {
      const itinerary = await Itinerary.findOne({
        where: { id: req.params.id, userId: req.user.id },
      });

      if (!itinerary) {
        return res.status(404).json({ error: "Itinerary not found" });
      }

      await itinerary.destroy();
      res.json({ message: "Itinerary deleted" });
    } catch (error) {
      console.error("Error deleting itinerary:", error.message);
      res.status(500).json({ error: "Failed to delete itinerary" });
    }
  },

  getItineraryById: async (req, res) => {
    try {
      const itinerary = await Itinerary.findOne({
        where: {
          id: req.params.id,
          userId: req.user.id,
        },
      });

      if (!itinerary) {
        return res.status(404).json({ error: "Itinerary not found" });
      }

      // Fetch place images
      const places = await fetchPlaceImagesForLocation(
        itinerary.location,
        photoProxyBase(req)
      );

      const result = {
        ...itinerary.toJSON(),
        placesWithPhotos: places,
      };

      res.json(result);
    } catch (error) {
      console.error("Error in getItineraryById:", error.message);
      res.status(500).json({ error: "Failed to load itinerary" });
    }
  },
};

module.exports = itineraryController;
