import { Request, Response, NextFunction } from "express";
import { aiService } from "../services/AIService";

export class AITestController {
  test = async (
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const response = await aiService.testConnection();
      res.json({ ok: true, response });
    } catch (error) {
      next(error);
    }
  };
}

export const aiTestController = new AITestController();
