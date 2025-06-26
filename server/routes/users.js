const express = require("express");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const { requireAdmin, requireAdminOrSelf } = require("../middleware/auth");
const { asyncHandler } = require("../middleware/errorHandler");

const router = express.Router();

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

// @route   GET /api/users
// @desc    Get all users (admin only)
// @access  Private/Admin
router.get(
  "/",
  requireAdmin,
  asyncHandler(async (req, res) => {
    const {
      page = 1,
      limit = 10,
      role,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Build filter
    const filter = {};
    if (role) filter.role = role;
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Pagination
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .select("-password"),
      User.countDocuments(filter),
    ]);

    // Get user statistics
    const [totalUsers, totalAdmins, totalActiveUsers] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "admin" }),
      User.countDocuments({ isActive: true }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        users: users.map((user) => user.toSafeObject()),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
        statistics: {
          total: totalUsers,
          admins: totalAdmins,
          users: totalUsers - totalAdmins,
          active: totalActiveUsers,
        },
      },
    });
  })
);

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private/Admin or Self
router.get(
  "/:id",
  requireAdminOrSelf,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        user: user.toSafeObject(),
      },
    });
  })
);

// @route   PUT /api/users/:id
// @desc    Update user
// @access  Private/Admin or Self
router.put(
  "/:id",
  requireAdminOrSelf,
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

    body("role")
      .optional()
      .isIn(["user", "admin"])
      .withMessage("Role must be either user or admin"),
  ],
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const { firstName, lastName, avatar, role } = req.body;

    // Only admins can change roles
    if (role && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only administrators can change user roles",
      });
    }

    // Prevent demoting the last admin
    if (role === "user") {
      const user = await User.findById(req.params.id);
      if (user.role === "admin") {
        const adminCount = await User.countDocuments({ role: "admin" });
        if (adminCount <= 1) {
          return res.status(400).json({
            success: false,
            message: "Cannot demote the last administrator",
          });
        }
      }
    }

    const updateData = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (avatar) updateData.avatar = avatar;
    if (role) updateData.role = role;

    const user = await User.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: {
        user: user.toSafeObject(),
      },
    });
  })
);

// @route   PUT /api/users/:id/role
// @desc    Change user role (admin only)
// @access  Private/Admin
router.put(
  "/:id/role",
  requireAdmin,
  [
    body("role")
      .isIn(["user", "admin"])
      .withMessage("Role must be either user or admin"),
  ],
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const { role } = req.body;

    // Get the user to be updated
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Prevent demoting the last admin
    if (role === "user" && user.role === "admin") {
      const adminCount = await User.countDocuments({ role: "admin" });
      if (adminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: "Cannot demote the last administrator",
        });
      }
    }

    user.role = role;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${
        role === "admin" ? "promoted to" : "demoted from"
      } administrator successfully`,
      data: {
        user: user.toSafeObject(),
      },
    });
  })
);

// @route   PUT /api/users/:id/activate
// @desc    Activate/deactivate user (admin only)
// @access  Private/Admin
router.put(
  "/:id/activate",
  requireAdmin,
  [
    body("isActive")
      .isBoolean()
      .withMessage("isActive must be a boolean value"),
  ],
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const { isActive } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Prevent deactivating the last admin
    if (!isActive && user.role === "admin") {
      const activeAdminCount = await User.countDocuments({
        role: "admin",
        isActive: true,
      });
      if (activeAdminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: "Cannot deactivate the last active administrator",
        });
      }
    }

    user.isActive = isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${isActive ? "activated" : "deactivated"} successfully`,
      data: {
        user: user.toSafeObject(),
      },
    });
  })
);

// @route   DELETE /api/users/:id
// @desc    Delete user (admin only)
// @access  Private/Admin
router.delete(
  "/:id",
  requireAdmin,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Prevent deleting the last admin
    if (user.role === "admin") {
      const adminCount = await User.countDocuments({ role: "admin" });
      if (adminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: "Cannot delete the last administrator",
        });
      }
    }

    // Prevent admins from deleting themselves
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own account",
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  })
);

// @route   GET /api/users/stats
// @desc    Get user statistics (admin only)
// @access  Private/Admin
router.get(
  "/statistics/overview",
  requireAdmin,
  asyncHandler(async (req, res) => {
    const [totalUsers, totalAdmins, activeUsers, newUsersThisMonth] =
      await Promise.all([
        User.countDocuments(),
        User.countDocuments({ role: "admin" }),
        User.countDocuments({ isActive: true }),
        User.countDocuments({
          createdAt: {
            $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        }),
      ]);

    const regularUsers = totalUsers - totalAdmins;

    res.status(200).json({
      success: true,
      data: {
        statistics: {
          total: totalUsers,
          admins: totalAdmins,
          users: regularUsers,
          active: activeUsers,
          inactive: totalUsers - activeUsers,
          newThisMonth: newUsersThisMonth,
        },
      },
    });
  })
);

module.exports = router;
