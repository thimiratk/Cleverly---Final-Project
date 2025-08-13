import mongoose from "mongoose";

// auth-service/src/models/User.js
const mongoose = require('mongoose');

const oauthProviderSchema = new mongoose.Schema({
  provider: { type: String, required: true },  // 'google', 'facebook', etc.
  providerId: { type: String, required: true },
  email: { type: String },
  accessToken: { type: String },
  refreshToken: { type: String },
  linkedAt: { type: Date, default: Date.now }
}, { _id: false });

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, unique: true, sparse: true },
  passwordHash: { type: String },  // nullable if OAuth only
  mobileNumber: { type: String, unique: true, sparse: true },
  isMobileVerified: { type: Boolean, default: false },
  twoStepEnabled: { type: Boolean, default: false },
  twoStepMethod: { type: String, enum: ['sms', 'authenticator_app'], default: 'sms' },
  oauthProviders: [oauthProviderSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});


const User = mongoose.models.user || mongoose.model("User", userSchema);



