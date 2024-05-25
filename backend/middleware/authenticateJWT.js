import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

export const authenticateJWT = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    if (!token) {
      return res.status(401).json({ error: "Unauthorized: No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded) {
      return res.status(401).json({ error: "Unauthorized: Invalid token" });
    }

    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    req.user = user;
    return next();

  } catch (error) {
    console.log("Error in JWT authentication", error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
}