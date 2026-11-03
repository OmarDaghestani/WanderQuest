const { body, query, param, validationResult } = require("express-validator");

// Custom validation function for password
const validatePassword = (value) => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return passwordRegex.test(value);
};

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }
  next();
};

// Validation rules
const validators = {
  auth: {
    register: [
      body("email")
        .isEmail()
        .normalizeEmail()
        .withMessage("Must be a valid email address"),
      body("password")
        .custom(validatePassword)
        .withMessage(
          "Password must be at least 8 characters with 1 uppercase, 1 lowercase, and 1 number"
        ),
      validate,
    ],
    login: [
      body("email")
        .isEmail()
        .normalizeEmail()
        .withMessage("Must be a valid email address"),
      body("password").exists().withMessage("Password is required"),
      validate,
    ],
    updateProfile: [
      body("email")
        .isEmail()
        .normalizeEmail()
        .withMessage("Must be a valid email address"),
      validate,
    ],
    changePassword: [
      body("currentPassword")
        .isString()
        .notEmpty()
        .withMessage("Current password is required"),
      body("newPassword")
        .custom(validatePassword)
        .withMessage(
          "Password must be at least 8 characters with 1 uppercase, 1 lowercase, and 1 number"
        )
        .custom((value, { req }) => value !== req.body.currentPassword)
        .withMessage("New password must be different from your current password"),
      validate,
    ],
  },
  itinerary: {
    id: [param("id").isUUID(4).withMessage("Invalid itinerary ID"), validate],
    create: [
      body("title").trim().notEmpty().withMessage("Title is required"),
      body("location").trim().notEmpty().withMessage("Location is required"),
      body("startDate").isISO8601().withMessage("Start date must be a valid date"),
      body("endDate").isISO8601().withMessage("End date must be a valid date"),
      body("budget").isFloat({ min: 0 }).withMessage("Budget must be a positive number"),
      body("activities").optional().isArray().withMessage("Activities must be a list"),
      validate,
    ],
    update: [
      param("id").isUUID(4).withMessage("Invalid itinerary ID"),
      body("title").optional().trim().notEmpty().withMessage("Title cannot be empty"),
      body("location").optional().trim().notEmpty().withMessage("Location cannot be empty"),
      body("startDate").optional().isISO8601().withMessage("Start date must be a valid date"),
      body("endDate").optional().isISO8601().withMessage("End date must be a valid date"),
      body("budget").optional().isFloat({ min: 0 }).withMessage("Budget must be a positive number"),
      body("activities").optional().isArray().withMessage("Activities must be a list"),
      validate,
    ],
  },
  weather: {
    get: [
      query("location").trim().notEmpty(),
      query("dates").optional().isISO8601(),
      validate,
    ],
  },
  places: {
    get: [
      query("location").trim().notEmpty(),
      query("preferences").optional().trim(),
      validate,
    ],
  },
  validate: validate,
};

module.exports = validators;
