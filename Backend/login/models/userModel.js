import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true},
  email: {
    type: String,
    required: true,
    unique: true,
    match: /.+\@.+\..+/,
  },
  password: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  verifyOtp: {
    type: String,
    default: '',
}, 
    verifyOtpExpires: {
        type: Number,
        default: 0,},
    isVerified: {
        type: Boolean,
        default: false,
    },
    resetOtp: {
        type: Number,
        default: 0,
    }
}); 

const User = mongoose.models.user || mongoose.model("User", userSchema);



