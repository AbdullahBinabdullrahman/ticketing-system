/**
 * Configuration Schemas
 * 
 * Zod validation schemas for system configuration management
 */

import { z } from 'zod';

/**
 * Configuration keys enum for type safety
 */
export const ConfigurationKeys = z.enum([
  'sla_timeout_minutes',
  'operational_team_emails',
  'admin_notification_emails',
]);

/**
 * Schema for creating or updating a configuration
 */
export const createConfigurationSchema = z.object({
  key: ConfigurationKeys,
  value: z.string().min(1, 'Value is required'),
  description: z.string().optional(),
});

/**
 * Schema for updating a configuration (all fields optional except value)
 */
export const updateConfigurationSchema = z.object({
  value: z.string().min(1, 'Value is required'),
  description: z.string().optional(),
});

/**
 * Schema for SLA timeout configuration (specific validation)
 */
export const slaTimeoutConfigSchema = z.object({
  key: z.literal('sla_timeout_minutes'),
  value: z.string().refine(
    (val) => {
      const num = parseInt(val, 10);
      return !isNaN(num) && num >= 1 && num <= 60;
    },
    { message: 'SLA timeout must be between 1 and 60 minutes' }
  ),
  description: z.string().optional(),
});

/**
 * Schema for email configuration (validates email format)
 */
export const emailConfigSchema = z.object({
  key: z.enum(['operational_team_emails', 'admin_notification_emails']),
  value: z.string().refine(
    (val) => {
      // Validate comma-separated email list
      const emails = val.split(',').map(e => e.trim());
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emails.every(email => email.length === 0 || emailRegex.test(email));
    },
    { message: 'Invalid email format. Use comma-separated email addresses' }
  ),
  description: z.string().optional(),
});

/**
 * Schema for configuration query parameters
 */
export const configurationQuerySchema = z.object({
  key: ConfigurationKeys.optional(),
});

/**
 * Type exports
 */
export type CreateConfigurationInput = z.infer<typeof createConfigurationSchema>;
export type UpdateConfigurationInput = z.infer<typeof updateConfigurationSchema>;
export type SlaTimeoutConfigInput = z.infer<typeof slaTimeoutConfigSchema>;
export type EmailConfigInput = z.infer<typeof emailConfigSchema>;
export type ConfigurationQueryInput = z.infer<typeof configurationQuerySchema>;
