/**
 * Ticketing System Cron Jobs
 * 
 * Standalone Node.js application that runs scheduled background tasks
 * for the ticketing system by calling Next.js API endpoints.
 * 
 * Jobs:
 * - SLA Check: Runs every minute to auto-unassign expired requests
 */

require('dotenv').config();
const cron = require('node-cron');
const axios = require('axios');

// Configuration
const API_BASE_URL = process.env.API_BASE_URL;
const CRON_SECRET = process.env.CRON_SECRET;
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';

// Validate required environment variables
if (!API_BASE_URL) {
  console.error('❌ ERROR: API_BASE_URL is required');
  process.exit(1);
}

if (!CRON_SECRET) {
  console.error('❌ ERROR: CRON_SECRET is required');
  process.exit(1);
}

// Simple logger
const logger = {
  info: (message, data = {}) => {
    if (LOG_LEVEL === 'info' || LOG_LEVEL === 'debug') {
      console.log(`[INFO] ${message}`, data);
    }
  },
  error: (message, data = {}) => {
    console.error(`[ERROR] ${message}`, data);
  },
  debug: (message, data = {}) => {
    if (LOG_LEVEL === 'debug') {
      console.log(`[DEBUG] ${message}`, data);
    }
  }
};

/**
 * SLA Check Job
 * 
 * Runs every minute to check for requests that have exceeded
 * the 15-minute SLA deadline and auto-unassigns them.
 */
cron.schedule('* * * * *', async () => {
  const timestamp = new Date().toISOString();
  logger.debug(`[${timestamp}] Running SLA check...`);

  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/cron/sla-check`,
      {},
      {
        headers: {
          'x-cron-secret': CRON_SECRET,
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30 second timeout
      }
    );

    if (response.data.unassignedCount > 0) {
      logger.info(`[${timestamp}] SLA check completed - Unassigned ${response.data.unassignedCount} request(s)`, {
        count: response.data.unassignedCount,
        duration: response.data.durationMs
      });
    } else {
      logger.debug(`[${timestamp}] SLA check completed - No expired requests`);
    }
  } catch (error) {
    logger.error(`[${timestamp}] SLA check failed`, {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      code: error.code
    });

    // If unauthorized, exit to prevent spam
    if (error.response?.status === 401) {
      logger.error('Unauthorized access - check CRON_SECRET. Exiting...');
      process.exit(1);
    }
  }
});

// Startup message
console.log('');
console.log('🚀 Ticketing System Cron Jobs Started');
console.log('=====================================');
console.log(`📍 API Base URL: ${API_BASE_URL}`);
console.log(`⏰ SLA Check: Runs every minute`);
console.log(`📊 Log Level: ${LOG_LEVEL}`);
console.log(`🕐 Started at: ${new Date().toISOString()}`);
console.log('=====================================');
console.log('');

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('');
  console.log('👋 Shutting down cron jobs gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('');
  console.log('👋 Shutting down cron jobs gracefully...');
  process.exit(0);
});

// Unhandled rejection handler
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', { promise, reason });
});

// Uncaught exception handler
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', { error: error.message, stack: error.stack });
  process.exit(1);
});




