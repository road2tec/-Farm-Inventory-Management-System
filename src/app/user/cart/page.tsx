"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { IconTrash, IconPlus, IconMinus, IconShoppingCart } from "@tabler/icons-react";
import Link from "next/link";

interface CartItem {
    productId: {
        _id: string;
        name: string;
        price: number;
        imageUrl: string;
        stock: number;
    };
    quantity: number;
}

const CartPage = () => {
    const router = useRouter();
    const [cart, setCart] = useState<CartItem[]>(() => {
        if (typeof window !== "undefined") {
            const savedCart = localStorage.getItem("cart");
            return savedCart ? JSON.parse(savedCart) : [];
        }
        return [];
    });

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem("cart", JSON.stringify(cart));
    }, [cart]);

    const updateQuantity = (productId: string, change: number) => {
        setCart((prev) =>
            prev.map((item) =>
                item.productId._id === productId
                    ? { ...item, quantity: Math.max(1, Math.min(item.productId.stock, item.quantity + change)) }
                    : item
            )
        );
    };

    const removeItem = (productId: string) => {
        setCart((prev) => prev.filter((item) => item.productId._id !== productId));
    };

    const getTotal = () => {
        return cart.reduce((sum, item) => sum + item.productId.price * item.quantity, 0);
    };

    const proceedToCheckout = () => {
        router.push("/user/checkout");
    };

    if (cart.length === 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center px-4">
                <IconShoppingCart size={80} className="text-gray-300 mb-6" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Cart is Empty</h2>
                <p className="text-gray-500 mb-6">Add some products to get started</p>
                <Link
                    href="/user/browse"
                    className="btn bg-green-600 hover:bg-green-700 text-white border-none px-8"
                >
                    Browse Products
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

            <div className="space-y-4 mb-8">
                {cart.map((item) => (
                    <div
                        key={item.productId._id}
                        className="bg-white rounded-lg p-4 border border-gray-200 flex flex-col md:flex-row items-center gap-4"
                    >
                        <img
                            src={item.productId.imageUrl}
                            alt={item.productId.name}
                            className="w-24 h-24 object-cover rounded-lg"
                        />
                        <div className="flex-1 text-center md:text-left">
                            <h3 className="text-lg font-bold text-gray-900">{item.productId.name}</h3>
                            <p className="text-green-600 font-bold">₹{item.productId.price}</p>
                            <p className="text-xs text-gray-500">Stock: {item.productId.stock} available</p>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => updateQuantity(item.productId._id, -1)}
                                className="btn btn-sm btn-circle bg-gray-100 hover:bg-gray-200 border-none"
                                disabled={item.quantity <= 1}
                            >
                                <IconMinus size={16} />
                            </button>
                            <span className="text-lg font-bold w-12 text-center">{item.quantity}</span>
                            <button
                                onClick={() => updateQuantity(item.productId._id, 1)}
                                className="btn btn-sm btn-circle bg-gray-100 hover:bg-gray-200 border-none"
                                disabled={item.quantity >= item.productId.stock}
                            >
                                <IconPlus size={16} />
                            </button>
                        </div>

                        <div className="text-center md:text-right">
                            <p className="text-xl font-bold text-gray-900">
                                ₹{item.productId.price * item.quantity}
                            </p>
                            <button
                                onClick={() => removeItem(item.productId._id)}
                                className="btn btn-sm btn-ghost text-red-500 hover:bg-red-50 mt-2"
                            >
                                <IconTrash size={16} />
                                Remove
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-lg p-6 border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-medium text-gray-700">Subtotal</span>
                    <span className="text-lg font-bold text-gray-900">₹{getTotal()}</span>
                </div>
                <div className="flex justify-between items-center mb-6 pb-6 border-b">
                    <span className="text-lg font-medium text-gray-700">Delivery</span>
                    <span className="text-lg font-bold text-green-600">FREE</span>
                </div>
                <div className="flex justify-between items-center mb-6">
                    <span className="text-2xl font-bold text-gray-900">Total</span>
                    <span className="text-2xl font-bold text-green-600">₹{getTotal()}</span>
                </div>
                <button
                    onClick={proceedToCheckout}
                    className="btn bg-green-600 hover:bg-green-700 text-white border-none w-full h-14 text-lg font-bold"
                >
                    Proceed to Checkout
                </button>
            </div>
        </div>
    );
};

export default CartPage;
