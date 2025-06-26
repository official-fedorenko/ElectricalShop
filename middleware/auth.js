const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Middleware to verify JWT token
const authenticate = async (req, res, next) => {
  try {
    let token;

    // Get token from header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access token is missing or invalid",
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from database
      const user = await User.findById(decoded.id).select("-password");

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "The user belonging to this token no longer exists",
        });
      }

      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: "Your account has been deactivated",
        });
      }

      // Grant access to protected route
      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error during authentication",
    });
  }
};

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: "Access denied. Admin role required",
    });
  }
};

// Middleware to check if user is admin or accessing their own data
const requireAdminOrSelf = (req, res, next) => {
  if (
    req.user &&
    (req.user.role === "admin" || req.user._id.toString() === req.params.id)
  ) {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: "Access denied. You can only access your own data",
    });
  }
};

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });
};

module.exports = {
  authenticate,
  requireAdmin,
  requireAdminOrSelf,
  generateToken,
};
