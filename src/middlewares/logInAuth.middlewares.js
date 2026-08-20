import jwt from "jsonwebtoken";
import ApiError from "../utils/ApiError.utils.js";
import { ACCESS_TOKEN_SECRET } from "../../config/env.config.js";
import User from "../models/user.models.js";
import { createRedis } from "../../config/redis.config.js";
const logInAuth = async (req, res, next) => {
  const accessId = req.cookies.accessToken;
  if (!accessId) throw new ApiError(404, "Not logged In.");

  let decoded_data;
  try {
    decoded_data = jwt.verify(accessId, ACCESS_TOKEN_SECRET);
  } catch (error) {
    throw new ApiError(401, "Invalid or expired token.");
  }
  const userId = decoded_data._id;
  const cacheKey = `user:${userId}`;

  // Redis first
  const cachedUser = await createRedis.get(cacheKey);

  if (cachedUser) {
    req.user = JSON.parse(cachedUser);
    return next();
  }

  const user = await User.findById(decoded_data._id).select(
    "-password -refreshToken",
  );

  if (!user) {
    throw new ApiError(403, "Please verify your email.");
  }

  req.user = user;
  await createRedis.set(cacheKey, JSON.stringify(user), {
    EX: 60 * 5,
  });

  return next();
};

export default logInAuth;
