import mongoose from "mongoose";
import logger from "../src/utils/logger.utils.js";

export const connectDB = async (url) => {
  try {
    await mongoose.connect(url);

    logger.info("MongoDB successfully connected.");
  } catch (error) {
    logger.error(error, "Mongodb connection ERROR.");
  }
};
