"use client";

import { useAuth } from "@/context/AuthProvider";
import { Product } from "@/types/Users";
import axios from "axios";
import { IconBasket, IconSearch, IconShoppingCart } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Cart {
  productId: Product;
  quantity: number;
}

const UserBrowsePage = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [cart, setCart] = useState<Cart[]>(() => {
    if (typeof window !== "undefined") {
      const savedCart = localStorage.getItem("cart");
      return savedCart ? JSON.parse(savedCart) : [];
    }
    return [];
  });
  const [loading, setLoading] = useState(true);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/products");
      if (res.data.success) {
        setProducts(res.data.products);
        setFilteredProducts(res.data.products);
      }
    } catch (error) {
      console.error("Failed to fetch products", error);
      toast.error("Error loading products");
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product: Product) => {
    const existing = cart.find((item) => item.productId._id === product._id);

    if (existing) {
      setCart((prev) =>
        prev.map((item) =>
          item.productId._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
      toast.success(`${product.name} quantity increased!`);
    } else {
      setCart((prev) => [...prev, { productId: product, quantity: 1 }]);
      toast.success(`${product.name} added to cart!`);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    let filtered = products;

    if (search) {
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (category) {
      filtered = filtered.filter((p) => p.category === category);
    }

    setFilteredProducts(filtered);
  }, [search, category, products]);

  if (!user) return null;

  const getCartCount = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header with Cart */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Browse Products</h1>
          <p className="text-gray-500">Fresh produce from local farmers</p>
        </div>

        <Link
          href="/user/cart"
          className="btn bg-green-600 hover:bg-green-700 text-white border-none gap-2"
        >
          <IconShoppingCart size={20} />
          Cart ({getCartCount()})
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg p-6 border border-gray-200 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search products..."
              className="input w-full h-12 pl-10 rounded-lg bg-gray-50 border-gray-200"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="select h-12 rounded-lg bg-gray-50 border-gray-200"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            <option value="Vegetable">Vegetables</option>
            <option value="Fruit">Fruits</option>
            <option value="Grain">Grains</option>
            <option value="Dairy">Dairy</option>
          </select>
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="loading loading-spinner loading-lg text-green-600"></div>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-20">
          <IconBasket size={60} className="mx-auto text-gray-300 mb-4" />
          <p className="text-xl text-gray-500">No products found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product._id}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
            >
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-bold text-gray-900">{product.name}</h3>
                  {product.isOrganic && (
                    <span className="badge badge-success badge-sm text-white">Organic</span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>

                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-2xl font-bold text-green-600">₹{product.price}</p>
                    <p className="text-xs text-gray-500">per {product.unit}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-700">Stock: {product.stock}</p>
                    <p className="text-xs text-gray-500">{product.category}</p>
                  </div>
                </div>

                <button
                  onClick={() => addToCart(product)}
                  disabled={product.stock === 0}
                  className="btn bg-green-600 hover:bg-green-700 text-white border-none w-full"
                >
                  <IconBasket size={18} />
                  {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserBrowsePage;
