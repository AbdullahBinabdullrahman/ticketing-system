/**
 * Fix Admin Permissions Script
 * Ensures admin role has all required permissions
 */

import { db } from "../lib/db/connection";
import { roles, permissions, rolePermissions, users } from "../lib/db/schema";
import { eq } from "drizzle-orm";

async function fixAdminPermissions() {
  console.log("🔧 Fixing admin role permissions...\n");

  try {
    // Get admin role
    const adminRole = await db
      .select()
      .from(roles)
      .where(eq(roles.name, "admin"))
      .limit(1);

    if (adminRole.length === 0) {
      console.error("❌ Admin role not found!");
      process.exit(1);
    }

    // Get admin user
    const adminUser = await db
      .select()
      .from(users)
      .where(eq(users.email, "admin@ticketing.com"))
      .limit(1);

    if (adminUser.length === 0) {
      console.error("❌ Admin user not found!");
      process.exit(1);
    }

    console.log(`✅ Found admin role (ID: ${adminRole[0].id})`);
    console.log(`✅ Found admin user (ID: ${adminUser[0].id})\n`);

    // Get all permissions
    const allPermissions = await db.select().from(permissions);
    console.log(`📋 Total permissions in system: ${allPermissions.length}\n`);

    // Get current admin role permissions
    const currentRolePerms = await db
      .select()
      .from(rolePermissions)
      .where(eq(rolePermissions.roleId, adminRole[0].id));

    console.log(`📊 Current admin permissions: ${currentRolePerms.length}`);

    // Find missing permissions
    const existingPermIds = new Set(
      currentRolePerms.map((rp) => rp.permissionId)
    );
    const missingPermissions = allPermissions.filter(
      (p) => !existingPermIds.has(p.id)
    );

    if (missingPermissions.length === 0) {
      console.log("\n✅ Admin already has all permissions!");
      
      // List all permissions
      console.log("\n📝 Admin permissions:");
      for (const rp of currentRolePerms) {
        const perm = allPermissions.find((p) => p.id === rp.permissionId);
        if (perm) {
          console.log(`   - ${perm.name}: ${perm.description}`);
        }
      }
      
      return;
    }

    console.log(`\n⚠️  Missing ${missingPermissions.length} permissions:\n`);
    missingPermissions.forEach((p) => {
      console.log(`   - ${p.name}: ${p.description}`);
    });

    // Add missing permissions
    console.log("\n🔄 Adding missing permissions...");
    for (const perm of missingPermissions) {
      await db.insert(rolePermissions).values({
        roleId: adminRole[0].id,
        permissionId: perm.id,
        createdById: adminUser[0].id,
      } as any);
      console.log(`   ✅ Added: ${perm.name}`);
    }

    console.log("\n✅ Admin permissions fixed successfully!");
    console.log(`\n📊 Final count: ${allPermissions.length} permissions\n`);

    // Verify
    const verifyPerms = await db
      .select()
      .from(rolePermissions)
      .where(eq(rolePermissions.roleId, adminRole[0].id));

    console.log(`✅ Verified: Admin now has ${verifyPerms.length} permissions\n`);

  } catch (error) {
    console.error("❌ Error fixing permissions:", error);
    throw error;
  }
}

// Run the script
if (require.main === module) {
  fixAdminPermissions()
    .then(() => {
      console.log("✅ Script completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Script failed:", error);
      process.exit(1);
    });
}

export { fixAdminPermissions };

