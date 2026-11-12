
import User from "../models/user.model.js";
import { verifyToken } from "../utils/token.js";

export const isAuthenticated = async (req, res, next) => {
  try {
    // Get JWT from HTTP-only cookie
    const token = req.cookies?.session;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Please login first.",
      });
    }

    // Verify JWT
    const decoded = verifyToken(token);

    // Find authenticated user
    const user = await User.findById(decoded.sub).select(
      "-geminiApiKey"
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found.",
      });
    }

    // Attach user and JWT information
    req.user = user;
    req.auth = {
      userId: decoded.sub,
      isDemo: decoded.isDemo || false,
    };

    next();

  } catch (error) {
    if (
      error.name === "TokenExpiredError" ||
      error.name === "JsonWebTokenError"
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired session. Please login again.",
      });
    }

    console.error("Auth Middleware Error:", error);

    return res.status(500).json({
      success: false,
      message: "Authentication failed.",
    });
  }
};
