import { Router } from "express";
import { projectController } from "../controllers/ProjectController";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.get("/", projectController.list);
router.post("/", projectController.create);
router.put("/:id", projectController.update);
router.delete("/:id", projectController.delete);

export default router;
