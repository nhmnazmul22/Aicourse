import { Request, Response, NextFunction } from "express";
import { projectService } from "../services/ProjectService";

export class ProjectController {
  list = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = (req as any).user?.userId;
      const projects = await projectService.listProjects(userId);
      res.json({ projects });
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
      const { name } = req.body;
      if (!name) {
        const err = new Error("Name is required") as Error & { statusCode?: number };
        err.statusCode = 400;
        throw err;
      }
      const project = await projectService.createProject(userId, name);
      res.status(201).json({ project });
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
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = (req as any).user?.userId;
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
