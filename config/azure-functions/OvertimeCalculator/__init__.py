"""
House of Veritas - Azure Function: Overtime Calculator

Calculates weekly overtime for employees based on time clock entries.
Per BCEA: Standard week is 45 hours. Overtime is paid at 1.5x (weekday) or 2x (Sunday).

Trigger: Timer (Weekly Sunday at 11:00 PM UTC)
Schedule: 0 0 23 * * 0

Calculations:
- Regular hours: Up to 45 hours/week
- Overtime: Hours exceeding 45/week
- Sunday work: Paid at 2x rate
"""

import logging
from datetime import datetime, timedelta
from typing import List, Dict, Tuple
from decimal import Decimal

import azure.functions as func

import sys
sys.path.append("..")
from shared.utils import (
    BaserowClient, EmailClient, config, setup_logging,
    get_current_datetime, format_date, get_week_range
)

logger = setup_logging("overtime-calculator")

# BCEA Constants
STANDARD_HOURS_PER_WEEK = 45
OVERTIME_RATE_WEEKDAY = Decimal("1.5")
OVERTIME_RATE_SUNDAY = Decimal("2.0")
ASSUMED_HOURLY_RATE = Decimal("80")  # R80/hour - update per employee


def get_time_entries_for_week(
    baserow: BaserowClient,
    employee_id: int,
    week_start: datetime.date,
    week_end: datetime.date
) -> List[Dict]:
    """Get time clock entries for an employee for the week."""
    # In production, use date range filter
    all_entries = baserow.list_rows(config.table_time_clock, size=500)
    
    employee_entries = []
    for entry in all_entries:
        # Check if this entry belongs to the employee
        assigned = entry.get("Employee")
        if isinstance(assigned, list) and assigned:
            if assigned[0].get("id") == employee_id:
                # Check if entry is within the week
                entry_date = entry.get("Date", "")
                if entry_date:
                    try:
                        date = datetime.strptime(entry_date, "%Y-%m-%d").date()
                        if week_start <= date <= week_end:
                            entry["_parsed_date"] = date
                            employee_entries.append(entry)
                    except ValueError:
                        pass
    
    return employee_entries


def calculate_hours_from_entry(entry: Dict) -> Tuple[Decimal, bool]:
    """Calculate hours worked from a time entry. Returns (hours, is_sunday)."""
    clock_in = entry.get("Clock In", "")
    clock_out = entry.get("Clock Out", "")
    break_minutes = Decimal(str(entry.get("Break Duration", 0) or 0))
    
    if not clock_in or not clock_out:
        return Decimal("0"), False
    
    try:
        # Parse times (assuming HH:MM format)
        in_time = datetime.strptime(clock_in, "%H:%M")
        out_time = datetime.strptime(clock_out, "%H:%M")
        
        # Handle overnight shifts
        if out_time < in_time:
            out_time += timedelta(days=1)
        
        # Calculate total minutes
        total_minutes = (out_time - in_time).seconds / 60
        work_minutes = total_minutes - float(break_minutes)
        hours = Decimal(str(work_minutes / 60))
        
        # Check if Sunday
        entry_date = entry.get("_parsed_date")
        is_sunday = entry_date.weekday() == 6 if entry_date else False
        
        return max(Decimal("0"), hours), is_sunday
    except ValueError:
        return Decimal("0"), False


def calculate_overtime(
    entries: List[Dict],
    hourly_rate: Decimal = ASSUMED_HOURLY_RATE
) -> Dict:
    """Calculate overtime for a set of time entries."""
    total_hours = Decimal("0")
    sunday_hours = Decimal("0")
    
    for entry in entries:
        hours, is_sunday = calculate_hours_from_entry(entry)
        total_hours += hours
        if is_sunday:
            sunday_hours += hours
    
    # Calculate overtime
    regular_hours = min(total_hours, Decimal(str(STANDARD_HOURS_PER_WEEK)))
    overtime_hours = max(Decimal("0"), total_hours - Decimal(str(STANDARD_HOURS_PER_WEEK)))
    
    # Sunday hours are always at 2x, even within regular hours
    # For simplicity, we'll calculate sunday bonus separately
    sunday_bonus = sunday_hours * (OVERTIME_RATE_SUNDAY - 1) * hourly_rate
    
    # Regular overtime (weekday) calculation
    weekday_overtime_hours = max(Decimal("0"), overtime_hours - sunday_hours)
    weekday_overtime_cost = weekday_overtime_hours * OVERTIME_RATE_WEEKDAY * hourly_rate
    
    # Sunday overtime
    sunday_overtime_cost = sunday_hours * OVERTIME_RATE_SUNDAY * hourly_rate
    
    total_overtime_cost = weekday_overtime_cost + sunday_bonus
    
    return {
        "total_hours": float(total_hours),
        "regular_hours": float(regular_hours),
        "overtime_hours": float(overtime_hours),
        "sunday_hours": float(sunday_hours),
        "overtime_cost": float(total_overtime_cost),
        "requires_approval": overtime_hours > 0
    }


def update_time_entries_approval_status(
    baserow: BaserowClient,
    entries: List[Dict]
) -> None:
    """Mark time entries as pending approval."""
    for entry in entries:
        if entry.get("Approval Status") != "Approved":
            baserow.update_row(
                config.table_time_clock,
                entry["id"],
                {"Approval Status": "Pending"}
            )


def main(timer: func.TimerRequest) -> None:
    """Azure Function entry point."""
    logger.info("Overtime calculation started")
    
    if timer.past_due:
        logger.warning("Timer is running late")
    
    baserow = BaserowClient()
    email_client = EmailClient()
    
    current_date = get_current_datetime()
    week_start, week_end = get_week_range(current_date)
    
    logger.info(f"Calculating overtime for week: {week_start} to {week_end}")
    
    # Get all active employees
    employees = baserow.get_employees(active_only=True)
    logger.info(f"Processing {len(employees)} employees")
    
    overtime_reports = []
    
    for employee in employees:
        employee_id = employee.get("id")
        employee_name = employee.get("Full Name", "Unknown")
        role = employee.get("Role", "")
        
        # Skip non-employees (Owner, Resident)
        if role not in ["Employee"]:
            continue
        
        # Get time entries
        entries = get_time_entries_for_week(baserow, employee_id, week_start, week_end)
        
        if not entries:
            logger.info(f"No time entries for {employee_name}")
            continue
        
        # Calculate overtime
        result = calculate_overtime(entries)
        
        logger.info(
            f"{employee_name}: {result['total_hours']:.1f}hrs total, "
            f"{result['overtime_hours']:.1f}hrs overtime"
        )
        
        if result["requires_approval"]:
            overtime_reports.append({
                "employee": employee,
                "employee_name": employee_name,
                "entries": entries,
                **result
            })
            
            # Update entries to pending approval
            update_time_entries_approval_status(baserow, entries)
    
    # Send notifications for overtime
    for report in overtime_reports:
        email_client.send_template_email(
            config.admin_email,
            "overtime_alert",
            {
                "employee_name": report["employee_name"],
                "week_start": str(week_start),
                "week_end": str(week_end),
                "total_hours": f"{report['total_hours']:.1f}",
                "overtime_hours": f"{report['overtime_hours']:.1f}",
                "overtime_cost": f"{report['overtime_cost']:.2f}",
                "baserow_url": config.baserow_url or "https://ops.houseofveritas.za"
            }
        )
    
    # Summary notification
    if overtime_reports:
        total_overtime = sum(r["overtime_hours"] for r in overtime_reports)
        total_cost = sum(r["overtime_cost"] for r in overtime_reports)
        
        email_client.send_email(
            config.admin_email,
            f"Weekly Overtime Summary - {len(overtime_reports)} employees",
            f"""
House of Veritas - Weekly Overtime Summary

Week: {week_start} to {week_end}
Employees with Overtime: {len(overtime_reports)}
Total Overtime Hours: {total_overtime:.1f}
Estimated Overtime Cost: R{total_cost:.2f}

Details:
{chr(10).join([
    f"  - {r['employee_name']}: {r['overtime_hours']:.1f}hrs (R{r['overtime_cost']:.2f})"
    for r in overtime_reports
])}

Please review and approve at:
{config.baserow_url or 'https://ops.houseofveritas.za'}

---
Per BCEA, overtime must be approved and compensated at the appropriate rate.
"""
        )
    else:
        logger.info("No overtime to report this week")
