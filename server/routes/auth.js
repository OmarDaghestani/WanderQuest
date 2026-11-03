const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const auth = require("../middleware/auth");
const validators = require("../middleware/validators");

router.post("/register", validators.auth.register, authController.register);

router.post("/login", validators.auth.login, authController.login);

router.get("/profile", auth, authController.getProfile);
router.put("/profile", auth, validators.auth.updateProfile, authController.updateProfile);
router.put(
  "/change-password",
  auth,
  validators.auth.changePassword,
  authController.changePassword
);

module.exports = router;
