

import Resume from "../models/resume.model.js";
import resumeAgent from "../agents/resumeAgents/resume.agent.js";
import extractText from "../config/pdf.js";

// ==============================
// UPLOAD RESUME
// ==============================

export const uploadResume = async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a resume PDF file.",
      });
    }

    // Authenticated user
    const userId = req.user._id;

    // Extract PDF text from memory buffer
    const resumeText = await extractText(file.buffer);

    if (!resumeText || !resumeText.trim()) {
      return res.status(422).json({
        success: false,
        message: "Unable to extract text from PDF.",
      });
    }

    // Analyze using AI agent
    const aiResponse = await resumeAgent(resumeText);

    if (!aiResponse) {
      return res.status(500).json({
        success: false,
        message: "Resume analysis failed.",
      });
    }

    // Save analysis in MongoDB
    const resumeData = await Resume.findOneAndUpdate(
      { userId },
      {
        $set: {
          extractedText: resumeText,
          ...aiResponse,
        },
        $setOnInsert: {
          userId,
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    return res.status(200).json({
      success: true,
      message: "Resume uploaded and analyzed successfully.",
      data: resumeData,
    });

  } catch (error) {
    console.error("Upload Resume Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error.",
    });
  }
};

// ==============================
// GET RESUME
// ==============================

export const getResume = async (req, res) => {
  try {
    // 1. Get authenticated user ID from JWT middleware
    const userId = req.user._id;

    // 2. Fetch resume from MongoDB
    const resumeData = await Resume.findOne({ userId }).lean();

    if (!resumeData) {
      return res.status(404).json({
        success: false,
        message: "Resume not found. Please upload your resume first.",
      });
    }

    // 3. Send response
    return res.status(200).json({
      success: true,
      message: "Resume fetched successfully.",
      data: resumeData,
      source: "database",
    });

  } catch (error) {
    console.error("Get Resume Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error.",
    });
  }
};
