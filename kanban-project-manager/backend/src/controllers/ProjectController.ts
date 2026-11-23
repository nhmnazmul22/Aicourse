import { Response, NextFunction } from "express";
import { projectService } from "../services/ProjectService";
import { boardService } from "../services/BoardService";
import { AuthenticatedRequest } from "../middleware/auth";

export class ProjectController {
  list = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user?.userId || "";
      const projects = await projectService.listProjects(userId);
      res.json({ projects: projects.map((p) => (typeof p.toJSON === "function" ? p.toJSON() : p)) });
    } catch (error) {
      next(error);
    }
  };

  create = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user?.userId || "";
      const { name } = req.body;
      if (!name) {
        const err = new Error("Name is required") as Error & { statusCode?: number };
        err.statusCode = 400;
        throw err;
      }
      const project = await projectService.createProject(userId, name);
      res.status(201).json({ project: typeof project.toJSON === "function" ? project.toJSON() : project });
    } catch (error) {
      next(error);
    }
  };

  getBoard = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user?.userId || "";
      const { id } = req.params;
      const board = await boardService.getBoard(userId, id);
      if (!board) {
        const err = new Error("Project not found") as Error & { statusCode?: number };
        err.statusCode = 404;
        throw err;
      }
      res.json({ project: board.project, columns: board.columns });
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
      const { id } = req.params;
      const { name } = req.body;
      const project = await projectService.updateProject(userId, id, name);
      if (!project) {
        const err = new Error("Project not found") as Error & { statusCode?: number };
        err.statusCode = 404;
        throw err;
      }
      res.json({ project });
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
      const { id } = req.params;
      const deleted = await projectService.deleteProject(userId, id);
      if (!deleted) {
        const err = new Error("Project not found") as Error & { statusCode?: number };
        err.statusCode = 404;
        throw err;
      }
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}

export const projectController = new ProjectController();
