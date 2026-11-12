
import jwt from "jsonwebtoken";

export const generateToken = (user, isDemo = false) => {
  return jwt.sign(
    {
      sub: user._id.toString(),
      isDemo,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    }
  );
};

export const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};
