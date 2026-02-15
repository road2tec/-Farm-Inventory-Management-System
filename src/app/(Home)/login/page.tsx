"use client";

import { IconEye, IconEyeOff, IconPlant, IconArrowLeft } from "@tabler/icons-react";
import axios, { AxiosResponse } from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import Link from "next/link";

const LoginPage = () => {
  const [formData, setFormData] = useState({
    role: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    if (!formData.role || !formData.email || !formData.password) {
      toast.error("Please fill all the fields");
      return;
    }
    const response = axios.post("/api/auth/login", { formData });
    toast.promise(response, {
      loading: "Signing in...",
      success: (data: AxiosResponse) => {
        router.push(data.data.route);
        return data.data.message;
      },
      error: (err: any) => {
        console.log(err);
        return err.response.data.message;
      },
    });
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6 pt-32">
      <div className="max-w-6xl w-full bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-gray-100 grid grid-cols-1 lg:grid-cols-2">

        {/* Left Side - Visual */}
        <div className="hidden lg:block relative p-12 bg-primary/5 overflow-hidden">
          {/* SVG Decorations */}
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-secondary/10 rounded-full blur-3xl"></div>

          <div className="absolute top-10 left-10 z-20">
            <Link href="/" className="inline-flex items-center gap-2 text-primary font-black uppercase tracking-widest text-xs p-4 bg-white rounded-2xl shadow-lg hover:shadow-primary/20 hover:-translate-x-1 transition-all">
              <IconArrowLeft size={16} /> Back to Home
            </Link>
          </div>

          <div className="h-full flex flex-col justify-center animate-fade-up relative z-10">
            <div className="p-4 bg-primary w-fit rounded-3xl mb-8 shadow-xl shadow-primary/20">
              <IconPlant size={48} className="text-white" />
            </div>
            <h2 className="text-5xl font-black text-gray-900 leading-[0.9] tracking-tighter mb-6">
              Welcome <br /> <span className="text-primary italic">Back.</span>
            </h2>
            <p className="max-w-xs text-lg font-medium text-gray-600 leading-relaxed mb-10">
              Grow your farm business or shop for the freshest food. Everything starts here.
            </p>
            <div className="relative">
              <div className="absolute inset-0 bg-primary/10 rounded-[2rem] translate-x-3 translate-y-3 -z-10"></div>
              <img
                src="https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&q=80&w=800"
                className="rounded-[2rem] shadow-xl border-4 border-white animate-float object-cover h-64 w-full"
                alt="Agriculture Visual"
              />
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="p-8 md:p-16 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full">
            <h3 className="text-4xl font-black tracking-tighter text-gray-900 mb-2">Hello Again!</h3>
            <p className="text-sm font-bold text-primary uppercase tracking-widest mb-10 text-opacity-70">Login to your account</p>

            <div className="space-y-6">
              <div className="form-control">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 px-1">Who are you?</label>
                <select
                  className="select select-bordered select-primary w-full h-14 rounded-2xl font-bold bg-gray-50 border-gray-100 outline-none focus:ring-2 focus:ring-primary transition-all text-gray-700"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="">Select Your Role</option>
                  <option value="admin">Admin</option>
                  <option value="farmer">Farmer</option>
                  <option value="user">Customer</option>
                </select>
              </div>

              {formData.role && (
                <div className="space-y-6 animate-fade-up">
                  <div className="form-control">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 px-1">Your Email</label>
                    <input
                      type="email"
                      placeholder="e.g. rajesh@farm.com"
                      className="input input-bordered input-primary w-full h-14 rounded-2xl font-bold bg-gray-50 border-none outline-none focus:ring-2 focus:ring-primary transition-all text-gray-800"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>

                  <div className="form-control">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 px-1">Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="input input-bordered input-primary w-full h-14 rounded-2xl font-bold bg-gray-50 border-none outline-none focus:ring-2 focus:ring-primary transition-all pr-12 text-gray-800"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      />
                      <button
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-primary opacity-50 hover:opacity-100 transition-opacity"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <IconEyeOff size={20} /> : <IconEye size={20} />}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <button
                className="btn btn-primary btn-block h-14 rounded-2xl text-lg font-black uppercase tracking-widest shadow-xl shadow-primary/20 mt-4 group"
                onClick={handleSubmit}
              >
                Sign In
                <IconArrowLeft className="rotate-180 group-hover:translate-x-2 transition-transform" />
              </button>

              <p className="text-center font-bold text-sm text-gray-500">
                New here? <Link href="/signup" className="text-primary hover:underline underline-offset-4">Join Community</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
