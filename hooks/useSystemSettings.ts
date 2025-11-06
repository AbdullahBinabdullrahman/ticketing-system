/**
 * System Settings Hooks
 * 
 * Custom hooks for fetching and updating system configurations
 */

import useSWR, { mutate } from "swr";
import http from "@/lib/utils/http";
import { useState } from "react";
import { ConfigurationValue } from "@/lib/services/configurationService";

/**
 * Response type for configurations list
 */
interface ConfigurationsResponse {
  configurations: ConfigurationValue[];
  total: number;
}

/**
 * Hook to fetch all system settings
 */
export function useSystemSettings() {
  const { data, error, isLoading } = useSWR<ConfigurationsResponse>(
    "/admin/configurations",
    (url) => http.get(url).then((res) => res.data.data) // Extract nested data property
  );

  // Helper to get specific config value
  const getConfigValue = (key: string): string | undefined => {
    return data?.configurations?.find((c) => c.key === key)?.value;
  };

  // Helper to get specific config
  const getConfig = (key: string): ConfigurationValue | undefined => {
    return data?.configurations?.find((c) => c.key === key);
  };

  return {
    configurations: data?.configurations || [],
    total: data?.total || 0,
    isLoading,
    isError: !!error,
    error,
    getConfigValue,
    getConfig,
  };
}

/**
 * Hook to fetch a specific configuration
 */
export function useConfiguration(key: string) {
  const { data, error, isLoading } = useSWR<ConfigurationValue>(
    key ? `/admin/configurations/${key}` : null,
    (url) => http.get(url).then((res) => res.data.data) // Extract nested data property
  );

  return {
    configuration: data,
    isLoading,
    isError: !!error,
    error,
  };
}

/**
 * Configuration update input
 */
interface UpdateConfigInput {
  key: string;
  value: string;
  description?: string;
}

/**
 * Hook to update system settings
 */
export function useUpdateSettings() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  const updateConfiguration = async (input: UpdateConfigInput) => {
    setIsUpdating(true);
    setUpdateError(null);

    try {
      const response = await http.post("/admin/configurations", input);
      
      // Revalidate the configurations list
      await mutate("/admin/configurations");
      await mutate(`/admin/configurations/${input.key}`);
      
      return response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error?.message || "Failed to update configuration";
      setUpdateError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsUpdating(false);
    }
  };

  const updateMultipleConfigurations = async (inputs: UpdateConfigInput[]) => {
    setIsUpdating(true);
    setUpdateError(null);

    try {
      // Update all configurations in parallel
      const promises = inputs.map((input) =>
        http.post("/admin/configurations", input)
      );
      
      const results = await Promise.all(promises);
      
      // Revalidate all affected configurations
      await mutate("/admin/configurations");
      for (const input of inputs) {
        await mutate(`/admin/configurations/${input.key}`);
      }
      
      return results.map((r) => r.data);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error?.message ||
        "Failed to update configurations";
      setUpdateError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsUpdating(false);
    }
  };

  const deleteConfiguration = async (key: string) => {
    setIsUpdating(true);
    setUpdateError(null);

    try {
      await http.delete(`/admin/configurations/${key}`);
      
      // Revalidate the configurations list
      await mutate("/admin/configurations");
      await mutate(`/admin/configurations/${key}`);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error?.message || "Failed to delete configuration";
      setUpdateError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    updateConfiguration,
    updateMultipleConfigurations,
    deleteConfiguration,
    isUpdating,
    updateError,
  };
}

/**
 * Hook for SLA-specific settings
 */
export function useSlaSettings() {
  const { getConfigValue, getConfig, isLoading, isError } = useSystemSettings();
  
  const slaTimeout = getConfigValue("sla_timeout_minutes");
  const operationalTeamEmails = getConfigValue("operational_team_emails");
  const adminEmails = getConfigValue("admin_notification_emails");

  return {
    slaTimeout: slaTimeout ? parseInt(slaTimeout, 10) : 15,
    operationalTeamEmails: operationalTeamEmails || "",
    adminEmails: adminEmails || "",
    slaConfig: getConfig("sla_timeout_minutes"),
    operationalConfig: getConfig("operational_team_emails"),
    adminConfig: getConfig("admin_notification_emails"),
    isLoading,
    isError,
  };
}

