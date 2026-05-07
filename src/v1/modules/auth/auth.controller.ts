import { Request, Response, NextFunction } from "express";
import { authService } from "./auth.service";
import sendResponse from "@/src/lib/sendResponse";
import { statusCodes } from "@/src/constants/statusCodes";

async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;
    const user = await authService.login(email, password);
    const otp = await authService.generateOtp(user.id);

    console.log("TODO: SEND OTP ", { otp });

    // TODO: send otp here

    return sendResponse({
      res,
      statusCode: statusCodes.OK,
      message: "OTP sent successfully",
      status: true,
      data: { userId: user.id },
    });
  } catch (err) {
    next(err);
  }
}

async function verifyOtp(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId, code } = req.body;
    await authService.verifyOtp(userId, code);

    const session = await authService.createSession(userId, req.ip, req.headers["user-agent"]);

    return sendResponse({
      res,
      status: true,
      message: "Logged in successfully",
      data: { token: session.token },
    });
  } catch (err) {
    next(err);
  }
}

async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.headers["authorization"];
    if (!token) throw new Error("No token provided");

    await authService.logout(token);

    return sendResponse({
      res,
      status: true,
      message: "Logged out successfully",
      data: null,
    });
  } catch (err) {
    next(err);
  }
}

export const authController = {
  login,
  verifyOtp,
  logout,
};
