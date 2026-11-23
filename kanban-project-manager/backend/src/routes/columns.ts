import { Router } from "express";
import { columnController } from "../controllers/ColumnController";
import { authMiddleware } from "../middleware/auth";

const router = Router({ mergeParams: true });

router.post("/", columnController.create);
router.get("/", columnController.list);
router.put("/:columnId", columnController.update);
router.delete("/:columnId", columnController.delete);

export default router;
