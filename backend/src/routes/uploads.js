import { Router } from "express";
import upload from "../middleware/upload.js";
import { protect, requireAdmin } from "../middleware/auth.js";

const router = Router();

router.post("/", protect, requireAdmin, upload.single("image"), (req, res) => {
    console.log("FILE RECEIVED:", req.file);
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "No image uploaded",
    });
  }
 console.log("IMAGE PATH:", req.file.path);   
  return res.status(200).json({
    success: true,
    data: {
      url: req.file.path,
    },
  });
});

export default router;