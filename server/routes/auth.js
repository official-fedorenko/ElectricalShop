const express = require("express");
const { body, validationResult } = require("express-validator");
const { generateToken, authenticate } = require("../middleware/auth");
const { asyncHandler } = require("../middleware/errorHandler");
const db = require("../utils/jsonDatabase");
const bcrypt = require("bcrypt");

const router = express.Router();

// Validation middleware
const validateRegistration = [
  body("firstName")
    .trim()
    .notEmpty()
    .withMessage("First name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("First name must be between 2 and 50 characters"),

  body("lastName")
    .trim()
    .notEmpty()
    .withMessage("Last name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Last name must be between 2 and 50 characters"),

  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please enter a valid email"),

  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
];

const validateLogin = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please enter a valid email"),

  body("password").notEmpty().withMessage("Password is required"),
];

// Helper function to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array(),
    });
  }
  next();
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post(
  "/register",
  validateRegistration,
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const { firstName, lastName, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
    });

    // Generate token
    const token = generateToken(user._id);

    // Remove password from response
    const userResponse = user.toSafeObject();

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        user: userResponse,
        token,
      },
    });
  })
);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post(
  "/login",
  validateLogin,
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Check if user exists
    const user = await db.getUserByEmail(email);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check password
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Generate token
    const token = generateToken(user.id);

    // Remove password from response
    const userResponse = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
    };

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: userResponse,
        token,
      },
    });
  })
);

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get(
  "/me",
  authenticate,
  asyncHandler(async (req, res) => {
    const user = req.user.toSafeObject();

    res.status(200).json({
      success: true,
      data: {
        user,
      },
    });
  })
);

// @route   PUT /api/auth/me
// @desc    Update current user profile
// @access  Private
router.put(
  "/me",
  authenticate,
  [
    body("firstName")
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage("First name must be between 2 and 50 characters"),

    body("lastName")
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage("Last name must be between 2 and 50 characters"),

    body("avatar").optional().isURL().withMessage("Avatar must be a valid URL"),
  ],
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const { firstName, lastName, avatar } = req.body;

    const updateData = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (avatar) updateData.avatar = avatar;

    const user = await User.findByIdAndUpdate(req.user._id, updateData, {
      new: true,
      runValidators: true,
    });

    const userResponse = user.toSafeObject();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: {
        user: userResponse,
      },
    });
  })
);

// @route   PUT /api/auth/change-password
// @desc    Change user password
// @access  Private
router.put(
  "/change-password",
  authenticate,
  [
    body("currentPassword")
      .notEmpty()
      .withMessage("Current password is required"),

    body("newPassword")
      .isLength({ min: 6 })
      .withMessage("New password must be at least 6 characters long")
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage(
        "New password must contain at least one uppercase letter, one lowercase letter, and one number"
      ),
  ],
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await User.findById(req.user._id).select("+password");

    // Check current password
    const isCurrentPasswordMatch = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordMatch) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  })
);

// @route   POST /api/auth/logout
// @desc    Logout user (client-side token removal)
// @access  Private
router.post(
  "/logout",
  authenticate,
  asyncHandler(async (req, res) => {
    res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  })
);

module.exports = router;
