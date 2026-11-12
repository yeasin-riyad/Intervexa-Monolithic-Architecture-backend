
import express from "express";
import { getAllInterviews, getInterview, startInterview, submitAnswer } from "../controller/interview.controller.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";

const interviewRouter= express.Router();

interviewRouter.post("/start",isAuthenticated,startInterview);
interviewRouter.post("/answer",isAuthenticated,submitAnswer);
interviewRouter.get("/all-interviews",isAuthenticated,getAllInterviews);
interviewRouter.get("/:id",isAuthenticated,getInterview);


export default interviewRouter;