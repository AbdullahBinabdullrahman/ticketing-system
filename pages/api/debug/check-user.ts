import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "../../../lib/db/connection";
import { users } from "../../../lib/db/schema";
import { eq, and } from "drizzle-orm";

/**
 * Debug endpoint to check user existence and query
 * GET /api/debug/check-user?email=xxx
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { email } = req.query;

    if (!email || typeof email !== "string") {
      return res.status(400).json({ error: "Email parameter required" });
    }

    const results: any = {};

    // Test 1: Simple query
    console.log("Test 1: Simple query for email...");
    try {
      const user1 = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);
      results.test1 = {
        success: true,
        found: user1.length > 0,
        user: user1[0] || null,
      };
    } catch (error: any) {
      results.test1 = {
        success: false,
        error: error.message,
      };
    }

    // Test 2: Query with boolean conditions (like login does)
    console.log("Test 2: Query with boolean conditions...");
    try {
      const user2 = await db
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
      results.test2 = {
        success: true,
        found: user2.length > 0,
        user: user2[0] || null,
      };
    } catch (error: any) {
      results.test2 = {
        success: false,
        error: error.message,
        stack: error.stack,
      };
    }

    // Test 3: Check all users
    console.log("Test 3: Get all partner users...");
    try {
      const partners = await db
        .select({
          id: users.id,
          email: users.email,
          name: users.name,
          userType: users.userType,
          isActive: users.isActive,
          isDeleted: users.isDeleted,
        })
        .from(users)
        .where(eq(users.userType, "partner"))
        .limit(10);
      results.test3 = {
        success: true,
        count: partners.length,
        partners,
      };
    } catch (error: any) {
      results.test3 = {
        success: false,
        error: error.message,
      };
    }

    return res.status(200).json({
      success: true,
      email,
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Debug endpoint error:", error);
    return res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });
  }
}



