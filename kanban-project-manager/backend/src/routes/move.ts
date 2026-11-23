import { Router } from "express";
import { moveCardController } from "../controllers/MoveCardController";
import { authMiddleware } from "../middleware/auth";

const router = Router({ mergeParams: true });

router.patch("/:cardId/move", moveCardController.move);

export default router;
