// /**
//  * Cleanup Utilities for Testing
//  * Manages test data cleanup and database state reset
//  */

// import { testApiClient } from "./apiWrappers";
// import { logger } from "../utils/logger";
// import type { CreatedTestData } from "./types";

// export class TestDataCleanup {
//   private createdData: CreatedTestData = {
//     requestIds: [],
//     partnerIds: [],
//     branchIds: [],
//     categoryIds: [],
//     serviceIds: [],
//     userIds: [],
//   };

//   /**
//    * Track created request
//    */
//   trackRequest(id: number): void {
//     if (!this.createdData.requestIds.includes(id)) {
//       this.createdData.requestIds.push(id);
//     }
//   }

//   /**
//    * Track created partner
//    */
//   trackPartner(id: number): void {
//     if (!this.createdData.partnerIds.includes(id)) {
//       this.createdData.partnerIds.push(id);
//     }
//   }

//   /**
//    * Track created branch
//    */
//   trackBranch(id: number): void {
//     if (!this.createdData.branchIds.includes(id)) {
//       this.createdData.branchIds.push(id);
//     }
//   }

//   /**
//    * Track created category
//    */
//   trackCategory(id: number): void {
//     if (!this.createdData.categoryIds.includes(id)) {
//       this.createdData.categoryIds.push(id);
//     }
//   }

//   /**
//    * Track created service
//    */
//   trackService(id: number): void {
//     if (!this.createdData.serviceIds.includes(id)) {
//       this.createdData.serviceIds.push(id);
//     }
//   }

//   /**
//    * Track created user
//    */
//   trackUser(id: number): void {
//     if (!this.createdData.userIds.includes(id)) {
//       this.createdData.userIds.push(id);
//     }
//   }

//   /**
//    * Get all tracked data
//    */
//   getTrackedData(): CreatedTestData {
//     return { ...this.createdData };
//   }

//   /**
//    * Clean up all test requests
//    */
//   async cleanupRequests(): Promise<void> {
//     logger.info(`Cleaning up ${this.createdData.requestIds.length} test requests`);

//     for (const requestId of this.createdData.requestIds) {
//       try {
//         // In a real implementation, you'd have a delete endpoint
//         // For now, we'll just log
//         logger.info(`Would delete request ${requestId}`);
//         // await testApiClient.delete(`/admin/requests/${requestId}`);
//       } catch (error: any) {
//         logger.warn(`Failed to cleanup request ${requestId}`, { error: error.message });
//       }
//     }

//     this.createdData.requestIds = [];
//   }

//   /**
//    * Clean up all test branches
//    */
//   async cleanupBranches(): Promise<void> {
//     logger.info(`Cleaning up ${this.createdData.branchIds.length} test branches`);

//     for (const branchId of this.createdData.branchIds) {
//       try {
//         await testApiClient.delete(`/admin/branches/${branchId}`);
//         logger.info(`Deleted branch ${branchId}`);
//       } catch (error: any) {
//         logger.warn(`Failed to cleanup branch ${branchId}`, { error: error.message });
//       }
//     }

//     this.createdData.branchIds = [];
//   }

//   /**
//    * Clean up all test partners
//    */
//   async cleanupPartners(): Promise<void> {
//     logger.info(`Cleaning up ${this.createdData.partnerIds.length} test partners`);

//     for (const partnerId of this.createdData.partnerIds) {
//       try {
//         await testApiClient.delete(`/admin/partners/${partnerId}`);
//         logger.info(`Deleted partner ${partnerId}`);
//       } catch (error: any) {
//         logger.warn(`Failed to cleanup partner ${partnerId}`, { error: error.message });
//       }
//     }

//     this.createdData.partnerIds = [];
//   }

//   /**
//    * Clean up all tracked data
//    */
//   async cleanupAll(): Promise<void> {
//     logger.info("Starting complete cleanup of test data");

//     // Cleanup in reverse order of dependencies
//     await this.cleanupRequests();
//     await this.cleanupBranches();
//     await this.cleanupPartners();

//     logger.info("Cleanup completed");
//   }

//   /**
//    * Reset tracking without cleanup
//    */
//   reset(): void {
//     this.createdData = {
//       requestIds: [],
//       partnerIds: [],
//       branchIds: [],
//       categoryIds: [],
//       serviceIds: [],
//       userIds: [],
//     };
//     logger.info("Test data tracking reset");
//   }

//   /**
//    * Get cleanup summary
//    */
//   getSummary(): string {
//     return `
// Test Data Summary:
// - Requests: ${this.createdData.requestIds.length}
// - Partners: ${this.createdData.partnerIds.length}
// - Branches: ${this.createdData.branchIds.length}
// - Categories: ${this.createdData.categoryIds.length}
// - Services: ${this.createdData.serviceIds.length}
// - Users: ${this.createdData.userIds.length}
//     `.trim();
//   }

//   /**
//    * Mark specific data as persistent (won't be cleaned up)
//    */
//   excludeFromCleanup(type: keyof CreatedTestData, id: number): void {
//     const index = this.createdData[type].indexOf(id);
//     if (index > -1) {
//       this.createdData[type].splice(index, 1);
//       logger.info(`Excluded ${type} ${id} from cleanup`);
//     }
//   }
// }

// // Singleton instance for testing
// export const testDataCleanup = new TestDataCleanup();

// /**
//  * Utility to safely cleanup after a test scenario
//  */
// export async function withCleanup<T>(
//   testFn: () => Promise<T>,
//   cleanup: TestDataCleanup
// ): Promise<T> {
//   try {
//     const result = await testFn();
//     return result;
//   } finally {
//     try {
//       await cleanup.cleanupAll();
//     } catch (error) {
//       logger.error("Cleanup failed", { error });
//       // Don't throw - cleanup failures shouldn't fail the test
//     }
//   }
// }
