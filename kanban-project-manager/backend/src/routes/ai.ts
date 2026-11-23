import { Router } from "express";
import { aiController } from "../controllers/AIController";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.post("/board", authMiddleware, aiController.board);

export default router;
