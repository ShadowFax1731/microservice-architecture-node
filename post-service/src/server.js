require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const Redis = require("ioredis");
const cors = require("cors");
const helmet = require("helmet");
const router = require("./routes/PostRoutes");
const ErrorHandler = require("./middleware/ErrorHandler");
const logger = require("./utils/logger");

const app = express();
const PORT = process.env.PORT || 3002;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => logger.info("Connected to mongoDB"))
  .catch((e) => logger.error("Mongo connection error", e));

const redisClient = new Redis(process.env.REDIS_URL);

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  logger.info(`Received ${req.method} request at ${req.url}`);
  logger.info(`Request Body, ${req.body}`);
  next();
});

//IP Based Rate limit for sensitive endpoints


//routes
app.use(
  "/api/posts",
  (req, res, next) => {
    req.redisClient = redisClient;
    next();
  },
  router,
);

app.use(ErrorHandler);

app.listen(PORT, () => {
  logger.info("Post Service running on port", PORT);
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection at", promise, "reason: ", reason);
});
