import { Schema, model, Document, Types } from "mongoose";

export interface IBoardColumn extends Document {
  name: string;
  projectId: Types.ObjectId;
  position: number;
  createdAt: Date;
  updatedAt: Date;
}

const boardColumnSchema = new Schema<IBoardColumn>(
  {
    name: { type: String, required: true, trim: true, maxlength: 50 },
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true, index: true },
    position: { type: Number, required: true, default: 0 },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: Record<string, unknown>) => {
        if (ret._id) {
          ret.id = (ret._id as { toString(): string }).toString();
          delete ret._id;
        }
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: (_doc, ret: Record<string, unknown>) => {
        if (ret._id) {
          ret.id = (ret._id as { toString(): string }).toString();
          delete ret._id;
        }
        delete ret.__v;
        return ret;
      },
    },
  }
);

boardColumnSchema.index({ projectId: 1, position: 1 });

export const BoardColumn = model<IBoardColumn>("BoardColumn", boardColumnSchema);
