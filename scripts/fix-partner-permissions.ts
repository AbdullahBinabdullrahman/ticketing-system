/**
 * Script to fix partner role permissions
 * Ensures all partner users have the correct permissions
 */

import { db } from "../lib/db/connection";
import { roles, permissions, rolePermissions, users } from "../lib/db/schema";
import { eq, and, sql, inArray } from "drizzle-orm";

async function fixPartnerPermissions() {
  console.log("🔧 Fixing partner role permissions...\n");

  try {
    // 1. Get partner role
    const partnerRole = await db
      .select()
      .from(roles)
      .where(eq(roles.name, "partner"))
      .limit(1);

    if (partnerRole.length === 0) {
      console.error("❌ Partner role not found!");
      return;
    }

    console.log(`✅ Found partner role (ID: ${partnerRole[0].id})\n`);

    // 2. Get required permissions
    const requiredPermissions = ["request_view", "request_update", "notification_view"];
    
    const permissionsList = await db
      .select()
      .from(permissions)
      .where(
        and(
          inArray(permissions.name, requiredPermissions),
          eq(permissions.isDeleted, false)
        )
      );

    console.log(`✅ Found ${permissionsList.length} required permissions:\n`);
    permissionsList.forEach(p => console.log(`   - ${p.name} (ID: ${p.id})`));
    console.log();

    // 3. Check existing role permissions
    const existingRolePermissions = await db
      .select()
      .from(rolePermissions)
      .where(eq(rolePermissions.roleId, partnerRole[0].id));

    console.log(`📋 Existing role permissions: ${existingRolePermissions.length}\n`);

    // 4. Add missing permissions
    for (const perm of permissionsList) {
      const exists = existingRolePermissions.find(
        rp => rp.permissionId === perm.id && rp.isDeleted === false
      );

      if (!exists) {
        console.log(`➕ Adding permission: ${perm.name}`);
        await db.insert(rolePermissions).values({
          roleId: partnerRole[0].id,
          permissionId: perm.id,
          isActive: true,
          isDeleted: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as any);
      } else if (!exists.isActive) {
        console.log(`🔄 Activating permission: ${perm.name}`);
        await db
          .update(rolePermissions)
          .set({ isActive: true, isDeleted: false, updatedAt: new Date() })
          .where(eq(rolePermissions.id, exists.id));
      } else {
        console.log(`✓  Permission already active: ${perm.name}`);
      }
    }

    // 5. Check partner users
    console.log("\n👥 Checking partner users...\n");
    const partnerUsers = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        roleId: users.roleId,
      })
      .from(users)
      .where(
        and(
          sql`${users.userType} = 'partner'::user_type_enum`,
          eq(users.isDeleted, false)
        )
      );

    console.log(`Found ${partnerUsers.length} partner users:\n`);
    partnerUsers.forEach(u => {
      console.log(`   - ${u.name} (${u.email}) - Role ID: ${u.roleId}`);
    });

    // 6. Update users with wrong role
    const usersToFix = partnerUsers.filter(u => u.roleId !== partnerRole[0].id);
    
    if (usersToFix.length > 0) {
      console.log(`\n🔧 Fixing ${usersToFix.length} users with incorrect role...\n`);
      for (const user of usersToFix) {
        console.log(`   Updating user: ${user.name}`);
        await db
          .update(users)
          .set({ roleId: partnerRole[0].id, updatedAt: new Date() })
          .where(eq(users.id, user.id));
      }
    }

    console.log("\n✅ Partner permissions fixed successfully!\n");
    console.log("📊 Summary:");
    console.log(`   - Partner role ID: ${partnerRole[0].id}`);
    console.log(`   - Required permissions: ${requiredPermissions.length}`);
    console.log(`   - Partner users: ${partnerUsers.length}`);
    console.log(`   - Users fixed: ${usersToFix.length}\n`);

  } catch (error) {
    console.error("❌ Error fixing permissions:", error);
    throw error;
  }
}

// Run the script
fixPartnerPermissions().catch(console.error);

