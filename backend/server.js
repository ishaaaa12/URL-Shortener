import dotenv from "dotenv";
import mongoose from "mongoose";
import logger from "./utils/logger.js";
import { connectRedis } from "./config/redis.js";
import app from "./app.js";

dotenv.config();

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    await connectRedis();

    logger.info("Connected to MongoDB");
    
    app.listen(process.env.PORT, () => {
      logger.info(`Server running on port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    logger.error("Error connecting to MongoDB:", err);
  });
