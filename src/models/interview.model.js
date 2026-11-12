
import mongoose from "mongoose";

// Feedback schema for each interview question
const feedbackSchema = new mongoose.Schema(
  {
    score: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    correctness: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    clarity: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    relevance: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    detail: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    efficiency: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    communication: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    problemSolving: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    creativity: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    feedback: {
      type: String,
      default: "",
    },

    improvements: {
      type: [String],
      default: [],
    },
  },
  { _id: false }
);

// Individual interview question schema
const questionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true,
    },

    userAnswer: {
      type: String,
      default: "",
    },

    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "easy",
    },

    timer: {
      type: Number,
      default: 60,
      min: 1,
    },

    feedback: {
      type: feedbackSchema,
      default: () => ({}),
    },
  },
  { _id: false }
);

// Main interview schema
const interviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: ["hr", "technical"],
      required: true,
    },

    role: {
      type: String,
      required: true,
      trim: true,
    },

    useResume: {
      type: Boolean,
      default: false,
    },

    currentQuestion: {
      type: Number,
      default: 0,
      min: 0,
    },

    questions: {
      type: [questionSchema],
      default: [],
    },

    overallScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    strengths: {
      type: [String],
      default: [],
    },

    weaknesses: {
      type: [String],
      default: [],
    },

    recommendations: {
      type: [String],
      default: [],
    },

    summary: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["in-progress", "completed"],
      default: "in-progress",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

const Interview = mongoose.model("Interview", interviewSchema);

export default Interview;
