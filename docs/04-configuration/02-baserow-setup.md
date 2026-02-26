# Baserow Configuration - House of Veritas

## Overview

Baserow is the operational data management platform for House of Veritas, accessible at `ops.nexamesh.ai`.

## Initial Setup

### 1. First Login

After deployment, access Baserow at your configured URL and create the admin account:

- **Email:** <hans@nexamesh.ai>
- **Name:** Hans (Owner)
- **Role:** Admin

### 2. Create Workspace

Create a new workspace: **"House of Veritas Operations"**

### 3. Database Structure

Create a new database within the workspace with the 17 tables as defined below.

## Database Schema

### Table 1: Employees

| Field                 | Type          | Options/Notes                |
| --------------------- | ------------- | ---------------------------- |
| ID                    | Auto Number   | Primary Key                  |
| Full Name             | Text          | Required                     |
| ID Number             | Text          | Unique                       |
| Role                  | Single Select | Owner, Employee, Resident    |
| Employment Start Date | Date          |                              |
| Probation Status      | Single Select | In Probation, Completed, N/A |
| Contract Ref          | URL           | Link to DocuSeal             |
| Leave Balance         | Number        | Days remaining               |
| Email                 | Email         |                              |
| Phone                 | Phone Number  |                              |
| Photo                 | File          |                              |
| Active                | Boolean       | Default: true                |

### Table 2: Assets

| Field           | Type              | Options/Notes                       |
| --------------- | ----------------- | ----------------------------------- |
| ID              | Auto Number       | Primary Key                         |
| Asset ID        | Text              | Unique (e.g., WS-001, VH-001)       |
| Type            | Single Select     | Tool, Vehicle, Equipment, Household |
| Description     | Long Text         |                                     |
| Purchase Date   | Date              |                                     |
| Purchase Price  | Number            | Currency: ZAR                       |
| Condition       | Single Select     | Excellent, Good, Fair, Poor         |
| Location        | Single Select     | Workshop, Garden, House, Garage     |
| Checked Out By  | Link to Employees |                                     |
| Check Out Date  | Date              |                                     |
| Expected Return | Date              |                                     |
| Photo           | File              |                                     |
| Notes           | Long Text         |                                     |

### Table 3: Tasks

| Field            | Type              | Options/Notes                                |
| ---------------- | ----------------- | -------------------------------------------- |
| ID               | Auto Number       | Primary Key                                  |
| Title            | Text              | Required                                     |
| Description      | Long Text         |                                              |
| Assigned To      | Link to Employees |                                              |
| Due Date         | Date              |                                              |
| Priority         | Single Select     | Low, Medium, High, Urgent                    |
| Status           | Single Select     | Not Started, In Progress, Blocked, Completed |
| Time Spent       | Number            | Hours                                        |
| Completion Notes | Long Text         |                                              |
| Related Asset    | Link to Assets    |                                              |
| Project          | Text              |                                              |
| Is Recurring     | Boolean           |                                              |
| Recurrence       | Single Select     | Daily, Weekly, Monthly, Quarterly            |
| Created Date     | Created On        | Auto                                         |
| Completed Date   | Date              |                                              |

### Table 4: Time Clock Entries

| Field           | Type              | Options/Notes                             |
| --------------- | ----------------- | ----------------------------------------- |
| ID              | Auto Number       | Primary Key                               |
| Employee        | Link to Employees | Required                                  |
| Date            | Date              | Required                                  |
| Clock In        | Time              |                                           |
| Clock Out       | Time              |                                           |
| Break Duration  | Number            | Minutes                                   |
| Total Hours     | Formula           | `(Clock Out - Clock In - Break) / 60`     |
| Overtime Hours  | Formula           | `IF(Total Hours > 9, Total Hours - 9, 0)` |
| Approval Status | Single Select     | Pending, Approved, Rejected               |
| Approved By     | Link to Employees | Hans only                                 |
| Notes           | Text              |                                           |

### Table 5: Incidents

| Field               | Type              | Options/Notes                                          |
| ------------------- | ----------------- | ------------------------------------------------------ |
| ID                  | Auto Number       | Primary Key                                            |
| Type                | Single Select     | Safety, Equipment Damage, Vehicle, Household, Security |
| Date Time           | Date Time         |                                                        |
| Location            | Text              |                                                        |
| Reporter            | Link to Employees |                                                        |
| Description         | Long Text         | Required                                               |
| Witnesses           | Text              |                                                        |
| Severity            | Single Select     | Low, Medium, High, Critical                            |
| Status              | Single Select     | Reported, Investigating, Resolved, Closed              |
| Investigation Notes | Long Text         |                                                        |
| Actions Taken       | Long Text         |                                                        |
| Related Employee    | Link to Employees | If applicable                                          |
| Related Asset       | Link to Assets    | If applicable                                          |
| Photos              | File              | Multiple                                               |
| Resolution Date     | Date              |                                                        |

### Table 6: Vehicle Logs

| Field           | Type              | Options/Notes                   |
| --------------- | ----------------- | ------------------------------- |
| ID              | Auto Number       | Primary Key                     |
| Driver          | Link to Employees | Required                        |
| Vehicle         | Link to Assets    | Filtered: Type = Vehicle        |
| Date Out        | Date Time         |                                 |
| Date In         | Date Time         |                                 |
| Odometer Start  | Number            | km                              |
| Odometer End    | Number            | km                              |
| Distance        | Formula           | `Odometer End - Odometer Start` |
| Fuel Added      | Number            | Liters                          |
| Fuel Cost       | Number            | ZAR                             |
| Purpose         | Text              |                                 |
| Child Passenger | Boolean           | BCEA Compliance                 |
| Child Seat Used | Boolean           | If Child Passenger = true       |
| Pre-Trip Check  | Boolean           |                                 |
| Notes           | Text              |                                 |

### Table 7: Expenses

| Field           | Type              | Options/Notes                                                                                  |
| --------------- | ----------------- | ---------------------------------------------------------------------------------------------- |
| ID              | Auto Number       | Primary Key                                                                                    |
| Requester       | Link to Employees |                                                                                                |
| Type            | Single Select     | Request (Pre-approval), Post-Hoc (Reimbursement)                                               |
| Category        | Single Select     | Materials, Labor, Fuel, Maintenance, Supplies, Food, Transport, Utilities, Professional, Other |
| Amount          | Number            | ZAR                                                                                            |
| Vendor          | Text              |                                                                                                |
| Date            | Date              |                                                                                                |
| Approval Status | Single Select     | Pending, Pending Secondary, Approved, Rejected, Post-Hoc Approved                             |
| Receipt         | File              | Required for reimbursement                                                                     |
| Project         | Text              |                                                                                                |
| Milestone       | Single Select     | Deposit, Stage 1, Stage 2, Stage 3, Final, N/A                                                 |
| Notes           | Long Text         |                                                                                                |
| Approver        | Link to Employees | Hans                                                                                           |
| Approval Date   | Date              |                                                                                                |
| Payment Status  | Single Select     | Unpaid, Paid                                                                                   |
| Payment Date    | Date              |                                                                                                |
| Secondary Approver | Link to Employees | For amounts over R5000 |
| Secondary Approval Date | Date        |                                                                                                |

### Table 8: Document Expiry

| Field             | Type              | Options/Notes                                  |
| ----------------- | ----------------- | ---------------------------------------------- |
| ID                | Auto Number       | Primary Key                                    |
| Doc Name          | Text              |                                                |
| Type              | Single Select     | Governance, HR, Safety, Operations, Compliance |
| Party Responsible | Link to Employees |                                                |
| Last Review       | Date              |                                                |
| Next Review       | Date              |                                                |
| Renewal Cycle     | Single Select     | Annual, 2-Year, 3-Year, 5-Year                 |
| Alert Schedule    | Text              | e.g., "60d, 30d, 7d"                           |
| Status            | Formula           | Based on Next Review date                      |
| DocuSeal Ref      | URL               | Link to signed document                        |
| Superseded By     | Link to Document Expiry | For version diffusion block              |
| Version Blocked   | Boolean           | Lock superseded docs                           |
| Notes             | Long Text         |                                                |

### Table 9: Leave Requests

| Field           | Type              | Options/Notes                          |
| --------------- | ----------------- | -------------------------------------- |
| ID              | Auto Number       | Primary Key                            |
| Employee        | Link to Employees | Required                               |
| Start Date      | Date              |                                        |
| End Date        | Date              |                                        |
| Type            | Single Select     | Annual, Sick, Family Responsibility, Unpaid, Other |
| Status          | Single Select     | Pending, Approved, Rejected             |
| Approver        | Link to Employees | Hans                                   |
| Approved At     | Date              |                                        |
| Submitted At    | Date              |                                        |
| Notes           | Long Text         |                                        |

### Table 10: Loans/Advances

| Field              | Type              | Options/Notes                          |
| ------------------ | ----------------- | -------------------------------------- |
| ID                 | Auto Number       | Primary Key                            |
| Employee           | Link to Employees | Required                               |
| Amount             | Number            | ZAR                                    |
| Purpose            | Text              |                                        |
| Repayment Schedule | Long Text         | JSON or schedule description           |
| Status             | Single Select     | Pending, Approved, Rejected, Active, Repaid |
| Outstanding Balance| Number            | ZAR                                    |
| Next Repayment Date| Date              | For reminder/overdue workflows         |
| Approved By        | Link to Employees |                                        |
| Approved At        | Date              |                                        |
| Disbursed At       | Date              |                                        |
| Created At         | Date              |                                        |
| Notes              | Long Text         |                                        |

### Table 11: Petty Cash

| Field           | Type              | Options/Notes                                                                 |
| --------------- | ----------------- | ----------------------------------------------------------------------------- |
| ID              | Auto Number       | Primary Key                                                                   |
| Requester       | Link to Employees | Required                                                                      |
| Amount          | Number            | ZAR                                                                           |
| Purpose         | Text              |                                                                               |
| Receipt         | File              | Required for reconciliation                                                   |
| Status          | Single Select     | Pending, Approved, Rejected, Issued — workflow: request → approval → disbursement |
| Issued By       | Link to Employees | Disbursement actor; who physically issued the cash when Status = Issued       |
| Issued At       | Date              | When cash was disbursed                                                       |
| Approved By     | Link to Employees | Authorisation actor; required when Status = Approved or Issued                |
| Approved At     | Date              | When approval was granted (authorisation timestamp)                           |
| Created At      | Date              |                                                                               |
| Notes           | Long Text         |                                                                               |

### Table 12: Onboarding Checklist

| Field           | Type              | Options/Notes                   |
| --------------- | ----------------- | ------------------------------- |
| ID              | Auto Number       | Primary Key                     |
| Employee        | Link to Employees | Required                        |
| Items           | Long Text         | JSON array of checklist items   |
| Completed At    | Date              | When checklist fully completed  |
| Assigned Buddy  | Link to Employees | Mentor for new hire             |
| Status          | Single Select     | In Progress, Completed          |
| Created At      | Date              |                                 |
| Notes           | Long Text         |                                 |

### Table 13: Budget

| Field           | Type              | Options/Notes                   |
| --------------- | ----------------- | ------------------------------- |
| ID              | Auto Number       | Primary Key                     |
| Category        | Single Select     | Materials, Labor, Fuel, Maintenance, Supplies, Food, Transport, Utilities, Professional, Other |
| Amount          | Number            | ZAR                             |
| Period          | Text              | e.g., "2024" or "2024-Q1"       |
| Version         | Number            | For amendment tracking          |
| Status          | Single Select     | Draft, Active, Superseded       |
| Approved By     | Link to Employees |                                 |
| Approved At     | Date              |                                 |
| DocuSeal Ref    | URL               | For signoff on amendments       |
| Notes           | Long Text         |                                 |

### Table 14: PPE/Equipment

| Field           | Type              | Options/Notes                   |
| --------------- | ----------------- | ------------------------------- |
| ID              | Auto Number       | Primary Key                     |
| Asset           | Link to Assets    | PPE asset                       |
| Issued To       | Link to Employees | Required                        |
| Issue Date      | Date              |                                 |
| Expiry Date     | Date              | For maintenance/expiry alerts   |
| Return Date     | Date              | When returned                   |
| Status          | Single Select     | Issued, Returned, Expired       |
| Notes           | Long Text         |                                 |

### Table 15: Policy Versions

| Field           | Type              | Options/Notes                   |
| --------------- | ----------------- | ------------------------------- |
| ID              | Auto Number       | Primary Key                     |
| Document        | Link to Document Expiry | Policy document               |
| Version         | Text              | e.g., "1.2"                     |
| Effective Date  | Date              |                                 |
| Superseded By   | Link to Policy Versions | Next version            |
| Status          | Single Select     | Current, Superseded             |
| DocuSeal Ref    | URL               | Signed version                  |
| Notes           | Long Text         |                                 |

### Table 16: Insurance Claims

| Field           | Type              | Options/Notes                   |
| --------------- | ----------------- | ------------------------------- |
| ID              | Auto Number       | Primary Key                     |
| Incident        | Link to Incidents | If from incident                |
| Asset           | Link to Assets    | If asset loss/damage            |
| Description     | Long Text         |                                 |
| Amount          | Number            | ZAR                             |
| Status          | Single Select     | Draft, Submitted, Under Review, Approved, Denied |
| Claim ID        | Text              | External insurer reference      |
| Submitted At    | Date              |                                 |
| Created At      | Date              |                                 |
| Notes           | Long Text         |                                 |

### Table 17: Contractor Contracts

| Field           | Type              | Options/Notes                   |
| --------------- | ----------------- | ------------------------------- |
| ID              | Auto Number       | Primary Key                     |
| Contractor      | Text              | Contractor or vendor name (free-form; external contractors not in Employees) |
| Project         | Text              |                                 |
| Milestones      | Long Text         | JSON array of milestone dates   |
| Amounts         | Long Text         | JSON array of milestone amounts |
| Status          | Single Select     | Active, Completed, Terminated   |
| Start Date      | Date              |                                 |
| End Date        | Date              |                                 |
| Notes           | Long Text         |                                 |

## Extended Fields (Existing Tables)

### Table 2: Assets (extended)

| Field                 | Type              | Options/Notes                       |
| --------------------- | ----------------- | ----------------------------------- |
| Late Return Lockout Until | Date          | Block checkout until resolved       |

### Table 5: Incidents (extended)

| Field                 | Type              | Options/Notes                       |
| --------------------- | ----------------- | ----------------------------------- |
| Related Incident IDs  | Long Text         | Link to repeat incidents (JSON IDs) |
| Victim Support Path   | Boolean           | Route to external arbiter           |

### Table 1: Employees (extended)

| Field                 | Type              | Options/Notes                       |
| --------------------- | ----------------- | ----------------------------------- |
| Onboarding Status     | Single Select     | Not Started, In Progress, Completed  |
| Buddy                 | Lookup            | Via reverse link from Table 12; look up "Assigned Buddy" (single source of truth) |
| IT Provisioned At     | Date              | When IT accounts created            |

**Buddy field setup:** Table 12 (Onboarding Checklist) links to Employees via "Employee". Baserow creates a reverse link on Employees (e.g. "Onboarding Checklist"). Add a Lookup field "Buddy" on Employees: select the reverse link field, then look up "Assigned Buddy". This ensures the mentor is sourced only from Table 12, avoiding data drift.

**Migration (if Table 1 already has a "Buddy" Link field):**

1. Remove the "Buddy" Link field from Table 1 (Employees).
2. Add a Lookup field "Buddy" on Employees: use the reverse link from Onboarding Checklist (Employee) and look up "Assigned Buddy".

## Views Configuration

### Hans (Admin) Views

- **All Employees** - Full access to all fields
- **All Tasks** - Full access, sorted by priority/due date
- **Pending Approvals** - Filtered: Approval Status = Pending
- **Budget Overview** - Expenses aggregated by category
- **Document Compliance** - All documents with expiry status

### Charl (Employee) Views

- **My Tasks** - Filtered: Assigned To = Charl
- **My Time Entries** - Filtered: Employee = Charl
- **Asset Checkout** - Limited fields for check-in/out

### Lucky (Employee) Views

- **My Tasks** - Filtered: Assigned To = Lucky
- **My Time Entries** - Filtered: Employee = Lucky
- **My Expenses** - Filtered: Requester = Lucky
- **Vehicle Logs** - Filtered: Driver = Lucky

### Irma (Resident) Views

- **Household Tasks** - Filtered: Project = Household
- **My Documents** - Filtered: Party Responsible = Irma

## API Configuration

### Generate API Tokens

For each user, generate an API token:

1. Log in as the user
2. Navigate to Settings → API Tokens
3. Generate token with appropriate permissions
4. Store in Azure Key Vault

### API Endpoints

Base URL: `https://ops.nexamesh.ai/api`

| Endpoint                                  | Method | Description        |
| ----------------------------------------- | ------ | ------------------ |
| `/api/database/tables/`                   | GET    | List all tables    |
| `/api/database/rows/table/{id}/`          | GET    | List rows in table |
| `/api/database/rows/table/{id}/`          | POST   | Create new row     |
| `/api/database/rows/table/{id}/{row_id}/` | PATCH  | Update row         |
| `/api/database/rows/table/{id}/{row_id}/` | DELETE | Delete row         |

## Testing Checklist

- [ ] Admin workspace created
- [ ] All 17 tables created with correct fields
- [ ] Relationships (links) working correctly
- [ ] Formulas calculating correctly
- [ ] All 4 users can log in
- [ ] User-specific views configured
- [ ] API tokens generated and stored
- [ ] SMTP email notifications working
