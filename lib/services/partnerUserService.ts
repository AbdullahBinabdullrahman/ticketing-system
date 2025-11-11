/**
 * Partner User Service
 * Utility service for creating and managing partner users
 */

import bcrypt from "bcryptjs";
import { db } from "../db/connection";
import { users, roles, partners } from "../db/schema";
import { eq, and } from "drizzle-orm";
import emailService from "../../services/emailService";
import { logger } from "../utils/logger";

export interface CreatePartnerUserInput {
  partnerId: number;
  name: string;
  email: string;
  phone?: string;
  password?: string; // Optional - will auto-generate if not provided
  language?: "en" | "ar";
  sendWelcomeEmail?: boolean;
}

export interface CreatePartnerUserResult {
  success: boolean;
  user?: any;
  password?: string; // Deprecated: use temporaryPassword
  temporaryPassword?: string; // Only set if password was auto-generated
  error?: string;
}

/**
 * Generate a secure random password
 */
function generateSecurePassword(): string {
  const length = 12;
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  let password = "";
  
  // Ensure at least one uppercase, lowercase, number, and special char
  password += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random() * 26)];
  password += "abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 26)];
  password += "0123456789"[Math.floor(Math.random() * 10)];
  password += "!@#$%^&*"[Math.floor(Math.random() * 8)];
  
  // Fill remaining characters
  for (let i = password.length; i < length; i++) {
    password += charset[Math.floor(Math.random() * charset.length)];
  }
  
  // Shuffle the password
  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
}

/**
 * Create a partner user with automatic password generation and optional email
 */
export async function createPartnerUser(
  input: CreatePartnerUserInput
): Promise<CreatePartnerUserResult> {
  try {
    // 1. Validate partner exists
    const partnerExists = await db
      .select()
      .from(partners)
      .where(
        and(
          eq(partners.id, input.partnerId),
          eq(partners.isActive, true),
          eq(partners.isDeleted, false)
        )
      )
      .limit(1);

    if (partnerExists.length === 0) {
      return {
        success: false,
        error: "Partner not found or inactive",
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

    // 3. Get partner role
    const partnerRole = await db
      .select()
      .from(roles)
      .where(eq(roles.name, "partner"))
      .limit(1);

    if (partnerRole.length === 0) {
      return {
        success: false,
        error: "Partner role not found",
      };
    }

    // 4. Use provided password or generate secure one
    const tempPassword = input.password || generateSecurePassword();
    const hashedPassword = await bcrypt.hash(tempPassword, 12);
    const wasPasswordGenerated = !input.password;

    // 5. Create user
    const newUser = await db
      .insert(users)
      .values({
        name: input.name,
        email: input.email,
        phone: input.phone || null,
        password: hashedPassword,
        roleId: partnerRole[0].id,
        userType: "partner",
        partnerId: input.partnerId,
        languagePreference: input.language || "en",
        isActive: true,
        isDeleted: false,
        emailVerifiedAt: new Date(), // Auto-verify for partner users
        createdAt: new Date(),
      } as any)
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
        logger.info("Welcome email sent", {
          email: input.email,
          userId: newUser[0].id,
        });
      } catch (emailError) {
        logger.error("Failed to send welcome email", {
          error: emailError,
          email: input.email,
        });
        // Don't fail the user creation if email fails
      }
    }

    logger.info("Partner user created", {
      userId: newUser[0].id,
      email: input.email,
      partnerId: input.partnerId,
      passwordProvided: !wasPasswordGenerated,
    });

    return {
      success: true,
      user: {
        id: newUser[0].id,
        name: newUser[0].name,
        email: newUser[0].email,
        phone: newUser[0].phone,
        partnerId: newUser[0].partnerId,
        languagePreference: newUser[0].languagePreference,
        createdAt: newUser[0].createdAt,
      },
      password: tempPassword, // Deprecated: Return for logging/display purposes
      temporaryPassword: wasPasswordGenerated ? tempPassword : undefined, // Only set if auto-generated
    };
  } catch (error) {
    logger.error("Error creating partner user", { error, input });
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Create multiple partner users at once (bulk creation)
 */
export async function createPartnerUsersBulk(
  inputs: CreatePartnerUserInput[]
): Promise<CreatePartnerUserResult[]> {
  const results: CreatePartnerUserResult[] = [];

  for (const input of inputs) {
    const result = await createPartnerUser(input);
    results.push(result);
  }

  return results;
}

/**
 * Quick helper to create a test partner user
 * Usage: const result = await createTestPartnerUser(1);
 */
export async function createTestPartnerUser(
  partnerId: number,
  index: number = 1
): Promise<CreatePartnerUserResult> {
  return createPartnerUser({
    partnerId,
    name: `Test Partner User ${index}`,
    email: `partner${index}@test.com`,
    phone: `+96650000000${index}`,
    language: "en",
    sendWelcomeEmail: false, // Don't send emails for test users
  });
}

