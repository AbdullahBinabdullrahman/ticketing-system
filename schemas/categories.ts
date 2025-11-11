import { z } from "zod";

// Category creation schema
export const createCategorySchema = z.object({
  name: z.string().min(2, "Category name must be at least 2 characters"),
  nameAr: z
    .string()
    .min(2, "Arabic name must be at least 2 characters")
    .optional(),
  description: z.string().optional(),
  descriptionAr: z.string().optional(),
  iconUrl: z.string().url("Invalid icon URL").optional(),
});

// Category update schema
export const updateCategorySchema = createCategorySchema.partial();

// Service creation schema
export const createServiceSchema = z.object({
  categoryId: z.number().int().positive("Category ID must be positive"),
  name: z.string().min(2, "Service name must be at least 2 characters"),
  nameAr: z
    .string()
    .min(2, "Arabic name must be at least 2 characters")
    .optional(),
  description: z.string().optional(),
  descriptionAr: z.string().optional(),
  iconUrl: z.string().url("Invalid icon URL").optional(),
});

// Service update schema
export const updateServiceSchema = createServiceSchema
  .partial()
  .omit({ categoryId: true });

// Bulk service upload schema
export const bulkServiceUploadSchema = z.object({
  services: z
    .array(createServiceSchema)
    .min(1, "At least one service is required"),
});

// Category filters schema
export const categoryFiltersSchema = z.object({
  search: z.string().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
  sortBy: z.enum(["name", "created_at", "updated_at"]).default("name"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});

// Service filters schema
export const serviceFiltersSchema = z.object({
  categoryId: z.number().int().positive().optional(),
  search: z.string().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
  sortBy: z.enum(["name", "category_id", "created_at"]).default("name"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type CreateServiceInput = z.infer<typeof createServiceSchema>;
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;
export type BulkServiceUploadInput = z.infer<typeof bulkServiceUploadSchema>;
export type CategoryFiltersInput = z.infer<typeof categoryFiltersSchema>;
export type ServiceFiltersInput = z.infer<typeof serviceFiltersSchema>;
