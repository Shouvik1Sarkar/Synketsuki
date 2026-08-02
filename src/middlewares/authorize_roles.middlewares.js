import ApiError from "../utils/ApiError.utils.js";

export function authorize(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new ApiError(403, `Access denied. Required: ${roles.join(" or ")}`);
    }

    return next();
  };
}
