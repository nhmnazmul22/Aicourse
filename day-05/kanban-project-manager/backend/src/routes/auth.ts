import { Router } from "express";
import { authController } from "../controllers/AuthController";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/logout", authController.logout);
router.get("/me", authMiddleware, authController.me);

export default router;
