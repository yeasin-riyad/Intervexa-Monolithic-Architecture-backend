
import "dotenv/config";

import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import authRouter from "./routes/auth.routes.js";
import interviewRouter from "./routes/interview.routes.js";
import resumeRouter from "./routes/resume.routes.js";
import roadmapRouter from "./routes/roadmap.routes.js";

import connectDb from "./config/db.js";

const app = express();

const PORT = process.env.PORT || 8000;

// ==============================
// CORS CONFIGURATION
// ==============================

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

// ==============================
// GLOBAL MIDDLEWARE
// ==============================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

// ==============================
// DATABASE CONNECTION
// ==============================

// Connect MongoDB before handling API requests
app.use(async (req, res, next) => {
  try {
    await connectDb();
    next();
  } catch (error) {
    console.error("Database Connection Error:", error);

    return res.status(500).json({
      success: false,
      message: "Database connection failed.",
    });
  }
});

// ==============================
// HEALTH CHECK
// ==============================

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Hello from IntervexaAI.",
  });
});

// ==============================
// API ROUTES
// ==============================

app.use("/api/auth", authRouter);
app.use("/api/interview", interviewRouter);
app.use("/api/resume", resumeRouter);
app.use("/api/roadmap", roadmapRouter);

// ==============================
// LOCAL DEVELOPMENT
// ==============================

if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`IntervexaAI Server Started at ${PORT}`);
  });
}

// ==============================
// VERCEL EXPORT
// ==============================

export default app;
