import { createClient } from "redis";
import logger from "../src/utils/logger.utils.js";

export const createRedis = createClient({
  url: "redis://localhost:6380",
});
logger.info(">>------------------------>");

export const publisher = createRedis;
export const subscriber = createRedis.duplicate();

publisher.on("error", (err) => {
  logger.error(err, "Publisher Error.");
});

subscriber.on("error", (err) => {
  logger.error(err, "Subscriber Error.");
});

/****************************************************************************************************************************
 ****************************************************************************************************************************/

export const connectRedis = async () => {
  if (!createRedis.isOpen) {
    logger.info("(------------------------)");
    await createRedis.connect();
    logger.info("Redis connect");
  }

  // if (!publisher.isOpen) {
  //   await publisher.connect();
  //   logger.info("Redis publisher connected");
  // }

  if (!subscriber.isOpen) {
    await subscriber.connect();
    logger.info("Redis subscriber connected");
  }
};

export const disConnectRedis = async () => {
  if (createRedis.isOpen) {
    logger.info("(xxxxxxxxxxxxxxxxxxxx)");
    await createRedis.quit();
    logger.info("Redis disConnect");
  }

  if (subscriber.isOpen) {
    await subscriber.quit();
  }

  // if (publisher.isOpen) {
  //   await publisher.quit();
  // }
};

/****************************************************************************************************************************
 ****************************************************************************************************************************/

export const publisherUserEvent = async (event) => {
  await publisher.publish("user-event", JSON.stringify(event));
};

export const subscriberUserEvent = async (callback) => {
  await subscriber.subscribe("user-event", callback);
};

/****************************************************************************************************************************
 ****************************************************************************************************************************/
