const express = require("express");
const { body, validationResult } = require("express-validator");
const { authenticate } = require("../middleware/auth");
const db = require("../utils/jsonDatabase");

const router = express.Router();

// Получить корзину пользователя
router.get("/", authenticate, async (req, res) => {
  try {
    let cart = await db.getCartByUserId(req.user.id);

    if (!cart) {
      cart = await db.createCart({
        userId: req.user.id,
        items: [],
        totalAmount: 0,
        totalItems: 0,
      });
    }

    res.json({
      success: true,
      data: cart,
    });
  } catch (error) {
    console.error("Get cart error:", error);
    res.status(500).json({
      success: false,
      message: "Ошибка получения корзины",
    });
  }
});

// Добавить товар в корзину
router.post(
  "/items",
  [
    authenticate,
    body("productId").notEmpty().withMessage("Некорректный ID товара"),
    body("quantity")
      .isInt({ min: 1, max: 5 })
      .withMessage("Количество должно быть от 1 до 5"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Ошибка валидации",
          errors: errors.array(),
        });
      }

      const { productId, quantity } = req.body;

      // Проверяем существование товара
      const product = await db.getProductById(productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Товар не найден",
        });
      }

      // Проверяем наличие товара
      if (!product.inStock) {
        return res.status(400).json({
          success: false,
          message: "Товар нет в наличии",
        });
      }

      // Находим или создаем корзину
      let cart = await db.getCartByUserId(req.user.id);
      if (!cart) {
        cart = await db.createCart({
          userId: req.user.id,
          items: [],
          totalAmount: 0,
          totalItems: 0,
        });
      }

      // Добавляем товар в корзину
      const existingItem = cart.items.find(
        (item) => item.productId === productId
      );

      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        if (newQuantity > 5) {
          return res.status(400).json({
            success: false,
            message: "Максимальное количество одного товара - 5 штук",
          });
        }
        existingItem.quantity = newQuantity;
        existingItem.price = product.price;
        existingItem.name = product.name;
        existingItem.image = product.image;
      } else {
        cart.items.push({
          productId,
          quantity,
          price: product.price,
          name: product.name,
          image: product.image,
        });
      }

      // Пересчитываем итоги
      cart.totalItems = cart.items.reduce(
        (total, item) => total + item.quantity,
        0
      );
      cart.totalAmount = cart.items.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      );

      // Сохраняем корзину
      cart = await db.updateCart(req.user.id, cart);

      res.json({
        success: true,
        data: cart,
        message: `${product.name} добавлен в корзину`,
      });
    } catch (error) {
      console.error("Add to cart error:", error);

      if (error.message.includes("Максимальное количество")) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: "Ошибка добавления товара в корзину",
      });
    }
  }
);

// Обновить количество товара в корзине
router.put(
  "/items/:productId",
  [
    authenticate,
    body("quantity")
      .isInt({ min: 1, max: 5 })
      .withMessage("Количество должно быть от 1 до 5"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Ошибка валидации",
          errors: errors.array(),
        });
      }

      const { productId } = req.params;
      const { quantity } = req.body;

      const cart = await db.getCartByUserId(req.user.id);
      if (!cart) {
        return res.status(404).json({
          success: false,
          message: "Корзина не найдена",
        });
      }

      // Находим товар в корзине
      const existingItem = cart.items.find(
        (item) => item.productId === productId
      );

      if (!existingItem) {
        return res.status(404).json({
          success: false,
          message: "Товар не найден в корзине",
        });
      }

      if (quantity < 1 || quantity > 5) {
        return res.status(400).json({
          success: false,
          message: "Количество должно быть от 1 до 5",
        });
      }

      // Обновляем количество
      existingItem.quantity = quantity;

      // Пересчитываем итоги
      cart.totalItems = cart.items.reduce(
        (total, item) => total + item.quantity,
        0
      );
      cart.totalAmount = cart.items.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      );

      // Сохраняем корзину
      const updatedCart = await db.updateCart(req.user.id, cart);

      res.json({
        success: true,
        data: updatedCart,
        message: "Количество товара обновлено",
      });
    } catch (error) {
      console.error("Update cart item error:", error);

      if (
        error.message.includes("Количество должно быть") ||
        error.message.includes("Товар не найден")
      ) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: "Ошибка обновления товара в корзине",
      });
    }
  }
);

// Удалить товар из корзины
router.delete("/items/:productId", authenticate, async (req, res) => {
  try {
    const { productId } = req.params;

    const cart = await db.getCartByUserId(req.user.id);
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Корзина не найдена",
      });
    }

    // Удаляем товар из корзины
    cart.items = cart.items.filter((item) => item.productId !== productId);

    // Пересчитываем итоги
    cart.totalItems = cart.items.reduce(
      (total, item) => total + item.quantity,
      0
    );
    cart.totalAmount = cart.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    // Сохраняем корзину
    const updatedCart = await db.updateCart(req.user.id, cart);

    res.json({
      success: true,
      data: updatedCart,
      message: "Товар удален из корзины",
    });
  } catch (error) {
    console.error("Remove from cart error:", error);
    res.status(500).json({
      success: false,
      message: "Ошибка удаления товара из корзины",
    });
  }
});

// Очистить корзину
router.delete("/", authenticate, async (req, res) => {
  try {
    const cart = await db.getCartByUserId(req.user.id);
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Корзина не найдена",
      });
    }

    // Очищаем корзину
    cart.items = [];
    cart.totalItems = 0;
    cart.totalAmount = 0;

    // Сохраняем очищенную корзину
    const clearedCart = await db.updateCart(req.user.id, cart);

    res.json({
      success: true,
      data: clearedCart,
      message: "Корзина очищена",
    });
  } catch (error) {
    console.error("Clear cart error:", error);
    res.status(500).json({
      success: false,
      message: "Ошибка очистки корзины",
    });
  }
});

// Синхронизация корзины при входе (объединение localStorage с серверной корзиной)
router.post(
  "/sync",
  [
    authenticate,
    body("localCartItems")
      .isArray()
      .withMessage("localCartItems должен быть массивом"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Ошибка валидации",
          errors: errors.array(),
        });
      }

      const { localCartItems } = req.body;

      // Находим или создаем серверную корзину
      let cart = await db.getCartByUserId(req.user.id);
      if (!cart) {
        cart = await db.createCart({
          userId: req.user.id,
          items: [],
          totalAmount: 0,
          totalItems: 0,
        });
      }

      // Объединяем товары из localStorage с серверной корзиной
      for (const localItem of localCartItems) {
        try {
          // Проверяем существование и наличие товара
          const product = await db.getProductById(localItem.productId);
          if (product && product.inStock) {
            // Проверяем, есть ли уже этот товар в корзине
            const existingItem = cart.items.find(
              (item) => item.productId === localItem.productId
            );

            if (existingItem) {
              const newQuantity = existingItem.quantity + localItem.quantity;
              if (newQuantity <= 5) {
                existingItem.quantity = newQuantity;
                existingItem.price = product.price;
                existingItem.name = product.name;
                existingItem.image = product.image;
              }
            } else {
              if (localItem.quantity <= 5) {
                cart.items.push({
                  productId: localItem.productId,
                  quantity: localItem.quantity,
                  price: product.price,
                  name: product.name,
                  image: product.image,
                });
              }
            }
          }
        } catch (itemError) {
          // Игнорируем ошибки отдельных товаров (например, превышение лимита)
          console.warn("Sync cart item error:", itemError.message);
        }
      }

      // Пересчитываем итоги
      cart.totalItems = cart.items.reduce(
        (total, item) => total + item.quantity,
        0
      );
      cart.totalAmount = cart.items.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      );

      // Сохраняем синхронизированную корзину
      const syncedCart = await db.updateCart(req.user.id, cart);

      res.json({
        success: true,
        data: syncedCart,
        message: "Корзина синхронизирована",
      });
    } catch (error) {
      console.error("Sync cart error:", error);
      res.status(500).json({
        success: false,
        message: "Ошибка синхронизации корзины",
      });
    }
  }
);

module.exports = router;
