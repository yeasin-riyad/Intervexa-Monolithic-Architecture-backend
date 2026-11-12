import express from "express";
import {
  uploadResume,
  getResume,
} from "../controller/resume.controller.js";
import upload from "../middlewares/multer.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";

const resumeRouter = express.Router();

resumeRouter.post("/upload",isAuthenticated, upload.single("resume"), uploadResume);
resumeRouter.get("/get-resume",isAuthenticated, getResume);

export default resumeRouter;