"use client";
import "../globals.css";
import { Toaster } from "react-hot-toast";
import { useEffect } from "react";
import axios from "axios";
import SideNav from "./SideNav";
import { AuthProvider, useAuth } from "@/context/AuthProvider";
import { IconPlant } from "@tabler/icons-react";
import Script from "next/script";

const Component = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const { user, setUser } = useAuth();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get("/api/auth/verifytoken");
        if (response.data) {
          setUser(response.data.user);
        }
      } catch (error) {
        console.error("Auth Error:", error);
      }
    };
    if (!user) {
      fetchUser();
    }
  }, [user, setUser]);

  if (!user) {
    return (
      <html lang="en">
        <body className="bg-white min-h-screen flex items-center justify-center text-primary">
          <div className="flex flex-col items-center gap-6 animate-pulse">
            <div className="p-4 bg-primary/10 rounded-full">
              <IconPlant size={64} className="animate-bounce" />
            </div>
            <div className="flex flex-col items-center text-center">
              <h2 className="text-2xl font-bold text-green-700">Farm Inventory</h2>
              <p className="text-xs font-medium text-gray-500">Loading your account...</p>
            </div>
          </div>
        </body>
      </html>
    );
  }

  return (
    <html lang="en">
      <head>
        <title>Farm Inventory - Shop Fresh Products</title>
        <meta name="description" content="Browse and order fresh farm products" />
      </head>
      <body className="antialiased bg-gray-50">
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="beforeInteractive"
        />
        <Toaster />
        <SideNav>{children}</SideNav>
      </body>
    </html>
  );
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthProvider>
      <Component>{children}</Component>
    </AuthProvider>
  );
}
