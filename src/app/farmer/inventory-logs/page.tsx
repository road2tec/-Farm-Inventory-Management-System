"use client";

import { useAuth } from "@/context/AuthProvider";
import { IconPackage, IconFilter, IconDownload, IconPlus, IconMinus, IconRefresh } from "@tabler/icons-react";
import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface InventoryLog {
    _id: string;
    productId: {
        _id: string;
        name: string;
        imageUrl: string;
    };
    type: string;
    quantity: number;
    previousStock: number;
    newStock: number;
    orderId?: string;
    reason: string;
    createdAt: string;
}

const InventoryLogsPage = () => {
    const { user } = useAuth();
    const [logs, setLogs] = useState<InventoryLog[]>([]);
    const [filteredLogs, setFilteredLogs] = useState<InventoryLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState<string>("all");

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const res = await axios.get("/api/inventory-logs");
            if (res.data.success) {
                setLogs(res.data.logs);
                setFilteredLogs(res.data.logs);
            }
        } catch (error) {
            console.error("Failed to fetch inventory logs:", error);
            toast.error("Failed to load stock history");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchLogs();
        }
    }, [user]);

    useEffect(() => {
        if (filterType === "all") {
            setFilteredLogs(logs);
        } else {
            setFilteredLogs(logs.filter((log) => log.type === filterType));
        }
    }, [filterType, logs]);

    const getTypeIcon = (type: string) => {
        switch (type) {
            case "STOCK_ADDED":
                return <IconPlus size={20} className="text-green-600" />;
            case "STOCK_REDUCED":
            case "ORDER_PLACED":
                return <IconMinus size={20} className="text-red-600" />;
            case "STOCK_RESTORED":
            case "ORDER_CANCELLED":
                return <IconRefresh size={20} className="text-blue-600" />;
            default:
                return <IconPackage size={20} className="text-gray-600" />;
        }
    };

    const getTypeBadge = (type: string) => {
        const badges: Record<string, string> = {
            STOCK_ADDED: "bg-green-100 text-green-700",
            STOCK_REDUCED: "bg-red-100 text-red-700",
            STOCK_RESTORED: "bg-blue-100 text-blue-700",
            ORDER_PLACED: "bg-orange-100 text-orange-700",
            ORDER_CANCELLED: "bg-purple-100 text-purple-700",
        };
        return badges[type] || "bg-gray-100 text-gray-700";
    };

    const getTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            STOCK_ADDED: "Stock Added",
            STOCK_REDUCED: "Stock Reduced",
            STOCK_RESTORED: "Stock Restored",
            ORDER_PLACED: "Order Placed",
            ORDER_CANCELLED: "Order Cancelled",
        };
        return labels[type] || type;
    };

    const exportToCSV = () => {
        const headers = ["Date", "Product", "Type", "Quantity", "Previous Stock", "New Stock", "Reason"];
        const rows = filteredLogs.map((log) => [
            new Date(log.createdAt).toLocaleString("en-IN"),
            log.productId.name,
            getTypeLabel(log.type),
            log.quantity,
            log.previousStock,
            log.newStock,
            log.reason,
        ]);

        const csvContent = [
            headers.join(","),
            ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
        ].join("\\n");

        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `stock-history-${new Date().toISOString().split("T")[0]}.csv`;
        a.click();
        toast.success("Stock history exported!");
    };

    if (!user) return null;

    return (
        <div className="px-4 md:px-8 py-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-1">Stock History</h1>
                <p className="text-sm text-gray-500">View all stock changes</p>
            </div>

            {/* Filters and Actions */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm mb-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <IconFilter size={20} className="text-gray-500" />
                        <select
                            className="select select-bordered rounded-lg font-medium bg-gray-50 border-gray-200"
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                        >
                            <option value="all">All Activities</option>
                            <option value="STOCK_ADDED">Stock Added</option>
                            <option value="STOCK_REDUCED">Stock Reduced</option>
                            <option value="ORDER_PLACED">Order Placed</option>
                            <option value="ORDER_CANCELLED">Order Cancelled</option>
                            <option value="STOCK_RESTORED">Stock Restored</option>
                        </select>
                    </div>

                    <button
                        onClick={exportToCSV}
                        className="btn bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 flex items-center gap-2 border-none"
                    >
                        <IconDownload size={20} />
                        Export to Excel
                    </button>
                </div>
            </div>

            {/* Logs List */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-16 space-y-3">
                    <IconPackage size={40} className="text-green-600 animate-bounce" />
                    <p className="text-sm text-gray-500">Loading history...</p>
                </div>
            ) : filteredLogs.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-gray-200">
                    <IconPackage className="mx-auto text-gray-300 mb-4" size={60} />
                    <p className="text-xl font-bold text-gray-900 mb-2">No Records Found</p>
                    <p className="text-sm text-gray-500">
                        {filterType === "all" ? "No stock activity yet" : "No records for this filter"}
                    </p>
                </div>
            ) : (
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                    <div className="space-y-3">
                        {filteredLogs.map((log) => (
                            <div
                                key={log._id}
                                className="flex items-center gap-4 bg-gray-50 rounded-lg p-4 border border-gray-100"
                            >
                                {/* Product Image */}
                                <img
                                    src={log.productId.imageUrl}
                                    alt={log.productId.name}
                                    className="w-14 h-14 object-cover rounded-lg"
                                />

                                {/* Log Details */}
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        {getTypeIcon(log.type)}
                                        <p className="text-base font-bold text-gray-900">{log.productId.name}</p>
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeBadge(log.type)}`}
                                        >
                                            {getTypeLabel(log.type)}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-1">{log.reason}</p>
                                    <p className="text-xs text-gray-400">
                                        {new Date(log.createdAt).toLocaleString("en-IN", {
                                            day: "numeric",
                                            month: "short",
                                            year: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </p>
                                </div>

                                {/* Stock Changes */}
                                <div className="text-right">
                                    <p className="text-xs text-gray-500 mb-1">Stock Change</p>
                                    <div className="flex items-center gap-2 justify-end">
                                        <span className="text-base font-bold text-gray-500">{log.previousStock}</span>
                                        <span className="text-gray-400">→</span>
                                        <span
                                            className={`text-xl font-bold ${log.newStock > log.previousStock
                                                    ? "text-green-600"
                                                    : log.newStock < log.previousStock
                                                        ? "text-red-600"
                                                        : "text-gray-600"
                                                }`}
                                        >
                                            {log.newStock}
                                        </span>
                                    </div>
                                    <p
                                        className={`text-sm font-bold mt-1 ${log.quantity > 0 ? "text-green-600" : "text-red-600"
                                            }`}
                                    >
                                        {log.quantity > 0 ? "+" : ""}
                                        {log.quantity}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default InventoryLogsPage;
