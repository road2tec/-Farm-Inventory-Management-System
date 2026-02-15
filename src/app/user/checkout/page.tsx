"use client";

import { useAuth } from "@/context/AuthProvider";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import { IconMapPin, IconUser, IconPhone, IconCreditCard, IconCash } from "@tabler/icons-react";

declare global {
    interface Window {
        Razorpay: any;
    }
}

const CheckoutPage = () => {
    const { user } = useAuth();
    const router = useRouter();
    const [cart, setCart] = useState<any[]>(() => {
        if (typeof window !== "undefined") {
            const savedCart = localStorage.getItem("cart");
            return savedCart ? JSON.parse(savedCart) : [];
        }
        return [];
    });
    const [loading, setLoading] = useState(false);

    const [deliveryAddress, setDeliveryAddress] = useState({
        name: user?.name || "",
        phone: "",
        address: "",
        district: "",
        state: "",
        pincode: "",
    });

    const [paymentMethod, setPaymentMethod] = useState<"online" | "cod">("online");

    const getTotal = () => {
        return cart.reduce((sum, item) => sum + item.productId.price * item.quantity, 0);
    };

    const handlePlaceOrder = async () => {
        // Validate address
        if (!deliveryAddress.name || !deliveryAddress.phone || !deliveryAddress.address ||
            !deliveryAddress.district || !deliveryAddress.state || !deliveryAddress.pincode) {
            toast.error("Please fill all delivery address fields");
            return;
        }

        if (cart.length === 0) {
            toast.error("Cart is empty");
            return;
        }

        setLoading(true);

        try {
            if (paymentMethod === "cod") {
                // Place COD order directly
                const res = await axios.post("/api/orders/cod", {
                    cart,
                    deliveryAddress,
                });

                if (res.data.success) {
                    toast.success("Order placed successfully!");
                    localStorage.removeItem("cart");
                    router.push("/user/orders");
                }
            } else {
                // Online payment flow

                // Check if Razorpay is loaded, if not, load it
                if (typeof window === 'undefined' || !(window as any).Razorpay) {
                    const script = document.createElement('script');
                    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
                    script.async = true;
                    await new Promise((resolve) => {
                        script.onload = resolve;
                        document.body.appendChild(script);
                    });
                }

                const orderRes = await axios.post("/api/payment/create-order", {
                    cart,
                });

                const { orderId, amount } = orderRes.data;

                const options = {
                    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                    amount,
                    currency: "INR",
                    name: "Farm Inventory",
                    description: "Fresh Produce Purchase",
                    order_id: orderId,
                    handler: async function (response: any) {
                        try {
                            const verifyRes = await axios.post("/api/payment/verify", {
                                razorpayOrderId: response.razorpay_order_id,
                                razorpayPaymentId: response.razorpay_payment_id,
                                razorpaySignature: response.razorpay_signature,
                                cart,
                                deliveryAddress,
                            });

                            if (verifyRes.data.success) {
                                toast.success("Payment successful! Order placed.");
                                localStorage.removeItem("cart");
                                router.push("/user/orders");
                            }
                        } catch (error: any) {
                            console.error("Payment verification failed:", error);
                            const message = error.response?.data?.message || "Payment verification failed";
                            toast.error(message);
                        }
                    },
                    prefill: {
                        name: deliveryAddress.name,
                        email: user?.email || "",
                        contact: deliveryAddress.phone,
                    },
                    theme: {
                        color: "#16a34a",
                    },
                };

                const razorpay = new (window as any).Razorpay(options);
                razorpay.open();
            }
        } catch (error: any) {
            console.error("Order placement failed:", error);
            const message = error.response?.data?.message || "Failed to place order";
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Address Form */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-lg p-6 border border-gray-200">
                        <div className="flex items-center gap-2 mb-6">
                            <IconMapPin size={24} className="text-green-600" />
                            <h2 className="text-xl font-bold text-gray-900">Delivery Address</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="text-sm font-medium text-gray-700 mb-2 block">Full Name</label>
                                <input
                                    type="text"
                                    className="input w-full h-12 rounded-lg bg-gray-50 border-gray-200"
                                    value={deliveryAddress.name}
                                    onChange={(e) => setDeliveryAddress({ ...deliveryAddress, name: e.target.value })}
                                    placeholder="Enter your full name"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="text-sm font-medium text-gray-700 mb-2 block">Phone Number</label>
                                <input
                                    type="tel"
                                    className="input w-full h-12 rounded-lg bg-gray-50 border-gray-200"
                                    value={deliveryAddress.phone}
                                    onChange={(e) => setDeliveryAddress({ ...deliveryAddress, phone: e.target.value })}
                                    placeholder="Enter phone number"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="text-sm font-medium text-gray-700 mb-2 block">Complete Address</label>
                                <textarea
                                    className="textarea w-full h-24 rounded-lg bg-gray-50 border-gray-200"
                                    value={deliveryAddress.address}
                                    onChange={(e) => setDeliveryAddress({ ...deliveryAddress, address: e.target.value })}
                                    placeholder="House no, Street, Area"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-2 block">District</label>
                                <input
                                    type="text"
                                    className="input w-full h-12 rounded-lg bg-gray-50 border-gray-200"
                                    value={deliveryAddress.district}
                                    onChange={(e) => setDeliveryAddress({ ...deliveryAddress, district: e.target.value })}
                                    placeholder="District"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-2 block">State</label>
                                <input
                                    type="text"
                                    className="input w-full h-12 rounded-lg bg-gray-50 border-gray-200"
                                    value={deliveryAddress.state}
                                    onChange={(e) => setDeliveryAddress({ ...deliveryAddress, state: e.target.value })}
                                    placeholder="State"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="text-sm font-medium text-gray-700 mb-2 block">Pincode</label>
                                <input
                                    type="text"
                                    className="input w-full h-12 rounded-lg bg-gray-50 border-gray-200"
                                    value={deliveryAddress.pincode}
                                    onChange={(e) => setDeliveryAddress({ ...deliveryAddress, pincode: e.target.value })}
                                    placeholder="6-digit pincode"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Payment Method */}
                    <div className="bg-white rounded-lg p-6 border border-gray-200">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Payment Method</h2>
                        <div className="space-y-3">
                            <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-green-500 transition-colors">
                                <input
                                    type="radio"
                                    name="payment"
                                    value="online"
                                    checked={paymentMethod === "online"}
                                    onChange={() => setPaymentMethod("online")}
                                    className="radio radio-success"
                                />
                                <IconCreditCard size={24} className="text-green-600" />
                                <div>
                                    <p className="font-bold text-gray-900">Online Payment</p>
                                    <p className="text-sm text-gray-500">Pay securely with Razorpay</p>
                                </div>
                            </label>

                            <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-green-500 transition-colors">
                                <input
                                    type="radio"
                                    name="payment"
                                    value="cod"
                                    checked={paymentMethod === "cod"}
                                    onChange={() => setPaymentMethod("cod")}
                                    className="radio radio-success"
                                />
                                <IconCash size={24} className="text-green-600" />
                                <div>
                                    <p className="font-bold text-gray-900">Cash on Delivery</p>
                                    <p className="text-sm text-gray-500">Pay when you receive</p>
                                </div>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Right: Order Summary */}
                <div>
                    <div className="bg-white rounded-lg p-6 border border-gray-200 sticky top-4">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>

                        <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                            {cart.map((item) => (
                                <div key={item.productId._id} className="flex gap-3">
                                    <img
                                        src={item.productId.imageUrl}
                                        alt={item.productId.name}
                                        className="w-16 h-16 object-cover rounded-lg"
                                    />
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900 text-sm">{item.productId.name}</p>
                                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                                        <p className="text-sm font-bold text-green-600">₹{item.productId.price * item.quantity}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="border-t pt-4 space-y-2 mb-6">
                            <div className="flex justify-between text-gray-700">
                                <span>Subtotal</span>
                                <span className="font-bold">₹{getTotal()}</span>
                            </div>
                            <div className="flex justify-between text-gray-700">
                                <span>Delivery</span>
                                <span className="font-bold text-green-600">FREE</span>
                            </div>
                            <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t">
                                <span>Total</span>
                                <span className="text-green-600">₹{getTotal()}</span>
                            </div>
                        </div>

                        <button
                            onClick={handlePlaceOrder}
                            disabled={loading}
                            className="btn bg-green-600 hover:bg-green-700 text-white border-none w-full h-14 text-lg font-bold"
                        >
                            {loading ? "Processing..." : "Place Order"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;
