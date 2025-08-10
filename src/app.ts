import express, { urlencoded, Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import dotenv from "dotenv";

dotenv.config({
    path: path.join(__dirname, "../.env")
});

const app = express();

app.use(cors());
app.use(urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());


app.get("/", (req: Request, res: Response) => {
    res.status(200).json({ message: "Hello Eskalate API!" });
});

export default app;