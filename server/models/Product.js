const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      maxlength: [200, "Product name cannot exceed 200 characters"],
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
      trim: true,
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: [0, "Price cannot be negative"],
    },
    originalPrice: {
      type: Number,
      min: [0, "Original price cannot be negative"],
      default: null,
    },
    category: {
      type: String,
      required: [true, "Product category is required"],
      enum: ["Смартфоны", "Ноутбуки", "Планшеты", "Наушники"],
      trim: true,
    },
    brand: {
      type: String,
      required: [true, "Product brand is required"],
      trim: true,
      maxlength: [100, "Brand name cannot exceed 100 characters"],
    },
    image: {
      type: String,
      required: [true, "Product image is required"],
      trim: true,
    },
    images: [
      {
        type: String,
        trim: true,
      },
    ],
    inStock: {
      type: Boolean,
      default: true,
    },
    quantity: {
      type: Number,
      default: 0,
      min: [0, "Quantity cannot be negative"],
    },
    rating: {
      type: Number,
      default: 0,
      min: [0, "Rating cannot be negative"],
      max: [5, "Rating cannot exceed 5"],
    },
    reviewCount: {
      type: Number,
      default: 0,
      min: [0, "Review count cannot be negative"],
    },
    features: [
      {
        type: String,
        trim: true,
      },
    ],
    specifications: {
      type: Map,
      of: String,
      default: new Map(),
    },
    weight: {
      type: Number,
      min: [0, "Weight cannot be negative"],
    },
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
    },
    warranty: {
      type: String,
      trim: true,
    },
    sku: {
      type: String,
      unique: true,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for discount percentage
productSchema.virtual("discountPercentage").get(function () {
  if (this.originalPrice && this.originalPrice > this.price) {
    return Math.round(
      ((this.originalPrice - this.price) / this.originalPrice) * 100
    );
  }
  return 0;
});

// Generate SKU before saving
productSchema.pre("save", function (next) {
  if (!this.sku) {
    const brandCode = this.brand.substring(0, 3).toUpperCase();
    const categoryCode = this.category.substring(0, 3).toUpperCase();
    const timestamp = Date.now().toString().slice(-6);
    this.sku = `${brandCode}-${categoryCode}-${timestamp}`;
  }
  next();
});

// Update inStock based on quantity
productSchema.pre("save", function (next) {
  this.inStock = this.quantity > 0;
  next();
});

// Static method to get products with filtering and pagination
productSchema.statics.getProducts = async function (options = {}) {
  const {
    page = 1,
    limit = 12,
    category,
    brand,
    minPrice,
    maxPrice,
    inStock,
    sortBy = "createdAt",
    sortOrder = "desc",
    search,
  } = options;

  // Build filter object
  const filter = { isActive: true };

  if (category && category !== "Все категории") {
    filter.category = category;
  }

  if (brand && brand !== "Все бренды") {
    filter.brand = brand;
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.price = {};
    if (minPrice !== undefined) filter.price.$gte = minPrice;
    if (maxPrice !== undefined) filter.price.$lte = maxPrice;
  }

  if (inStock !== undefined) {
    filter.inStock = inStock;
  }

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { brand: { $regex: search, $options: "i" } },
    ];
  }

  // Build sort object
  const sort = {};
  sort[sortBy] = sortOrder === "desc" ? -1 : 1;

  // Execute query with pagination
  const skip = (page - 1) * limit;

  const [products, total] = await Promise.all([
    this.find(filter)
      .populate("createdBy", "firstName lastName")
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit)),
    this.countDocuments(filter),
  ]);

  return {
    products,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

// Indexes for better performance
productSchema.index({ category: 1 });
productSchema.index({ brand: 1 });
productSchema.index({ price: 1 });
productSchema.index({ inStock: 1 });
productSchema.index({ rating: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ name: "text", description: "text", brand: "text" });

module.exports = mongoose.model("Product", productSchema);
