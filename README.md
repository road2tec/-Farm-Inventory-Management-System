# 🚜 Farm Inventory Management System (FIMS)

A premium, state-of-the-art MERN stack application designed to bridge the gap between farmers and consumers. Built for performance, security, and a seamless user experience, FIMS provides a robust ecosystem for Agri-Food supply chain management.

---

## ✨ Premium Features

### 🏢 Admin Control Center
- **Farmer Verification**: Sophisticated approval workflow for new farmers.
- **Global Management**: Oversee all products, users, and transactions.
- **Visual Analytics**: Real-time monitoring of system activity.
- **Premium UI**: High-visibility action center with emerald/rose color coding.

### �‍🌾 Farmer Dashboard
- **Inventory Management**: Add products with live camera feed integration.
- **Stock Guard**: Atomic stock management prevents over-ordering.
- **Order Tracking**: Manage customer orders with status updates.
- **Profile Customization**: Build trust with verified farmer badges.

### 🛒 Consumer Experience
- **Premium Checkout**: Complete end-to-end shopping journey.
- **Multi-Payment Support**:
  - **Online**: Integrated with Razorpay for secure payments.
  - **COD**: Cash on Delivery support with instant stock deduction.
- **Order History**: Track payment (Paid/Pending) and delivery statuses separately.
- **Address Management**: Streamlined delivery address collection.

---

## 🛠️ Technology Stack

- **Frontend**: Next.js 14+ (App Router), React, TailwindCSS (DaisyUI)
- **Backend**: Node.js, Express, Next.js API Routes
- **Database**: MongoDB (Local Compass / Atlas Ready)
- **Payments**: Razorpay Gateway Integration
- **Security**: JSON Web Tokens (JWT), Bcrypt.js password hashing
- **Hardware**: Live Camera API for product documentation

---

## ⚙️ Prerequisites

- **Node.js** (v18 or later)
- **MongoDB Compass** installed and running locally.
- **Razorpay Keys** (for online payment testing)

---

## 🏃 Getting Started

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/road2tec/-Farm-Inventory-Management-System.git
    cd -Farm-Inventory-Management-System
    ```

2.  **Setup Environment Variables**:
    Create a `.env` file in the root directory:
    ```env
    # Database
    MONGO_URI = mongodb://localhost:27017/agrifood-mern

    # Auth
    JWT_SECRET = your_jwt_secret

    # Default Admin
    ADMIN_EMAIL = admin@example.com
    ADMIN_PASSWORD = admin123

    # Razorpay (Optional - if testing online payments)
    RAZORPAY_KEY_ID = your_razorpay_key_id
    NEXT_PUBLIC_RAZORPAY_KEY_ID = your_razorpay_key_id
    RAZORPAY_KEY_SECRET = your_razorpay_key_secret
    ```

3.  **Install & Run**:
    ```bash
    npm install
    npm run dev
    ```

Open [http://localhost:3000](http://localhost:3000) to experience the future of farm management.

---

## � Security & Integrity
- **Atomic Transactions**: Support for MongoDB sessions with automatic fallback for standalone instances.
- **Stock Integrity**: Real-time stock deduction via `findOneAndUpdate` guards.
- **Protected Routes**: Middleware-level authorization for Admin and Farmer panels.

## 🤝 Support
Admin Default: `admin@example.com` | `admin123`
