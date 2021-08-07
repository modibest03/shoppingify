import express from "express";

import upload from "../utils/multer.js";
import {
  createUser,
  logIn,
  logout,
  getProfile,
  updateMe,
} from "../controllers/userController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/signup", upload.single("image"), createUser);
router.post("/login", logIn);
router.post("/logout", logout);

router.patch("/updateMe", protect, updateMe);

router.get("/profile", protect, getProfile);

export default router;
