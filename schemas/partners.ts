import { z } from "zod";

// Partner creation schema
export const createPartnerSchema = z.object({
  name: z.string().min(2, "Partner name must be at least 2 characters"),
  contactEmail: z.string().email("Invalid email address").optional(),
  contactPhone: z
    .string()
    .min(10, "Phone number must be at least 10 characters")
    .optional(),
  logoUrl: z.string().url("Invalid logo URL").optional(),
  status: z.enum(["active", "inactive", "suspended"]).default("active"),
});

// Partner creation with initial user schema
export const createPartnerWithUserSchema = createPartnerSchema.extend({
  // Initial user fields
  userName: z.string().min(2, "User name must be at least 2 characters"),
  userEmail: z.string().email("Invalid email address"),
  userPhone: z.string().min(10, "Phone must be at least 10 characters"),
  userPassword: z.string().min(8, "Password must be at least 8 characters").optional(),
  sendWelcomeEmail: z.boolean().default(true),
});

// Partner update schema
export const updatePartnerSchema = createPartnerSchema.partial();

// Branch creation schema
export const createBranchSchema = z.object({
  partnerId: z.number().int().positive("Partner ID must be positive"),
  name: z.string().min(2, "Branch name must be at least 2 characters"),
  lat: z.number().min(-90).max(90, "Latitude must be between -90 and 90"),
  lng: z.number().min(-180).max(180, "Longitude must be between -180 and 180"),
  contactName: z.string().min(2, "Contact name must be at least 2 characters"),
  phone: z.string().min(10, "Phone number must be at least 10 characters"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  radiusKm: z
    .number()
    .min(0.1)
    .max(100, "Radius must be between 0.1 and 100 km")
    .default(10),
});

// Branch update schema
export const updateBranchSchema = createBranchSchema
  .partial()
  .omit({ partnerId: true });

// Branch user assignment schema
export const assignBranchUserSchema = z.object({
  branchId: z.number().int().positive("Branch ID must be positive"),
  userId: z.number().int().positive("User ID must be positive"),
  role: z
    .enum(["branch_manager", "technician", "viewer", "admin"])
    .default("viewer"),
});

// Partner category assignment schema
export const assignPartnerCategorySchema = z.object({
  partnerId: z.number().int().positive("Partner ID must be positive"),
  categoryId: z.number().int().positive("Category ID must be positive"),
});

// Partner pickup option assignment schema
export const assignPartnerPickupOptionSchema = z.object({
  partnerId: z.number().int().positive("Partner ID must be positive"),
  pickupOptionTypeId: z
    .number()
    .int()
    .positive("Pickup option type ID must be positive"),
});

// Helper to preprocess query params (convert strings to numbers)
const numberFromQuery = z.preprocess((val) => {
  if (val === undefined || val === null || val === "") return undefined;
  const num = Number(val);
  return isNaN(num) ? undefined : num;
}, z.number().optional());

const requiredNumberFromQuery = z.preprocess((val) => {
  if (val === undefined || val === null || val === "") return 1;
  const num = Number(val);
  return isNaN(num) ? 1 : num;
}, z.number());

// Partner filters schema
export const partnerFiltersSchema = z.object({
  status: z.enum(["active", "inactive", "suspended"]).optional(),
  categoryId: numberFromQuery.refine((val) => val === undefined || val > 0, {
    message: "Category ID must be positive",
  }),
  search: z.string().optional(),
  page: requiredNumberFromQuery.refine((val) => val >= 1, {
    message: "Page must be at least 1",
  }),
  limit: requiredNumberFromQuery.refine((val) => val >= 1 && val <= 1000, {
    message: "Limit must be between 1 and 1000",
  }),
  sortBy: z.enum(["name", "createdAt", "updatedAt"]).default("name"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});

// Branch filters schema
export const branchFiltersSchema = z.object({
  partnerId: numberFromQuery.refine((val) => val === undefined || val > 0, {
    message: "Partner ID must be positive",
  }),
  isActive: z.preprocess((val) => {
    if (val === "true") return true;
    if (val === "false") return false;
    return undefined;
  }, z.boolean().optional()),
  search: z.string().optional(),
  lat: z.preprocess((val) => {
    if (val === undefined || val === null || val === "") return undefined;
    const num = Number(val);
    return isNaN(num) ? undefined : num;
  }, z.number().optional()),
  lng: z.preprocess((val) => {
    if (val === undefined || val === null || val === "") return undefined;
    const num = Number(val);
    return isNaN(num) ? undefined : num;
  }, z.number().optional()),
  radiusKm: z.preprocess((val) => {
    if (val === undefined || val === null || val === "") return 10;
    const num = Number(val);
    return isNaN(num) ? 10 : num;
  }, z.number().min(0.1).max(100)),
  page: requiredNumberFromQuery.refine((val) => val >= 1, {
    message: "Page must be at least 1",
  }),
  limit: requiredNumberFromQuery.refine((val) => val >= 1 && val <= 1000, {
    message: "Limit must be between 1 and 1000",
  }),
  sortBy: z.enum(["name", "distance", "createdAt"]).default("name"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});

export type CreatePartnerInput = z.infer<typeof createPartnerSchema>;
export type CreatePartnerWithUserInput = z.infer<typeof createPartnerWithUserSchema>;
export type UpdatePartnerInput = z.infer<typeof updatePartnerSchema>;
export type CreateBranchInput = z.infer<typeof createBranchSchema>;
export type UpdateBranchInput = z.infer<typeof updateBranchSchema>;
export type AssignBranchUserInput = z.infer<typeof assignBranchUserSchema>;
export type AssignPartnerCategoryInput = z.infer<
  typeof assignPartnerCategorySchema
>;
export type AssignPartnerPickupOptionInput = z.infer<
  typeof assignPartnerPickupOptionSchema
>;
export type PartnerFiltersInput = z.infer<typeof partnerFiltersSchema>;
export type BranchFiltersInput = z.infer<typeof branchFiltersSchema>;
