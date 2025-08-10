import express, { urlencoded, Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import dotenv from "dotenv";
import authRouter from "./routes/auth.routes"
import jobRouter from "./routes/job.routes"
import applicationRouter from "./routes/application.routes"


dotenv.config({
    path: path.join(__dirname, "../.env")
});

const app = express();

app.use(cors());
app.use(urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/jobs", jobRouter)
app.use("/api/v1/applications", applicationRouter)
// app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));


app.get("/", (req: Request, res: Response) => {
    res.status(200).json({ message: "Hello Eskalate API!" });
});

export default app;