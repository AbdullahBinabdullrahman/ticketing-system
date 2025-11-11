/**
 * Setup External Customer Script
 * 
 * Creates an external customer user for admin-created requests.
 * This customer is used when admins create requests on behalf of customers
 * who don't have accounts in the system.
 */

import { db } from "../lib/db/connection";
import { users, customers, roles } from "../lib/db/schema";
import { eq, and } from "drizzle-orm";
import bcrypt from "bcryptjs";

async function setupExternalCustomer() {
  console.log("🔧 Setting up external customer...");

  try {
    const EXTERNAL_CUSTOMER_EMAIL = "external@system.internal";
    const EXTERNAL_CUSTOMER_NAME = "External Customer (System)";

    // 1. Get customer role
    const customerRole = await db
      .select()
      .from(roles)
      .where(eq(roles.name, "customer"))
      .limit(1);

    if (customerRole.length === 0) {
      console.error("❌ Customer role not found. Please run seed script first.");
      process.exit(1);
    }

    // 2. Check if external customer user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, EXTERNAL_CUSTOMER_EMAIL))
      .limit(1);

    let externalUserId: number;

    if (existingUser.length > 0) {
      console.log("✅ External customer user already exists");
      externalUserId = existingUser[0].id;
    } else {
      console.log("Creating external customer user...");
      
      // Create a secure random password (won't be used, but required)
      const hashedPassword = await bcrypt.hash(
        Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2),
        12
      );

      const newUser = await db
        .insert(users)
        .values({
          name: EXTERNAL_CUSTOMER_NAME,
          email: EXTERNAL_CUSTOMER_EMAIL,
          password: hashedPassword,
          roleId: customerRole[0].id,
          userType: "customer",
          languagePreference: "en",
          emailVerifiedAt: new Date(),
          isActive: true,
          isDeleted: false,
        } as any)
        .returning();

      externalUserId = newUser[0].id;
      console.log(`✅ External customer user created with ID: ${externalUserId}`);
    }

    // 3. Check if customer profile exists
    const existingCustomer = await db
      .select()
      .from(customers)
      .where(eq(customers.userId, externalUserId))
      .limit(1);

    if (existingCustomer.length > 0) {
      console.log("✅ External customer profile already exists");
      console.log(`\n📝 External Customer ID: ${existingCustomer[0].id}`);
    } else {
      console.log("Creating external customer profile...");
      
      const newCustomer = await db
        .insert(customers)
        .values({
          userId: externalUserId,
          phone: "+966000000000",
          preferredLanguage: "en",
          isActive: true,
        } as any)
        .returning();

      console.log(`✅ External customer profile created with ID: ${newCustomer[0].id}`);
      console.log(`\n📝 External Customer ID: ${newCustomer[0].id}`);
    }

    // 4. Display environment variable instructions
    console.log("\n" + "=".repeat(60));
    console.log("📋 IMPORTANT: Add this to your .env file:");
    console.log("=".repeat(60));
    
    const finalCustomer = await db
      .select()
      .from(customers)
      .where(eq(customers.userId, externalUserId))
      .limit(1);
    
    console.log(`EXTERNAL_CUSTOMER_ID=${finalCustomer[0].id}`);
    console.log("=".repeat(60));
    
    console.log("\n✅ External customer setup completed successfully!");
  } catch (error) {
    console.error("❌ Error setting up external customer:", error);
    throw error;
  }
}

// Run the setup
setupExternalCustomer()
  .then(() => {
    console.log("Setup completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Setup failed:", error);
    process.exit(1);
  });

