const express = require("express");
const cors = require("cors");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const expressAsyncErrors = require("express-async-errors");
const connection = require("../db");
const userRoutes = require("../routes/user");
const authRoutes = require("../routes/auth");
const songsRoutes = require("../routes/songs");
const playlistRoutes = require("../routes/playList");
const searchRoutes = require("../routes/search");

const app = express();

// **Middleware Ordering:**
// Ensure correct middleware ordering
app.use(cors()); // Apply CORS before parsing JSON
app.use(express.json()); // Parse JSON bodies

// Swagger Options
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Lofi-BTB API",
      version: "1.0.0",
      description: "API documentation for Lofi-BTB",
    },
    servers: [
      {
        url: "https://lofi-btb-backnd.vercel.app",
      },
    ],
  },
  apis: ["./routes/*.js"],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Serve Swagger documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Database connection
connection();

// Default route
app.get("/", (req, res) => {
  res.send("Lofi-BTB API");
});

app.use("/api/users", userRoutes);
app.use("/api/login", authRoutes);
app.use("/api/songs", songsRoutes);
app.use("/api/playlists", playlistRoutes);
app.use("/api/", searchRoutes);

// Start the server
const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});
