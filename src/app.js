import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();
app.use(
     cors({
          origin: `*`,
          credentials: true,
     })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ROUTES IMPORT
import userRouter from "./routes/user.route.js";
import messageRouter from "./routes/message.route.js";

// ROUTES SET
app.use("/api/v1/users", userRouter);
app.use("/api/v1/messages", messageRouter);

export { app };
