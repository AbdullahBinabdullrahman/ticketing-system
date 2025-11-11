import { z } from "zod";

// Request submission schema
export const createRequestSchema = z.object({
  categoryId: z.number().int().positive("Category ID must be positive"),
  serviceId: z
    .number()
    .int()
    .positive("Service ID must be positive")
    .optional(),
  pickupOptionId: z
    .number()
    .int()
    .positive("Pickup option ID must be positive"),
  customerName: z
    .string()
    .min(2, "Customer name must be at least 2 characters"),
  customerPhone: z
    .string()
    .min(10, "Phone number must be at least 10 characters"),
  customerLat: z
    .number()
    .min(-90)
    .max(90, "Latitude must be between -90 and 90"),
  customerLng: z
    .number()
    .min(-180)
    .max(180, "Longitude must be between -180 and 180"),
  customerAddress: z.string().min(5, "Address must be at least 5 characters"),
});

// Request assignment schema
export const assignRequestSchema = z.object({
  partnerId: z.number().int().positive("Partner ID must be positive"),
  branchId: z.number().int().positive("Branch ID must be positive"),
});

// Request status update schema
export const updateRequestStatusSchema = z.object({
  status: z.enum(["confirmed", "in_progress", "completed", "rejected"]),
  notes: z.string().optional(),
  rejectionReason: z
    .string()
    .optional()
    .refine(() => {
      // If status is rejected, rejectionReason is required
      return true; // This will be validated in the handler
    }, "Rejection reason is required when status is rejected"),
});

// Request rating schema
export const rateRequestSchema = z.object({
  rating: z.number().int().min(1).max(5, "Rating must be between 1 and 5"),
  feedback: z.string().optional(),
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

// Request filters schema
export const requestFiltersSchema = z.object({
  status: z
    .enum([
      "submitted",
      "assigned",
      "confirmed",
      "in_progress",
      "completed",
      "closed",
      "rejected",
      "unassigned",
    ])
    .optional(),
  categoryId: numberFromQuery.refine((val) => val === undefined || val > 0, {
    message: "Category ID must be positive",
  }),
  partnerId: numberFromQuery.refine((val) => val === undefined || val > 0, {
    message: "Partner ID must be positive",
  }),
  branchId: numberFromQuery.refine((val) => val === undefined || val > 0, {
    message: "Branch ID must be positive",
  }),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  page: requiredNumberFromQuery.refine((val) => val >= 1, {
    message: "Page must be at least 1",
  }),
  limit: requiredNumberFromQuery.refine((val) => val >= 1 && val <= 100, {
    message: "Limit must be between 1 and 100",
  }),
  sortBy: z
    .enum([
      "createdAt",
      "updatedAt",
      "submittedAt",
      "assignedAt",
      "completedAt",
    ])
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

// Request search schema
export const searchRequestsSchema = z.object({
  query: z.string().min(1, "Search query is required"),
  filters: requestFiltersSchema.optional(),
});

export type CreateRequestInput = z.infer<typeof createRequestSchema>;
export type AssignRequestInput = z.infer<typeof assignRequestSchema>;
export type UpdateRequestStatusInput = z.infer<
  typeof updateRequestStatusSchema
>;
export type RateRequestInput = z.infer<typeof rateRequestSchema>;
export type RequestFiltersInput = z.infer<typeof requestFiltersSchema>;
export type SearchRequestsInput = z.infer<typeof searchRequestsSchema>;
