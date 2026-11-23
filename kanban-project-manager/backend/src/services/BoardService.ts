import { Project } from "../models/Project";
import { BoardColumn } from "../models/BoardColumn";
import { Card } from "../models/Card";
import { Types } from "mongoose";

export class BoardService {
  async getBoard(userId: string, projectId: string) {
    const project = await Project.findOne({
      _id: new Types.ObjectId(projectId),
      userId: new Types.ObjectId(userId),
    });
    if (!project) return null;

    const columns = await BoardColumn.find({
      projectId: new Types.ObjectId(projectId),
    }).sort({ position: 1 });

    const cards = await Card.find({
      columnId: { $in: columns.map((c) => c._id) },
    }).sort({ position: 1 });

    return {
      project,
      columns,
      cards,
    };
  }
}

export const boardService = new BoardService();
