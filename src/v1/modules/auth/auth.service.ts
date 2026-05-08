import { statusCodes } from "@/src/constants/statusCodes";
import AppError from "@/src/lib/AppError";
import prisma from "@/src/lib/prisma";
import bcrypt from "bcrypt";
import moment from "moment";

type RegisterPayload = {
  name: string;
  email: string;
  mobile: string;
  password: string;
};

async function login(email: string, password: string) {
  const user = await prisma.user.findFirst({
    where: {
      email,
      isActive: true,
    },
  });

  if (!user) throw new AppError("Invalid email or password", statusCodes.UNAUTHORIZED);

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) throw new AppError("Invalid email or password", statusCodes.UNAUTHORIZED);

  return user;
}

async function register({ name, email, mobile, password }: RegisterPayload) {
  const existingActiveUser = await prisma.user.findFirst({
    where: {
      isActive: true,
      OR: [{ email }, { mobile }],
    },
  });

  if (existingActiveUser?.email === email) {
    throw new AppError("Email is already registered", statusCodes.CONFLICT);
  }

  if (existingActiveUser?.mobile === mobile) {
    throw new AppError("Mobile number is already registered", statusCodes.CONFLICT);
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const existingPendingUser = await prisma.user.findFirst({
    where: {
      email,
      isActive: false,
    },
  });

  if (existingPendingUser) {
    return prisma.user.update({
      where: { id: existingPendingUser.id },
      data: {
        name,
        mobile,
        password: hashedPassword,
      },
    });
  }

  return prisma.user.create({
    data: {
      name,
      email,
      mobile,
      password: hashedPassword,
      isActive: false,
    },
  });
}

async function generateOtp(userId: number) {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = moment().add(10, "minutes").toDate();

  await prisma.otpCode.updateMany({
    where: {
      userId,
      isUsed: false,
    },
    data: {
      isUsed: true,
    },
  });

  await prisma.otpCode.create({
    data: {
      userId,
      code,
      expiresAt,
    },
  });

  return code;
}

async function verifyOtp(userId: number, code: string) {
  const otp = await prisma.otpCode.findFirst({
    where: {
      userId,
      code,
      isUsed: false,
      expiresAt: {
        gt: new Date(),
      },
    },
    include: {
      user: true,
    },
  });

  if (!otp) throw new AppError("Invalid or expired OTP", statusCodes.UNAUTHORIZED);

  await prisma.otpCode.update({
    where: { id: otp.id },
    data: { isUsed: true },
  });

  return otp.user;
}

async function activateUser(userId: number) {
  return prisma.user.update({
    where: { id: userId },
    data: { isActive: true },
  });
}

async function createSession(userId: number, ipAddress?: string, userAgent?: string) {
  const token = crypto.randomUUID();
  const expiresAt = moment().add(7, "days").toDate();

  const session = await prisma.session.create({
    data: {
      userId,
      token,
      ipAddress,
      userAgent,
      expiresAt,
    },
  });

  return session;
}

async function logout(token: string) {
  const session = await prisma.session.findFirst({
    where: { token, isActive: true },
  });

  if (!session) throw new AppError("Session not found", statusCodes.UNAUTHORIZED);

  await prisma.session.update({
    where: { id: session.id },
    data: { isActive: false },
  });
}

export const authService = {
  login,
  register,
  generateOtp,
  verifyOtp,
  activateUser,
  createSession,
  logout,
};
