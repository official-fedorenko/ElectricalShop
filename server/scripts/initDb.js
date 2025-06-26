const mongoose = require("mongoose");
const User = require("../models/User");
const Product = require("../models/Product");
require("dotenv").config();

const mockProducts = [
  {
    name: "iPhone 15 Pro Max 256GB",
    description: "Новейший iPhone с титановым корпусом и передовой камерой",
    price: 1349,
    originalPrice: 1499,
    image:
      "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&h=300&fit=crop",
    category: "Смартфоны",
    brand: "Apple",
    inStock: true,
    quantity: 15,
    rating: 4.8,
    reviewCount: 245,
    features: ["A17 Pro чип", "48MP камера", "Titanium корпус"],
  },
  {
    name: 'MacBook Air M3 13"',
    description: "Ультратонкий ноутбук с чипом M3 для повседневных задач",
    price: 1199,
    originalPrice: 1299,
    image:
      "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400&h=300&fit=crop",
    category: "Ноутбуки",
    brand: "Apple",
    inStock: true,
    quantity: 8,
    rating: 4.9,
    reviewCount: 189,
    features: ["M3 чип", "18 часов работы", "Liquid Retina дисплей"],
  },
  {
    name: "Samsung Galaxy S24 Ultra",
    description: "Флагманский смартфон с S Pen и мощной камерой",
    price: 1249,
    image:
      "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400&h=300&fit=crop",
    category: "Смартфоны",
    brand: "Samsung",
    inStock: true,
    quantity: 12,
    rating: 4.7,
    reviewCount: 312,
    features: ["200MP камера", "S Pen", "Snapdragon 8 Gen 3"],
  },
  {
    name: "Sony WH-1000XM5",
    description: "Беспроводные наушники с активным шумоподавлением",
    price: 349,
    originalPrice: 399,
    image:
      "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&h=300&fit=crop",
    category: "Наушники",
    brand: "Sony",
    inStock: true,
    quantity: 25,
    rating: 4.6,
    reviewCount: 156,
    features: ["Шумоподавление", "30 часов работы", "Hi-Res Audio"],
  },
  {
    name: "Dell XPS 13 Plus",
    description: "Премиальный ультрабук с InfinityEdge дисплеем",
    price: 1399,
    image:
      "https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=400&h=300&fit=crop",
    category: "Ноутбуки",
    brand: "Dell",
    inStock: true,
    quantity: 6,
    rating: 4.5,
    reviewCount: 89,
    features: ["Intel i7-13700H", "32GB RAM", "4K OLED дисплей"],
  },
  {
    name: 'iPad Pro 12.9" M2',
    description: "Мощный планшет для профессиональной работы",
    price: 1099,
    originalPrice: 1199,
    image:
      "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=300&fit=crop",
    category: "Планшеты",
    brand: "Apple",
    inStock: true,
    quantity: 10,
    rating: 4.8,
    reviewCount: 203,
    features: ["M2 чип", "Liquid Retina XDR", "Apple Pencil 2"],
  },
  {
    name: "Samsung Galaxy Tab S9 Ultra",
    description: "Флагманский планшет с большим экраном",
    price: 1199,
    image:
      "https://images.unsplash.com/photo-1561154464-82e9adf32764?w=400&h=300&fit=crop",
    category: "Планшеты",
    brand: "Samsung",
    inStock: false,
    quantity: 0,
    rating: 4.4,
    reviewCount: 67,
    features: ['14.6" экран', "S Pen в комплекте", "IP68 защита"],
  },
  {
    name: "AirPods Pro 2",
    description: "Беспроводные наушники с пространственным аудио",
    price: 249,
    originalPrice: 279,
    image:
      "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=400&h=300&fit=crop",
    category: "Наушники",
    brand: "Apple",
    inStock: true,
    quantity: 30,
    rating: 4.7,
    reviewCount: 445,
    features: [
      "Активное шумоподавление",
      "Пространственное аудио",
      "MagSafe зарядка",
    ],
  },
];

const mockUsers = [
  {
    firstName: "Пользователь",
    lastName: "Обычный",
    email: "user@shop.com",
    password: "user123456",
    role: "user",
    isEmailVerified: true,
    avatar:
      "https://images.unsplash.com/photo-1494790108755-2616b612b789?w=150",
  },
  {
    firstName: "Джон",
    lastName: "Доу",
    email: "john.doe@example.com",
    password: "john123456",
    role: "user",
    isEmailVerified: true,
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
  },
  {
    firstName: "Джейн",
    lastName: "Смит",
    email: "jane.smith@example.com",
    password: "jane123456",
    role: "user",
    isEmailVerified: true,
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
  },
];

const initializeDatabase = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("🔗 Connected to MongoDB");

    // Clear existing data
    await Promise.all([User.deleteMany({}), Product.deleteMany({})]);
    console.log("🧹 Cleared existing data");

    // Create default admin user
    await User.createDefaultAdmin();

    // Create test users
    console.log("👥 Creating test users...");
    const createdUsers = await User.insertMany(mockUsers);
    console.log(`✅ Created ${createdUsers.length} test users`);

    // Get admin user for product creation
    const adminUser = await User.findOne({ email: "admin@shop.com" });

    // Create test products
    console.log("📦 Creating test products...");
    const productsWithCreator = mockProducts.map((product) => ({
      ...product,
      createdBy: adminUser._id,
      updatedBy: adminUser._id,
    }));

    const createdProducts = await Product.insertMany(productsWithCreator);
    console.log(`✅ Created ${createdProducts.length} test products`);

    // Get statistics
    const [userCount, productCount, adminCount] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments(),
      User.countDocuments({ role: "admin" }),
    ]);

    console.log("\n📊 Database Summary:");
    console.log(
      `👥 Total Users: ${userCount} (${adminCount} admins, ${
        userCount - adminCount
      } regular users)`
    );
    console.log(`📦 Total Products: ${productCount}`);
    console.log("\n🔑 Test Accounts:");
    console.log("Admin: admin@shop.com / admin123456");
    console.log("User: user@shop.com / user123456");
    console.log("User: john.doe@example.com / john123456");
    console.log("User: jane.smith@example.com / jane123456");

    console.log("\n✅ Database initialization completed successfully!");
  } catch (error) {
    console.error("❌ Error initializing database:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
    process.exit(0);
  }
};

// Run the initialization
if (require.main === module) {
  initializeDatabase();
}

module.exports = { initializeDatabase, mockProducts, mockUsers };
