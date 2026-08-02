import User from "../models/user.models.js";
import ApiError from "../utils/ApiError.utils.js";
import ApiResponse from "../utils/ApiResponse.utils.js";
import asyncHandler from "../utils/asyncHandlers.utils.js";

// get Me
export const getMe = asyncHandler(async (req, res) => {
  const user = req.user;
  if (!user) throw new ApiError(404, "User not found");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Advanced Backend Project Ideas"));
});
// get user By Id
export const getUserById = asyncHandler(async (req, res) => {
  const user = req.user;

  const { id } = req.params;
  if (!id) throw new ApiError(400, "ID is required");

  const get_user = await User.findById(id).select("-password -refreshToken");
  if (!get_user) throw new ApiError(404, "User not found.");

  return res.status(200).json(new ApiResponse(200, get_user, "User found"));
});
// get all Users
export const getAllUsers = asyncHandler(async (req, res) => {
  const user = req.user;
  if (!user) throw new ApiError(404, "User not logged In.");
  if (!["product_owner", "product_admin"].includes(req.role))
    throw new ApiError(401, "Not allowed.");

  const allUsers = await User.find().select(
    "-password -refreshToken -emailVerificationToken -forgotPasswordToken",
  );

  return res.status(200).json(new ApiResponse(200, allUsers, "Users"));
});
// update your profile
export const updateYourProfile = asyncHandler(async (req, res) => {
  const user = req.user;
  if (!user) throw new ApiError(404, "User not logged In.");
  const { fullName, userName, email } = req.body;
  const updated_obj = {};

  if (fullName) updated_obj.fullName = fullName;
  if (userName) updated_obj.userName = userName;
  if (email) updated_obj.email = email;

  const updated_user = await User.findByIdAndUpdate(user._id, updated_obj, {
    returnDocument: "after",
    runValidators: true,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, updated_user, "Update user."));
});
// update your avtar
export const updateAvatar = asyncHandler(async (req, res) => {});
// update user /** Authorization after */
export const updateUser = asyncHandler(async (req, res) => {});
// delete user
export const deleteMyProfile = asyncHandler(async (req, res) => {
  const user = req.user;
  if (!user) throw new ApiError(400, "User not logged In.");

  await User.findByIdAndDelete(user._id);

  return res.status(200).json(new ApiResponse(200, null, "User deleted."));
});
