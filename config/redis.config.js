import { createClient } from "redis";
import logger from "../src/utils/logger.utils.js";

export const createRedis = createClient({
  url: "redis://localhost:6380",
});
logger.info(">>------------------------>");

export const connectRedis = async () => {
  if (!createRedis.isOpen) {
    logger.info("(------------------------)");
    await createRedis.connect();
    logger.info("Redis connect");
  }
};

export const disConnectRedis = async () => {
  if (createRedis.isOpen) {
    logger.info("(xxxxxxxxxxxxxxxxxxxx)");
    await createRedis.quit();
    logger.info("Redis disConnect");
  }
};
