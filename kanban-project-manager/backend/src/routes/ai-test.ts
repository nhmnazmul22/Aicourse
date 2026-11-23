import { Router } from "express";
import { aiTestController } from "../controllers/AITestController";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.post("/test", authMiddleware, aiTestController.test);

export default router;
