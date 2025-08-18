const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const passport = require("passport");
const path = require("path");   // ✅ Import path
require("dotenv").config();

// Route imports
const authRoutes = require("./routes/auth");
const projectRoutes = require("./routes/projectRoute");
const candidateRoutes = require("./routes/candidateRoute");
const notificationRoutes = require("./routes/notificationRoute");

// Middleware imports
const errorHandler = require("./middleware/errorHandler");
require("./middleware/passportConfig")(passport); // Load Passport config

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Serve static files
app.use("/uploads", express.static("uploads"));
app.use("/uploads/resumes", express.static(path.join(__dirname, "uploads/resumes")));

// Passport middleware
app.use(passport.initialize());

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log(" MongoDB connected"))
  .catch(err => console.error(" MongoDB connection error:", err));

// Routes
app.use("/api/auth", authRoutes);
app.use(
  "/api/projects",
  passport.authenticate("jwt", { session: false }), // Protect all project routes
  projectRoutes
);
app.use(
  "/api/candidates",
  passport.authenticate("jwt", { session: false }), // Protect all candidate routes
  candidateRoutes
);
app.use(
  "/api/notifications",
  passport.authenticate("jwt", { session: false }), // Protect all notification routes
  notificationRoutes
);

// Error handler middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(` Server running on port ${PORT}`));
