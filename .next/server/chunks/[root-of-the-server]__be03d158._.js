module.exports=[88712,(e,t,o)=>{t.exports=e.x("nodemailer",()=>require("nodemailer"))},56732,e=>{"use strict";var t=e.i(88712);let o=new class{transporter;config;constructor(){this.config={host:"mail.privateemail.com",port:465,secure:!0,auth:{user:"platform@mesdrive.com",pass:"Rvm@89Axcvnb"}},this.transporter=t.default.createTransport(this.config)}getEmailStyling(e){let t="ar"===e;return`
      font-family: ${t?"'Tahoma', 'Arial Unicode MS', Arial, sans-serif":"Arial, sans-serif"};
      direction: ${t?"rtl":"ltr"};
      text-align: ${t?"right":"left"};
    `}getCommonTranslations(e){return({ar:{companyName:"نظام التذاكر",bestRegards:"مع أطيب التحيات،",teamName:"فريق نظام التذاكر",doNotReply:"هذا بريد إلكتروني تلقائي من نظام التذاكر.<br>الرجاء عدم الرد على هذا البريد الإلكتروني.",allRightsReserved:"جميع الحقوق محفوظة لنظام التذاكر."},en:{companyName:"Ticketing System",bestRegards:"Best regards,",teamName:"Ticketing System Team",doNotReply:"This is an automated message from Ticketing System.<br>Please do not reply to this email.",allRightsReserved:"Ticketing System. All rights reserved. 2025"}})[e]}async verifyConnection(){try{return await this.transporter.verify(),console.log("Email server connection verified successfully"),!0}catch(e){return console.error("Email server connection failed:",e),!1}}async sendEmail(e){try{if(!e.to||!e.subject||!e.text&&!e.html)throw Error("Missing required email fields: to, subject, and content (text or html)");if(!this.config.auth.pass)throw Error("Email password not configured. Please set NEXT_PUBLIC_EMAIL_PASSWORD environment variable.");let t={from:`"Ticketing System" <${this.config.auth.user}>`,to:Array.isArray(e.to)?e.to.join(", "):e.to,subject:e.subject,text:e.text,html:e.html,attachments:e.attachments},o=await this.transporter.sendMail(t);return console.log("Email sent successfully:",o.messageId),{success:!0,messageId:o.messageId}}catch(e){return console.error("Failed to send email:",e),{success:!1,error:e instanceof Error?e.message:"Unknown error occurred"}}}async sendWelcomeEmail(e,t,o,r="en"){let a=this.getCommonTranslations(r),n=this.getEmailStyling(r),s={ar:{subject:`أهلاً بك في ${a.companyName}`,html:`
           <div style="${n} max-width: 600px; margin: 0 auto; padding: 20px;">
             <h2 style="color: #fb923c; text-align: center;">أهلاً بك في ${a.companyName}</h2>
             <p>عزيزي ${t}،</p>
             <p>أهلاً بك في نظام التذاكر! نحن متحمسون لوجودك كجزء من مجتمعنا.</p>
             
             <!-- Login Credentials Section -->
             <div style="background-color: #fef7f0; border: 2px solid #fb923c; border-radius: 8px; padding: 20px; margin: 20px 0;">
               <h3 style="color: #fb923c; margin: 0 0 15px 0; text-align: center;">بيانات تسجيل الدخول الخاصة بك</h3>
               <div style="background-color: #ffffff; padding: 15px; border-radius: 6px;">
                 <p style="margin: 8px 0;"><strong>البريد الإلكتروني:</strong> <span style="color: #1f2937; font-family: monospace;">${e}</span></p>
                 <p style="margin: 8px 0;"><strong>كلمة المرور:</strong> <span style="color: #dc2626; font-weight: bold; font-family: monospace; background-color: #fef2f2; padding: 4px 8px; border-radius: 4px;">${o}</span></p>
               </div>
               <p style="color: #dc2626; font-size: 14px; margin: 15px 0 5px 0; font-weight: 600;">
                 🔒 مهم: يرجى تغيير كلمة المرور بعد تسجيل الدخول الأول
               </p>
             </div>

             
             <p>إذا كان لديك أي أسئلة، لا تتردد في الاتصال بفريق الدعم لدينا.</p>
             <p>${a.bestRegards}<br><strong>${a.teamName}</strong></p>
             <hr style="border: none; border-top: 1px solid #D1CDCD; margin: 20px 0;">
             <p style="font-size: 12px; color: #D1CDCD; text-align: center;">
               ${a.doNotReply}
             </p>
             <p style="font-size: 12px; color: #D1CDCD; text-align: center;">
               \xa9 ${new Date().getFullYear()} ${a.allRightsReserved}
             </p>
           </div>
         `,text:`أهلاً بك في نظام التذاكر!

عزيزي ${t}،

أهلاً بك في نظام التذاكر! نحن متحمسون لوجودك كجزء من مجتمعنا.

بيانات تسجيل الدخول الخاصة بك:
البريد الإلكتروني: ${e}
كلمة المرور: ${o}

⚠️ مهم: يرجى تغيير كلمة المرور بعد تسجيل الدخول الأول

${a.bestRegards}
${a.teamName}`},en:{subject:`Welcome to ${a.companyName}`,html:`
           <div style="${n} max-width: 600px; margin: 0 auto; padding: 20px;">
             <h2 style="color: #fb923c; text-align: center;">Welcome to ${a.companyName}</h2>
             <p>Dear ${t},</p>
             <p>Welcome to Ticketing System! We're excited to have you as part of our community.</p>
             
             <!-- Login Credentials Section -->
             <div style="background-color: #fef7f0; border: 2px solid #fb923c; border-radius: 8px; padding: 20px; margin: 20px 0;">
               <h3 style="color: #fb923c; margin: 0 0 15px 0; text-align: center;">Your Login Credentials</h3>
               <div style="background-color: #ffffff; padding: 15px; border-radius: 6px;">
                 <p style="margin: 8px 0;"><strong>Email:</strong> <span style="color: #1f2937; font-family: monospace;">${e}</span></p>
                 <p style="margin: 8px 0;"><strong>Password:</strong> <span style="color: #dc2626; font-weight: bold; font-family: monospace; background-color: #fef2f2; padding: 4px 8px; border-radius: 4px;">${o}</span></p>
               </div>
               <p style="color: #dc2626; font-size: 14px; margin: 15px 0 5px 0; font-weight: 600;">
                 🔒 Important: Please change your password after your first login
               </p>
             </div>

            
             <p>If you have any questions, feel free to contact our support team.</p>
             <p>${a.bestRegards}<br><strong>${a.teamName}</strong></p>
             <hr style="border: none; border-top: 1px solid #D1CDCD; margin: 20px 0;">
             <p style="font-size: 12px; color: #D1CDCD; text-align: center;">
               ${a.doNotReply}
             </p>
             <p style="font-size: 12px; color: #D1CDCD; text-align: center;">
               \xa9 ${new Date().getFullYear()} ${a.allRightsReserved}
             </p>
           </div>
         `,text:`Welcome to Ticketing System!

Dear ${t},

Welcome to Ticketing System! We're excited to have you as part of our community.

Your Login Credentials:
Email: ${e}
Password: ${o}

⚠️ Important: Please change your password after your first login

${a.bestRegards}
${a.teamName}`}},i={to:e,subject:s[r].subject,html:s[r].html,text:s[r].text};return this.sendEmail(i)}async sendNotificationEmail(e,t,o,r="en"){let a=this.getCommonTranslations(r),n=this.getEmailStyling(r),s={ar:{subject:t,html:`
          <div style="${n} max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #fb923c; text-align: center;">إشعار من ${a.companyName}</h2>
            <div style="background-color: #fef7f0; border: 1px solid #fb923c; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p>${o.replace(/\n/g,"<br>")}</p>
            </div>
            <p>${a.bestRegards}<br><strong>${a.teamName}</strong></p>
            <hr style="border: none; border-top: 1px solid #D1CDCD; margin: 20px 0;">
            <p style="font-size: 12px; color: #D1CDCD; text-align: center;">
              ${a.doNotReply}
            </p>
            <p style="font-size: 12px; color: #D1CDCD; text-align: center;">
              \xa9 ${new Date().getFullYear()} ${a.allRightsReserved}
            </p>
          </div>
        `,text:`إشعار من ${a.companyName}

${o}

${a.bestRegards}
${a.teamName}`},en:{subject:t,html:`
          <div style="${n} max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #fb923c; text-align: center;">${a.companyName} Notification</h2>
            <div style="background-color: #fef7f0; border: 1px solid #fb923c; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p>${o.replace(/\n/g,"<br>")}</p>
            </div>
            <p>${a.bestRegards}<br><strong>${a.teamName}</strong></p>
            <hr style="border: none; border-top: 1px solid #D1CDCD; margin: 20px 0;">
            <p style="font-size: 12px; color: #D1CDCD; text-align: center;">
              ${a.doNotReply}
            </p>
            <p style="font-size: 12px; color: #D1CDCD; text-align: center;">
              \xa9 ${new Date().getFullYear()} ${a.allRightsReserved}
            </p>
          </div>
        `,text:`${a.companyName} Notification

${o}

${a.bestRegards}
${a.teamName}`}},i={to:e,subject:s[r].subject,html:s[r].html,text:s[r].text};return this.sendEmail(i)}async sendPasswordResetEmail(e,t,o,r="en"){let a=this.getCommonTranslations(r),n=this.getEmailStyling(r),s={ar:{subject:`طلب إعادة تعيين كلمة المرور - ${a.companyName}`,html:`
          <div style="${n} max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #fb923c; text-align: center;">طلب إعادة تعيين كلمة المرور</h2>
            <p>لقد طلبت إعادة تعيين كلمة المرور الخاصة بك في ${a.companyName}.</p>
            <p>انقر على الزر أدناه لإعادة تعيين كلمة المرور:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${o}" style="background-color: #fb923c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">إعادة تعيين كلمة المرور</a>
            </div>
            <p>إذا لم تتمكن من النقر على الزر، انسخ والصق هذا الرابط في متصفحك:</p>
            <p style="word-break: break-all; background-color: #fef7f0; border: 1px solid #D1CDCD; padding: 10px; border-radius: 4px; direction: ltr;">${o}</p>
            <p><strong>سينتهي صلاحية هذا الرابط خلال ساعة واحدة لأسباب أمنية.</strong></p>
            <p>إذا لم تطلب إعادة تعيين كلمة المرور هذه، يرجى تجاهل هذا البريد الإلكتروني.</p>
            <p>${a.bestRegards}<br><strong>${a.teamName}</strong></p>
            <hr style="border: none; border-top: 1px solid #D1CDCD; margin: 20px 0;">
            <p style="font-size: 12px; color: #D1CDCD; text-align: center;">
              ${a.doNotReply}
            </p>
            <p style="font-size: 12px; color: #D1CDCD; text-align: center;">
              \xa9 ${new Date().getFullYear()} ${a.allRightsReserved}
            </p>
          </div>
        `,text:`طلب إعادة تعيين كلمة المرور

لقد طلبت إعادة تعيين كلمة المرور الخاصة بك في ${a.companyName}.

انقر على هذا الرابط لإعادة تعيين كلمة المرور: ${o}

سينتهي صلاحية هذا الرابط خلال ساعة واحدة لأسباب أمنية.

إذا لم تطلب إعادة تعيين كلمة المرور هذه، يرجى تجاهل هذا البريد الإلكتروني.

${a.bestRegards}
${a.teamName}`},en:{subject:`Password Reset Request - ${a.companyName}`,html:`
          <div style="${n} max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #fb923c; text-align: center;">Password Reset Request</h2>
            <p>You have requested to reset your password for ${a.companyName}.</p>
            <p>Click the button below to reset your password:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${o}" style="background-color: #fb923c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Reset Password</a>
            </div>
            <p>If you can't click the button, copy and paste this link in your browser:</p>
            <p style="word-break: break-all; background-color: #fef7f0; border: 1px solid #D1CDCD; padding: 10px; border-radius: 4px;">${o}</p>
            <p><strong>This link will expire in 1 hour for security reasons.</strong></p>
            <p>If you didn't request this password reset, please ignore this email.</p>
            <p>${a.bestRegards}<br><strong>${a.teamName}</strong></p>
            <hr style="border: none; border-top: 1px solid #D1CDCD; margin: 20px 0;">
            <p style="font-size: 12px; color: #D1CDCD; text-align: center;">
              ${a.doNotReply}
            </p>
            <p style="font-size: 12px; color: #D1CDCD; text-align: center;">
              \xa9 ${new Date().getFullYear()} ${a.allRightsReserved}
            </p>
          </div>
        `,text:`Password Reset Request

You have requested to reset your password for ${a.companyName}.

Click this link to reset your password: ${o}

This link will expire in 1 hour for security reasons.

If you didn't request this password reset, please ignore this email.

${a.bestRegards}
${a.teamName}`}},i={to:e,subject:s[r].subject,html:s[r].html,text:s[r].text};return this.sendEmail(i)}async sendOTPEmail(e,t,o="verification",r=10,a="en"){let n=this.getCommonTranslations(a),s=this.getEmailStyling(a),i={ar:{verification:"التحقق",login:"تسجيل الدخول",registration:"التسجيل","password reset":"إعادة تعيين كلمة المرور"},en:{verification:"verification",login:"login",registration:"registration","password reset":"password reset"}}[a][o]||o,l={ar:{subject:`رمز التحقق الخاص بك - ${n.companyName}`,html:`
          <div style="${s} max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
            <!-- Header -->
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #fb923c; margin: 0; font-size: 28px;">${n.companyName}</h1>
              <p style="color: #D1CDCD; margin: 5px 0 0 0; font-size: 14px;">رمز ${i} الآمن</p>
            </div>

            <!-- Main Content -->
            <div style="background-color: #fef7f0; padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 20px;">
              <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">رمز التحقق الخاص بك</h2>
              <p style="color: #4b5563; margin: 0 0 30px 0; font-size: 16px;">استخدم هذا الرمز لإكمال ${i}:</p>
              
              <!-- OTP Code Box -->
              <div style="background-color: #ffffff; border: 2px solid #fb923c; border-radius: 8px; padding: 25px; margin: 20px auto; display: inline-block; min-width: 200px;">
                <div style="font-size: 36px; font-weight: bold; color: #fb923c; letter-spacing: 8px; font-family: 'Courier New', monospace; direction: ltr;">${t}</div>
              </div>
              
              <p style="color: #ef4444; font-weight: 600; margin: 20px 0 0 0; font-size: 14px;">
                ⏰ ينتهي صلاحية هذا الرمز خلال ${r} دقيقة
              </p>
            </div>

            <!-- Security Notice -->
            <div style="background-color: #fef7f0; border: 1px solid #fb923c; border-radius: 8px; padding: 15px; margin: 20px 0;">
              <h3 style="color: #fb923c; margin: 0 0 10px 0; font-size: 16px;">
                🔒 تنبيه أمني
              </h3>
              <ul style="color: #1f2937; margin: 0; padding-right: 20px; font-size: 14px; list-style-type: disc;">
                <li>لا تشارك هذا الرمز مع أي شخص</li>
                <li>${n.companyName} لن يطلب منك رمز التحقق عبر الهاتف أو البريد الإلكتروني</li>
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
              <p style="color: #4b5563; margin: 0; font-size: 16px;">${n.bestRegards}<br><strong>${n.teamName}</strong></p>
            </div>
            
            <hr style="border: none; border-top: 1px solid #D1CDCD; margin: 30px 0;">
            
            <!-- Email Footer -->
            <div style="text-align: center;">
              <p style="font-size: 12px; color: #D1CDCD; margin: 0;">
                ${n.doNotReply}
              </p>
              <p style="font-size: 12px; color: #D1CDCD; margin: 10px 0 0 0;">
                \xa9 ${new Date().getFullYear()} ${n.allRightsReserved}
              </p>
            </div>
          </div>
        `,text:`${n.companyName} - رمز التحقق الخاص بك

رمز ${i}: ${t}

ينتهي صلاحية هذا الرمز خلال ${r} دقيقة.

تنبيه أمني:
- لا تشارك هذا الرمز مع أي شخص
- ${n.companyName} لن يطلب منك رمز التحقق عبر الهاتف أو البريد الإلكتروني
- إذا لم تطلب هذا الرمز، يرجى تجاهل هذا البريد الإلكتروني

${n.bestRegards}
${n.teamName}

\xa9 ${new Date().getFullYear()} ${n.allRightsReserved}`},en:{subject:`Your OTP Code - ${n.companyName}`,html:`
          <div style="${s} max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
            <!-- Header -->
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #fb923c; margin: 0; font-size: 28px;">${n.companyName}</h1>
              <p style="color: #D1CDCD; margin: 5px 0 0 0; font-size: 14px;">Secure ${i} code</p>
            </div>

            <!-- Main Content -->
            <div style="background-color: #fef7f0; padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 20px;">
              <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">Your Verification Code</h2>
              <p style="color: #4b5563; margin: 0 0 30px 0; font-size: 16px;">Use this code to complete your ${i}:</p>
              
              <!-- OTP Code Box -->
              <div style="background-color: #ffffff; border: 2px solid #fb923c; border-radius: 8px; padding: 25px; margin: 20px auto; display: inline-block; min-width: 200px;">
                <div style="font-size: 36px; font-weight: bold; color: #fb923c; letter-spacing: 8px; font-family: 'Courier New', monospace;">${t}</div>
              </div>
              
              <p style="color: #ef4444; font-weight: 600; margin: 20px 0 0 0; font-size: 14px;">
                ⏰ This code expires in ${r} minutes
              </p>
            </div>

            <!-- Security Notice -->
            <div style="background-color: #fef7f0; border: 1px solid #fb923c; border-radius: 8px; padding: 15px; margin: 20px 0;">
              <h3 style="color: #fb923c; margin: 0 0 10px 0; font-size: 16px;">
                🔒 Security Notice
              </h3>
              <ul style="color: #1f2937; margin: 0; padding-left: 20px; font-size: 14px;">
                <li>Never share this code with anyone</li>
                <li>${n.companyName} will never ask for your OTP over phone or email</li>
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
              <p style="color: #4b5563; margin: 0; font-size: 16px;">${n.bestRegards}<br><strong>${n.teamName}</strong></p>
            </div>
            
            <hr style="border: none; border-top: 1px solid #D1CDCD; margin: 30px 0;">
            
            <!-- Email Footer -->
            <div style="text-align: center;">
              <p style="font-size: 12px; color: #D1CDCD; margin: 0;">
                ${n.doNotReply}
              </p>
              <p style="font-size: 12px; color: #D1CDCD; margin: 10px 0 0 0;">
                \xa9 ${new Date().getFullYear()} ${n.allRightsReserved}
              </p>
            </div>
          </div>
        `,text:`${n.companyName} - Your Verification Code

Your ${i} code: ${t}

This code expires in ${r} minutes.

Security Notice:
- Never share this code with anyone
- ${n.companyName} will never ask for your OTP over phone or email
- If you didn't request this code, please ignore this email

${n.bestRegards}
${n.teamName}

\xa9 ${new Date().getFullYear()} ${n.allRightsReserved}`}},p={to:e,subject:l[a].subject,html:l[a].html,text:l[a].text};return this.sendEmail(p)}async sendReservationNotification(e,t,o="en"){let r=this.getCommonTranslations(o),a=this.getEmailStyling(o),n={ar:{subject:`تأكيد الحجز - ${t.reservationId}`,html:`
          <div style="${a} max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #fb923c; text-align: center;">تأكيد حجز السيارة</h2>
            
            <div style="background-color: #fef7f0; border: 1px solid #fb923c; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #fb923c; margin-top: 0;">تفاصيل الحجز</h3>
              <p><strong>رقم الحجز:</strong> ${t.reservationId}</p>
              <p><strong>اسم العميل:</strong> ${t.customerName}</p>
              <hr style="border: none; border-top: 1px solid #D1CDCD; margin: 15px 0;">
              <h4 style="color: #1f2937;">معلومات السيارة</h4>
              <p><strong>السيارة:</strong> ${t.vehicleMake} ${t.vehicleModel} ${t.vehicleYear}</p>
              <hr style="border: none; border-top: 1px solid #D1CDCD; margin: 15px 0;">
              <h4 style="color: #1f2937;">فترة الاستئجار</h4>
              <p><strong>تاريخ البداية:</strong> ${t.startDate}</p>
              <p><strong>تاريخ النهاية:</strong> ${t.endDate}</p>
              ${t.totalAmount?`<hr style="border: none; border-top: 1px solid #D1CDCD; margin: 15px 0;">
              <p style="font-size: 18px;"><strong>المبلغ الإجمالي:</strong> <span style="color: #fb923c;">${t.totalAmount} ريال</span></p>`:""}
            </div>
            
            <p>شكراً لاختياركم خدماتنا. سنتواصل معكم قريباً لتأكيد التفاصيل.</p>
            <p>${r.bestRegards}<br><strong>${r.teamName}</strong></p>
            <hr style="border: none; border-top: 1px solid #D1CDCD; margin: 20px 0;">
            <p style="font-size: 12px; color: #D1CDCD; text-align: center;">
              ${r.doNotReply}
            </p>
            <p style="font-size: 12px; color: #D1CDCD; text-align: center;">
              \xa9 ${new Date().getFullYear()} ${r.allRightsReserved}
            </p>
          </div>
        `,text:`تأكيد حجز السيارة

رقم الحجز: ${t.reservationId}
اسم العميل: ${t.customerName}

معلومات السيارة:
${t.vehicleMake} ${t.vehicleModel} ${t.vehicleYear}

فترة الاستئجار:
تاريخ البداية: ${t.startDate}
تاريخ النهاية: ${t.endDate}
${t.totalAmount?`
المبلغ الإجمالي: ${t.totalAmount} ريال`:""}

${r.bestRegards}
${r.teamName}`},en:{subject:`Reservation Confirmation - ${t.reservationId}`,html:`
          <div style="${a} max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #fb923c; text-align: center;">Car Reservation Confirmation</h2>
            
            <div style="background-color: #fef7f0; border: 1px solid #fb923c; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #fb923c; margin-top: 0;">Reservation Details</h3>
              <p><strong>Reservation ID:</strong> ${t.reservationId}</p>
              <p><strong>Customer Name:</strong> ${t.customerName}</p>
              <hr style="border: none; border-top: 1px solid #D1CDCD; margin: 15px 0;">
              <h4 style="color: #1f2937;">Vehicle Information</h4>
              <p><strong>Vehicle:</strong> ${t.vehicleMake} ${t.vehicleModel} ${t.vehicleYear}</p>
              <hr style="border: none; border-top: 1px solid #D1CDCD; margin: 15px 0;">
              <h4 style="color: #1f2937;">Rental Period</h4>
              <p><strong>Start Date:</strong> ${t.startDate}</p>
              <p><strong>End Date:</strong> ${t.endDate}</p>
              ${t.totalAmount?`<hr style="border: none; border-top: 1px solid #D1CDCD; margin: 15px 0;">
              <p style="font-size: 18px;"><strong>Total Amount:</strong> <span style="color: #fb923c;">${t.totalAmount} SAR</span></p>`:""}
            </div>
            
            <p>Thank you for choosing our services. We will contact you soon to confirm the details.</p>
            <p>${r.bestRegards}<br><strong>${r.teamName}</strong></p>
            <hr style="border: none; border-top: 1px solid #D1CDCD; margin: 20px 0;">
            <p style="font-size: 12px; color: #D1CDCD; text-align: center;">
              ${r.doNotReply}
            </p>
            <p style="font-size: 12px; color: #D1CDCD; text-align: center;">
              \xa9 ${new Date().getFullYear()} ${r.allRightsReserved}
            </p>
          </div>
        `,text:`Car Reservation Confirmation

Reservation ID: ${t.reservationId}
Customer Name: ${t.customerName}

Vehicle Information:
${t.vehicleMake} ${t.vehicleModel} ${t.vehicleYear}

Rental Period:
Start Date: ${t.startDate}
End Date: ${t.endDate}
${t.totalAmount?`
Total Amount: ${t.totalAmount} SAR`:""}

${r.bestRegards}
${r.teamName}`}},s={to:e,subject:n[o].subject,html:n[o].html,text:n[o].text};return this.sendEmail(s)}async sendAgreementNotification(e,t,o="en"){let r=this.getCommonTranslations(o),a=this.getEmailStyling(o),n={ar:{draft:"مسودة",active:"نشط",extended:"ممدد",closed:"مغلق",suspended:"معلق"},en:{draft:"Draft",active:"Active",extended:"Extended",closed:"Closed",suspended:"Suspended"}}[o][t.status]||t.status,s={ar:{subject:`عقد إيجار السيارة - ${t.contractNumber}`,html:`
          <div style="${a} max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #fb923c; text-align: center;">تأكيد عقد إيجار السيارة</h2>
            
            <div style="background-color: #fef7f0; border: 2px solid #fb923c; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #fb923c; margin-top: 0;">تفاصيل العقد</h3>
              <p><strong>رقم العقد:</strong> <span style="font-family: monospace; color: #1f2937;">${t.contractNumber}</span></p>
              <p><strong>اسم العميل:</strong> ${t.customerName}</p>
              <p><strong>الحالة:</strong> <span style="background-color: #fbbf24; color: #000; padding: 2px 8px; border-radius: 4px;">${n}</span></p>
              <hr style="border: none; border-top: 1px solid #D1CDCD; margin: 15px 0;">
              <h4 style="color: #1f2937;">معلومات السيارة</h4>
              <p><strong>السيارة:</strong> ${t.vehicleMake} ${t.vehicleModel}</p>
              <hr style="border: none; border-top: 1px solid #D1CDCD; margin: 15px 0;">
              <h4 style="color: #1f2937;">فترة العقد</h4>
              <p><strong>تاريخ البداية:</strong> ${t.startDate}</p>
              <p><strong>تاريخ النهاية:</strong> ${t.endDate}</p>
              <hr style="border: none; border-top: 1px solid #D1CDCD; margin: 15px 0;">
              <h4 style="color: #1f2937;">المبالغ المالية</h4>
              <p><strong>المبلغ الإجمالي:</strong> <span style="color: #fb923c; font-size: 20px; font-weight: bold;">${t.totalAmount} ريال</span></p>
              ${t.paidAmount?`<p><strong>المبلغ المدفوع:</strong> ${t.paidAmount} ريال</p>`:""}
            </div>
            
            <p>تم إنشاء عقد الإيجار بنجاح. يرجى مراجعة التفاصيل والتواصل معنا في حال وجود أي استفسارات.</p>
            <p>${r.bestRegards}<br><strong>${r.teamName}</strong></p>
            <hr style="border: none; border-top: 1px solid #D1CDCD; margin: 20px 0;">
            <p style="font-size: 12px; color: #D1CDCD; text-align: center;">
              ${r.doNotReply}
            </p>
            <p style="font-size: 12px; color: #D1CDCD; text-align: center;">
              \xa9 ${new Date().getFullYear()} ${r.allRightsReserved}
            </p>
          </div>
        `,text:`عقد إيجار السيارة

رقم العقد: ${t.contractNumber}
اسم العميل: ${t.customerName}
الحالة: ${n}

معلومات السيارة:
${t.vehicleMake} ${t.vehicleModel}

فترة العقد:
تاريخ البداية: ${t.startDate}
تاريخ النهاية: ${t.endDate}

المبلغ الإجمالي: ${t.totalAmount} ريال
${t.paidAmount?`المبلغ المدفوع: ${t.paidAmount} ريال`:""}

${r.bestRegards}
${r.teamName}`},en:{subject:`Car Rental Agreement - ${t.contractNumber}`,html:`
          <div style="${a} max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #fb923c; text-align: center;">Car Rental Agreement Confirmation</h2>
            
            <div style="background-color: #fef7f0; border: 2px solid #fb923c; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #fb923c; margin-top: 0;">Contract Details</h3>
              <p><strong>Contract Number:</strong> <span style="font-family: monospace; color: #1f2937;">${t.contractNumber}</span></p>
              <p><strong>Customer Name:</strong> ${t.customerName}</p>
              <p><strong>Status:</strong> <span style="background-color: #fbbf24; color: #000; padding: 2px 8px; border-radius: 4px;">${n}</span></p>
              <hr style="border: none; border-top: 1px solid #D1CDCD; margin: 15px 0;">
              <h4 style="color: #1f2937;">Vehicle Information</h4>
              <p><strong>Vehicle:</strong> ${t.vehicleMake} ${t.vehicleModel}</p>
              <hr style="border: none; border-top: 1px solid #D1CDCD; margin: 15px 0;">
              <h4 style="color: #1f2937;">Contract Period</h4>
              <p><strong>Start Date:</strong> ${t.startDate}</p>
              <p><strong>End Date:</strong> ${t.endDate}</p>
              <hr style="border: none; border-top: 1px solid #D1CDCD; margin: 15px 0;">
              <h4 style="color: #1f2937;">Financial Details</h4>
              <p><strong>Total Amount:</strong> <span style="color: #fb923c; font-size: 20px; font-weight: bold;">${t.totalAmount} SAR</span></p>
              ${t.paidAmount?`<p><strong>Paid Amount:</strong> ${t.paidAmount} SAR</p>`:""}
            </div>
            
            <p>Your rental agreement has been created successfully. Please review the details and contact us if you have any questions.</p>
            <p>${r.bestRegards}<br><strong>${r.teamName}</strong></p>
            <hr style="border: none; border-top: 1px solid #D1CDCD; margin: 20px 0;">
            <p style="font-size: 12px; color: #D1CDCD; text-align: center;">
              ${r.doNotReply}
            </p>
            <p style="font-size: 12px; color: #D1CDCD; text-align: center;">
              \xa9 ${new Date().getFullYear()} ${r.allRightsReserved}
            </p>
          </div>
        `,text:`Car Rental Agreement

Contract Number: ${t.contractNumber}
Customer Name: ${t.customerName}
Status: ${n}

Vehicle Information:
${t.vehicleMake} ${t.vehicleModel}

Contract Period:
Start Date: ${t.startDate}
End Date: ${t.endDate}

Total Amount: ${t.totalAmount} SAR
${t.paidAmount?`Paid Amount: ${t.paidAmount} SAR`:""}

${r.bestRegards}
${r.teamName}`}},i={to:e,subject:s[o].subject,html:s[o].html,text:s[o].text};return this.sendEmail(i)}async sendPaymentNotification(e,t,o="en"){let r=this.getCommonTranslations(o),a=this.getEmailStyling(o),n={ar:{subject:`إيصال دفع - ${t.contractNumber}`,html:`
          <div style="${a} max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #fb923c; text-align: center;">✓ تأكيد استلام الدفع</h2>
            
            <div style="background-color: #f0fdf4; border: 2px solid #10b981; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #10b981; margin-top: 0;">تفاصيل الدفع</h3>
              <p><strong>رقم الإيصال:</strong> <span style="font-family: monospace;">${t.paymentId}</span></p>
              <p><strong>رقم العقد:</strong> ${t.contractNumber}</p>
              <p><strong>اسم العميل:</strong> ${t.customerName}</p>
              <hr style="border: none; border-top: 1px solid #D1CDCD; margin: 15px 0;">
              <h4 style="color: #1f2937;">معلومات المبلغ</h4>
              <p style="font-size: 24px; color: #10b981; font-weight: bold; margin: 10px 0;">
                ${t.amount} ريال سعودي
              </p>
              <p><strong>طريقة الدفع:</strong> ${t.paymentMethod}</p>
              <p><strong>تاريخ الاستلام:</strong> ${t.receivedAt}</p>
              ${t.reference?`<p><strong>المرجع:</strong> ${t.reference}</p>`:""}
            </div>
            
            <p>تم استلام الدفع بنجاح. شكراً لثقتكم بخدماتنا.</p>
            <p>${r.bestRegards}<br><strong>${r.teamName}</strong></p>
            <hr style="border: none; border-top: 1px solid #D1CDCD; margin: 20px 0;">
            <p style="font-size: 12px; color: #D1CDCD; text-align: center;">
              ${r.doNotReply}
            </p>
            <p style="font-size: 12px; color: #D1CDCD; text-align: center;">
              \xa9 ${new Date().getFullYear()} ${r.allRightsReserved}
            </p>
          </div>
        `,text:`إيصال دفع

رقم الإيصال: ${t.paymentId}
رقم العقد: ${t.contractNumber}
اسم العميل: ${t.customerName}

المبلغ: ${t.amount} ريال سعودي
طريقة الدفع: ${t.paymentMethod}
تاريخ الاستلام: ${t.receivedAt}
${t.reference?`المرجع: ${t.reference}`:""}

تم استلام الدفع بنجاح.

${r.bestRegards}
${r.teamName}`},en:{subject:`Payment Receipt - ${t.contractNumber}`,html:`
          <div style="${a} max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #fb923c; text-align: center;">✓ Payment Confirmation</h2>
            
            <div style="background-color: #f0fdf4; border: 2px solid #10b981; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #10b981; margin-top: 0;">Payment Details</h3>
              <p><strong>Receipt Number:</strong> <span style="font-family: monospace;">${t.paymentId}</span></p>
              <p><strong>Contract Number:</strong> ${t.contractNumber}</p>
              <p><strong>Customer Name:</strong> ${t.customerName}</p>
              <hr style="border: none; border-top: 1px solid #D1CDCD; margin: 15px 0;">
              <h4 style="color: #1f2937;">Amount Information</h4>
              <p style="font-size: 24px; color: #10b981; font-weight: bold; margin: 10px 0;">
                ${t.amount} SAR
              </p>
              <p><strong>Payment Method:</strong> ${t.paymentMethod}</p>
              <p><strong>Received At:</strong> ${t.receivedAt}</p>
              ${t.reference?`<p><strong>Reference:</strong> ${t.reference}</p>`:""}
            </div>
            
            <p>Payment received successfully. Thank you for your business.</p>
            <p>${r.bestRegards}<br><strong>${r.teamName}</strong></p>
            <hr style="border: none; border-top: 1px solid #D1CDCD; margin: 20px 0;">
            <p style="font-size: 12px; color: #D1CDCD; text-align: center;">
              ${r.doNotReply}
            </p>
            <p style="font-size: 12px; color: #D1CDCD; text-align: center;">
              \xa9 ${new Date().getFullYear()} ${r.allRightsReserved}
            </p>
          </div>
        `,text:`Payment Receipt

Receipt Number: ${t.paymentId}
Contract Number: ${t.contractNumber}
Customer Name: ${t.customerName}

Amount: ${t.amount} SAR
Payment Method: ${t.paymentMethod}
Received At: ${t.receivedAt}
${t.reference?`Reference: ${t.reference}`:""}

Payment received successfully.

${r.bestRegards}
${r.teamName}`}},s={to:e,subject:n[o].subject,html:n[o].html,text:n[o].text};return this.sendEmail(s)}async sendMaintenanceNotification(e,t,o="en"){let r=this.getCommonTranslations(o),a=this.getEmailStyling(o),n={ar:{subject:`جدولة صيانة السيارة - ${t.plateNumber}`,html:`
          <div style="${a} max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #fb923c; text-align: center;">🔧 تنبيه صيانة السيارة</h2>
            
            <div style="background-color: #fef7f0; border: 1px solid #fb923c; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #fb923c; margin-top: 0;">تفاصيل الصيانة</h3>
              <p><strong>رقم الصيانة:</strong> ${t.maintenanceId}</p>
              <hr style="border: none; border-top: 1px solid #D1CDCD; margin: 15px 0;">
              <h4 style="color: #1f2937;">معلومات السيارة</h4>
              <p><strong>السيارة:</strong> ${t.vehicleMake} ${t.vehicleModel}</p>
              <p><strong>رقم اللوحة:</strong> <span style="font-family: monospace; background-color: #fbbf24; padding: 2px 8px; border-radius: 4px;">${t.plateNumber}</span></p>
              <hr style="border: none; border-top: 1px solid #D1CDCD; margin: 15px 0;">
              <h4 style="color: #1f2937;">تفاصيل الخدمة</h4>
              <p><strong>نوع الخدمة:</strong> ${t.serviceType}</p>
              <p><strong>التاريخ المحدد:</strong> <span style="color: #fb923c; font-weight: bold;">${t.scheduledDate}</span></p>
              ${t.provider?`<p><strong>مزود الخدمة:</strong> ${t.provider}</p>`:""}
              ${t.estimatedCost?`<p><strong>التكلفة المقدرة:</strong> ${t.estimatedCost} ريال</p>`:""}
              ${t.notes?`<hr style="border: none; border-top: 1px solid #D1CDCD; margin: 15px 0;">
              <h4 style="color: #1f2937;">ملاحظات</h4>
              <p>${t.notes}</p>`:""}
            </div>
            
            <p>تم جدولة الصيانة بنجاح. يرجى التأكد من توفر السيارة في التاريخ المحدد.</p>
            <p>${r.bestRegards}<br><strong>${r.teamName}</strong></p>
            <hr style="border: none; border-top: 1px solid #D1CDCD; margin: 20px 0;">
            <p style="font-size: 12px; color: #D1CDCD; text-align: center;">
              ${r.doNotReply}
            </p>
            <p style="font-size: 12px; color: #D1CDCD; text-align: center;">
              \xa9 ${new Date().getFullYear()} ${r.allRightsReserved}
            </p>
          </div>
        `,text:`تنبيه صيانة السيارة

رقم الصيانة: ${t.maintenanceId}

معلومات السيارة:
السيارة: ${t.vehicleMake} ${t.vehicleModel}
رقم اللوحة: ${t.plateNumber}

تفاصيل الخدمة:
نوع الخدمة: ${t.serviceType}
التاريخ المحدد: ${t.scheduledDate}
${t.provider?`مزود الخدمة: ${t.provider}
`:""}${t.estimatedCost?`التكلفة المقدرة: ${t.estimatedCost} ريال
`:""}${t.notes?`
ملاحظات:
${t.notes}
`:""}
${r.bestRegards}
${r.teamName}`},en:{subject:`Vehicle Maintenance Scheduled - ${t.plateNumber}`,html:`
          <div style="${a} max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #fb923c; text-align: center;">🔧 Vehicle Maintenance Alert</h2>
            
            <div style="background-color: #fef7f0; border: 1px solid #fb923c; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #fb923c; margin-top: 0;">Maintenance Details</h3>
              <p><strong>Maintenance ID:</strong> ${t.maintenanceId}</p>
              <hr style="border: none; border-top: 1px solid #D1CDCD; margin: 15px 0;">
              <h4 style="color: #1f2937;">Vehicle Information</h4>
              <p><strong>Vehicle:</strong> ${t.vehicleMake} ${t.vehicleModel}</p>
              <p><strong>Plate Number:</strong> <span style="font-family: monospace; background-color: #fbbf24; padding: 2px 8px; border-radius: 4px;">${t.plateNumber}</span></p>
              <hr style="border: none; border-top: 1px solid #D1CDCD; margin: 15px 0;">
              <h4 style="color: #1f2937;">Service Details</h4>
              <p><strong>Service Type:</strong> ${t.serviceType}</p>
              <p><strong>Scheduled Date:</strong> <span style="color: #fb923c; font-weight: bold;">${t.scheduledDate}</span></p>
              ${t.provider?`<p><strong>Service Provider:</strong> ${t.provider}</p>`:""}
              ${t.estimatedCost?`<p><strong>Estimated Cost:</strong> ${t.estimatedCost} SAR</p>`:""}
              ${t.notes?`<hr style="border: none; border-top: 1px solid #D1CDCD; margin: 15px 0;">
              <h4 style="color: #1f2937;">Notes</h4>
              <p>${t.notes}</p>`:""}
            </div>
            
            <p>Maintenance has been scheduled successfully. Please ensure the vehicle is available on the scheduled date.</p>
            <p>${r.bestRegards}<br><strong>${r.teamName}</strong></p>
            <hr style="border: none; border-top: 1px solid #D1CDCD; margin: 20px 0;">
            <p style="font-size: 12px; color: #D1CDCD; text-align: center;">
              ${r.doNotReply}
            </p>
            <p style="font-size: 12px; color: #D1CDCD; text-align: center;">
              \xa9 ${new Date().getFullYear()} ${r.allRightsReserved}
            </p>
          </div>
        `,text:`Vehicle Maintenance Alert

Maintenance ID: ${t.maintenanceId}

Vehicle Information:
Vehicle: ${t.vehicleMake} ${t.vehicleModel}
Plate Number: ${t.plateNumber}

Service Details:
Service Type: ${t.serviceType}
Scheduled Date: ${t.scheduledDate}
${t.provider?`Service Provider: ${t.provider}
`:""}${t.estimatedCost?`Estimated Cost: ${t.estimatedCost} SAR
`:""}${t.notes?`
Notes:
${t.notes}
`:""}
${r.bestRegards}
${r.teamName}`}},s={to:e,subject:n[o].subject,html:n[o].html,text:n[o].text};return this.sendEmail(s)}async sendUserStatusChangeEmail(e,t,o,r="en"){let a=this.getCommonTranslations(r),n=this.getEmailStyling(r),s={ar:{subject:this.getUserStatusChangeSubject(o,!0),html:this.getUserStatusChangeHtml(t,o,a,n,!0),text:this.getUserStatusChangeText(t,o,a,!0)},en:{subject:this.getUserStatusChangeSubject(o,!1),html:this.getUserStatusChangeHtml(t,o,a,n,!1),text:this.getUserStatusChangeText(t,o,a,!1)}},i={to:e,subject:s[r].subject,html:s[r].html,text:s[r].text};return this.sendEmail(i)}getUserStatusChangeSubject(e,t){return({ar:{activation:"تم تفعيل حسابك في نظام التذاكر",deactivation:"تم إلغاء تفعيل حسابك في نظام التذاكر",otpEnabled:"تم تفعيل المصادقة الثنائية لحسابك",otpDisabled:"تم تعطيل المصادقة الثنائية لحسابك"},en:{activation:"Your Ticketing System account has been activated",deactivation:"Your Ticketing System account has been deactivated",otpEnabled:"Two-factor authentication enabled for your account",otpDisabled:"Two-factor authentication disabled for your account"}})[t?"ar":"en"][e]}getUserStatusChangeHtml(e,t,o,r,a){let n={ar:{activation:{title:"تم تفعيل حسابك",message:"تم تفعيل حسابك في نظام التذاكر بنجاح. يمكنك الآن تسجيل الدخول والوصول إلى جميع الميزات المتاحة.",action:"تسجيل الدخول الآن"},deactivation:{title:"تم إلغاء تفعيل حسابك",message:"تم إلغاء تفعيل حسابك في نظام التذاكر. لن تتمكن من تسجيل الدخول حتى يتم إعادة تفعيل الحساب.",action:"اتصل بالدعم"},otpEnabled:{title:"تم تفعيل المصادقة الثنائية",message:"تم تفعيل المصادقة الثنائية لحسابك. ستحتاج إلى إدخال رمز التحقق المرسل إلى بريدك الإلكتروني في كل مرة تسجل فيها الدخول.",action:"تسجيل الدخول الآن"},otpDisabled:{title:"تم تعطيل المصادقة الثنائية",message:"تم تعطيل المصادقة الثنائية لحسابك. لن تحتاج إلى إدخال رمز تحقق إضافي عند تسجيل الدخول.",action:"تسجيل الدخول الآن"}},en:{activation:{title:"Account Activated",message:"Your Ticketing System account has been successfully activated. You can now log in and access all available features.",action:"Log In Now"},deactivation:{title:"Account Deactivated",message:"Your Ticketing System account has been deactivated. You will not be able to log in until the account is reactivated.",action:"Contact Support"},otpEnabled:{title:"Two-Factor Authentication Enabled",message:"Two-factor authentication has been enabled for your account. You will need to enter a verification code sent to your email each time you log in.",action:"Log In Now"},otpDisabled:{title:"Two-Factor Authentication Disabled",message:"Two-factor authentication has been disabled for your account. You will no longer need to enter an additional verification code when logging in.",action:"Log In Now"}}}[a?"ar":"en"][t],s="activation"===t?"#10b981":"deactivation"===t?"#ef4444":"otpEnabled"===t?"#3b82f6":"#f59e0b";return`
      <!DOCTYPE html>
      <html dir="${a?"rtl":"ltr"}" lang="${a?"ar":"en"}">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${n.title}</title>
        <style>
          body { margin: 0; padding: 20px; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1); }
          .header { background: linear-gradient(135deg, ${s} 0%, ${s}dd 100%); padding: 40px 20px; text-align: center; }
          .content { padding: 40px 30px; }
          .status-card { background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); border: 2px solid ${s}20; border-radius: 12px; padding: 30px; margin: 30px 0; text-align: center; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
          .action-button { display: inline-block; background: ${s}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); transition: all 0.2s ease; }
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
            <div class="icon-large">${"activation"===t?"🎉":"deactivation"===t?"🔒":"otpEnabled"===t?"🔐":"🔓"}</div>
            <h1 class="title">${n.title}</h1>
            <p class="subtitle">${a?"نظام التذاكر":"Ticketing System"}</p>
          </div>
          
          <!-- Content -->
          <div class="content">
            <p style="font-size: 16px; color: #374151; margin: 0 0 20px 0;">
              <strong>${a?"عزيزي":"Dear"} ${e},</strong>
            </p>
            
            <p class="message">${n.message}</p>
            
            <!-- Status Card -->
            <div class="status-card">
              <h3 class="action-title">${a?"ما التالي؟":"What's Next?"}</h3>
              <p class="action-text">${n.action}</p>
              ${"activation"===t||"otpEnabled"===t?`<a href="#" class="action-button" style="color: white; text-decoration: none;">${a?"تسجيل الدخول الآن":"Log In Now"}</a>`:""}
            </div>
            
            <!-- Support Information -->
            <p class="support-text">
              ${a?"إذا كان لديك أي أسئلة أو تحتاج إلى مساعدة، لا تتردد في الاتصال بفريق الدعم لدينا.":"If you have any questions or need assistance, please don't hesitate to contact our support team."}
            </p>
            
            <!-- Signature -->
            <div class="signature">
              <p style="margin: 0; font-weight: 600;">${o.bestRegards}</p>
              <p style="margin: 5px 0 0 0; color: #6b7280;"><strong>${o.teamName}</strong></p>
            </div>
          </div>
          
          <!-- Footer -->
          <div class="footer">
            <p class="disclaimer">${o.doNotReply}</p>
            <p class="copyright">\xa9 ${new Date().getFullYear()} ${o.allRightsReserved}</p>
          </div>
        </div>
      </body>
      </html>
    `}getUserStatusChangeText(e,t,o,r){let a={ar:{activation:"تم تفعيل حسابك في نظام التذاكر بنجاح. يمكنك الآن تسجيل الدخول والوصول إلى جميع الميزات المتاحة.",deactivation:"تم إلغاء تفعيل حسابك في نظام التذاكر. لن تتمكن من تسجيل الدخول حتى يتم إعادة تفعيل الحساب.",otpEnabled:"تم تفعيل المصادقة الثنائية لحسابك. ستحتاج إلى إدخال رمز التحقق المرسل إلى بريدك الإلكتروني في كل مرة تسجل فيها الدخول.",otpDisabled:"تم تعطيل المصادقة الثنائية لحسابك. لن تحتاج إلى إدخال رمز تحقق إضافي عند تسجيل الدخول."},en:{activation:"Your Ticketing System account has been successfully activated. You can now log in and access all available features.",deactivation:"Your Ticketing System account has been deactivated. You will not be able to log in until the account is reactivated.",otpEnabled:"Two-factor authentication has been enabled for your account. You will need to enter a verification code sent to your email each time you log in.",otpDisabled:"Two-factor authentication has been disabled for your account. You will no longer need to enter an additional verification code when logging in."}}[r?"ar":"en"][t];return`
${r?"عزيزي":"Dear"} ${e},

${a}

${r?"ما التالي؟":"What's Next?"}
${r?"تسجيل الدخول الآن":"Log In Now"}

${r?"إذا كان لديك أي أسئلة أو تحتاج إلى مساعدة، لا تتردد في الاتصال بفريق الدعم لدينا.":"If you have any questions or need assistance, please don't hesitate to contact our support team."}

${o.bestRegards}
${o.teamName}

---
${o.doNotReply}
\xa9 ${new Date().getFullYear()} ${o.allRightsReserved}
    `.trim()}};e.s(["default",0,o])}];

//# sourceMappingURL=%5Broot-of-the-server%5D__be03d158._.js.map