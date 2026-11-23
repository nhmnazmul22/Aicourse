import { Request, Response, NextFunction } from "express";
import { cardService } from "../services/CardService";

export class CardController {
  list = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = (req as any).user?.userId;
      const { id: projectId, columnId } = req.params;
      const cards = await cardService.listCards(userId, projectId, columnId);
      res.json({ cards });
    } catch (error) {
      next(error);
    }
  };

  create = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = (req as any).user?.userId;
      const { id: projectId, columnId } = req.params;
      const { title, details } = req.body;
      if (!title) {
        const err = new Error("Title is required") as Error & { statusCode?: number };
        err.statusCode = 400;
        throw err;
      }
      const card = await cardService.createCard(
        userId,
        projectId,
        columnId,
        title,
        details
      );
      res.status(201).json({ card });
    } catch (error) {
      next(error);
    }
  };

  update = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = (req as any).user?.userId;
      const { id: projectId, columnId, cardId } = req.params;
      const { title, details } = req.body;
      const card = await cardService.updateCard(
        userId,
        projectId,
        columnId,
        cardId,
        title,
        details
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

  delete = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = (req as any).user?.userId;
      const { id: projectId, columnId, cardId } = req.params;
      const deleted = await cardService.deleteCard(
        userId,
        projectId,
        columnId,
        cardId
      );
      if (!deleted) {
        const err = new Error("Card not found") as Error & { statusCode?: number };
        err.statusCode = 404;
        throw err;
      }
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}

export const cardController = new CardController();
