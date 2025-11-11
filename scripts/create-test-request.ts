#!/usr/bin/env ts-node
/**
 * Script to create a test request and assign it to a specific partner
 * Usage: ts-node scripts/create-test-request.ts
 *
 * This script uses the same API endpoint as the admin form to ensure
 * full business logic, validation, and notifications are executed.
 */

import { db } from "../lib/db/connection";
import { users, partners, branches } from "../lib/db/schema";
import { eq } from "drizzle-orm";
import axios from "axios";

const PARTNER_EMAIL = "a.maher.bina@gmail.com";
const LOGIN_EMAIL = "xloudxnight@gmail.com";
const LOGIN_PASSWORD = "6f&tefx$EJm@";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002";

/**
 * Get authentication token
 */
async function getAdminToken(): Promise<string> {
  try {
    console.log(`🔐 Authenticating as ${LOGIN_EMAIL}...`);
    const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
      email: LOGIN_EMAIL,
      password: LOGIN_PASSWORD,
    });

    if (response.data.success && response.data.data.tokens.accessToken) {
      console.log("✅ Authentication successful\n");
      return response.data.data.tokens.accessToken;
    }

    throw new Error("Failed to get authentication token");
  } catch (error) {
    console.error("❌ Authentication failed:", error);
    console.log("\n💡 Make sure:");
    console.log("  - The dev server is running (npm run dev)");
    console.log(`  - User ${LOGIN_EMAIL} exists with correct credentials`);
    console.log("  - User has admin/operational permissions");
    console.log("  - Database is seeded");
    throw error;
  }
}

async function createTestRequest() {
  try {
    console.log("🚀 Starting test request creation...\n");

    // 1. Get authentication token
    const token = await getAdminToken();

    // 2. Find the partner user (for display purposes)
    console.log(`Looking for partner with email: ${PARTNER_EMAIL}...`);
    const partnerUser = await db
      .select()
      .from(users)
      .where(eq(users.email, PARTNER_EMAIL))
      .limit(1);

    if (partnerUser.length === 0) {
      console.error(`❌ Partner user with email ${PARTNER_EMAIL} not found!`);
      console.log("\nAvailable partner users:");
      const allPartners = await db
        .select({
          email: users.email,
          name: users.name,
          partnerId: users.partnerId,
        })
        .from(users)
        .where(eq(users.userType, "partner"));

      allPartners.forEach((p) => {
        console.log(`  - ${p.email} (${p.name}) - Partner ID: ${p.partnerId}`);
      });
      process.exit(1);
    }

    const partnerId = partnerUser[0].partnerId;
    if (!partnerId) {
      console.error(
        "❌ Partner user is not associated with any partner company!"
      );
      process.exit(1);
    }

    console.log(`✅ Found partner user: ${partnerUser[0].name}`);
    console.log(`   Partner ID: ${partnerId}`);

    // 3. Get partner details
    const partner = await db
      .select()
      .from(partners)
      .where(eq(partners.id, partnerId))
      .limit(1);

    if (partner.length === 0) {
      console.error("❌ Partner company not found!");
      process.exit(1);
    }

    console.log(`✅ Partner company: ${partner[0].name}`);

    // 4. Get first active branch for this partner
    const branch = await db
      .select()
      .from(branches)
      .where(eq(branches.partnerId, partnerId))
      .limit(1);

    if (branch.length === 0) {
      console.error("❌ No branches found for this partner!");
      process.exit(1);
    }

    console.log(`✅ Branch: ${branch[0].name} (${branch[0].address})\n`);

    // 5. Create request via API (like the admin form does)
    console.log("📤 Submitting request via API...");
    const requestData = {
      customerName: "Test Customer",
      customerPhone: "+966500000001",
      customerAddress: "Riyadh, King Fahd Road, Test Building",
      customerLat: 24.7136,
      customerLng: 46.6753,
      categoryId: 1, // Assuming category 1 exists
      serviceId: 1, // Assuming service 1 exists
      pickupOptionId: 1, // Assuming pickup option 1 exists
    };

    const response = await axios.post(
      `${API_BASE_URL}/api/admin/requests/customer`,
      requestData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.data.success) {
      throw new Error(
        response.data.error || "Failed to create request via API"
      );
    }

    const createdRequest = response.data.data.request;
    const requestNumber = createdRequest.requestNumber;
    const requestId = createdRequest.id;

    console.log("✅ Request created successfully via API!\n");

    // 6. Now assign it to the partner
    console.log(`📌 Assigning request to ${partner[0].name}...`);
    const assignResponse = await axios.post(
      `${API_BASE_URL}/api/admin/requests/${requestId}/assign`,
      {
        partnerId: partnerId,
        branchId: branch[0].id,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!assignResponse.data.success) {
      throw new Error(
        assignResponse.data.error || "Failed to assign request to partner"
      );
    }

    console.log("✅ Request assigned successfully!\n");

    // 7. Display results
    console.log("=".repeat(60));
    console.log("🎉 TEST REQUEST CREATED & ASSIGNED SUCCESSFULLY!");
    console.log("=".repeat(60));
    console.log(`📋 Request Number: ${requestNumber}`);
    console.log(`🆔 Request ID: ${requestId}`);
    console.log(`👤 Customer: Test Customer`);
    console.log(`📞 Phone: +966500000001`);
    console.log(`📍 Location: Riyadh, King Fahd Road`);
    console.log(`🏢 Partner: ${partner[0].name}`);
    console.log(`📍 Branch: ${branch[0].name}`);
    console.log(`📊 Status: assigned`);
    console.log("=".repeat(60));
    console.log("\n🌐 URLs for testing:");
    console.log(`Admin View: ${API_BASE_URL}/admin/requests`);
    console.log(
      `Partner View: ${API_BASE_URL}/partner/requests/${requestNumber}`
    );
    console.log(
      `Partner Accept: ${API_BASE_URL}/partner/requests/${requestNumber}?action=start`
    );
    console.log("\n💡 Next steps:");
    console.log(`1. Login as partner: ${PARTNER_EMAIL}`);
    console.log(`2. Open the Partner Accept URL above`);
    console.log(`3. Accept or reject the request to test email notifications`);
    console.log(`4. Check admin dashboard to test reassignment`);
    console.log("=".repeat(60));

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error creating test request:");
    if (axios.isAxiosError(error)) {
      console.error("Status:", error.response?.status);
      console.error("Error:", error.response?.data?.error || error.message);
      console.error("Details:", JSON.stringify(error.response?.data, null, 2));
    } else {
      console.error(error);
    }
    console.log("\n💡 Troubleshooting:");
    console.log("  - Ensure dev server is running: npm run dev");
    console.log("  - Check database is seeded: npm run db:seed");
    console.log("  - Verify EXTERNAL_CUSTOMER_ID in .env");
    console.log("  - Ensure categories/services exist with ID 1");
    process.exit(1);
  }
}

// Run the script
createTestRequest();
