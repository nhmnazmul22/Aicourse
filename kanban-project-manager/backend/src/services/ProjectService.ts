import { Project, type IProject } from "../models/Project";
import { BoardColumn } from "../models/BoardColumn";
import { Card } from "../models/Card";
import { Types } from "mongoose";

export const DEFAULT_COLUMNS = [
  "Backlog",
  "To do",
  "In progress",
  "Review",
  "Done",
];

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
    const project = await Project.create({
      name,
      userId: new Types.ObjectId(userId),
    });

    const columns = DEFAULT_COLUMNS.map((colName, index) => ({
      name: colName,
      projectId: project._id,
      position: index,
    }));
    await BoardColumn.insertMany(columns);

    return project;
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
    const project = await Project.findOne({
      _id: new Types.ObjectId(projectId),
      userId: new Types.ObjectId(userId),
    });
    if (!project) return false;

    const columns = await BoardColumn.find({
      projectId: new Types.ObjectId(projectId),
    });
    const columnIds = columns.map((col) => col._id);
    await Card.deleteMany({ columnId: { $in: columnIds } });
    await BoardColumn.deleteMany({ projectId: new Types.ObjectId(projectId) });
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
