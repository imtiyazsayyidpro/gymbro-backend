import { Request, Response, NextFunction } from "express";
import { authService } from "./auth.service";
import sendResponse from "@/src/lib/sendResponse";
import { statusCodes } from "@/src/constants/statusCodes";
import { sendMail } from "@/src/lib/mail";
import { LoginOTPMail } from "@/src/lib/email-templates/LoginOTPMail/LoginOTPMail";
import { RegisterOTPMail } from "@/src/lib/email-templates/RegisterOTPMail/RegisterOTPMail";
import { WelcomeMail } from "@/src/lib/email-templates/WelcomeMail/WelcomeMail";

function getMailLogoUrl() {
  const logoUrl = process.env.MAIL_LOGO_URL;
  if (logoUrl) return logoUrl;

  const appUrl = process.env.FRONTEND_URL || process.env.APP_URL || process.env.NEXT_PUBLIC_SITE_URL || "https://gymbro.imtiyazsayyid.in";
  return `${appUrl.replace(/\/$/, "")}/assets/logo.png`;
}

async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { password } = req.body;
    const email = req.body.email.trim().toLowerCase();
    const user = await authService.login(email, password);
    const otp = await authService.generateOtp(user.id);

    await sendMail({
      to: user.email,
      subject: "Your Gymbro login code",
      html: LoginOTPMail({
        name: user.name,
        otp,
        logoSrc: getMailLogoUrl(),
      }),
      text: `Your Gymbro login code is ${otp}. It expires in 10 minutes.`,
    });

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

async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await authService.register({
      name: req.body.name.trim(),
      email: req.body.email.trim().toLowerCase(),
      mobile: req.body.mobile.trim(),
      password: req.body.password,
    });
    const otp = await authService.generateOtp(user.id);

    await sendMail({
      to: user.email,
      subject: "Verify your Gymbro account",
      html: RegisterOTPMail({
        name: user.name,
        otp,
        logoSrc: getMailLogoUrl(),
      }),
      text: `Your Gymbro registration code is ${otp}. It expires in 10 minutes.`,
    });

    return sendResponse({
      res,
      statusCode: statusCodes.CREATED,
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
    const user = await authService.verifyOtp(userId, code);
    const isRegistrationVerification = !user.isActive;
    const activeUser = isRegistrationVerification ? await authService.activateUser(user.id) : user;

    const session = await authService.createSession(activeUser.id, req.ip, req.headers["user-agent"]);

    if (isRegistrationVerification) {
      sendMail({
        to: activeUser.email,
        subject: "Welcome to Gymbro",
        html: WelcomeMail({
          name: activeUser.name,
          logoSrc: getMailLogoUrl(),
        }),
        text: `Thanks for registering, ${activeUser.name}. Your Gymbro account is ready.`,
      }).catch((err) => {
        console.error("Failed to send welcome email", err);
      });
    }

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
  register,
  verifyOtp,
  logout,
};
