import { Router } from "express";
import { authController } from "./auth.controller";
import { validateBody } from "@/src/middlewares/validate";
import { loginSchema, registerSchema, verifyOtpSchema } from "./auth.validation";

const authRouter = Router();

authRouter.post("/login", validateBody(loginSchema), authController.login);
authRouter.post("/register", validateBody(registerSchema), authController.register);
authRouter.post("/verify-otp", validateBody(verifyOtpSchema), authController.verifyOtp);
authRouter.post("/logout", authController.logout);

export default authRouter;
