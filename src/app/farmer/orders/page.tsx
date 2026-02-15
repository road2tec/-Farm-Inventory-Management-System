"use client";

import { useAuth } from "@/context/AuthProvider";
import { IconPackage, IconUser, IconMapPin, IconPhone, IconMail, IconClock, IconLeaf } from "@tabler/icons-react";
import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface Order {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    contact: string;
    address: {
      address: string;
      district: string;
      state: string;
      pincode: string;
    };
  };
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
  paymentStatus: string;
  createdAt: string;
}

const FarmerOrdersPage = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/orders?role=farmer");
      if (res.data.success) {
        setOrders(res.data.orders);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  if (!user) return null;

  return (
    <div className="px-4 md:px-8 py-12 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-5xl font-black text-gray-900 tracking-tighter mb-2">
          Harvest <span className="text-secondary italic">Orders.</span>
        </h1>
        <p className="text-sm font-bold text-gray-400 uppercase tracking-[0.3em]">
          Manage your customer orders
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-secondary/10 rounded-2xl flex items-center justify-center">
              <IconPackage size={28} className="text-secondary" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Total Orders</p>
              <p className="text-4xl font-black text-gray-900 tracking-tighter">{orders.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-yellow-100 rounded-2xl flex items-center justify-center">
              <IconClock size={28} className="text-yellow-600" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Pending</p>
              <p className="text-4xl font-black text-gray-900 tracking-tighter">
                {orders.filter((o) => o.deliveryStatus === "pending").length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center">
              <IconLeaf size={28} className="text-green-600" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Revenue</p>
              <p className="text-4xl font-black text-gray-900 tracking-tighter">
                ₹{orders.reduce((sum, o) => sum + o.totalPrice, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <IconPackage size={48} className="text-secondary animate-bounce" />
          <p className="font-black text-gray-400 uppercase tracking-widest text-xs animate-pulse">
            Loading orders...
          </p>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-gray-100">
          <IconPackage className="mx-auto text-gray-200 mb-6" size={80} />
          <p className="text-2xl font-black text-gray-900 tracking-tight mb-2">No Orders Yet</p>
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">
            Orders will appear here when customers purchase your products
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-gray-100 shadow-sm hover:shadow-lg transition-all"
            >
              {/* Order Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-gray-100">
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-1">Order ID</p>
                  <p className="text-2xl font-black text-gray-900 font-mono">#{order._id.slice(-8)}</p>
                  <p className="text-xs font-bold text-gray-500 mt-2">
                    {new Date(order.createdAt).toLocaleString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <div className="flex gap-3">
                  <span
                    className={`px-5 py-3 rounded-full text-xs font-black uppercase tracking-widest ${order.deliveryStatus === "delivered"
                      ? "bg-green-100 text-green-700"
                      : order.deliveryStatus === "shipped"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-yellow-100 text-yellow-700"
                      }`}
                  >
                    {order.deliveryStatus}
                  </span>
                  <span
                    className={`px-5 py-3 rounded-full text-xs font-black uppercase tracking-widest ${order.paymentStatus === "completed"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                      }`}
                  >
                    {order.paymentStatus}
                  </span>
                </div>
              </div>

              {/* Customer Details */}
              <div className="bg-gray-50 rounded-[2rem] p-6 mb-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-secondary/10 text-secondary rounded-xl flex items-center justify-center">
                    <IconUser size={20} />
                  </div>
                  <p className="font-black text-gray-900 uppercase text-sm tracking-widest">Customer Details</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-start gap-3">
                    <IconUser size={20} className="text-gray-400 mt-1" />
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest text-gray-400">Name</p>
                      <p className="text-lg font-black text-gray-900">{order.userId.name}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <IconPhone size={20} className="text-gray-400 mt-1" />
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest text-gray-400">Contact</p>
                      <p className="text-lg font-black text-gray-900">{order.userId.contact}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <IconMail size={20} className="text-gray-400 mt-1" />
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest text-gray-400">Email</p>
                      <p className="text-sm font-bold text-gray-700">{order.userId.email}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <IconMapPin size={20} className="text-gray-400 mt-1" />
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest text-gray-400">Delivery Address</p>
                      <p className="text-sm font-bold text-gray-700">
                        {order.userId.address ? (
                          <>
                            {order.userId.address.address}, {order.userId.address.district}
                            <br />
                            {order.userId.address.state} - {order.userId.address.pincode}
                          </>
                        ) : (
                          "Address not provided"
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Products */}
              <div className="mb-8">
                <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">Order Items</p>
                <div className="space-y-4">
                  {order.products.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-4 bg-gray-50 rounded-2xl p-4 border border-gray-100"
                    >
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        className="w-20 h-20 object-cover rounded-xl"
                      />
                      <div className="flex-1">
                        <p className="text-lg font-black text-gray-900">{item.product.name}</p>
                        <p className="text-sm font-bold text-gray-500">Quantity: {item.quantity} units</p>
                      </div>
                      <p className="text-2xl font-black text-gray-900">₹{item.product.price * item.quantity}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                <p className="text-lg font-black uppercase tracking-widest text-gray-900">Total Amount</p>
                <p className="text-4xl font-black text-secondary">₹{order.totalPrice}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FarmerOrdersPage;
