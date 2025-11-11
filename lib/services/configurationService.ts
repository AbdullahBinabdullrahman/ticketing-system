/**
 * Configuration Service
 * 
 * Manages system-wide configurations stored in the database.
 * Provides methods to get and set global configurations like SLA timeout,
 * notification emails, and other system settings.
 */

import { db } from '../db/connection';
import { configurations } from '../db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { logger } from '../utils/logger';

/**
 * Configuration keys used in the system
 */
export const CONFIG_KEYS = {
  SLA_TIMEOUT_MINUTES: 'sla_timeout_minutes',
  OPERATIONAL_TEAM_EMAILS: 'operational_team_emails',
  ADMIN_NOTIFICATION_EMAILS: 'admin_notification_emails',
} as const;

/**
 * Configuration value interface
 */
export interface ConfigurationValue {
  id: number;
  key: string;
  value: string;
  description: string | null;
  updatedAt: Date | string | null;
}

/**
 * Configuration Service Class
 */
export class ConfigurationService {
  /**
   * Get a global configuration value by key
   * @param key - Configuration key
   * @returns Configuration value or null if not found
   */
  async getGlobalConfig(key: string): Promise<ConfigurationValue | null> {
    try {
      const config = await db
        .select({
          id: configurations.id,
          key: configurations.key,
          value: configurations.value,
          description: configurations.description,
          updatedAt: configurations.updatedAt,
        })
        .from(configurations)
        .where(
          and(
            sql`${configurations.scope} = 'global'::config_scope_enum`,
            eq(configurations.key, key),
            eq(configurations.isActive, true),
            eq(configurations.isDeleted, false)
          )
        )
        .limit(1);

      if (config.length === 0) {
        logger.debug(`Configuration not found: ${key}`);
        return null;
      }

      return config[0];
    } catch (error) {
      logger.error('Error fetching global config', { key, error });
      throw error;
    }
  }

  /**
   * Set a global configuration value
   * @param key - Configuration key
   * @param value - Configuration value
   * @param description - Optional description
   * @param userId - User ID making the change
   * @returns Updated or created configuration
   */
  async setGlobalConfig(
    key: string,
    value: string,
    description: string | undefined,
    userId: number
  ): Promise<ConfigurationValue> {
    try {
      // Check if config already exists
      const existing = await db
        .select()
        .from(configurations)
        .where(
          and(
            sql`${configurations.scope} = 'global'::config_scope_enum`,
            eq(configurations.key, key),
            eq(configurations.isDeleted, false)
          )
        )
        .limit(1);

      if (existing.length > 0) {
        // Update existing
        const updated = await db
          .update(configurations)
          .set({
            value,
            description: description || existing[0].description,
            updatedAt: new Date(),
            updatedById: userId,
            isActive: true,
          })
          .where(eq(configurations.id, existing[0].id))
          .returning({
            id: configurations.id,
            key: configurations.key,
            value: configurations.value,
            description: configurations.description,
            updatedAt: configurations.updatedAt,
          });

        logger.info('Configuration updated', { key, userId });
        return updated[0];
      } else {
        // Create new
        const created = await db
          .insert(configurations)
          .values({
            scope: 'global',
            key,
            value,
            description: description || null,
            createdById: userId,
            updatedById: userId,
            isActive: true,
            isDeleted: false,
          })
          .returning({
            id: configurations.id,
            key: configurations.key,
            value: configurations.value,
            description: configurations.description,
            updatedAt: configurations.updatedAt,
          });

        logger.info('Configuration created', { key, userId });
        return created[0];
      }
    } catch (error) {
      logger.error('Error setting global config', { key, error });
      throw error;
    }
  }

  /**
   * Get all global configurations
   * @returns Array of all global configurations
   */
  async getAllGlobalConfigs(): Promise<ConfigurationValue[]> {
    try {
      const configs = await db
        .select({
          id: configurations.id,
          key: configurations.key,
          value: configurations.value,
          description: configurations.description,
          updatedAt: configurations.updatedAt,
        })
        .from(configurations)
        .where(
          and(
            sql`${configurations.scope} = 'global'::config_scope_enum`,
            eq(configurations.isActive, true),
            eq(configurations.isDeleted, false)
          )
        )
        .orderBy(configurations.key);

      return configs;
    } catch (error) {
      logger.error('Error fetching all global configs', { error });
      throw error;
    }
  }

  /**
   * Delete a global configuration
   * @param key - Configuration key to delete
   * @param userId - User ID making the change
   */
  async deleteGlobalConfig(key: string, userId: number): Promise<void> {
    try {
      await db
        .update(configurations)
        .set({
          isDeleted: true,
          updatedAt: new Date(),
          updatedById: userId,
        })
        .where(
          and(
            sql`${configurations.scope} = 'global'::config_scope_enum`,
            eq(configurations.key, key)
          )
        );

      logger.info('Configuration deleted', { key, userId });
    } catch (error) {
      logger.error('Error deleting global config', { key, error });
      throw error;
    }
  }

  /**
   * Get SLA timeout in minutes
   * Returns configured value or default from environment variable
   * @returns SLA timeout in minutes
   */
  async getSlaTimeout(): Promise<number> {
    try {
      const config = await this.getGlobalConfig(CONFIG_KEYS.SLA_TIMEOUT_MINUTES);
      
      if (config && config.value) {
        const timeout = parseInt(config.value, 10);
        if (!isNaN(timeout) && timeout > 0 && timeout <= 60) {
          return timeout;
        }
      }

      // Fallback to environment variable or default
      const envTimeout = parseInt(process.env.DEFAULT_SLA_TIMEOUT_MINUTES || '15', 10);
      return !isNaN(envTimeout) ? envTimeout : 15;
    } catch (error) {
      logger.error('Error getting SLA timeout, using default', { error });
      return 15; // Fallback to default
    }
  }

  /**
   * Get operational team email addresses
   * @returns Array of email addresses
   */
  async getOperationalTeamEmails(): Promise<string[]> {
    try {
      const config = await this.getGlobalConfig(CONFIG_KEYS.OPERATIONAL_TEAM_EMAILS);
      
      if (config && config.value) {
        // Split by comma and trim whitespace
        return config.value
          .split(',')
          .map(email => email.trim())
          .filter(email => email.length > 0);
      }

      // Fallback to environment variable
      const envEmails = process.env.OPERATIONAL_TEAM_EMAILS || '';
      if (envEmails) {
        return envEmails
          .split(',')
          .map(email => email.trim())
          .filter(email => email.length > 0);
      }

      return [];
    } catch (error) {
      logger.error('Error getting operational team emails', { error });
      return [];
    }
  }

  /**
   * Get admin notification email addresses
   * @returns Array of email addresses
   */
  async getAdminEmails(): Promise<string[]> {
    try {
      const config = await this.getGlobalConfig(CONFIG_KEYS.ADMIN_NOTIFICATION_EMAILS);
      
      if (config && config.value) {
        // Split by comma and trim whitespace
        return config.value
          .split(',')
          .map(email => email.trim())
          .filter(email => email.length > 0);
      }

      // Fallback to environment variable
      const envEmail = process.env.ADMIN_EMAIL || '';
      if (envEmail) {
        return [envEmail];
      }

      return [];
    } catch (error) {
      logger.error('Error getting admin emails', { error });
      return [];
    }
  }

  /**
   * Get all SLA notification recipients (admin + operational team)
   * @returns Array of unique email addresses
   */
  async getSlaNotificationRecipients(): Promise<string[]> {
    try {
      const adminEmails = await this.getAdminEmails();
      const operationalEmails = await this.getOperationalTeamEmails();
      
      // Combine and deduplicate
      const allEmails = [...adminEmails, ...operationalEmails];
      return Array.from(new Set(allEmails));
    } catch (error) {
      logger.error('Error getting SLA notification recipients', { error });
      return [];
    }
  }
}

// Create and export singleton instance
export const configurationService = new ConfigurationService();

