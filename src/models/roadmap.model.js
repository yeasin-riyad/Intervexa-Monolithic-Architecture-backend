import mongoose from "mongoose";

// Individual roadmap module schema
const moduleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    duration: {
      type: String,
      required: true,
      trim: true,
    },

    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Easy",
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    youtube: {
      title: {
        type: String,
        default: "",
      },

      channel: {
        type: String,
        default: "",
      },

      url: {
        type: String,
        default: "",
      },

      thumbnail: {
        type: String,
        default: "",
      },
    },

    article: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { _id: false },
);

// Main roadmap schema
const roadmapSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    targetPackage: {
      type: String,
      required: true,
      trim: true,
    },

    duration: {
      type: String,
      required: true,
      trim: true,
    },

    level: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      default: "Beginner",
    },

    modules: {
      type: [moduleSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

// Export model
const Roadmap = mongoose.model("Roadmap", roadmapSchema);

export default Roadmap;
