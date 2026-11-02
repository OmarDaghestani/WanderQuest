const express = require("express");
const router = express.Router();
const itineraryController = require("../controllers/itineraryController");
const auth = require("../middleware/auth");
const validators = require("../middleware/validators");

// Get all itineraries for a user
router.get("/", auth, itineraryController.getAllItineraries);

// Get single itinerary by ID
router.get("/:id", auth, validators.itinerary.id, itineraryController.getItineraryById);

// Create new itinerary
router.post("/", auth, validators.itinerary.create, itineraryController.createItinerary);

// Update itinerary
router.put("/:id", auth, validators.itinerary.update, itineraryController.updateItinerary);

// Delete itinerary
router.delete("/:id", auth, validators.itinerary.id, itineraryController.deleteItinerary);

module.exports = router;
