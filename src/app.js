import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";

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
app.use(morgan("dev"));

// ROUTES IMPORT
import userRouter from "./routes/user.route.js";
import messageRouter from "./routes/message.route.js";

// ROUTES SET
app.use("/api/v1/users", userRouter);
app.use("/api/v1/messages", messageRouter);

// CUSTOM ROUTE
app.get("/", (req, res) => {
     return res.status(200).json({ message: "Welcome to TrueFeedback API" });
});

export { app };
