"""
House of Veritas - Azure Function: Expense Notification

Sends notification to admin when new expenses are submitted.
Can be triggered via Baserow webhook or scheduled check.

Trigger: HTTP (Webhook from Baserow) or Timer (Hourly check)

Expense Types:
- Request: Pre-approval needed before spending
- Post-Hoc: Reimbursement after spending (receipt required)
"""

import json
import logging
from typing import Dict, List

import azure.functions as func

import sys
sys.path.append("..")
from shared.utils import (
    BaserowClient, EmailClient, config, setup_logging,
    get_current_datetime, format_date
)

logger = setup_logging("expense-notification")


def get_pending_expenses(baserow: BaserowClient) -> List[Dict]:
    """Get all expenses pending approval."""
    all_expenses = baserow.list_rows(config.table_expenses, size=100)
    
    pending = []
    for expense in all_expenses:
        status = expense.get("Approval Status", "")
        if status == "Pending":
            pending.append(expense)
    
    return pending


def get_requester_name(baserow: BaserowClient, expense: Dict) -> str:
    """Get the name of the expense requester."""
    requester = expense.get("Requester")
    if isinstance(requester, list) and requester:
        employee_id = requester[0].get("id")
        if employee_id:
            employee = baserow.get_row(config.table_employees, employee_id)
            if employee:
                return employee.get("Full Name", "Unknown")
    return "Unknown"


def format_expense_details(expense: Dict, requester_name: str) -> str:
    """Format expense details for notification."""
    return f"""
Expense Details:
- ID: {expense.get('id', 'N/A')}
- Requester: {requester_name}
- Amount: R{expense.get('Amount', 0):,.2f}
- Category: {expense.get('Category', 'N/A')}
- Type: {expense.get('Type', 'N/A')}
- Date: {expense.get('Date', 'N/A')}
- Vendor: {expense.get('Vendor', 'N/A')}
- Project: {expense.get('Project', 'N/A')}
- Notes: {expense.get('Notes', 'None')}
"""


def handle_webhook(req_body: Dict) -> Dict:
    """Handle webhook from Baserow when expense is created/updated."""
    result = {"success": False, "action": "none"}
    
    baserow = BaserowClient()
    email_client = EmailClient()
    
    # Extract expense data from webhook
    # Baserow webhooks typically include: event_type, table_id, row_id, items
    event_type = req_body.get("event_type", "")
    items = req_body.get("items", [])
    
    if event_type in ["rows.created", "rows.updated"]:
        for item in items:
            status = item.get("Approval Status", "")
            
            if status == "Pending":
                requester_name = get_requester_name(baserow, item)
                
                email_client.send_template_email(
                    config.admin_email,
                    "expense_approval_request",
                    {
                        "requester": requester_name,
                        "amount": f"{item.get('Amount', 0):,.2f}",
                        "category": item.get("Category", "N/A"),
                        "expense_type": item.get("Type", "N/A"),
                        "date": item.get("Date", "N/A"),
                        "description": item.get("Notes", "No description"),
                        "baserow_url": config.baserow_url or "https://ops.houseofveritas.za"
                    }
                )
                
                result["success"] = True
                result["action"] = "notification_sent"
                logger.info(f"Sent notification for expense {item.get('id')}")
    
    return result


def handle_timer_check() -> Dict:
    """Check for pending expenses and send notifications."""
    result = {"success": True, "pending_count": 0, "notifications_sent": 0}
    
    baserow = BaserowClient()
    email_client = EmailClient()
    
    pending = get_pending_expenses(baserow)
    result["pending_count"] = len(pending)
    
    logger.info(f"Found {len(pending)} pending expenses")
    
    if pending:
        # Group by requester for summary
        by_requester = {}
        for expense in pending:
            requester_name = get_requester_name(baserow, expense)
            if requester_name not in by_requester:
                by_requester[requester_name] = []
            by_requester[requester_name].append(expense)
        
        # Build summary
        total_amount = sum(e.get("Amount", 0) for e in pending)
        
        expense_list = []
        for requester, expenses in by_requester.items():
            for exp in expenses:
                expense_list.append(
                    f"  - R{exp.get('Amount', 0):,.2f} | {exp.get('Category', 'N/A')} | "
                    f"{requester} | {exp.get('Date', 'N/A')}"
                )
        
        email_client.send_email(
            config.admin_email,
            f"Pending Expense Approvals - {len(pending)} items (R{total_amount:,.2f})",
            f"""
House of Veritas - Pending Expense Summary

You have {len(pending)} expense(s) awaiting approval.
Total Amount: R{total_amount:,.2f}

Pending Expenses:
{chr(10).join(expense_list)}

Please review and approve/reject at:
{config.baserow_url or 'https://ops.houseofveritas.za'}

---
This is an automated notification from House of Veritas.
"""
        )
        
        result["notifications_sent"] = 1
    
    return result


def main(req: func.HttpRequest = None, timer: func.TimerRequest = None) -> func.HttpResponse:
    """Azure Function entry point - supports both HTTP and Timer triggers."""
    
    if timer is not None:
        # Timer trigger - check for pending expenses
        logger.info("Expense check triggered by timer")
        result = handle_timer_check()
        return None  # Timer functions don't return HTTP response
    
    if req is not None:
        # HTTP trigger - webhook from Baserow
        logger.info("Expense notification triggered by webhook")
        
        try:
            req_body = req.get_json()
        except ValueError:
            return func.HttpResponse(
                json.dumps({"error": "Invalid JSON"}),
                status_code=400,
                mimetype="application/json"
            )
        
        result = handle_webhook(req_body)
        
        return func.HttpResponse(
            json.dumps(result),
            status_code=200,
            mimetype="application/json"
        )
    
    return func.HttpResponse(
        json.dumps({"error": "No trigger"}),
        status_code=400,
        mimetype="application/json"
    )
