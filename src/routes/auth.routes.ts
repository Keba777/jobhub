import { Router } from "express";
import { registerUser, loginUser, verifyEmail } from "../controllers/auth.controller";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/verify", verifyEmail);

export default router;