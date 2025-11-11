import {
  pgTable,
  unique,
  serial,
  varchar,
  text,
  timestamp,
  integer,
  boolean,
  index,
  foreignKey,
  numeric,
  check,
  jsonb,
  pgEnum,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const assignmentResponseEnum = pgEnum("assignment_response_enum", [
  "confirmed",
  "rejected",
  "timeout",
  "pending",
]);
export const branchUserRoleEnum = pgEnum("branch_user_role_enum", [
  "branch_manager",
  "technician",
  "viewer",
  "admin",
]);
export const configScopeEnum = pgEnum("config_scope_enum", [
  "global",
  "partner",
]);
export const notificationTypeEnum = pgEnum("notification_type_enum", [
  "request_submitted",
  "request_assigned",
  "request_confirmed",
  "request_rejected",
  "request_in_progress",
  "request_completed",
  "request_closed",
  "partner_timeout",
  "sla_reminder",
  "general",
]);
export const partnerStatusEnum = pgEnum("partner_status_enum", [
  "active",
  "inactive",
  "suspended",
]);
export const requestStatusEnum = pgEnum("request_status_enum", [
  "submitted",
  "assigned",
  "confirmed",
  "in_progress",
  "completed",
  "closed",
  "rejected",
  "unassigned",
]);
export const userTypeEnum = pgEnum("user_type_enum", [
  "admin",
  "partner",
  "customer",
]);

export const roles = pgTable(
  "roles",
  {
    id: serial().primaryKey().notNull(),
    name: varchar({ length: 50 }).notNull(),
    description: text(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).default(sql`CURRENT_TIMESTAMP`),
    createdById: integer("created_by_id"),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      mode: "string",
    }).default(sql`CURRENT_TIMESTAMP`),
    updatedById: integer("updated_by_id"),
    isActive: boolean("is_active").default(true),
    isDeleted: boolean("is_deleted").default(false),
  },
  (table) => [unique("roles_name_key").on(table.name)]
);

// @ts-expect-error - Auto-generated schema with circular references
export const users = pgTable(
  "users",
  {
    id: serial().primaryKey().notNull(),
    name: varchar({ length: 255 }).notNull(),
    email: varchar({ length: 255 }).notNull(),
    phone: varchar({ length: 50 }),
    password: varchar({ length: 255 }).notNull(),
    roleId: integer("role_id").notNull(),
    userType: userTypeEnum("user_type").notNull(),
    partnerId: integer("partner_id"),
    languagePreference: varchar("language_preference", { length: 5 }).default(
      "en"
    ),
    emailVerifiedAt: timestamp("email_verified_at", {
      withTimezone: true,
      mode: "string",
    }),
    phoneVerifiedAt: timestamp("phone_verified_at", {
      withTimezone: true,
      mode: "string",
    }),
    lastLoginAt: timestamp("last_login_at", {
      withTimezone: true,
      mode: "string",
    }),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).default(sql`CURRENT_TIMESTAMP`),
    createdById: integer("created_by_id"),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      mode: "string",
    }).default(sql`CURRENT_TIMESTAMP`),
    updatedById: integer("updated_by_id"),
    isActive: boolean("is_active").default(true),
    isDeleted: boolean("is_deleted").default(false),
    // @ts-expect-error - Circular reference in foreign keys
  },
  (table) => [
    index("idx_users_email")
      .using("btree", table.email.asc().nullsLast().op("text_ops"))
      .where(sql`(is_deleted = false)`),
    index("idx_users_partner_id")
      .using("btree", table.partnerId.asc().nullsLast().op("int4_ops"))
      .where(sql`(partner_id IS NOT NULL)`),
    index("idx_users_role_id").using(
      "btree",
      table.roleId.asc().nullsLast().op("int4_ops")
    ),
    index("idx_users_user_type").using(
      "btree",
      table.userType.asc().nullsLast().op("enum_ops")
    ),
    foreignKey({
      columns: [table.partnerId],
      foreignColumns: [partners.id],
      name: "fk_users_partner",
    }).onDelete("set null"),
    foreignKey({
      columns: [table.roleId],
      foreignColumns: [roles.id],
      name: "users_role_id_fkey",
    }).onDelete("restrict"),
    unique("users_email_key").on(table.email),
  ]
);

export const userPermissions = pgTable(
  "user_permissions",
  {
    id: serial().primaryKey().notNull(),
    userId: integer("user_id").notNull(),
    permissionId: integer("permission_id").notNull(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).default(sql`CURRENT_TIMESTAMP`),
    createdById: integer("created_by_id"),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      mode: "string",
    }).default(sql`CURRENT_TIMESTAMP`),
    updatedById: integer("updated_by_id"),
    isActive: boolean("is_active").default(true),
    isDeleted: boolean("is_deleted").default(false),
  },
  (table) => [
    foreignKey({
      columns: [table.createdById],
      foreignColumns: [users.id],
      name: "user_permissions_created_by_id_fkey",
    }),
    foreignKey({
      columns: [table.permissionId],
      foreignColumns: [permissions.id],
      name: "user_permissions_permission_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.updatedById],
      foreignColumns: [users.id],
      name: "user_permissions_updated_by_id_fkey",
    }),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "user_permissions_user_id_fkey",
    }).onDelete("cascade"),
    unique("user_permissions_user_id_permission_id_key").on(
      table.userId,
      table.permissionId
    ),
  ]
);

export const permissions = pgTable(
  "permissions",
  {
    id: serial().primaryKey().notNull(),
    name: varchar({ length: 100 }).notNull(),
    description: text(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).default(sql`CURRENT_TIMESTAMP`),
    createdById: integer("created_by_id"),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      mode: "string",
    }).default(sql`CURRENT_TIMESTAMP`),
    updatedById: integer("updated_by_id"),
    isActive: boolean("is_active").default(true),
    isDeleted: boolean("is_deleted").default(false),
  },
  (table) => [unique("permissions_name_key").on(table.name)]
);

export const rolePermissions = pgTable(
  "role_permissions",
  {
    id: serial().primaryKey().notNull(),
    roleId: integer("role_id").notNull(),
    permissionId: integer("permission_id").notNull(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).default(sql`CURRENT_TIMESTAMP`),
    createdById: integer("created_by_id"),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      mode: "string",
    }).default(sql`CURRENT_TIMESTAMP`),
    updatedById: integer("updated_by_id"),
    isActive: boolean("is_active").default(true),
    isDeleted: boolean("is_deleted").default(false),
  },
  (table) => [
    foreignKey({
      columns: [table.createdById],
      foreignColumns: [users.id],
      name: "role_permissions_created_by_id_fkey",
    }),
    foreignKey({
      columns: [table.permissionId],
      foreignColumns: [permissions.id],
      name: "role_permissions_permission_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.roleId],
      foreignColumns: [roles.id],
      name: "role_permissions_role_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.updatedById],
      foreignColumns: [users.id],
      name: "role_permissions_updated_by_id_fkey",
    }),
    unique("role_permissions_role_id_permission_id_key").on(
      table.roleId,
      table.permissionId
    ),
  ]
);

export const userSessions = pgTable(
  "user_sessions",
  {
    id: serial().primaryKey().notNull(),
    userId: integer("user_id").notNull(),
    token: varchar({ length: 500 }).notNull(),
    refreshToken: varchar("refresh_token", { length: 500 }).notNull(),
    expiresAt: timestamp("expires_at", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
    deviceInfo: text("device_info"),
    ipAddress: varchar("ip_address", { length: 45 }),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).default(sql`CURRENT_TIMESTAMP`),
    isActive: boolean("is_active").default(true),
  },
  (table) => [
    index("idx_user_sessions_expires_at").using(
      "btree",
      table.expiresAt.asc().nullsLast().op("timestamptz_ops")
    ),
    index("idx_user_sessions_token").using(
      "btree",
      table.token.asc().nullsLast().op("text_ops")
    ),
    index("idx_user_sessions_user_id").using(
      "btree",
      table.userId.asc().nullsLast().op("int4_ops")
    ),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "user_sessions_user_id_fkey",
    }).onDelete("cascade"),
    unique("user_sessions_token_key").on(table.token),
    unique("user_sessions_refresh_token_key").on(table.refreshToken),
  ]
);

export const customers = pgTable(
  "customers",
  {
    id: serial().primaryKey().notNull(),
    userId: integer("user_id").notNull(),
    phone: varchar({ length: 50 }).notNull(),
    preferredLanguage: varchar("preferred_language", { length: 5 }).default(
      "en"
    ),
    profilePictureUrl: text("profile_picture_url"),
    defaultLat: numeric("default_lat", { precision: 10, scale: 8 }),
    defaultLng: numeric("default_lng", { precision: 11, scale: 8 }),
    defaultAddress: text("default_address"),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).default(sql`CURRENT_TIMESTAMP`),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      mode: "string",
    }).default(sql`CURRENT_TIMESTAMP`),
    isActive: boolean("is_active").default(true),
  },
  (table) => [
    index("idx_customers_user_id").using(
      "btree",
      table.userId.asc().nullsLast().op("int4_ops")
    ),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "customers_user_id_fkey",
    }).onDelete("cascade"),
    unique("customers_user_id_key").on(table.userId),
  ]
);

// @ts-expect-error - Auto-generated schema with circular references
export const partners = pgTable(
  "partners",
  {
    id: serial().primaryKey().notNull(),
    name: varchar({ length: 255 }).notNull(),
    status: partnerStatusEnum().default("active"),
    logoUrl: text("logo_url"),
    contactEmail: varchar("contact_email", { length: 255 }),
    contactPhone: varchar("contact_phone", { length: 50 }),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).default(sql`CURRENT_TIMESTAMP`),
    createdById: integer("created_by_id"),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      mode: "string",
    }).default(sql`CURRENT_TIMESTAMP`),
    updatedById: integer("updated_by_id"),
    isActive: boolean("is_active").default(true),
    isDeleted: boolean("is_deleted").default(false),
    // @ts-expect-error - Circular reference in foreign keys
  },
  (table) => [
    index("idx_partners_status")
      .using("btree", table.status.asc().nullsLast().op("enum_ops"))
      .where(sql`(is_deleted = false)`),
    foreignKey({
      columns: [table.createdById],
      foreignColumns: [users.id],
      name: "partners_created_by_id_fkey",
    }),
    foreignKey({
      columns: [table.updatedById],
      foreignColumns: [users.id],
      name: "partners_updated_by_id_fkey",
    }),
  ]
);

export const branches = pgTable(
  "branches",
  {
    id: serial().primaryKey().notNull(),
    partnerId: integer("partner_id").notNull(),
    name: varchar({ length: 255 }).notNull(),
    lat: numeric({ precision: 10, scale: 8 }).notNull(),
    lng: numeric({ precision: 11, scale: 8 }).notNull(),
    contactName: varchar("contact_name", { length: 255 }),
    phone: varchar({ length: 50 }),
    address: text(),
    radiusKm: numeric("radius_km", { precision: 5, scale: 2 }).default("10.0"),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).default(sql`CURRENT_TIMESTAMP`),
    createdById: integer("created_by_id"),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      mode: "string",
    }).default(sql`CURRENT_TIMESTAMP`),
    updatedById: integer("updated_by_id"),
    isActive: boolean("is_active").default(true),
    isDeleted: boolean("is_deleted").default(false),
  },
  (table) => [
    index("idx_branches_lat_lng").using(
      "btree",
      table.lat.asc().nullsLast().op("numeric_ops"),
      table.lng.asc().nullsLast().op("numeric_ops")
    ),
    index("idx_branches_partner_id")
      .using("btree", table.partnerId.asc().nullsLast().op("int4_ops"))
      .where(sql`(is_deleted = false)`),
    foreignKey({
      columns: [table.createdById],
      foreignColumns: [users.id],
      name: "branches_created_by_id_fkey",
    }),
    foreignKey({
      columns: [table.partnerId],
      foreignColumns: [partners.id],
      name: "branches_partner_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.updatedById],
      foreignColumns: [users.id],
      name: "branches_updated_by_id_fkey",
    }),
  ]
);

export const branchUsers = pgTable(
  "branch_users",
  {
    id: serial().primaryKey().notNull(),
    branchId: integer("branch_id").notNull(),
    userId: integer("user_id").notNull(),
    role: branchUserRoleEnum().default("viewer"),
    assignedAt: timestamp("assigned_at", {
      withTimezone: true,
      mode: "string",
    }).default(sql`CURRENT_TIMESTAMP`),
    assignedById: integer("assigned_by_id"),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).default(sql`CURRENT_TIMESTAMP`),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      mode: "string",
    }).default(sql`CURRENT_TIMESTAMP`),
    isActive: boolean("is_active").default(true),
    isDeleted: boolean("is_deleted").default(false),
  },
  (table) => [
    index("idx_branch_users_branch_id")
      .using("btree", table.branchId.asc().nullsLast().op("int4_ops"))
      .where(sql`(is_deleted = false)`),
    index("idx_branch_users_user_id")
      .using("btree", table.userId.asc().nullsLast().op("int4_ops"))
      .where(sql`(is_deleted = false)`),
    foreignKey({
      columns: [table.assignedById],
      foreignColumns: [users.id],
      name: "branch_users_assigned_by_id_fkey",
    }),
    foreignKey({
      columns: [table.branchId],
      foreignColumns: [branches.id],
      name: "branch_users_branch_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "branch_users_user_id_fkey",
    }).onDelete("cascade"),
    unique("branch_users_branch_id_user_id_key").on(
      table.branchId,
      table.userId
    ),
  ]
);

export const categories = pgTable(
  "categories",
  {
    id: serial().primaryKey().notNull(),
    name: varchar({ length: 255 }).notNull(),
    nameAr: varchar("name_ar", { length: 255 }),
    description: text(),
    descriptionAr: text("description_ar"),
    iconUrl: text("icon_url"),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).default(sql`CURRENT_TIMESTAMP`),
    createdById: integer("created_by_id"),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      mode: "string",
    }).default(sql`CURRENT_TIMESTAMP`),
    updatedById: integer("updated_by_id"),
    isActive: boolean("is_active").default(true),
    isDeleted: boolean("is_deleted").default(false),
  },
  (table) => [
    index("idx_categories_active")
      .using("btree", table.isActive.asc().nullsLast().op("bool_ops"))
      .where(sql`(is_deleted = false)`),
    foreignKey({
      columns: [table.createdById],
      foreignColumns: [users.id],
      name: "categories_created_by_id_fkey",
    }),
    foreignKey({
      columns: [table.updatedById],
      foreignColumns: [users.id],
      name: "categories_updated_by_id_fkey",
    }),
  ]
);

export const partnerCategories = pgTable(
  "partner_categories",
  {
    id: serial().primaryKey().notNull(),
    partnerId: integer("partner_id").notNull(),
    categoryId: integer("category_id").notNull(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).default(sql`CURRENT_TIMESTAMP`),
    createdById: integer("created_by_id"),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      mode: "string",
    }).default(sql`CURRENT_TIMESTAMP`),
    updatedById: integer("updated_by_id"),
    isActive: boolean("is_active").default(true),
    isDeleted: boolean("is_deleted").default(false),
  },
  (table) => [
    foreignKey({
      columns: [table.categoryId],
      foreignColumns: [categories.id],
      name: "partner_categories_category_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.createdById],
      foreignColumns: [users.id],
      name: "partner_categories_created_by_id_fkey",
    }),
    foreignKey({
      columns: [table.partnerId],
      foreignColumns: [partners.id],
      name: "partner_categories_partner_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.updatedById],
      foreignColumns: [users.id],
      name: "partner_categories_updated_by_id_fkey",
    }),
    unique("partner_categories_partner_id_category_id_key").on(
      table.partnerId,
      table.categoryId
    ),
  ]
);

export const services = pgTable(
  "services",
  {
    id: serial().primaryKey().notNull(),
    categoryId: integer("category_id").notNull(),
    name: varchar({ length: 255 }).notNull(),
    nameAr: varchar("name_ar", { length: 255 }),
    description: text(),
    descriptionAr: text("description_ar"),
    iconUrl: text("icon_url"),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).default(sql`CURRENT_TIMESTAMP`),
    createdById: integer("created_by_id"),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      mode: "string",
    }).default(sql`CURRENT_TIMESTAMP`),
    updatedById: integer("updated_by_id"),
    isActive: boolean("is_active").default(true),
    isDeleted: boolean("is_deleted").default(false),
  },
  (table) => [
    index("idx_services_category_id")
      .using("btree", table.categoryId.asc().nullsLast().op("int4_ops"))
      .where(sql`(is_deleted = false)`),
    foreignKey({
      columns: [table.categoryId],
      foreignColumns: [categories.id],
      name: "services_category_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.createdById],
      foreignColumns: [users.id],
      name: "services_created_by_id_fkey",
    }),
    foreignKey({
      columns: [table.updatedById],
      foreignColumns: [users.id],
      name: "services_updated_by_id_fkey",
    }),
  ]
);

export const pickupOptionTypes = pgTable(
  "pickup_option_types",
  {
    id: serial().primaryKey().notNull(),
    name: varchar({ length: 100 }).notNull(),
    nameAr: varchar("name_ar", { length: 100 }),
    description: text(),
    descriptionAr: text("description_ar"),
    requiresServiceSelection: boolean("requires_service_selection").default(
      false
    ),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).default(sql`CURRENT_TIMESTAMP`),
    createdById: integer("created_by_id"),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      mode: "string",
    }).default(sql`CURRENT_TIMESTAMP`),
    updatedById: integer("updated_by_id"),
    isActive: boolean("is_active").default(true),
    isDeleted: boolean("is_deleted").default(false),
  },
  (table) => [
    foreignKey({
      columns: [table.createdById],
      foreignColumns: [users.id],
      name: "pickup_option_types_created_by_id_fkey",
    }),
    foreignKey({
      columns: [table.updatedById],
      foreignColumns: [users.id],
      name: "pickup_option_types_updated_by_id_fkey",
    }),
    unique("pickup_option_types_name_key").on(table.name),
  ]
);

export const partnerPickupOptions = pgTable(
  "partner_pickup_options",
  {
    id: serial().primaryKey().notNull(),
    partnerId: integer("partner_id").notNull(),
    pickupOptionTypeId: integer("pickup_option_type_id").notNull(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).default(sql`CURRENT_TIMESTAMP`),
    createdById: integer("created_by_id"),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      mode: "string",
    }).default(sql`CURRENT_TIMESTAMP`),
    updatedById: integer("updated_by_id"),
    isActive: boolean("is_active").default(true),
    isDeleted: boolean("is_deleted").default(false),
  },
  (table) => [
    foreignKey({
      columns: [table.createdById],
      foreignColumns: [users.id],
      name: "partner_pickup_options_created_by_id_fkey",
    }),
    foreignKey({
      columns: [table.partnerId],
      foreignColumns: [partners.id],
      name: "partner_pickup_options_partner_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.pickupOptionTypeId],
      foreignColumns: [pickupOptionTypes.id],
      name: "partner_pickup_options_pickup_option_type_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.updatedById],
      foreignColumns: [users.id],
      name: "partner_pickup_options_updated_by_id_fkey",
    }),
    unique("partner_pickup_options_partner_id_pickup_option_type_id_key").on(
      table.partnerId,
      table.pickupOptionTypeId
    ),
  ]
);

export const requests = pgTable(
  "requests",
  {
    id: serial().primaryKey().notNull(),
    requestNumber: varchar("request_number", { length: 50 }).notNull(),
    customerId: integer("customer_id").notNull(),
    customerPhone: varchar("customer_phone", { length: 50 }).notNull(),
    customerName: varchar("customer_name", { length: 255 }).notNull(),
    customerLat: numeric("customer_lat", { precision: 10, scale: 8 }).notNull(),
    customerLng: numeric("customer_lng", { precision: 11, scale: 8 }).notNull(),
    customerAddress: text("customer_address").notNull(),
    categoryId: integer("category_id").notNull(),
    serviceId: integer("service_id"),
    pickupOptionId: integer("pickup_option_id").notNull(),
    partnerId: integer("partner_id"),
    branchId: integer("branch_id"),
    assignedByUserId: integer("assigned_by_user_id"),
    assignedAt: timestamp("assigned_at", {
      withTimezone: true,
      mode: "string",
    }),
    status: requestStatusEnum().default("submitted"),
    slaDeadline: timestamp("sla_deadline", {
      withTimezone: true,
      mode: "string",
    }),
    submittedAt: timestamp("submitted_at", {
      withTimezone: true,
      mode: "string",
    }).default(sql`CURRENT_TIMESTAMP`),
    confirmedAt: timestamp("confirmed_at", {
      withTimezone: true,
      mode: "string",
    }),
    rejectedAt: timestamp("rejected_at", {
      withTimezone: true,
      mode: "string",
    }),
    inProgressAt: timestamp("in_progress_at", {
      withTimezone: true,
      mode: "string",
    }),
    completedAt: timestamp("completed_at", {
      withTimezone: true,
      mode: "string",
    }),
    closedAt: timestamp("closed_at", { withTimezone: true, mode: "string" }),
    closedByUserId: integer("closed_by_user_id"),
    rating: integer(),
    feedback: text(),
    ratedAt: timestamp("rated_at", { withTimezone: true, mode: "string" }),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).default(sql`CURRENT_TIMESTAMP`),
    createdById: integer("created_by_id"),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      mode: "string",
    }).default(sql`CURRENT_TIMESTAMP`),
    updatedById: integer("updated_by_id"),
    isActive: boolean("is_active").default(true),
    isDeleted: boolean("is_deleted").default(false),
    metadata: jsonb(),
  },
  (table) => [
    index("idx_requests_branch_id").using(
      "btree",
      table.branchId.asc().nullsLast().op("int4_ops")
    ),
    index("idx_requests_category_id").using(
      "btree",
      table.categoryId.asc().nullsLast().op("int4_ops")
    ),
    index("idx_requests_created_at").using(
      "btree",
      table.createdAt.asc().nullsLast().op("timestamptz_ops")
    ),
    index("idx_requests_customer_id").using(
      "btree",
      table.customerId.asc().nullsLast().op("int4_ops")
    ),
    index("idx_requests_metadata").using(
      "gin",
      table.metadata.asc().nullsLast().op("jsonb_ops")
    ),
    index("idx_requests_partner_id").using(
      "btree",
      table.partnerId.asc().nullsLast().op("int4_ops")
    ),
    index("idx_requests_request_number").using(
      "btree",
      table.requestNumber.asc().nullsLast().op("text_ops")
    ),
    index("idx_requests_sla_deadline")
      .using("btree", table.slaDeadline.asc().nullsLast().op("timestamptz_ops"))
      .where(sql`(status = 'assigned'::request_status_enum)`),
    index("idx_requests_status").using(
      "btree",
      table.status.asc().nullsLast().op("enum_ops")
    ),
    index("idx_requests_submitted_at").using(
      "btree",
      table.submittedAt.asc().nullsLast().op("timestamptz_ops")
    ),
    foreignKey({
      columns: [table.assignedByUserId],
      foreignColumns: [users.id],
      name: "requests_assigned_by_user_id_fkey",
    }),
    foreignKey({
      columns: [table.branchId],
      foreignColumns: [branches.id],
      name: "requests_branch_id_fkey",
    }).onDelete("set null"),
    foreignKey({
      columns: [table.categoryId],
      foreignColumns: [categories.id],
      name: "requests_category_id_fkey",
    }).onDelete("restrict"),
    foreignKey({
      columns: [table.closedByUserId],
      foreignColumns: [users.id],
      name: "requests_closed_by_user_id_fkey",
    }),
    foreignKey({
      columns: [table.createdById],
      foreignColumns: [users.id],
      name: "requests_created_by_id_fkey",
    }),
    foreignKey({
      columns: [table.customerId],
      foreignColumns: [users.id],
      name: "requests_customer_id_fkey",
    }).onDelete("restrict"),
    foreignKey({
      columns: [table.partnerId],
      foreignColumns: [partners.id],
      name: "requests_partner_id_fkey",
    }).onDelete("set null"),
    foreignKey({
      columns: [table.pickupOptionId],
      foreignColumns: [pickupOptionTypes.id],
      name: "requests_pickup_option_id_fkey",
    }).onDelete("restrict"),
    foreignKey({
      columns: [table.serviceId],
      foreignColumns: [services.id],
      name: "requests_service_id_fkey",
    }).onDelete("restrict"),
    foreignKey({
      columns: [table.updatedById],
      foreignColumns: [users.id],
      name: "requests_updated_by_id_fkey",
    }),
    unique("requests_request_number_key").on(table.requestNumber),
    check("requests_rating_check", sql`(rating >= 1) AND (rating <= 5)`),
  ]
);

export const requestAssignments = pgTable(
  "request_assignments",
  {
    id: serial().primaryKey().notNull(),
    requestId: integer("request_id").notNull(),
    partnerId: integer("partner_id").notNull(),
    branchId: integer("branch_id").notNull(),
    assignedByUserId: integer("assigned_by_user_id").notNull(),
    assignedAt: timestamp("assigned_at", {
      withTimezone: true,
      mode: "string",
    }).default(sql`CURRENT_TIMESTAMP`),
    respondedAt: timestamp("responded_at", {
      withTimezone: true,
      mode: "string",
    }),
    response: assignmentResponseEnum().default("pending"),
    rejectionReason: text("rejection_reason"),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).default(sql`CURRENT_TIMESTAMP`),
    isActive: boolean("is_active").default(true),
  },
  (table) => [
    index("idx_request_assignments_partner_id").using(
      "btree",
      table.partnerId.asc().nullsLast().op("int4_ops")
    ),
    index("idx_request_assignments_request_id").using(
      "btree",
      table.requestId.asc().nullsLast().op("int4_ops")
    ),
    index("idx_request_assignments_response").using(
      "btree",
      table.response.asc().nullsLast().op("enum_ops")
    ),
    foreignKey({
      columns: [table.assignedByUserId],
      foreignColumns: [users.id],
      name: "request_assignments_assigned_by_user_id_fkey",
    }),
    foreignKey({
      columns: [table.branchId],
      foreignColumns: [branches.id],
      name: "request_assignments_branch_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.partnerId],
      foreignColumns: [partners.id],
      name: "request_assignments_partner_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.requestId],
      foreignColumns: [requests.id],
      name: "request_assignments_request_id_fkey",
    }).onDelete("cascade"),
  ]
);

export const requestStatusLog = pgTable(
  "request_status_log",
  {
    id: serial().primaryKey().notNull(),
    requestId: integer("request_id").notNull(),
    status: requestStatusEnum().notNull(),
    changedById: integer("changed_by_id").notNull(),
    notes: text(),
    timestamp: timestamp({ withTimezone: true, mode: "string" }).default(
      sql`CURRENT_TIMESTAMP`
    ),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).default(sql`CURRENT_TIMESTAMP`),
    createdById: integer("created_by_id"),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      mode: "string",
    }).default(sql`CURRENT_TIMESTAMP`),
    updatedById: integer("updated_by_id"),
    isActive: boolean("is_active").default(true),
    isDeleted: boolean("is_deleted").default(false),
  },
  (table) => [
    index("idx_request_status_log_request_id").using(
      "btree",
      table.requestId.asc().nullsLast().op("int4_ops")
    ),
    index("idx_request_status_log_timestamp").using(
      "btree",
      table.timestamp.asc().nullsLast().op("timestamptz_ops")
    ),
    foreignKey({
      columns: [table.changedById],
      foreignColumns: [users.id],
      name: "request_status_log_changed_by_id_fkey",
    }),
    foreignKey({
      columns: [table.createdById],
      foreignColumns: [users.id],
      name: "request_status_log_created_by_id_fkey",
    }),
    foreignKey({
      columns: [table.requestId],
      foreignColumns: [requests.id],
      name: "request_status_log_request_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.updatedById],
      foreignColumns: [users.id],
      name: "request_status_log_updated_by_id_fkey",
    }),
  ]
);

export const notifications = pgTable(
  "notifications",
  {
    id: serial().primaryKey().notNull(),
    userId: integer("user_id").notNull(),
    title: varchar({ length: 255 }).notNull(),
    titleAr: varchar("title_ar", { length: 255 }),
    body: text().notNull(),
    bodyAr: text("body_ar"),
    type: notificationTypeEnum().default("general"),
    requestId: integer("request_id"),
    actionUrl: text("action_url"),
    read: boolean().default(false),
    readAt: timestamp("read_at", { withTimezone: true, mode: "string" }),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).default(sql`CURRENT_TIMESTAMP`),
    createdById: integer("created_by_id"),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      mode: "string",
    }).default(sql`CURRENT_TIMESTAMP`),
    updatedById: integer("updated_by_id"),
    isActive: boolean("is_active").default(true),
    isDeleted: boolean("is_deleted").default(false),
  },
  (table) => [
    index("idx_notifications_created_at").using(
      "btree",
      table.createdAt.asc().nullsLast().op("timestamptz_ops")
    ),
    index("idx_notifications_read")
      .using(
        "btree",
        table.read.asc().nullsLast().op("bool_ops"),
        table.userId.asc().nullsLast().op("int4_ops")
      )
      .where(sql`(is_deleted = false)`),
    index("idx_notifications_request_id")
      .using("btree", table.requestId.asc().nullsLast().op("int4_ops"))
      .where(sql`(request_id IS NOT NULL)`),
    index("idx_notifications_user_id")
      .using("btree", table.userId.asc().nullsLast().op("int4_ops"))
      .where(sql`(is_deleted = false)`),
    foreignKey({
      columns: [table.createdById],
      foreignColumns: [users.id],
      name: "notifications_created_by_id_fkey",
    }),
    foreignKey({
      columns: [table.requestId],
      foreignColumns: [requests.id],
      name: "notifications_request_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.updatedById],
      foreignColumns: [users.id],
      name: "notifications_updated_by_id_fkey",
    }),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: "notifications_user_id_fkey",
    }).onDelete("cascade"),
  ]
);

export const configurations = pgTable(
  "configurations",
  {
    id: serial().primaryKey().notNull(),
    scope: configScopeEnum().default("global"),
    partnerId: integer("partner_id"),
    key: varchar({ length: 100 }).notNull(),
    value: text().notNull(),
    description: text(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).default(sql`CURRENT_TIMESTAMP`),
    createdById: integer("created_by_id"),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      mode: "string",
    }).default(sql`CURRENT_TIMESTAMP`),
    updatedById: integer("updated_by_id"),
    isActive: boolean("is_active").default(true),
    isDeleted: boolean("is_deleted").default(false),
  },
  (table) => [
    index("idx_configurations_partner_id")
      .using("btree", table.partnerId.asc().nullsLast().op("int4_ops"))
      .where(sql`(partner_id IS NOT NULL)`),
    index("idx_configurations_scope")
      .using("btree", table.scope.asc().nullsLast().op("enum_ops"))
      .where(sql`(is_deleted = false)`),
    foreignKey({
      columns: [table.createdById],
      foreignColumns: [users.id],
      name: "configurations_created_by_id_fkey",
    }),
    foreignKey({
      columns: [table.partnerId],
      foreignColumns: [partners.id],
      name: "configurations_partner_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.updatedById],
      foreignColumns: [users.id],
      name: "configurations_updated_by_id_fkey",
    }),
    unique("unique_config_key").on(table.scope, table.partnerId, table.key),
    check(
      "partner_id_required_for_partner_scope",
      sql`((scope = 'partner'::config_scope_enum) AND (partner_id IS NOT NULL)) OR ((scope = 'global'::config_scope_enum) AND (partner_id IS NULL))`
    ),
  ]
);

export const logs = pgTable(
  "logs",
  {
    id: serial().primaryKey().notNull(),
    action: varchar({ length: 255 }).notNull(),
    actorId: integer("actor_id"),
    actorRoleId: integer("actor_role_id"),
    entityType: varchar("entity_type", { length: 100 }),
    entityId: integer("entity_id"),
    metadata: jsonb(),
    timestamp: timestamp({ withTimezone: true, mode: "string" }).default(
      sql`CURRENT_TIMESTAMP`
    ),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).default(sql`CURRENT_TIMESTAMP`),
    createdById: integer("created_by_id"),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      mode: "string",
    }).default(sql`CURRENT_TIMESTAMP`),
    updatedById: integer("updated_by_id"),
    isActive: boolean("is_active").default(true),
    isDeleted: boolean("is_deleted").default(false),
  },
  (table) => [
    index("idx_logs_actor_id").using(
      "btree",
      table.actorId.asc().nullsLast().op("int4_ops")
    ),
    index("idx_logs_entity_type_id").using(
      "btree",
      table.entityType.asc().nullsLast().op("int4_ops"),
      table.entityId.asc().nullsLast().op("text_ops")
    ),
    index("idx_logs_metadata").using(
      "gin",
      table.metadata.asc().nullsLast().op("jsonb_ops")
    ),
    index("idx_logs_timestamp").using(
      "btree",
      table.timestamp.asc().nullsLast().op("timestamptz_ops")
    ),
    foreignKey({
      columns: [table.actorId],
      foreignColumns: [users.id],
      name: "logs_actor_id_fkey",
    }).onDelete("set null"),
    foreignKey({
      columns: [table.actorRoleId],
      foreignColumns: [roles.id],
      name: "logs_actor_role_id_fkey",
    }),
    foreignKey({
      columns: [table.createdById],
      foreignColumns: [users.id],
      name: "logs_created_by_id_fkey",
    }),
    foreignKey({
      columns: [table.updatedById],
      foreignColumns: [users.id],
      name: "logs_updated_by_id_fkey",
    }),
  ]
);
