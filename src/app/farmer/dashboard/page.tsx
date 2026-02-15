"use client";

import { useAuth } from "@/context/AuthProvider";
import { IconPackage, IconShoppingCart, IconCurrencyRupee, IconClock, IconLeaf, IconPlant } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";

interface Product {
  _id: string;
  name: string;
  stock: number;
  price: number;
}

interface Order {
  _id: string;
  totalPrice: number;
  deliveryStatus: string;
  createdAt: string;
}

const FarmerDashboard = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?._id) return;

      try {
        setLoading(true);

        const productsRes = await axios.get(`/api/products?ownerId=${user._id}`);
        if (productsRes.data.success) {
          setProducts(productsRes.data.products);
        }

        const ordersRes = await axios.get("/api/orders?role=farmer");
        if (ordersRes.data.success) {
          setOrders(ordersRes.data.orders);

          const totalOrders = ordersRes.data.orders.length;
          const pendingOrders = ordersRes.data.orders.filter(
            (order: Order) => order.deliveryStatus === "pending"
          ).length;
          const totalRevenue = ordersRes.data.orders.reduce(
            (sum: number, order: Order) => sum + order.totalPrice,
            0
          );

          setStats({
            totalProducts: productsRes.data.products.length,
            totalOrders,
            totalRevenue,
            pendingOrders,
          });
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (!user) return null;

  return (
    <div className="px-4 md:px-8 py-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">
          Farmer Dashboard
        </h1>
        <p className="text-sm text-gray-500">
          Manage your farm and products
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <IconPackage size={24} className="text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Total Products</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <IconShoppingCart size={24} className="text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <IconCurrencyRupee size={24} className="text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">₹{stats.totalRevenue}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <IconClock size={24} className="text-yellow-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Pending Orders</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingOrders}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Link
          href="/farmer/add-product"
          className="block bg-green-600 rounded-xl p-6 text-white hover:bg-green-700 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold mb-1">Add New Product</h3>
              <p className="text-sm text-green-100">List your products for sale</p>
            </div>
            <IconLeaf size={40} className="opacity-30" />
          </div>
        </Link>

        <Link
          href="/farmer/orders"
          className="block bg-blue-600 rounded-xl p-6 text-white hover:bg-blue-700 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold mb-1">View Orders</h3>
              <p className="text-sm text-blue-100">Check customer orders</p>
            </div>
            <IconShoppingCart size={40} className="opacity-30" />
          </div>
        </Link>

        <Link
          href="/farmer/inventory-logs"
          className="block bg-purple-600 rounded-xl p-6 text-white hover:bg-purple-700 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold mb-1">Stock History</h3>
              <p className="text-sm text-purple-100">View inventory changes</p>
            </div>
            <IconPackage size={40} className="opacity-30" />
          </div>
        </Link>
      </div>

      {/* Recent Orders */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 space-y-3">
          <IconPlant size={40} className="text-green-600 animate-bounce" />
          <p className="text-sm text-gray-500">Loading data...</p>
        </div>
      ) : orders.length > 0 && (
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
            <Link href="/farmer/orders" className="text-sm font-medium text-green-600 hover:underline">
              View All →
            </Link>
          </div>

          <div className="space-y-3">
            {orders.slice(0, 3).map((order) => (
              <div
                key={order._id}
                className="flex items-center justify-between bg-gray-50 rounded-lg p-4 border border-gray-100"
              >
                <div>
                  <p className="text-xs text-gray-500 mb-1">Order ID</p>
                  <p className="text-sm font-bold text-gray-900">#{order._id.slice(-8)}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(order.createdAt).toLocaleDateString("en-IN")}
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${order.deliveryStatus === "delivered"
                      ? "bg-green-100 text-green-700"
                      : order.deliveryStatus === "shipped"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-yellow-100 text-yellow-700"
                      }`}
                  >
                    {order.deliveryStatus}
                  </span>
                  <p className="text-lg font-bold text-gray-900 mt-2">₹{order.totalPrice}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
      }
    </div >
  );
};

export default FarmerDashboard;
