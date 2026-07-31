import mongoose from "mongoose";
import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import {
  ACCESS_TOKEN_EXPIRY,
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_EXPIRY,
  REFRESH_TOKEN_SECRET,
} from "../../config/env.config.js";
const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    userName: {
      type: String,
      required: true,
      unique: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    email_Token: {
      type: String,
    },
    email_Token_Expiary: {
      type: Date,
    },
    password: {
      type: String,
      required: true,
    },
    refreshToken: {
      type: String,
    },
    // refreshToken: {
    //   type: String,
    // },
    forgot_otp: { type: String },
    forgot_otp_Expiary: { type: Date },
  },
  { timestamps: true },
);

userSchema.pre("save", async function () {
  let saltRounds = 10;
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, saltRounds);
});

userSchema.methods.matchPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// Email verification OTP
userSchema.methods.generateOTP = function () {
  const num = crypto.randomInt(100000, 1000000).toString();

  let hashedOtp = crypto.createHash("sha256").update(num).digest("hex");

  this.email_Token = hashedOtp;
  this.email_Token_Expiary = new Date(Date.now() + 20 * 60 * 1000);
  return num;
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign({ _id: this._id }, ACCESS_TOKEN_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  });
};
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign({ _id: this._id }, REFRESH_TOKEN_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY,
  });
};

userSchema.methods.generateForgotOTP = function () {
  const num = crypto.randomInt(100000, 1000000).toString();

  let hashedOtp = crypto.createHash("sha256").update(num).digest("hex");

  this.forgot_otp = hashedOtp;
  this.forgot_otp_Expiary = new Date(Date.now() + 20 * 60 * 1000);
  return num;
};

const User = mongoose.model("User", userSchema);
export default User;
