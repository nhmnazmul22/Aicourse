import { Project, type IProject } from "../models/Project";
import { AppError } from "../middleware/error";
import { Types } from "mongoose";

export class ProjectService {
  async listProjects(userId: string): Promise<IProject[]> {
    return Project.find({ userId: new Types.ObjectId(userId) }).sort({
      createdAt: -1,
    });
  }

  async createProject(
    userId: string,
    name: string
  ): Promise<IProject> {
    return Project.create({
      name,
      userId: new Types.ObjectId(userId),
    });
  }

  async updateProject(
    userId: string,
    projectId: string,
    name: string
  ): Promise<IProject | null> {
    const project = await Project.findOneAndUpdate(
      { _id: new Types.ObjectId(projectId), userId: new Types.ObjectId(userId) },
      { name },
      { new: true }
    );
    return project;
  }

  async deleteProject(userId: string, projectId: string): Promise<boolean> {
    const result = await Project.deleteOne({
      _id: new Types.ObjectId(projectId),
      userId: new Types.ObjectId(userId),
    });
    return result.deletedCount > 0;
  }

  async getProjectById(
    userId: string,
    projectId: string
  ): Promise<IProject | null> {
    return Project.findOne({
      _id: new Types.ObjectId(projectId),
      userId: new Types.ObjectId(userId),
    });
  }
}

export const projectService = new ProjectService();
