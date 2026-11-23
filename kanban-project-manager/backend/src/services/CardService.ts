import { Card, type ICard } from "../models/Card";
import { BoardColumn } from "../models/BoardColumn";
import { Project } from "../models/Project";
import { AppError } from "../middleware/error";
import { Types } from "mongoose";

export class CardService {
  private async ensureColumnBelongsToUser(
    userId: string,
    projectId: string,
    columnId: string
  ): Promise<void> {
    const project = await Project.findOne({
      _id: new Types.ObjectId(projectId),
      userId: new Types.ObjectId(userId),
    });
    if (!project) {
      throw new AppError("Project not found", 404);
    }

    const column = await BoardColumn.findOne({
      _id: new Types.ObjectId(columnId),
      projectId: new Types.ObjectId(projectId),
    });
    if (!column) {
      throw new AppError("Column not found", 404);
    }
  }

  async listCards(
    userId: string,
    projectId: string,
    columnId: string
  ): Promise<ICard[]> {
    await this.ensureColumnBelongsToUser(userId, projectId, columnId);

    return Card.find({
      columnId: new Types.ObjectId(columnId),
    }).sort({ position: 1 });
  }

  async createCard(
    userId: string,
    projectId: string,
    columnId: string,
    title: string,
    details: string
  ): Promise<ICard> {
    await this.ensureColumnBelongsToUser(userId, projectId, columnId);

    const lastCard = await Card.findOne(
      { columnId: new Types.ObjectId(columnId) },
      null,
      { sort: { position: -1 } }
    );
    const position = lastCard ? lastCard.position + 1 : 0;

    return Card.create({
      title,
      details: details || "",
      columnId: new Types.ObjectId(columnId),
      position,
    });
  }

  async updateCard(
    userId: string,
    projectId: string,
    columnId: string,
    cardId: string,
    title: string,
    details: string
  ): Promise<ICard | null> {
    await this.ensureColumnBelongsToUser(userId, projectId, columnId);

    return Card.findOneAndUpdate(
      {
        _id: new Types.ObjectId(cardId),
        columnId: new Types.ObjectId(columnId),
      },
      { title, details },
      { new: true }
    );
  }

  async deleteCard(
    userId: string,
    projectId: string,
    columnId: string,
    cardId: string
  ): Promise<boolean> {
    await this.ensureColumnBelongsToUser(userId, projectId, columnId);

    const card = await Card.findOne({
      _id: new Types.ObjectId(cardId),
      columnId: new Types.ObjectId(columnId),
    });
    if (!card) return false;

    const result = await Card.deleteOne({
      _id: new Types.ObjectId(cardId),
      columnId: new Types.ObjectId(columnId),
    });

    if (result.deletedCount > 0) {
      await Card.updateMany(
        {
          columnId: new Types.ObjectId(columnId),
          position: { $gt: card.position },
        },
        { $inc: { position: -1 } }
      );
      return true;
    }
    return false;
  }

  async moveCard(
    userId: string,
    projectId: string,
    cardId: string,
    targetColumnId: string,
    targetIndex: number
  ): Promise<ICard | null> {
    const project = await Project.findOne({
      _id: new Types.ObjectId(projectId),
      userId: new Types.ObjectId(userId),
    });
    if (!project) {
      throw new AppError("Project not found", 404);
    }

    const targetColumn = await BoardColumn.findOne({
      _id: new Types.ObjectId(targetColumnId),
      projectId: new Types.ObjectId(projectId),
    });
    if (!targetColumn) {
      throw new AppError("Target column not found", 404);
    }

    const card = await Card.findById(new Types.ObjectId(cardId));
    if (!card) return null;

    const sourceColumn = await BoardColumn.findOne({
      _id: card.columnId,
      projectId: new Types.ObjectId(projectId),
    });
    if (!sourceColumn) {
      throw new AppError("Card does not belong to project", 403);
    }

    const isSameColumn = card.columnId.toString() === targetColumnId;
    const sourceIndex = card.position;

    if (isSameColumn) {
      if (sourceIndex === targetIndex) {
        return card;
      }
      if (targetIndex > sourceIndex) {
        await Card.updateMany(
          {
            columnId: card.columnId,
            position: { $gt: sourceIndex, $lte: targetIndex },
          },
          { $inc: { position: -1 } }
        );
      } else {
        await Card.updateMany(
          {
            columnId: card.columnId,
            position: { $gte: targetIndex, $lt: sourceIndex },
          },
          { $inc: { position: 1 } }
        );
      }
      return Card.findByIdAndUpdate(
        card._id,
        { position: targetIndex },
        { new: true }
      );
    }

    // Cross-column move
    await Card.updateMany(
      {
        columnId: card.columnId,
        position: { $gt: sourceIndex },
      },
      { $inc: { position: -1 } }
    );

    await Card.updateMany(
      {
        columnId: new Types.ObjectId(targetColumnId),
        position: { $gte: targetIndex },
      },
      { $inc: { position: 1 } }
    );

    return Card.findByIdAndUpdate(
      card._id,
      {
        columnId: new Types.ObjectId(targetColumnId),
        position: targetIndex,
      },
      { new: true }
    );
  }
}

export const cardService = new CardService();
