import { User, type IUser } from "../models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { AppError } from "../middleware/error";

export interface PublicUser {
  id: string;
  email: string;
  name: string;
  companyname?: string;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class AuthService {
  async signup(input: {
    email: string;
    name: string;
    companyname?: string;
    password: string;
    avatarUrl?: string;
  }): Promise<{ user: PublicUser; token: string }> {
    const existing = await User.findOne({ email: input.email });
    if (existing) {
      throw new AppError("Email already registered", 409);
    }

    const passwordHash = await bcrypt.hash(input.password, 12);

    const user = await User.create({
      email: input.email,
      name: input.name,
      companyname: input.companyname,
      passwordHash,
      avatarUrl: input.avatarUrl,
    });

    const token = this.signToken(user._id.toString());

    return {
      user: this.toPublic(user),
      token,
    };
  }

  async login(input: {
    email: string;
    password: string;
  }): Promise<{ user: PublicUser; token: string }> {
    const user = await User.findOne({ email: input.email }).select("+passwordHash");
    if (!user) {
      throw new AppError("Invalid email or password", 401);
    }

    const isValid = await bcrypt.compare(input.password, user.passwordHash);
    if (!isValid) {
      throw new AppError("Invalid email or password", 401);
    }

    const token = this.signToken(user._id.toString());

    return {
      user: this.toPublic(user),
      token,
    };
  }

  logout(): { ok: boolean } {
    return { ok: true };
  }

  async getUserById(userId: string): Promise<PublicUser | null> {
    const user = await User.findById(userId);
    if (!user) return null;
    return this.toPublic(user);
  }

  private signToken(userId: string): string {
    return jwt.sign({ userId }, env.JWT_SECRET, { expiresIn: "7d" });
  }

  private toPublic(user: IUser): PublicUser {
    const id = user._id ? user._id.toString() : (user as unknown as { id?: string }).id || "";
    return {
      id,
      email: user.email,
      name: user.name,
      companyname: user.companyname,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}

export const authService = new AuthService();
