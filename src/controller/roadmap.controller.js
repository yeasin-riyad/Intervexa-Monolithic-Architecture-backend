
import mongoose from "mongoose";
import graph from "../graph/roadmapGraph/roadmap.graph.js";
import Roadmap from "../models/roadmap.model.js";

// Generate Roadmap
export const generateRoadmap = async (req, res) => {
    console.log(req.body,"Hello body")
  try {
    const { role, targetPackage, useResume = false, resume = null } = req.body;

    // 1. Get authenticated user ID from JWT middleware
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Please login first.",
      });
    }

    // 2. Validate required fields
    if (!role?.trim() || !targetPackage?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Role and target package are required.",
      });
    }

    // 3. Validate resume
    if (useResume && !resume) {
      return res.status(400).json({
        success: false,
        message: "Resume data is required when useResume is true.",
      });
    }

    // 4. Execute LangGraph
    const result = await graph.invoke({
      role,
      targetPackage,
      useResume,
      resume,
    });

    // 5. Check graph result
    if (result.error || !result.roadmap) {
      return res.status(500).json({
        success: false,
        message: result.error || "Failed to generate roadmap.",
      });
    }

    // 6. Save roadmap to MongoDB
    const roadmap = await Roadmap.create({
      userId,
      ...result.roadmap,
    });

    // 7. Send success response
    return res.status(201).json({
      success: true,
      message: "Roadmap generated successfully.",
      roadmap,
    });

  } catch (error) {
    console.error("Generate Roadmap Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error.",
    });
  }
};


// Get All Roadmaps
export const getAllRoadmap = async (req, res) => {
  try {
    // 1. Get authenticated user ID
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Please login first.",
      });
    }

    // 2. Fetch all roadmaps belonging to this user
    const roadmaps = await Roadmap.find({ userId })
      .sort({ createdAt: -1 })
      .lean();

    // 3. Send response
    return res.status(200).json({
      success: true,
      message: "Roadmaps fetched successfully.",
      totalRoadmaps: roadmaps.length,
      roadmaps,
    });

  } catch (error) {
    console.error("Get All Roadmaps Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch roadmaps.",
    });
  }
};


// Get Roadmap By ID
export const getRoadmapById = async (req, res) => {
  try {
    // 1. Get roadmap ID and authenticated user ID
    const { id } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Please login first.",
      });
    }

    // 2. Validate roadmap ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid roadmap ID.",
      });
    }

    // 3. Find roadmap belonging to this user
    const roadmap = await Roadmap.findOne({
      _id: id,
      userId,
    }).lean();

    // 4. Check roadmap existence
    if (!roadmap) {
      return res.status(404).json({
        success: false,
        message: "Roadmap not found.",
      });
    }

    // 5. Send response
    return res.status(200).json({
      success: true,
      message: "Roadmap fetched successfully.",
      roadmap,
    });

  } catch (error) {
    console.error("Get Roadmap By ID Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch roadmap.",
    });
  }
};
