"use client";

import { useAuth } from "@/context/AuthProvider";
import { IconShoppingCart, IconPackage, IconCurrencyRupee, IconClock, IconLeaf } from "@tabler/icons-react";
import axios from "axios";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Order {
  _id: string;
  products: Array<{
    product: {
      _id: string;
      name: string;
      imageUrl: string;
      price: number;
    };
    quantity: number;
  }>;
  totalPrice: number;
  deliveryStatus: string;
  createdAt: string;
}

const UserDashboard = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    totalSpent: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await axios.get("/api/orders?role=user");
        if (res.data.success) {
          const fetchedOrders = res.data.orders;
          setOrders(fetchedOrders);

          const totalOrders = fetchedOrders.length;
          const pendingOrders = fetchedOrders.filter(
            (order: Order) => order.deliveryStatus === "pending"
          ).length;
          const totalSpent = fetchedOrders.reduce(
            (sum: number, order: Order) => sum + order.totalPrice,
            0
          );

          setStats({ totalOrders, pendingOrders, totalSpent });
        }
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchOrders();
    }
  }, [user]);

  if (!user) return null;

  return (
    <div className="px-4 md:px-8 py-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">My Dashboard</h1>
        <p className="text-sm text-gray-500">Welcome back, {user.name}!</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
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
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <IconClock size={24} className="text-yellow-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Pending Delivery</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingOrders}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <IconCurrencyRupee size={24} className="text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Total Spent</p>
              <p className="text-2xl font-bold text-gray-900">₹{stats.totalSpent}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Link
          href="/user/browse"
          className="block bg-green-600 rounded-xl p-6 text-white hover:bg-green-700 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold mb-1">Browse Products</h3>
              <p className="text-sm text-green-100">Shop fresh farm products</p>
            </div>
            <IconLeaf size={40} className="opacity-30" />
          </div>
        </Link>

        <Link
          href="/user/orders"
          className="block bg-blue-600 rounded-xl p-6 text-white hover:bg-blue-700 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold mb-1">My Orders</h3>
              <p className="text-sm text-blue-100">Track your purchases</p>
            </div>
            <IconPackage size={40} className="opacity-30" />
          </div>
        </Link>
      </div>

      {/* Recent Purchases */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 space-y-3">
          <IconShoppingCart size={40} className="text-blue-600 animate-bounce" />
          <p className="text-sm text-gray-500">Loading orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-xl p-12 border-2 border-dashed border-gray-200 text-center">
          <IconShoppingCart className="mx-auto text-gray-300 mb-4" size={60} />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Orders Yet</h3>
          <p className="text-sm text-gray-500 mb-6">Start shopping for fresh products</p>
          <Link
            href="/user/browse"
            className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Recent Purchases</h2>
            <Link href="/user/orders" className="text-sm font-medium text-green-600 hover:underline">
              View All →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {orders.slice(0, 3).map((order) => (
              <div key={order._id} className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                {order.products[0] && (
                  <img
                    src={order.products[0].product.imageUrl}
                    alt={order.products[0].product.name}
                    className="w-full h-32 object-cover rounded-lg mb-3"
                  />
                )}
                <p className="text-sm font-bold text-gray-900 mb-1">
                  {order.products[0]?.product.name}
                  {order.products.length > 1 && ` +${order.products.length - 1} more`}
                </p>
                <div className="flex items-center justify-between mt-3">
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
                  <p className="text-lg font-bold text-gray-900">₹{order.totalPrice}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
