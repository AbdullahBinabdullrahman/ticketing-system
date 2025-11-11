import { db } from "../lib/db/connection";
import { users } from "../lib/db/schema";
import { eq } from "drizzle-orm";

async function verifyDatabase() {
  console.log("Verifying database connection and schema...\n");

  try {
    // Test 1: Check if we can query the users table
    console.log("Test 1: Querying users table...");
    const allUsers = await db.select().from(users).limit(5);
    console.log(`✅ Found ${allUsers.length} users`);
    if (allUsers.length > 0) {
      console.log("Sample user:", {
        id: allUsers[0].id,
        email: allUsers[0].email,
        userType: allUsers[0].userType,
        isActive: allUsers[0].isActive,
        isDeleted: allUsers[0].isDeleted,
      });
    }

    // Test 2: Check if the specific partner account exists
    console.log("\nTest 2: Looking for partner account a.maher.bina@gmail.com...");
    const partnerUser = await db
      .select()
      .from(users)
      .where(eq(users.email, "a.maher.bina@gmail.com"))
      .limit(1);

    if (partnerUser.length > 0) {
      console.log("✅ Partner account found:");
      console.log({
        id: partnerUser[0].id,
        name: partnerUser[0].name,
        email: partnerUser[0].email,
        userType: partnerUser[0].userType,
        partnerId: partnerUser[0].partnerId,
        isActive: partnerUser[0].isActive,
        isDeleted: partnerUser[0].isDeleted,
        roleId: partnerUser[0].roleId,
      });
    } else {
      console.log("❌ Partner account NOT found");
      console.log("Available partner accounts:");
      const partners = await db
        .select()
        .from(users)
        .where(eq(users.userType, "partner"))
        .limit(5);
      partners.forEach((p) => console.log(`  - ${p.email} (${p.name})`));
    }

    // Test 3: Try the exact query from the error
    console.log("\nTest 3: Testing exact login query...");
    const loginQuery = await db
      .select()
      .from(users)
      .where(eq(users.email, "a.maher.bina@gmail.com"))
      .limit(1);

    console.log(`✅ Query executed successfully, found ${loginQuery.length} result(s)`);

  } catch (error) {
    console.error("❌ Database error:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
  } finally {
    process.exit(0);
  }
}

verifyDatabase();



