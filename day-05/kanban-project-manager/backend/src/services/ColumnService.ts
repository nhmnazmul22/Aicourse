import { BoardColumn, type IBoardColumn } from "../models/BoardColumn";
import { AppError } from "../middleware/error";
import { Types } from "mongoose";

export class ColumnService {
  async createColumn(
    userId: string,
    projectId: string,
    name: string
  ): Promise<IBoardColumn> {
    const lastColumn = await BoardColumn.findOne({
      projectId: new Types.ObjectId(projectId),
    }).sort({ position: -1 });
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
    const result = await BoardColumn.deleteOne({
      _id: new Types.ObjectId(columnId),
      projectId: new Types.ObjectId(projectId),
    });
    return result.deletedCount > 0;
  }
}

export const columnService = new ColumnService();
