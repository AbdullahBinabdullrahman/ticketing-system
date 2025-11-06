# Ticketing System Presentation
**Classification:** Internal  

---

## Slide 1 — Summary
**Classification:** Internal  

### Summary
- This system is designed to help our company evaluate which partners are suitable for full system integration.  
- The process will initially be manual, involving both the Operations team and the partners.  
- Customers will submit service requests through the mobile application, which will then appear in the operations portal.  
- The Operations team will review each request and assign it to the most appropriate partner.  
- Once assigned, the ticket will appear in the partner’s portal, where the partner can approve the request and update its status throughout the process.  
- After the partner completes the task, the Operations team will verify the outcome with the customer and mark the ticket as **“Solved.”**  
- By following this workflow, we can effectively assess partner performance and determine which partners are suitable for full system integration in the future.  

---

## Slide 2 — Mobile App User Stories
**Classification:** Internal  

### Mobile App User Stories
1. As a **Customer**, I want to **view available service categories** (e.g., Car Maintenance, Tires) so I can select the correct type of service.  
2. As a **Customer**, I want to **see a list of services** under each category (e.g., Oil Change, Filter Change).  
3. As a **Customer**, I want to **select my preferred pickup option** (Pickup, Drop-off, etc.) so I can choose the most convenient service method.  
4. As a **Customer**, I want to **submit a service request** easily through the app.  
5. As a **Customer**, I want the system to **detect or let me enter my location** to help assign the nearest partner branch.  
6. As a **Customer**, I want to **track my request status** (e.g., Submitted, In Progress, Completed).  
7. As a **Customer**, I want to **receive notifications** about updates to my request (e.g., accepted by partner, completed).  
8. As a **Customer**, I want to **rate or give feedback** on the service after it’s completed.  

---

## Slide 3 — Partner Portal User Stories
**Classification:** Internal  

### Partner Portal User Stories
1. As a **Partner**, I want to **receive notifications** when a new request is assigned to me or one of my branches.  
2. As a **Partner**, I want to **view which branch** the request is assigned to.  
3. As a **Partner**, I want to **accept or reject** the request within the allowed time window.  
4. As a **Partner**, I want to **update the request status** (Confirmed → In Progress → Completed).  
5. As a **Partner**, I want to **view service and customer details.**  
6. As a **Partner**, I want to **view my performance metrics** (jobs completed, rejection rate, average handling time).  

---

## Slide 4 — Portal Admin User Stories
**Classification:** Internal  

### Portal Admin User Stories
1. As a **Portal Admin**, I want to **receive notifications** when a new request is submitted.  
2. As a **Portal Admin**, I want to **view all pending and active requests** with customer and service details.  
3. As a **Portal Admin**, I want to **assign requests to available partners** based on category, service, and nearest branch to customer location.  
4. As a **Portal Admin**, I want to **see all branches for each partner** when assigning a request so I can pick the most suitable one.  
5. As a **Portal Admin**, I want to **be notified if a partner rejects a request** so I can reassign it quickly.  
6. As a **Portal Admin**, I want to **verify completion** of a request by contacting the customer before closing it.  
7. As a **Portal Admin**, I want to **close completed requests** once confirmed.  
8. As a **Portal Admin**, I want to **add, edit, or remove partners.**  
9. As a **Portal Admin**, I want to **define which pickup options** are available for each partner.  
10. As a **Portal Admin**, I want to **add and manage partner branches**, including their **location coordinates** (latitude/longitude) and contact details.  
11. As a **Portal Admin**, I want to **add, edit, or remove service categories and services** (either individually or via bulk upload).  
12. As a **Portal Admin**, I want to **configure time limits** for partners to confirm or reject requests (default 15 minutes, customizable).  
13. As a **Portal Admin**, I want to **view detailed reports** to monitor performance and operations.  
14. As a **Portal Admin**, I want to **view system logs and analytics** (e.g., partner response time, completion time, rejection rates).  

---

## Slide 5 — Mobile Flow
**Classification:** Internal  

### Mobile Flow (Mermaid Diagram)
```mermaid
flowchart TD
    A[Mobile Flow] --> B[The customer selects a Pickup Option: 1- Pickup only, 2- Pickup and return, 3- Emergency Pickup, 4- Drop-off In Center, 5- Service At Location]
    B --> C{Customer Select Option<br/>(Service At Location or Drop-off In Center)}
    C -->|No| D[Submit Request to Portal]
    C -->|Yes| E[Select Service<br/>(Change Oil, Change Filter, etc...)]
    E --> D
    D --> F[Track the Submitted Request over the mobile app]
    F --> G[Done]
```

---

## Slide 6 — Portal Flow
**Classification:** Internal  

### Portal Flow (Mermaid Diagram)
```mermaid
flowchart TD
    A[Portal Flow] --> B[The Portal Admin selects a Service Category<br/>(e.g., Car Maintenance, Tires)]
    B --> C[All Submitted Requests appear in the portal<br/>with full Customer and Request Details]
    C --> D[Offline Operations Team contacts customer or partner<br/>and assigns the request to a Partner Branch based on location]
    D --> E[The Partner opens the portal and confirms or rejects the request]
    E --> F{Partner Confirm The Request}
    F -->|No| G[Request becomes unassigned<br/>Notification sent to Portal Admin]
    G --> C
    F -->|Yes| H[Partner continues to update request status<br/>(In Progress, Completed)]
    H --> I[After request marked Done, Offline Operations Team follows up with customer and closes the request]
    I --> J[Done]
```

---

## Slide 7 — Reports
**Classification:** Internal  

### Reports Module
The Portal will include a **Reports Module** accessible to Portal Admins and optionally Super Admins.  

#### Key Reports:
1. **Requests Report**
   - Total requests by date range, category, partner, and status.  
   - Average time from assignment to completion.  
   - Percentage of rejected vs. accepted requests.  

2. **Partner Performance Report**
   - Partner confirmation time (average).  
   - Partner completion time (average).  
   - Rejection rate.  
   - Number of completed requests per branch.  

3. **Branch Efficiency Report**
   - Requests handled per branch.  
   - Average customer distance per branch assignment.  
   - Completion rate and average service time by branch.  

4. **Customer Satisfaction Report** *(if rating feature is added)*  
   - Average ratings per partner/branch.  
   - Feedback summary.  

5. **Operational Logs Report**
   - Actions timeline (assignments, confirmations, rejections).  
   - SLA breaches (requests not confirmed within 15 min).  
   - Exportable audit trail (CSV/Excel).  

---

## Slide 8 — Important Notes
**Classification:** Internal  

### Important Notes
1. Partners **must confirm or reject requests within 15 minutes** (configurable per company).  
2. **Portal Admins** can add, edit, or remove **partners, categories, branches, and services.**  
3. Each **Partner** belongs to one or more **service categories** and can have **multiple branches** (each with location details).  
4. Each **Branch** can have independent **contact info and service areas** (based on geolocation radius).  
5. The system will **suggest the nearest partner branch** based on the customer’s coordinates when assigning a request.  
6. The **portal theme** follows the company’s color scheme (**orange and white**).  
7. The system will **log all actions** (creation, assignment, confirmation, rejection, completion, closure).  
8. Include **automatic partner reminders** (e.g., at 10 minutes).  
9. **Reports and logs** must be **exportable to Excel/CSV** for auditing.  
10. **Portal Admin** defines **pickup options per partner.**  
11. **Multi-language support** (English, Arabic).  

---

## Slide 9 — Thank You
**Classification:** Internal  
