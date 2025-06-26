const mongoose = require("mongoose");

const CartItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
  },
});

const CartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    items: [CartItemSchema],
    totalAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalItems: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Вычисляем общие суммы перед сохранением
CartSchema.pre("save", function (next) {
  this.totalItems = this.items.reduce(
    (total, item) => total + item.quantity,
    0
  );
  this.totalAmount = this.items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  next();
});

// Метод для добавления товара в корзину
CartSchema.methods.addItem = function (
  productId,
  quantity,
  price,
  name,
  image
) {
  const existingItem = this.items.find(
    (item) => item.productId.toString() === productId.toString()
  );

  if (existingItem) {
    // Проверяем максимальное количество
    const newQuantity = existingItem.quantity + quantity;
    if (newQuantity > 5) {
      throw new Error("Максимальное количество одного товара - 5 штук");
    }
    existingItem.quantity = newQuantity;
    existingItem.price = price; // Обновляем цену на случай изменения
    existingItem.name = name; // Обновляем название
    existingItem.image = image; // Обновляем изображение
  } else {
    if (quantity > 5) {
      throw new Error("Максимальное количество одного товара - 5 штук");
    }
    this.items.push({ productId, quantity, price, name, image });
  }

  return this.save();
};

// Метод для обновления количества товара
CartSchema.methods.updateItemQuantity = function (productId, quantity) {
  if (quantity < 1 || quantity > 5) {
    throw new Error("Количество должно быть от 1 до 5");
  }

  const item = this.items.find(
    (item) => item.productId.toString() === productId.toString()
  );
  if (!item) {
    throw new Error("Товар не найден в корзине");
  }

  item.quantity = quantity;
  return this.save();
};

// Метод для удаления товара из корзины
CartSchema.methods.removeItem = function (productId) {
  this.items = this.items.filter(
    (item) => item.productId.toString() !== productId.toString()
  );
  return this.save();
};

// Метод для очистки корзины
CartSchema.methods.clear = function () {
  this.items = [];
  return this.save();
};

module.exports = mongoose.model("Cart", CartSchema);
