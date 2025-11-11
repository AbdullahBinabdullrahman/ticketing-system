import { relations } from "drizzle-orm/relations";
import { partners, users, roles, userPermissions, permissions, rolePermissions, userSessions, customers, branches, branchUsers, categories, partnerCategories, services, pickupOptionTypes, partnerPickupOptions, requests, requestAssignments, requestStatusLog, notifications, configurations, logs } from "./schema";

export const usersRelations = relations(users, ({one, many}) => ({
	partner: one(partners, {
		fields: [users.partnerId],
		references: [partners.id],
		relationName: "users_partnerId_partners_id"
	}),
	role: one(roles, {
		fields: [users.roleId],
		references: [roles.id]
	}),
	userPermissions_createdById: many(userPermissions, {
		relationName: "userPermissions_createdById_users_id"
	}),
	userPermissions_updatedById: many(userPermissions, {
		relationName: "userPermissions_updatedById_users_id"
	}),
	userPermissions_userId: many(userPermissions, {
		relationName: "userPermissions_userId_users_id"
	}),
	rolePermissions_createdById: many(rolePermissions, {
		relationName: "rolePermissions_createdById_users_id"
	}),
	rolePermissions_updatedById: many(rolePermissions, {
		relationName: "rolePermissions_updatedById_users_id"
	}),
	userSessions: many(userSessions),
	customers: many(customers),
	partners_createdById: many(partners, {
		relationName: "partners_createdById_users_id"
	}),
	partners_updatedById: many(partners, {
		relationName: "partners_updatedById_users_id"
	}),
	branches_createdById: many(branches, {
		relationName: "branches_createdById_users_id"
	}),
	branches_updatedById: many(branches, {
		relationName: "branches_updatedById_users_id"
	}),
	branchUsers_assignedById: many(branchUsers, {
		relationName: "branchUsers_assignedById_users_id"
	}),
	branchUsers_userId: many(branchUsers, {
		relationName: "branchUsers_userId_users_id"
	}),
	categories_createdById: many(categories, {
		relationName: "categories_createdById_users_id"
	}),
	categories_updatedById: many(categories, {
		relationName: "categories_updatedById_users_id"
	}),
	partnerCategories_createdById: many(partnerCategories, {
		relationName: "partnerCategories_createdById_users_id"
	}),
	partnerCategories_updatedById: many(partnerCategories, {
		relationName: "partnerCategories_updatedById_users_id"
	}),
	services_createdById: many(services, {
		relationName: "services_createdById_users_id"
	}),
	services_updatedById: many(services, {
		relationName: "services_updatedById_users_id"
	}),
	pickupOptionTypes_createdById: many(pickupOptionTypes, {
		relationName: "pickupOptionTypes_createdById_users_id"
	}),
	pickupOptionTypes_updatedById: many(pickupOptionTypes, {
		relationName: "pickupOptionTypes_updatedById_users_id"
	}),
	partnerPickupOptions_createdById: many(partnerPickupOptions, {
		relationName: "partnerPickupOptions_createdById_users_id"
	}),
	partnerPickupOptions_updatedById: many(partnerPickupOptions, {
		relationName: "partnerPickupOptions_updatedById_users_id"
	}),
	requests_assignedByUserId: many(requests, {
		relationName: "requests_assignedByUserId_users_id"
	}),
	requests_closedByUserId: many(requests, {
		relationName: "requests_closedByUserId_users_id"
	}),
	requests_createdById: many(requests, {
		relationName: "requests_createdById_users_id"
	}),
	requests_customerId: many(requests, {
		relationName: "requests_customerId_users_id"
	}),
	requests_updatedById: many(requests, {
		relationName: "requests_updatedById_users_id"
	}),
	requestAssignments: many(requestAssignments),
	requestStatusLogs_changedById: many(requestStatusLog, {
		relationName: "requestStatusLog_changedById_users_id"
	}),
	requestStatusLogs_createdById: many(requestStatusLog, {
		relationName: "requestStatusLog_createdById_users_id"
	}),
	requestStatusLogs_updatedById: many(requestStatusLog, {
		relationName: "requestStatusLog_updatedById_users_id"
	}),
	notifications_createdById: many(notifications, {
		relationName: "notifications_createdById_users_id"
	}),
	notifications_updatedById: many(notifications, {
		relationName: "notifications_updatedById_users_id"
	}),
	notifications_userId: many(notifications, {
		relationName: "notifications_userId_users_id"
	}),
	configurations_createdById: many(configurations, {
		relationName: "configurations_createdById_users_id"
	}),
	configurations_updatedById: many(configurations, {
		relationName: "configurations_updatedById_users_id"
	}),
	logs_actorId: many(logs, {
		relationName: "logs_actorId_users_id"
	}),
	logs_createdById: many(logs, {
		relationName: "logs_createdById_users_id"
	}),
	logs_updatedById: many(logs, {
		relationName: "logs_updatedById_users_id"
	}),
}));

export const partnersRelations = relations(partners, ({one, many}) => ({
	users: many(users, {
		relationName: "users_partnerId_partners_id"
	}),
	user_createdById: one(users, {
		fields: [partners.createdById],
		references: [users.id],
		relationName: "partners_createdById_users_id"
	}),
	user_updatedById: one(users, {
		fields: [partners.updatedById],
		references: [users.id],
		relationName: "partners_updatedById_users_id"
	}),
	branches: many(branches),
	partnerCategories: many(partnerCategories),
	partnerPickupOptions: many(partnerPickupOptions),
	requests: many(requests),
	requestAssignments: many(requestAssignments),
	configurations: many(configurations),
}));

export const rolesRelations = relations(roles, ({many}) => ({
	users: many(users),
	rolePermissions: many(rolePermissions),
	logs: many(logs),
}));

export const userPermissionsRelations = relations(userPermissions, ({one}) => ({
	user_createdById: one(users, {
		fields: [userPermissions.createdById],
		references: [users.id],
		relationName: "userPermissions_createdById_users_id"
	}),
	permission: one(permissions, {
		fields: [userPermissions.permissionId],
		references: [permissions.id]
	}),
	user_updatedById: one(users, {
		fields: [userPermissions.updatedById],
		references: [users.id],
		relationName: "userPermissions_updatedById_users_id"
	}),
	user_userId: one(users, {
		fields: [userPermissions.userId],
		references: [users.id],
		relationName: "userPermissions_userId_users_id"
	}),
}));

export const permissionsRelations = relations(permissions, ({many}) => ({
	userPermissions: many(userPermissions),
	rolePermissions: many(rolePermissions),
}));

export const rolePermissionsRelations = relations(rolePermissions, ({one}) => ({
	user_createdById: one(users, {
		fields: [rolePermissions.createdById],
		references: [users.id],
		relationName: "rolePermissions_createdById_users_id"
	}),
	permission: one(permissions, {
		fields: [rolePermissions.permissionId],
		references: [permissions.id]
	}),
	role: one(roles, {
		fields: [rolePermissions.roleId],
		references: [roles.id]
	}),
	user_updatedById: one(users, {
		fields: [rolePermissions.updatedById],
		references: [users.id],
		relationName: "rolePermissions_updatedById_users_id"
	}),
}));

export const userSessionsRelations = relations(userSessions, ({one}) => ({
	user: one(users, {
		fields: [userSessions.userId],
		references: [users.id]
	}),
}));

export const customersRelations = relations(customers, ({one}) => ({
	user: one(users, {
		fields: [customers.userId],
		references: [users.id]
	}),
}));

export const branchesRelations = relations(branches, ({one, many}) => ({
	user_createdById: one(users, {
		fields: [branches.createdById],
		references: [users.id],
		relationName: "branches_createdById_users_id"
	}),
	partner: one(partners, {
		fields: [branches.partnerId],
		references: [partners.id]
	}),
	user_updatedById: one(users, {
		fields: [branches.updatedById],
		references: [users.id],
		relationName: "branches_updatedById_users_id"
	}),
	branchUsers: many(branchUsers),
	requests: many(requests),
	requestAssignments: many(requestAssignments),
}));

export const branchUsersRelations = relations(branchUsers, ({one}) => ({
	user_assignedById: one(users, {
		fields: [branchUsers.assignedById],
		references: [users.id],
		relationName: "branchUsers_assignedById_users_id"
	}),
	branch: one(branches, {
		fields: [branchUsers.branchId],
		references: [branches.id]
	}),
	user_userId: one(users, {
		fields: [branchUsers.userId],
		references: [users.id],
		relationName: "branchUsers_userId_users_id"
	}),
}));

export const categoriesRelations = relations(categories, ({one, many}) => ({
	user_createdById: one(users, {
		fields: [categories.createdById],
		references: [users.id],
		relationName: "categories_createdById_users_id"
	}),
	user_updatedById: one(users, {
		fields: [categories.updatedById],
		references: [users.id],
		relationName: "categories_updatedById_users_id"
	}),
	partnerCategories: many(partnerCategories),
	services: many(services),
	requests: many(requests),
}));

export const partnerCategoriesRelations = relations(partnerCategories, ({one}) => ({
	category: one(categories, {
		fields: [partnerCategories.categoryId],
		references: [categories.id]
	}),
	user_createdById: one(users, {
		fields: [partnerCategories.createdById],
		references: [users.id],
		relationName: "partnerCategories_createdById_users_id"
	}),
	partner: one(partners, {
		fields: [partnerCategories.partnerId],
		references: [partners.id]
	}),
	user_updatedById: one(users, {
		fields: [partnerCategories.updatedById],
		references: [users.id],
		relationName: "partnerCategories_updatedById_users_id"
	}),
}));

export const servicesRelations = relations(services, ({one, many}) => ({
	category: one(categories, {
		fields: [services.categoryId],
		references: [categories.id]
	}),
	user_createdById: one(users, {
		fields: [services.createdById],
		references: [users.id],
		relationName: "services_createdById_users_id"
	}),
	user_updatedById: one(users, {
		fields: [services.updatedById],
		references: [users.id],
		relationName: "services_updatedById_users_id"
	}),
	requests: many(requests),
}));

export const pickupOptionTypesRelations = relations(pickupOptionTypes, ({one, many}) => ({
	user_createdById: one(users, {
		fields: [pickupOptionTypes.createdById],
		references: [users.id],
		relationName: "pickupOptionTypes_createdById_users_id"
	}),
	user_updatedById: one(users, {
		fields: [pickupOptionTypes.updatedById],
		references: [users.id],
		relationName: "pickupOptionTypes_updatedById_users_id"
	}),
	partnerPickupOptions: many(partnerPickupOptions),
	requests: many(requests),
}));

export const partnerPickupOptionsRelations = relations(partnerPickupOptions, ({one}) => ({
	user_createdById: one(users, {
		fields: [partnerPickupOptions.createdById],
		references: [users.id],
		relationName: "partnerPickupOptions_createdById_users_id"
	}),
	partner: one(partners, {
		fields: [partnerPickupOptions.partnerId],
		references: [partners.id]
	}),
	pickupOptionType: one(pickupOptionTypes, {
		fields: [partnerPickupOptions.pickupOptionTypeId],
		references: [pickupOptionTypes.id]
	}),
	user_updatedById: one(users, {
		fields: [partnerPickupOptions.updatedById],
		references: [users.id],
		relationName: "partnerPickupOptions_updatedById_users_id"
	}),
}));

export const requestsRelations = relations(requests, ({one, many}) => ({
	user_assignedByUserId: one(users, {
		fields: [requests.assignedByUserId],
		references: [users.id],
		relationName: "requests_assignedByUserId_users_id"
	}),
	branch: one(branches, {
		fields: [requests.branchId],
		references: [branches.id]
	}),
	category: one(categories, {
		fields: [requests.categoryId],
		references: [categories.id]
	}),
	user_closedByUserId: one(users, {
		fields: [requests.closedByUserId],
		references: [users.id],
		relationName: "requests_closedByUserId_users_id"
	}),
	user_createdById: one(users, {
		fields: [requests.createdById],
		references: [users.id],
		relationName: "requests_createdById_users_id"
	}),
	user_customerId: one(users, {
		fields: [requests.customerId],
		references: [users.id],
		relationName: "requests_customerId_users_id"
	}),
	partner: one(partners, {
		fields: [requests.partnerId],
		references: [partners.id]
	}),
	pickupOptionType: one(pickupOptionTypes, {
		fields: [requests.pickupOptionId],
		references: [pickupOptionTypes.id]
	}),
	service: one(services, {
		fields: [requests.serviceId],
		references: [services.id]
	}),
	user_updatedById: one(users, {
		fields: [requests.updatedById],
		references: [users.id],
		relationName: "requests_updatedById_users_id"
	}),
	requestAssignments: many(requestAssignments),
	requestStatusLogs: many(requestStatusLog),
	notifications: many(notifications),
}));

export const requestAssignmentsRelations = relations(requestAssignments, ({one}) => ({
	user: one(users, {
		fields: [requestAssignments.assignedByUserId],
		references: [users.id]
	}),
	branch: one(branches, {
		fields: [requestAssignments.branchId],
		references: [branches.id]
	}),
	partner: one(partners, {
		fields: [requestAssignments.partnerId],
		references: [partners.id]
	}),
	request: one(requests, {
		fields: [requestAssignments.requestId],
		references: [requests.id]
	}),
}));

export const requestStatusLogRelations = relations(requestStatusLog, ({one}) => ({
	user_changedById: one(users, {
		fields: [requestStatusLog.changedById],
		references: [users.id],
		relationName: "requestStatusLog_changedById_users_id"
	}),
	user_createdById: one(users, {
		fields: [requestStatusLog.createdById],
		references: [users.id],
		relationName: "requestStatusLog_createdById_users_id"
	}),
	request: one(requests, {
		fields: [requestStatusLog.requestId],
		references: [requests.id]
	}),
	user_updatedById: one(users, {
		fields: [requestStatusLog.updatedById],
		references: [users.id],
		relationName: "requestStatusLog_updatedById_users_id"
	}),
}));

export const notificationsRelations = relations(notifications, ({one}) => ({
	user_createdById: one(users, {
		fields: [notifications.createdById],
		references: [users.id],
		relationName: "notifications_createdById_users_id"
	}),
	request: one(requests, {
		fields: [notifications.requestId],
		references: [requests.id]
	}),
	user_updatedById: one(users, {
		fields: [notifications.updatedById],
		references: [users.id],
		relationName: "notifications_updatedById_users_id"
	}),
	user_userId: one(users, {
		fields: [notifications.userId],
		references: [users.id],
		relationName: "notifications_userId_users_id"
	}),
}));

export const configurationsRelations = relations(configurations, ({one}) => ({
	user_createdById: one(users, {
		fields: [configurations.createdById],
		references: [users.id],
		relationName: "configurations_createdById_users_id"
	}),
	partner: one(partners, {
		fields: [configurations.partnerId],
		references: [partners.id]
	}),
	user_updatedById: one(users, {
		fields: [configurations.updatedById],
		references: [users.id],
		relationName: "configurations_updatedById_users_id"
	}),
}));

export const logsRelations = relations(logs, ({one}) => ({
	user_actorId: one(users, {
		fields: [logs.actorId],
		references: [users.id],
		relationName: "logs_actorId_users_id"
	}),
	role: one(roles, {
		fields: [logs.actorRoleId],
		references: [roles.id]
	}),
	user_createdById: one(users, {
		fields: [logs.createdById],
		references: [users.id],
		relationName: "logs_createdById_users_id"
	}),
	user_updatedById: one(users, {
		fields: [logs.updatedById],
		references: [users.id],
		relationName: "logs_updatedById_users_id"
	}),
}));