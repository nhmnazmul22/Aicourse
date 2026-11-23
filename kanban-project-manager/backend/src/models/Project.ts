import { Schema, model, Document, Types } from "mongoose";

export interface IProject extends Document {
  name: string;
  userId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const projectSchema = new Schema<IProject>(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
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

projectSchema.index({ userId: 1, name: 1 }, { unique: true });

export const Project = model<IProject>("Project", projectSchema);
