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

Create a new database within the workspace with the 8 core tables as defined below.

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
| Approval Status | Single Select     | Pending, Approved, Rejected, Post-Hoc Approved                                                 |
| Receipt         | File              | Required for reimbursement                                                                     |
| Project         | Text              |                                                                                                |
| Milestone       | Single Select     | Deposit, Stage 1, Stage 2, Stage 3, Final, N/A                                                 |
| Notes           | Long Text         |                                                                                                |
| Approver        | Link to Employees | Hans                                                                                           |
| Approval Date   | Date              |                                                                                                |
| Payment Status  | Single Select     | Unpaid, Paid                                                                                   |
| Payment Date    | Date              |                                                                                                |

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
| Notes             | Long Text         |                                                |

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
- [ ] All 8 tables created with correct fields
- [ ] Relationships (links) working correctly
- [ ] Formulas calculating correctly
- [ ] All 4 users can log in
- [ ] User-specific views configured
- [ ] API tokens generated and stored
- [ ] SMTP email notifications working
