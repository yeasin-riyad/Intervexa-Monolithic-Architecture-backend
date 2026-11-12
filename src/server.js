import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.routes.js";
import connectDb from "./config/db.js";
import interviewRouter from "./routes/interview.routes.js";
import resumeRouter from "./routes/resume.routes.js";
import roadmapRouter from "./routes/roadmap.routes.js";
dotenv.config();


const port = process.env.PORT;
const app = express();
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  }),
);
app.use(express.json());
app.use(morgan("dev"));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.status(200).json({ message:"Hello from Intervexa ai." });
});

app.use("/api/auth", authRouter);
app.use("/api/interview",interviewRouter);
app.use("/api/resume",resumeRouter);
app.use("/api/roadmap",roadmapRouter);

app.listen(port, async() => {
  await connectDb();
  console.log(`Intervexa Server Started at ${port}`);
});