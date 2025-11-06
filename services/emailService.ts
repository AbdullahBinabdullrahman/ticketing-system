/**
 * Email Service using Nodemailer with PrivateEmail SMTP Configuration
 *
 * Setup:
 * 1. Make sure to set the NEXT_PUBLIC_EMAIL_PASSWORD environment variable with your account password
 * 2. Add to your .env.local file:
 *    NEXT_PUBLIC_EMAIL=platform@mesdrive.com
 *    NEXT_PUBLIC_EMAIL_PASSWORD=your_account_password
 *
 * Usage Examples:
 *
 * // Send a simple email
 * const result = await emailService.sendEmail({
 *   to: 'user@example.com',
 *   subject: 'Test Email',
 *   html: '<h1>Hello World!</h1>',
 *   text: 'Hello World!'
 * });
 *
 * // Send a welcome email with password (English)
 * await emailService.sendWelcomeEmail('user@example.com', 'John Doe', 'TempPass123!', 'en');
 *
 * // Send a welcome email with password (Arabic)
 * await emailService.sendWelcomeEmail('user@example.com', 'أحمد محمد', 'TempPass123!', 'ar');
 *
 * // Send a notification (English)
 * await emailService.sendNotificationEmail('user@example.com', 'Booking Confirmed', 'Your car booking has been confirmed.', 'en');
 *
 * // Send a notification (Arabic)
 * await emailService.sendNotificationEmail('user@example.com', 'تم تأكيد الحجز', 'تم تأكيد حجز السيارة الخاص بك.', 'ar');
 *
 * // Send password reset email (English)
 * await emailService.sendPasswordResetEmail('user@example.com', 'reset-token', 'https://yoursite.com/reset?token=reset-token', 'en');
 *
 * // Send password reset email (Arabic)
 * await emailService.sendPasswordResetEmail('user@example.com', 'reset-token', 'https://yoursite.com/reset?token=reset-token', 'ar');
 *
 * // Send OTP code (English)
 * await emailService.sendOTPEmail('user@example.com', '123456', 'login', 10, 'en');
 *
 * // Send OTP code (Arabic)
 * await emailService.sendOTPEmail('user@example.com', '123456', 'تسجيل الدخول', 10, 'ar');
 */

import nodemailer, { Transporter } from "nodemailer";

// Email configuration interface
interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

// Language type
export type Language = "ar" | "en";

// Email options interface
export interface EmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  attachments?: Array<{
    filename: string;
    path?: string;
    content?: Buffer | string;
    contentType?: string;
  }>;
}

// Email content interface for multi-language support
interface EmailContent {
  ar: {
    subject: string;
    html: string;
    text: string;
  };
  en: {
    subject: string;
    html: string;
    text: string;
  };
}

// Email service class
class EmailService {
  private transporter: Transporter;
  private config: EmailConfig;

  constructor() {
    this.config = {
      host: "mail.privateemail.com",
      port: 465,
      secure: true, // true for 465, false for other ports
      auth: {
        user: "platform@mesdrive.com",
        pass: "Rvm@89Axcvnb", // Use environment variable for password
      },
    };

    this.transporter = nodemailer.createTransport(this.config);
  }

  /**
   * Get email styling based on language (RTL for Arabic, LTR for English)
   * @param language - The language code ('ar' or 'en')
   * @returns CSS styling for the email
   */
  private getEmailStyling(language: Language): string {
    const isRTL = language === "ar";
    return `
      font-family: ${
        isRTL
          ? "'Tahoma', 'Arial Unicode MS', Arial, sans-serif"
          : "Arial, sans-serif"
      };
      direction: ${isRTL ? "rtl" : "ltr"};
      text-align: ${isRTL ? "right" : "left"};
    `;
  }

  /**
   * Get common translations
   * @param language - The language code ('ar' or 'en')
   */
  private getCommonTranslations(language: Language) {
    const translations = {
      ar: {
        companyName: "نظام التذاكر",
        bestRegards: "مع أطيب التحيات،",
        teamName: "فريق نظام التذاكر",
        doNotReply:
          "هذا بريد إلكتروني تلقائي من نظام التذاكر.<br>الرجاء عدم الرد على هذا البريد الإلكتروني.",
        allRightsReserved: "جميع الحقوق محفوظة لنظام التذاكر.",
      },
      en: {
        companyName: "Ticketing System",
        bestRegards: "Best regards,",
        teamName: "Ticketing System Team",
        doNotReply:
          "This is an automated message from Ticketing System.<br>Please do not reply to this email.",
        allRightsReserved: "Ticketing System. All rights reserved. 2025",
      },
    };
    return translations[language];
  }

  /**
   * Verify the email configuration
   * @returns Promise<boolean> - Returns true if connection is successful
   */
  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      console.log("Email server connection verified successfully");
      return true;
    } catch (error) {
      console.error("Email server connection failed:", error);
      return false;
    }
  }

  /**
   * Send an email
   * @param options - Email options including recipient, subject, and content
   * @returns Promise with email result
   */
  async sendEmail(
    options: EmailOptions
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      // Validate required fields
      if (!options.to || !options.subject || (!options.text && !options.html)) {
        throw new Error(
          "Missing required email fields: to, subject, and content (text or html)"
        );
      }

      // Check if password is configured
      if (!this.config.auth.pass) {
        throw new Error(
          "Email password not configured. Please set NEXT_PUBLIC_EMAIL_PASSWORD environment variable."
        );
      }

      const mailOptions = {
        from: `"Car  Portal" <${this.config.auth.user}>`, // sender address
        to: Array.isArray(options.to) ? options.to.join(", ") : options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
        attachments: options.attachments,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log("Email sent successfully:", info.messageId);

      return {
        success: true,
        messageId: info.messageId,
      };
    } catch (error) {
      console.error("Failed to send email:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  /**
   * Send a welcome email to new users
   * @param to - Recipient email address
   * @param userName - User's name
   * @param password - User's initial password
   * @param language - Language preference ('ar' for Arabic, 'en' for English)
   */
  async sendWelcomeEmail(
    to: string,
    userName: string,
    password: string,
    language: Language = "en"
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const common = this.getCommonTranslations(language);
    const styling = this.getEmailStyling(language);

    const content: EmailContent = {
      ar: {
        subject: `أهلاً بك في ${common.companyName}`,
        html: `
           <div style="${styling} max-width: 600px; margin: 0 auto; padding: 20px;">
             <h2 style="color: #fb923c; text-align: center;">أهلاً بك في ${
               common.companyName
             }</h2>
             <p>عزيزي ${userName}،</p>
             <p>أهلاً بك في نظام التذاكر! نحن متحمسون لوجودك كجزء من مجتمعنا.</p>
             
             <!-- Login Credentials Section -->
             <div style="background-color: #fef7f0; border: 2px solid #fb923c; border-radius: 8px; padding: 20px; margin: 20px 0;">
               <h3 style="color: #fb923c; margin: 0 0 15px 0; text-align: center;">بيانات تسجيل الدخول الخاصة بك</h3>
               <div style="background-color: #ffffff; padding: 15px; border-radius: 6px;">
                 <p style="margin: 8px 0;"><strong>البريد الإلكتروني:</strong> <span style="color: #1f2937; font-family: monospace;">${to}</span></p>
                 <p style="margin: 8px 0;"><strong>كلمة المرور:</strong> <span style="color: #dc2626; font-weight: bold; font-family: monospace; background-color: #fef2f2; padding: 4px 8px; border-radius: 4px;">${password}</span></p>
               </div>
               <p style="color: #dc2626; font-size: 14px; margin: 15px 0 5px 0; font-weight: 600;">
                 🔒 مهم: يرجى تغيير كلمة المرور بعد تسجيل الدخول الأول
               </p>
             </div>

             
             <p>إذا كان لديك أي أسئلة، لا تتردد في الاتصال بفريق الدعم لدينا.</p>
             <p>${common.bestRegards}<br><strong>${common.teamName}</strong></p>
             <hr style="border: none; border-top: 1px solid #D1CDCD; margin: 20px 0;">
             <p style="font-size: 12px; color: #D1CDCD; text-align: center;">
               ${common.doNotReply}
             </p>
             <p style="font-size: 12px; color: #D1CDCD; text-align: center;">
               © ${new Date().getFullYear()} ${common.allRightsReserved}
             </p>
           </div>
         `,
        text: `أهلاً بك في نظام التذاكر!\n\nعزيزي ${userName}،\n\nأهلاً بك في نظام التذاكر! نحن متحمسون لوجودك كجزء من مجتمعنا.\n\nبيانات تسجيل الدخول الخاصة بك:\nالبريد الإلكتروني: ${to}\nكلمة المرور: ${password}\n\n⚠️ مهم: يرجى تغيير كلمة المرور بعد تسجيل الدخول الأول\n\n${common.bestRegards}\n${common.teamName}`,
      },
      en: {
        subject: `Welcome to ${common.companyName}`,
        html: `
           <div style="${styling} max-width: 600px; margin: 0 auto; padding: 20px;">
             <h2 style="color: #fb923c; text-align: center;">Welcome to ${
               common.companyName
             }</h2>
             <p>Dear ${userName},</p>
             <p>Welcome to Ticketing System! We're excited to have you as part of our community.</p>
             
             <!-- Login Credentials Section -->
             <div style="background-color: #fef7f0; border: 2px solid #fb923c; border-radius: 8px; padding: 20px; margin: 20px 0;">
               <h3 style="color: #fb923c; margin: 0 0 15px 0; text-align: center;">Your Login Credentials</h3>
               <div style="background-color: #ffffff; padding: 15px; border-radius: 6px;">
                 <p style="margin: 8px 0;"><strong>Email:</strong> <span style="color: #1f2937; font-family: monospace;">${to}</span></p>
                 <p style="margin: 8px 0;"><strong>Password:</strong> <span style="color: #dc2626; font-weight: bold; font-family: monospace; background-color: #fef2f2; padding: 4px 8px; border-radius: 4px;">${password}</span></p>
               </div>
               <p style="color: #dc2626; font-size: 14px; margin: 15px 0 5px 0; font-weight: 600;">
                 🔒 Important: Please change your password after your first login
               </p>
             </div>

            
             <p>If you have any questions, feel free to contact our support team.</p>
             <p>${common.bestRegards}<br><strong>${common.teamName}</strong></p>
             <hr style="border: none; border-top: 1px solid #D1CDCD; margin: 20px 0;">
             <p style="font-size: 12px; color: #D1CDCD; text-align: center;">
               ${common.doNotReply}
             </p>
             <p style="font-size: 12px; color: #D1CDCD; text-align: center;">
               © ${new Date().getFullYear()} ${common.allRightsReserved}
             </p>
           </div>
         `,
        text: `Welcome to Ticketing System!\n\nDear ${userName},\n\nWelcome to Ticketing System! We're excited to have you as part of our community.\n\nYour Login Credentials:\nEmail: ${to}\nPassword: ${password}\n\n⚠️ Important: Please change your password after your first login\n\n${common.bestRegards}\n${common.teamName}`,
      },
    };

    const emailOptions: EmailOptions = {
      to,
      subject: content[language].subject,
      html: content[language].html,
      text: content[language].text,
    };

    return this.sendEmail(emailOptions);
  }

  /**
   * Send a notification email
   * @param to - Recipient email address
   * @param subject - Email subject
   * @param message - Email message
   * @param language - Language preference ('ar' for Arabic, 'en' for English)
   */
  async sendNotificationEmail(
    to: string,
    subject: string,
    message: string,
    language: Language = "en"
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const common = this.getCommonTranslations(language);
    const styling = this.getEmailStyling(language);

    const content: EmailContent = {
      ar: {
        subject: subject,
        html: `
          <div style="${styling} max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #fb923c; text-align: center;">إشعار من ${
              common.companyName
            }</h2>
            <div style="background-color: #fef7f0; border: 1px solid #fb923c; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p>${message.replace(/\n/g, "<br>")}</p>
            </div>
            <p>${common.bestRegards}<br><strong>${common.teamName}</strong></p>
            <hr style="border: none; border-top: 1px solid #D1CDCD; margin: 20px 0;">
            <p style="font-size: 12px; color: #D1CDCD; text-align: center;">
              ${common.doNotReply}
            </p>
            <p style="font-size: 12px; color: #D1CDCD; text-align: center;">
              © ${new Date().getFullYear()} ${common.allRightsReserved}
            </p>
          </div>
        `,
        text: `إشعار من ${common.companyName}\n\n${message}\n\n${common.bestRegards}\n${common.teamName}`,
      },
      en: {
        subject: subject,
        html: `
          <div style="${styling} max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #fb923c; text-align: center;">${
              common.companyName
            } Notification</h2>
            <div style="background-color: #fef7f0; border: 1px solid #fb923c; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p>${message.replace(/\n/g, "<br>")}</p>
            </div>
            <p>${common.bestRegards}<br><strong>${common.teamName}</strong></p>
            <hr style="border: none; border-top: 1px solid #D1CDCD; margin: 20px 0;">
            <p style="font-size: 12px; color: #D1CDCD; text-align: center;">
              ${common.doNotReply}
            </p>
            <p style="font-size: 12px; color: #D1CDCD; text-align: center;">
              © ${new Date().getFullYear()} ${common.allRightsReserved}
            </p>
          </div>
        `,
        text: `${common.companyName} Notification\n\n${message}\n\n${common.bestRegards}\n${common.teamName}`,
      },
    };

    const emailOptions: EmailOptions = {
      to,
      subject: content[language].subject,
      html: content[language].html,
      text: content[language].text,
    };

    return this.sendEmail(emailOptions);
  }

  /**
   * Send a password reset email
   * @param to - Recipient email address
   * @param resetToken - Password reset token
   * @param resetUrl - Password reset URL
   * @param language - Language preference ('ar' for Arabic, 'en' for English)
   */
  async sendPasswordResetEmail(
    to: string,
    resetToken: string,
    resetUrl: string,
    language: Language = "en"
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const common = this.getCommonTranslations(language);
    const styling = this.getEmailStyling(language);

    const content: EmailContent = {
      ar: {
        subject: `طلب إعادة تعيين كلمة المرور - ${common.companyName}`,
        html: `
          <div style="${styling} max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #fb923c; text-align: center;">طلب إعادة تعيين كلمة المرور</h2>
            <p>لقد طلبت إعادة تعيين كلمة المرور الخاصة بك في ${
              common.companyName
            }.</p>
            <p>انقر على الزر أدناه لإعادة تعيين كلمة المرور:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background-color: #fb923c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">إعادة تعيين كلمة المرور</a>
            </div>
            <p>إذا لم تتمكن من النقر على الزر، انسخ والصق هذا الرابط في متصفحك:</p>
            <p style="word-break: break-all; background-color: #fef7f0; border: 1px solid #D1CDCD; padding: 10px; border-radius: 4px; direction: ltr;">${resetUrl}</p>
            <p><strong>سينتهي صلاحية هذا الرابط خلال ساعة واحدة لأسباب أمنية.</strong></p>
            <p>إذا لم تطلب إعادة تعيين كلمة المرور هذه، يرجى تجاهل هذا البريد الإلكتروني.</p>
            <p>${common.bestRegards}<br><strong>${common.teamName}</strong></p>
            <hr style="border: none; border-top: 1px solid #D1CDCD; margin: 20px 0;">
            <p style="font-size: 12px; color: #D1CDCD; text-align: center;">
              ${common.doNotReply}
            </p>
            <p style="font-size: 12px; color: #D1CDCD; text-align: center;">
              © ${new Date().getFullYear()} ${common.allRightsReserved}
            </p>
          </div>
        `,
        text: `طلب إعادة تعيين كلمة المرور\n\nلقد طلبت إعادة تعيين كلمة المرور الخاصة بك في ${common.companyName}.\n\nانقر على هذا الرابط لإعادة تعيين كلمة المرور: ${resetUrl}\n\nسينتهي صلاحية هذا الرابط خلال ساعة واحدة لأسباب أمنية.\n\nإذا لم تطلب إعادة تعيين كلمة المرور هذه، يرجى تجاهل هذا البريد الإلكتروني.\n\n${common.bestRegards}\n${common.teamName}`,
      },
      en: {
        subject: `Password Reset Request - ${common.companyName}`,
        html: `
          <div style="${styling} max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #fb923c; text-align: center;">Password Reset Request</h2>
            <p>You have requested to reset your password for ${
              common.companyName
            }.</p>
            <p>Click the button below to reset your password:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background-color: #fb923c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Reset Password</a>
            </div>
            <p>If you can't click the button, copy and paste this link in your browser:</p>
            <p style="word-break: break-all; background-color: #fef7f0; border: 1px solid #D1CDCD; padding: 10px; border-radius: 4px;">${resetUrl}</p>
            <p><strong>This link will expire in 1 hour for security reasons.</strong></p>
            <p>If you didn't request this password reset, please ignore this email.</p>
            <p>${common.bestRegards}<br><strong>${common.teamName}</strong></p>
            <hr style="border: none; border-top: 1px solid #D1CDCD; margin: 20px 0;">
            <p style="font-size: 12px; color: #D1CDCD; text-align: center;">
              ${common.doNotReply}
            </p>
            <p style="font-size: 12px; color: #D1CDCD; text-align: center;">
              © ${new Date().getFullYear()} ${common.allRightsReserved}
            </p>
          </div>
        `,
        text: `Password Reset Request\n\nYou have requested to reset your password for ${common.companyName}.\n\nClick this link to reset your password: ${resetUrl}\n\nThis link will expire in 1 hour for security reasons.\n\nIf you didn't request this password reset, please ignore this email.\n\n${common.bestRegards}\n${common.teamName}`,
      },
    };

    const emailOptions: EmailOptions = {
      to,
      subject: content[language].subject,
      html: content[language].html,
      text: content[language].text,
    };

    return this.sendEmail(emailOptions);
  }

  /**
   * Send an OTP (One-Time Password) email
   * @param to - Recipient email address
   * @param otpCode - The OTP code to send
   * @param purpose - The purpose of the OTP (e.g., "login", "verification", "registration")
   * @param expiryMinutes - OTP expiry time in minutes (default: 10)
   * @param language - Language preference ('ar' for Arabic, 'en' for English)
   */
  async sendOTPEmail(
    to: string,
    otpCode: string,
    purpose: string = "verification",
    expiryMinutes: number = 10,
    language: Language = "en"
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const common = this.getCommonTranslations(language);
    const styling = this.getEmailStyling(language);

    // Purpose translations
    const purposeTranslations = {
      ar: {
        verification: "التحقق",
        login: "تسجيل الدخول",
        registration: "التسجيل",
        "password reset": "إعادة تعيين كلمة المرور",
      },
      en: {
        verification: "verification",
        login: "login",
        registration: "registration",
        "password reset": "password reset",
      },
    };

    const translatedPurpose =
      purposeTranslations[language][
        purpose as keyof (typeof purposeTranslations)[Language]
      ] || purpose;

    const content: EmailContent = {
      ar: {
        subject: `رمز التحقق الخاص بك - ${common.companyName}`,
        html: `
          <div style="${styling} max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
            <!-- Header -->
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #fb923c; margin: 0; font-size: 28px;">${
                common.companyName
              }</h1>
              <p style="color: #D1CDCD; margin: 5px 0 0 0; font-size: 14px;">رمز ${translatedPurpose} الآمن</p>
            </div>

            <!-- Main Content -->
            <div style="background-color: #fef7f0; padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 20px;">
              <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">رمز التحقق الخاص بك</h2>
              <p style="color: #4b5563; margin: 0 0 30px 0; font-size: 16px;">استخدم هذا الرمز لإكمال ${translatedPurpose}:</p>
              
              <!-- OTP Code Box -->
              <div style="background-color: #ffffff; border: 2px solid #fb923c; border-radius: 8px; padding: 25px; margin: 20px auto; display: inline-block; min-width: 200px;">
                <div style="font-size: 36px; font-weight: bold; color: #fb923c; letter-spacing: 8px; font-family: 'Courier New', monospace; direction: ltr;">${otpCode}</div>
              </div>
              
              <p style="color: #ef4444; font-weight: 600; margin: 20px 0 0 0; font-size: 14px;">
                ⏰ ينتهي صلاحية هذا الرمز خلال ${expiryMinutes} دقيقة
              </p>
            </div>

            <!-- Security Notice -->
            <div style="background-color: #fef7f0; border: 1px solid #fb923c; border-radius: 8px; padding: 15px; margin: 20px 0;">
              <h3 style="color: #fb923c; margin: 0 0 10px 0; font-size: 16px;">
                🔒 تنبيه أمني
              </h3>
              <ul style="color: #1f2937; margin: 0; padding-right: 20px; font-size: 14px; list-style-type: disc;">
                <li>لا تشارك هذا الرمز مع أي شخص</li>
                <li>${
                  common.companyName
                } لن يطلب منك رمز التحقق عبر الهاتف أو البريد الإلكتروني</li>
                <li>إذا لم تطلب هذا الرمز، يرجى تجاهل هذا البريد الإلكتروني</li>
              </ul>
            </div>

            <!-- Instructions -->
            <div style="margin: 20px 0;">
              <p style="color: #4b5563; margin: 0; font-size: 14px; line-height: 1.5;">
                إذا كنت تواجه مشكلة، يمكنك طلب رمز جديد أو الاتصال بفريق الدعم للحصول على المساعدة.
              </p>
            </div>

            <!-- Footer -->
            <div style="margin-top: 40px;">
              <p style="color: #4b5563; margin: 0; font-size: 16px;">${
                common.bestRegards
              }<br><strong>${common.teamName}</strong></p>
            </div>
            
            <hr style="border: none; border-top: 1px solid #D1CDCD; margin: 30px 0;">
            
            <!-- Email Footer -->
            <div style="text-align: center;">
              <p style="font-size: 12px; color: #D1CDCD; margin: 0;">
                ${common.doNotReply}
              </p>
              <p style="font-size: 12px; color: #D1CDCD; margin: 10px 0 0 0;">
                © ${new Date().getFullYear()} ${common.allRightsReserved}
              </p>
            </div>
          </div>
        `,
        text: `${
          common.companyName
        } - رمز التحقق الخاص بك\n\nرمز ${translatedPurpose}: ${otpCode}\n\nينتهي صلاحية هذا الرمز خلال ${expiryMinutes} دقيقة.\n\nتنبيه أمني:\n- لا تشارك هذا الرمز مع أي شخص\n- ${
          common.companyName
        } لن يطلب منك رمز التحقق عبر الهاتف أو البريد الإلكتروني\n- إذا لم تطلب هذا الرمز، يرجى تجاهل هذا البريد الإلكتروني\n\n${
          common.bestRegards
        }\n${common.teamName}\n\n© ${new Date().getFullYear()} ${
          common.allRightsReserved
        }`,
      },
      en: {
        subject: `Your OTP Code - ${common.companyName}`,
        html: `
          <div style="${styling} max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
            <!-- Header -->
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #fb923c; margin: 0; font-size: 28px;">${
                common.companyName
              }</h1>
              <p style="color: #D1CDCD; margin: 5px 0 0 0; font-size: 14px;">Secure ${translatedPurpose} code</p>
            </div>

            <!-- Main Content -->
            <div style="background-color: #fef7f0; padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 20px;">
              <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">Your Verification Code</h2>
              <p style="color: #4b5563; margin: 0 0 30px 0; font-size: 16px;">Use this code to complete your ${translatedPurpose}:</p>
              
              <!-- OTP Code Box -->
              <div style="background-color: #ffffff; border: 2px solid #fb923c; border-radius: 8px; padding: 25px; margin: 20px auto; display: inline-block; min-width: 200px;">
                <div style="font-size: 36px; font-weight: bold; color: #fb923c; letter-spacing: 8px; font-family: 'Courier New', monospace;">${otpCode}</div>
              </div>
              
              <p style="color: #ef4444; font-weight: 600; margin: 20px 0 0 0; font-size: 14px;">
                ⏰ This code expires in ${expiryMinutes} minutes
              </p>
            </div>

            <!-- Security Notice -->
            <div style="background-color: #fef7f0; border: 1px solid #fb923c; border-radius: 8px; padding: 15px; margin: 20px 0;">
              <h3 style="color: #fb923c; margin: 0 0 10px 0; font-size: 16px;">
                🔒 Security Notice
              </h3>
              <ul style="color: #1f2937; margin: 0; padding-left: 20px; font-size: 14px;">
                <li>Never share this code with anyone</li>
                <li>${
                  common.companyName
                } will never ask for your OTP over phone or email</li>
                <li>If you didn't request this code, please ignore this email</li>
              </ul>
            </div>

            <!-- Instructions -->
            <div style="margin: 20px 0;">
              <p style="color: #4b5563; margin: 0; font-size: 14px; line-height: 1.5;">
                If you're having trouble, you can request a new code or contact our support team for assistance.
              </p>
            </div>

            <!-- Footer -->
            <div style="margin-top: 40px;">
              <p style="color: #4b5563; margin: 0; font-size: 16px;">${
                common.bestRegards
              }<br><strong>${common.teamName}</strong></p>
            </div>
            
            <hr style="border: none; border-top: 1px solid #D1CDCD; margin: 30px 0;">
            
            <!-- Email Footer -->
            <div style="text-align: center;">
              <p style="font-size: 12px; color: #D1CDCD; margin: 0;">
                ${common.doNotReply}
              </p>
              <p style="font-size: 12px; color: #D1CDCD; margin: 10px 0 0 0;">
                © ${new Date().getFullYear()} ${common.allRightsReserved}
              </p>
            </div>
          </div>
        `,
        text: `${
          common.companyName
        } - Your Verification Code\n\nYour ${translatedPurpose} code: ${otpCode}\n\nThis code expires in ${expiryMinutes} minutes.\n\nSecurity Notice:\n- Never share this code with anyone\n- ${
          common.companyName
        } will never ask for your OTP over phone or email\n- If you didn't request this code, please ignore this email\n\n${
          common.bestRegards
        }\n${common.teamName}\n\n© ${new Date().getFullYear()} ${
          common.allRightsReserved
        }`,
      },
    };

    const emailOptions: EmailOptions = {
      to,
      subject: content[language].subject,
      html: content[language].html,
      text: content[language].text,
    };

    return this.sendEmail(emailOptions);
  }

  /**
   * Send a reservation notification email
   * @param to - Recipient email address
   * @param reservationDetails - Reservation information
   * @param language - Language preference ('ar' for Arabic, 'en' for English)
   */
  async sendReservationNotification(
    to: string,
    reservationDetails: {
      reservationId: string;
      vehicleMake: string;
      vehicleModel: string;
      vehicleYear: number;
      startDate: string;
      endDate: string;
      customerName: string;
      totalAmount?: string;
    },
    language: Language = "en"
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const common = this.getCommonTranslations(language);
    const styling = this.getEmailStyling(language);

    const content: EmailContent = {
      ar: {
        subject: `تأكيد الحجز - ${reservationDetails.reservationId}`,
        html: `
          <div style="${styling} max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #fb923c; text-align: center;">تأكيد حجز السيارة</h2>
            
            <div style="background-color: #fef7f0; border: 1px solid #fb923c; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #fb923c; margin-top: 0;">تفاصيل الحجز</h3>
              <p><strong>رقم الحجز:</strong> ${
                reservationDetails.reservationId
              }</p>
              <p><strong>اسم العميل:</strong> ${
                reservationDetails.customerName
              }</p>
              <hr style="border: none; border-top: 1px solid #D1CDCD; margin: 15px 0;">
              <h4 style="color: #1f2937;">معلومات السيارة</h4>
              <p><strong>السيارة:</strong> ${reservationDetails.vehicleMake} ${
          reservationDetails.vehicleModel
        } ${reservationDetails.vehicleYear}</p>
              <hr style="border: none; border-top: 1px solid #D1CDCD; margin: 15px 0;">
              <h4 style="color: #1f2937;">فترة الاستئجار</h4>
              <p><strong>تاريخ البداية:</strong> ${
                reservationDetails.startDate
              }</p>
              <p><strong>تاريخ النهاية:</strong> ${
                reservationDetails.endDate
              }</p>
              ${
                reservationDetails.totalAmount
                  ? `<hr style="border: none; border-top: 1px solid #D1CDCD; margin: 15px 0;">
              <p style="font-size: 18px;"><strong>المبلغ الإجمالي:</strong> <span style="color: #fb923c;">${reservationDetails.totalAmount} ريال</span></p>`
                  : ""
              }
            </div>
            
            <p>شكراً لاختياركم خدماتنا. سنتواصل معكم قريباً لتأكيد التفاصيل.</p>
            <p>${common.bestRegards}<br><strong>${common.teamName}</strong></p>
            <hr style="border: none; border-top: 1px solid #D1CDCD; margin: 20px 0;">
            <p style="font-size: 12px; color: #D1CDCD; text-align: center;">
              ${common.doNotReply}
            </p>
            <p style="font-size: 12px; color: #D1CDCD; text-align: center;">
              © ${new Date().getFullYear()} ${common.allRightsReserved}
            </p>
          </div>
        `,
        text: `تأكيد حجز السيارة\n\nرقم الحجز: ${
          reservationDetails.reservationId
        }\nاسم العميل: ${
          reservationDetails.customerName
        }\n\nمعلومات السيارة:\n${reservationDetails.vehicleMake} ${
          reservationDetails.vehicleModel
        } ${
          reservationDetails.vehicleYear
        }\n\nفترة الاستئجار:\nتاريخ البداية: ${
          reservationDetails.startDate
        }\nتاريخ النهاية: ${reservationDetails.endDate}\n${
          reservationDetails.totalAmount
            ? `\nالمبلغ الإجمالي: ${reservationDetails.totalAmount} ريال`
            : ""
        }\n\n${common.bestRegards}\n${common.teamName}`,
      },
      en: {
        subject: `Reservation Confirmation - ${reservationDetails.reservationId}`,
        html: `
          <div style="${styling} max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #fb923c; text-align: center;">Car Reservation Confirmation</h2>
            
            <div style="background-color: #fef7f0; border: 1px solid #fb923c; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #fb923c; margin-top: 0;">Reservation Details</h3>
              <p><strong>Reservation ID:</strong> ${
                reservationDetails.reservationId
              }</p>
              <p><strong>Customer Name:</strong> ${
                reservationDetails.customerName
              }</p>
              <hr style="border: none; border-top: 1px solid #D1CDCD; margin: 15px 0;">
              <h4 style="color: #1f2937;">Vehicle Information</h4>
              <p><strong>Vehicle:</strong> ${reservationDetails.vehicleMake} ${
          reservationDetails.vehicleModel
        } ${reservationDetails.vehicleYear}</p>
              <hr style="border: none; border-top: 1px solid #D1CDCD; margin: 15px 0;">
              <h4 style="color: #1f2937;">Rental Period</h4>
              <p><strong>Start Date:</strong> ${
                reservationDetails.startDate
              }</p>
              <p><strong>End Date:</strong> ${reservationDetails.endDate}</p>
              ${
                reservationDetails.totalAmount
                  ? `<hr style="border: none; border-top: 1px solid #D1CDCD; margin: 15px 0;">
              <p style="font-size: 18px;"><strong>Total Amount:</strong> <span style="color: #fb923c;">${reservationDetails.totalAmount} SAR</span></p>`
                  : ""
              }
            </div>
            
            <p>Thank you for choosing our services. We will contact you soon to confirm the details.</p>
            <p>${common.bestRegards}<br><strong>${common.teamName}</strong></p>
            <hr style="border: none; border-top: 1px solid #D1CDCD; margin: 20px 0;">
            <p style="font-size: 12px; color: #D1CDCD; text-align: center;">
              ${common.doNotReply}
            </p>
            <p style="font-size: 12px; color: #D1CDCD; text-align: center;">
              © ${new Date().getFullYear()} ${common.allRightsReserved}
            </p>
          </div>
        `,
        text: `Car Reservation Confirmation\n\nReservation ID: ${
          reservationDetails.reservationId
        }\nCustomer Name: ${
          reservationDetails.customerName
        }\n\nVehicle Information:\n${reservationDetails.vehicleMake} ${
          reservationDetails.vehicleModel
        } ${reservationDetails.vehicleYear}\n\nRental Period:\nStart Date: ${
          reservationDetails.startDate
        }\nEnd Date: ${reservationDetails.endDate}\n${
          reservationDetails.totalAmount
            ? `\nTotal Amount: ${reservationDetails.totalAmount} SAR`
            : ""
        }\n\n${common.bestRegards}\n${common.teamName}`,
      },
    };

    const emailOptions: EmailOptions = {
      to,
      subject: content[language].subject,
      html: content[language].html,
      text: content[language].text,
    };

    return this.sendEmail(emailOptions);
  }

  /**
   * Send an agreement/contract notification email
   * @param to - Recipient email address
   * @param agreementDetails - Agreement information
   * @param language - Language preference ('ar' for Arabic, 'en' for English)
   */
  async sendAgreementNotification(
    to: string,
    agreementDetails: {
      contractNumber: string;
      vehicleMake: string;
      vehicleModel: string;
      customerName: string;
      startDate: string;
      endDate: string;
      totalAmount: string;
      paidAmount?: string;
      status: string;
    },
    language: Language = "en"
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const common = this.getCommonTranslations(language);
    const styling = this.getEmailStyling(language);

    const statusTranslations = {
      ar: {
        draft: "مسودة",
        active: "نشط",
        extended: "ممدد",
        closed: "مغلق",
        suspended: "معلق",
      },
      en: {
        draft: "Draft",
        active: "Active",
        extended: "Extended",
        closed: "Closed",
        suspended: "Suspended",
      },
    };

    const translatedStatus =
      statusTranslations[language][
        agreementDetails.status as keyof (typeof statusTranslations)[Language]
      ] || agreementDetails.status;

    const content: EmailContent = {
      ar: {
        subject: `عقد إيجار السيارة - ${agreementDetails.contractNumber}`,
        html: `
          <div style="${styling} max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #fb923c; text-align: center;">تأكيد عقد إيجار السيارة</h2>
            
            <div style="background-color: #fef7f0; border: 2px solid #fb923c; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #fb923c; margin-top: 0;">تفاصيل العقد</h3>
              <p><strong>رقم العقد:</strong> <span style="font-family: monospace; color: #1f2937;">${
                agreementDetails.contractNumber
              }</span></p>
              <p><strong>اسم العميل:</strong> ${
                agreementDetails.customerName
              }</p>
              <p><strong>الحالة:</strong> <span style="background-color: #fbbf24; color: #000; padding: 2px 8px; border-radius: 4px;">${translatedStatus}</span></p>
              <hr style="border: none; border-top: 1px solid #D1CDCD; margin: 15px 0;">
              <h4 style="color: #1f2937;">معلومات السيارة</h4>
              <p><strong>السيارة:</strong> ${agreementDetails.vehicleMake} ${
          agreementDetails.vehicleModel
        }</p>
              <hr style="border: none; border-top: 1px solid #D1CDCD; margin: 15px 0;">
              <h4 style="color: #1f2937;">فترة العقد</h4>
              <p><strong>تاريخ البداية:</strong> ${
                agreementDetails.startDate
              }</p>
              <p><strong>تاريخ النهاية:</strong> ${agreementDetails.endDate}</p>
              <hr style="border: none; border-top: 1px solid #D1CDCD; margin: 15px 0;">
              <h4 style="color: #1f2937;">المبالغ المالية</h4>
              <p><strong>المبلغ الإجمالي:</strong> <span style="color: #fb923c; font-size: 20px; font-weight: bold;">${
                agreementDetails.totalAmount
              } ريال</span></p>
              ${
                agreementDetails.paidAmount
                  ? `<p><strong>المبلغ المدفوع:</strong> ${agreementDetails.paidAmount} ريال</p>`
                  : ""
              }
            </div>
            
            <p>تم إنشاء عقد الإيجار بنجاح. يرجى مراجعة التفاصيل والتواصل معنا في حال وجود أي استفسارات.</p>
            <p>${common.bestRegards}<br><strong>${common.teamName}</strong></p>
            <hr style="border: none; border-top: 1px solid #D1CDCD; margin: 20px 0;">
            <p style="font-size: 12px; color: #D1CDCD; text-align: center;">
              ${common.doNotReply}
            </p>
            <p style="font-size: 12px; color: #D1CDCD; text-align: center;">
              © ${new Date().getFullYear()} ${common.allRightsReserved}
            </p>
          </div>
        `,
        text: `عقد إيجار السيارة\n\nرقم العقد: ${
          agreementDetails.contractNumber
        }\nاسم العميل: ${
          agreementDetails.customerName
        }\nالحالة: ${translatedStatus}\n\nمعلومات السيارة:\n${
          agreementDetails.vehicleMake
        } ${agreementDetails.vehicleModel}\n\nفترة العقد:\nتاريخ البداية: ${
          agreementDetails.startDate
        }\nتاريخ النهاية: ${agreementDetails.endDate}\n\nالمبلغ الإجمالي: ${
          agreementDetails.totalAmount
        } ريال\n${
          agreementDetails.paidAmount
            ? `المبلغ المدفوع: ${agreementDetails.paidAmount} ريال`
            : ""
        }\n\n${common.bestRegards}\n${common.teamName}`,
      },
      en: {
        subject: `Car Rental Agreement - ${agreementDetails.contractNumber}`,
        html: `
          <div style="${styling} max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #fb923c; text-align: center;">Car Rental Agreement Confirmation</h2>
            
            <div style="background-color: #fef7f0; border: 2px solid #fb923c; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #fb923c; margin-top: 0;">Contract Details</h3>
              <p><strong>Contract Number:</strong> <span style="font-family: monospace; color: #1f2937;">${
                agreementDetails.contractNumber
              }</span></p>
              <p><strong>Customer Name:</strong> ${
                agreementDetails.customerName
              }</p>
              <p><strong>Status:</strong> <span style="background-color: #fbbf24; color: #000; padding: 2px 8px; border-radius: 4px;">${translatedStatus}</span></p>
              <hr style="border: none; border-top: 1px solid #D1CDCD; margin: 15px 0;">
              <h4 style="color: #1f2937;">Vehicle Information</h4>
              <p><strong>Vehicle:</strong> ${agreementDetails.vehicleMake} ${
          agreementDetails.vehicleModel
        }</p>
              <hr style="border: none; border-top: 1px solid #D1CDCD; margin: 15px 0;">
              <h4 style="color: #1f2937;">Contract Period</h4>
              <p><strong>Start Date:</strong> ${agreementDetails.startDate}</p>
              <p><strong>End Date:</strong> ${agreementDetails.endDate}</p>
              <hr style="border: none; border-top: 1px solid #D1CDCD; margin: 15px 0;">
              <h4 style="color: #1f2937;">Financial Details</h4>
              <p><strong>Total Amount:</strong> <span style="color: #fb923c; font-size: 20px; font-weight: bold;">${
                agreementDetails.totalAmount
              } SAR</span></p>
              ${
                agreementDetails.paidAmount
                  ? `<p><strong>Paid Amount:</strong> ${agreementDetails.paidAmount} SAR</p>`
                  : ""
              }
            </div>
            
            <p>Your rental agreement has been created successfully. Please review the details and contact us if you have any questions.</p>
            <p>${common.bestRegards}<br><strong>${common.teamName}</strong></p>
            <hr style="border: none; border-top: 1px solid #D1CDCD; margin: 20px 0;">
            <p style="font-size: 12px; color: #D1CDCD; text-align: center;">
              ${common.doNotReply}
            </p>
            <p style="font-size: 12px; color: #D1CDCD; text-align: center;">
              © ${new Date().getFullYear()} ${common.allRightsReserved}
            </p>
          </div>
        `,
        text: `Car Rental Agreement\n\nContract Number: ${
          agreementDetails.contractNumber
        }\nCustomer Name: ${
          agreementDetails.customerName
        }\nStatus: ${translatedStatus}\n\nVehicle Information:\n${
          agreementDetails.vehicleMake
        } ${agreementDetails.vehicleModel}\n\nContract Period:\nStart Date: ${
          agreementDetails.startDate
        }\nEnd Date: ${agreementDetails.endDate}\n\nTotal Amount: ${
          agreementDetails.totalAmount
        } SAR\n${
          agreementDetails.paidAmount
            ? `Paid Amount: ${agreementDetails.paidAmount} SAR`
            : ""
        }\n\n${common.bestRegards}\n${common.teamName}`,
      },
    };

    const emailOptions: EmailOptions = {
      to,
      subject: content[language].subject,
      html: content[language].html,
      text: content[language].text,
    };

    return this.sendEmail(emailOptions);
  }

  /**
   * Send a payment notification email
   * @param to - Recipient email address
   * @param paymentDetails - Payment information
   * @param language - Language preference ('ar' for Arabic, 'en' for English)
   */
  async sendPaymentNotification(
    to: string,
    paymentDetails: {
      paymentId: string;
      contractNumber: string;
      amount: string;
      paymentMethod: string;
      receivedAt: string;
      customerName: string;
      reference?: string;
    },
    language: Language = "en"
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const common = this.getCommonTranslations(language);
    const styling = this.getEmailStyling(language);

    const content: EmailContent = {
      ar: {
        subject: `إيصال دفع - ${paymentDetails.contractNumber}`,
        html: `
          <div style="${styling} max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #fb923c; text-align: center;">✓ تأكيد استلام الدفع</h2>
            
            <div style="background-color: #f0fdf4; border: 2px solid #10b981; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #10b981; margin-top: 0;">تفاصيل الدفع</h3>
              <p><strong>رقم الإيصال:</strong> <span style="font-family: monospace;">${
                paymentDetails.paymentId
              }</span></p>
              <p><strong>رقم العقد:</strong> ${
                paymentDetails.contractNumber
              }</p>
              <p><strong>اسم العميل:</strong> ${paymentDetails.customerName}</p>
              <hr style="border: none; border-top: 1px solid #D1CDCD; margin: 15px 0;">
              <h4 style="color: #1f2937;">معلومات المبلغ</h4>
              <p style="font-size: 24px; color: #10b981; font-weight: bold; margin: 10px 0;">
                ${paymentDetails.amount} ريال سعودي
              </p>
              <p><strong>طريقة الدفع:</strong> ${
                paymentDetails.paymentMethod
              }</p>
              <p><strong>تاريخ الاستلام:</strong> ${
                paymentDetails.receivedAt
              }</p>
              ${
                paymentDetails.reference
                  ? `<p><strong>المرجع:</strong> ${paymentDetails.reference}</p>`
                  : ""
              }
            </div>
            
            <p>تم استلام الدفع بنجاح. شكراً لثقتكم بخدماتنا.</p>
            <p>${common.bestRegards}<br><strong>${common.teamName}</strong></p>
            <hr style="border: none; border-top: 1px solid #D1CDCD; margin: 20px 0;">
            <p style="font-size: 12px; color: #D1CDCD; text-align: center;">
              ${common.doNotReply}
            </p>
            <p style="font-size: 12px; color: #D1CDCD; text-align: center;">
              © ${new Date().getFullYear()} ${common.allRightsReserved}
            </p>
          </div>
        `,
        text: `إيصال دفع\n\nرقم الإيصال: ${
          paymentDetails.paymentId
        }\nرقم العقد: ${paymentDetails.contractNumber}\nاسم العميل: ${
          paymentDetails.customerName
        }\n\nالمبلغ: ${paymentDetails.amount} ريال سعودي\nطريقة الدفع: ${
          paymentDetails.paymentMethod
        }\nتاريخ الاستلام: ${paymentDetails.receivedAt}\n${
          paymentDetails.reference ? `المرجع: ${paymentDetails.reference}` : ""
        }\n\nتم استلام الدفع بنجاح.\n\n${common.bestRegards}\n${
          common.teamName
        }`,
      },
      en: {
        subject: `Payment Receipt - ${paymentDetails.contractNumber}`,
        html: `
          <div style="${styling} max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #fb923c; text-align: center;">✓ Payment Confirmation</h2>
            
            <div style="background-color: #f0fdf4; border: 2px solid #10b981; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #10b981; margin-top: 0;">Payment Details</h3>
              <p><strong>Receipt Number:</strong> <span style="font-family: monospace;">${
                paymentDetails.paymentId
              }</span></p>
              <p><strong>Contract Number:</strong> ${
                paymentDetails.contractNumber
              }</p>
              <p><strong>Customer Name:</strong> ${
                paymentDetails.customerName
              }</p>
              <hr style="border: none; border-top: 1px solid #D1CDCD; margin: 15px 0;">
              <h4 style="color: #1f2937;">Amount Information</h4>
              <p style="font-size: 24px; color: #10b981; font-weight: bold; margin: 10px 0;">
                ${paymentDetails.amount} SAR
              </p>
              <p><strong>Payment Method:</strong> ${
                paymentDetails.paymentMethod
              }</p>
              <p><strong>Received At:</strong> ${paymentDetails.receivedAt}</p>
              ${
                paymentDetails.reference
                  ? `<p><strong>Reference:</strong> ${paymentDetails.reference}</p>`
                  : ""
              }
            </div>
            
            <p>Payment received successfully. Thank you for your business.</p>
            <p>${common.bestRegards}<br><strong>${common.teamName}</strong></p>
            <hr style="border: none; border-top: 1px solid #D1CDCD; margin: 20px 0;">
            <p style="font-size: 12px; color: #D1CDCD; text-align: center;">
              ${common.doNotReply}
            </p>
            <p style="font-size: 12px; color: #D1CDCD; text-align: center;">
              © ${new Date().getFullYear()} ${common.allRightsReserved}
            </p>
          </div>
        `,
        text: `Payment Receipt\n\nReceipt Number: ${
          paymentDetails.paymentId
        }\nContract Number: ${paymentDetails.contractNumber}\nCustomer Name: ${
          paymentDetails.customerName
        }\n\nAmount: ${paymentDetails.amount} SAR\nPayment Method: ${
          paymentDetails.paymentMethod
        }\nReceived At: ${paymentDetails.receivedAt}\n${
          paymentDetails.reference
            ? `Reference: ${paymentDetails.reference}`
            : ""
        }\n\nPayment received successfully.\n\n${common.bestRegards}\n${
          common.teamName
        }`,
      },
    };

    const emailOptions: EmailOptions = {
      to,
      subject: content[language].subject,
      html: content[language].html,
      text: content[language].text,
    };

    return this.sendEmail(emailOptions);
  }

  /**
   * Send a maintenance notification email
   * @param to - Recipient email address
   * @param maintenanceDetails - Maintenance information
   * @param language - Language preference ('ar' for Arabic, 'en' for English)
   */
  async sendMaintenanceNotification(
    to: string,
    maintenanceDetails: {
      maintenanceId: string;
      vehicleMake: string;
      vehicleModel: string;
      plateNumber: string;
      serviceType: string;
      scheduledDate: string;
      provider?: string;
      estimatedCost?: string;
      notes?: string;
    },
    language: Language = "en"
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const common = this.getCommonTranslations(language);
    const styling = this.getEmailStyling(language);

    const content: EmailContent = {
      ar: {
        subject: `جدولة صيانة السيارة - ${maintenanceDetails.plateNumber}`,
        html: `
          <div style="${styling} max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #fb923c; text-align: center;">🔧 تنبيه صيانة السيارة</h2>
            
            <div style="background-color: #fef7f0; border: 1px solid #fb923c; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #fb923c; margin-top: 0;">تفاصيل الصيانة</h3>
              <p><strong>رقم الصيانة:</strong> ${
                maintenanceDetails.maintenanceId
              }</p>
              <hr style="border: none; border-top: 1px solid #D1CDCD; margin: 15px 0;">
              <h4 style="color: #1f2937;">معلومات السيارة</h4>
              <p><strong>السيارة:</strong> ${maintenanceDetails.vehicleMake} ${
          maintenanceDetails.vehicleModel
        }</p>
              <p><strong>رقم اللوحة:</strong> <span style="font-family: monospace; background-color: #fbbf24; padding: 2px 8px; border-radius: 4px;">${
                maintenanceDetails.plateNumber
              }</span></p>
              <hr style="border: none; border-top: 1px solid #D1CDCD; margin: 15px 0;">
              <h4 style="color: #1f2937;">تفاصيل الخدمة</h4>
              <p><strong>نوع الخدمة:</strong> ${
                maintenanceDetails.serviceType
              }</p>
              <p><strong>التاريخ المحدد:</strong> <span style="color: #fb923c; font-weight: bold;">${
                maintenanceDetails.scheduledDate
              }</span></p>
              ${
                maintenanceDetails.provider
                  ? `<p><strong>مزود الخدمة:</strong> ${maintenanceDetails.provider}</p>`
                  : ""
              }
              ${
                maintenanceDetails.estimatedCost
                  ? `<p><strong>التكلفة المقدرة:</strong> ${maintenanceDetails.estimatedCost} ريال</p>`
                  : ""
              }
              ${
                maintenanceDetails.notes
                  ? `<hr style="border: none; border-top: 1px solid #D1CDCD; margin: 15px 0;">
              <h4 style="color: #1f2937;">ملاحظات</h4>
              <p>${maintenanceDetails.notes}</p>`
                  : ""
              }
            </div>
            
            <p>تم جدولة الصيانة بنجاح. يرجى التأكد من توفر السيارة في التاريخ المحدد.</p>
            <p>${common.bestRegards}<br><strong>${common.teamName}</strong></p>
            <hr style="border: none; border-top: 1px solid #D1CDCD; margin: 20px 0;">
            <p style="font-size: 12px; color: #D1CDCD; text-align: center;">
              ${common.doNotReply}
            </p>
            <p style="font-size: 12px; color: #D1CDCD; text-align: center;">
              © ${new Date().getFullYear()} ${common.allRightsReserved}
            </p>
          </div>
        `,
        text: `تنبيه صيانة السيارة\n\nرقم الصيانة: ${
          maintenanceDetails.maintenanceId
        }\n\nمعلومات السيارة:\nالسيارة: ${maintenanceDetails.vehicleMake} ${
          maintenanceDetails.vehicleModel
        }\nرقم اللوحة: ${
          maintenanceDetails.plateNumber
        }\n\nتفاصيل الخدمة:\nنوع الخدمة: ${
          maintenanceDetails.serviceType
        }\nالتاريخ المحدد: ${maintenanceDetails.scheduledDate}\n${
          maintenanceDetails.provider
            ? `مزود الخدمة: ${maintenanceDetails.provider}\n`
            : ""
        }${
          maintenanceDetails.estimatedCost
            ? `التكلفة المقدرة: ${maintenanceDetails.estimatedCost} ريال\n`
            : ""
        }${
          maintenanceDetails.notes
            ? `\nملاحظات:\n${maintenanceDetails.notes}\n`
            : ""
        }\n${common.bestRegards}\n${common.teamName}`,
      },
      en: {
        subject: `Vehicle Maintenance Scheduled - ${maintenanceDetails.plateNumber}`,
        html: `
          <div style="${styling} max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #fb923c; text-align: center;">🔧 Vehicle Maintenance Alert</h2>
            
            <div style="background-color: #fef7f0; border: 1px solid #fb923c; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #fb923c; margin-top: 0;">Maintenance Details</h3>
              <p><strong>Maintenance ID:</strong> ${
                maintenanceDetails.maintenanceId
              }</p>
              <hr style="border: none; border-top: 1px solid #D1CDCD; margin: 15px 0;">
              <h4 style="color: #1f2937;">Vehicle Information</h4>
              <p><strong>Vehicle:</strong> ${maintenanceDetails.vehicleMake} ${
          maintenanceDetails.vehicleModel
        }</p>
              <p><strong>Plate Number:</strong> <span style="font-family: monospace; background-color: #fbbf24; padding: 2px 8px; border-radius: 4px;">${
                maintenanceDetails.plateNumber
              }</span></p>
              <hr style="border: none; border-top: 1px solid #D1CDCD; margin: 15px 0;">
              <h4 style="color: #1f2937;">Service Details</h4>
              <p><strong>Service Type:</strong> ${
                maintenanceDetails.serviceType
              }</p>
              <p><strong>Scheduled Date:</strong> <span style="color: #fb923c; font-weight: bold;">${
                maintenanceDetails.scheduledDate
              }</span></p>
              ${
                maintenanceDetails.provider
                  ? `<p><strong>Service Provider:</strong> ${maintenanceDetails.provider}</p>`
                  : ""
              }
              ${
                maintenanceDetails.estimatedCost
                  ? `<p><strong>Estimated Cost:</strong> ${maintenanceDetails.estimatedCost} SAR</p>`
                  : ""
              }
              ${
                maintenanceDetails.notes
                  ? `<hr style="border: none; border-top: 1px solid #D1CDCD; margin: 15px 0;">
              <h4 style="color: #1f2937;">Notes</h4>
              <p>${maintenanceDetails.notes}</p>`
                  : ""
              }
            </div>
            
            <p>Maintenance has been scheduled successfully. Please ensure the vehicle is available on the scheduled date.</p>
            <p>${common.bestRegards}<br><strong>${common.teamName}</strong></p>
            <hr style="border: none; border-top: 1px solid #D1CDCD; margin: 20px 0;">
            <p style="font-size: 12px; color: #D1CDCD; text-align: center;">
              ${common.doNotReply}
            </p>
            <p style="font-size: 12px; color: #D1CDCD; text-align: center;">
              © ${new Date().getFullYear()} ${common.allRightsReserved}
            </p>
          </div>
        `,
        text: `Vehicle Maintenance Alert\n\nMaintenance ID: ${
          maintenanceDetails.maintenanceId
        }\n\nVehicle Information:\nVehicle: ${maintenanceDetails.vehicleMake} ${
          maintenanceDetails.vehicleModel
        }\nPlate Number: ${
          maintenanceDetails.plateNumber
        }\n\nService Details:\nService Type: ${
          maintenanceDetails.serviceType
        }\nScheduled Date: ${maintenanceDetails.scheduledDate}\n${
          maintenanceDetails.provider
            ? `Service Provider: ${maintenanceDetails.provider}\n`
            : ""
        }${
          maintenanceDetails.estimatedCost
            ? `Estimated Cost: ${maintenanceDetails.estimatedCost} SAR\n`
            : ""
        }${
          maintenanceDetails.notes
            ? `\nNotes:\n${maintenanceDetails.notes}\n`
            : ""
        }\n${common.bestRegards}\n${common.teamName}`,
      },
    };

    const emailOptions: EmailOptions = {
      to,
      subject: content[language].subject,
      html: content[language].html,
      text: content[language].text,
    };

    return this.sendEmail(emailOptions);
  }

  /**
   * Send user status change notification email
   * @param to - Recipient email address
   * @param userName - User's name
   * @param changeType - Type of change (activation, deactivation, otpEnabled, otpDisabled)
   * @param language - Language preference ('ar' for Arabic, 'en' for English)
   */
  async sendUserStatusChangeEmail(
    to: string,
    userName: string,
    changeType: "activation" | "deactivation" | "otpEnabled" | "otpDisabled",
    language: Language = "en"
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const common = this.getCommonTranslations(language);
    const styling = this.getEmailStyling(language);

    const content: EmailContent = {
      ar: {
        subject: this.getUserStatusChangeSubject(changeType, true),
        html: this.getUserStatusChangeHtml(
          userName,
          changeType,
          common,
          styling,
          true
        ),
        text: this.getUserStatusChangeText(userName, changeType, common, true),
      },
      en: {
        subject: this.getUserStatusChangeSubject(changeType, false),
        html: this.getUserStatusChangeHtml(
          userName,
          changeType,
          common,
          styling,
          false
        ),
        text: this.getUserStatusChangeText(userName, changeType, common, false),
      },
    };

    const emailOptions: EmailOptions = {
      to,
      subject: content[language].subject,
      html: content[language].html,
      text: content[language].text,
    };

    return this.sendEmail(emailOptions);
  }

  /**
   * Get subject for user status change email
   */
  private getUserStatusChangeSubject(
    changeType: "activation" | "deactivation" | "otpEnabled" | "otpDisabled",
    isArabic: boolean
  ): string {
    const subjects = {
      ar: {
        activation: "تم تفعيل حسابك في نظام التذاكر",
        deactivation: "تم إلغاء تفعيل حسابك في نظام التذاكر",
        otpEnabled: "تم تفعيل المصادقة الثنائية لحسابك",
        otpDisabled: "تم تعطيل المصادقة الثنائية لحسابك",
      },
      en: {
        activation: "Your Ticketing System account has been activated",
        deactivation: "Your Ticketing System account has been deactivated",
        otpEnabled: "Two-factor authentication enabled for your account",
        otpDisabled: "Two-factor authentication disabled for your account",
      },
    };

    return subjects[isArabic ? "ar" : "en"][changeType];
  }

  /**
   * Get HTML content for user status change email
   */
  private getUserStatusChangeHtml(
    userName: string,
    changeType: "activation" | "deactivation" | "otpEnabled" | "otpDisabled",
    common: {
      companyName: string;
      bestRegards: string;
      teamName: string;
      doNotReply: string;
      allRightsReserved: string;
    },
    styling: string,
    isArabic: boolean
  ): string {
    const messages = {
      ar: {
        activation: {
          title: "تم تفعيل حسابك",
          message:
            "تم تفعيل حسابك في نظام التذاكر بنجاح. يمكنك الآن تسجيل الدخول والوصول إلى جميع الميزات المتاحة.",
          action: "تسجيل الدخول الآن",
        },
        deactivation: {
          title: "تم إلغاء تفعيل حسابك",
          message:
            "تم إلغاء تفعيل حسابك في نظام التذاكر. لن تتمكن من تسجيل الدخول حتى يتم إعادة تفعيل الحساب.",
          action: "اتصل بالدعم",
        },
        otpEnabled: {
          title: "تم تفعيل المصادقة الثنائية",
          message:
            "تم تفعيل المصادقة الثنائية لحسابك. ستحتاج إلى إدخال رمز التحقق المرسل إلى بريدك الإلكتروني في كل مرة تسجل فيها الدخول.",
          action: "تسجيل الدخول الآن",
        },
        otpDisabled: {
          title: "تم تعطيل المصادقة الثنائية",
          message:
            "تم تعطيل المصادقة الثنائية لحسابك. لن تحتاج إلى إدخال رمز تحقق إضافي عند تسجيل الدخول.",
          action: "تسجيل الدخول الآن",
        },
      },
      en: {
        activation: {
          title: "Account Activated",
          message:
            "Your Ticketing System account has been successfully activated. You can now log in and access all available features.",
          action: "Log In Now",
        },
        deactivation: {
          title: "Account Deactivated",
          message:
            "Your Ticketing System account has been deactivated. You will not be able to log in until the account is reactivated.",
          action: "Contact Support",
        },
        otpEnabled: {
          title: "Two-Factor Authentication Enabled",
          message:
            "Two-factor authentication has been enabled for your account. You will need to enter a verification code sent to your email each time you log in.",
          action: "Log In Now",
        },
        otpDisabled: {
          title: "Two-Factor Authentication Disabled",
          message:
            "Two-factor authentication has been disabled for your account. You will no longer need to enter an additional verification code when logging in.",
          action: "Log In Now",
        },
      },
    };

    const message = messages[isArabic ? "ar" : "en"][changeType];

    // Enhanced styling based on change type
    const statusIcon =
      changeType === "activation"
        ? "🎉"
        : changeType === "deactivation"
        ? "🔒"
        : changeType === "otpEnabled"
        ? "🔐"
        : "🔓";

    const statusColor =
      changeType === "activation"
        ? "#10b981"
        : changeType === "deactivation"
        ? "#ef4444"
        : changeType === "otpEnabled"
        ? "#3b82f6"
        : "#f59e0b";

    return `
      <!DOCTYPE html>
      <html dir="${isArabic ? "rtl" : "ltr"}" lang="${isArabic ? "ar" : "en"}">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${message.title}</title>
        <style>
          body { margin: 0; padding: 20px; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1); }
          .header { background: linear-gradient(135deg, ${statusColor} 0%, ${statusColor}dd 100%); padding: 40px 20px; text-align: center; }
          .content { padding: 40px 30px; }
          .status-card { background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); border: 2px solid ${statusColor}20; border-radius: 12px; padding: 30px; margin: 30px 0; text-align: center; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
          .action-button { display: inline-block; background: ${statusColor}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); transition: all 0.2s ease; }
          .action-button:hover { transform: translateY(-1px); box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15); }
          .footer { background-color: #f1f5f9; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0; }
          .icon-large { font-size: 48px; margin-bottom: 20px; }
          .title { color: white; font-size: 28px; font-weight: 700; margin: 0; }
          .subtitle { color: white; font-size: 16px; margin: 10px 0 0 0; opacity: 0.9; }
          .message { font-size: 16px; line-height: 1.6; color: #374151; margin: 20px 0; }
          .action-title { font-size: 18px; font-weight: 600; color: #1f2937; margin: 0 0 15px 0; }
          .action-text { font-size: 14px; color: #6b7280; margin: 0; }
          .support-text { font-size: 14px; color: #6b7280; margin: 30px 0 20px 0; }
          .signature { font-size: 14px; color: #374151; margin: 20px 0; }
          .disclaimer { font-size: 11px; color: #9ca3af; margin: 10px 0; }
          .copyright { font-size: 11px; color: #9ca3af; margin: 5px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <!-- Header -->
          <div class="header">
            <div class="icon-large">${statusIcon}</div>
            <h1 class="title">${message.title}</h1>
            <p class="subtitle">${isArabic ? "نظام التذاكر" : "Ticketing System"}</p>
          </div>
          
          <!-- Content -->
          <div class="content">
            <p style="font-size: 16px; color: #374151; margin: 0 0 20px 0;">
              <strong>${isArabic ? "عزيزي" : "Dear"} ${userName},</strong>
            </p>
            
            <p class="message">${message.message}</p>
            
            <!-- Status Card -->
            <div class="status-card">
              <h3 class="action-title">${
                isArabic ? "ما التالي؟" : "What's Next?"
              }</h3>
              <p class="action-text">${message.action}</p>
              ${
                changeType === "activation" || changeType === "otpEnabled"
                  ? `<a href="#" class="action-button" style="color: white; text-decoration: none;">${
                      isArabic ? "تسجيل الدخول الآن" : "Log In Now"
                    }</a>`
                  : ""
              }
            </div>
            
            <!-- Support Information -->
            <p class="support-text">
              ${
                isArabic
                  ? "إذا كان لديك أي أسئلة أو تحتاج إلى مساعدة، لا تتردد في الاتصال بفريق الدعم لدينا."
                  : "If you have any questions or need assistance, please don't hesitate to contact our support team."
              }
            </p>
            
            <!-- Signature -->
            <div class="signature">
              <p style="margin: 0; font-weight: 600;">${common.bestRegards}</p>
              <p style="margin: 5px 0 0 0; color: #6b7280;"><strong>${
                common.teamName
              }</strong></p>
            </div>
          </div>
          
          <!-- Footer -->
          <div class="footer">
            <p class="disclaimer">${common.doNotReply}</p>
            <p class="copyright">© ${new Date().getFullYear()} ${
      common.allRightsReserved
    }</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Get text content for user status change email
   */
  private getUserStatusChangeText(
    userName: string,
    changeType: "activation" | "deactivation" | "otpEnabled" | "otpDisabled",
    common: {
      companyName: string;
      bestRegards: string;
      teamName: string;
      doNotReply: string;
      allRightsReserved: string;
    },
    isArabic: boolean
  ): string {
    const messages = {
      ar: {
        activation:
          "تم تفعيل حسابك في نظام التذاكر بنجاح. يمكنك الآن تسجيل الدخول والوصول إلى جميع الميزات المتاحة.",
        deactivation:
          "تم إلغاء تفعيل حسابك في نظام التذاكر. لن تتمكن من تسجيل الدخول حتى يتم إعادة تفعيل الحساب.",
        otpEnabled:
          "تم تفعيل المصادقة الثنائية لحسابك. ستحتاج إلى إدخال رمز التحقق المرسل إلى بريدك الإلكتروني في كل مرة تسجل فيها الدخول.",
        otpDisabled:
          "تم تعطيل المصادقة الثنائية لحسابك. لن تحتاج إلى إدخال رمز تحقق إضافي عند تسجيل الدخول.",
      },
      en: {
        activation:
          "Your Ticketing System account has been successfully activated. You can now log in and access all available features.",
        deactivation:
          "Your Ticketing System account has been deactivated. You will not be able to log in until the account is reactivated.",
        otpEnabled:
          "Two-factor authentication has been enabled for your account. You will need to enter a verification code sent to your email each time you log in.",
        otpDisabled:
          "Two-factor authentication has been disabled for your account. You will no longer need to enter an additional verification code when logging in.",
      },
    };

    const message = messages[isArabic ? "ar" : "en"][changeType];
    const greeting = isArabic ? "عزيزي" : "Dear";
    const actionText = isArabic ? "ما التالي؟" : "What's Next?";
    const supportText = isArabic
      ? "إذا كان لديك أي أسئلة أو تحتاج إلى مساعدة، لا تتردد في الاتصال بفريق الدعم لدينا."
      : "If you have any questions or need assistance, please don't hesitate to contact our support team.";

    return `
${greeting} ${userName},

${message}

${actionText}
${isArabic ? "تسجيل الدخول الآن" : "Log In Now"}

${supportText}

${common.bestRegards}
${common.teamName}

---
${common.doNotReply}
© ${new Date().getFullYear()} ${common.allRightsReserved}
    `.trim();
  }
}

// Create and export a singleton instance
const emailService = new EmailService();
export default emailService;

// Export the class for testing purposes
export { EmailService };
