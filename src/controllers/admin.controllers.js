import User from "../models/user.models.js";
import ApiError from "../utils/ApiError.utils.js";
import ApiResponse from "../utils/ApiResponse.utils.js";
import asyncHandler from "../utils/asyncHandlers.utils.js";

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
export const Delete_users = asyncHandler(async (req, res) => {});
export const Change_user_roles = asyncHandler(async (req, res) => {});
