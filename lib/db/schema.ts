import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  boolean,
  integer,
  decimal,
  jsonb,
  pgEnum,
  unique,
  check,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";

// ============================================================
// ENUMS
// ============================================================

export const userTypeEnum = pgEnum("user_type_enum", [
  "admin",
  "partner",
  "customer",
  "operation",
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
export const assignmentResponseEnum = pgEnum("assignment_response_enum", [
  "confirmed",
  "rejected",
  "timeout",
  "pending",
]);
export const configScopeEnum = pgEnum("config_scope_enum", [
  "global",
  "partner",
]);
export const partnerStatusEnum = pgEnum("partner_status_enum", [
  "active",
  "inactive",
  "suspended",
]);
export const branchUserRoleEnum = pgEnum("branch_user_role_enum", [
  "branch_manager",
  "technician",
  "viewer",
  "admin",
]);

// ============================================================
// CORE IDENTITY & ACCESS CONTROL
// ============================================================

export const roles = pgTable("roles", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 50 }).notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  createdById: integer("created_by_id"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  updatedById: integer("updated_by_id"),
  isActive: boolean("is_active").default(true),
  isDeleted: boolean("is_deleted").default(false),
});

export const permissions = pgTable("permissions", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  createdById: integer("created_by_id"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  updatedById: integer("updated_by_id"),
  isActive: boolean("is_active").default(true),
  isDeleted: boolean("is_deleted").default(false),
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  phone: varchar("phone", { length: 50 }),
  password: varchar("password", { length: 255 }).notNull(),
  roleId: integer("role_id")
    .notNull()
    .references(() => roles.id, { onDelete: "restrict" }),
  userType: userTypeEnum("user_type").notNull(),
  partnerId: integer("partner_id"),
  languagePreference: varchar("language_preference", { length: 5 }).default(
    "en"
  ),
  emailVerifiedAt: timestamp("email_verified_at", { withTimezone: true }),
  phoneVerifiedAt: timestamp("phone_verified_at", { withTimezone: true }),
  otpEnabled: boolean("otp_enabled").default(false),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  createdById: integer("created_by_id"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  updatedById: integer("updated_by_id"),
  isActive: boolean("is_active").default(true),
  isDeleted: boolean("is_deleted").default(false),
});

export const userPermissions = pgTable(
  "user_permissions",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    permissionId: integer("permission_id")
      .notNull()
      .references(() => permissions.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    createdById: integer("created_by_id").references(() => users.id),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
    updatedById: integer("updated_by_id").references(() => users.id),
    isActive: boolean("is_active").default(true),
    isDeleted: boolean("is_deleted").default(false),
  },
  (table) => ({
    uniqueUserPermission: unique().on(table.userId, table.permissionId),
  })
);

export const rolePermissions = pgTable(
  "role_permissions",
  {
    id: serial("id").primaryKey(),
    roleId: integer("role_id")
      .notNull()
      .references(() => roles.id, { onDelete: "cascade" }),
    permissionId: integer("permission_id")
      .notNull()
      .references(() => permissions.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    createdById: integer("created_by_id").references(() => users.id),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
    updatedById: integer("updated_by_id").references(() => users.id),
    isActive: boolean("is_active").default(true),
    isDeleted: boolean("is_deleted").default(false),
  },
  (table) => ({
    uniqueRolePermission: unique().on(table.roleId, table.permissionId),
  })
);

export const userSessions = pgTable("user_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  sessionId: varchar("session_id", { length: 100 }).notNull().unique(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  deviceInfo: text("device_info"),
  ipAddress: varchar("ip_address", { length: 45 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  isActive: boolean("is_active").default(true),
});

export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  phone: varchar("phone", { length: 50 }).notNull(),
  preferredLanguage: varchar("preferred_language", { length: 5 }).default("en"),
  profilePictureUrl: text("profile_picture_url"),
  defaultLat: decimal("default_lat", { precision: 10, scale: 8 }),
  defaultLng: decimal("default_lng", { precision: 11, scale: 8 }),
  defaultAddress: text("default_address"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  isActive: boolean("is_active").default(true),
});

// ============================================================
// PARTNERS & CATALOG
// ============================================================

export const partners = pgTable("partners", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  status: partnerStatusEnum("status").default("active"),
  logoUrl: text("logo_url"),
  contactEmail: varchar("contact_email", { length: 255 }),
  contactPhone: varchar("contact_phone", { length: 50 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  createdById: integer("created_by_id").references(() => users.id),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  updatedById: integer("updated_by_id").references(() => users.id),
  isActive: boolean("is_active").default(true),
  isDeleted: boolean("is_deleted").default(false),
});

export const branches = pgTable("branches", {
  id: serial("id").primaryKey(),
  partnerId: integer("partner_id")
    .notNull()
    .references(() => partners.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  lat: decimal("lat", { precision: 10, scale: 8 }).notNull(),
  lng: decimal("lng", { precision: 11, scale: 8 }).notNull(),
  contactName: varchar("contact_name", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  address: text("address"),
  radiusKm: decimal("radius_km", { precision: 5, scale: 2 }).default("10.0"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  createdById: integer("created_by_id").references(() => users.id),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  updatedById: integer("updated_by_id").references(() => users.id),
  isActive: boolean("is_active").default(true),
  isDeleted: boolean("is_deleted").default(false),
});

export const branchUsers = pgTable(
  "branch_users",
  {
    id: serial("id").primaryKey(),
    branchId: integer("branch_id")
      .notNull()
      .references(() => branches.id, { onDelete: "cascade" }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: branchUserRoleEnum("role").default("viewer"),
    assignedAt: timestamp("assigned_at", { withTimezone: true }).defaultNow(),
    assignedById: integer("assigned_by_id").references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
    isActive: boolean("is_active").default(true),
    isDeleted: boolean("is_deleted").default(false),
  },
  (table) => ({
    uniqueBranchUser: unique().on(table.branchId, table.userId),
  })
);

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  nameAr: varchar("name_ar", { length: 255 }),
  description: text("description"),
  descriptionAr: text("description_ar"),
  iconUrl: text("icon_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  createdById: integer("created_by_id").references(() => users.id),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  updatedById: integer("updated_by_id").references(() => users.id),
  isActive: boolean("is_active").default(true),
  isDeleted: boolean("is_deleted").default(false),
});

export const partnerCategories = pgTable(
  "partner_categories",
  {
    id: serial("id").primaryKey(),
    partnerId: integer("partner_id")
      .notNull()
      .references(() => partners.id, { onDelete: "cascade" }),
    categoryId: integer("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    createdById: integer("created_by_id").references(() => users.id),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
    updatedById: integer("updated_by_id").references(() => users.id),
    isActive: boolean("is_active").default(true),
    isDeleted: boolean("is_deleted").default(false),
  },
  (table) => ({
    uniquePartnerCategory: unique().on(table.partnerId, table.categoryId),
  })
);

export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id")
    .notNull()
    .references(() => categories.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  nameAr: varchar("name_ar", { length: 255 }),
  description: text("description"),
  descriptionAr: text("description_ar"),
  iconUrl: text("icon_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  createdById: integer("created_by_id").references(() => users.id),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  updatedById: integer("updated_by_id").references(() => users.id),
  isActive: boolean("is_active").default(true),
  isDeleted: boolean("is_deleted").default(false),
});

export const pickupOptionTypes = pgTable("pickup_option_types", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  nameAr: varchar("name_ar", { length: 100 }),
  description: text("description"),
  descriptionAr: text("description_ar"),
  requiresServiceSelection: boolean("requires_service_selection").default(
    false
  ),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  createdById: integer("created_by_id").references(() => users.id),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  updatedById: integer("updated_by_id").references(() => users.id),
  isActive: boolean("is_active").default(true),
  isDeleted: boolean("is_deleted").default(false),
});

export const partnerPickupOptions = pgTable(
  "partner_pickup_options",
  {
    id: serial("id").primaryKey(),
    partnerId: integer("partner_id")
      .notNull()
      .references(() => partners.id, { onDelete: "cascade" }),
    pickupOptionTypeId: integer("pickup_option_type_id")
      .notNull()
      .references(() => pickupOptionTypes.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    createdById: integer("created_by_id").references(() => users.id),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
    updatedById: integer("updated_by_id").references(() => users.id),
    isActive: boolean("is_active").default(true),
    isDeleted: boolean("is_deleted").default(false),
  },
  (table) => ({
    uniquePartnerPickupOption: unique().on(
      table.partnerId,
      table.pickupOptionTypeId
    ),
  })
);

// ============================================================
// REQUESTS & OPERATIONS
// ============================================================

export const requests = pgTable(
  "requests",
  {
    id: serial("id").primaryKey(),
    requestNumber: varchar("request_number", { length: 50 }).notNull().unique(),

    // Customer Information
    customerId: integer("customer_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    customerPhone: varchar("customer_phone", { length: 50 }).notNull(),
    customerName: varchar("customer_name", { length: 255 }).notNull(),
    customerLat: decimal("customer_lat", { precision: 10, scale: 8 }).notNull(),
    customerLng: decimal("customer_lng", { precision: 11, scale: 8 }).notNull(),
    customerAddress: text("customer_address").notNull(),

    // Service Selection
    categoryId: integer("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "restrict" }),
    serviceId: integer("service_id").references(() => services.id, {
      onDelete: "restrict",
    }),
    pickupOptionId: integer("pickup_option_id")
      .notNull()
      .references(() => pickupOptionTypes.id, { onDelete: "restrict" }),

    // Assignment
    partnerId: integer("partner_id").references(() => partners.id, {
      onDelete: "set null",
    }),
    branchId: integer("branch_id").references(() => branches.id, {
      onDelete: "set null",
    }),
    assignedByUserId: integer("assigned_by_user_id").references(() => users.id),
    assignedAt: timestamp("assigned_at", { withTimezone: true }),

    // Status & Lifecycle
    status: requestStatusEnum("status").default("submitted"),
    slaDeadline: timestamp("sla_deadline", { withTimezone: true }),

    // Timestamps
    submittedAt: timestamp("submitted_at", { withTimezone: true }).defaultNow(),
    confirmedAt: timestamp("confirmed_at", { withTimezone: true }),
    rejectedAt: timestamp("rejected_at", { withTimezone: true }),
    inProgressAt: timestamp("in_progress_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    closedAt: timestamp("closed_at", { withTimezone: true }),
    closedByUserId: integer("closed_by_user_id").references(() => users.id),

    // Feedback
    rating: integer("rating"),
    feedback: text("feedback"),
    ratedAt: timestamp("rated_at", { withTimezone: true }),

    // Audit
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    createdById: integer("created_by_id").references(() => users.id),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
    updatedById: integer("updated_by_id").references(() => users.id),
    isActive: boolean("is_active").default(true),
    isDeleted: boolean("is_deleted").default(false),
  },
  (table) => ({
    ratingCheck: check(
      "rating_check",
      sql`${table.rating} >= 1 AND ${table.rating} <= 5`
    ),
  })
);

export const requestAssignments = pgTable("request_assignments", {
  id: serial("id").primaryKey(),
  requestId: integer("request_id")
    .notNull()
    .references(() => requests.id, { onDelete: "cascade" }),
  partnerId: integer("partner_id")
    .notNull()
    .references(() => partners.id, { onDelete: "cascade" }),
  branchId: integer("branch_id")
    .notNull()
    .references(() => branches.id, { onDelete: "cascade" }),
  assignedByUserId: integer("assigned_by_user_id")
    .notNull()
    .references(() => users.id),
  assignedAt: timestamp("assigned_at", { withTimezone: true }).defaultNow(),
  respondedAt: timestamp("responded_at", { withTimezone: true }),
  response: assignmentResponseEnum("response").default("pending"),
  rejectionReason: text("rejection_reason"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  isActive: boolean("is_active").default(true),
});

export const requestStatusLog = pgTable("request_status_log", {
  id: serial("id").primaryKey(),
  requestId: integer("request_id")
    .notNull()
    .references(() => requests.id, { onDelete: "cascade" }),
  status: requestStatusEnum("status").notNull(),
  changedById: integer("changed_by_id")
    .notNull()
    .references(() => users.id),
  notes: text("notes"),
  timestamp: timestamp("timestamp", { withTimezone: true }).defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  createdById: integer("created_by_id").references(() => users.id),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  updatedById: integer("updated_by_id").references(() => users.id),
  isActive: boolean("is_active").default(true),
  isDeleted: boolean("is_deleted").default(false),
});

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  titleAr: varchar("title_ar", { length: 255 }),
  body: text("body").notNull(),
  bodyAr: text("body_ar"),
  type: notificationTypeEnum("type").default("general"),
  requestId: integer("request_id").references(() => requests.id, {
    onDelete: "cascade",
  }),
  actionUrl: text("action_url"),
  read: boolean("read").default(false),
  readAt: timestamp("read_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  createdById: integer("created_by_id").references(() => users.id),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  updatedById: integer("updated_by_id").references(() => users.id),
  isActive: boolean("is_active").default(true),
  isDeleted: boolean("is_deleted").default(false),
});

// ============================================================
// CONFIGURATION & LOGGING
// ============================================================

export const configurations = pgTable(
  "configurations",
  {
    id: serial("id").primaryKey(),
    scope: configScopeEnum("scope").default("global"),
    partnerId: integer("partner_id").references(() => partners.id, {
      onDelete: "cascade",
    }),
    key: varchar("key", { length: 100 }).notNull(),
    value: text("value").notNull(),
    description: text("description"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    createdById: integer("created_by_id").references(() => users.id),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
    updatedById: integer("updated_by_id").references(() => users.id),
    isActive: boolean("is_active").default(true),
    isDeleted: boolean("is_deleted").default(false),
  },
  (table) => ({
    uniqueConfigKey: unique().on(table.scope, table.partnerId, table.key),
    partnerIdRequiredForPartnerScope: check(
      "partner_id_required_for_partner_scope",
      sql`(scope = 'partner' AND partner_id IS NOT NULL) OR (scope = 'global' AND partner_id IS NULL)`
    ),
  })
);

export const logs = pgTable("logs", {
  id: serial("id").primaryKey(),
  action: varchar("action", { length: 255 }).notNull(),
  actorId: integer("actor_id").references(() => users.id, {
    onDelete: "set null",
  }),
  actorRoleId: integer("actor_role_id").references(() => roles.id),
  entityType: varchar("entity_type", { length: 100 }),
  entityId: integer("entity_id"),
  metadata: jsonb("metadata"),
  timestamp: timestamp("timestamp", { withTimezone: true }).defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  createdById: integer("created_by_id").references(() => users.id),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  updatedById: integer("updated_by_id").references(() => users.id),
  isActive: boolean("is_active").default(true),
  isDeleted: boolean("is_deleted").default(false),
});

// ============================================================
// RELATIONS
// ============================================================

// Users relations
export const usersRelations = relations(users, ({ one, many }) => ({
  role: one(roles, {
    fields: [users.roleId],
    references: [roles.id],
  }),
  partner: one(partners, {
    fields: [users.partnerId],
    references: [partners.id],
  }),
  userPermissions: many(userPermissions),
  userSessions: many(userSessions),
  customer: one(customers, {
    fields: [users.id],
    references: [customers.userId],
  }),
  createdRequests: many(requests, { relationName: "createdRequests" }),
  assignedRequests: many(requests, { relationName: "assignedRequests" }),
  closedRequests: many(requests, { relationName: "closedRequests" }),
  requestStatusLogs: many(requestStatusLog),
  notifications: many(notifications),
  logs: many(logs),
}));

// Roles relations
export const rolesRelations = relations(roles, ({ many }) => ({
  users: many(users),
  rolePermissions: many(rolePermissions),
  logs: many(logs),
}));

// Permissions relations
export const permissionsRelations = relations(permissions, ({ many }) => ({
  userPermissions: many(userPermissions),
  rolePermissions: many(rolePermissions),
}));

// User permissions relations
export const userPermissionsRelations = relations(
  userPermissions,
  ({ one }) => ({
    user: one(users, {
      fields: [userPermissions.userId],
      references: [users.id],
    }),
    permission: one(permissions, {
      fields: [userPermissions.permissionId],
      references: [permissions.id],
    }),
  })
);

// Role permissions relations
export const rolePermissionsRelations = relations(
  rolePermissions,
  ({ one }) => ({
    role: one(roles, {
      fields: [rolePermissions.roleId],
      references: [roles.id],
    }),
    permission: one(permissions, {
      fields: [rolePermissions.permissionId],
      references: [permissions.id],
    }),
  })
);

// User sessions relations
export const userSessionsRelations = relations(userSessions, ({ one }) => ({
  user: one(users, {
    fields: [userSessions.userId],
    references: [users.id],
  }),
}));

// Customers relations
export const customersRelations = relations(customers, ({ one }) => ({
  user: one(users, {
    fields: [customers.userId],
    references: [users.id],
  }),
}));

// Partners relations
export const partnersRelations = relations(partners, ({ many }) => ({
  users: many(users),
  branches: many(branches),
  partnerCategories: many(partnerCategories),
  partnerPickupOptions: many(partnerPickupOptions),
  requests: many(requests),
  requestAssignments: many(requestAssignments),
  configurations: many(configurations),
}));

// Branches relations
export const branchesRelations = relations(branches, ({ one, many }) => ({
  partner: one(partners, {
    fields: [branches.partnerId],
    references: [partners.id],
  }),
  branchUsers: many(branchUsers),
  requests: many(requests),
  requestAssignments: many(requestAssignments),
}));

// Branch users relations
export const branchUsersRelations = relations(branchUsers, ({ one }) => ({
  branch: one(branches, {
    fields: [branchUsers.branchId],
    references: [branches.id],
  }),
  user: one(users, {
    fields: [branchUsers.userId],
    references: [users.id],
  }),
}));

// Categories relations
export const categoriesRelations = relations(categories, ({ many }) => ({
  services: many(services),
  partnerCategories: many(partnerCategories),
  requests: many(requests),
}));

// Partner categories relations
export const partnerCategoriesRelations = relations(
  partnerCategories,
  ({ one }) => ({
    partner: one(partners, {
      fields: [partnerCategories.partnerId],
      references: [partners.id],
    }),
    category: one(categories, {
      fields: [partnerCategories.categoryId],
      references: [categories.id],
    }),
  })
);

// Services relations
export const servicesRelations = relations(services, ({ one, many }) => ({
  category: one(categories, {
    fields: [services.categoryId],
    references: [categories.id],
  }),
  requests: many(requests),
}));

// Pickup option types relations
export const pickupOptionTypesRelations = relations(
  pickupOptionTypes,
  ({ many }) => ({
    partnerPickupOptions: many(partnerPickupOptions),
    requests: many(requests),
  })
);

// Partner pickup options relations
export const partnerPickupOptionsRelations = relations(
  partnerPickupOptions,
  ({ one }) => ({
    partner: one(partners, {
      fields: [partnerPickupOptions.partnerId],
      references: [partners.id],
    }),
    pickupOptionType: one(pickupOptionTypes, {
      fields: [partnerPickupOptions.pickupOptionTypeId],
      references: [pickupOptionTypes.id],
    }),
  })
);

// Requests relations
export const requestsRelations = relations(requests, ({ one, many }) => ({
  customer: one(users, {
    fields: [requests.customerId],
    references: [users.id],
    relationName: "customerRequests",
  }),
  category: one(categories, {
    fields: [requests.categoryId],
    references: [categories.id],
  }),
  service: one(services, {
    fields: [requests.serviceId],
    references: [services.id],
  }),
  pickupOption: one(pickupOptionTypes, {
    fields: [requests.pickupOptionId],
    references: [pickupOptionTypes.id],
  }),
  partner: one(partners, {
    fields: [requests.partnerId],
    references: [partners.id],
  }),
  branch: one(branches, {
    fields: [requests.branchId],
    references: [branches.id],
  }),
  assignedByUser: one(users, {
    fields: [requests.assignedByUserId],
    references: [users.id],
    relationName: "assignedRequests",
  }),
  closedByUser: one(users, {
    fields: [requests.closedByUserId],
    references: [users.id],
    relationName: "closedRequests",
  }),
  requestAssignments: many(requestAssignments),
  requestStatusLogs: many(requestStatusLog),
  notifications: many(notifications),
}));

// Request assignments relations
export const requestAssignmentsRelations = relations(
  requestAssignments,
  ({ one }) => ({
    request: one(requests, {
      fields: [requestAssignments.requestId],
      references: [requests.id],
    }),
    partner: one(partners, {
      fields: [requestAssignments.partnerId],
      references: [partners.id],
    }),
    branch: one(branches, {
      fields: [requestAssignments.branchId],
      references: [branches.id],
    }),
    assignedByUser: one(users, {
      fields: [requestAssignments.assignedByUserId],
      references: [users.id],
    }),
  })
);

// Request status log relations
export const requestStatusLogRelations = relations(
  requestStatusLog,
  ({ one }) => ({
    request: one(requests, {
      fields: [requestStatusLog.requestId],
      references: [requests.id],
    }),
    changedBy: one(users, {
      fields: [requestStatusLog.changedById],
      references: [users.id],
    }),
  })
);

// Notifications relations
export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
  request: one(requests, {
    fields: [notifications.requestId],
    references: [requests.id],
  }),
}));

// Configurations relations
export const configurationsRelations = relations(configurations, ({ one }) => ({
  partner: one(partners, {
    fields: [configurations.partnerId],
    references: [partners.id],
  }),
}));

// Logs relations
export const logsRelations = relations(logs, ({ one }) => ({
  actor: one(users, {
    fields: [logs.actorId],
    references: [users.id],
  }),
  actorRole: one(roles, {
    fields: [logs.actorRoleId],
    references: [roles.id],
  }),
}));

// ============================================================
// TYPES
// ============================================================

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Role = typeof roles.$inferSelect;
export type NewRole = typeof roles.$inferInsert;
export type Permission = typeof permissions.$inferSelect;
export type NewPermission = typeof permissions.$inferInsert;
export type Customer = typeof customers.$inferSelect;
export type NewCustomer = typeof customers.$inferInsert;
export type Partner = typeof partners.$inferSelect;
export type NewPartner = typeof partners.$inferInsert;
export type Branch = typeof branches.$inferSelect;
export type NewBranch = typeof branches.$inferInsert;
export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
export type Service = typeof services.$inferSelect;
export type NewService = typeof services.$inferInsert;
export type Request = typeof requests.$inferSelect;
export type NewRequest = typeof requests.$inferInsert;
export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;
export type Configuration = typeof configurations.$inferSelect;
export type NewConfiguration = typeof configurations.$inferInsert;
export type UserSessions = typeof userSessions.$inferInsert;
