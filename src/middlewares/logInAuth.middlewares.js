import jwt from "jsonwebtoken";
import ApiError from "../utils/ApiError.utils.js";
import { ACCESS_TOKEN_SECRET } from "../../config/env.config.js";
import User from "../models/user.models.js";
const logInAuth = async (req, res, next) => {
  const accessId = req.cookies.accessToken;
  if (!accessId) throw new ApiError(404, "Not logged In.");

  let decoded_data;
  try {
    decoded_data = jwt.verify(accessId, ACCESS_TOKEN_SECRET);
    console.log("decoded data: ", decoded_data);
  } catch (error) {
    throw new ApiError(401, "Invalid or expired token.");
    // return next(error);
  }

  const user = await User.findById(decoded_data._id);
  console.log("user", user);

  if (!user) throw new ApiError(401, "Invalid or expired token.");
  if (!user.isEmailVerified) throw new ApiError(401, "Is email verified.");

  req.user = user;

  return next();
};

export default logInAuth;
