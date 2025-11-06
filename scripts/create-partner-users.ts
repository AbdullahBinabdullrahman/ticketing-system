#!/usr/bin/env ts-node
/**
 * CLI Script to create partner users quickly
 *
 * Usage:
 *   npm run create-partner-user -- --partnerId=1 --name="John Doe" --email="john@example.com"
 *
 * Or run multiple:
 *   npm run create-partner-users-bulk
 */

import {
  createPartnerUser,
  createTestPartnerUser,
} from "../lib/services/partnerUserService";
import { db } from "../lib/db/connection";
import { partners } from "../lib/db/schema";
import { eq } from "drizzle-orm";

interface Args {
  partnerId?: number;
  name?: string;
  email?: string;
  phone?: string;
  language?: "en" | "ar";
  test?: boolean;
}

async function parseArgs(): Promise<Args> {
  const args: Args = {};

  process.argv.forEach((arg) => {
    if (arg.startsWith("--partnerId=")) {
      args.partnerId = parseInt(arg.split("=")[1]);
    } else if (arg.startsWith("--name=")) {
      args.name = arg.split("=")[1].replace(/['"]/g, "");
    } else if (arg.startsWith("--email=")) {
      args.email = arg.split("=")[1];
    } else if (arg.startsWith("--phone=")) {
      args.phone = arg.split("=")[1];
    } else if (arg.startsWith("--language=")) {
      args.language = arg.split("=")[1] as "en" | "ar";
    } else if (arg === "--test") {
      args.test = true;
    }
  });

  return args;
}

async function listPartners() {
  console.log("\n📋 Available Partners:");
  const allPartners = await db
    .select({
      id: partners.id,
      name: partners.name,
      email: partners.contactEmail,
      phone: partners.contactPhone,
      isActive: partners.isActive,
    })
    .from(partners)
    .where(eq(partners.isDeleted, false));

  allPartners.forEach((p) => {
    console.log(`  ${p.isActive ? "✅" : "❌"} [ID: ${p.id}] ${p.name}`);
    if (p.email) console.log(`     Email: ${p.email}`);
    if (p.phone) console.log(`     Phone: ${p.phone}`);
  });
  console.log("");
}

async function main() {
  const args = await parseArgs();

  console.log("🚀 Partner User Creator\n");

  // Show available partners
  await listPartners();

  // Create test user if --test flag is present
  if (args.test && args.partnerId) {
    console.log(`Creating test user for partner ${args.partnerId}...`);
    const result = await createTestPartnerUser(args.partnerId);

    if (result.success) {
      console.log("\n✅ Test user created successfully!");
      console.log(`   Email: ${result.user?.email}`);
      console.log(`   Password: ${result.password}`);
      console.log(`   Name: ${result.user?.name}`);
    } else {
      console.error(`\n❌ Error: ${result.error}`);
      process.exit(1);
    }
    process.exit(0);
  }

  // Create regular user
  if (!args.partnerId || !args.name || !args.email) {
    console.log("❌ Missing required arguments\n");
    console.log("Usage:");
    console.log(
      '  npm run create-partner-user -- --partnerId=1 --name="John Doe" --email="john@example.com"'
    );
    console.log("\nOptional flags:");
    console.log('  --phone="+966501234567"');
    console.log('  --language="en" or "ar"');
    console.log("  --test (creates a test user without email)");
    console.log("\nExamples:");
    console.log("  # Create test user:");
    console.log("  npm run create-partner-user -- --partnerId=1 --test");
    console.log("\n  # Create real user:");
    console.log(
      '  npm run create-partner-user -- --partnerId=1 --name="John Doe" --email="john@partner.com" --phone="+966501234567"'
    );
    process.exit(1);
  }

  console.log("Creating partner user...");
  console.log(`  Partner ID: ${args.partnerId}`);
  console.log(`  Name: ${args.name}`);
  console.log(`  Email: ${args.email}`);
  if (args.phone) console.log(`  Phone: ${args.phone}`);
  if (args.language) console.log(`  Language: ${args.language}`);
  console.log("");

  const result = await createPartnerUser({
    partnerId: args.partnerId,
    name: args.name,
    email: args.email,
    phone: args.phone,
    language: args.language || "en",
    sendWelcomeEmail: true,
  });

  if (result.success) {
    console.log("✅ Partner user created successfully!\n");
    console.log("📧 Login Credentials:");
    console.log(`   Email: ${result.user?.email}`);
    console.log(`   Password: ${result.password}`);
    console.log(`   Login URL: http://localhost:3000/login`);
    console.log("\n📨 Welcome email sent to: " + result.user?.email);
    console.log("\n⚠️  User should change password after first login!");
  } else {
    console.error(`\n❌ Error: ${result.error}`);
    process.exit(1);
  }
}

main()
  .then(() => {
    console.log("\n✅ Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Script failed:", error);
    process.exit(1);
  });
