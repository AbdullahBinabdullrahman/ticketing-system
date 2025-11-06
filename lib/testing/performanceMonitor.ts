/**
 * Performance Monitor for Testing
 * Tracks and analyzes API call performance metrics
 */

import type { ApiCallLog, PerformanceMetrics } from "./types";
import { logger } from "../utils/logger";

export class PerformanceMonitor {
  private apiCalls: ApiCallLog[] = [];
  private startTime: number = 0;

  /**
   * Start monitoring
   */
  start(): void {
    this.startTime = Date.now();
    this.apiCalls = [];
    logger.info("Performance monitoring started");
  }

  /**
   * Log an API call
   */
  logApiCall(call: ApiCallLog): void {
    this.apiCalls.push(call);
  }

  /**
   * Get current metrics
   */
  getMetrics(): PerformanceMetrics {
    if (this.apiCalls.length === 0) {
      return {
        totalApiCalls: 0,
        totalDuration: 0,
        averageResponseTime: 0,
        failedCalls: 0,
      };
    }

    const totalDuration = this.apiCalls.reduce((sum, call) => sum + call.duration, 0);
    const failedCalls = this.apiCalls.filter((call) => call.error || (call.statusCode && call.statusCode >= 400)).length;

    const sortedByDuration = [...this.apiCalls].sort((a, b) => b.duration - a.duration);
    const slowestCall = sortedByDuration[0];
    const fastestCall = sortedByDuration[sortedByDuration.length - 1];

    return {
      totalApiCalls: this.apiCalls.length,
      totalDuration,
      averageResponseTime: totalDuration / this.apiCalls.length,
      slowestCall,
      fastestCall,
      failedCalls,
    };
  }

  /**
   * Get all API calls
   */
  getAllCalls(): ApiCallLog[] {
    return [...this.apiCalls];
  }

  /**
   * Get calls by endpoint
   */
  getCallsByEndpoint(endpoint: string): ApiCallLog[] {
    return this.apiCalls.filter((call) => call.endpoint === endpoint);
  }

  /**
   * Get failed calls
   */
  getFailedCalls(): ApiCallLog[] {
    return this.apiCalls.filter((call) => call.error || (call.statusCode && call.statusCode >= 400));
  }

  /**
   * Get slow calls (above threshold in ms)
   */
  getSlowCalls(thresholdMs: number = 1000): ApiCallLog[] {
    return this.apiCalls.filter((call) => call.duration > thresholdMs);
  }

  /**
   * Generate performance report
   */
  generateReport(): string {
    const metrics = this.getMetrics();
    const totalTime = Date.now() - this.startTime;

    let report = "=== Performance Report ===\n\n";
    report += `Total Test Duration: ${totalTime}ms\n`;
    report += `Total API Calls: ${metrics.totalApiCalls}\n`;
    report += `Average Response Time: ${metrics.averageResponseTime.toFixed(2)}ms\n`;
    report += `Failed Calls: ${metrics.failedCalls}\n\n`;

    if (metrics.slowestCall) {
      report += `Slowest Call: ${metrics.slowestCall.method} ${metrics.slowestCall.endpoint} (${metrics.slowestCall.duration}ms)\n`;
    }

    if (metrics.fastestCall) {
      report += `Fastest Call: ${metrics.fastestCall.method} ${metrics.fastestCall.endpoint} (${metrics.fastestCall.duration}ms)\n`;
    }

    const slowCalls = this.getSlowCalls(1000);
    if (slowCalls.length > 0) {
      report += `\nSlow Calls (>1s): ${slowCalls.length}\n`;
      slowCalls.forEach((call) => {
        report += `  - ${call.method} ${call.endpoint} (${call.duration}ms)\n`;
      });
    }

    const failedCalls = this.getFailedCalls();
    if (failedCalls.length > 0) {
      report += `\nFailed Calls: ${failedCalls.length}\n`;
      failedCalls.forEach((call) => {
        report += `  - ${call.method} ${call.endpoint}: ${call.error || `Status ${call.statusCode}`}\n`;
      });
    }

    return report;
  }

  /**
   * Reset monitoring data
   */
  reset(): void {
    this.apiCalls = [];
    this.startTime = Date.now();
    logger.info("Performance monitor reset");
  }

  /**
   * Export data for analysis
   */
  exportData(): {
    startTime: number;
    endTime: number;
    apiCalls: ApiCallLog[];
    metrics: PerformanceMetrics;
  } {
    return {
      startTime: this.startTime,
      endTime: Date.now(),
      apiCalls: this.apiCalls,
      metrics: this.getMetrics(),
    };
  }
}

// Singleton instance for testing
export const performanceMonitor = new PerformanceMonitor();

