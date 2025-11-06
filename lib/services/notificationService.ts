/**
 * Notification Service
 * Wrapper around emailService.ts for ticketing system notifications
 * Handles all email notifications for requests, assignments, status updates
 */

import emailService, { Language } from "../../services/emailService";
import { logger } from "../utils/logger";

/**
 * Request notification data interface
 */
export interface RequestNotificationData {
  requestNumber: string;
  requestId: number;
  customerName: string;
  customerEmail: string;
  partnerName: string;
  partnerEmail: string;
  branchName: string;
  branchAddress: string;
  serviceName: string;
  categoryName: string;
  status: string;
  notes?: string;
  rejectionReason?: string;
}

/**
 * Notification Service Class
 */
class NotificationService {
  /**
   * Send email when admin assigns request to partner
   * @param data Request and partner information
   * @param language Partner's preferred language
   */
  async sendRequestAssignedEmail(
    data: RequestNotificationData,
    language: Language = "en"
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const timeLimit = 15; // minutes

      const content = {
        ar: {
          subject: `طلب جديد تم تعيينه - ${data.requestNumber}`,
          message: `تم تعيين طلب خدمة جديد لك.

رقم الطلب: ${data.requestNumber}
الفرع: ${data.branchName}
الخدمة: ${data.serviceName}
الفئة: ${data.categoryName}
اسم العميل: ${data.customerName}
الموقع: ${data.branchAddress}

⏰ مهم: يرجى قبول أو رفض الطلب خلال ${timeLimit} دقيقة.

سجل الدخول إلى لوحة التحكم للرد على الطلب.`,
        },
        en: {
          subject: `New Request Assigned - ${data.requestNumber}`,
          message: `A new service request has been assigned to you.

Request Number: ${data.requestNumber}
Branch: ${data.branchName}
Service: ${data.serviceName}
Category: ${data.categoryName}
Customer Name: ${data.customerName}
Location: ${data.branchAddress}

⏰ Important: Please accept or reject this request within ${timeLimit} minutes.

Log in to your dashboard to respond to this request.`,
        },
      };

      const result = await emailService.sendNotificationEmail(
        data.partnerEmail,
        content[language].subject,
        content[language].message,
        language
      );

      if (result.success) {
        logger.info("Request assigned email sent", {
          requestId: data.requestId,
          recipient: data.partnerEmail,
        });
      }

      return result;
    } catch (error) {
      logger.error("Failed to send request assigned email", {
        error,
        requestId: data.requestId,
      });
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Send email when partner accepts request
   * @param data Request information
   * @param adminEmail Admin email to notify
   * @param language Language preference
   */
  async sendRequestAcceptedEmail(
    data: RequestNotificationData,
    adminEmail: string,
    language: Language = "en"
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const content = {
        ar: {
          adminSubject: `تم قبول الطلب - ${data.requestNumber}`,
          adminMessage: `قام ${data.partnerName} بقبول الطلب.

رقم الطلب: ${data.requestNumber}
الشريك: ${data.partnerName}
الفرع: ${data.branchName}
العميل: ${data.customerName}
الخدمة: ${data.serviceName}`,
          customerSubject: `تم تأكيد طلبك - ${data.requestNumber}`,
          customerMessage: `تم تأكيد طلب الخدمة الخاص بك.

رقم الطلب: ${data.requestNumber}
الفرع: ${data.branchName}
الخدمة: ${data.serviceName}
العنوان: ${data.branchAddress}

سيتم التواصل معك قريباً لتنسيق الخدمة.`,
        },
        en: {
          adminSubject: `Request Accepted - ${data.requestNumber}`,
          adminMessage: `${data.partnerName} has accepted the request.

Request Number: ${data.requestNumber}
Partner: ${data.partnerName}
Branch: ${data.branchName}
Customer: ${data.customerName}
Service: ${data.serviceName}`,
          customerSubject: `Your Request is Confirmed - ${data.requestNumber}`,
          customerMessage: `Your service request has been confirmed.

Request Number: ${data.requestNumber}
Branch: ${data.branchName}
Service: ${data.serviceName}
Address: ${data.branchAddress}

You will be contacted soon to coordinate the service.`,
        },
      };

      // Send to admin
      const adminResult = await emailService.sendNotificationEmail(
        adminEmail,
        content[language].adminSubject,
        content[language].adminMessage,
        language
      );

      // Send to customer
      const customerResult = await emailService.sendNotificationEmail(
        data.customerEmail,
        content[language].customerSubject,
        content[language].customerMessage,
        language
      );

      const success = adminResult.success && customerResult.success;

      if (success) {
        logger.info("Request accepted emails sent", {
          requestId: data.requestId,
          recipients: [adminEmail, data.customerEmail],
        });
      }

      return {
        success,
        error: !success
          ? `Admin: ${adminResult.error}, Customer: ${customerResult.error}`
          : undefined,
      };
    } catch (error) {
      logger.error("Failed to send request accepted emails", {
        error,
        requestId: data.requestId,
      });
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Send email when partner rejects request
   * @param data Request information with rejection reason
   * @param adminEmail Admin email to notify
   * @param language Language preference
   */
  async sendRequestRejectedEmail(
    data: RequestNotificationData,
    adminEmail: string,
    language: Language = "en"
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const content = {
        ar: {
          subject: `تم رفض الطلب - ${data.requestNumber}`,
          message: `قام ${data.partnerName} برفض الطلب.

رقم الطلب: ${data.requestNumber}
الشريك: ${data.partnerName}
الفرع: ${data.branchName}
العميل: ${data.customerName}
الخدمة: ${data.serviceName}

سبب الرفض: ${data.rejectionReason || "لم يتم تحديد السبب"}

يرجى إعادة تعيين الطلب لشريك آخر.`,
        },
        en: {
          subject: `Request Rejected - ${data.requestNumber}`,
          message: `${data.partnerName} has rejected the request.

Request Number: ${data.requestNumber}
Partner: ${data.partnerName}
Branch: ${data.branchName}
Customer: ${data.customerName}
Service: ${data.serviceName}

Rejection Reason: ${data.rejectionReason || "No reason provided"}

Please reassign the request to another partner.`,
        },
      };

      const result = await emailService.sendNotificationEmail(
        adminEmail,
        content[language].subject,
        content[language].message,
        language
      );

      if (result.success) {
        logger.info("Request rejected email sent", {
          requestId: data.requestId,
          recipient: adminEmail,
        });
      }

      return result;
    } catch (error) {
      logger.error("Failed to send request rejected email", {
        error,
        requestId: data.requestId,
      });
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Send email when request status is updated
   * @param data Request information
   * @param newStatus New status of the request
   * @param language Language preference
   */
  async sendRequestStatusUpdateEmail(
    data: RequestNotificationData,
    newStatus: string,
    language: Language = "en"
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const statusTranslations = {
        ar: {
          in_progress: "قيد التنفيذ",
          completed: "مكتمل",
          cancelled: "ملغي",
        },
        en: {
          in_progress: "In Progress",
          completed: "Completed",
          cancelled: "Cancelled",
        },
      };

      const translatedStatus =
        statusTranslations[language][
          newStatus as keyof (typeof statusTranslations)[Language]
        ] || newStatus;

      const content = {
        ar: {
          subject: `تحديث حالة الطلب - ${data.requestNumber}`,
          message: `تم تحديث حالة طلب الخدمة الخاص بك.

رقم الطلب: ${data.requestNumber}
الحالة الجديدة: ${translatedStatus}
الفرع: ${data.branchName}
الخدمة: ${data.serviceName}

${
  data.notes
    ? `ملاحظات: ${data.notes}`
    : "سجل الدخول لعرض تفاصيل الطلب الكاملة."
}`,
        },
        en: {
          subject: `Request Status Update - ${data.requestNumber}`,
          message: `Your service request status has been updated.

Request Number: ${data.requestNumber}
New Status: ${translatedStatus}
Branch: ${data.branchName}
Service: ${data.serviceName}

${data.notes ? `Notes: ${data.notes}` : "Log in to view full request details."}`,
        },
      };

      const result = await emailService.sendNotificationEmail(
        data.customerEmail,
        content[language].subject,
        content[language].message,
        language
      );

      if (result.success) {
        logger.info("Request status update email sent", {
          requestId: data.requestId,
          recipient: data.customerEmail,
          status: newStatus,
        });
      }

      return result;
    } catch (error) {
      logger.error("Failed to send request status update email", {
        error,
        requestId: data.requestId,
      });
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Send email when confirmation timer expires
   * @param data Request information
   * @param adminEmail Admin email to notify
   * @param language Language preference
   */
  async sendTimerExpiredEmail(
    data: RequestNotificationData,
    adminEmail: string,
    language: Language = "en"
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const content = {
        ar: {
          subject: `انتهت مهلة التأكيد - ${data.requestNumber}`,
          message: `انتهت المهلة المحددة لتأكيد الطلب من قبل ${data.partnerName}.

رقم الطلب: ${data.requestNumber}
الشريك: ${data.partnerName}
الفرع: ${data.branchName}
العميل: ${data.customerName}
الخدمة: ${data.serviceName}

يرجى إعادة تعيين الطلب لشريك آخر.`,
        },
        en: {
          subject: `Confirmation Timer Expired - ${data.requestNumber}`,
          message: `The confirmation timer has expired for ${data.partnerName}.

Request Number: ${data.requestNumber}
Partner: ${data.partnerName}
Branch: ${data.branchName}
Customer: ${data.customerName}
Service: ${data.serviceName}

Please reassign the request to another partner.`,
        },
      };

      const result = await emailService.sendNotificationEmail(
        adminEmail,
        content[language].subject,
        content[language].message,
        language
      );

      if (result.success) {
        logger.info("Timer expired email sent", {
          requestId: data.requestId,
          recipient: adminEmail,
        });
      }

      return result;
    } catch (error) {
      logger.error("Failed to send timer expired email", {
        error,
        requestId: data.requestId,
      });
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Send email when SLA timeout occurs
   * Bilingual notification sent to admin and operational team when partner doesn't respond in time
   * @param data SLA timeout information with multiple recipients
   */
  async sendSlaTimeoutEmail(data: {
    requestNumber: string;
    partnerName: string;
    recipients: string[];
    slaDeadline?: Date | string | null;
    assignedAt?: Date | string | null;
  }): Promise<{ success: boolean; error?: string }> {
    try {
      // Calculate timeout duration if possible
      let timeoutDuration = '';
      if (data.slaDeadline && data.assignedAt) {
        const deadline = typeof data.slaDeadline === 'string' ? new Date(data.slaDeadline) : data.slaDeadline;
        const assigned = typeof data.assignedAt === 'string' ? new Date(data.assignedAt) : data.assignedAt;
        const minutes = Math.round((deadline.getTime() - assigned.getTime()) / (1000 * 60));
        timeoutDuration = `${minutes} minutes`;
      }

      // English version
      const subjectEN = `⏰ SLA Timeout Alert - Request ${data.requestNumber}`;
      const messageEN = `<div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9fafb; border-radius: 8px; direction: ltr;">
  <div style="background-color: #fff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <h2 style="color: #dc2626; margin-top: 0;">⏰ SLA Timeout Alert</h2>
    
    <p style="font-size: 16px; color: #374151; line-height: 1.6;">
      Request <strong style="color: #6366f1;">${data.requestNumber}</strong> has been automatically unassigned.
    </p>
    
    <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0;">
      <p style="margin: 0; color: #991b1b; font-weight: 500;">
        Partner <strong>${data.partnerName}</strong> did not respond within the ${timeoutDuration || 'configured SLA'} deadline.
      </p>
    </div>
    
    <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; margin: 20px 0;">
      <h3 style="margin-top: 0; font-size: 16px; color: #374151;">Next Steps:</h3>
      <ul style="color: #6b7280; line-height: 1.8; margin: 0;">
        <li>The request is now back in the <strong>unassigned queue</strong></li>
        <li>Please reassign to another available partner</li>
        <li>Consider reviewing partner response rates</li>
      </ul>
    </div>
    
    <p style="color: #6b7280; margin-top: 30px; font-size: 14px;">
      This is an automated notification from the ticketing system.
    </p>
  </div>
</div>`;

      // Arabic version
      const subjectAR = `⏰ تنبيه انتهاء وقت الاستجابة - طلب ${data.requestNumber}`;
      const messageAR = `<div style="font-family: 'Tahoma', 'Arial Unicode MS', Arial, sans-serif; padding: 20px; background-color: #f9fafb; border-radius: 8px; direction: rtl; text-align: right;">
  <div style="background-color: #fff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <h2 style="color: #dc2626; margin-top: 0;">⏰ تنبيه انتهاء وقت الاستجابة</h2>
    
    <p style="font-size: 16px; color: #374151; line-height: 1.6;">
      تم إلغاء تعيين الطلب <strong style="color: #6366f1;">${data.requestNumber}</strong> تلقائياً.
    </p>
    
    <div style="background-color: #fef2f2; border-right: 4px solid #dc2626; padding: 15px; margin: 20px 0;">
      <p style="margin: 0; color: #991b1b; font-weight: 500;">
        الشريك <strong>${data.partnerName}</strong> لم يستجب خلال ${timeoutDuration ? 'المدة المحددة ' + timeoutDuration : 'المدة المحددة في معايير الخدمة'}.
      </p>
    </div>
    
    <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; margin: 20px 0;">
      <h3 style="margin-top: 0; font-size: 16px; color: #374151;">الخطوات التالية:</h3>
      <ul style="color: #6b7280; line-height: 1.8; margin: 0;">
        <li>الطلب الآن في <strong>قائمة الطلبات غير المعينة</strong></li>
        <li>يرجى إعادة تعيينه لشريك آخر متاح</li>
        <li>يُنصح بمراجعة معدلات استجابة الشركاء</li>
      </ul>
    </div>
    
    <p style="color: #6b7280; margin-top: 30px; font-size: 14px;">
      هذا إشعار تلقائي من نظام التذاكر.
    </p>
  </div>
</div>`;

      // Combine both languages
      const combinedSubject = `${subjectEN} | ${subjectAR}`;
      const combinedMessage = `
        <div style="max-width: 600px; margin: 0 auto;">
          <h1 style="text-align: center; color: #dc2626; font-size: 20px; padding: 20px 0;">
            🚨 SLA Timeout / انتهاء وقت الاستجابة 🚨
          </h1>
          
          <!-- English Version -->
          ${messageEN}
          
          <hr style="margin: 40px 0; border: none; border-top: 2px solid #e5e7eb;">
          
          <!-- Arabic Version -->
          ${messageAR}
        </div>
      `;

      // Send to all recipients
      const result = await emailService.sendEmail({
        to: data.recipients,
        subject: combinedSubject,
        html: combinedMessage,
      });

      if (result.success) {
        logger.info("SLA timeout email sent", {
          requestNumber: data.requestNumber,
          recipients: data.recipients,
          recipientCount: data.recipients.length,
        });
      }

      return result;
    } catch (error) {
      logger.error("Failed to send SLA timeout email", {
        error,
        requestNumber: data.requestNumber,
      });
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Generic method to send notification emails
   * @param to Recipient email
   * @param subject Email subject
   * @param message Email message body
   * @param language Language preference
   */
  async sendNotificationEmail(
    to: string,
    subject: string,
    message: string,
    language: Language = "en"
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const result = await emailService.sendNotificationEmail(
        to,
        subject,
        message,
        language
      );

      if (result.success) {
        logger.info("Notification email sent", {
          recipient: to,
          subject,
        });
      }

      return result;
    } catch (error) {
      logger.error("Failed to send notification email", {
        error,
        recipient: to,
      });
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}

// Create and export a singleton instance
const notificationService = new NotificationService();
export default notificationService;

// Export the class for testing purposes
export { NotificationService };

