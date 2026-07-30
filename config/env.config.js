import { configDotenv } from "dotenv";

configDotenv({ path: `.env.${process.env.NODE_ENV ?? "development"}.local` });

export const { PORT, MONGODB_URI } = process.env;
