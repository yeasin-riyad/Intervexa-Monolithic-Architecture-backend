import express from "express";

import {
  googleAuth,
  logout,
  useCoins,
  demoLogin,
  getCurrentUser,
} from "../controller/auth.controller.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";


const authRouter = express.Router();

// Public routes
authRouter.post("/google", googleAuth);
authRouter.post("/demo-login", demoLogin);

// Logout only clears the cookie, so authentication middleware isn't required
authRouter.post("/logout", logout);

// Protected routes
authRouter.post("/use-coins", isAuthenticated, useCoins);
authRouter.get("/me",isAuthenticated,getCurrentUser);

export default authRouter ;