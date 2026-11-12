
import { getAuth } from "firebase-admin/auth";
import { app } from "../config/firebase.js";
import User from "../models/user.model.js";
import { generateToken } from "../utils/token.js";

// ==============================
// COOKIE CONFIGURATION
// ==============================

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

// ==============================
// REUSABLE USER RESPONSE
// ==============================

const formatUser = (user, isDemo = false) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  avatar: user.avatar,
  interviewCoin: user.interviewCoin,
  ...(isDemo && { isDemo: true }),
});

// ==============================
// JWT COOKIE CREATOR
// ==============================

const setAuthCookie = (res, user, isDemo = false) => {
  const token = generateToken(user, isDemo);

  res.cookie("session", token, cookieOptions);
};

// ==============================
// GOOGLE AUTH
// ==============================

export const googleAuth = async (req, res) => {
  try {
    const { token } = req.body || {};

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Firebase token missing.",
      });
    }

    // Verify Firebase ID token
    const decoded = await getAuth(app).verifyIdToken(token);

    if (!decoded.uid || !decoded.email) {
      return res.status(401).json({
        success: false,
        message: "Invalid Firebase account.",
      });
    }

    // Find existing user
    let user = await User.findOne({
      firebaseUid: decoded.uid,
    });

    // Create user if not found
    if (!user) {
      user = await User.create({
        firebaseUid: decoded.uid,
        name: decoded.name || "User",
        email: decoded.email,
        avatar: decoded.picture || "",
      });
    }

    // Set JWT cookie
    setAuthCookie(res, user);

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      user: formatUser(user),
    });

  } catch (error) {
    console.error("Google Auth Error:", error);

    return res.status(401).json({
      success: false,
      message: "Google authentication failed.",
    });
  }
};

// ==============================
// LOGOUT
// ==============================

export const logout = async (req, res) => {
  try {
    res.clearCookie("session", {
      httpOnly: cookieOptions.httpOnly,
      secure: cookieOptions.secure,
      sameSite: cookieOptions.sameSite,
      path: cookieOptions.path,
    });

    return res.status(200).json({
      success: true,
      message: "Logout successful.",
    });

  } catch (error) {
    console.error("Logout Error:", error);

    return res.status(500).json({
      success: false,
      message: "Logout failed.",
    });
  }
};

// ==============================
// DEDUCT INTERVIEW COINS
// ==============================

export const useCoins = async (req, res) => {
  try {
    const { coins, action } = req.body || {};

    if (!Number.isSafeInteger(coins) || coins <= 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid coin amount.",
      });
    }

    if (
      typeof action !== "string" ||
      !action.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Action is required.",
      });
    }

    // Atomic coin deduction
    const user = await User.findOneAndUpdate(
      {
        _id: req.user._id,
        interviewCoin: { $gte: coins },
      },
      {
        $inc: {
          interviewCoin: -coins,
        },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Insufficient interview coins.",
        requiredCoins: coins,
        availableCoins: req.user.interviewCoin,
      });
    }

    return res.status(200).json({
      success: true,
      message: `${coins} interview coins deducted successfully.`,
      action: action.trim(),
      coinsUsed: coins,
      remainingCoins: user.interviewCoin,
      user: formatUser(user, req.auth?.isDemo),
    });

  } catch (error) {
    console.error("Use Coins Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error while deducting coins.",
    });
  }
};

// ==============================
// DEMO LOGIN
// ==============================

export const demoLogin = async (req, res) => {
  try {
    const firebaseUid = process.env.FIREBASEUID;

    if (!firebaseUid) {
      return res.status(500).json({
        success: false,
        message: "Demo account is not configured.",
      });
    }

    let user = await User.findOne({ firebaseUid });

    if (!user) {
      user = await User.create({
        firebaseUid,
        name: "Demo User",
        email: "demo@intervexa.ai",
        avatar: "",
        interviewCoin: 150,
      });
    }

    setAuthCookie(res, user, true);

    return res.status(200).json({
      success: true,
      message: "Demo login successful.",
      user: formatUser(user, true),
    });

  } catch (error) {
    console.error("Demo Login Error:", error);

    return res.status(500).json({
      success: false,
      message: "Demo login failed.",
    });
  }
};

// ==============================
// GET CURRENT USER
// ==============================

export const getCurrentUser = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized.",
      });
    }

    return res.status(200).json({
      success: true,
      user: formatUser(req.user, req.auth?.isDemo),
    });

  } catch (error) {
    console.error("Get Current User Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch current user.",
    });
  }
};
