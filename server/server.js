const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { sequelize } = require("./models"); // also loads .env via config/config.js
const routes = require("./routes/index");

if (!process.env.JWT_SECRET) {
  console.error("JWT_SECRET is not set. Refusing to start.");
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 5000;

// Behind nginx: trust the first proxy for client IPs and https detection
app.set("trust proxy", 1);

// Exact-match allowlist. CLIENT_URL may be a comma-separated list; local dev
// origins are only allowed outside production.
const allowedOrigins = new Set(
  [
    "https://wanderquest.omar-daghestani.com",
    ...(process.env.CLIENT_URL || "").split(","),
    ...(process.env.NODE_ENV === "production"
      ? []
      : ["http://localhost:5173", "http://localhost:3000"]),
  ]
    .map((origin) => origin.trim())
    .filter(Boolean)
);

// Middleware
// Photos are proxied for use in <img> tags on the client's origin
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(
  cors({
    // Requests without an Origin header (curl, server-to-server) are allowed
    origin: (origin, callback) =>
      callback(null, !origin || allowedOrigins.has(origin)),
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "100kb" }));

// Throttle credential endpoints against brute force
app.use(
  "/api/auth",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { error: "Too many attempts, please try again later" },
  })
);

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

// Logging middleware - only in development
if (process.env.NODE_ENV !== "production") {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// Routes
app.use("/api", routes);

// JSON 404 for unknown routes
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err.message);

  // Handle JSON parsing errors
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({ error: "Invalid JSON format" });
  }

  if (err.type === "entity.too.large") {
    return res.status(413).json({ error: "Request body too large" });
  }

  res.status(500).json({ error: "Internal server error" });
});

// Database connection and server start
const startServer = async () => {
  try {
    // Add retry logic for database connection
    let retries = 5;
    while (retries) {
      try {
        await sequelize.authenticate();
        console.log("Database connection established.");
        break;
      } catch (err) {
        console.log(
          `Database connection attempt failed. Retries left: ${retries}`
        );
        retries -= 1;
        // Wait for 5 seconds before retrying
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    }

    if (retries === 0) {
      console.error("Could not connect to database after multiple attempts");
      process.exit(1);
    }

    await sequelize.sync();
    console.log("Database synced.");

    app.listen(PORT, () => {
      console.log(
        `Server running on port ${PORT} in ${
          process.env.NODE_ENV || "development"
        } mode`
      );
    });
  } catch (error) {
    console.error("Unable to start server:", error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  // Close database connection and server
  sequelize.close().then(() => {
    console.log("Database connection closed");
    process.exit(0);
  });
});

startServer();
