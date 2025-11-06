/**
 * Admin Request Creation API
 * 
 * Allows admin users to create service requests on behalf of customers.
 * All requests created through this endpoint use a fixed external customer ID.
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { createRequestSchema } from '@/schemas/requests';
import { requestService } from '@/lib/services/requestService';
import { authService } from '@/lib/services/authService';
import {
  handleApiError,
  sendSuccessResponse,
  sendErrorResponse,
} from '@/lib/utils/errorHandler';
import { logger } from '@/lib/utils/logger';

const EXTERNAL_CUSTOMER_ID = parseInt(process.env.EXTERNAL_CUSTOMER_ID || '1');

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendErrorResponse(res, {
        message: 'Authorization header missing or invalid',
        code: 'AUTHENTICATION_ERROR',
        statusCode: 401,
      });
    }

    const token = authHeader.substring(7);
    const { userId } = await authService.verifyToken(token);

    // Verify admin access
    const userProfile = await authService.getUserProfile(userId);
    if (userProfile.userType !== 'admin') {
      return sendErrorResponse(res, {
        message: 'Access denied - Admin required',
        code: 'AUTHORIZATION_ERROR',
        statusCode: 403,
      });
    }

    logger.apiRequest(
      req.method!,
      req.url!,
      userId,
      req.headers['x-request-id'] as string
    );

    // Validate request body against schema
    const validatedData = createRequestSchema.parse(req.body);

    // Create request with external customer ID
    const request = await requestService.createRequest(
      validatedData,
      EXTERNAL_CUSTOMER_ID
    );

    logger.info('Admin created request for external customer', {
      requestId: request.id,
      requestNumber: request.requestNumber,
      adminUserId: userId,
      customerId: EXTERNAL_CUSTOMER_ID,
    });

    logger.apiResponse(
      req.method!,
      req.url!,
      201,
      0,
      userId,
      req.headers['x-request-id'] as string
    );

    return sendSuccessResponse(res, { request }, 201);
  } catch (error) {
    const apiError = handleApiError(error);
    logger.error('Admin request creation error', {
      error: apiError.message,
      code: apiError.code,
      requestId: req.headers['x-request-id'] as string,
    });
    return sendErrorResponse(res, apiError);
  }
}


