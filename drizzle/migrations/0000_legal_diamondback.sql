-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TYPE "public"."assignment_response_enum" AS ENUM('confirmed', 'rejected', 'timeout', 'pending');--> statement-breakpoint
CREATE TYPE "public"."branch_user_role_enum" AS ENUM('branch_manager', 'technician', 'viewer', 'admin');--> statement-breakpoint
CREATE TYPE "public"."config_scope_enum" AS ENUM('global', 'partner');--> statement-breakpoint
CREATE TYPE "public"."notification_type_enum" AS ENUM('request_submitted', 'request_assigned', 'request_confirmed', 'request_rejected', 'request_in_progress', 'request_completed', 'request_closed', 'partner_timeout', 'sla_reminder', 'general');--> statement-breakpoint
CREATE TYPE "public"."partner_status_enum" AS ENUM('active', 'inactive', 'suspended');--> statement-breakpoint
CREATE TYPE "public"."request_status_enum" AS ENUM('submitted', 'assigned', 'confirmed', 'in_progress', 'completed', 'closed', 'rejected', 'unassigned');--> statement-breakpoint
CREATE TYPE "public"."user_type_enum" AS ENUM('admin', 'partner', 'customer');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "roles" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(50) NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"created_by_id" integer,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"updated_by_id" integer,
	"is_active" boolean DEFAULT true,
	"is_deleted" boolean DEFAULT false,
	CONSTRAINT "roles_name_key" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone" varchar(50),
	"password" varchar(255) NOT NULL,
	"role_id" integer NOT NULL,
	"user_type" "user_type_enum" NOT NULL,
	"partner_id" integer,
	"language_preference" varchar(5) DEFAULT 'en',
	"email_verified_at" timestamp with time zone,
	"phone_verified_at" timestamp with time zone,
	"last_login_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"created_by_id" integer,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"updated_by_id" integer,
	"is_active" boolean DEFAULT true,
	"is_deleted" boolean DEFAULT false,
	CONSTRAINT "users_email_key" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_permissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"permission_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"created_by_id" integer,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"updated_by_id" integer,
	"is_active" boolean DEFAULT true,
	"is_deleted" boolean DEFAULT false,
	CONSTRAINT "user_permissions_user_id_permission_id_key" UNIQUE("user_id","permission_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "permissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"created_by_id" integer,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"updated_by_id" integer,
	"is_active" boolean DEFAULT true,
	"is_deleted" boolean DEFAULT false,
	CONSTRAINT "permissions_name_key" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "role_permissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"role_id" integer NOT NULL,
	"permission_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"created_by_id" integer,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"updated_by_id" integer,
	"is_active" boolean DEFAULT true,
	"is_deleted" boolean DEFAULT false,
	CONSTRAINT "role_permissions_role_id_permission_id_key" UNIQUE("role_id","permission_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"token" varchar(500) NOT NULL,
	"refresh_token" varchar(500) NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"device_info" text,
	"ip_address" varchar(45),
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"is_active" boolean DEFAULT true,
	CONSTRAINT "user_sessions_token_key" UNIQUE("token"),
	CONSTRAINT "user_sessions_refresh_token_key" UNIQUE("refresh_token")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "customers" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"phone" varchar(50) NOT NULL,
	"preferred_language" varchar(5) DEFAULT 'en',
	"profile_picture_url" text,
	"default_lat" numeric(10, 8),
	"default_lng" numeric(11, 8),
	"default_address" text,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"is_active" boolean DEFAULT true,
	CONSTRAINT "customers_user_id_key" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "partners" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"status" "partner_status_enum" DEFAULT 'active',
	"logo_url" text,
	"contact_email" varchar(255),
	"contact_phone" varchar(50),
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"created_by_id" integer,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"updated_by_id" integer,
	"is_active" boolean DEFAULT true,
	"is_deleted" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "branches" (
	"id" serial PRIMARY KEY NOT NULL,
	"partner_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"lat" numeric(10, 8) NOT NULL,
	"lng" numeric(11, 8) NOT NULL,
	"contact_name" varchar(255),
	"phone" varchar(50),
	"address" text,
	"radius_km" numeric(5, 2) DEFAULT '10.0',
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"created_by_id" integer,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"updated_by_id" integer,
	"is_active" boolean DEFAULT true,
	"is_deleted" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "branch_users" (
	"id" serial PRIMARY KEY NOT NULL,
	"branch_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"role" "branch_user_role_enum" DEFAULT 'viewer',
	"assigned_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"assigned_by_id" integer,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"is_active" boolean DEFAULT true,
	"is_deleted" boolean DEFAULT false,
	CONSTRAINT "branch_users_branch_id_user_id_key" UNIQUE("branch_id","user_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"name_ar" varchar(255),
	"description" text,
	"description_ar" text,
	"icon_url" text,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"created_by_id" integer,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"updated_by_id" integer,
	"is_active" boolean DEFAULT true,
	"is_deleted" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "partner_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"partner_id" integer NOT NULL,
	"category_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"created_by_id" integer,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"updated_by_id" integer,
	"is_active" boolean DEFAULT true,
	"is_deleted" boolean DEFAULT false,
	CONSTRAINT "partner_categories_partner_id_category_id_key" UNIQUE("partner_id","category_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "services" (
	"id" serial PRIMARY KEY NOT NULL,
	"category_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"name_ar" varchar(255),
	"description" text,
	"description_ar" text,
	"icon_url" text,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"created_by_id" integer,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"updated_by_id" integer,
	"is_active" boolean DEFAULT true,
	"is_deleted" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "pickup_option_types" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"name_ar" varchar(100),
	"description" text,
	"description_ar" text,
	"requires_service_selection" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"created_by_id" integer,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"updated_by_id" integer,
	"is_active" boolean DEFAULT true,
	"is_deleted" boolean DEFAULT false,
	CONSTRAINT "pickup_option_types_name_key" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "partner_pickup_options" (
	"id" serial PRIMARY KEY NOT NULL,
	"partner_id" integer NOT NULL,
	"pickup_option_type_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"created_by_id" integer,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"updated_by_id" integer,
	"is_active" boolean DEFAULT true,
	"is_deleted" boolean DEFAULT false,
	CONSTRAINT "partner_pickup_options_partner_id_pickup_option_type_id_key" UNIQUE("partner_id","pickup_option_type_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"request_number" varchar(50) NOT NULL,
	"customer_id" integer NOT NULL,
	"customer_phone" varchar(50) NOT NULL,
	"customer_name" varchar(255) NOT NULL,
	"customer_lat" numeric(10, 8) NOT NULL,
	"customer_lng" numeric(11, 8) NOT NULL,
	"customer_address" text NOT NULL,
	"category_id" integer NOT NULL,
	"service_id" integer,
	"pickup_option_id" integer NOT NULL,
	"partner_id" integer,
	"branch_id" integer,
	"assigned_by_user_id" integer,
	"assigned_at" timestamp with time zone,
	"status" "request_status_enum" DEFAULT 'submitted',
	"sla_deadline" timestamp with time zone,
	"submitted_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"confirmed_at" timestamp with time zone,
	"rejected_at" timestamp with time zone,
	"in_progress_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"closed_at" timestamp with time zone,
	"closed_by_user_id" integer,
	"rating" integer,
	"feedback" text,
	"rated_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"created_by_id" integer,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"updated_by_id" integer,
	"is_active" boolean DEFAULT true,
	"is_deleted" boolean DEFAULT false,
	CONSTRAINT "requests_request_number_key" UNIQUE("request_number"),
	CONSTRAINT "requests_rating_check" CHECK ((rating >= 1) AND (rating <= 5))
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "request_assignments" (
	"id" serial PRIMARY KEY NOT NULL,
	"request_id" integer NOT NULL,
	"partner_id" integer NOT NULL,
	"branch_id" integer NOT NULL,
	"assigned_by_user_id" integer NOT NULL,
	"assigned_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"responded_at" timestamp with time zone,
	"response" "assignment_response_enum" DEFAULT 'pending',
	"rejection_reason" text,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"is_active" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "request_status_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"request_id" integer NOT NULL,
	"status" "request_status_enum" NOT NULL,
	"changed_by_id" integer NOT NULL,
	"notes" text,
	"timestamp" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"created_by_id" integer,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"updated_by_id" integer,
	"is_active" boolean DEFAULT true,
	"is_deleted" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"title" varchar(255) NOT NULL,
	"title_ar" varchar(255),
	"body" text NOT NULL,
	"body_ar" text,
	"type" "notification_type_enum" DEFAULT 'general',
	"request_id" integer,
	"action_url" text,
	"read" boolean DEFAULT false,
	"read_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"created_by_id" integer,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"updated_by_id" integer,
	"is_active" boolean DEFAULT true,
	"is_deleted" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "configurations" (
	"id" serial PRIMARY KEY NOT NULL,
	"scope" "config_scope_enum" DEFAULT 'global',
	"partner_id" integer,
	"key" varchar(100) NOT NULL,
	"value" text NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"created_by_id" integer,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"updated_by_id" integer,
	"is_active" boolean DEFAULT true,
	"is_deleted" boolean DEFAULT false,
	CONSTRAINT "unique_config_key" UNIQUE("scope","partner_id","key"),
	CONSTRAINT "partner_id_required_for_partner_scope" CHECK (((scope = 'partner'::config_scope_enum) AND (partner_id IS NOT NULL)) OR ((scope = 'global'::config_scope_enum) AND (partner_id IS NULL)))
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"action" varchar(255) NOT NULL,
	"actor_id" integer,
	"actor_role_id" integer,
	"entity_type" varchar(100),
	"entity_id" integer,
	"metadata" jsonb,
	"timestamp" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"created_by_id" integer,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"updated_by_id" integer,
	"is_active" boolean DEFAULT true,
	"is_deleted" boolean DEFAULT false
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users" ADD CONSTRAINT "fk_users_partner" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users" ADD CONSTRAINT "users_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_permissions" ADD CONSTRAINT "user_permissions_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_permissions" ADD CONSTRAINT "user_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "public"."permissions"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_permissions" ADD CONSTRAINT "user_permissions_updated_by_id_fkey" FOREIGN KEY ("updated_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_permissions" ADD CONSTRAINT "user_permissions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "public"."permissions"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_updated_by_id_fkey" FOREIGN KEY ("updated_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "customers" ADD CONSTRAINT "customers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "partners" ADD CONSTRAINT "partners_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "partners" ADD CONSTRAINT "partners_updated_by_id_fkey" FOREIGN KEY ("updated_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "branches" ADD CONSTRAINT "branches_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "branches" ADD CONSTRAINT "branches_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "branches" ADD CONSTRAINT "branches_updated_by_id_fkey" FOREIGN KEY ("updated_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "branch_users" ADD CONSTRAINT "branch_users_assigned_by_id_fkey" FOREIGN KEY ("assigned_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "branch_users" ADD CONSTRAINT "branch_users_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "branch_users" ADD CONSTRAINT "branch_users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "categories" ADD CONSTRAINT "categories_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "categories" ADD CONSTRAINT "categories_updated_by_id_fkey" FOREIGN KEY ("updated_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "partner_categories" ADD CONSTRAINT "partner_categories_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "partner_categories" ADD CONSTRAINT "partner_categories_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "partner_categories" ADD CONSTRAINT "partner_categories_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "partner_categories" ADD CONSTRAINT "partner_categories_updated_by_id_fkey" FOREIGN KEY ("updated_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "services" ADD CONSTRAINT "services_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "services" ADD CONSTRAINT "services_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "services" ADD CONSTRAINT "services_updated_by_id_fkey" FOREIGN KEY ("updated_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pickup_option_types" ADD CONSTRAINT "pickup_option_types_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pickup_option_types" ADD CONSTRAINT "pickup_option_types_updated_by_id_fkey" FOREIGN KEY ("updated_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "partner_pickup_options" ADD CONSTRAINT "partner_pickup_options_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "partner_pickup_options" ADD CONSTRAINT "partner_pickup_options_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "partner_pickup_options" ADD CONSTRAINT "partner_pickup_options_pickup_option_type_id_fkey" FOREIGN KEY ("pickup_option_type_id") REFERENCES "public"."pickup_option_types"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "partner_pickup_options" ADD CONSTRAINT "partner_pickup_options_updated_by_id_fkey" FOREIGN KEY ("updated_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "requests" ADD CONSTRAINT "requests_assigned_by_user_id_fkey" FOREIGN KEY ("assigned_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "requests" ADD CONSTRAINT "requests_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "requests" ADD CONSTRAINT "requests_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "requests" ADD CONSTRAINT "requests_closed_by_user_id_fkey" FOREIGN KEY ("closed_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "requests" ADD CONSTRAINT "requests_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "requests" ADD CONSTRAINT "requests_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "requests" ADD CONSTRAINT "requests_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "requests" ADD CONSTRAINT "requests_pickup_option_id_fkey" FOREIGN KEY ("pickup_option_id") REFERENCES "public"."pickup_option_types"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "requests" ADD CONSTRAINT "requests_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "requests" ADD CONSTRAINT "requests_updated_by_id_fkey" FOREIGN KEY ("updated_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "request_assignments" ADD CONSTRAINT "request_assignments_assigned_by_user_id_fkey" FOREIGN KEY ("assigned_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "request_assignments" ADD CONSTRAINT "request_assignments_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "request_assignments" ADD CONSTRAINT "request_assignments_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "request_assignments" ADD CONSTRAINT "request_assignments_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "public"."requests"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "request_status_log" ADD CONSTRAINT "request_status_log_changed_by_id_fkey" FOREIGN KEY ("changed_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "request_status_log" ADD CONSTRAINT "request_status_log_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "request_status_log" ADD CONSTRAINT "request_status_log_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "public"."requests"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "request_status_log" ADD CONSTRAINT "request_status_log_updated_by_id_fkey" FOREIGN KEY ("updated_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "notifications" ADD CONSTRAINT "notifications_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "notifications" ADD CONSTRAINT "notifications_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "public"."requests"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "notifications" ADD CONSTRAINT "notifications_updated_by_id_fkey" FOREIGN KEY ("updated_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "configurations" ADD CONSTRAINT "configurations_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "configurations" ADD CONSTRAINT "configurations_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "configurations" ADD CONSTRAINT "configurations_updated_by_id_fkey" FOREIGN KEY ("updated_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "logs" ADD CONSTRAINT "logs_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "logs" ADD CONSTRAINT "logs_actor_role_id_fkey" FOREIGN KEY ("actor_role_id") REFERENCES "public"."roles"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "logs" ADD CONSTRAINT "logs_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "logs" ADD CONSTRAINT "logs_updated_by_id_fkey" FOREIGN KEY ("updated_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_users_email" ON "users" USING btree ("email" text_ops) WHERE (is_deleted = false);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_users_partner_id" ON "users" USING btree ("partner_id" int4_ops) WHERE (partner_id IS NOT NULL);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_users_role_id" ON "users" USING btree ("role_id" int4_ops);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_users_user_type" ON "users" USING btree ("user_type" enum_ops);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_user_sessions_expires_at" ON "user_sessions" USING btree ("expires_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_user_sessions_token" ON "user_sessions" USING btree ("token" text_ops);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_user_sessions_user_id" ON "user_sessions" USING btree ("user_id" int4_ops);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_customers_user_id" ON "customers" USING btree ("user_id" int4_ops);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_partners_status" ON "partners" USING btree ("status" enum_ops) WHERE (is_deleted = false);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_branches_lat_lng" ON "branches" USING btree ("lat" numeric_ops,"lng" numeric_ops);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_branches_partner_id" ON "branches" USING btree ("partner_id" int4_ops) WHERE (is_deleted = false);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_branch_users_branch_id" ON "branch_users" USING btree ("branch_id" int4_ops) WHERE (is_deleted = false);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_branch_users_user_id" ON "branch_users" USING btree ("user_id" int4_ops) WHERE (is_deleted = false);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_categories_active" ON "categories" USING btree ("is_active" bool_ops) WHERE (is_deleted = false);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_services_category_id" ON "services" USING btree ("category_id" int4_ops) WHERE (is_deleted = false);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_requests_branch_id" ON "requests" USING btree ("branch_id" int4_ops);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_requests_category_id" ON "requests" USING btree ("category_id" int4_ops);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_requests_created_at" ON "requests" USING btree ("created_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_requests_customer_id" ON "requests" USING btree ("customer_id" int4_ops);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_requests_partner_id" ON "requests" USING btree ("partner_id" int4_ops);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_requests_request_number" ON "requests" USING btree ("request_number" text_ops);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_requests_sla_deadline" ON "requests" USING btree ("sla_deadline" timestamptz_ops) WHERE (status = 'assigned'::request_status_enum);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_requests_status" ON "requests" USING btree ("status" enum_ops);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_requests_submitted_at" ON "requests" USING btree ("submitted_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_request_assignments_partner_id" ON "request_assignments" USING btree ("partner_id" int4_ops);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_request_assignments_request_id" ON "request_assignments" USING btree ("request_id" int4_ops);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_request_assignments_response" ON "request_assignments" USING btree ("response" enum_ops);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_request_status_log_request_id" ON "request_status_log" USING btree ("request_id" int4_ops);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_request_status_log_timestamp" ON "request_status_log" USING btree ("timestamp" timestamptz_ops);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_notifications_created_at" ON "notifications" USING btree ("created_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_notifications_read" ON "notifications" USING btree ("read" bool_ops,"user_id" int4_ops) WHERE (is_deleted = false);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_notifications_request_id" ON "notifications" USING btree ("request_id" int4_ops) WHERE (request_id IS NOT NULL);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_notifications_user_id" ON "notifications" USING btree ("user_id" int4_ops) WHERE (is_deleted = false);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_configurations_partner_id" ON "configurations" USING btree ("partner_id" int4_ops) WHERE (partner_id IS NOT NULL);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_configurations_scope" ON "configurations" USING btree ("scope" enum_ops) WHERE (is_deleted = false);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_logs_actor_id" ON "logs" USING btree ("actor_id" int4_ops);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_logs_entity_type_id" ON "logs" USING btree ("entity_type" int4_ops,"entity_id" text_ops);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_logs_metadata" ON "logs" USING gin ("metadata" jsonb_ops);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_logs_timestamp" ON "logs" USING btree ("timestamp" timestamptz_ops);
*/