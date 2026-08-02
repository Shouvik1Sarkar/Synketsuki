import { configDotenv } from "dotenv";

configDotenv({ path: `.env.${process.env.NODE_ENV ?? "development"}.local` });

export const {
  PORT,
  MONGODB_URI,
  ACCESS_TOKEN_SECRET,
  ACCESS_TOKEN_EXPIRY,
  REFRESH_TOKEN_SECRET,
  REFRESH_TOKEN_EXPIRY,
  SMTP_USER,
  SMTP_PASS,
  SMTP_HOST,
  SMTP_PORT,
} = process.env;
