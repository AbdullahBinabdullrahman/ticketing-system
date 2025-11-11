import { db } from "./connection";
import {
  roles,
  permissions,
  rolePermissions,
  users,
  pickupOptionTypes,
  configurations,
  categories,
  services,
  partners,
  branches,
} from "./schema";
import { eq, and } from "drizzle-orm";
import bcrypt from "bcryptjs";

export async function seedDatabase() {
  console.log("🌱 Starting database seeding...");

  try {
    // 1. Check for existing roles or create them
    console.log("Checking for existing roles...");
    let adminRole = await db
      .select()
      .from(roles)
      .where(eq(roles.name, "admin"));
    let operationRole = await db
      .select()
      .from(roles)
      .where(eq(roles.name, "operational"));
    let partnerRole = await db
      .select()
      .from(roles)
      .where(eq(roles.name, "partner"));
    let customerRole = await db
      .select()
      .from(roles)
      .where(eq(roles.name, "customer"));

    if (adminRole.length === 0) {
      console.log("Creating roles...");
      adminRole = await db
        .insert(roles)
        .values({
          name: "admin",
          description: "System administrator with full access",
        } as any)
        .returning();

      operationRole = await db
        .insert(roles)
        .values({
          name: "operational",
          description: "Operations team member",
        } as any)
        .returning();

      partnerRole = await db
        .insert(roles)
        .values({
          name: "partner",
          description: "Service partner user",
        } as any)
        .returning();

      customerRole = await db
        .insert(roles)
        .values({
          name: "customer",
          description: "Customer user",
        } as any)
        .returning();
    } else {
      console.log("✅ Roles already exist, using existing roles");
    }

    // 2. Check for existing permissions or create them
    console.log("Checking for existing permissions...");
    let createdPermissions = await db.select().from(permissions);

    if (createdPermissions.length === 0) {
      console.log("Creating permissions...");
      const permissionsData = [
        { name: "user_manage", description: "Manage users" },
        { name: "partner_manage", description: "Manage partners" },
        { name: "branch_manage", description: "Manage branches" },
        { name: "category_manage", description: "Manage categories" },
        { name: "service_manage", description: "Manage services" },
        { name: "request_view", description: "View requests" },
        { name: "request_assign", description: "Assign requests" },
        {
          name: "request_update",
          description:
            "Update request status (confirm, reject, in-progress, completed)",
        },
        { name: "request_close", description: "Close requests" },
        { name: "reports_view", description: "View reports" },
        { name: "config_manage", description: "Manage configurations" },
        { name: "notification_view", description: "View notifications" },
      ];

      createdPermissions = await db
        .insert(permissions)
        .values(permissionsData)
        .returning();

      // 2b. Map permissions to roles
      console.log("Mapping permissions to roles...");
      const rolePermissionMappings = [];

      // Admin role: All 12 permissions (now includes request_update)
      for (const perm of createdPermissions) {
        rolePermissionMappings.push({
          roleId: adminRole[0].id,
          permissionId: perm.id,
          createdById: null, // Will be set after admin user is created
        });
      }

      // Operation role: All except config_manage (11 permissions)
      const configManagePermission = createdPermissions.find(
        (p) => p.name === "config_manage"
      );
      for (const perm of createdPermissions) {
        if (perm.id !== configManagePermission?.id) {
          rolePermissionMappings.push({
            roleId: operationRole[0].id,
            permissionId: perm.id,
            createdById: null,
          });
        }
      }

      // Partner role: request_view, request_update, notification_view
      // Partners can view requests assigned to them and update status (confirm/reject/in-progress/completed)
      const partnerPermissions = [
        "request_view",
        "request_update",
        "notification_view",
      ];

      for (const perm of createdPermissions) {
        if (partnerPermissions.includes(perm.name)) {
          rolePermissionMappings.push({
            roleId: partnerRole[0].id,
            permissionId: perm.id,
            createdById: null,
          });
        }
      }

      // Customer role: No portal permissions (customers use mobile API only)
      // Note: Keeping empty for now as customers don't authenticate to portal

      // Store mappings (will insert after admin user is created to set createdById)
      const rolePermissionMappingsToInsert = [...rolePermissionMappings];

      // 3. Create admin user
      console.log("Creating admin user...");
      const adminHashedPassword = await bcrypt.hash("Admin123!", 12);

      const adminUser = await db
        .insert(users)
        .values({
          name: "System Administrator",
          email: "admin@ticketing.com",
          password: adminHashedPassword,
          roleId: adminRole[0].id,
          userType: "admin",
          languagePreference: "en",
          emailVerifiedAt: new Date(),
        } as any)
        .returning();

      // 3a. Insert role-permission mappings (now that admin user exists)
      console.log("Inserting role-permission mappings...");
      const mappingsWithCreatedBy = rolePermissionMappingsToInsert.map(
        (mapping) =>
          ({
            ...mapping,
            createdById: adminUser[0].id,
          } as any)
      );
      await db.insert(rolePermissions).values(mappingsWithCreatedBy);
    } else {
      console.log("✅ Permissions already exist, skipping");
    }

    // 3. Check for existing admin user
    console.log("Checking for existing admin user...");
    let adminUser = await db
      .select()
      .from(users)
      .where(eq(users.email, "admin@ticketing.com"));

    if (adminUser.length === 0) {
      console.log("Creating admin user...");
      const adminHashedPassword = await bcrypt.hash("Admin123!", 12);
      adminUser = await db
        .insert(users)
        .values({
          name: "System Administrator",
          email: "admin@ticketing.com",
          password: adminHashedPassword,
          roleId: adminRole[0].id,
          userType: "admin",
          languagePreference: "en",
          emailVerifiedAt: new Date(),
        } as any)
        .returning();
    } else {
      console.log("✅ Admin user already exists, using existing admin");
      // Update password to match test accounts
      console.log("Updating admin user password...");
      const adminHashedPassword = await bcrypt.hash("Admin123!", 12);
      await db
        .update(users)
        .set({ password: adminHashedPassword } as any)
        .where(eq(users.id, adminUser[0].id));
    }

    // 3b. Check for existing partners or create them
    console.log("Checking for existing partner companies...");

    // Partner 1: Quick Fix Auto Services
    let quickFixPartner = await db
      .select()
      .from(partners)
      .where(eq(partners.contactEmail, "contact@quickfix.com"));
    if (quickFixPartner.length === 0) {
      console.log("  Creating Quick Fix Auto Services...");
      quickFixPartner = await db
        .insert(partners)
        .values({
          name: "Quick Fix Auto Services",
          status: "active",
          contactEmail: "contact@quickfix.com",
          contactPhone: "+966501111111",
          createdById: adminUser[0].id,
        } as any)
        .returning();
    } else {
      console.log("  ✅ Quick Fix Auto Services already exists");
    }

    // Partner 2: Express Auto Care
    let expressAutoPartner = await db
      .select()
      .from(partners)
      .where(eq(partners.contactEmail, "info@expressauto.com"));
    if (expressAutoPartner.length === 0) {
      console.log("  Creating Express Auto Care...");
      expressAutoPartner = await db
        .insert(partners)
        .values({
          name: "Express Auto Care",
          status: "active",
          contactEmail: "info@expressauto.com",
          contactPhone: "+966502222222",
          createdById: adminUser[0].id,
        } as any)
        .returning();
    } else {
      console.log("  ✅ Express Auto Care already exists");
    }

    // Partner 3: Pro Tire Services
    let proTirePartner = await db
      .select()
      .from(partners)
      .where(eq(partners.contactEmail, "contact@protire.com"));
    if (proTirePartner.length === 0) {
      console.log("  Creating Pro Tire Services...");
      proTirePartner = await db
        .insert(partners)
        .values({
          name: "Pro Tire Services",
          status: "active",
          contactEmail: "contact@protire.com",
          contactPhone: "+966503333333",
          createdById: adminUser[0].id,
        } as any)
        .returning();
    } else {
      console.log("  ✅ Pro Tire Services already exists");
    }

    // 3c. Check for existing branches or create them
    console.log("Checking for existing partner branches...");

    // Quick Fix branches
    const existingQFMain = await db
      .select()
      .from(branches)
      .where(
        and(
          eq(branches.partnerId, quickFixPartner[0].id),
          eq(branches.name, "Main Branch")
        )
      );
    if (existingQFMain.length === 0) {
      console.log("  Creating Quick Fix Main Branch...");
      await db.insert(branches).values({
        partnerId: quickFixPartner[0].id,
        name: "Main Branch",
        lat: "24.7136",
        lng: "46.6753",
        contactName: "Main Branch Manager",
        phone: "+966501111112",
        address: "Riyadh Center, Riyadh, Saudi Arabia",
        radiusKm: "15.0",
        createdById: adminUser[0].id,
      } as any);
    } else {
      console.log("  ✅ Quick Fix Main Branch already exists");
    }

    const existingQFNorth = await db
      .select()
      .from(branches)
      .where(
        and(
          eq(branches.partnerId, quickFixPartner[0].id),
          eq(branches.name, "North Branch")
        )
      );
    if (existingQFNorth.length === 0) {
      console.log("  Creating Quick Fix North Branch...");
      await db.insert(branches).values({
        partnerId: quickFixPartner[0].id,
        name: "North Branch",
        lat: "24.8000",
        lng: "46.6753",
        contactName: "North Branch Manager",
        phone: "+966501111113",
        address: "North Riyadh, Riyadh, Saudi Arabia",
        radiusKm: "10.0",
        createdById: adminUser[0].id,
      } as any);
    } else {
      console.log("  ✅ Quick Fix North Branch already exists");
    }

    const existingQFEast = await db
      .select()
      .from(branches)
      .where(
        and(
          eq(branches.partnerId, quickFixPartner[0].id),
          eq(branches.name, "East Branch")
        )
      );
    if (existingQFEast.length === 0) {
      console.log("  Creating Quick Fix East Branch...");
      await db.insert(branches).values({
        partnerId: quickFixPartner[0].id,
        name: "East Branch",
        lat: "24.7136",
        lng: "46.7500",
        contactName: "East Branch Manager",
        phone: "+966501111114",
        address: "East Riyadh, Riyadh, Saudi Arabia",
        radiusKm: "10.0",
        createdById: adminUser[0].id,
      } as any);
    } else {
      console.log("  ✅ Quick Fix East Branch already exists");
    }

    // Express Auto branches
    const existingEADowntown = await db
      .select()
      .from(branches)
      .where(
        and(
          eq(branches.partnerId, expressAutoPartner[0].id),
          eq(branches.name, "Downtown Branch")
        )
      );
    if (existingEADowntown.length === 0) {
      console.log("  Creating Express Auto Downtown Branch...");
      await db.insert(branches).values({
        partnerId: expressAutoPartner[0].id,
        name: "Downtown Branch",
        lat: "24.6877",
        lng: "46.6857",
        contactName: "Downtown Manager",
        phone: "+966502222223",
        address: "Al Olaya, Riyadh, Saudi Arabia",
        radiusKm: "12.0",
        createdById: adminUser[0].id,
      } as any);
    } else {
      console.log("  ✅ Express Auto Downtown Branch already exists");
    }

    const existingEAWest = await db
      .select()
      .from(branches)
      .where(
        and(
          eq(branches.partnerId, expressAutoPartner[0].id),
          eq(branches.name, "West Branch")
        )
      );
    if (existingEAWest.length === 0) {
      console.log("  Creating Express Auto West Branch...");
      await db.insert(branches).values({
        partnerId: expressAutoPartner[0].id,
        name: "West Branch",
        lat: "24.7136",
        lng: "46.6000",
        contactName: "West Branch Manager",
        phone: "+966502222224",
        address: "West Riyadh, Riyadh, Saudi Arabia",
        radiusKm: "10.0",
        createdById: adminUser[0].id,
      } as any);
    } else {
      console.log("  ✅ Express Auto West Branch already exists");
    }

    // Pro Tire branches
    const existingPTMain = await db
      .select()
      .from(branches)
      .where(
        and(
          eq(branches.partnerId, proTirePartner[0].id),
          eq(branches.name, "Main Service Center")
        )
      );
    if (existingPTMain.length === 0) {
      console.log("  Creating Pro Tire Main Service Center...");
      await db.insert(branches).values({
        partnerId: proTirePartner[0].id,
        name: "Main Service Center",
        lat: "24.7265",
        lng: "46.7296",
        contactName: "Service Center Manager",
        phone: "+966503333334",
        address: "Al Malaz, Riyadh, Saudi Arabia",
        radiusKm: "15.0",
        createdById: adminUser[0].id,
      } as any);
    } else {
      console.log("  ✅ Pro Tire Main Service Center already exists");
    }

    const existingPTSouth = await db
      .select()
      .from(branches)
      .where(
        and(
          eq(branches.partnerId, proTirePartner[0].id),
          eq(branches.name, "South Branch")
        )
      );
    if (existingPTSouth.length === 0) {
      console.log("  Creating Pro Tire South Branch...");
      await db.insert(branches).values({
        partnerId: proTirePartner[0].id,
        name: "South Branch",
        lat: "24.6500",
        lng: "46.6753",
        contactName: "South Branch Manager",
        phone: "+966503333335",
        address: "South Riyadh, Riyadh, Saudi Arabia",
        radiusKm: "10.0",
        createdById: adminUser[0].id,
      } as any);
    } else {
      console.log("  ✅ Pro Tire South Branch already exists");
    }

    // 3d. Check for existing partner users or create them
    console.log("Checking for existing partner users...");
    const partnerHashedPassword = await bcrypt.hash("Partner123!", 12);

    // Quick Fix user
    let quickFixUser = await db
      .select()
      .from(users)
      .where(eq(users.email, "partner@quickfix.com"));
    if (quickFixUser.length === 0) {
      console.log("  Creating Quick Fix user...");
      quickFixUser = await db
        .insert(users)
        .values({
          name: "Quick Fix Manager",
          email: "partner@quickfix.com",
          password: partnerHashedPassword,
          roleId: partnerRole[0].id,
          userType: "partner",
          partnerId: quickFixPartner[0].id,
          languagePreference: "en",
          emailVerifiedAt: new Date(),
        } as any)
        .returning();
    } else {
      console.log("  ✅ Quick Fix user already exists");
    }

    // Express Auto user
    let expressAutoUser = await db
      .select()
      .from(users)
      .where(eq(users.email, "partner@expressauto.com"));
    if (expressAutoUser.length === 0) {
      console.log("  Creating Express Auto user...");
      expressAutoUser = await db
        .insert(users)
        .values({
          name: "Express Auto Manager",
          email: "partner@expressauto.com",
          password: partnerHashedPassword,
          roleId: partnerRole[0].id,
          userType: "partner",
          partnerId: expressAutoPartner[0].id,
          languagePreference: "en",
          emailVerifiedAt: new Date(),
        } as any)
        .returning();
    } else {
      console.log("  ✅ Express Auto user already exists");
    }

    // Pro Tire user
    let proTireUser = await db
      .select()
      .from(users)
      .where(eq(users.email, "partner@protire.com"));
    if (proTireUser.length === 0) {
      console.log("  Creating Pro Tire user...");
      proTireUser = await db
        .insert(users)
        .values({
          name: "Pro Tire Manager",
          email: "partner@protire.com",
          password: partnerHashedPassword,
          roleId: partnerRole[0].id,
          userType: "partner",
          partnerId: proTirePartner[0].id,
          languagePreference: "en",
          emailVerifiedAt: new Date(),
        } as any)
        .returning();
    } else {
      console.log("  ✅ Pro Tire user already exists");
    }

    // 3e. Check for existing operation user or create
    console.log("Checking for existing operation user...");
    let operationUser = await db
      .select()
      .from(users)
      .where(eq(users.email, "operation@ticketing.com"));
    if (operationUser.length === 0) {
      console.log("  Creating operation user...");
      const operationHashedPassword = await bcrypt.hash("operation123", 12);
      operationUser = await db
        .insert(users)
        .values({
          name: "Operation Team Member",
          email: "operation@ticketing.com",
          password: operationHashedPassword,
          roleId: operationRole[0].id,
          userType: "admin", // Operation users use admin portal but with operation role permissions
          languagePreference: "en",
          emailVerifiedAt: new Date(),
        } as any)
        .returning();
    } else {
      console.log("  ✅ Operation user already exists");
    }

    // 4. Check for existing pickup option types or create them
    console.log("Checking for existing pickup option types...");
    const existingPickupOptions = await db
      .select()
      .from(pickupOptionTypes)
      .limit(1);
    if (existingPickupOptions.length === 0) {
      console.log("Creating pickup option types...");
      const pickupOptions = [
        {
          name: "Pickup Only",
          nameAr: "استلام فقط",
          description: "Customer brings vehicle to partner location",
          descriptionAr: "العميل يجلب المركبة إلى موقع الشريك",
          requiresServiceSelection: false,
        },
        {
          name: "Pickup and Return",
          nameAr: "استلام وإرجاع",
          description: "Partner picks up and returns vehicle",
          descriptionAr: "الشريك يستلم ويرجع المركبة",
          requiresServiceSelection: false,
        },
        {
          name: "Emergency Pickup",
          nameAr: "استلام طارئ",
          description: "Urgent pickup service",
          descriptionAr: "خدمة استلام طارئة",
          requiresServiceSelection: false,
        },
        {
          name: "Drop-off In Center",
          nameAr: "تسليم في المركز",
          description: "Customer drops off at service center",
          descriptionAr: "العميل يسلم في مركز الخدمة",
          requiresServiceSelection: true,
        },
        {
          name: "Service At Location",
          nameAr: "خدمة في الموقع",
          description: "Service provided at customer location",
          descriptionAr: "الخدمة مقدمة في موقع العميل",
          requiresServiceSelection: true,
        },
      ];

      await db.insert(pickupOptionTypes).values(pickupOptions);
    } else {
      console.log("✅ Pickup option types already exist, skipping");
    }

    // 5. Check for existing categories or create them
    console.log("Checking for existing categories...");
    let createdCategories = await db.select().from(categories);
    if (createdCategories.length === 0) {
      console.log("Creating default categories...");
      const categoriesData = [
        {
          name: "Car Maintenance",
          nameAr: "صيانة السيارات",
          description: "General car maintenance services",
          descriptionAr: "خدمات الصيانة العامة للسيارات",
        },
        {
          name: "Tires",
          nameAr: "الإطارات",
          description: "Tire related services",
          descriptionAr: "الخدمات المتعلقة بالإطارات",
        },
        {
          name: "Oil Change",
          nameAr: "تغيير الزيت",
          description: "Oil change services",
          descriptionAr: "خدمات تغيير الزيت",
        },
        {
          name: "Battery",
          nameAr: "البطارية",
          description: "Battery services",
          descriptionAr: "خدمات البطارية",
        },
      ];

      createdCategories = await db
        .insert(categories)
        .values(categoriesData)
        .returning();
    } else {
      console.log("✅ Categories already exist, skipping");
    }

    // 6. Check for existing services or create them
    console.log("Checking for existing services...");
    const existingServices = await db.select().from(services).limit(1);
    if (existingServices.length === 0) {
      console.log("Creating default services...");
      const servicesData = [
        // Car Maintenance services
        {
          categoryId: createdCategories[0].id,
          name: "General Inspection",
          nameAr: "فحص عام",
          description: "Complete vehicle inspection",
          descriptionAr: "فحص شامل للمركبة",
        },
        {
          categoryId: createdCategories[0].id,
          name: "Brake Service",
          nameAr: "خدمة الفرامل",
          description: "Brake system maintenance",
          descriptionAr: "صيانة نظام الفرامل",
        },
        // Tires services
        {
          categoryId: createdCategories[1].id,
          name: "Tire Replacement",
          nameAr: "استبدال الإطارات",
          description: "Replace old tires with new ones",
          descriptionAr: "استبدال الإطارات القديمة بأخرى جديدة",
        },
        {
          categoryId: createdCategories[1].id,
          name: "Tire Repair",
          nameAr: "إصلاح الإطارات",
          description: "Repair punctured or damaged tires",
          descriptionAr: "إصلاح الإطارات المثقوبة أو التالفة",
        },
        // Oil Change services
        {
          categoryId: createdCategories[2].id,
          name: "Engine Oil Change",
          nameAr: "تغيير زيت المحرك",
          description: "Replace engine oil and filter",
          descriptionAr: "استبدال زيت المحرك والفلتر",
        },
        // Battery services
        {
          categoryId: createdCategories[3].id,
          name: "Battery Replacement",
          nameAr: "استبدال البطارية",
          description: "Replace car battery",
          descriptionAr: "استبدال بطارية السيارة",
        },
        {
          categoryId: createdCategories[3].id,
          name: "Battery Testing",
          nameAr: "فحص البطارية",
          description: "Test battery health and charge",
          descriptionAr: "فحص صحة البطارية وشحنها",
        },
      ];

      await db.insert(services).values(servicesData);
    } else {
      console.log("✅ Services already exist, skipping");
    }

    // 7. Check for existing configurations or create them
    console.log("Checking for existing global configurations...");
    const existingConfigs = await db.select().from(configurations).limit(1);
    if (existingConfigs.length === 0) {
      console.log("Creating global configurations...");
      const configData: Array<{
        scope: "global" | "partner";
        key: string;
        value: string;
        description: string;
      }> = [
        {
          scope: "global",
          key: "sla_timeout_minutes",
          value: "15",
          description: "Default SLA timeout in minutes for partner response",
        },
        {
          scope: "global",
          key: "reminder_time_minutes",
          value: "10",
          description: "Time in minutes before SLA deadline to send reminder",
        },
        {
          scope: "global",
          key: "notification_retention_days",
          value: "30",
          description: "Number of days to keep notifications",
        },
        {
          scope: "global",
          key: "max_file_size_mb",
          value: "10",
          description: "Maximum file upload size in MB",
        },
        {
          scope: "global",
          key: "default_language",
          value: "en",
          description: "Default system language",
        },
      ];

      await db.insert(configurations).values(configData);
    } else {
      console.log("✅ Global configurations already exist, skipping");
    }

    // 8. Check for external customer or create one
    console.log("Checking for external customer...");
    const EXTERNAL_CUSTOMER_EMAIL = "external@system.internal";
    const EXTERNAL_CUSTOMER_NAME = "External Customer (System)";

    let externalCustomerUser = await db
      .select()
      .from(users)
      .where(eq(users.email, EXTERNAL_CUSTOMER_EMAIL));

    let externalCustomerId: number;

    if (externalCustomerUser.length === 0) {
      console.log("  Creating external customer user...");
      const externalPassword = await bcrypt.hash(
        Math.random().toString(36).substring(2) +
          Math.random().toString(36).substring(2),
        12
      );

      externalCustomerUser = await db
        .insert(users)
        .values({
          name: EXTERNAL_CUSTOMER_NAME,
          email: EXTERNAL_CUSTOMER_EMAIL,
          password: externalPassword,
          roleId: customerRole[0].id,
          userType: "customer",
          languagePreference: "en",
          emailVerifiedAt: new Date(),
        } as any)
        .returning();
    } else {
      console.log("  ✅ External customer user already exists");
    }

    // Create customer profile for external customer
    let externalCustomerProfile = await db
      .select()
      .from(customers)
      .where(eq(customers.userId, externalCustomerUser[0].id));

    if (externalCustomerProfile.length === 0) {
      console.log("  Creating external customer profile...");
      externalCustomerProfile = await db
        .insert(customers)
        .values({
          userId: externalCustomerUser[0].id,
          phone: "+966000000000",
          preferredLanguage: "en",
        } as any)
        .returning();
      externalCustomerId = externalCustomerProfile[0].id;
    } else {
      console.log("  ✅ External customer profile already exists");
      externalCustomerId = externalCustomerProfile[0].id;
    }

    console.log("✅ Database seeding completed successfully!");
    console.log("\n📋 Created Users:");
    console.log("  - Admin user: admin@ticketing.com / Admin123!");
    console.log("  - Operation user: operation@ticketing.com / operation123");
    console.log("\n👥 Partner Users:");
    console.log("  - Quick Fix: partner@quickfix.com / Partner123!");
    console.log("  - Express Auto: partner@expressauto.com / Partner123!");
    console.log("  - Pro Tire: partner@protire.com / Partner123!");
    console.log("\n🏢 Partner Companies:");
    console.log(`  - ${quickFixPartner[0].name} (3 branches)`);
    console.log(`  - ${expressAutoPartner[0].name} (2 branches)`);
    console.log(`  - ${proTirePartner[0].name} (2 branches)`);
    console.log("\n📍 Total Branches: 7");
    console.log("\n🔐 Role Permissions:");
    console.log("  - Admin: All 12 permissions (full access)");
    console.log("  - Operation: 11 permissions (all except config_manage)");
    console.log("  - Partner: request_view, request_update, notification_view");
    console.log("  - Customer: No portal permissions (mobile API only)");
    console.log("\n🔧 External Customer:");
    console.log(`  - Customer ID: ${externalCustomerId}`);
    console.log(`  - Email: ${EXTERNAL_CUSTOMER_EMAIL}`);
    console.log("\n📋 IMPORTANT: Add this to your .env file:");
    console.log("=".repeat(60));
    console.log(`EXTERNAL_CUSTOMER_ID=${externalCustomerId}`);
    console.log("=".repeat(60));
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log("Seeding completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Seeding failed:", error);
      process.exit(1);
    });
}
