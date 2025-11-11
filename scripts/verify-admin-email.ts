/**
 * Verify Admin Email Configuration
 * Checks if admin users exist in database and will receive notifications
 */

import { db } from "../lib/db/connection";
import { users } from "../lib/db/schema";
import { eq, and, sql } from "drizzle-orm";

async function verifyAdminUsers() {
  try {
    console.log("🔍 Checking for active admin users...\n");

    // Fetch all active admin users
    const adminUsers = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        userType: users.userType,
        isActive: users.isActive,
        isDeleted: users.isDeleted,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(
        and(
          sql`${users.userType} = 'admin'::user_type_enum`,
          eq(users.isActive, true),
          eq(users.isDeleted, false)
        )
      );

    if (adminUsers.length === 0) {
      console.log("❌ NO ACTIVE ADMIN USERS FOUND!");
      console.log("\nThis means email notifications will NOT be sent.");
      console.log("\n📝 To fix this, you need to:");
      console.log("   1. Create an admin user in the database");
      console.log("   2. Ensure user_type = 'admin'");
      console.log("   3. Ensure is_active = true");
      console.log("   4. Ensure is_deleted = false\n");
      process.exit(1);
    }

    console.log(`✅ Found ${adminUsers.length} active admin user(s):\n`);

    adminUsers.forEach((admin, index) => {
      console.log(`${index + 1}. Admin User:`);
      console.log(`   ID: ${admin.id}`);
      console.log(`   Name: ${admin.name}`);
      console.log(`   Email: ${admin.email}`);
      console.log(`   Type: ${admin.userType}`);
      console.log(`   Active: ${admin.isActive}`);
      console.log(`   Created: ${admin.createdAt?.toLocaleString() || "N/A"}`);
      console.log("");
    });

    // Check if xloudxnight@gmail.com is in the list
    const targetEmail = "xloudxnight@gmail.com";
    const hasTargetEmail = adminUsers.some(
      (admin) => admin.email === targetEmail
    );

    if (hasTargetEmail) {
      console.log(`✅ Target email (${targetEmail}) IS in the admin list!`);
      console.log("   Notifications WILL be sent to this email.\n");
    } else {
      console.log(
        `⚠️  Warning: Target email (${targetEmail}) is NOT in the admin list.`
      );
      console.log("   Current admin emails:");
      adminUsers.forEach((admin) => console.log(`   - ${admin.email}`));
      console.log("");
    }

    console.log("🎯 Email Notification Summary:");
    console.log(
      `   - When a partner ACCEPTS a request: ${adminUsers.length} admin(s) will be notified`
    );
    console.log(
      `   - When a partner REJECTS a request: ${adminUsers.length} admin(s) will be notified`
    );
    console.log(
      `   - Emails will be sent to: ${adminUsers
        .map((a) => a.email)
        .join(", ")}\n`
    );

    console.log("✅ Verification complete!\n");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error verifying admin users:", error);
    process.exit(1);
  }
}

// Run verification
verifyAdminUsers();
