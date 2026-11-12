
import express from "express";

import {
  generateRoadmap,
  getAllRoadmap,
  getRoadmapById,
} from "../controller/roadmap.controller.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";


const roadmapRouter = express.Router();

// Generate a new roadmap
roadmapRouter.post("/generate",isAuthenticated, generateRoadmap);

// Get all roadmaps of authenticated user
roadmapRouter.get("/all",isAuthenticated,  getAllRoadmap);

// Get a specific roadmap by ID
roadmapRouter.get("/:id",isAuthenticated, getRoadmapById);

export default roadmapRouter;
