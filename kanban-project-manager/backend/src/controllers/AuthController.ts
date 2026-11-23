import { Request, Response, NextFunction } from "express";
import { authService } from "../services/AuthService";

export class AuthController {
  signup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { user, token } = await authService.signup(req.body);
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: "/",
      });
      res.status(201).json({ user });
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { user, token } = await authService.login(req.body);
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: "/",
      });
      res.status(200).json({ user });
    } catch (error) {
      next(error);
    }
  };

  logout = async (_req: Request, res: Response): Promise<void> => {
    res.clearCookie("token", { path: "/" });
    res.status(200).json({ ok: true });
  };

  me = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as Request & { user?: { userId: string } }).user?.userId;
      if (!userId) {
        const err = new Error("Unauthorized") as Error & { statusCode?: number };
        err.statusCode = 401;
        throw err;
      }
      const user = await authService.getUserById(userId);
      if (!user) {
        const err = new Error("User not found") as Error & { statusCode?: number };
        err.statusCode = 404;
        throw err;
      }
      res.status(200).json({ user });
    } catch (error) {
      next(error);
    }
  };
}

export const authController = new AuthController();
