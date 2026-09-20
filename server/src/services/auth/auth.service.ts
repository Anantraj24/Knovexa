import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../repositories/prisma.js';
import { config } from '../../config/index.js';
import { AppError } from '../../middleware/errorHandler.js';
import { RegisterInput, LoginInput } from '../../validators/auth.validator.js';
import { TokenPayload } from '../../types/index.js';

export class AuthService {
  static async register(input: RegisterInput) {
    const existing = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase() },
    });

    if (existing) {
      throw new AppError('USER_ALREADY_EXISTS', 'A user with this email already exists.', 409);
    }

    const passwordHash = await bcrypt.hash(input.password, 12);

    const user = await prisma.user.create({
      data: {
        email: input.email.toLowerCase(),
        name: input.name.trim(),
        passwordHash,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    const tokens = await this.generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return { user, ...tokens };
  }

  static async login(input: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase() },
    });

    if (!user) {
      throw new AppError('INVALID_CREDENTIALS', 'Invalid email or password.', 401);
    }

    const validPassword = await bcrypt.compare(input.password, user.passwordHash);
    if (!validPassword) {
      throw new AppError('INVALID_CREDENTIALS', 'Invalid email or password.', 401);
    }

    const tokens = await this.generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt,
      },
      ...tokens,
    };
  }

  static async logout(userId: string) {
    await prisma.refreshToken.deleteMany({
      where: { userId },
    });
    return { success: true };
  }

  static async getCurrentUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new AppError('USER_NOT_FOUND', 'User not found.', 404);
    }

    return user;
  }

  private static async generateTokens(payload: TokenPayload) {
    const accessToken = jwt.sign(payload, config.jwt.accessSecret, {
      expiresIn: '15m',
    });

    const refreshToken = jwt.sign(payload, config.jwt.refreshSecret, {
      expiresIn: '7d',
    });

    const tokenHash = await bcrypt.hash(refreshToken, 10);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await prisma.refreshToken.create({
      data: {
        userId: payload.userId,
        tokenHash,
        expiresAt,
      },
    });

    return { accessToken, refreshToken };
  }
}
