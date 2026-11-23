import { Project, IProject } from "../models/Project";
import { BoardColumn, IBoardColumn } from "../models/BoardColumn";
import { Card, ICard } from "../models/Card";
import { Types } from "mongoose";

export interface BoardData {
  project: IProject;
  columns: unknown[];
  rawColumns: IBoardColumn[];
  cards: ICard[];
}

function isValidId(id: unknown): boolean {
  if (!id || typeof id !== "string") return false;
  if (typeof Types?.ObjectId?.isValid === "function") {
    return Types.ObjectId.isValid(id);
  }
  return true;
}

export class BoardService {
  async getBoard(userId: string, projectId: string): Promise<BoardData | null> {
    if (!isValidId(projectId) || !isValidId(userId)) {
      return null;
    }

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

    const columnsWithCards = columns.map((col) => {
      const colIdStr = col._id ? col._id.toString() : (col as unknown as { id?: string }).id || "";
      const colCards = cards.filter((card) => {
        const cardColId = card.columnId ? card.columnId.toString() : "";
        return cardColId === colIdStr;
      });
      const colObj = typeof col.toJSON === "function" ? col.toJSON() : col;
      return {
        ...colObj,
        cards: colCards.map((c) => (typeof c.toJSON === "function" ? c.toJSON() : c)),
      };
    });

    const projectObj = typeof project.toJSON === "function" ? project.toJSON() : project;

    return {
      project: projectObj as IProject,
      columns: columnsWithCards,
      rawColumns: columns,
      cards,
    };
  }
}

export const boardService = new BoardService();
