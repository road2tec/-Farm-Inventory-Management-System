import mongoose, { Schema } from "mongoose";

const UserSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  contact: {
    type: String,
    required: true,
  },
  profileImage: {
    type: String,
    required: true,
  },
  address: {
    address: {
      type: String,
      required: true,
    },
    district: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    pincode: {
      type: String,
      required: true,
    },
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["admin", "farmer", "user"],
    default: "user",
  },
  isApproved: {
    type: Boolean,
    default: function() {
      return this.role === "user"; // Users are approved by default, Farmers need admin approval
    },
  },
});

const User = mongoose.models.User || mongoose.model("User", UserSchema);
export default User;
