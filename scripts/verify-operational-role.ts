/**
 * Verify and fix operational role in database
 * Run this script to ensure the operational role exists correctly
 */

import { db } from "../lib/db/connection";
import { roles } from "../lib/db/schema";
import { eq, sql } from "drizzle-orm";

async function verifyOperationalRole() {
  console.log("🔍 Checking operational role...\n");

  try {
    // Check for 'operation' role (old/incorrect name)
    const operationRole = await db
      .select()
      .from(roles)
      .where(eq(roles.name, "operation"));

    if (operationRole.length > 0) {
      console.log("⚠️  Found 'operation' role (incorrect name)");
      console.log("   Fixing to 'operational'...\n");

      await db
        .update(roles)
        .set({
          name: "operational",
          description: "Operations team member",
          updatedAt: new Date(),
        } as any)
        .where(eq(roles.name, "operation"));

      console.log("✅ Fixed role name from 'operation' to 'operational'\n");
    }

    // Check for 'operational' role (correct name)
    const operationalRole = await db
      .select()
      .from(roles)
      .where(eq(roles.name, "operational"));

    if (operationalRole.length === 0) {
      console.log("⚠️  Operational role not found. Creating...\n");

      await db
        .insert(roles)
        .values({
          name: "operational",
          description: "Operations team member",
          isActive: true,
          isDeleted: false,
        } as any);

      console.log("✅ Created operational role\n");
    } else {
      console.log("✅ Operational role exists correctly\n");
      console.log(`   Role ID: ${operationalRole[0].id}`);
      console.log(`   Description: ${operationalRole[0].description}\n`);
    }

    // List all roles
    console.log("📋 Current roles in database:");
    const allRoles = await db
      .select()
      .from(roles)
      .where(eq(roles.isDeleted, false))
      .orderBy(roles.name);

    allRoles.forEach((role) => {
      console.log(`   - ${role.name} (ID: ${role.id})`);
    });

    console.log("\n✅ Verification complete!");
  } catch (error) {
    console.error("❌ Error:", error);
    throw error;
  }
}

// Run verification if this file is executed directly
if (require.main === module) {
  verifyOperationalRole()
    .then(() => {
      console.log("\nDone!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\nFailed:", error);
      process.exit(1);
    });
}

export { verifyOperationalRole };

