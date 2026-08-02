import User from "../models/user.models.js";
import ApiError from "../utils/ApiError.utils.js";
import ApiResponse from "../utils/ApiResponse.utils.js";
import asyncHandler from "../utils/asyncHandlers.utils.js";
import { available_roles_enum } from "../utils/constants.utils.js";

// export const Search_users = asyncHandler(async (req, res) => {});

export const Suspend_unsuspend_users = asyncHandler(async (req, res) => {
  const user = req.user;

  const { id } = req.params;

  const find_user = await User.findById(id).select("-password");
  if (!find_user) throw new ApiError(404, "User not found");

  let message = "";
  try {
    if (find_user.is_suspended == true) {
      find_user.is_suspended = false;
      message = "User Suspension removed.";
    } else {
      find_user.is_suspended = true;
      message = "User Suspended.";
    }
    find_user.save({ validateBeforeSave: false });
  } catch (error) {
    throw new ApiError(500, `Failed to toggle suspension.${error}`);
  }

  return res.status(200).json(new ApiResponse(200, find_user, message));
});
export const delete_users = asyncHandler(async (req, res) => {
  const user = req.user;

  const { id } = req.params;

  await User.findByIdAndDelete(id);

  return res.status(200).json(new ApiResponse(200, null, "user deleted"));
});
export const change_user_roles = asyncHandler(async (req, res) => {
  const user = req.user;

  const { id } = req.params;
  const { user_role } = req.body;

  if (!available_roles_enum.includes(user_role)) {
    throw new ApiError(400, "User roled not available.");
  }
  if (!id) throw new ApiError(400, "Id is required.");

  const find_user = await User.findById(id).select("-password");

  if (!find_user) throw new ApiError(400, "User not found");

  if (find_user.role === user_role) {
    throw new ApiError(400, "User already has this role.");
  }

  find_user.role = user_role;

  await find_user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, find_user, "user role updated"));
});
