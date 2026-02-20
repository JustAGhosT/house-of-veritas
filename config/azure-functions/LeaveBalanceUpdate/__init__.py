"""
House of Veritas - Azure Function: Leave Balance Update

Monthly update of employee leave balances.
Per BCEA: 15 days annual leave per year (1.25 days/month).

Trigger: Timer (Monthly 1st at 7:00 AM UTC)
Schedule: 0 0 7 1 * *

Leave Types:
- Annual Leave: 15 days/year (accrues 1.25 days/month)
- Sick Leave: 30 days per 3-year cycle
- Family Responsibility: 3 days/year
"""

import logging
from datetime import datetime
from decimal import Decimal
from typing import Dict

import azure.functions as func

import sys
sys.path.append("..")
from shared.utils import (
    BaserowClient, EmailClient, config, setup_logging,
    get_current_datetime, format_date, get_month_name
)

logger = setup_logging("leave-balance-update")

# BCEA Leave Constants
ANNUAL_LEAVE_PER_MONTH = Decimal("1.25")  # 15 days / 12 months
MAX_ANNUAL_LEAVE = Decimal("30")  # Maximum accumulation
SICK_LEAVE_3_YEAR = Decimal("30")  # 30 days per 3-year cycle
FAMILY_RESPONSIBILITY_PER_YEAR = Decimal("3")


def calculate_annual_leave_accrual(current_balance: Decimal) -> Decimal:
    """Calculate monthly annual leave accrual."""
    new_balance = current_balance + ANNUAL_LEAVE_PER_MONTH
    return min(new_balance, MAX_ANNUAL_LEAVE)


def update_employee_leave(
    baserow: BaserowClient,
    employee: Dict
) -> Dict:
    """Update leave balance for an employee."""
    employee_id = employee.get("id")
    employee_name = employee.get("Full Name", "Unknown")
    current_balance = Decimal(str(employee.get("Leave Balance", 0) or 0))
    
    # Calculate new balance
    new_balance = calculate_annual_leave_accrual(current_balance)
    accrued = new_balance - current_balance
    
    # Update in Baserow
    result = baserow.update_row(
        config.table_employees,
        employee_id,
        {"Leave Balance": float(new_balance)}
    )
    
    return {
        "employee_id": employee_id,
        "employee_name": employee_name,
        "previous_balance": float(current_balance),
        "accrued": float(accrued),
        "new_balance": float(new_balance),
        "updated": result is not None
    }


def send_employee_notification(
    email_client: EmailClient,
    employee: Dict,
    update_result: Dict,
    month: int,
    year: int
) -> bool:
    """Send leave balance notification to employee."""
    email = employee.get("Email")
    if not email:
        return False
    
    return email_client.send_template_email(
        email,
        "leave_balance_update",
        {
            "month": get_month_name(month),
            "year": year,
            "annual_leave": f"{update_result['new_balance']:.2f}",
            "sick_leave": "30",  # Full sick leave balance shown
            "family_leave": "3",  # Full family leave shown
            "baserow_url": config.baserow_url or "https://ops.houseofveritas.za"
        }
    )


def main(timer: func.TimerRequest) -> None:
    """Azure Function entry point."""
    logger.info("Leave balance update started")
    
    if timer.past_due:
        logger.warning("Timer is running late")
    
    baserow = BaserowClient()
    email_client = EmailClient()
    
    current_date = get_current_datetime()
    month = current_date.month
    year = current_date.year
    
    logger.info(f"Processing leave for {get_month_name(month)} {year}")
    
    # Get all active employees
    employees = baserow.get_employees(active_only=True)
    
    # Filter to only employees (not Owner or Resident)
    employees = [e for e in employees if e.get("Role") == "Employee"]
    logger.info(f"Processing {len(employees)} employees")
    
    updates = []
    
    for employee in employees:
        result = update_employee_leave(baserow, employee)
        updates.append(result)
        
        if result["updated"]:
            logger.info(
                f"{result['employee_name']}: {result['previous_balance']:.2f} + "
                f"{result['accrued']:.2f} = {result['new_balance']:.2f} days"
            )
            
            # Send individual notification
            send_employee_notification(email_client, employee, result, month, year)
    
    # Send summary to admin
    if updates:
        summary_lines = [
            f"  - {u['employee_name']}: {u['new_balance']:.2f} days (+{u['accrued']:.2f})"
            for u in updates
        ]
        
        email_client.send_email(
            config.admin_email,
            f"Leave Balance Update - {get_month_name(month)} {year}",
            f"""
House of Veritas - Monthly Leave Balance Update

Month: {get_month_name(month)} {year}
Employees Updated: {len(updates)}

Leave Balance Summary:
{chr(10).join(summary_lines)}

Notes:
- Annual leave accrues at 1.25 days/month (15 days/year per BCEA)
- Maximum accumulation: 30 days
- Sick leave: 30 days per 3-year cycle
- Family responsibility: 3 days/year

---
This is an automated notification from House of Veritas.
"""
        )
    
    logger.info(f"Leave balance update complete. Updated {len(updates)} employees.")
