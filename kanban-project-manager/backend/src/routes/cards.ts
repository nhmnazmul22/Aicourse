import { Router } from "express";
import { cardController } from "../controllers/CardController";
import { moveCardController } from "../controllers/MoveCardController";
import { authMiddleware } from "../middleware/auth";

const router = Router({ mergeParams: true });

router.get("/", cardController.list);
router.post("/", cardController.create);
router.put("/:cardId", cardController.update);
router.delete("/:cardId", cardController.delete);

export default router;
