"use client";

import { useAuth } from "@/context/AuthProvider";
import { IconPlant, IconLeaf } from "@tabler/icons-react";
import axios from "axios";
import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import CameraFeed from "@/components/CameraFeed";

const AddProductPage = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [productData, setProductData] = useState({
    name: "",
    description: "",
    price: 0,
    imageUrl: "",
    stock: 0,
    category: "",
    harvestDate: "",
    expiryDate: "",
    isOrganic: false,
    lowStockThreshold: 10,
    unit: "kg",
  });

  const handleProductImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append("file", file);

      toast.promise(
        axios.post("/api/upload", formData).then((res) => {
          setProductData({ ...productData, imageUrl: res.data.path });
          return res;
        }),
        {
          loading: "Uploading image...",
          success: (res) => {
            setProductData({ ...productData, imageUrl: res.data.path });
            return "Image Uploaded Successfully";
          },
          error: "Failed to upload image",
        }
      );
    }
  };

  const handleAddProduct = async () => {
    const { name, description, price, imageUrl, stock, category } = productData;

    if (!name || !description || !price || !imageUrl || !stock || !category) {
      toast.error("Please fill all required fields, including the product image");
      return;
    }

    try {
      const res = axios.post("/api/products", { productData });

      toast.promise(res, {
        loading: "Adding product to harvest...",
        success: "Product listed successfully!",
        error: "Error listing your produce",
      });

      await res;
      router.push("/farmer/products");
    } catch (error) {
      console.error(error);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Add New Product</h1>
          <p className="text-sm text-gray-500">Fill in the product details</p>
        </div>
        <div className="flex items-center gap-3 bg-green-50 px-4 py-2 rounded-lg">
          <IconPlant size={20} className="text-green-600" />
          <div>
            <p className="text-xs text-gray-500 font-medium">Farmer</p>
            <p className="text-base font-bold text-gray-900">{user.name}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left: Basic Info */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="form-control md:col-span-2">
                <label className="text-xs font-medium text-gray-500 mb-2">Product Name</label>
                <input
                  type="text"
                  placeholder="e.g. Organic Golden Wheat"
                  className="input h-12 rounded-lg font-medium bg-gray-50 border-gray-200 focus:border-green-500 focus:ring-1 focus:ring-green-500 text-gray-800"
                  value={productData.name}
                  onChange={(e) => setProductData({ ...productData, name: e.target.value })}
                />
              </div>

              <div className="form-control">
                <label className="text-xs font-medium text-gray-500 mb-2">Category</label>
                <select
                  className="select h-12 rounded-lg font-medium bg-gray-50 border-gray-200 focus:border-green-500 focus:ring-1 focus:ring-green-500 text-gray-700"
                  value={productData.category}
                  onChange={(e) => setProductData({ ...productData, category: e.target.value })}
                >
                  <option value="">Choose Category</option>
                  <option value="Vegetable">Fresh Vegetables</option>
                  <option value="Fruit">Organic Fruits</option>
                  <option value="Grain">Grains & Legumes</option>
                  <option value="Dairy">Dairy & Poultry</option>
                </select>
              </div>

              <div className="form-control">
                <label className="text-xs font-medium text-gray-500 mb-2">Unit</label>
                <select
                  className="select h-12 rounded-lg font-medium bg-gray-50 border-gray-200 focus:border-green-500 focus:ring-1 focus:ring-green-500 text-gray-700"
                  value={productData.unit}
                  onChange={(e) => setProductData({ ...productData, unit: e.target.value })}
                >
                  <option value="kg">Kilograms (kg)</option>
                  <option value="grams">Grams (g)</option>
                  <option value="liters">Liters (L)</option>
                  <option value="pieces">Pieces</option>
                  <option value="bundles">Bundles</option>
                </select>
              </div>

              <div className="form-control">
                <label className="text-xs font-medium text-gray-500 mb-2">Price per Unit (₹)</label>
                <input
                  type="number"
                  placeholder="0"
                  className="input h-12 rounded-lg font-medium bg-gray-50 border-gray-200 focus:border-green-500 focus:ring-1 focus:ring-green-500 text-gray-800"
                  value={productData.price}
                  onChange={(e) => setProductData({ ...productData, price: parseFloat(e.target.value) })}
                />
              </div>

              <div className="form-control">
                <label className="text-xs font-medium text-gray-500 mb-2">Stock Available</label>
                <input
                  type="number"
                  placeholder="0"
                  className="input h-12 rounded-lg font-medium bg-gray-50 border-gray-200 focus:border-green-500 focus:ring-1 focus:ring-green-500 text-gray-800"
                  value={productData.stock}
                  onChange={(e) => setProductData({ ...productData, stock: parseInt(e.target.value) })}
                />
              </div>

              <div className="form-control">
                <label className="text-xs font-medium text-gray-500 mb-2">Harvest Date</label>
                <input
                  type="date"
                  className="input h-12 rounded-lg font-medium bg-gray-50 border-gray-200 focus:border-green-500 focus:ring-1 focus:ring-green-500 text-gray-800"
                  value={productData.harvestDate}
                  onChange={(e) => setProductData({ ...productData, harvestDate: e.target.value })}
                />
              </div>

              <div className="form-control">
                <label className="text-xs font-medium text-gray-500 mb-2">Expiry Date</label>
                <input
                  type="date"
                  className="input h-12 rounded-lg font-medium bg-gray-50 border-gray-200 focus:border-green-500 focus:ring-1 focus:ring-green-500 text-gray-800"
                  value={productData.expiryDate}
                  onChange={(e) => setProductData({ ...productData, expiryDate: e.target.value })}
                />
              </div>

              <div className="form-control">
                <label className="text-xs font-medium text-gray-500 mb-2">Low Stock Alert Threshold</label>
                <input
                  type="number"
                  placeholder="10"
                  className="input h-12 rounded-lg font-medium bg-gray-50 border-gray-200 focus:border-green-500 focus:ring-1 focus:ring-green-500 text-gray-800"
                  value={productData.lowStockThreshold}
                  onChange={(e) => setProductData({ ...productData, lowStockThreshold: parseInt(e.target.value) })}
                />
              </div>

              <div className="form-control md:col-span-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-success"
                    checked={productData.isOrganic}
                    onChange={(e) => setProductData({ ...productData, isOrganic: e.target.checked })}
                  />
                  <span className="text-sm font-medium text-gray-700">Certified Organic Product</span>
                </label>
              </div>

              <div className="form-control md:col-span-2">
                <label className="text-xs font-medium text-gray-500 mb-2">Description</label>
                <textarea
                  placeholder="Tell consumers about the harvest methods, freshness..."
                  className="textarea h-32 rounded-lg font-medium bg-gray-50 border-gray-200 focus:border-green-500 focus:ring-1 focus:ring-green-500 text-gray-800"
                  value={productData.description}
                  onChange={(e) => setProductData({ ...productData, description: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Media & Action */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <label className="text-xs font-medium text-gray-500 mb-4 block">Product Image</label>

            {/* Camera Feed Component */}
            <CameraFeed
              onCapture={(imageData) => {
                setProductData({ ...productData, imageUrl: imageData });
              }}
            />

            {/* Image Preview */}
            {productData.imageUrl && (
              <div className="mt-6">
                <p className="text-xs font-medium text-gray-500 mb-2">Selected Image</p>
                <div className="relative aspect-square rounded-lg bg-gray-50 border border-gray-200 overflow-hidden">
                  <img src={productData.imageUrl} className="w-full h-full object-cover" alt="Product" />
                </div>
              </div>
            )}
          </div>

          <button
            className="btn bg-green-600 hover:bg-green-700 text-white border-none w-full h-14 rounded-lg text-base font-bold"
            onClick={handleAddProduct}
          >
            Add Product
          </button>

          <div className="bg-green-50 rounded-xl p-6 border border-green-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-green-100 text-green-600 rounded-lg flex items-center justify-center">
                <IconLeaf size={20} />
              </div>
              <p className="font-bold text-gray-900 text-sm">Farmer Assurance</p>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              Listing your produce here makes it instantly available to our network of local urban consumers. Ensure descriptions are accurate to build community trust.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProductPage;
