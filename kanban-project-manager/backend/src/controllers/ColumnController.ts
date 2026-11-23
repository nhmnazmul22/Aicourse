import { Response, NextFunction } from "express";
import { columnService } from "../services/ColumnService";
import { AuthenticatedRequest } from "../middleware/auth";

export class ColumnController {
  create = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user?.userId || "";
      const { id: projectId } = req.params;
      const { name } = req.body;
      if (!name) {
        const err = new Error("Name is required") as Error & { statusCode?: number };
        err.statusCode = 400;
        throw err;
      }
      const column = await columnService.createColumn(userId, projectId, name);
      res.status(201).json({ column });
    } catch (error) {
      next(error);
    }
  };

  list = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user?.userId || "";
      const { id: projectId } = req.params;
      const columns = await columnService.listColumns(userId, projectId);
      res.json({ columns });
    } catch (error) {
      next(error);
    }
  };

  update = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user?.userId || "";
      const { id: projectId, columnId } = req.params;
      const { name } = req.body;
      const column = await columnService.updateColumn(
        userId,
        projectId,
        columnId,
        name
      );
      if (!column) {
        const err = new Error("Column not found") as Error & { statusCode?: number };
        err.statusCode = 404;
        throw err;
      }
      res.json({ column });
    } catch (error) {
      next(error);
    }
  };

  delete = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user?.userId || "";
      const { id: projectId, columnId } = req.params;
      const deleted = await columnService.deleteColumn(
        userId,
        projectId,
        columnId
      );
      if (!deleted) {
        const err = new Error("Column not found") as Error & { statusCode?: number };
        err.statusCode = 404;
        throw err;
      }
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}

export const columnController = new ColumnController();
