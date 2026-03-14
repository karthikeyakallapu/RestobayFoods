import ENV_VARIABLES from "./config/environment.js";
import express from "express";
import errorHandler from "./middleware/error.js";
import helmet from "helmet";
import cors from "cors";
import rateLimiter from "./middleware/rateLimiter.js";
import router from "./routes/rotues.js";
import { testConnection } from "./config/database.js";
import { startPendingStateReconciler } from "./jobs/pendingStateReconciler.js";

const app = express();

app.set("trust proxy", 1);
app.use(express.json());
app.use(helmet());
app.use(cors());
app.use(rateLimiter);
app.use("/api", router);
app.use(errorHandler);

const startServer = async () => {
  try {
    await testConnection();
    startPendingStateReconciler();

    app.listen(ENV_VARIABLES.PORT, () => {
      console.log(`Server is running on http://localhost:${ENV_VARIABLES.PORT}`);
    });
  } catch (error) {
    console.error("Unable to start server:", error);
    process.exit(1);
  }
};

void startServer();
