import express from "express";
import upload from "../middlewares/upload.js";

const router = express.Router();

router.post("/", upload.single("image"), (req, res) => {
  res.json({
    success: true,
    imageUrl: req.file.path,
  });
});

export default router;