"use client";

import { IconEye, IconEyeOff, IconPlant, IconArrowLeft, IconMail, IconDeviceMobile, IconMapPin, IconLock, IconCheck } from "@tabler/icons-react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import Link from "next/link";

const SignUpPage = () => {
  const [disabled, setDisabled] = useState(true);
  const [emailVerified, setEmailVerified] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contact: "",
    role: "",
    address: {
      address: "",
      district: "",
      state: "",
      pincode: "",
    },
    profileImage: "https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&q=80&w=800", // Default placeholder
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    const { name, role, email, contact, password, address } = formData;
    if (!name || !role || !email || !contact || !password || !address.address || !address.district || !address.state || !address.pincode) {
      toast.error("Please fill all the fields, including your complete address");
      return;
    }
    try {
      const response = axios.post("/api/auth/signup", { formData });
      toast.promise(response, {
        loading: "Creating Account...",
        success: (data) => {
          router.push("/login");
          return data.data.message;
        },
        error: (err: any) => err.response?.data?.message || "Error creating account",
      });
      await response;
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6 pt-32 pb-20">
      <div className="max-w-7xl w-full bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-gray-100 grid grid-cols-1 lg:grid-cols-2">

        {/* Left Side - Visual */}
        <div className="hidden lg:block relative p-16 bg-primary/5 overflow-hidden">
          {/* SVG Decorations */}
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-10 -right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl"></div>

          <div className="absolute top-10 left-10 z-20">
            <Link href="/" className="inline-flex items-center gap-2 text-primary font-black uppercase tracking-widest text-xs p-4 bg-white rounded-2xl shadow-lg hover:shadow-primary/20 hover:-translate-x-1 transition-all">
              <IconArrowLeft size={16} /> Back to Home
            </Link>
          </div>

          <div className="h-full flex flex-col justify-center animate-fade-up relative z-10">
            <div className="p-4 bg-primary w-fit rounded-3xl mb-8 shadow-xl shadow-primary/20">
              <IconPlant size={48} className="text-white" />
            </div>
            <h2 className="text-6xl font-black text-gray-900 leading-[0.9] tracking-tighter mb-8">
              Join the <br /> <span className="text-primary italic">Community.</span>
            </h2>
            <div className="space-y-6 max-w-sm mb-12">
              <div className="flex gap-4">
                <div className="p-2 bg-white rounded-xl shadow-md text-primary h-fit"><IconCheck size={20} /></div>
                <p className="text-sm font-bold text-gray-600">Support local organic farmers directly.</p>
              </div>
              <div className="flex gap-4">
                <div className="p-2 bg-white rounded-xl shadow-md text-primary h-fit"><IconCheck size={20} /></div>
                <p className="text-sm font-bold text-gray-600">Get 100% fresh and honest food.</p>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-primary/10 rounded-[2rem] translate-x-4 translate-y-4 -z-10"></div>
              <img
                src="https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?auto=format&fit=crop&q=80&w=800"
                className="rounded-[2rem] shadow-xl border-4 border-white animate-float object-cover h-64 w-full"
                alt="Agriculture Visual"
              />
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="p-8 md:p-12">
          <div className="max-w-xl mx-auto w-full">
            <h3 className="text-4xl font-black tracking-tighter text-gray-900 mb-2">Create Account</h3>
            <p className="text-sm font-bold text-primary uppercase tracking-widest mb-10 text-opacity-70">Start your farm-to-fork journey</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="form-control col-span-1 md:col-span-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 px-1">Who are you?</label>
                <select
                  className="select select-bordered select-primary w-full h-14 rounded-2xl font-bold bg-gray-50 border-gray-100 outline-none focus:ring-2 focus:ring-primary transition-all text-gray-700"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="">Choose Your Role</option>
                  <option value="farmer">Farmer (Requires Approval)</option>
                  <option value="user">Customer</option>
                </select>
              </div>

              {formData.role && (
                <>
                  <div className="form-control col-span-1 md:col-span-2 animate-fade-up">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 px-1">Your Name</label>
                    <div className="relative">
                      <IconPlant className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30 text-primary" size={20} />
                      <input
                        type="text"
                        placeholder="e.g. Rajesh Kumar"
                        className="input input-bordered input-primary w-full h-14 rounded-2xl font-bold bg-gray-50 border-none outline-none focus:ring-2 focus:ring-primary transition-all pl-12 text-gray-800"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-control col-span-1 md:col-span-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 px-1">Mobile Number</label>
                    <div className="relative">
                      <IconDeviceMobile className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30 text-primary" size={20} />
                      <input
                        type="text"
                        placeholder="10 digit number"
                        className="input input-bordered input-primary w-full h-14 rounded-2xl font-bold bg-gray-50 border-none outline-none focus:ring-2 focus:ring-primary transition-all pl-12 text-gray-800"
                        value={formData.contact}
                        onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                        maxLength={10}
                      />
                    </div>
                  </div>

                  <div className="form-control col-span-1 md:col-span-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 px-1">Email Address</label>
                    <div className="relative">
                      <IconMail className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30 text-primary" size={20} />
                      <input
                        type="email"
                        placeholder="name@email.com"
                        className="input input-bordered input-primary w-full h-14 rounded-2xl font-bold bg-gray-50 border-none outline-none focus:ring-2 focus:ring-primary transition-all pl-12 text-gray-800"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Conditional Address for Users/Farmers */}
                  {(formData.role === "user" || formData.role === "farmer") && (
                    <div className="form-control col-span-1 md:col-span-2 animate-fade-up grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 px-1">Where do you live?</label>
                        <input
                          type="text"
                          placeholder="Street / Locality"
                          className="input input-bordered input-primary w-full h-14 rounded-2xl font-bold bg-gray-50 border-none outline-none focus:ring-2 focus:ring-primary transition-all text-gray-800 px-4"
                          value={formData.address.address}
                          onChange={(e) => setFormData({ ...formData, address: { ...formData.address, address: e.target.value } })}
                        />
                      </div>
                      <input
                        type="text"
                        placeholder="District"
                        className="input input-bordered input-primary w-full h-14 rounded-2xl font-bold bg-gray-50 border-none outline-none focus:ring-2 focus:ring-primary transition-all text-gray-800 px-4"
                        value={formData.address.district}
                        onChange={(e) => setFormData({ ...formData, address: { ...formData.address, district: e.target.value } })}
                      />
                      <input
                        type="text"
                        placeholder="State"
                        className="input input-bordered input-primary w-full h-14 rounded-2xl font-bold bg-gray-50 border-none outline-none focus:ring-2 focus:ring-primary transition-all text-gray-800 px-4"
                        value={formData.address.state}
                        onChange={(e) => setFormData({ ...formData, address: { ...formData.address, state: e.target.value } })}
                      />
                      <input
                        type="text"
                        placeholder="Pincode"
                        className="input input-bordered input-primary w-full h-14 rounded-2xl font-bold bg-gray-50 border-none outline-none focus:ring-2 focus:ring-primary transition-all text-gray-800 px-4"
                        value={formData.address.pincode}
                        onChange={(e) => setFormData({ ...formData, address: { ...formData.address, pincode: e.target.value } })}
                      />
                    </div>
                  )}

                  <div className="form-control col-span-1 md:col-span-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 px-1">Password</label>
                    <div className="relative">
                      <IconLock className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30 text-primary" size={20} />
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Min 8 characters"
                        className="input input-bordered input-primary w-full h-14 rounded-2xl font-bold bg-gray-50 border-none outline-none focus:ring-2 focus:ring-primary transition-all pl-12 text-gray-800"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      />
                      <button className="absolute right-4 top-1/2 -translate-y-1/2 text-primary opacity-50" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <IconEyeOff size={20} /> : <IconEye size={20} />}
                      </button>
                    </div>
                  </div>

                  <div className="col-span-1 md:col-span-2 flex items-start gap-3 px-2">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-primary mt-1"
                      onChange={() => setDisabled(!disabled)}
                    />
                    <p className="text-xs font-bold text-gray-500">I agree to the <span className="text-primary underline">Terms</span> and the <span className="text-primary underline">Privacy Policy</span>.</p>
                  </div>
                </>
              )}
            </div>

            <button
              className={`btn btn-block h-16 rounded-2xl text-lg font-black uppercase tracking-widest transition-all duration-300 ${disabled
                ? 'btn-ghost bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'btn-primary shadow-xl shadow-primary/20'
                } group`}
              onClick={handleSubmit}
              disabled={disabled}
            >
              Join Community
              <IconArrowLeft className="rotate-180 group-hover:translate-x-2 transition-transform" />
            </button>

            <p className="text-center font-bold text-sm text-gray-500 mt-8">
              Already have an account? <Link href="/login" className="text-primary hover:underline underline-offset-4">Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
