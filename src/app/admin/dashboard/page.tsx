"use client";

import {
  IconUsers,
  IconPlant,
  IconReceipt2,
  IconShieldCheck,
  IconChevronRight,
  IconLeaf,
} from "@tabler/icons-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import axios from "axios";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalFarmers: 0,
    totalProducts: 0,
    totalOrders: 0,
    pendingFarmers: 0,
  });
  const [pendingFarmers, setPendingFarmers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        const usersRes = await axios.get("/api/admin/users");
        const allUsers = usersRes.data.users || [];

        const totalUsers = allUsers.filter((u: any) => u.role === "user").length;
        const allFarmers = allUsers.filter((u: any) => u.role === "farmer");
        const totalFarmers = allFarmers.length;
        const pendingFarmers = allFarmers.filter((f: any) => !f.isApproved);

        const productsRes = await axios.get("/api/products");
        const totalProducts = productsRes.data.products?.length || 0;

        const ordersRes = await axios.get("/api/orders");
        const totalOrders = ordersRes.data.orders?.length || 0;

        setStats({
          totalUsers,
          totalFarmers,
          totalProducts,
          totalOrders,
          pendingFarmers: pendingFarmers.length,
        });

        setPendingFarmers(pendingFarmers.slice(0, 3));
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Admin Dashboard</h1>
        <p className="text-sm text-gray-500">Manage platform and users</p>
      </div>

      {/* Stats Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 space-y-3">
          <IconPlant size={40} className="text-green-600 animate-bounce" />
          <p className="text-sm text-gray-500">Loading data...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <IconUsers size={24} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <IconPlant size={24} className="text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Total Farmers</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalFarmers}</p>
                  <p className="text-xs text-yellow-600 font-medium mt-1">
                    {stats.pendingFarmers} pending approval
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <IconReceipt2 size={24} className="text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Active Products</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <IconShieldCheck size={24} className="text-orange-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              {/* Pending Approvals */}
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Pending Farmer Approvals</h3>
                  <Link href="/admin/manage-farmers" className="text-sm font-medium text-green-600 hover:underline flex items-center gap-1">
                    View All <IconChevronRight size={16} />
                  </Link>
                </div>
                <div className="space-y-3">
                  {pendingFarmers.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <p className="font-medium">No pending approvals</p>
                    </div>
                  ) : (
                    pendingFarmers.map((farmer, i) => (
                      <div key={i} className="flex items-center justify-between bg-gray-50 rounded-lg p-4 border border-gray-100">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <IconUsers size={20} className="text-gray-500" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{farmer.name}</p>
                            <p className="text-xs text-gray-500">{farmer.email}</p>
                          </div>
                        </div>
                        <Link href="/admin/manage-farmers" className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors">
                          Review
                        </Link>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Platform Overview */}
            <div className="space-y-6">
              <div className="bg-green-600 rounded-xl p-6 text-white shadow-lg">
                <h3 className="text-xl font-bold mb-4">Platform Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center bg-white/10 p-3 rounded-lg">
                    <span className="text-sm font-medium">Total Users</span>
                    <span className="text-sm font-bold">{stats.totalUsers + stats.totalFarmers}</span>
                  </div>
                  <div className="flex justify-between items-center bg-white/10 p-3 rounded-lg">
                    <span className="text-sm font-medium">Active Products</span>
                    <span className="text-sm font-bold">{stats.totalProducts}</span>
                  </div>
                  <div className="flex justify-between items-center bg-white/10 p-3 rounded-lg">
                    <span className="text-sm font-medium">Total Orders</span>
                    <span className="text-sm font-bold">{stats.totalOrders}</span>
                  </div>
                </div>
                <Link href="/admin/manage-farmers" className="block bg-white text-green-600 text-center py-3 rounded-lg font-bold mt-6 hover:bg-gray-100 transition-colors">
                  Manage Platform
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
