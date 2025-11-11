/**
 * Test Flow Page - Interactive testing interface with real API calls
 * Tests complete system flow from customer request to completion
 */

import React, { useState } from "react";
import { useRouter } from "next/router";
import {
  PlayCircle,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  RefreshCw,
  Download,
  FileText,
  TrendingUp,
  Trash2,
  Activity,
  Database,
  Zap,
  Key,
  CheckCircle,
  Copy,
  Terminal,
} from "lucide-react";
import AdminLayout from "@/components/layout/AdminLayout";
import { testExecutor } from "@/lib/testing/testExecutor";
import { testDataCleanup } from "@/lib/testing/cleanup";
import { performanceMonitor } from "@/lib/testing/performanceMonitor";
import { useTestTokens } from "@/lib/testing/useTestTokens";
import type { TestStep, TestScenario, TestResult } from "@/lib/testing/types";

// Import test scenarios definition
import { TEST_SCENARIOS } from "@/lib/testing/scenarios";

export default function TestFlowPage() {
  const router = useRouter();
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<Record<string, TestResult>>(
    {}
  );
  const [liveSteps, setLiveSteps] = useState<Record<string, TestStep[]>>({});
  const [copiedLogs, setCopiedLogs] = useState(false);

  // Auto-generate tokens on page load
  const {
    adminToken,
    partnerToken,
    loading: tokensLoading,
    error: tokensError,
    refreshTokens,
  } = useTestTokens();

  /**
   * Run a test scenario with real API calls
   */
  const runScenario = async (scenarioId: string) => {
    const scenario = TEST_SCENARIOS.find((s) => s.id === scenarioId);
    if (!scenario) return;

    setIsRunning(true);
    setSelectedScenario(scenarioId);
    setLiveSteps({ ...liveSteps, [scenarioId]: [...scenario.steps] });

    // Set up callback for live step updates
    testExecutor.setStepUpdateCallback((sid, step) => {
      setLiveSteps((prev) => {
        const currentSteps = prev[sid] || scenario.steps;
        const updatedSteps = currentSteps.map((s) =>
          s.id === step.id ? { ...step } : s
        );
        return { ...prev, [sid]: updatedSteps };
      });
    });

    try {
      const result = await testExecutor.executeScenario(scenario);
      setTestResults({ ...testResults, [scenarioId]: result });
    } catch (error) {
      console.error("Scenario execution error:", error);
    } finally {
      setIsRunning(false);
    }
  };

  /**
   * Run all scenarios sequentially
   */
  const runAllScenarios = async () => {
    setIsRunning(true);

    for (const scenario of TEST_SCENARIOS) {
      await runScenario(scenario.id);
      // Small delay between scenarios
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    setIsRunning(false);
  };

  /**
   * Clean up test data
   */
  const cleanupTestData = async () => {
    if (
      !confirm(
        "This will delete all test data created during testing. Continue?"
      )
    ) {
      return;
    }

    try {
      await testDataCleanup.cleanupAll();
      alert("Test data cleaned up successfully!");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      alert(`Cleanup failed: ${errorMessage}`);
    }
  };

  /**
   * Export performance report
   */
  const exportPerformanceReport = () => {
    const report = performanceMonitor.generateReport();
    const blob = new Blob([report], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `test-performance-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  /**
   * Export test results as JSON
   */
  const exportResults = () => {
    const data = {
      results: testResults,
      performance: performanceMonitor.exportData(),
      createdData: testDataCleanup.getTrackedData(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `test-results-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  /**
   * Copy debug logs with curl commands for debugging
   */
  const copyDebugLogs = async () => {
    const performanceData = performanceMonitor.exportData();
    const apiCalls = performanceData.apiCalls || [];

    let debugOutput = "=".repeat(80) + "\n";
    debugOutput += "TEST FLOW DEBUG LOGS - CURL COMMANDS & RESPONSES\n";
    debugOutput += "Generated: " + new Date().toISOString() + "\n";
    debugOutput += "=".repeat(80) + "\n\n";

    // Add test results summary
    debugOutput += "📊 TEST SUMMARY\n";
    debugOutput += "-".repeat(80) + "\n";
    debugOutput += `Total Scenarios: ${Object.keys(testResults).length}\n`;
    debugOutput += `Successful: ${
      Object.values(testResults).filter((r) => r.success).length
    }\n`;
    debugOutput += `Failed: ${
      Object.values(testResults).filter((r) => !r.success).length
    }\n`;
    debugOutput += `Total API Calls: ${performanceMetrics.totalApiCalls}\n`;
    debugOutput += `Failed API Calls: ${performanceMetrics.failedCalls}\n`;
    debugOutput += `Average Response Time: ${performanceMetrics.averageResponseTime.toFixed(
      0
    )}ms\n\n`;

    // Add authentication tokens
    debugOutput += "🔐 AUTHENTICATION TOKENS\n";
    debugOutput += "-".repeat(80) + "\n";
    if (adminToken) {
      debugOutput += `Admin Token:\n${adminToken}\n\n`;
    }
    if (partnerToken) {
      debugOutput += `Partner Token:\n${partnerToken}\n\n`;
    }

    // Add detailed API calls with curl commands
    debugOutput += "🔧 API CALLS - CURL COMMANDS & RESPONSES\n";
    debugOutput += "=".repeat(80) + "\n\n";

    apiCalls.forEach((call: Record<string, any>, index: number) => {
      debugOutput += `[${index + 1}] ${call.method} ${call.endpoint}\n`;
      debugOutput += "-".repeat(80) + "\n";

      // Generate curl command
      debugOutput += "📤 CURL COMMAND:\n";
      let curlCmd = `curl -X ${call.method} '${
        call.url || `http://localhost:3000${call.endpoint}`
      }' \\\n`;

      // Add headers
      if (call.headers) {
        Object.entries(call.headers).forEach(([key, value]) => {
          curlCmd += `  -H '${key}: ${value}' \\\n`;
        });
      }

      // Add Authorization header if available
      if (call.token || adminToken) {
        curlCmd += `  -H 'Authorization: Bearer ${
          call.token || adminToken
        }' \\\n`;
      }

      // Add Content-Type for POST/PUT/PATCH
      if (["POST", "PUT", "PATCH"].includes(call.method)) {
        curlCmd += `  -H 'Content-Type: application/json' \\\n`;
      }

      // Add request body
      if (call.requestBody) {
        const bodyStr =
          typeof call.requestBody === "string"
            ? call.requestBody
            : JSON.stringify(call.requestBody);
        curlCmd += `  --data-raw '${bodyStr}'\n`;
      } else {
        // Remove trailing backslash
        curlCmd = curlCmd.slice(0, -3) + "\n";
      }

      debugOutput += curlCmd + "\n";

      // Add request details
      if (call.requestBody) {
        debugOutput += "📥 REQUEST BODY:\n";
        debugOutput += JSON.stringify(call.requestBody, null, 2) + "\n\n";
      }

      // Add response
      debugOutput += "📨 RESPONSE:\n";
      debugOutput += `Status: ${call.statusCode || call.status || "N/A"}\n`;
      debugOutput += `Duration: ${call.duration}ms\n`;

      if (call.success === false || call.error) {
        debugOutput += `❌ ERROR: ${call.error || "Request failed"}\n`;
      }

      if (call.responseBody || call.response) {
        debugOutput += "Response Body:\n";
        const responseStr =
          typeof call.responseBody === "string"
            ? call.responseBody
            : JSON.stringify(call.responseBody || call.response, null, 2);
        debugOutput += responseStr + "\n";
      }

      debugOutput += "\n" + "=".repeat(80) + "\n\n";
    });

    // Add test scenarios details
    debugOutput += "📋 TEST SCENARIOS RESULTS\n";
    debugOutput += "=".repeat(80) + "\n\n";

    Object.entries(testResults).forEach(([scenarioId, result]) => {
      const scenario = TEST_SCENARIOS.find((s) => s.id === scenarioId);
      if (!scenario) return;

      debugOutput += `Scenario: ${scenario.name}\n`;
      debugOutput += `ID: ${scenarioId}\n`;
      debugOutput += `Status: ${result.success ? "✅ SUCCESS" : "❌ FAILED"}\n`;
      debugOutput += `Duration: ${(result.totalDuration / 1000).toFixed(2)}s\n`;

      if (!result.success) {
        const failedStep = result.steps.find((s) => s.status === "failed");
        if (failedStep) {
          debugOutput += `Failed Step: ${failedStep.title}\n`;
          if (failedStep.error) {
            debugOutput += `Error: ${failedStep.error}\n`;
          }
        }
      }

      debugOutput += "\nSteps:\n";
      const steps = liveSteps[scenarioId] || scenario.steps;
      steps.forEach((step, idx) => {
        const statusIcon =
          step.status === "success"
            ? "✅"
            : step.status === "failed"
            ? "❌"
            : step.status === "running"
            ? "🔄"
            : step.status === "skipped"
            ? "⏭️"
            : "⏸️";
        debugOutput += `  ${idx + 1}. ${statusIcon} ${step.title}\n`;
        if (step.error) {
          debugOutput += `     Error: ${step.error}\n`;
        }
        if (step.result) {
          debugOutput += `     Result: ${step.result}\n`;
        }
      });

      debugOutput += "\n" + "-".repeat(80) + "\n\n";
    });

    // Add created test data
    debugOutput += "💾 CREATED TEST DATA\n";
    debugOutput += "=".repeat(80) + "\n";
    debugOutput += testDataCleanup.getSummary() + "\n\n";

    // Copy to clipboard
    try {
      await navigator.clipboard.writeText(debugOutput);
      setCopiedLogs(true);
      setTimeout(() => setCopiedLogs(false), 3000);
    } catch (err) {
      // Fallback: create downloadable file
      console.error("Clipboard error:", err);
      const blob = new Blob([debugOutput], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `debug-logs-${Date.now()}.txt`;
      a.click();
      URL.revokeObjectURL(url);
      alert("Logs downloaded (clipboard not available)");
    }
  };

  /**
   * Get status icon for step
   */
  const getStatusIcon = (status: TestStep["status"]) => {
    switch (status) {
      case "pending":
        return <Clock className="w-5 h-5 text-gray-400" />;
      case "running":
        return <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />;
      case "success":
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case "failed":
        return <XCircle className="w-5 h-5 text-red-600" />;
      case "skipped":
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
    }
  };

  /**
   * Get category icon
   */
  const getCategoryIcon = (category: TestScenario["category"]) => {
    switch (category) {
      case "flow":
        return <PlayCircle className="w-5 h-5" />;
      case "edge-case":
        return <AlertCircle className="w-5 h-5" />;
      case "performance":
        return <TrendingUp className="w-5 h-5" />;
      case "security":
        return <Zap className="w-5 h-5" />;
    }
  };

  /**
   * Get category color
   */
  const getCategoryColor = (category: TestScenario["category"]) => {
    switch (category) {
      case "flow":
        return "bg-blue-100 text-blue-800";
      case "edge-case":
        return "bg-yellow-100 text-yellow-800";
      case "performance":
        return "bg-purple-100 text-purple-800";
      case "security":
        return "bg-red-100 text-red-800";
    }
  };

  // Calculate overall statistics
  const totalScenarios = TEST_SCENARIOS.length;
  const completedScenarios = Object.keys(testResults).length;
  const successfulScenarios = Object.values(testResults).filter(
    (r) => r.success
  ).length;
  const performanceMetrics = performanceMonitor.getMetrics();

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                System Flow Testing Suite (Real API Calls)
              </h1>
              <p className="text-gray-600">
                Comprehensive end-to-end testing with actual database
                operations. Tests all user stories from the presentation
                document.
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={runAllScenarios}
                disabled={isRunning || tokensLoading}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-400 transition-colors flex items-center gap-2"
              >
                <PlayCircle className="w-4 h-4" />
                Run All Tests
              </button>
              <button
                onClick={copyDebugLogs}
                disabled={Object.keys(testResults).length === 0}
                className={`px-4 py-2 ${
                  copiedLogs
                    ? "bg-green-600"
                    : "bg-purple-600 hover:bg-purple-700"
                } text-white rounded-lg disabled:bg-gray-400 transition-colors flex items-center gap-2`}
              >
                {copiedLogs ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy Debug Logs
                  </>
                )}
              </button>
              <button
                onClick={exportResults}
                disabled={Object.keys(testResults).length === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export Results
              </button>
              <button
                onClick={cleanupTestData}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Cleanup Data
              </button>
            </div>
          </div>

          {/* Token Status */}
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Key className="w-5 h-5 text-gray-600" />
                <span className="font-medium text-gray-700">
                  Authentication Status:
                </span>
                {tokensLoading ? (
                  <span className="text-blue-600 flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Generating tokens...
                  </span>
                ) : tokensError ? (
                  <span className="text-red-600">{tokensError}</span>
                ) : (
                  <span className="text-green-600 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Ready (Admin & Partner tokens active)
                  </span>
                )}
              </div>
              {!tokensLoading && !tokensError && (
                <button
                  onClick={refreshTokens}
                  className="px-3 py-1.5 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors flex items-center gap-2"
                >
                  <RefreshCw className="w-3 h-3" />
                  Refresh Tokens
                </button>
              )}
            </div>
            {!tokensLoading && adminToken && partnerToken && (
              <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                <div className="p-2 bg-white rounded border border-gray-200">
                  <div className="font-medium text-gray-700 mb-1">
                    Admin Token:
                  </div>
                  <div className="font-mono text-gray-600 truncate">
                    {adminToken.substring(0, 50)}...
                  </div>
                </div>
                <div className="p-2 bg-white rounded border border-gray-200">
                  <div className="font-medium text-gray-700 mb-1">
                    Partner Token:
                  </div>
                  <div className="font-mono text-gray-600 truncate">
                    {partnerToken.substring(0, 50)}...
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Debug Info */}
          {Object.keys(testResults).length > 0 && (
            <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="flex items-start gap-3">
                <Terminal className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-purple-900 font-medium">
                    Debug Logs Available
                  </p>
                  <p className="text-xs text-purple-700 mt-1">
                    Click &ldquo;Copy Debug Logs&rdquo; to copy all API calls
                    with curl commands, request/response data, and
                    authentication tokens. Perfect for debugging with curl or
                    sharing with your team.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <FileText className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-600">Total Scenarios</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {totalScenarios}
              </p>
            </div>

            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <Activity className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-blue-600">Completed</span>
              </div>
              <p className="text-2xl font-bold text-blue-900">
                {completedScenarios}/{totalScenarios}
              </p>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-600">Success Rate</span>
              </div>
              <p className="text-2xl font-bold text-green-900">
                {completedScenarios > 0
                  ? Math.round((successfulScenarios / completedScenarios) * 100)
                  : 0}
                %
              </p>
            </div>

            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-purple-600" />
                <span className="text-sm text-purple-600">Avg Response</span>
              </div>
              <p className="text-2xl font-bold text-purple-900">
                {performanceMetrics.averageResponseTime.toFixed(0)}ms
              </p>
            </div>
          </div>
        </div>

        {/* Performance Overview */}
        {performanceMetrics.totalApiCalls > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Performance Metrics
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div>
                <p className="text-sm text-gray-600">Total API Calls</p>
                <p className="text-xl font-bold text-gray-900">
                  {performanceMetrics.totalApiCalls}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Duration</p>
                <p className="text-xl font-bold text-gray-900">
                  {(performanceMetrics.totalDuration / 1000).toFixed(2)}s
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Avg Response</p>
                <p className="text-xl font-bold text-gray-900">
                  {performanceMetrics.averageResponseTime.toFixed(0)}ms
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Failed Calls</p>
                <p className="text-xl font-bold text-red-600">
                  {performanceMetrics.failedCalls}
                </p>
              </div>
              <div>
                <button
                  onClick={exportPerformanceReport}
                  className="w-full px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
                >
                  Export Report
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Test Data Summary */}
        {Object.keys(testResults).length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Database className="w-5 h-5" />
              Created Test Data
            </h2>
            <div className="text-sm text-gray-600 whitespace-pre-line">
              {testDataCleanup.getSummary()}
            </div>
          </div>
        )}

        {/* Test Scenarios Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {TEST_SCENARIOS.map((scenario) => {
            const result = testResults[scenario.id];
            const steps = liveSteps[scenario.id] || scenario.steps;
            const successCount = steps.filter(
              (r) => r.status === "success"
            ).length;
            const totalSteps = scenario.steps.length;
            const progress = (successCount / totalSteps) * 100;

            return (
              <div
                key={scenario.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                {/* Scenario Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getCategoryIcon(scenario.category)}
                      <h3 className="text-lg font-semibold text-gray-900">
                        {scenario.name}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      {scenario.description}
                    </p>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(
                        scenario.category
                      )}`}
                    >
                      {scenario.category.replace("-", " ").toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                {result && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-medium text-gray-900">
                        {successCount}/{totalSteps} steps
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          result.success ? "bg-green-600" : "bg-blue-600"
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    {result.totalDuration && (
                      <div className="text-xs text-gray-500 mt-1">
                        Completed in {(result.totalDuration / 1000).toFixed(2)}s
                      </div>
                    )}
                  </div>
                )}

                {/* Steps */}
                <div className="space-y-2 mb-4 max-h-60 overflow-y-auto">
                  {steps.map((step, index) => (
                    <div
                      key={step.id}
                      className="flex items-start gap-3 p-2 rounded hover:bg-gray-50"
                    >
                      <div className="shrink-0 mt-0.5">
                        {getStatusIcon(step.status)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {index + 1}. {step.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {step.description}
                        </p>
                        {step.result && (
                          <p className="text-xs text-green-600 mt-1">
                            {step.result}
                          </p>
                        )}
                        {step.error && (
                          <p className="text-xs text-red-600 mt-1">
                            {step.error}
                          </p>
                        )}
                        {step.duration && (
                          <p className="text-xs text-gray-400 mt-1">
                            {step.duration}ms
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => runScenario(scenario.id)}
                    disabled={
                      (isRunning && selectedScenario === scenario.id) ||
                      tokensLoading ||
                      tokensError !== null
                    }
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    title={
                      tokensLoading
                        ? "Waiting for authentication..."
                        : tokensError || ""
                    }
                  >
                    {isRunning && selectedScenario === scenario.id ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Running...
                      </>
                    ) : (
                      <>
                        <PlayCircle className="w-4 h-4" />
                        Run Test
                      </>
                    )}
                  </button>

                  {result && (
                    <button
                      onClick={() => {
                        const newResults = { ...testResults };
                        delete newResults[scenario.id];
                        setTestResults(newResults);
                        const newSteps = { ...liveSteps };
                        delete newSteps[scenario.id];
                        setLiveSteps(newSteps);
                      }}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Documentation Link */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <FileText className="w-6 h-6 text-blue-600 shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                Test Documentation
              </h3>
              <p className="text-blue-800 mb-4">
                For complete test scenarios, expected results, and detailed
                instructions, refer to the TEST_SCENARIOS.md document. This page
                executes real API calls against the live database.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => window.open("/TEST_SCENARIOS.md", "_blank")}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  View Documentation
                </button>
                <button
                  onClick={() => router.push("/admin/requests")}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  View Requests Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export async function getServerSideProps() {
  return {
    props: {},
  };
}
