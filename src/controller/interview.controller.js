import mongoose from "mongoose";
import Interview from "../models/interview.model.js";
import graph from "../graph/interviewGraph/graph.js";

// Start a new interview
export const startInterview = async (req, res) => {
  try {
    const userId = req.user?._id;

    const {
      type,
      role,
      useResume = false,
      resume = {},
    } = req.body;

    // Validate authenticated user
    if (!userId || !mongoose.isValidObjectId(userId)) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Please login first.",
      });
    }

    // Validate request data
    if (!type || !role?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Interview type and role are required.",
      });
    }

    if (!["hr", "technical"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid interview type. Choose hr or technical.",
      });
    }

    if (typeof useResume !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "useResume must be a boolean value.",
      });
    }

    if (useResume && (!resume || typeof resume !== "object" || Array.isArray(resume))) {
      return res.status(400).json({
        success: false,
        message: "Valid resume data is required.",
      });
    }

    // Generate interview questions using LangGraph
    const result = await graph.invoke({
      action: "start",
      role: role.trim(),
      type,
      useResume,
      resume: useResume ? resume : {},
    });

    const questions = result?.questions;

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(500).json({
        success: false,
        message: "Failed to generate interview questions. Please try again.",
      });
    }

    // Save interview in MongoDB
    const interview = await Interview.create({
      userId,
      type,
      role: role.trim(),
      useResume,
      questions,
      currentQuestion: 0,
      status: "in-progress",
    });

    return res.status(201).json({
      success: true,
      message: "Interview started successfully.",
      interviewId: interview._id,
      currentQuestion: 0,
      totalQuestions: interview.questions.length,
      question: interview.questions[0],
    });

  } catch (error) {
    console.error("Start Interview Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to start interview. Please try again.",
    });
  }
};


// Submit an answer and generate AI feedback
export const submitAnswer = async (req, res) => {
  try {
    const userId = req.user?._id;

    const { interviewId, answer, autoSubmitted = false } = req.body;

    // Validate authenticated user
    if (!userId || !mongoose.isValidObjectId(userId)) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Please login first.",
      });
    }

    // Validate request data
    if (!interviewId || !mongoose.isValidObjectId(interviewId)) {
      return res.status(400).json({
        success: false,
        message: "A valid interview ID is required.",
      });
    }

    if (typeof answer !== "string") {
      return res.status(400).json({
        success: false,
        message: "Answer must be a string.",
      });
    }

    if (!autoSubmitted && !answer.trim()) {
    return res.status(400).json({
        success: false,
        message: "Please provide your answer.",
    });
}

    // Find interview belonging to this user
    const interview = await Interview.findOne({
      _id: interviewId,
      userId,
    });

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found.",
      });
    }

    // Prevent submitting answers to completed interviews
    if (interview.status === "completed") {
      return res.status(400).json({
        success: false,
        message: "This interview has already been completed.",
      });
    }

    const index = interview.currentQuestion;
    const currentQuestion = interview.questions[index];

    if (!currentQuestion) {
      return res.status(400).json({
        success: false,
        message: "No question available for this interview.",
      });
    }

    // Save user's answer
    currentQuestion.userAnswer = answer.trim();

    // Check whether this is the last question
    const completed =
      index + 1 >= interview.questions.length;

    // Generate AI feedback using LangGraph
    const result = await graph.invoke({
      action: "feedback",
      question: currentQuestion.question,
      answer: answer.trim(),
      difficulty: currentQuestion.difficulty,
      completed,
      role: interview.role,
      type: interview.type,
      questions: interview.questions,
    });

    if (!result?.feedback) {
      return res.status(500).json({
        success: false,
        message: "Failed to generate answer feedback.",
      });
    }

    // Save feedback for the current question
    currentQuestion.feedback = result.feedback;

    // Move to the next question
    interview.currentQuestion = index + 1;

    // If all questions are completed
    if (completed) {
      const report = result.report;

      if (!report) {
        return res.status(500).json({
          success: false,
          message: "Failed to generate the final interview report.",
        });
      }

      interview.status = "completed";
      interview.overallScore = report.overallScore ?? 0;
      interview.summary = report.summary ?? "";
      interview.strengths = report.strengths ?? [];
      interview.weaknesses = report.weaknesses ?? [];
      interview.recommendations = report.recommendations ?? [];

      await interview.save();

      return res.status(200).json({
        success: true,
        message: "Interview completed successfully.",
        completed: true,
        feedback: result.feedback,
        interview,
      });
    }

    // Save progress
    await interview.save();

    return res.status(200).json({
      success: true,
      message: "Answer submitted successfully.",
      completed: false,
      currentQuestion: interview.currentQuestion,
      totalQuestions: interview.questions.length,
      question: interview.questions[interview.currentQuestion],
      feedback: result.feedback,
    });

  } catch (error) {
    console.error("Submit Answer Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to submit answer. Please try again.",
    });
  }
};


// Get a specific interview
export const getInterview = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { id } = req.params;

    // Validate authenticated user
    if (!userId || !mongoose.isValidObjectId(userId)) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Please login first.",
      });
    }

    // Validate interview ID
    if (!id || !mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid interview ID.",
      });
    }

    // Find interview belonging to this user
    const interview = await Interview.findOne({
      _id: id,
      userId,
    });

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found.",
      });
    }

    return res.status(200).json({
      success: true,
      interview,
    });

  } catch (error) {
    console.error("Get Interview Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve interview.",
    });
  }
};


// Get all interviews for the logged-in user
export const getAllInterviews = async (req, res) => {
  try {
    const userId = req.user?._id;

    // Validate authenticated user
    if (!userId || !mongoose.isValidObjectId(userId)) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Please login first.",
      });
    }

    // Query params
    const {
      status,          
      type,            
      page = 1,
      limit = 10,
      sort = "-createdAt", 
    } = req.query;

    // Build filter
    const filter = { userId };

    if (status) {
      if (!["in-progress", "completed"].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid status. Use 'in-progress' or 'completed'.",
        });
      }
      filter.status = status;
    }

    if (type) {
      if (!["hr", "technical"].includes(type)) {
        return res.status(400).json({
          success: false,
          message: "Invalid type. Use 'hr' or 'technical'.",
        });
      }
      filter.type = type;
    }

    // Pagination
    const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
    const limitNumber = Math.min(
      Math.max(parseInt(limit, 10) || 10, 1),
      100
    );
    const skip = (pageNumber - 1) * limitNumber;

    // Fetch interviews + total count in parallel
    const [interviews, total] = await Promise.all([
      Interview.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limitNumber)
        .select(
          "type role status currentQuestion overallScore createdAt updatedAt questions"
        )
        .lean(),
      Interview.countDocuments(filter),
    ]);

    // Add computed summary fields to each interview
    const formatted = interviews.map((item) => ({
      _id: item._id,
      type: item.type,
      role: item.role,
      status: item.status,
      currentQuestion: item.currentQuestion,
      totalQuestions: item.questions?.length || 0,
      overallScore: item.overallScore || 0,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }));

    return res.status(200).json({
      success: true,
      message: "Interviews fetched successfully.",
      count: formatted.length,
      total,
      page: pageNumber,
      limit: limitNumber,
      totalPages: Math.ceil(total / limitNumber) || 1,
      interviews: formatted,
    });
  } catch (error) {
    console.error("Get All Interviews Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve interviews. Please try again.",
    });
  }
};
