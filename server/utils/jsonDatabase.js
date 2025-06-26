const fs = require("fs").promises;
const path = require("path");

class JsonDatabase {
  constructor() {
    this.dataDir = path.join(__dirname, "..", "data");
  }

  async readFile(filename) {
    try {
      const filePath = path.join(this.dataDir, filename);
      const data = await fs.readFile(filePath, "utf8");
      return JSON.parse(data);
    } catch (error) {
      console.error(`Error reading ${filename}:`, error);
      return [];
    }
  }

  async writeFile(filename, data) {
    try {
      const filePath = path.join(this.dataDir, filename);
      await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
      return true;
    } catch (error) {
      console.error(`Error writing ${filename}:`, error);
      return false;
    }
  }

  // Products methods
  async getProducts(options = {}) {
    const products = await this.readFile("products.json");
    let filtered = [...products];

    // Фильтрация
    if (options.category && options.category !== "all") {
      filtered = filtered.filter((p) => p.category === options.category);
    }

    if (options.brand) {
      filtered = filtered.filter((p) => p.brand === options.brand);
    }

    if (options.minPrice !== undefined) {
      filtered = filtered.filter((p) => p.price >= options.minPrice);
    }

    if (options.maxPrice !== undefined) {
      filtered = filtered.filter((p) => p.price <= options.maxPrice);
    }

    if (options.inStock !== undefined) {
      filtered = filtered.filter((p) => p.inStock === options.inStock);
    }

    if (options.search) {
      const searchLower = options.search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchLower) ||
          p.description.toLowerCase().includes(searchLower)
      );
    }

    // Сортировка
    const sortBy = options.sortBy || "createdAt";
    const sortOrder = options.sortOrder || "desc";

    filtered.sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];

      if (sortBy === "price") {
        aVal = parseFloat(aVal);
        bVal = parseFloat(bVal);
      }

      if (sortOrder === "asc") {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    // Пагинация
    const page = parseInt(options.page) || 1;
    const limit = parseInt(options.limit) || 12;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    const paginatedProducts = filtered.slice(startIndex, endIndex);

    return {
      products: paginatedProducts,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(filtered.length / limit),
        totalProducts: filtered.length,
        hasNextPage: endIndex < filtered.length,
        hasPreviousPage: page > 1,
      },
    };
  }

  async getProductById(id) {
    const products = await this.readFile("products.json");
    return products.find((p) => p.id === id);
  }

  async createProduct(productData) {
    const products = await this.readFile("products.json");
    const newProduct = {
      id: Date.now().toString(),
      ...productData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    products.push(newProduct);
    await this.writeFile("products.json", products);
    return newProduct;
  }

  async updateProduct(id, productData) {
    const products = await this.readFile("products.json");
    const index = products.findIndex((p) => p.id === id);
    if (index === -1) return null;

    products[index] = {
      ...products[index],
      ...productData,
      updatedAt: new Date().toISOString(),
    };
    await this.writeFile("products.json", products);
    return products[index];
  }

  async deleteProduct(id) {
    const products = await this.readFile("products.json");
    const filteredProducts = products.filter((p) => p.id !== id);
    await this.writeFile("products.json", filteredProducts);
    return filteredProducts.length < products.length;
  }

  // Users methods
  async getUsers() {
    return await this.readFile("users.json");
  }

  async getUserById(id) {
    const users = await this.readFile("users.json");
    return users.find((u) => u.id === id);
  }

  async getUserByEmail(email) {
    const users = await this.readFile("users.json");
    return users.find((u) => u.email === email);
  }

  async createUser(userData) {
    const users = await this.readFile("users.json");
    const newUser = {
      id: Date.now().toString(),
      ...userData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    users.push(newUser);
    await this.writeFile("users.json", users);
    return newUser;
  }

  async updateUser(id, userData) {
    const users = await this.readFile("users.json");
    const index = users.findIndex((u) => u.id === id);
    if (index === -1) return null;

    users[index] = {
      ...users[index],
      ...userData,
      updatedAt: new Date().toISOString(),
    };
    await this.writeFile("users.json", users);
    return users[index];
  }

  async deleteUser(id) {
    const users = await this.readFile("users.json");
    const filteredUsers = users.filter((u) => u.id !== id);
    await this.writeFile("users.json", filteredUsers);
    return filteredUsers.length < users.length;
  }

  // Carts methods
  async getCarts() {
    return await this.readFile("carts.json");
  }

  async getCartByUserId(userId) {
    const carts = await this.readFile("carts.json");
    return carts.find((c) => c.userId === userId);
  }

  async createCart(cartData) {
    const carts = await this.readFile("carts.json");
    const newCart = {
      id: Date.now().toString(),
      ...cartData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    carts.push(newCart);
    await this.writeFile("carts.json", carts);
    return newCart;
  }

  async updateCart(userId, cartData) {
    const carts = await this.readFile("carts.json");
    const index = carts.findIndex((c) => c.userId === userId);

    if (index === -1) {
      return await this.createCart({ userId, ...cartData });
    }

    carts[index] = {
      ...carts[index],
      ...cartData,
      updatedAt: new Date().toISOString(),
    };
    await this.writeFile("carts.json", carts);
    return carts[index];
  }

  async deleteCart(userId) {
    const carts = await this.readFile("carts.json");
    const filteredCarts = carts.filter((c) => c.userId !== userId);
    await this.writeFile("carts.json", filteredCarts);
    return filteredCarts.length < carts.length;
  }
}

module.exports = new JsonDatabase();
