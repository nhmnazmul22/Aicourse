import { Schema, model, Document, Types } from "mongoose";

export interface ICard extends Document {
  title: string;
  details: string;
  columnId: Types.ObjectId;
  position: number;
  createdAt: Date;
  updatedAt: Date;
}

const cardSchema = new Schema<ICard>(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    details: { type: String, default: "", trim: true },
    columnId: { type: Schema.Types.ObjectId, ref: "BoardColumn", required: true, index: true },
    position: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

cardSchema.index({ columnId: 1, position: 1 });

export const Card = model<ICard>("Card", cardSchema);
