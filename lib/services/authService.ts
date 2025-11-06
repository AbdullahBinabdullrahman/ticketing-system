import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";
import { db } from "../db/connection";
import {
  users,
  userSessions,
  customers,
  NewUser,
  UserSessions,
  NewCustomer,
} from "../db/schema";
import { eq, and } from "drizzle-orm";
import { AppError, ErrorCodes } from "../utils/errorHandler";
import { logger } from "../utils/logger";
import type {
  RegisterInput,
  LoginInput,
  ChangePasswordInput,
  UpdateProfileInput,
} from "../../schemas/auth";

const JWT_SECRET = process.env.JWT_SECRET as string;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET as string;
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN || "15m") as string;
const JWT_REFRESH_EXPIRES_IN = (process.env.JWT_REFRESH_EXPIRES_IN ||
  "7d") as string;

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  phone?: string;
  userType: "admin" | "partner" | "customer";
  roleId: number;
  partnerId?: number;
  languagePreference?: string;
  emailVerifiedAt?: Date;
  phoneVerifiedAt?: Date;
  lastLoginAt?: Date;
  createdAt: Date;
}

export class AuthService {
  /**
   * Register a new customer user
   */
  async register(
    data: RegisterInput
  ): Promise<{ user: UserProfile; tokens: AuthTokens }> {
    try {
      logger.info("Starting user registration", { email: data.email });

      // Check if user already exists
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.email, data.email))
        .limit(1);

      if (existingUser.length > 0) {
        throw new AppError(
          "User with this email already exists",
          400,
          ErrorCodes.DUPLICATE_ENTRY
        );
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(data.password, 12);

      // Create user
      const newUser = await db
        .insert(users)
        .values({
          name: data.name,
          email: data.email,
          phone: data.phone,
          password: hashedPassword,
          roleId: 4, // customer role ID (assuming it's 4 from seed data)
          userType: data.userType,
          languagePreference: data.languagePreference,
          emailVerifiedAt: new Date(), // Auto-verify for now
        } as NewUser)
        .returning();

      // Create customer profile
      await db.insert(customers).values({
        userId: newUser[0].id,
        phone: data.phone,
        preferredLanguage: data.languagePreference,
      });

      // Generate tokens
      const tokens = await this.generateTokens(newUser[0].id);

      // Update last login
      await db
        .update(users)
        .set({ lastLoginAt: new Date() } as Partial<NewUser>)
        .where(eq(users.id, newUser[0].id));

      const userProfile: UserProfile = {
        id: newUser[0].id,
        name: newUser[0].name,
        email: newUser[0].email,
        phone: newUser[0].phone || undefined,
        userType: newUser[0].userType,
        roleId: newUser[0].roleId,
        partnerId: newUser[0].partnerId || undefined,
        languagePreference: newUser[0].languagePreference || undefined,
        emailVerifiedAt: newUser[0].emailVerifiedAt || undefined,
        phoneVerifiedAt: newUser[0].phoneVerifiedAt || undefined,
        lastLoginAt: newUser[0].lastLoginAt || undefined,
        createdAt: newUser[0].createdAt!,
      };

      logger.info("User registered successfully", {
        userId: newUser[0].id,
        email: data.email,
      });

      return { user: userProfile, tokens };
    } catch (error) {
      logger.error("Registration failed", {
        error: error instanceof Error ? error.message : "Unknown error",
        email: data.email,
      });
      throw error;
    }
  }

  /**
   * Login user
   */
  async login(
    data: LoginInput,
    deviceInfo?: string,
    ipAddress?: string
  ): Promise<{ user: UserProfile; tokens: AuthTokens }> {
    try {
      logger.info("Starting user login", { email: data.email });

      // Find user
      const user = await db
        .select()
        .from(users)
        .where(
          and(
            eq(users.email, data.email),
            eq(users.isActive, true),
            eq(users.isDeleted, false)
          )
        )
        .limit(1);

      if (user.length === 0) {
        throw new AppError(
          "Invalid credentials",
          401,
          ErrorCodes.INVALID_CREDENTIALS
        );
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(
        data.password,
        user[0].password
      );
      if (!isValidPassword) {
        throw new AppError(
          "Invalid credentials",
          401,
          ErrorCodes.INVALID_CREDENTIALS
        );
      }

      // Generate tokens
      const tokens = await this.generateTokens(
        user[0].id,
        deviceInfo,
        ipAddress
      );

      // Update last login
      await db
        .update(users)
        .set({ lastLoginAt: new Date() } as Partial<NewUser>)
        .where(eq(users.id, user[0].id));

      const userProfile: UserProfile = {
        id: user[0].id,
        name: user[0].name,
        email: user[0].email,
        phone: user[0].phone || undefined,
        userType: user[0].userType,
        roleId: user[0].roleId,
        partnerId: user[0].partnerId || undefined,
        languagePreference: user[0].languagePreference || undefined,
        emailVerifiedAt: user[0].emailVerifiedAt || undefined,
        phoneVerifiedAt: user[0].phoneVerifiedAt || undefined,
        lastLoginAt: user[0].lastLoginAt || undefined,
        createdAt: user[0].createdAt!,
      };

      logger.info("User logged in successfully", {
        userId: user[0].id,
        email: data.email,
      });

      return { user: userProfile, tokens };
    } catch (error) {
      logger.error("Login failed", {
        error: error instanceof Error ? error.message : "Unknown error",
        email: data.email,
      });
      throw error;
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<{ tokens: AuthTokens }> {
    try {
      logger.info("Refreshing token");

      // Verify refresh token
      const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as {
        userId: number;
        sessionId: string;
      };

      // Find session
      const session = await db
        .select()
        .from(userSessions)
        .where(
          and(
            eq(userSessions.refreshToken, refreshToken),
            eq(userSessions.isActive, true)
          )
        )
        .limit(1);

      if (session.length === 0) {
        throw new AppError(
          "Invalid refresh token",
          401,
          ErrorCodes.TOKEN_INVALID
        );
      }

      // Check if session is expired
      if (session[0].expiresAt < new Date()) {
        throw new AppError(
          "Refresh token expired",
          401,
          ErrorCodes.TOKEN_EXPIRED
        );
      }

      // Generate new tokens
      const tokens = await this.generateTokens(
        decoded.userId,
        session[0].deviceInfo || undefined,
        session[0].ipAddress || undefined
      );

      logger.info("Token refreshed successfully", { userId: decoded.userId });

      return { tokens };
    } catch (error) {
      logger.error("Token refresh failed", {
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  }

  /**
   * Logout user
   */
  async logout(refreshToken: string): Promise<void> {
    try {
      logger.info("Logging out user");

      // Deactivate session
      (await db
        .update(userSessions)
        .set({ isActive: false } as Partial<UserSessions>)
        .where(eq(userSessions.refreshToken, refreshToken))) as Promise<{
        rowCount: number;
      }>;

      logger.info("User logged out successfully");
    } catch (error) {
      logger.error("Logout failed", {
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  }

  /**
   * Get user profile
   */
  async getUserProfile(userId: number): Promise<UserProfile> {
    try {
      const user = await db
        .select()
        .from(users)
        .where(
          and(
            eq(users.id, userId),
            eq(users.isActive, true),
            eq(users.isDeleted, false)
          )
        )
        .limit(1);

      if (user.length === 0) {
        throw new AppError("User not found", 404, ErrorCodes.USER_NOT_FOUND);
      }

      const userProfile: UserProfile = {
        id: user[0].id,
        name: user[0].name,
        email: user[0].email,
        phone: user[0].phone || undefined,
        userType: user[0].userType,
        roleId: user[0].roleId,
        partnerId: user[0].partnerId || undefined,
        languagePreference: user[0].languagePreference || undefined,
        emailVerifiedAt: user[0].emailVerifiedAt || undefined,
        phoneVerifiedAt: user[0].phoneVerifiedAt || undefined,
        lastLoginAt: user[0].lastLoginAt || undefined,
        createdAt: user[0].createdAt!,
      };

      return userProfile;
    } catch (error) {
      logger.error("Get user profile failed", {
        error: error instanceof Error ? error.message : "Unknown error",
        userId,
      });
      throw error;
    }
  }

  /**
   * Change user password
   */
  async changePassword(
    userId: number,
    data: ChangePasswordInput
  ): Promise<void> {
    try {
      logger.info("Changing user password", { userId });

      // Get user
      const user = await db
        .select()
        .from(users)
        .where(
          and(
            eq(users.id, userId),
            eq(users.isActive, true),
            eq(users.isDeleted, false)
          )
        )
        .limit(1);

      if (user.length === 0) {
        throw new AppError("User not found", 404, ErrorCodes.USER_NOT_FOUND);
      }

      // Verify current password
      const isValidPassword = await bcrypt.compare(
        data.currentPassword,
        user[0].password
      );
      if (!isValidPassword) {
        throw new AppError(
          "Current password is incorrect",
          400,
          ErrorCodes.INVALID_CREDENTIALS
        );
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(data.newPassword, 12);

      // Update password
      await db
        .update(users)
        .set({
          password: hashedPassword,
          updatedAt: new Date(),
        } as Partial<NewUser>)
        .where(eq(users.id, userId));

      logger.info("Password changed successfully", { userId });
    } catch (error) {
      logger.error("Change password failed", {
        error: error instanceof Error ? error.message : "Unknown error",
        userId,
      });
      throw error;
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(
    userId: number,
    data: UpdateProfileInput
  ): Promise<UserProfile> {
    try {
      logger.info("Updating user profile", { userId });

      // Update user
      const updatedUser = await db
        .update(users)
        .set({
          ...data,
          updatedAt: new Date(),
        } as Partial<NewUser>)
        .where(
          and(
            eq(users.id, userId),
            eq(users.isActive, true),
            eq(users.isDeleted, false)
          )
        )
        .returning();

      if (updatedUser.length === 0) {
        throw new AppError("User not found", 404, ErrorCodes.USER_NOT_FOUND);
      }

      // Update customer profile if applicable
      if (data.phone && updatedUser[0].userType === "customer") {
        await db
          .update(customers)
          .set({
            phone: data.phone,
            preferredLanguage:
              data.languagePreference || updatedUser[0].languagePreference,
            updatedAt: new Date(),
          } as Partial<NewCustomer>)
          .where(eq(customers.userId, userId));
      }

      const userProfile: UserProfile = {
        id: updatedUser[0].id,
        name: updatedUser[0].name,
        email: updatedUser[0].email,
        phone: updatedUser[0].phone || undefined,
        userType: updatedUser[0].userType,
        roleId: updatedUser[0].roleId,
        partnerId: updatedUser[0].partnerId || undefined,
        languagePreference: updatedUser[0].languagePreference || undefined,
        emailVerifiedAt: updatedUser[0].emailVerifiedAt || undefined,
        phoneVerifiedAt: updatedUser[0].phoneVerifiedAt || undefined,
        lastLoginAt: updatedUser[0].lastLoginAt || undefined,
        createdAt: updatedUser[0].createdAt!,
      };

      logger.info("Profile updated successfully", { userId });

      return userProfile;
    } catch (error) {
      logger.error("Update profile failed", {
        error: error instanceof Error ? error.message : "Unknown error",
        userId,
      });
      throw error;
    }
  }

  /**
   * Generate JWT tokens
   */
  private async generateTokens(
    userId: number,
    deviceInfo?: string,
    ipAddress?: string
  ): Promise<AuthTokens> {
    const sessionId = `session_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    // Create access token
    const accessToken = jwt.sign(
      { userId, sessionId } as Record<string, unknown>,
      JWT_SECRET,
      {
        expiresIn: JWT_EXPIRES_IN,
      } as SignOptions
    );

    // Create refresh token
    const refreshToken = jwt.sign(
      { userId, sessionId } as Record<string, unknown>,
      JWT_REFRESH_SECRET,
      {
        expiresIn: JWT_REFRESH_EXPIRES_IN,
      } as SignOptions
    );

    // Calculate expiration time
    const expiresIn = this.getTokenExpirationTime(JWT_EXPIRES_IN);

    // Store session
    await db.insert(userSessions).values({
      userId,
      token: accessToken,
      refreshToken,
      expiresAt: new Date(
        Date.now() + this.getTokenExpirationTime(JWT_REFRESH_EXPIRES_IN) * 1000
      ),
      deviceInfo,
      ipAddress,
    });

    return {
      accessToken,
      refreshToken,
      expiresIn,
    };
  }

  /**
   * Get token expiration time in seconds
   */
  private getTokenExpirationTime(expiresIn: string): number {
    const unit = expiresIn.slice(-1);
    const value = parseInt(expiresIn.slice(0, -1));

    switch (unit) {
      case "s":
        return value;
      case "m":
        return value * 60;
      case "h":
        return value * 60 * 60;
      case "d":
        return value * 24 * 60 * 60;
      default:
        return 15 * 60; // 15 minutes default
    }
  }

  /**
   * Verify access token
   */
  async verifyToken(
    token: string
  ): Promise<{ userId: number; sessionId: string }> {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as {
        userId: number;
        sessionId: string;
      };

      // Check if session exists and is active
      const session = await db
        .select()
        .from(userSessions)
        .where(
          and(eq(userSessions.token, token), eq(userSessions.isActive, true))
        )
        .limit(1);

      if (session.length === 0) {
        throw new AppError("Invalid token", 401, ErrorCodes.TOKEN_INVALID);
      }

      return decoded;
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new AppError("Invalid token", 401, ErrorCodes.TOKEN_INVALID);
      }
      if (error instanceof jwt.TokenExpiredError) {
        throw new AppError("Token expired", 401, ErrorCodes.TOKEN_EXPIRED);
      }
      throw error;
    }
  }

  /**
   * Generate password reset token
   */
  async generatePasswordResetToken(email: string): Promise<string> {
    try {
      logger.info("Generating password reset token", { email });

      // Find user by email
      const user = await db
        .select()
        .from(users)
        .where(
          and(
            eq(users.email, email),
            eq(users.isActive, true),
            eq(users.isDeleted, false)
          )
        )
        .limit(1);

      // Generate reset token (valid for 1 hour) - only if user exists
      let resetToken = "";
      
      if (user.length > 0) {
        resetToken = jwt.sign(
          {
            userId: user[0].id,
            email: user[0].email,
            type: "password_reset",
          },
          JWT_SECRET,
          { expiresIn: "1h" }
        );
        logger.info("Password reset token generated", { email, userId: user[0].id });
      } else {
        // For security, don't reveal if user doesn't exist
        logger.info("Password reset requested for non-existent email", { email });
      }

      return resetToken;
    } catch (error) {
      logger.error("Generate password reset token failed", {
        error: error instanceof Error ? error.message : "Unknown error",
        email,
      });
      throw error;
    }
  }

  /**
   * Verify password reset token
   */
  async verifyPasswordResetToken(
    token: string
  ): Promise<{ userId: number; email: string }> {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as {
        userId: number;
        email: string;
        type: string;
      };

      if (decoded.type !== "password_reset") {
        throw new AppError("Invalid reset token", 400, ErrorCodes.INVALID_TOKEN);
      }

      // Verify user still exists and is active
      const user = await db
        .select()
        .from(users)
        .where(
          and(
            eq(users.id, decoded.userId),
            eq(users.isActive, true),
            eq(users.isDeleted, false)
          )
        )
        .limit(1);

      if (user.length === 0) {
        throw new AppError("User not found or inactive", 404, ErrorCodes.USER_NOT_FOUND);
      }

      return { userId: decoded.userId, email: decoded.email };
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new AppError(
          "Reset token has expired",
          400,
          ErrorCodes.EXPIRED_TOKEN
        );
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new AppError("Invalid reset token", 400, ErrorCodes.INVALID_TOKEN);
      }
      throw error;
    }
  }

  /**
   * Reset password using token
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      logger.info("Resetting password");

      // Verify token and get user info
      const { userId } = await this.verifyPasswordResetToken(token);

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 12);

      // Update password
      await db
        .update(users)
        .set({
          password: hashedPassword,
          updatedAt: new Date(),
        } as Partial<NewUser>)
        .where(eq(users.id, userId));

      // Invalidate all existing sessions for security
      await db
        .update(userSessions)
        .set({
          isActive: false,
          updatedAt: new Date(),
        })
        .where(eq(userSessions.userId, userId));

      logger.info("Password reset successfully", { userId });
    } catch (error) {
      logger.error("Reset password failed", {
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  }
}

export const authService = new AuthService();
