import { Router } from "express";
import { currentUser, login, memberFeatures, register } from "../controllers/authController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/login", login);
router.post("/register", register);
router.get("/me", requireAuth, currentUser);
router.get("/member/features", requireAuth, memberFeatures);

export default router;
