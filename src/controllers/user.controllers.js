import { createRedis } from "../../config/redis.config.js";
import User from "../models/user.models.js";
import ApiError from "../utils/ApiError.utils.js";
import ApiResponse from "../utils/ApiResponse.utils.js";
import asyncHandler from "../utils/asyncHandlers.utils.js";

// get Me
export const getMe = asyncHandler(async (req, res) => {
  const user = req.user;
  if (!user) throw new ApiError(404, "User not found");

  return res.status(200).json(new ApiResponse(200, user, "User Profile."));
});
// get user By Id
export const getUserById = asyncHandler(async (req, res) => {
  const user = req.user;

  const { id } = req.params;
  if (!id) throw new ApiError(400, "ID is required");

  const redis_key = `user:${id}`;

  const cachedUser = await createRedis.get(redis_key);

  if (cachedUser) {
    return res
      .status(200)
      .json(
        new ApiResponse(200, JSON.parse(cachedUser), "User found from caced"),
      );
  }

  const get_user = await User.findById(id).select("-password -refreshToken");
  if (!get_user) throw new ApiError(404, "User not found.");

  await createRedis.set(redis_key, JSON.stringify(get_user), {
    EX: 60 * 5,
  });

  return res.status(200).json(new ApiResponse(200, get_user, "User found"));
});
// get all Users
export const getAllUsers = asyncHandler(async (req, res) => {
  const user = req.user;
  if (!user) throw new ApiError(404, "User not logged In.");
  if (!["product_owner", "product_admin"].includes(user.role))
    throw new ApiError(401, "Not allowed.");

  const redis_key = `all_users:`;

  const cachedUser = await createRedis.get(redis_key);

  if (cachedUser) {
    return res
      .status(200)
      .json(
        new ApiResponse(200, JSON.parse(cachedUser), "User found from cached"),
      );
  }

  const allUsers = await User.find().select(
    "-password -refreshToken -emailVerificationToken -forgotPasswordToken",
  );

  await createRedis.set(redis_key, JSON.stringify(allUsers), {
    EX: 60 * 5,
  });

  return res.status(200).json(new ApiResponse(200, allUsers, "Users"));
});
// update your profile
export const updateYourProfile = asyncHandler(async (req, res) => {
  const user = req.user;
  if (!user) throw new ApiError(404, "User not logged In.");
  const redis_key = `user:${user._id}`;

  const { fullName, userName, email } = req.body;
  const updated_obj = {};

  if (fullName) updated_obj.fullName = fullName;
  if (userName) updated_obj.userName = userName;
  if (email) updated_obj.email = email;

  const updated_user = await User.findByIdAndUpdate(user._id, updated_obj, {
    returnDocument: "after",
    runValidators: true,
  });
  await createRedis.del(redis_key);

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

  const redis_key = `user:${user._id}`;
  await User.findByIdAndDelete(user._id);

  await createRedis.del(redis_key);

  return res.status(200).json(new ApiResponse(200, null, "User deleted."));
});
