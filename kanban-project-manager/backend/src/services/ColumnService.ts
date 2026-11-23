import { BoardColumn, type IBoardColumn } from "../models/BoardColumn";
import { Project } from "../models/Project";
import { Card } from "../models/Card";
import { AppError } from "../middleware/error";
import { Types } from "mongoose";

export class ColumnService {
  private async ensureProjectOwnership(userId: string, projectId: string): Promise<void> {
    const project = await Project.findOne({
      _id: new Types.ObjectId(projectId),
      userId: new Types.ObjectId(userId),
    });
    if (!project) {
      throw new AppError("Project not found", 404);
    }
  }

  async createColumn(
    userId: string,
    projectId: string,
    name: string
  ): Promise<IBoardColumn> {
    await this.ensureProjectOwnership(userId, projectId);

    const lastColumn = await BoardColumn.findOne(
      { projectId: new Types.ObjectId(projectId) },
      null,
      { sort: { position: -1 } }
    );
    const position = lastColumn ? lastColumn.position + 1 : 0;

    return BoardColumn.create({
      name,
      projectId: new Types.ObjectId(projectId),
      position,
    });
  }

  async listColumns(
    userId: string,
    projectId: string
  ): Promise<IBoardColumn[]> {
    await this.ensureProjectOwnership(userId, projectId);

    return BoardColumn.find({
      projectId: new Types.ObjectId(projectId),
    }).sort({ position: 1 });
  }

  async updateColumn(
    userId: string,
    projectId: string,
    columnId: string,
    name: string
  ): Promise<IBoardColumn | null> {
    await this.ensureProjectOwnership(userId, projectId);

    return BoardColumn.findOneAndUpdate(
      {
        _id: new Types.ObjectId(columnId),
        projectId: new Types.ObjectId(projectId),
      },
      { name },
      { new: true }
    );
  }

  async deleteColumn(
    userId: string,
    projectId: string,
    columnId: string
  ): Promise<boolean> {
    await this.ensureProjectOwnership(userId, projectId);

    await Card.deleteMany({ columnId: new Types.ObjectId(columnId) });
    const result = await BoardColumn.deleteOne({
      _id: new Types.ObjectId(columnId),
      projectId: new Types.ObjectId(projectId),
    });
    return result.deletedCount > 0;
  }
}

export const columnService = new ColumnService();
