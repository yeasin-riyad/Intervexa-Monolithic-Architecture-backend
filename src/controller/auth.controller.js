import { getAuth } from "firebase-admin/auth";
import { app } from "../config/firebase.js";
import User from "../models/user.model.js";
import { generateToken } from "../utils/token.js";

// Cookie configuration
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

// Reusable user response
const formatUser = (user, isDemo = false) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  avatar: user.avatar,
  interviewCoin: user.interviewCoin,
  ...(isDemo && { isDemo: true }),
});

// Reusable JWT cookie creator
const setAuthCookie = (res, user, isDemo = false) => {
  const token = generateToken(user, isDemo);

  res.cookie("session", token, cookieOptions);

  return token;
};

// ==============================
// GOOGLE AUTH
// ==============================

export const googleAuth = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Firebase token missing",
      });
    }

    // Verify Firebase ID token
    const decoded = await getAuth(app).verifyIdToken(token);

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

    // Generate JWT and set cookie
    setAuthCookie(res, user);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: formatUser(user),
    });

  } catch (error) {
    console.error("Google Auth Error:", error);

    return res.status(500).json({
      success: false,
      message: "Google authentication failed",
    });
  }
};

// ==============================
// LOGOUT
// ==============================

export const logout = async (req, res) => {
  try {
    // Clear JWT cookie
    res.clearCookie("session", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax"
    });

    return res.status(200).json({
      success: true,
      message: "Logout successful",
    });

  } catch (error) {
    console.error("Logout Error:", error);

    return res.status(500).json({
      success: false,
      message: "Logout failed",
    });
  }
};

// ==============================
// DEDUCT INTERVIEW COINS
// ==============================

export const useCoins = async (req, res) => {
  try {
    const { coins, action } = req.body;

    // Validate coin amount
    if (!Number.isSafeInteger(coins) || coins <= 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid coin amount.",
      });
    }

    // Validate action
    if (
      !action ||
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
      user: formatUser(user, req.auth.isDemo),
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

    // Find predefined demo account
    let user = await User.findOne({
      firebaseUid,
    });

    // Create demo account if not found
    if (!user) {
      user = await User.create({
        firebaseUid,
        name: "Demo User",
        email: "demo@intervexa.ai",
        avatar: "",
        interviewCoin: 150,
      });
    }

    // Generate demo JWT
    setAuthCookie(res, user, true);

    return res.status(200).json({
      success: true,
      message: "Demo login successful",
      user: formatUser(user, true),
    });

  } catch (error) {
    console.error("Demo Login Error:", error);

    return res.status(500).json({
      success: false,
      message: "Demo login failed",
    });
  }
};



export const getCurrentUser = async (req, res) => {
  try {
    return res.status(200).json({ success: true, user: req.user });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};