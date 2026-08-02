import { validationResult } from "express-validator";
import ApiError from "../utils/ApiError.utils.js";
import asyncHandler from "../utils/asyncHandlers.utils.js";

const validate = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);

  if (errors.isEmpty()) {
    return next();
  }
  console.log("ERRORS: ", errors);
  const extractedErrors = [];

  errors.array().map((err) => {
    console.log(err);

    extractedErrors.push({
      [err.path]: err.msg,
    });
  });
  console.log("extracted error: ", extractedErrors);

  throw new ApiError(422, "RECIEVED DATA IS NOT", extractedErrors);
});
export default validate;
