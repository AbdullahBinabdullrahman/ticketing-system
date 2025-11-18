module.exports=[48841,e=>{"use strict";var r=e.i(56732),s=e.i(3781);let t=new class{async sendRequestAssignedEmail(e,t="en"){try{let a={ar:{subject:`طلب جديد تم تعيينه - ${e.requestNumber}`,message:`تم تعيين طلب خدمة جديد لك.

رقم الطلب: ${e.requestNumber}
الفرع: ${e.branchName}
الخدمة: ${e.serviceName}
الفئة: ${e.categoryName}
اسم العميل: ${e.customerName}
الموقع: ${e.branchAddress}

⏰ مهم: يرجى قبول أو رفض الطلب خلال 15 دقيقة.

سجل الدخول إلى لوحة التحكم للرد على الطلب.`},en:{subject:`New Request Assigned - ${e.requestNumber}`,message:`A new service request has been assigned to you.

Request Number: ${e.requestNumber}
Branch: ${e.branchName}
Service: ${e.serviceName}
Category: ${e.categoryName}
Customer Name: ${e.customerName}
Location: ${e.branchAddress}

⏰ Important: Please accept or reject this request within 15 minutes.

Log in to your dashboard to respond to this request.`}},n=await r.default.sendNotificationEmail(e.partnerEmail,a[t].subject,a[t].message,t);return n.success&&s.logger.info("Request assigned email sent",{requestId:e.requestId,recipient:e.partnerEmail}),n}catch(r){return s.logger.error("Failed to send request assigned email",{error:r,requestId:e.requestId}),{success:!1,error:r instanceof Error?r.message:"Unknown error"}}}async sendRequestAcceptedEmail(e,t,a="en"){try{let n={ar:{adminSubject:`تم قبول الطلب - ${e.requestNumber}`,adminMessage:`قام ${e.partnerName} بقبول الطلب.

رقم الطلب: ${e.requestNumber}
الشريك: ${e.partnerName}
الفرع: ${e.branchName}
العميل: ${e.customerName}
الخدمة: ${e.serviceName}`,customerSubject:`تم تأكيد طلبك - ${e.requestNumber}`,customerMessage:`تم تأكيد طلب الخدمة الخاص بك.

رقم الطلب: ${e.requestNumber}
الفرع: ${e.branchName}
الخدمة: ${e.serviceName}
العنوان: ${e.branchAddress}

سيتم التواصل معك قريباً لتنسيق الخدمة.`},en:{adminSubject:`Request Accepted - ${e.requestNumber}`,adminMessage:`${e.partnerName} has accepted the request.

Request Number: ${e.requestNumber}
Partner: ${e.partnerName}
Branch: ${e.branchName}
Customer: ${e.customerName}
Service: ${e.serviceName}`,customerSubject:`Your Request is Confirmed - ${e.requestNumber}`,customerMessage:`Your service request has been confirmed.

Request Number: ${e.requestNumber}
Branch: ${e.branchName}
Service: ${e.serviceName}
Address: ${e.branchAddress}

You will be contacted soon to coordinate the service.`}};s.logger.info("Attempting to send acceptance email to admin",{adminEmail:t,requestId:e.requestId});let o=await r.default.sendNotificationEmail(t,n[a].adminSubject,n[a].adminMessage,a);s.logger.info("Admin email result",{success:o.success,error:o.error,requestId:e.requestId});let u={success:!0};e.customerEmail&&!e.customerEmail.includes("external@system.internal")&&e.customerEmail.includes("@")?(s.logger.info("Attempting to send acceptance email to customer",{customerEmail:e.customerEmail,requestId:e.requestId}),u=await r.default.sendNotificationEmail(e.customerEmail,n[a].customerSubject,n[a].customerMessage,a),s.logger.info("Customer email result",{success:u.success,requestId:e.requestId})):s.logger.info("Skipping customer email (invalid or system email)",{customerEmail:e.customerEmail,requestId:e.requestId});let i=o.success&&u.success;return i?s.logger.info("Request accepted emails sent",{requestId:e.requestId,recipients:[t,e.customerEmail]}):s.logger.error("Failed to send some acceptance emails",{requestId:e.requestId,adminResult:o,customerResult:u}),{success:i,error:i?void 0:`Admin: ${o.error||"OK"}, Customer: ${u.success?"OK":"Failed"}`}}catch(r){return s.logger.error("Failed to send request accepted emails",{error:r,requestId:e.requestId}),{success:!1,error:r instanceof Error?r.message:"Unknown error"}}}async sendRequestRejectedEmail(e,t,a="en"){try{let n={ar:{subject:`تم رفض الطلب - ${e.requestNumber}`,message:`قام ${e.partnerName} برفض الطلب.

رقم الطلب: ${e.requestNumber}
الشريك: ${e.partnerName}
الفرع: ${e.branchName}
العميل: ${e.customerName}
الخدمة: ${e.serviceName}

سبب الرفض: ${e.rejectionReason||"لم يتم تحديد السبب"}

يرجى إعادة تعيين الطلب لشريك آخر.`},en:{subject:`Request Rejected - ${e.requestNumber}`,message:`${e.partnerName} has rejected the request.

Request Number: ${e.requestNumber}
Partner: ${e.partnerName}
Branch: ${e.branchName}
Customer: ${e.customerName}
Service: ${e.serviceName}

Rejection Reason: ${e.rejectionReason||"No reason provided"}

Please reassign the request to another partner.`}},o=await r.default.sendNotificationEmail(t,n[a].subject,n[a].message,a);return o.success&&s.logger.info("Request rejected email sent",{requestId:e.requestId,recipient:t}),o}catch(r){return s.logger.error("Failed to send request rejected email",{error:r,requestId:e.requestId}),{success:!1,error:r instanceof Error?r.message:"Unknown error"}}}getStatusEmailContent(e,r){return({in_progress:{ar:{customerSubject:`العمل جارٍ على طلبك - ${r.requestNumber}`,customerMessage:`بدأ ${r.partnerName} العمل على طلب الخدمة الخاص بك.

رقم الطلب: ${r.requestNumber}
الشريك: ${r.partnerName}
الفرع: ${r.branchName}
الخدمة: ${r.serviceName}

${r.notes?`ملاحظات: ${r.notes}

`:""}سيتم التواصل معك قريباً بشأن أي تحديثات.`,adminSubject:`بدأ العمل على الطلب - ${r.requestNumber}`,adminMessage:`بدأ ${r.partnerName} العمل على الطلب.

رقم الطلب: ${r.requestNumber}
الشريك: ${r.partnerName}
الفرع: ${r.branchName}
العميل: ${r.customerName}
الخدمة: ${r.serviceName}

${r.notes?`ملاحظات: ${r.notes}`:"الحالة: قيد التنفيذ"}`},en:{customerSubject:`Work Started on Your Request - ${r.requestNumber}`,customerMessage:`${r.partnerName} has started working on your service request.

Request Number: ${r.requestNumber}
Partner: ${r.partnerName}
Branch: ${r.branchName}
Service: ${r.serviceName}

${r.notes?`Notes: ${r.notes}

`:""}You will be contacted soon with any updates.`,adminSubject:`Work Started on Request - ${r.requestNumber}`,adminMessage:`${r.partnerName} has started working on the request.

Request Number: ${r.requestNumber}
Partner: ${r.partnerName}
Branch: ${r.branchName}
Customer: ${r.customerName}
Service: ${r.serviceName}

${r.notes?`Notes: ${r.notes}`:"Status: In Progress"}`}},completed:{ar:{customerSubject:`اكتمل طلبك - ${r.requestNumber}`,customerMessage:`أكمل ${r.partnerName} طلب الخدمة الخاص بك.

رقم الطلب: ${r.requestNumber}
الشريك: ${r.partnerName}
الفرع: ${r.branchName}
الخدمة: ${r.serviceName}

${r.notes?`ملاحظات: ${r.notes}

`:""}يرجى تقييم تجربتك معنا!

سجل الدخول إلى حسابك لتقييم الخدمة.`,adminSubject:`اكتمل الطلب - ${r.requestNumber}`,adminMessage:`أكمل ${r.partnerName} العمل على الطلب.

رقم الطلب: ${r.requestNumber}
الشريك: ${r.partnerName}
الفرع: ${r.branchName}
العميل: ${r.customerName}
الخدمة: ${r.serviceName}

${r.notes?`ملاحظات: ${r.notes}

`:""}⚠️ تحتاج إلى التحقق: يرجى التأكد من العميل أن الخدمة اكتملت بشكل مرضٍ.`},en:{customerSubject:`Your Request is Completed - ${r.requestNumber}`,customerMessage:`${r.partnerName} has completed your service request.

Request Number: ${r.requestNumber}
Partner: ${r.partnerName}
Branch: ${r.branchName}
Service: ${r.serviceName}

${r.notes?`Notes: ${r.notes}

`:""}Please rate your experience with us!

Log in to your account to rate the service.`,adminSubject:`Request Completed - ${r.requestNumber}`,adminMessage:`${r.partnerName} has completed work on the request.

Request Number: ${r.requestNumber}
Partner: ${r.partnerName}
Branch: ${r.branchName}
Customer: ${r.customerName}
Service: ${r.serviceName}

${r.notes?`Notes: ${r.notes}

`:""}⚠️ Verification Needed: Please confirm with customer that the service was completed satisfactorily.`}},confirmed:{ar:{customerSubject:`تم تأكيد طلبك - ${r.requestNumber}`,customerMessage:`قام ${r.partnerName} بتأكيد طلب الخدمة الخاص بك.

رقم الطلب: ${r.requestNumber}
الشريك: ${r.partnerName}
الفرع: ${r.branchName}
الخدمة: ${r.serviceName}
العنوان: ${r.branchAddress}

${r.notes?`ملاحظات: ${r.notes}

`:""}سيبدأ العمل على طلبك قريباً.`,adminSubject:`تأكيد الطلب - ${r.requestNumber}`,adminMessage:`قام ${r.partnerName} بتأكيد الطلب.

رقم الطلب: ${r.requestNumber}
الشريك: ${r.partnerName}
العميل: ${r.customerName}
الخدمة: ${r.serviceName}

${r.notes?`ملاحظات: ${r.notes}`:"الحالة: مؤكد"}`},en:{customerSubject:`Your Request is Confirmed - ${r.requestNumber}`,customerMessage:`${r.partnerName} has confirmed your service request.

Request Number: ${r.requestNumber}
Partner: ${r.partnerName}
Branch: ${r.branchName}
Service: ${r.serviceName}
Address: ${r.branchAddress}

${r.notes?`Notes: ${r.notes}

`:""}Work on your request will begin soon.`,adminSubject:`Request Confirmed - ${r.requestNumber}`,adminMessage:`${r.partnerName} has confirmed the request.

Request Number: ${r.requestNumber}
Partner: ${r.partnerName}
Customer: ${r.customerName}
Service: ${r.serviceName}

${r.notes?`Notes: ${r.notes}`:"Status: Confirmed"}`}},closed:{ar:{customerSubject:`تم إغلاق طلبك - ${r.requestNumber}`,customerMessage:`تم إغلاق طلب الخدمة الخاص بك.

رقم الطلب: ${r.requestNumber}
الشريك: ${r.partnerName}
الفرع: ${r.branchName}
الخدمة: ${r.serviceName}

${r.notes?`ملاحظات: ${r.notes}

`:""}شكراً لاستخدام خدماتنا!`,adminSubject:`تم إغلاق الطلب - ${r.requestNumber}`,adminMessage:`تم إغلاق الطلب.

رقم الطلب: ${r.requestNumber}
الشريك: ${r.partnerName}
العميل: ${r.customerName}
الخدمة: ${r.serviceName}

${r.notes?`ملاحظات: ${r.notes}`:"الحالة: مغلق"}`},en:{customerSubject:`Your Request is Closed - ${r.requestNumber}`,customerMessage:`Your service request has been closed.

Request Number: ${r.requestNumber}
Partner: ${r.partnerName}
Branch: ${r.branchName}
Service: ${r.serviceName}

${r.notes?`Notes: ${r.notes}

`:""}Thank you for using our services!`,adminSubject:`Request Closed - ${r.requestNumber}`,adminMessage:`The request has been closed.

Request Number: ${r.requestNumber}
Partner: ${r.partnerName}
Customer: ${r.customerName}
Service: ${r.serviceName}

${r.notes?`Notes: ${r.notes}`:"Status: Closed"}`}}})[e]||{ar:{customerSubject:`تحديث حالة الطلب - ${r.requestNumber}`,customerMessage:`تم تحديث حالة طلب الخدمة الخاص بك إلى: ${e}

رقم الطلب: ${r.requestNumber}
الشريك: ${r.partnerName}
الفرع: ${r.branchName}
الخدمة: ${r.serviceName}

${r.notes?`ملاحظات: ${r.notes}`:"سجل الدخول لعرض تفاصيل الطلب الكاملة."}`,adminSubject:`تحديث حالة الطلب - ${r.requestNumber}`,adminMessage:`تم تحديث حالة الطلب إلى: ${e}

رقم الطلب: ${r.requestNumber}
الشريك: ${r.partnerName}
العميل: ${r.customerName}
الخدمة: ${r.serviceName}

${r.notes?`ملاحظات: ${r.notes}`:`الحالة: ${e}`}`},en:{customerSubject:`Request Status Update - ${r.requestNumber}`,customerMessage:`Your service request status has been updated to: ${e}

Request Number: ${r.requestNumber}
Partner: ${r.partnerName}
Branch: ${r.branchName}
Service: ${r.serviceName}

${r.notes?`Notes: ${r.notes}`:"Log in to view full request details."}`,adminSubject:`Request Status Update - ${r.requestNumber}`,adminMessage:`The request status has been updated to: ${e}

Request Number: ${r.requestNumber}
Partner: ${r.partnerName}
Customer: ${r.customerName}
Service: ${r.serviceName}

${r.notes?`Notes: ${r.notes}`:`Status: ${e}`}`}}}async sendStatusChangeEmail(e,t,a,n="en"){try{let o=this.getStatusEmailContent(t,e),u={success:!0};e.customerEmail&&!e.customerEmail.includes("external@system.internal")&&e.customerEmail.includes("@")&&(s.logger.info(`Sending ${t} email to customer`,{customerEmail:e.customerEmail,requestId:e.requestId,status:t}),u=await r.default.sendNotificationEmail(e.customerEmail,o[n].customerSubject,o[n].customerMessage,n)),s.logger.info(`Sending ${t} email to admin`,{adminEmail:a,requestId:e.requestId,status:t});let i=await r.default.sendNotificationEmail(a,o[n].adminSubject,o[n].adminMessage,n),m=u.success&&i.success;return m&&s.logger.info(`${t} status emails sent successfully`,{requestId:e.requestId,recipients:[a,e.customerEmail],status:t}),{success:m,error:m?void 0:`Admin: ${i.error||"OK"}, Customer: ${u.success?"OK":"Failed"}`}}catch(r){return s.logger.error(`Failed to send ${t} status emails`,{error:r,requestId:e.requestId,status:t}),{success:!1,error:r instanceof Error?r.message:"Unknown error"}}}async sendTimerExpiredEmail(e,t,a="en"){try{let n={ar:{subject:`انتهت مهلة التأكيد - ${e.requestNumber}`,message:`انتهت المهلة المحددة لتأكيد الطلب من قبل ${e.partnerName}.

رقم الطلب: ${e.requestNumber}
الشريك: ${e.partnerName}
الفرع: ${e.branchName}
العميل: ${e.customerName}
الخدمة: ${e.serviceName}

يرجى إعادة تعيين الطلب لشريك آخر.`},en:{subject:`Confirmation Timer Expired - ${e.requestNumber}`,message:`The confirmation timer has expired for ${e.partnerName}.

Request Number: ${e.requestNumber}
Partner: ${e.partnerName}
Branch: ${e.branchName}
Customer: ${e.customerName}
Service: ${e.serviceName}

Please reassign the request to another partner.`}},o=await r.default.sendNotificationEmail(t,n[a].subject,n[a].message,a);return o.success&&s.logger.info("Timer expired email sent",{requestId:e.requestId,recipient:t}),o}catch(r){return s.logger.error("Failed to send timer expired email",{error:r,requestId:e.requestId}),{success:!1,error:r instanceof Error?r.message:"Unknown error"}}}async sendSlaTimeoutEmail(e){try{let t="";if(e.slaDeadline&&e.assignedAt){let r="string"==typeof e.slaDeadline?new Date(e.slaDeadline):e.slaDeadline,s="string"==typeof e.assignedAt?new Date(e.assignedAt):e.assignedAt,a=Math.round((r.getTime()-s.getTime())/6e4);t=`${a} minutes`}let a=`⏰ SLA Timeout Alert - Request ${e.requestNumber}`,n=`<div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9fafb; border-radius: 8px; direction: ltr;">
  <div style="background-color: #fff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <h2 style="color: #dc2626; margin-top: 0;">⏰ SLA Timeout Alert</h2>
    
    <p style="font-size: 16px; color: #374151; line-height: 1.6;">
      Request <strong style="color: #6366f1;">${e.requestNumber}</strong> has been automatically unassigned.
    </p>
    
    <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0;">
      <p style="margin: 0; color: #991b1b; font-weight: 500;">
        Partner <strong>${e.partnerName}</strong> did not respond within the ${t||"configured SLA"} deadline.
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
</div>`,o=`⏰ تنبيه انتهاء وقت الاستجابة - طلب ${e.requestNumber}`,u=`<div style="font-family: 'Tahoma', 'Arial Unicode MS', Arial, sans-serif; padding: 20px; background-color: #f9fafb; border-radius: 8px; direction: rtl; text-align: right;">
  <div style="background-color: #fff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <h2 style="color: #dc2626; margin-top: 0;">⏰ تنبيه انتهاء وقت الاستجابة</h2>
    
    <p style="font-size: 16px; color: #374151; line-height: 1.6;">
      تم إلغاء تعيين الطلب <strong style="color: #6366f1;">${e.requestNumber}</strong> تلقائياً.
    </p>
    
    <div style="background-color: #fef2f2; border-right: 4px solid #dc2626; padding: 15px; margin: 20px 0;">
      <p style="margin: 0; color: #991b1b; font-weight: 500;">
        الشريك <strong>${e.partnerName}</strong> لم يستجب خلال ${t?"المدة المحددة "+t:"المدة المحددة في معايير الخدمة"}.
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
</div>`,i=`${a} | ${o}`,m=`
        <div style="max-width: 600px; margin: 0 auto;">
          <h1 style="text-align: center; color: #dc2626; font-size: 20px; padding: 20px 0;">
            🚨 SLA Timeout / انتهاء وقت الاستجابة 🚨
          </h1>
          
          <!-- English Version -->
          ${n}
          
          <hr style="margin: 40px 0; border: none; border-top: 2px solid #e5e7eb;">
          
          <!-- Arabic Version -->
          ${u}
        </div>
      `,c=await r.default.sendEmail({to:e.recipients,subject:i,html:m});return c.success&&s.logger.info("SLA timeout email sent",{requestNumber:e.requestNumber,recipients:e.recipients,recipientCount:e.recipients.length}),c}catch(r){return s.logger.error("Failed to send SLA timeout email",{error:r,requestNumber:e.requestNumber}),{success:!1,error:r instanceof Error?r.message:"Unknown error"}}}async sendNotificationEmail(e,t,a,n="en"){try{let o=await r.default.sendNotificationEmail(e,t,a,n);return o.success&&s.logger.info("Notification email sent",{recipient:e,subject:t}),o}catch(r){return s.logger.error("Failed to send notification email",{error:r,recipient:e}),{success:!1,error:r instanceof Error?r.message:"Unknown error"}}}};e.s(["default",0,t])}];

//# sourceMappingURL=projects_ticketing-platform_lib_services_notificationService_ts_ac0ecab8._.js.map