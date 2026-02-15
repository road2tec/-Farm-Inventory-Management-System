"use client";

import { useAuth } from "@/context/AuthProvider";
import axios from "axios";
import { IconClock } from "@tabler/icons-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const UserOrdersPage = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/orders?role=user");
      if (res.data.success) {
        setOrders(res.data.orders);
      }
    } catch (err) {
      console.error("Failed to fetch orders", err);
      toast.error("Error loading orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (!user) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-black mb-10 text-center uppercase tracking-tighter text-primary">Your Orders</h1>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <span className="loading loading-ring loading-lg text-primary scale-150"></span>
          <p className="font-black text-gray-400 uppercase tracking-widest text-xs animate-pulse">Retrieving your harvest history...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-gray-100">
          <p className="text-2xl font-black text-gray-900 tracking-tight mb-4">No Orders Yet</p>
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-8">Your fields are waiting to be filled</p>
          <Link href="/user/browse" className="btn btn-primary px-10 rounded-2xl font-black shadow-lg shadow-primary/20">Start Shopping</Link>
        </div>
      ) : (
        <div className="space-y-8">
          {orders.map((order: any) => (
            <div
              key={order._id}
              className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 overflow-hidden group"
            >
              <div className="p-8 md:p-10 flex flex-col md:flex-row justify-between gap-10">
                {/* Order Meta */}
                <div className="md:w-1/3">
                  <div className="flex flex-wrap items-center gap-3 mb-6">
                    <span className="px-4 py-2 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase tracking-widest border border-primary/10">ID: {order._id.slice(-6).toUpperCase()}</span>

                    {/* Payment Status Badge */}
                    <span className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${order.paymentStatus === 'completed' ? 'bg-success/10 text-success' : 'bg-yellow-100 text-yellow-600'}`}>
                      Payment: {order.paymentStatus === 'completed' ? 'Paid' : 'Pending'} ({order.paymentMethod?.toUpperCase()})
                    </span>

                    {/* Delivery Status Badge */}
                    <span className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${order.deliveryStatus === 'delivered' ? 'bg-success/10 text-success' :
                      order.deliveryStatus === 'pending' ? 'bg-yellow-100 text-yellow-600' : 'bg-primary/10 text-primary'
                      }`}>
                      Delivery: {order.deliveryStatus}
                    </span>
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Total Harvest Cost</p>
                  <p className="text-5xl font-black text-gray-900 tracking-tighter mb-6">₹{order.totalPrice}</p>
                  <div className="flex items-center gap-2 text-sm font-bold text-gray-400 uppercase tracking-widest">
                    <IconClock size={16} /> {new Date(order.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                </div>

                {/* Products List */}
                <div className="flex-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-6 pb-2 border-b border-gray-50">Produce Items</p>
                  <div className="space-y-4">
                    {order.products.map((item: any) => (
                      <div key={item.product?._id} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border border-gray-100 group-hover:bg-white transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center border-2 border-primary/5 shadow-sm">
                            <img src={item.product?.imageUrl || '/placeholder.jpg'} alt="" className="w-10 h-10 object-contain" />
                          </div>
                          <div>
                            <p className="font-black text-gray-900">{item.product?.name}</p>
                            <p className="text-[10px] font-black text-primary uppercase tracking-widest">Qty: {item.quantity}</p>
                          </div>
                        </div>
                        <p className="text-xl font-black text-gray-900">₹{item.product?.price * item.quantity}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Farmer Info */}
                <div className="md:w-1/4 md:border-l border-gray-100 md:pl-10">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-6">Farmer Source</p>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-primary/20">
                      {order.farmerId?.name[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-black text-gray-900">{order.farmerId?.name}</p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Trusted Partner</p>
                    </div>
                  </div>
                  <button className="btn btn-ghost btn-block h-12 rounded-xl text-xs font-black uppercase tracking-widest text-gray-400 hover:text-primary hover:bg-primary/5 mt-4">Contact Support</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserOrdersPage;
