import { Response, NextFunction } from "express";
import { cardService } from "../services/CardService";
import { AuthenticatedRequest } from "../middleware/auth";

export class MoveCardController {
  move = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user?.userId || "";
      const { id: projectId, cardId } = req.params;
      const { targetColumnId, targetIndex } = req.body;
      if (!targetColumnId || targetIndex === undefined) {
        const err = new Error("targetColumnId and targetIndex are required") as Error & { statusCode?: number };
        err.statusCode = 400;
        throw err;
      }
      const card = await cardService.moveCard(
        userId,
        projectId,
        cardId,
        targetColumnId,
        Number(targetIndex)
      );
      if (!card) {
        const err = new Error("Card not found") as Error & { statusCode?: number };
        err.statusCode = 404;
        throw err;
      }
      res.json({ card });
    } catch (error) {
      next(error);
    }
  };
}

export const moveCardController = new MoveCardController();
