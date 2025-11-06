/**
 * Type definitions for the testing framework
 */

export type TestStatus = "pending" | "running" | "success" | "failed" | "skipped";
export type TestCategory = "flow" | "edge-case" | "performance" | "security";
export type UserRole = "admin" | "partner" | "customer";

export interface TestStep {
  id: string;
  title: string;
  description: string;
  status: TestStatus;
  result?: string;
  duration?: number;
  error?: string;
  apiCalls?: ApiCallLog[];
}

export interface TestScenario {
  id: string;
  name: string;
  description: string;
  steps: TestStep[];
  category: TestCategory;
}

export interface ApiCallLog {
  timestamp: number;
  method: string;
  endpoint: string;
  role: UserRole;
  requestData?: any;
  responseData?: any;
  statusCode?: number;
  duration: number;
  error?: string;
}

export interface TestExecutionContext {
  scenarioId: string;
  stepId: string;
  role: UserRole;
  authToken?: string;
  createdData: CreatedTestData;
  performance: PerformanceMetrics;
}

export interface CreatedTestData {
  requestIds: number[];
  partnerIds: number[];
  branchIds: number[];
  categoryIds: number[];
  serviceIds: number[];
  userIds: number[];
}

export interface PerformanceMetrics {
  totalApiCalls: number;
  totalDuration: number;
  averageResponseTime: number;
  slowestCall?: ApiCallLog;
  fastestCall?: ApiCallLog;
  failedCalls: number;
}

export interface TestResult {
  scenarioId: string;
  steps: TestStep[];
  performance: PerformanceMetrics;
  createdData: CreatedTestData;
  success: boolean;
  startTime: number;
  endTime: number;
  totalDuration: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  userId: number;
  role: UserRole;
}

