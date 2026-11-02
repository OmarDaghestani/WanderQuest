const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const auth = require("../middleware/auth");
const validators = require("../middleware/validators");

router.post("/register", validators.auth.register, authController.register);

router.post("/login", validators.auth.login, authController.login);

router.get("/profile", auth, authController.getProfile);

module.exports = router;
