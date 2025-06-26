const express = require("express");
const { body, validationResult } = require("express-validator");
const { authenticate, requireAdmin } = require("../middleware/auth");
const { asyncHandler } = require("../middleware/errorHandler");
const db = require("../utils/jsonDatabase");

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

// Product validation rules
const productValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Product name is required")
    .isLength({ min: 2, max: 200 })
    .withMessage("Product name must be between 2 and 200 characters"),

  body("description")
    .trim()
    .notEmpty()
    .withMessage("Product description is required")
    .isLength({ min: 10, max: 2000 })
    .withMessage("Description must be between 10 and 2000 characters"),

  body("price")
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number"),

  body("originalPrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Original price must be a positive number"),

  body("category")
    .isIn(["Смартфоны", "Ноутбуки", "Планшеты", "Наушники"])
    .withMessage("Invalid category"),

  body("brand")
    .trim()
    .notEmpty()
    .withMessage("Brand is required")
    .isLength({ min: 1, max: 100 })
    .withMessage("Brand name must be between 1 and 100 characters"),

  body("image").isURL().withMessage("Image must be a valid URL"),

  body("quantity")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Quantity must be a non-negative integer"),

  body("features")
    .optional()
    .isArray()
    .withMessage("Features must be an array"),

  body("features.*")
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage("Each feature must be between 1 and 200 characters"),
];

// @route   GET /api/products
// @desc    Get all products with filtering and pagination
// @access  Public
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const {
      page,
      limit,
      category,
      brand,
      minPrice,
      maxPrice,
      inStock,
      sortBy,
      sortOrder,
      search,
    } = req.query;

    const options = {
      page: page || 1,
      limit: limit || 12,
      category,
      brand,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      inStock: inStock ? inStock === "true" : undefined,
      sortBy: sortBy || "createdAt",
      sortOrder: sortOrder || "desc",
      search,
    };

    const result = await db.getProducts(options);

    res.status(200).json({
      success: true,
      data: result,
    });
  })
);

// @route   GET /api/products/categories
// @desc    Get all product categories
// @access  Public
router.get(
  "/categories",
  asyncHandler(async (req, res) => {
    const categories = await Product.distinct("category", { isActive: true });

    res.status(200).json({
      success: true,
      data: {
        categories: ["Все категории", ...categories],
      },
    });
  })
);

// @route   GET /api/products/brands
// @desc    Get all product brands
// @access  Public
router.get(
  "/brands",
  asyncHandler(async (req, res) => {
    const brands = await Product.distinct("brand", { isActive: true });

    res.status(200).json({
      success: true,
      data: {
        brands: ["Все бренды", ...brands.sort()],
      },
    });
  })
);

// @route   GET /api/products/stats
// @desc    Get product statistics (admin only)
// @access  Private/Admin
router.get(
  "/statistics/overview",
  authenticate,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const [
      totalProducts,
      inStockProducts,
      totalCategories,
      totalBrands,
      totalValue,
    ] = await Promise.all([
      Product.countDocuments({ isActive: true }),
      Product.countDocuments({ isActive: true, inStock: true }),
      Product.distinct("category", { isActive: true }).then(
        (cats) => cats.length
      ),
      Product.distinct("brand", { isActive: true }).then(
        (brands) => brands.length
      ),
      Product.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: null, total: { $sum: "$price" } } },
      ]).then((result) => result[0]?.total || 0),
    ]);

    res.status(200).json({
      success: true,
      data: {
        statistics: {
          total: totalProducts,
          inStock: inStockProducts,
          outOfStock: totalProducts - inStockProducts,
          categories: totalCategories,
          brands: totalBrands,
          totalValue: totalValue,
        },
      },
    });
  })
);

// @route   GET /api/products/:id
// @desc    Get single product by ID
// @access  Public
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const product = await Product.findOne({
      _id: req.params.id,
      isActive: true,
    }).populate("createdBy", "firstName lastName");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        product,
      },
    });
  })
);

// @route   POST /api/products
// @desc    Create new product
// @access  Private/Admin
router.post(
  "/",
  authenticate,
  requireAdmin,
  productValidation,
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const productData = {
      ...req.body,
      createdBy: req.user._id,
      updatedBy: req.user._id,
    };

    // Set quantity to 1 if not provided and inStock is true
    if (productData.inStock && !productData.quantity) {
      productData.quantity = 1;
    }

    const product = await Product.create(productData);

    await product.populate("createdBy", "firstName lastName");

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: {
        product,
      },
    });
  })
);

// @route   PUT /api/products/:id
// @desc    Update product
// @access  Private/Admin
router.put(
  "/:id",
  authenticate,
  requireAdmin,
  productValidation,
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const updateData = {
      ...req.body,
      updatedBy: req.user._id,
    };

    const product = await Product.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).populate("createdBy updatedBy", "firstName lastName");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: {
        product,
      },
    });
  })
);

// @route   PUT /api/products/:id/stock
// @desc    Update product stock
// @access  Private/Admin
router.put(
  "/:id/stock",
  authenticate,
  requireAdmin,
  [
    body("quantity")
      .isInt({ min: 0 })
      .withMessage("Quantity must be a non-negative integer"),

    body("inStock")
      .optional()
      .isBoolean()
      .withMessage("inStock must be a boolean value"),
  ],
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const { quantity, inStock } = req.body;

    const updateData = {
      quantity,
      updatedBy: req.user._id,
    };

    // If inStock is explicitly provided, use it; otherwise, set based on quantity
    if (inStock !== undefined) {
      updateData.inStock = inStock;
    } else {
      updateData.inStock = quantity > 0;
    }

    const product = await Product.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product stock updated successfully",
      data: {
        product,
      },
    });
  })
);

// @route   DELETE /api/products/:id
// @desc    Delete product (soft delete)
// @access  Private/Admin
router.delete(
  "/:id",
  authenticate,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        isActive: false,
        updatedBy: req.user._id,
      },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  })
);

// @route   PUT /api/products/:id/restore
// @desc    Restore deleted product
// @access  Private/Admin
router.put(
  "/:id/restore",
  authenticate,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        isActive: true,
        updatedBy: req.user._id,
      },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product restored successfully",
      data: {
        product,
      },
    });
  })
);

module.exports = router;
