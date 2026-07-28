import { Router } from "express";
import { sendContactEmail } from "../controllers/contact.js";

const router = Router();

router.post("/", sendContactEmail);

export default router;