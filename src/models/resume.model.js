import mongoose from "mongoose";

const resumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique:true,
      index: true,
    },

    extractedText: {
      type: String,
      required: true,
      trim: true,
    },

    score: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    summary: {
      type: String,
      default: "",
      trim: true,
    },
    name:{
        type: String,
      default: "",
      trim: true,

    },
    email:{
        type: String,
        default:""

    },
    phone:{
        type: String,
        default:""

    },
    education:{
         type: [String],
        default:[]

    },

    skills:{
        type:[String],
        default:[]

    },
     projects:{
        type:[String],
        default:[]

    },
     experience:{
        type:[String],
        default:[]

    },
     strengths:{
        type:[String],
        default:[]

    },
     weaknesses:{
        type:[String],
        default:[]

    },
     missingSkills:{
        type:[String],
        default:[]

    },
     suggestedRole:{
        type:String,
        default:""

    },
    recommendations:{
        type:[String],
        default:[]

    }
  },
  {
    timestamps: true,
  }
);

const Resume = mongoose.model("Resume", resumeSchema);

export default Resume;