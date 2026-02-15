"use client";

import { useAuth } from "@/context/AuthProvider";
import { User } from "@/types/Users";
import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  IconUserCheck,
  IconUserX,
  IconMail,
  IconPhone,
  IconCircleCheck,
  IconHourglassLow
} from "@tabler/icons-react";

const ManageFarmersPage = () => {
  const { user } = useAuth();
  const [farmers, setFarmers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFarmers = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/admin/farmers");
      if (res.data.success) {
        setFarmers(res.data.farmers);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch farmers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFarmers();
  }, []);

  const handleApproveStatus = async (farmerId: string, isApproved: boolean) => {
    try {
      const res = axios.post("/api/admin/approve-farmer", {
        farmerId,
        isApproved,
      });

      toast.promise(res, {
        loading: isApproved ? "Approving farmer..." : "Rejecting farmer...",
        success: isApproved ? "Farmer approved successfully" : "Farmer rejected successfully",
        error: "Failed to update farmer status",
      });

      await res;
      fetchFarmers();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update status");
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase">Manage Farmers</h1>
          <p className="text-[10px] font-bold text-primary uppercase tracking-[0.3em] mt-1">Approval Queue & Verification</p>
        </div>
        <div className="px-6 py-3 bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
            <IconUserCheck size={20} />
          </div>
          <div>
            <p className="text-xl font-black text-gray-900 leading-none">{farmers.length}</p>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Total Farmers</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr className="border-b border-gray-50 bg-gray-50/50">
                <th className="bg-transparent text-[10px] font-black uppercase tracking-widest text-gray-400 p-6">#</th>
                <th className="bg-transparent text-[10px] font-black uppercase tracking-widest text-gray-400 p-6">Farmer Profile</th>
                <th className="bg-transparent text-[10px] font-black uppercase tracking-widest text-gray-400 p-6 text-center">Status</th>
                <th className="bg-transparent text-[10px] font-black uppercase tracking-widest text-gray-400 p-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={4} className="p-20 text-center">
                    <span className="loading loading-ring loading-lg text-primary"></span>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-4">Fetching verification list...</p>
                  </td>
                </tr>
              ) : farmers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-20 text-center">
                    <p className="text-xl font-black text-gray-900">No Farmers Found</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">The field is empty</p>
                  </td>
                </tr>
              ) : (
                farmers.map((farmer, index) => (
                  <tr key={farmer._id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="p-6 font-black text-gray-400 text-xs italic">
                      {(index + 1).toString().padStart(2, '0')}
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="avatar">
                          <div className="w-14 h-14 rounded-2xl border-2 border-primary/10 overflow-hidden shadow-sm group-hover:border-primary/30 transition-colors">
                            <img
                              src={farmer.profileImage || `https://ui-avatars.com/api/?name=${farmer.name}&background=F0FDFA&color=0D9488&bold=true`}
                              alt={farmer.name}
                              className="object-cover"
                            />
                          </div>
                        </div>
                        <div>
                          <div className="font-black text-gray-900 text-lg leading-tight">{farmer.name}</div>
                          <div className="flex flex-col gap-1 mt-1">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400">
                              <IconMail size={12} className="text-primary" /> {farmer.email}
                            </div>
                            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400">
                              <IconPhone size={12} className="text-primary" /> {farmer.contact || "No Contact"}
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-6 text-center">
                      {farmer.isApproved ? (
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-success/10 text-success rounded-full border border-success/10">
                          <IconCircleCheck size={14} />
                          <span className="text-[10px] font-black uppercase tracking-widest italic">Approved</span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-600 rounded-full border border-yellow-200 shadow-sm">
                          <IconHourglassLow size={14} className="animate-pulse" />
                          <span className="text-[10px] font-black uppercase tracking-widest italic font-bold">Pending</span>
                        </div>
                      )}
                    </td>
                    <td className="p-6 text-right">
                      {!farmer.isApproved ? (
                        <button
                          className="btn bg-emerald-500 hover:bg-emerald-600 border-none text-white rounded-xl shadow-lg shadow-emerald-500/20 gap-2 px-6 group/btn transition-all active:scale-95"
                          onClick={() => handleApproveStatus(farmer._id!, true)}
                        >
                          <IconUserCheck size={18} className="group-hover/btn:scale-110 transition-transform" />
                          <span className="font-black uppercase tracking-widest text-[10px]">Approve Farmer</span>
                        </button>
                      ) : (
                        <button
                          className="btn bg-rose-500 hover:bg-rose-600 border-none text-white rounded-xl shadow-lg shadow-rose-500/20 gap-2 px-6 group/btn transition-all active:scale-95"
                          onClick={() => handleApproveStatus(farmer._id!, false)}
                        >
                          <IconUserX size={18} className="group-hover/btn:scale-110 transition-transform" />
                          <span className="font-black uppercase tracking-widest text-[10px]">Reject Farmer</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageFarmersPage;
