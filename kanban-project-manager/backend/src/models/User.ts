import { Schema, model, Document } from "mongoose";

export interface IUser extends Document {
  email: string;
  name: string;
  companyname?: string;
  passwordHash: string;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    companyname: { type: String, trim: true },
    passwordHash: { type: String, required: true },
    avatarUrl: { type: String },
  },
  { timestamps: true }
);

export const User = model<IUser>("User", userSchema);
