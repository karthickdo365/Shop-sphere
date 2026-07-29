import { Router } from "express";
import upload from "../middlewares/upload.js";
import { protect, requireAdmin } from "../middleware/auth.js";

const router = Router();

router.post("/", protect, requireAdmin, upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "No image uploaded",
    });
  }

  return res.status(200).json({
    success: true,
    data: {
      url: req.file.path,
    },
  });
});

export default router;