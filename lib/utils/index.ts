/**
 * HTTP Clients Export
 * Provides separate axios instances for admin and partner API requests
 */

export { adminHttp, default as http } from "./http";
export { partnerHttp } from "./partnerHttp";

// Re-export for backward compatibility
export { adminHttp as default } from "./http";
