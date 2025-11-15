/**
 * Admin User Service
 * Service for creating and managing admin and operational team users
 */

import bcrypt from "bcryptjs";
import { db } from "../db/connection";
import { users, roles, NewUser } from "../db/schema";
import { eq, and, sql } from "drizzle-orm";
import emailService from "../../services/emailService";
import { logger } from "../utils/logger";

export interface CreateAdminUserInput {
  name: string;
  email: string;
  phone?: string;
  password?: string; // Optional - will auto-generate if not provided
  roleId: number; // admin or operational role
  language?: "en" | "ar";
  sendWelcomeEmail?: boolean;
}

export interface CreateAdminUserResult {
  success: boolean;
  user?: {
    id: number;
    name: string;
    email: string;
    roleId: number;
    userType: string;
    languagePreference: string;
    roleName: string;
    isActive: boolean;
    phone?: string | null;
    createdAt: Date | null;
  };
  temporaryPassword?: string; // Only set if password was auto-generated
  error?: string;
}

/**
 * Generate a secure random password
 */
function generateSecurePassword(): string {
  const uppercase = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lowercase = "abcdefghjkmnpqrstuvwxyz";
  const numbers = "23456789";
  const symbols = "!@#$%&*";

  const getRandomChar = (charset: string) =>
    charset[Math.floor(Math.random() * charset.length)];

  // Ensure at least one of each type
  const password = [
    getRandomChar(uppercase),
    getRandomChar(lowercase),
    getRandomChar(numbers),
    getRandomChar(symbols),
    ...Array.from({ length: 8 }, () =>
      getRandomChar(uppercase + lowercase + numbers + symbols)
    ),
  ];

  // Shuffle the password
  return password.sort(() => Math.random() - 0.5).join("");
}

/**
 * Create an admin or operational user with automatic password generation and optional email
 */
export async function createAdminUser(
  input: CreateAdminUserInput
): Promise<CreateAdminUserResult> {
  try {
    // 1. Validate role exists and is admin or operational
    const role = await db
      .select()
      .from(roles)
      .where(eq(roles.id, input.roleId))
      .limit(1);

    if (role.length === 0) {
      return {
        success: false,
        error: "Role not found",
      };
    }

    if (!["admin", "operational"].includes(role[0].name)) {
      return {
        success: false,
        error: "Role must be admin or operational",
      };
    }

    // 2. Check if email already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(and(eq(users.email, input.email), eq(users.isDeleted, false)))
      .limit(1);

    if (existingUser.length > 0) {
      return {
        success: false,
        error: "Email already exists",
      };
    }

    // 3. Use provided password or generate secure one
    const tempPassword = input.password || generateSecurePassword();
    const wasPasswordGenerated = !input.password;

    // 4. Hash password
    const hashedPassword = await bcrypt.hash(tempPassword, 12);

    // 5. Create user
    const newUser = await db
      .insert(users)
      .values({
        name: input.name,
        email: input.email,
        phone: input.phone || null,
        password: hashedPassword,
        roleId: input.roleId,
        userType: "admin", // All admin and operational users have userType "admin"
        partnerId: null,
        languagePreference: input.language || "en",
        isActive: true,
        isDeleted: false,
        emailVerifiedAt: new Date(), // Auto-verify for admin users
        createdAt: new Date(),
      } as NewUser)
      .returning();

    // 6. Send welcome email if requested (only if password was auto-generated)
    if (input.sendWelcomeEmail !== false && wasPasswordGenerated) {
      try {
        await emailService.sendWelcomeEmail(
          input.email,
          input.name,
          tempPassword,
          input.language || "en"
        );
        logger.info("Welcome email sent to admin user", {
          email: input.email,
          userId: newUser[0].id,
        });
      } catch (emailError) {
        logger.error("Failed to send welcome email to admin user", {
          error: emailError,
          email: input.email,
        });
        // Don't fail the user creation if email fails
      }
    }

    logger.info("Admin user created", {
      userId: newUser[0].id,
      email: input.email,
      role: role[0].name,
      passwordProvided: !wasPasswordGenerated,
    });

    return {
      success: true,
      user: {
        id: newUser[0].id,
        name: newUser[0].name,
        email: newUser[0].email,
        phone: newUser[0].phone,
        roleId: newUser[0].roleId,
        roleName: role[0].name,
        userType: newUser[0].userType,
        languagePreference: newUser[0].languagePreference || "ar",
        isActive: newUser[0].isActive || true,
        createdAt: newUser[0].createdAt,
      },
      temporaryPassword: wasPasswordGenerated ? tempPassword : undefined, // Only set if auto-generated
    };
  } catch (error) {
    logger.error("Error creating admin user", { error, input });
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get all users (admin, operational, partner, and customer)
 */
export async function getAdminUsers() {
  try {
    const { partners } = await import("../db/schema");

    const allUsers = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        phone: users.phone,
        roleId: users.roleId,
        roleName: roles.name,
        userType: users.userType,
        partnerId: users.partnerId,
        partnerName: partners.name,
        languagePreference: users.languagePreference,
        isActive: users.isActive,
        lastLoginAt: users.lastLoginAt,
        emailVerifiedAt: users.emailVerifiedAt,
        createdAt: users.createdAt,
      })
      .from(users)
      .leftJoin(roles, eq(users.roleId, roles.id))
      .leftJoin(partners, eq(users.partnerId, partners.id))
      .where(eq(users.isDeleted, false))
      .orderBy(users.createdAt);

    return allUsers;
  } catch (error) {
    logger.error("Error fetching all users", { error });
    throw error;
  }
}

/**
 * Update admin user
 */
export async function updateAdminUser(
  userId: number,
  updates: {
    name?: string;
    email?: string;
    phone?: string;
    roleId?: number;
    isActive?: boolean;
    languagePreference?: "en" | "ar";
  }
) {
  try {
    // Validate user exists and is admin type
    const existingUser = await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.id, userId),
          sql`${users.userType} = 'admin'::user_type_enum`,
          eq(users.isDeleted, false)
        )
      )
      .limit(1);

    if (existingUser.length === 0) {
      return {
        success: false,
        error: "User not found or not an admin user",
      };
    }

    // If email is being changed, check for duplicates
    if (updates.email && updates.email !== existingUser[0].email) {
      const emailExists = await db
        .select()
        .from(users)
        .where(and(eq(users.email, updates.email), eq(users.isDeleted, false)))
        .limit(1);

      if (emailExists.length > 0) {
        return {
          success: false,
          error: "Email already exists",
        };
      }
    }

    const updatedUser = await db
      .update(users)
      .set({
        ...updates,
        updatedAt: new Date(),
      } as NewUser)
      .where(eq(users.id, userId))
      .returning();

    logger.info("Admin user updated", { userId, updates });

    return {
      success: true,
      user: updatedUser[0],
    };
  } catch (error) {
    logger.error("Error updating admin user", { error, userId, updates });
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Delete (soft delete) admin user
 */
export async function deleteAdminUser(userId: number) {
  try {
    const updatedUser = await db
      .update(users)
      .set({
        isDeleted: true,
        isActive: false,
        updatedAt: new Date(),
      } as NewUser)
      .where(
        and(
          eq(users.id, userId),
          sql`${users.userType} = 'admin'::user_type_enum`
        )
      )
      .returning();

    if (updatedUser.length === 0) {
      return {
        success: false,
        error: "User not found or not an admin user",
      };
    }

    logger.info("Admin user deleted (soft delete)", { userId });

    return {
      success: true,
    };
  } catch (error) {
    logger.error("Error deleting admin user", { error, userId });
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get available roles for admin users (admin and operational)
 */
export async function getAdminRoles() {
  try {
    const adminRoles = await db
      .select()
      .from(roles)
      .where(sql`${roles.name} IN ('admin', 'operational')`);

    return adminRoles;
  } catch (error) {
    logger.error("Error fetching admin roles", { error });
    throw error;
  }
}
