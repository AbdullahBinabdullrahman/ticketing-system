import { db } from "../db/connection";
import {
  partners,
  branches,
  branchUsers,
  partnerCategories,
  partnerPickupOptions,
  categories,
  pickupOptionTypes,
  users,
  requests,
} from "../db/schema";
import {
  eq,
  and,
  desc,
  asc,
  sql,
  count,
  like,
  inArray,
} from "drizzle-orm";
import { AppError, ErrorCodes } from "../utils/errorHandler";
import { logger } from "../../lib/utils/logger";
import type {
  CreatePartnerInput,
  CreatePartnerWithUserInput,
  UpdatePartnerInput,
  CreateBranchInput,
  UpdateBranchInput,
  AssignBranchUserInput,
  AssignPartnerCategoryInput,
  AssignPartnerPickupOptionInput,
  PartnerFiltersInput,
  BranchFiltersInput,
} from "../../schemas/partners";
import { createPartnerUser } from "./partnerUserService";

export interface PartnerWithDetails {
  id: number;
  name: string;
  status: string;
  logoUrl?: string;
  contactEmail?: string;
  contactPhone?: string;
  createdAt: Date | null;
  updatedAt: Date | null;
  branchesCount: number;
  categoriesCount: number;
  requestsCount: number;
  completedRequestsCount: number;
  averageRating: number;
  branches?: BranchWithDetails[];
}

export interface BranchWithDetails {
  id: number;
  partnerId: number;
  partnerName: string;
  name: string;
  lat: number;
  lng: number;
  contactName?: string;
  phone?: string;
  address?: string;
  radiusKm: number;
  createdAt: Date | null;
  updatedAt: Date | null;
  usersCount: number;
  requestsCount: number;
  distance?: number; // For nearest branch calculations
}

export interface NearestBranchResult {
  branch: BranchWithDetails;
  distance: number; // in kilometers
}

export class PartnerService {
  /**
   * Create a new partner
   */
  async createPartner(
    data: CreatePartnerInput,
    createdById: number
  ): Promise<PartnerWithDetails> {
    try {
      logger.info("Creating new partner", { name: data.name, createdById });

      // Create partner
      const newPartner = await db
        .insert(partners)
        .values({
          ...data,
          createdById,
        })
        .returning();

      const partnerWithDetails: PartnerWithDetails = {
        id: newPartner[0].id,
        name: newPartner[0].name,
        status: newPartner[0].status || "active",
        logoUrl: newPartner[0].logoUrl || undefined,
        contactEmail: newPartner[0].contactEmail || undefined,
        contactPhone: newPartner[0].contactPhone || undefined,
        createdAt: newPartner[0].createdAt!,
        updatedAt: newPartner[0].updatedAt!,
        branchesCount: 0,
        categoriesCount: 0,
        requestsCount: 0,
        completedRequestsCount: 0,
        averageRating: 0,
      };

      logger.info("Partner created successfully", {
        partnerId: newPartner[0].id,
        name: data.name,
      });

      return partnerWithDetails;
    } catch (error) {
      logger.error("Create partner failed", {
        error: error instanceof Error ? error.message : "Unknown error",
        name: data.name,
      });
      throw error;
    }
  }

  /**
   * Create a new partner with initial user account
   */
  async createPartnerWithUser(
    data: CreatePartnerWithUserInput,
    createdById: number
  ): Promise<{
    partner: PartnerWithDetails;
    user: { id: number; email: string; temporaryPassword?: string };
  }> {
    try {
      logger.info("Creating partner with initial user", {
        partnerName: data.name,
        userEmail: data.userEmail,
        createdById,
      });

      // 1. Create partner first
      const partner = await this.createPartner(
        {
          name: data.name,
          contactEmail: data.contactEmail,
          contactPhone: data.contactPhone,
          logoUrl: data.logoUrl,
          status: data.status,
        },
        createdById
      );

      // 2. Create initial user for partner
      const userResult = await createPartnerUser({
        partnerId: partner.id,
        name: data.userName,
        email: data.userEmail,
        phone: data.userPhone,
        password: data.userPassword, // undefined = auto-generate
        sendWelcomeEmail: data.sendWelcomeEmail,
      });

      if (!userResult.success || !userResult.user) {
        // Rollback: Delete partner if user creation failed
        logger.error("User creation failed, rolling back partner", {
          partnerId: partner.id,
          error: userResult.error,
        });

        // In a production environment, wrap this in a transaction
        // For now, we'll log the failure and throw
        throw new AppError(
          `Failed to create initial user: ${userResult.error || "Unknown error"}`,
          500,
          ErrorCodes.DATABASE_ERROR
        );
      }

      logger.info("Partner created with initial user successfully", {
        partnerId: partner.id,
        userId: userResult.user.id,
        emailSent: data.sendWelcomeEmail,
      });

      return {
        partner,
        user: {
          id: userResult.user.id,
          email: userResult.user.email,
          temporaryPassword: userResult.temporaryPassword,
        },
      };
    } catch (error) {
      logger.error("Failed to create partner with user", {
        error: error instanceof Error ? error.message : "Unknown error",
        partnerName: data.name,
        userEmail: data.userEmail,
      });
      throw error;
    }
  }

  /**
   * Update partner
   */
  async updatePartner(
    partnerId: number,
    data: UpdatePartnerInput,
    updatedById: number
  ): Promise<PartnerWithDetails> {
    try {
      logger.info("Updating partner", { partnerId, updatedById });

      // Update partner
      const updatedPartner = await db
        .update(partners)
        .set({
          ...data,
          updatedAt: new Date(),
          updatedById,
        })
        .where(
          and(
            eq(partners.id, partnerId),
            eq(partners.isActive, true),
            eq(partners.isDeleted, false)
          )
        )
        .returning();

      if (updatedPartner.length === 0) {
        throw new AppError(
          "Partner not found",
          404,
          ErrorCodes.PARTNER_NOT_FOUND
        );
      }

      // Get partner with details
      const partnerWithDetails = await this.getPartnerWithDetails(partnerId);

      logger.info("Partner updated successfully", { partnerId });

      return partnerWithDetails;
    } catch (error) {
      logger.error("Update partner failed", {
        error: error instanceof Error ? error.message : "Unknown error",
        partnerId,
      });
      throw error;
    }
  }

  /**
   * Delete partner (soft delete)
   */
  async deletePartner(partnerId: number, deletedById: number): Promise<void> {
    try {
      logger.info("Deleting partner", { partnerId, deletedById });

      // Soft delete partner
      await db
        .update(partners)
        .set({
          isDeleted: true,
          updatedAt: new Date(),
          updatedById: deletedById,
        })
        .where(
          and(
            eq(partners.id, partnerId),
            eq(partners.isActive, true),
            eq(partners.isDeleted, false)
          )
        );

      logger.info("Partner deleted successfully", { partnerId });
    } catch (error) {
      logger.error("Delete partner failed", {
        error: error instanceof Error ? error.message : "Unknown error",
        partnerId,
      });
      throw error;
    }
  }

  /**
   * Get partners with filters
   */
  async getPartners(
    filters: PartnerFiltersInput
  ): Promise<{ partners: PartnerWithDetails[]; total: number }> {
    try {
      logger.info("Getting partners", { filters });

      // Build where conditions
      const whereConditions = [
        eq(partners.isActive, true),
        eq(partners.isDeleted, false),
      ];

      // Apply filters
      if (filters.status) {
        whereConditions.push(eq(partners.status, filters.status));
      }
      if (filters.search) {
        whereConditions.push(like(partners.name, `%${filters.search}%`));
      }
      if (filters.categoryId) {
        // Join with partner_categories to filter by category
        whereConditions.push(
          sql`${partners.id} IN (SELECT partner_id FROM partner_categories WHERE category_id = ${filters.categoryId})`
        );
      }

      // Get total count
      const totalResult = await db
        .select({ count: count() })
        .from(partners)
        .where(and(...whereConditions));

      const total = totalResult[0]?.count || 0;

      // Get partners
      const partnersResult = await db
        .select()
        .from(partners)
        .where(and(...whereConditions))
        .orderBy(
          filters.sortOrder === "asc"
            ? asc(partners[filters.sortBy])
            : desc(partners[filters.sortBy])
        )
        .limit(filters.limit)
        .offset((filters.page - 1) * filters.limit);

      // Optimize: Batch fetch all partner details to avoid N+1 queries
      // Get all partner IDs from results
      const partnerIds = partnersResult.map(p => p.id);

      if (partnerIds.length === 0) {
        return { partners: [], total: 0 };
      }

      // Fetch all counts in parallel using Promise.all to avoid N+1
      const [branchCounts, categoryCounts, requestCounts, completedCounts, ratings] = await Promise.all([
        // Get branch counts for all partners
        db
          .select({
            partnerId: branches.partnerId,
            count: count(),
          })
          .from(branches)
          .where(
            and(
              inArray(branches.partnerId, partnerIds),
              eq(branches.isActive, true),
              eq(branches.isDeleted, false)
            )
          )
          .groupBy(branches.partnerId),
        
        // Get category counts for all partners
        db
          .select({
            partnerId: partnerCategories.partnerId,
            count: count(),
          })
          .from(partnerCategories)
          .where(
            and(
              inArray(partnerCategories.partnerId, partnerIds),
              eq(partnerCategories.isActive, true),
              eq(partnerCategories.isDeleted, false)
            )
          )
          .groupBy(partnerCategories.partnerId),
        
        // Get total request counts
        db
          .select({
            partnerId: requests.partnerId,
            count: count(),
          })
          .from(requests)
          .where(
            and(
              inArray(requests.partnerId, partnerIds),
              sql`${requests.partnerId} IS NOT NULL`, // Ensure partnerId is not null
              eq(requests.isDeleted, false)
            )
          )
          .groupBy(requests.partnerId),
        
        // Get completed request counts
        db
          .select({
            partnerId: requests.partnerId,
            count: count(),
          })
          .from(requests)
          .where(
            and(
              inArray(requests.partnerId, partnerIds),
              sql`${requests.partnerId} IS NOT NULL`, // Ensure partnerId is not null
              sql`${requests.status} = 'completed'::request_status_enum`,
              eq(requests.isDeleted, false)
            )
          )
          .groupBy(requests.partnerId),
        
        // Get average ratings
        db
          .select({
            partnerId: requests.partnerId,
            avgRating: sql<number>`COALESCE(AVG(${requests.rating}), 0)`,
          })
          .from(requests)
          .where(
            and(
              inArray(requests.partnerId, partnerIds),
              sql`${requests.partnerId} IS NOT NULL`,
              sql`${requests.rating} IS NOT NULL`,
              eq(requests.isDeleted, false)
            )
          )
          .groupBy(requests.partnerId),
      ]);

      // Create lookup maps for O(1) access
      const branchCountMap = new Map(branchCounts.map(b => [b.partnerId, Number(b.count)]));
      const categoryCountMap = new Map(categoryCounts.map(c => [c.partnerId, Number(c.count)]));
      const requestCountMap = new Map(requestCounts.map(r => [r.partnerId, Number(r.count)]));
      const completedCountMap = new Map(completedCounts.map(c => [c.partnerId, Number(c.count)]));
      const ratingMap = new Map(ratings.map(r => [r.partnerId, Number(r.avgRating) || 0]));

      // Fetch branches if requested
      let branchesMap: Map<number, BranchWithDetails[]> | undefined;
      if (filters.includeBranches) {
        const allBranches = await db
          .select({
            id: branches.id,
            partnerId: branches.partnerId,
            name: branches.name,
            lat: branches.lat,
            lng: branches.lng,
            contactName: branches.contactName,
            phone: branches.phone,
            address: branches.address,
            radiusKm: branches.radiusKm,
            createdAt: branches.createdAt,
            updatedAt: branches.updatedAt,
          })
          .from(branches)
          .where(
            and(
              inArray(branches.partnerId, partnerIds),
              eq(branches.isActive, true),
              eq(branches.isDeleted, false)
            )
          )
          .orderBy(asc(branches.name));

        // Group branches by partnerId
        branchesMap = new Map();
        for (const branch of allBranches) {
          const branchDetail: BranchWithDetails = {
            id: branch.id,
            partnerId: branch.partnerId,
            partnerName: partnersResult.find(p => p.id === branch.partnerId)?.name || "",
            name: branch.name,
            lat: parseFloat(branch.lat || "0"),
            lng: parseFloat(branch.lng || "0"),
            contactName: branch.contactName || undefined,
            phone: branch.phone || undefined,
            address: branch.address || undefined,
            radiusKm: parseFloat(branch.radiusKm || "10"),
            createdAt: branch.createdAt!,
            updatedAt: branch.updatedAt!,
            usersCount: 0, // Not calculated in bulk fetch
            requestsCount: 0, // Not calculated in bulk fetch
          };

          if (!branchesMap.has(branch.partnerId)) {
            branchesMap.set(branch.partnerId, []);
          }
          branchesMap.get(branch.partnerId)!.push(branchDetail);
        }
      }

      // Map partners to details using the lookup maps
      const partnersWithDetails: PartnerWithDetails[] = partnersResult.map(partner => ({
        id: partner.id,
        name: partner.name,
        status: partner.status || "active",
        logoUrl: partner.logoUrl || undefined,
        contactEmail: partner.contactEmail || undefined,
        contactPhone: partner.contactPhone || undefined,
        createdAt: partner.createdAt!,
        updatedAt: partner.updatedAt!,
        branchesCount: branchCountMap.get(partner.id) || 0,
        categoriesCount: categoryCountMap.get(partner.id) || 0,
        requestsCount: requestCountMap.get(partner.id) || 0,
        completedRequestsCount: completedCountMap.get(partner.id) || 0,
        averageRating: ratingMap.get(partner.id) || 0,
        branches: branchesMap ? branchesMap.get(partner.id) : undefined,
      }));

      logger.info("Partners retrieved successfully", {
        count: partnersWithDetails.length,
        total,
        filters,
      });

      return { partners: partnersWithDetails, total };
    } catch (error) {
      logger.error("Get partners failed", {
        error: error instanceof Error ? error.message : "Unknown error",
        filters,
      });
      throw error;
    }
  }

  /**
   * Get partner with details by ID
   */
  async getPartnerWithDetails(
    partnerId: number,
    includeBranches: boolean = false
  ): Promise<PartnerWithDetails> {
    try {
      const partner = await db
        .select()
        .from(partners)
        .where(
          and(
            eq(partners.id, partnerId),
            eq(partners.isActive, true),
            eq(partners.isDeleted, false)
          )
        )
        .limit(1);

      if (partner.length === 0) {
        throw new AppError(
          "Partner not found",
          404,
          ErrorCodes.PARTNER_NOT_FOUND
        );
      }

      // Get branches count
      const branchesCountResult = await db
        .select({ count: count() })
        .from(branches)
        .where(
          and(
            eq(branches.partnerId, partnerId),
            eq(branches.isActive, true),
            eq(branches.isDeleted, false)
          )
        );

      // Get categories count
      const categoriesCountResult = await db
        .select({ count: count() })
        .from(partnerCategories)
        .where(
          and(
            eq(partnerCategories.partnerId, partnerId),
            eq(partnerCategories.isActive, true),
            eq(partnerCategories.isDeleted, false)
          )
        );

      // Get requests count
      const requestsCountResult = await db
        .select({ count: count() })
        .from(requests)
        .where(
          and(
            eq(requests.partnerId, partnerId),
            eq(requests.isActive, true),
            eq(requests.isDeleted, false)
          )
        );

      // Get completed requests count
      const completedRequestsCountResult = await db
        .select({ count: count() })
        .from(requests)
        .where(
          and(
            eq(requests.partnerId, partnerId),
            sql`${requests.status} = 'closed'::request_status_enum`,
            eq(requests.isActive, true),
            eq(requests.isDeleted, false)
          )
        );

      // Get average rating
      const avgRatingResult = await db
        .select({ avgRating: sql<number>`AVG(${requests.rating})` })
        .from(requests)
        .where(
          and(
            eq(requests.partnerId, partnerId),
            sql`${requests.status} = 'closed'::request_status_enum`,
            eq(requests.isActive, true),
            eq(requests.isDeleted, false)
          )
        );

      // Get branches if requested
      let partnerBranches: BranchWithDetails[] | undefined;
      if (includeBranches) {
        const branchesResult = await this.getBranches({
          partnerId,
          page: 1,
          limit: 100,
          sortBy: "name",
          sortOrder: "asc",
        });
        partnerBranches = branchesResult.branches;
      }

      return {
        id: partner[0].id,
        name: partner[0].name,
        status: partner[0].status || "active",
        logoUrl: partner[0].logoUrl || undefined,
        contactEmail: partner[0].contactEmail || undefined,
        contactPhone: partner[0].contactPhone || undefined,
        createdAt: partner[0].createdAt!,
        updatedAt: partner[0].updatedAt!,
        branchesCount: branchesCountResult[0]?.count || 0,
        categoriesCount: categoriesCountResult[0]?.count || 0,
        requestsCount: requestsCountResult[0]?.count || 0,
        completedRequestsCount: completedRequestsCountResult[0]?.count || 0,
        averageRating: avgRatingResult[0]?.avgRating || 0,
        branches: partnerBranches,
      };
    } catch (error) {
      logger.error("Get partner with details failed", {
        error: error instanceof Error ? error.message : "Unknown error",
        partnerId,
      });
      throw error;
    }
  }

  /**
   * Create a new branch
   */
  async createBranch(
    data: CreateBranchInput,
    createdById: number
  ): Promise<BranchWithDetails> {
    try {
      logger.info("Creating new branch", {
        name: data.name,
        partnerId: data.partnerId,
        createdById,
      });

      // Verify partner exists
      const partner = await db
        .select()
        .from(partners)
        .where(
          and(
            eq(partners.id, data.partnerId),
            eq(partners.isActive, true),
            eq(partners.isDeleted, false)
          )
        )
        .limit(1);

      if (partner.length === 0) {
        throw new AppError(
          "Partner not found",
          404,
          ErrorCodes.PARTNER_NOT_FOUND
        );
      }

      // Create branch
      const newBranch = await db
        .insert(branches)
        .values({
          ...data,
          lat: data.lat.toString(),
          lng: data.lng.toString(),
          radiusKm: data.radiusKm.toString(),
          createdById,
        })
        .returning();

      const branchWithDetails: BranchWithDetails = {
        id: newBranch[0].id,
        partnerId: newBranch[0].partnerId,
        partnerName: partner[0].name,
        name: newBranch[0].name,
        lat: parseFloat(newBranch[0].lat),
        lng: parseFloat(newBranch[0].lng),
        contactName: newBranch[0].contactName || undefined,
        phone: newBranch[0].phone || undefined,
        address: newBranch[0].address || undefined,
        radiusKm: parseFloat(newBranch[0].radiusKm || "10"),
        createdAt: newBranch[0].createdAt!,
        updatedAt: newBranch[0].updatedAt!,
        usersCount: 0,
        requestsCount: 0,
      };

      logger.info("Branch created successfully", {
        branchId: newBranch[0].id,
        name: data.name,
        partnerId: data.partnerId,
      });

      return branchWithDetails;
    } catch (error) {
      logger.error("Create branch failed", {
        error: error instanceof Error ? error.message : "Unknown error",
        name: data.name,
        partnerId: data.partnerId,
      });
      throw error;
    }
  }

  /**
   * Update branch
   */
  async updateBranch(
    branchId: number,
    data: UpdateBranchInput,
    updatedById: number
  ): Promise<BranchWithDetails> {
    try {
      logger.info("Updating branch", { branchId, updatedById });

      // Update branch
      //eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updateData: any = {
        ...data,
        updatedAt: new Date(),
        updatedById,
      };
      if (data.lat !== undefined) updateData.lat = data.lat.toString();
      if (data.lng !== undefined) updateData.lng = data.lng.toString();
      if (data.radiusKm !== undefined)
        updateData.radiusKm = data.radiusKm.toString();
      const updatedBranch = await db
        .update(branches)
        .set(updateData)
        .where(
          and(
            eq(branches.id, branchId),
            eq(branches.isActive, true),
            eq(branches.isDeleted, false)
          )
        )
        .returning();

      if (updatedBranch.length === 0) {
        throw new AppError(
          "Branch not found",
          404,
          ErrorCodes.BRANCH_NOT_FOUND
        );
      }

      // Get branch with details
      const branchWithDetails = await this.getBranchWithDetails(branchId);

      logger.info("Branch updated successfully", { branchId });

      return branchWithDetails;
    } catch (error) {
      logger.error("Update branch failed", {
        error: error instanceof Error ? error.message : "Unknown error",
        branchId,
      });
      throw error;
    }
  }

  /**
   * Delete branch (soft delete)
   */
  async deleteBranch(branchId: number, deletedById: number): Promise<void> {
    try {
      logger.info("Deleting branch", { branchId, deletedById });

      // Soft delete branch
      await db
        .update(branches)
        .set({
          isDeleted: true,
          updatedAt: new Date(),
          updatedById: deletedById,
        })
        .where(
          and(
            eq(branches.id, branchId),
            eq(branches.isActive, true),
            eq(branches.isDeleted, false)
          )
        );

      logger.info("Branch deleted successfully", { branchId });
    } catch (error) {
      logger.error("Delete branch failed", {
        error: error instanceof Error ? error.message : "Unknown error",
        branchId,
      });
      throw error;
    }
  }

  /**
   * Get branches with filters
   */
  async getBranches(
    filters: BranchFiltersInput
  ): Promise<{ branches: BranchWithDetails[]; total: number }> {
    try {
      logger.info("Getting branches", { filters });

      // Build where conditions
      const whereConditions = [
        eq(branches.isActive, true),
        eq(branches.isDeleted, false),
      ];

      // Apply filters
      if (filters.partnerId) {
        whereConditions.push(eq(branches.partnerId, filters.partnerId));
      }
      if (filters.search) {
        whereConditions.push(like(branches.name, `%${filters.search}%`));
      }

      // Get total count
      const totalResult = await db
        .select({ count: count() })
        .from(branches)
        .where(and(...whereConditions));

      const total = totalResult[0]?.count || 0;

      // Get branches
      const branchesResult = await db
        .select({
          id: branches.id,
          partnerId: branches.partnerId,
          partnerName: partners.name,
          name: branches.name,
          lat: branches.lat,
          lng: branches.lng,
          contactName: branches.contactName,
          phone: branches.phone,
          address: branches.address,
          radiusKm: branches.radiusKm,
          createdAt: branches.createdAt,
          updatedAt: branches.updatedAt,
        })
        .from(branches)
        .leftJoin(partners, eq(branches.partnerId, partners.id))
        .where(and(...whereConditions))
        .orderBy(
          filters.sortBy === "distance" && filters.lat && filters.lng
            ? sql`ST_Distance(ST_Point(${branches.lng}, ${branches.lat}), ST_Point(${filters.lng}, ${filters.lat}))`
            : filters.sortOrder === "asc"
            ? asc(
                branches[filters.sortBy as keyof typeof branches.$inferSelect]
              )
            : desc(
                branches[filters.sortBy as keyof typeof branches.$inferSelect]
              )
        )
        .limit(filters.limit)
        .offset((filters.page - 1) * filters.limit);

      // Get details for each branch
      const branchesWithDetails: BranchWithDetails[] = [];
      for (const branch of branchesResult) {
        const details = await this.getBranchWithDetails(branch.id);
        if (filters.lat && filters.lng) {
          details.distance = this.calculateDistance(
            filters.lat,
            filters.lng,
            parseFloat(branch.lat),
            parseFloat(branch.lng)
          );
        }
        branchesWithDetails.push(details);
      }

      logger.info("Branches retrieved successfully", {
        count: branchesWithDetails.length,
        total,
        filters,
      });

      return { branches: branchesWithDetails, total };
    } catch (error) {
      logger.error("Get branches failed", {
        error: error instanceof Error ? error.message : "Unknown error",
        filters,
      });
      throw error;
    }
  }

  /**
   * Get branch with details by ID
   */
  async getBranchWithDetails(branchId: number): Promise<BranchWithDetails> {
    try {
      const branch = await db
        .select({
          id: branches.id,
          partnerId: branches.partnerId,
          partnerName: partners.name,
          name: branches.name,
          lat: branches.lat,
          lng: branches.lng,
          contactName: branches.contactName,
          phone: branches.phone,
          address: branches.address,
          radiusKm: branches.radiusKm,
          createdAt: branches.createdAt,
          updatedAt: branches.updatedAt,
        })
        .from(branches)
        .leftJoin(partners, eq(branches.partnerId, partners.id))
        .where(
          and(
            eq(branches.id, branchId),
            eq(branches.isActive, true),
            eq(branches.isDeleted, false)
          )
        )
        .limit(1);

      if (branch.length === 0) {
        throw new AppError(
          "Branch not found",
          404,
          ErrorCodes.BRANCH_NOT_FOUND
        );
      }

      // Get users count
      const usersCountResult = await db
        .select({ count: count() })
        .from(branchUsers)
        .where(
          and(
            eq(branchUsers.branchId, branchId),
            eq(branchUsers.isActive, true),
            eq(branchUsers.isDeleted, false)
          )
        );

      // Get requests count
      const requestsCountResult = await db
        .select({ count: count() })
        .from(requests)
        .where(
          and(
            eq(requests.branchId, branchId),
            eq(requests.isActive, true),
            eq(requests.isDeleted, false)
          )
        );

      return {
        id: branch[0].id,
        partnerId: branch[0].partnerId,
        partnerName: branch[0].partnerName || "",
        name: branch[0].name,
        lat: parseFloat(branch[0].lat || "0"),
        lng: parseFloat(branch[0].lng || "0"),
        contactName: branch[0].contactName || undefined,
        phone: branch[0].phone || undefined,
        address: branch[0].address || undefined,
        radiusKm: parseFloat(branch[0].radiusKm || "10"),
        createdAt: branch[0].createdAt!,
        updatedAt: branch[0].updatedAt!,
        usersCount: usersCountResult[0]?.count || 0,
        requestsCount: requestsCountResult[0]?.count || 0,
      };
    } catch (error) {
      logger.error("Get branch with details failed", {
        error: error instanceof Error ? error.message : "Unknown error",
        branchId,
      });
      throw error;
    }
  }

  /**
   * Find nearest branch to coordinates
   */
  async findNearestBranch(
    lat: number,
    lng: number,
    categoryId?: number,
    partnerId?: number
  ): Promise<NearestBranchResult | null> {
    try {
      logger.info("Finding nearest branch", {
        lat,
        lng,
        categoryId,
        partnerId,
      });

      // Build where conditions
      const whereConditions = [
        eq(branches.isActive, true),
        eq(branches.isDeleted, false),
      ];

      if (partnerId) {
        whereConditions.push(eq(branches.partnerId, partnerId));
      }

      if (categoryId) {
        // Only include branches from partners that support this category
        whereConditions.push(
          sql`${branches.partnerId} IN (SELECT partner_id FROM partner_categories WHERE category_id = ${categoryId} AND is_active = true AND is_deleted = false)`
        );
      }

      // Get all branches with distance calculation
      const branchesResult = await db
        .select({
          id: branches.id,
          partnerId: branches.partnerId,
          partnerName: partners.name,
          name: branches.name,
          lat: branches.lat,
          lng: branches.lng,
          contactName: branches.contactName,
          phone: branches.phone,
          address: branches.address,
          radiusKm: branches.radiusKm,
          createdAt: branches.createdAt,
          updatedAt: branches.updatedAt,
          distance: sql<number>`ST_Distance(ST_Point(${branches.lng}, ${branches.lat}), ST_Point(${lng}, ${lat})) / 1000`,
        })
        .from(branches)
        .leftJoin(partners, eq(branches.partnerId, partners.id))
        .where(and(...whereConditions))
        .orderBy(
          sql`ST_Distance(ST_Point(${branches.lng}, ${branches.lat}), ST_Point(${lng}, ${lat}))`
        );

      if (branchesResult.length === 0) {
        return null;
      }

      const nearestBranch = branchesResult[0];
      const distance = nearestBranch.distance || 0;

      // Check if branch is within its service radius
      const serviceRadius = parseFloat(nearestBranch.radiusKm || "10");
      if (distance > serviceRadius) {
        logger.info("Nearest branch is outside service radius", {
          branchId: nearestBranch.id,
          distance,
          serviceRadius,
        });
        return null;
      }

      const branchWithDetails: BranchWithDetails = {
        id: nearestBranch.id,
        partnerId: nearestBranch.partnerId,
        partnerName: nearestBranch.partnerName || "",
        name: nearestBranch.name,
        lat: parseFloat(nearestBranch.lat || "0"),
        lng: parseFloat(nearestBranch.lng || "0"),
        contactName: nearestBranch.contactName || undefined,
        phone: nearestBranch.phone || undefined,
        address: nearestBranch.address || undefined,
        radiusKm: parseFloat(nearestBranch.radiusKm || "10"),
        createdAt: nearestBranch.createdAt!,
        updatedAt: nearestBranch.updatedAt!,
        usersCount: 0, // Will be populated if needed
        requestsCount: 0, // Will be populated if needed
        distance,
      };

      logger.info("Nearest branch found", {
        branchId: nearestBranch.id,
        distance,
        serviceRadius,
      });

      return {
        branch: branchWithDetails,
        distance,
      };
    } catch (error) {
      logger.error("Find nearest branch failed", {
        error: error instanceof Error ? error.message : "Unknown error",
        lat,
        lng,
      });
      throw error;
    }
  }

  /**
   * Assign user to branch
   */
  async assignBranchUser(
    data: AssignBranchUserInput,
    assignedById: number
  ): Promise<void> {
    try {
      logger.info("Assigning user to branch", {
        branchId: data.branchId,
        userId: data.userId,
        assignedById,
      });

      // Verify branch exists
      const branch = await db
        .select()
        .from(branches)
        .where(
          and(
            eq(branches.id, data.branchId),
            eq(branches.isActive, true),
            eq(branches.isDeleted, false)
          )
        )
        .limit(1);

      if (branch.length === 0) {
        throw new AppError(
          "Branch not found",
          404,
          ErrorCodes.BRANCH_NOT_FOUND
        );
      }

      // Verify user exists and is a partner user
      const user = await db
        .select()
        .from(users)
        .where(
          and(
            eq(users.id, data.userId),
            sql`${users.userType} = 'partner'::user_type_enum`,
            eq(users.isActive, true),
            eq(users.isDeleted, false)
          )
        )
        .limit(1);

      if (user.length === 0) {
        throw new AppError(
          "User not found or not a partner user",
          404,
          ErrorCodes.USER_NOT_FOUND
        );
      }

      // Check if user is already assigned to this branch
      const existingAssignment = await db
        .select()
        .from(branchUsers)
        .where(
          and(
            eq(branchUsers.branchId, data.branchId),
            eq(branchUsers.userId, data.userId),
            eq(branchUsers.isActive, true),
            eq(branchUsers.isDeleted, false)
          )
        )
        .limit(1);

      if (existingAssignment.length > 0) {
        throw new AppError(
          "User is already assigned to this branch",
          400,
          ErrorCodes.DUPLICATE_ENTRY
        );
      }

      // Create assignment
      await db.insert(branchUsers).values({
        ...data,
        assignedById,
      });

      logger.info("User assigned to branch successfully", {
        branchId: data.branchId,
        userId: data.userId,
      });
    } catch (error) {
      logger.error("Assign branch user failed", {
        error: error instanceof Error ? error.message : "Unknown error",
        data,
      });
      throw error;
    }
  }

  /**
   * Assign category to partner
   */
  async assignPartnerCategory(
    data: AssignPartnerCategoryInput,
    assignedById: number
  ): Promise<void> {
    try {
      logger.info("Assigning category to partner", {
        partnerId: data.partnerId,
        categoryId: data.categoryId,
        assignedById,
      });

      // Verify partner exists
      const partner = await db
        .select()
        .from(partners)
        .where(
          and(
            eq(partners.id, data.partnerId),
            eq(partners.isActive, true),
            eq(partners.isDeleted, false)
          )
        )
        .limit(1);

      if (partner.length === 0) {
        throw new AppError(
          "Partner not found",
          404,
          ErrorCodes.PARTNER_NOT_FOUND
        );
      }

      // Verify category exists
      const category = await db
        .select()
        .from(categories)
        .where(
          and(
            eq(categories.id, data.categoryId),
            eq(categories.isActive, true),
            eq(categories.isDeleted, false)
          )
        )
        .limit(1);

      if (category.length === 0) {
        throw new AppError(
          "Category not found",
          404,
          ErrorCodes.CATEGORY_NOT_FOUND
        );
      }

      // Check if assignment already exists
      const existingAssignment = await db
        .select()
        .from(partnerCategories)
        .where(
          and(
            eq(partnerCategories.partnerId, data.partnerId),
            eq(partnerCategories.categoryId, data.categoryId),
            eq(partnerCategories.isActive, true),
            eq(partnerCategories.isDeleted, false)
          )
        )
        .limit(1);

      if (existingAssignment.length > 0) {
        throw new AppError(
          "Category is already assigned to this partner",
          400,
          ErrorCodes.DUPLICATE_ENTRY
        );
      }

      // Create assignment
      await db.insert(partnerCategories).values({
        ...data,
        createdById: assignedById,
      });

      logger.info("Category assigned to partner successfully", {
        partnerId: data.partnerId,
        categoryId: data.categoryId,
      });
    } catch (error) {
      logger.error("Assign partner category failed", {
        error: error instanceof Error ? error.message : "Unknown error",
        data,
      });
      throw error;
    }
  }

  /**
   * Assign pickup option to partner
   */
  async assignPartnerPickupOption(
    data: AssignPartnerPickupOptionInput,
    assignedById: number
  ): Promise<void> {
    try {
      logger.info("Assigning pickup option to partner", {
        partnerId: data.partnerId,
        pickupOptionTypeId: data.pickupOptionTypeId,
        assignedById,
      });

      // Verify partner exists
      const partner = await db
        .select()
        .from(partners)
        .where(
          and(
            eq(partners.id, data.partnerId),
            eq(partners.isActive, true),
            eq(partners.isDeleted, false)
          )
        )
        .limit(1);

      if (partner.length === 0) {
        throw new AppError(
          "Partner not found",
          404,
          ErrorCodes.PARTNER_NOT_FOUND
        );
      }

      // Verify pickup option type exists
      const pickupOptionType = await db
        .select()
        .from(pickupOptionTypes)
        .where(
          and(
            eq(pickupOptionTypes.id, data.pickupOptionTypeId),
            eq(pickupOptionTypes.isActive, true),
            eq(pickupOptionTypes.isDeleted, false)
          )
        )
        .limit(1);

      if (pickupOptionType.length === 0) {
        throw new AppError(
          "Pickup option type not found",
          404,
          ErrorCodes.SERVICE_NOT_FOUND
        );
      }

      // Check if assignment already exists
      const existingAssignment = await db
        .select()
        .from(partnerPickupOptions)
        .where(
          and(
            eq(partnerPickupOptions.partnerId, data.partnerId),
            eq(
              partnerPickupOptions.pickupOptionTypeId,
              data.pickupOptionTypeId
            ),
            eq(partnerPickupOptions.isActive, true),
            eq(partnerPickupOptions.isDeleted, false)
          )
        )
        .limit(1);

      if (existingAssignment.length > 0) {
        throw new AppError(
          "Pickup option is already assigned to this partner",
          400,
          ErrorCodes.DUPLICATE_ENTRY
        );
      }

      // Create assignment
      await db.insert(partnerPickupOptions).values({
        ...data,
        createdById: assignedById,
      });

      logger.info("Pickup option assigned to partner successfully", {
        partnerId: data.partnerId,
        pickupOptionTypeId: data.pickupOptionTypeId,
      });
    } catch (error) {
      logger.error("Assign partner pickup option failed", {
        error: error instanceof Error ? error.message : "Unknown error",
        data,
      });
      throw error;
    }
  }

  // Helper methods
  private calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}

export const partnerService = new PartnerService();
