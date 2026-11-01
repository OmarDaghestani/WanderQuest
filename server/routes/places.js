const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const axios = require("axios");
const rateLimit = require("express-rate-limit");

router.get("/", auth, async (req, res) => {
  try {
    const { location, preferences } = req.query;
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/place/textsearch/json`,
      {
        params: {
          query: `${preferences} in ${location}`,
          key: process.env.GOOGLE_PLACES_API_KEY,
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error("Places API error:", error.message);
    res.status(502).json({ error: "Failed to fetch places" });
  }
});

// New routes
router.get("/nearby", auth, async (req, res) => {
  try {
    const { location, type, radius } = req.query;
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json`,
      {
        params: {
          location,
          type,
          radius,
          key: process.env.GOOGLE_PLACES_API_KEY,
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error("Places API error:", error.message);
    res.status(502).json({ error: "Failed to fetch places" });
  }
});

// Public because <img> tags can't send auth headers. The key stays on the server;
// references are format-checked and the route is rate limited to protect quota.
const PHOTO_REFERENCE_PATTERN = /^[A-Za-z0-9_-]{10,1000}$/;
const photoLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: "draft-7",
  legacyHeaders: false,
});

router.get("/photos/:photoReference", photoLimiter, async (req, res) => {
  if (!PHOTO_REFERENCE_PATTERN.test(req.params.photoReference)) {
    return res.status(400).json({ error: "Invalid photo reference" });
  }

  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/place/photo`,
      {
        params: {
          photoreference: req.params.photoReference,
          maxwidth: 400,
          key: process.env.GOOGLE_PLACES_API_KEY,
        },
        responseType: 'arraybuffer'
      }
    );
    res
      .type(response.headers["content-type"] || "image/jpeg")
      .set("Cache-Control", "public, max-age=86400")
      .send(response.data);
  } catch (error) {
    console.error("Photo proxy error:", error.message);
    res.status(502).json({ error: "Failed to load photo" });
  }
});

router.get("/category", auth, async (req, res) => {
  try {
    const { location, category } = req.query;
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/place/textsearch/json`,
      {
        params: {
          query: category,
          location,
          type: category,
          key: process.env.GOOGLE_PLACES_API_KEY,
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error("Places API error:", error.message);
    res.status(502).json({ error: "Failed to fetch places" });
  }
});

module.exports = router;
