"""
House of Veritas - Azure Function: Monthly Budget Report

Generates monthly financial report with budget vs actual spending.
Exports report as PDF and emails to admin.

Trigger: Timer (Monthly 5th at 8:00 AM UTC)
Schedule: 0 0 8 5 * *

Report Includes:
- Total spending by category
- Budget vs actual comparison
- Top expenses
- Employee expense breakdown
"""

import logging
from datetime import datetime
from decimal import Decimal
from typing import Dict, List
from collections import defaultdict

import azure.functions as func

import sys
sys.path.append("..")
from shared.utils import (
    BaserowClient, EmailClient, config, setup_logging,
    get_current_datetime, format_date, get_month_name
)

logger = setup_logging("budget-report")

# Budget limits by category (monthly)
CATEGORY_BUDGETS = {
    "Materials": Decimal("5000"),
    "Labor": Decimal("15000"),
    "Fuel": Decimal("2000"),
    "Maintenance": Decimal("3000"),
    "Supplies": Decimal("1500"),
    "Food": Decimal("2500"),
    "Transport": Decimal("1000"),
    "Utilities": Decimal("3500"),
    "Professional": Decimal("2000"),
    "Other": Decimal("1000"),
}


def get_month_expenses(baserow: BaserowClient, year: int, month: int) -> List[Dict]:
    """Get all expenses for a specific month."""
    all_expenses = baserow.list_rows(config.table_expenses, size=500)
    
    month_expenses = []
    for expense in all_expenses:
        expense_date = expense.get("Date", "")
        if expense_date:
            try:
                date = datetime.strptime(expense_date, "%Y-%m-%d")
                if date.year == year and date.month == month:
                    # Only include approved expenses
                    status = expense.get("Approval Status", "")
                    if status in ["Approved", "Post-Hoc Approved"]:
                        month_expenses.append(expense)
            except ValueError:
                pass
    
    return month_expenses


def calculate_category_totals(expenses: List[Dict]) -> Dict[str, Decimal]:
    """Calculate total spending by category."""
    totals = defaultdict(Decimal)
    
    for expense in expenses:
        category = expense.get("Category", "Other")
        amount = Decimal(str(expense.get("Amount", 0) or 0))
        totals[category] += amount
    
    return dict(totals)


def calculate_employee_totals(
    expenses: List[Dict],
    baserow: BaserowClient
) -> Dict[str, Decimal]:
    """Calculate total spending by employee."""
    totals = defaultdict(Decimal)
    
    for expense in expenses:
        requester = expense.get("Requester")
        if isinstance(requester, list) and requester:
            employee_id = requester[0].get("id")
            if employee_id:
                employee = baserow.get_row(config.table_employees, employee_id)
                name = employee.get("Full Name", "Unknown") if employee else "Unknown"
                amount = Decimal(str(expense.get("Amount", 0) or 0))
                totals[name] += amount
    
    return dict(totals)


def generate_report_text(
    year: int,
    month: int,
    expenses: List[Dict],
    category_totals: Dict[str, Decimal],
    employee_totals: Dict[str, Decimal]
) -> str:
    """Generate the text content of the budget report."""
    total_spent = sum(category_totals.values())
    total_budget = sum(CATEGORY_BUDGETS.values())
    
    # Category breakdown
    category_lines = []
    for category, budget in sorted(CATEGORY_BUDGETS.items()):
        actual = category_totals.get(category, Decimal("0"))
        variance = budget - actual
        status = "✅" if variance >= 0 else "⚠️"
        category_lines.append(
            f"  {status} {category:15} | Budget: R{budget:>8,.2f} | "
            f"Actual: R{actual:>8,.2f} | Variance: R{variance:>8,.2f}"
        )
    
    # Employee breakdown
    employee_lines = [
        f"  - {name}: R{amount:,.2f}"
        for name, amount in sorted(employee_totals.items(), key=lambda x: -x[1])
    ]
    
    # Top 5 expenses
    sorted_expenses = sorted(expenses, key=lambda x: x.get("Amount", 0), reverse=True)[:5]
    top_expenses = [
        f"  {i+1}. R{e.get('Amount', 0):,.2f} - {e.get('Category', 'N/A')} - {e.get('Vendor', 'N/A')}"
        for i, e in enumerate(sorted_expenses)
    ]
    
    return f"""
================================================================================
HOUSE OF VERITAS - MONTHLY FINANCIAL REPORT
================================================================================

Report Period: {get_month_name(month)} {year}
Generated: {format_date(get_current_datetime())}

--------------------------------------------------------------------------------
EXECUTIVE SUMMARY
--------------------------------------------------------------------------------

Total Budget:     R{total_budget:>12,.2f}
Total Spent:      R{total_spent:>12,.2f}
Variance:         R{total_budget - total_spent:>12,.2f}
Budget Utilized:  {(total_spent / total_budget * 100):.1f}%

Transactions:     {len(expenses)}

--------------------------------------------------------------------------------
CATEGORY BREAKDOWN
--------------------------------------------------------------------------------

{chr(10).join(category_lines)}

--------------------------------------------------------------------------------
EMPLOYEE SPENDING
--------------------------------------------------------------------------------

{chr(10).join(employee_lines) if employee_lines else "  No employee expenses"}

--------------------------------------------------------------------------------
TOP 5 EXPENSES
--------------------------------------------------------------------------------

{chr(10).join(top_expenses) if top_expenses else "  No expenses"}

--------------------------------------------------------------------------------
NOTES
--------------------------------------------------------------------------------

⚠️  Categories marked with warning symbol exceeded budget
✅  Categories marked with checkmark are within budget

For detailed transaction history, access:
{config.baserow_url or 'https://ops.nexamesh.ai'}

================================================================================
END OF REPORT
================================================================================
"""


def main(timer: func.TimerRequest) -> None:
    """Azure Function entry point."""
    logger.info("Budget report generation started")
    
    if timer.past_due:
        logger.warning("Timer is running late")
    
    baserow = BaserowClient()
    email_client = EmailClient()
    
    # Get previous month (report runs on 5th)
    current_date = get_current_datetime()
    if current_date.month == 1:
        report_month = 12
        report_year = current_date.year - 1
    else:
        report_month = current_date.month - 1
        report_year = current_date.year
    
    logger.info(f"Generating report for {get_month_name(report_month)} {report_year}")
    
    # Get expenses
    expenses = get_month_expenses(baserow, report_year, report_month)
    logger.info(f"Found {len(expenses)} approved expenses")
    
    # Calculate totals
    category_totals = calculate_category_totals(expenses)
    employee_totals = calculate_employee_totals(expenses, baserow)
    
    # Generate report
    report_text = generate_report_text(
        report_year,
        report_month,
        expenses,
        category_totals,
        employee_totals
    )
    
    # Send report via email
    total_spent = sum(category_totals.values())
    
    email_client.send_email(
        config.admin_email,
        f"Monthly Financial Report - {get_month_name(report_month)} {report_year} (R{total_spent:,.2f})",
        report_text
    )
    
    logger.info("Budget report sent successfully")
