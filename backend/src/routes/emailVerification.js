import { Router } from "express";
import { verifyEmail } from "../controllers/emailVerification.js";
import { asyncHandler } from "../middleware/errorHandler.js";

const router = Router();

router.get("/verify", asyncHandler(verifyEmail));

export default router;