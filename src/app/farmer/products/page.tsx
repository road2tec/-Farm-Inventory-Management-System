"use client";

import { useAuth } from "@/context/AuthProvider";
import { Product } from "@/types/Users";
import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const FarmerProductsPage = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    if (!user?._id) return;
    try {
      setLoading(true);
      const res = await axios.get(`/api/products?ownerId=${user._id}`);
      if (res.data.success) {
        setProducts(res.data.products);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch your products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?._id) {
      fetchProducts();
    }
  }, [user]);

  if (!user) return null;

  return (
    <div className="px-6 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center uppercase text-primary">Your Products</h1>

      {loading ? (
        <div className="flex justify-center py-10">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-10 bg-base-200 rounded-xl">
          <p className="text-xl opacity-50 font-semibold text-base-content/70">No products registered yet.</p>
          <a href="/farmer/add-product" className="btn btn-primary mt-4">Add Your First Product</a>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <div
              key={product._id}
              className="card bg-base-200 shadow-xl hover:shadow-2xl transition-all duration-300 border border-primary/10 overflow-hidden"
            >
              <figure className="h-48 bg-white p-4">
                <img
                  src={product.imageUrl || "/placeholder.jpg"}
                  alt={product.name}
                  className="object-contain w-full h-full transform hover:scale-105 transition-transform"
                />
              </figure>
              <div className="card-body">
                <div className="flex justify-between items-start">
                  <h2 className="card-title text-2xl text-primary font-bold">{product.name}</h2>
                  <div className="badge badge-outline badge-primary">{product.category}</div>
                </div>
                <p className="text-base-content/70 mt-2 line-clamp-2">{product.description}</p>
                <div className="divider my-2"></div>
                <div className="flex justify-between items-end">
                  <div>
                    <span className="text-sm opacity-50 uppercase font-bold tracking-wider">Price</span>
                    <p className="text-2xl font-black text-secondary">₹{product.price}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm opacity-50 uppercase font-bold tracking-wider">Stock</span>
                    <p className="text-xl font-bold">{product.stock} units</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FarmerProductsPage;
