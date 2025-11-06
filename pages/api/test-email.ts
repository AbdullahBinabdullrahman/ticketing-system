import type { NextApiRequest, NextApiResponse } from "next";
import emailService from "../../services/emailService";

/**
 * Test Email API - FOR TESTING ONLY, REMOVE IN PRODUCTION
 * GET /api/test-email?email=your@email.com
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { email } = req.query;

  if (!email || typeof email !== "string") {
    return res.status(400).json({ error: "Email parameter required" });
  }

  try {
    const result = await emailService.sendPasswordResetEmail(
      email,
      "test-token-123",
      "http://localhost:3000/partner/reset-password?token=test-token-123",
      "en"
    );

    return res.status(200).json({
      success: true,
      result,
      message: `Test email sent to ${email}. Check your inbox!`,
    });
  } catch (error) {
    console.error("Test email error:", error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

