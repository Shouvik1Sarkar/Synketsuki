import User from "../models/user.models.js";
import ApiError from "../utils/ApiError.utils.js";
import ApiResponse from "../utils/ApiResponse.utils.js";
import asyncHandler from "../utils/asyncHandlers.utils.js";
import logger from "../utils/logger.utils.js";
import crypto from "crypto";

/** REGISTER */

export const register = asyncHandler(async (req, res) => {
  const { fullName, userName, email, password } = req.body;

  if (
    [fullName, userName, email, password].some(
      (e) => e.trim == "" || e == undefined,
    )
  ) {
    throw new ApiError(400, "All fields are required.");
  }

  const exists = await User.findOne({ $or: [{ userName }, { email }] });
  if (exists) {
    throw new ApiError(409, "User already exists");
  }

  const user = await User.create({
    fullName,
    userName,
    email,
    password,
  });
  if (!user) {
    throw new ApiError(500, "User not created.");
  }

  // const otp = Math.floor(100000 + Math.random() * 900000);

  const otp = user.generateOTP();
  await user.save({ validateBeforeSave: false });
  console.log("OTP", otp);

  return res.status(201).json(new ApiResponse(201, user, "User created"));
});

/** VERIFY EMAIL */

export const emailVerified = asyncHandler(async (req, res) => {
  const { otp } = req.body;

  const encryptedOTP = crypto
    .createHash("sha256")
    .update(otp.toString())
    .digest("hex");

  const user = await User.findOne({
    email_Token: encryptedOTP,
  });

  console.log("User: ", user);

  if (!user) {
    throw new ApiError(404, "Not found");
  }

  user.isEmailVerified = true;
  user.email_Token = undefined;
  user.email_Token_Expiary = undefined;

  user.save({ validateBeforeSave: false });

  return res.status(200).json(new ApiResponse(200, user, "verified"));
});

/** SEND EMAIL VERIFICATION OTP*/

export const sendEmailVerificationOtp = asyncHandler(async (req, res) => {
  const { userName, email } = req.body;

  if (!userName && !email) throw ApiError(400, "Email or userName is required");

  const user = await User.findOne({ $or: [{ email }, { userName }] });

  if (!user) throw new ApiError(404, "User not found");

  if (user.isEmailVerified) throw new ApiError(409, "User already verified.");

  const otp = user.generateOTP();

  console.log(otp);
  await user.save({ validateBeforeSave: false });

  return res.status(200).json(new ApiError(200, null, "otp sent"));
});

/** LOG-IN*/

export const logIn = asyncHandler(async (req, res) => {
  const { email, userName, password } = req.body;

  const user = await User.findOne({
    $or: [{ email }, { userName }],
  });

  if (!user) {
    throw new ApiError(404, "Not found");
  }
  console.log("USER", user);
  if (!user.isEmailVerified) throw new ApiError(400, "Email not verified");

  const isPassword = await user.matchPassword(password);
  if (!isPassword) throw new ApiError(400, "Password not matched");
  const refreshToken = await user.generateRefreshToken();
  const accessToken = await user.generateAccessToken();

  const encryptedRefresh = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  user.refreshToken = encryptedRefresh;
  await user.save({ validateBeforeSave: false });

  const userResult = await User.findById(user._id).select(
    "-password -refreshToken",
  );
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  };

  return res
    .status(200)
    .cookie("refreshToken", refreshToken, options)
    .cookie("accessToken", accessToken, options)
    .json(new ApiResponse(200, userResult, "Logged In"));
});

/** LOG-OUT*/

export const logOut = asyncHandler(async (req, res) => {
  const user = req.user;

  user.refreshToken = undefined;

  user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .clearCookie("accessToken")
    .clearCookie("refreshToken")
    .json(new ApiResponse(200, null, "Logged Out"));

  // .json(new ApiResponse(200, null, "Logged Out"));
});

/** RESET-PASSWORD*/

export const resetPassword = asyncHandler(async (req, res) => {});

/** FORGOT-PASSWORD*/

export const forgotPassword = asyncHandler(async (req, res) => {});

/** CHANGE-PASSWORD*/

export const changePassword = asyncHandler(async (req, res) => {});

/** REFRESH-ACCESS-TOKEN*/

export const refreshAccessToken = asyncHandler(async (req, res) => {});
/**
 * Quick reference:

400 → Invalid request (missing fields, invalid input)
401 → Not authenticated
403 → Authenticated but not allowed
404 → Resource not found
409 → Conflict (duplicate email, username already exists)
422 → Validation failed (sometimes used instead of 400)
500 → Internal server error
 */
