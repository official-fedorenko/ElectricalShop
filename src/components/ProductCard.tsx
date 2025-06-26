import React from "react";
import { Star, ShoppingCart } from "lucide-react";
import { formatPrice } from "../data/products";
import type { Product } from "../types";

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  viewMode?: "grid" | "list";
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  viewMode = "grid",
}) => {
  const discount = product.originalPrice
    ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100
      )
    : 0;

  if (viewMode === "list") {
    return (
      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
        <div className="flex">
          <div className="relative w-48 h-32 flex-shrink-0">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {discount > 0 && (
              <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-medium">
                -{discount}%
              </div>
            )}
            {!product.inStock && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  Нет в наличии
                </span>
              </div>
            )}
          </div>

          <div className="flex-1 p-4 flex flex-col justify-between">
            <div>
              <div className="mb-2">
                <span className="text-xs text-gray-500 uppercase tracking-wide">
                  {product.brand}
                </span>
                <h3 className="font-medium text-gray-900 hover:text-primary-600 transition-colors">
                  {product.name}
                </h3>
              </div>

              <div className="flex items-center mb-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.floor(product.rating)
                          ? "text-yellow-400 fill-current"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="ml-2 text-sm text-gray-600">
                  ({product.reviewCount})
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold text-gray-900">
                  {formatPrice(product.price)}
                </span>
                {product.originalPrice && (
                  <span className="text-sm text-gray-500 line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
              </div>

              <button
                onClick={() => onAddToCart?.(product)}
                disabled={!product.inStock}
                className={`flex items-center space-x-2 py-2 px-4 rounded-lg font-medium transition-colors ${
                  product.inStock
                    ? "bg-primary-600 text-white hover:bg-primary-700"
                    : "bg-gray-200 text-gray-500 cursor-not-allowed"
                }`}
              >
                <ShoppingCart className="h-4 w-4" />
                <span>{product.inStock ? "В корзину" : "Недоступно"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden group">
      <div className="relative">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {discount > 0 && (
          <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-medium">
            -{discount}%
          </div>
        )}
        {!product.inStock && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="text-white font-medium">Нет в наличии</span>
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="mb-2">
          <span className="text-xs text-gray-500 uppercase tracking-wide">
            {product.brand}
          </span>
          <h3 className="font-medium text-gray-900 line-clamp-2 hover:text-primary-600 transition-colors">
            {product.name}
          </h3>
        </div>

        <div className="flex items-center mb-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < Math.floor(product.rating)
                    ? "text-yellow-400 fill-current"
                    : "text-gray-300"
                }`}
              />
            ))}
          </div>
          <span className="ml-2 text-sm text-gray-600">
            ({product.reviewCount})
          </span>
        </div>

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold text-gray-900">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-gray-500 line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
        </div>

        <button
          onClick={() => onAddToCart?.(product)}
          disabled={!product.inStock}
          className={`w-full flex items-center justify-center space-x-2 py-2 px-4 rounded-lg font-medium transition-colors ${
            product.inStock
              ? "bg-primary-600 text-white hover:bg-primary-700"
              : "bg-gray-200 text-gray-500 cursor-not-allowed"
          }`}
        >
          <ShoppingCart className="h-4 w-4" />
          <span>{product.inStock ? "В корзину" : "Недоступно"}</span>
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
