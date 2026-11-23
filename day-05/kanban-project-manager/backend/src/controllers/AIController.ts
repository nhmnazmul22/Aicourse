import { Request, Response, NextFunction } from "express";
import { boardService } from "../services/BoardService";
import { aiService } from "../services/AIService";
import { Project } from "../models/Project";
import { Types } from "mongoose";

export class AIController {
  board = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = (req as any).user?.userId;
      const { message, history, projectId } = req.body;

      if (!message) {
        const err = new Error("Message is required") as Error & { statusCode?: number };
        err.statusCode = 400;
        throw err;
      }

      let targetProjectId = projectId;
      if (!targetProjectId) {
        const project = await Project.findOne({
          userId: new Types.ObjectId(userId),
        }).sort({ createdAt: -1 });
        if (!project) {
          const err = new Error("No project found") as Error & { statusCode?: number };
          err.statusCode = 404;
          throw err;
        }
        targetProjectId = project._id.toString();
      }

      const board = await boardService.getBoard(userId, targetProjectId);
      if (!board) {
        const err = new Error("Board not found") as Error & { statusCode?: number };
        err.statusCode = 404;
        throw err;
      }

      const response = await aiService.handleMessage(
        userId,
        message,
        history || [],
        {
          projects: [board.project],
          columns: board.columns,
          cards: board.cards,
        }
      );

      res.json(response);
    } catch (error) {
      next(error);
    }
  };
}

export const aiController = new AIController();
