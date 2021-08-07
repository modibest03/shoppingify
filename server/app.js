import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import ErrorResponse from "./utils/errorResponse.js";
import globalErrorHandler from "./controllers/errorController.js";
import userRoutes from "./routes/userRoutes.js";

const app = express();

if (process.env.NODE_ENV === "development") {
  console.log("development");
}

if (process.env.NODE_ENV === "production") {
  console.log("prod");
}

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// app.use("/api/v1/users")
app.use("/api/v1/users", userRoutes);

app.all("*", (req, res, next) => {
  next(new ErrorResponse(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

export default app;
