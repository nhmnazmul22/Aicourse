import { Card, type ICard } from "../models/Card";
import { BoardColumn } from "../models/BoardColumn";
import { AppError } from "../middleware/error";
import { Types } from "mongoose";

export class CardService {
  async listCards(
    userId: string,
    projectId: string,
    columnId: string
  ): Promise<ICard[]> {
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
    return Card.create({
      title,
      details: details || "",
      columnId: new Types.ObjectId(columnId),
      position: 0,
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
    const result = await Card.deleteOne({
      _id: new Types.ObjectId(cardId),
      columnId: new Types.ObjectId(columnId),
    });
    return result.deletedCount > 0;
  }

  async moveCard(
    userId: string,
    projectId: string,
    cardId: string,
    targetColumnId: string,
    targetIndex: number
  ): Promise<ICard | null> {
    const card = await Card.findById(new Types.ObjectId(cardId));
    if (!card) return null;

    await Card.updateMany(
      { columnId: new Types.ObjectId(card.columnId) },
      { $inc: { position: -1 } }
    );

    await Card.updateMany(
      { columnId: new Types.ObjectId(targetColumnId) },
      { $inc: { position: 1 } }
    );

    return Card.findByIdAndUpdate(
      new Types.ObjectId(cardId),
      { columnId: new Types.ObjectId(targetColumnId), position: targetIndex },
      { new: true }
    );
  }
}

export const cardService = new CardService();
