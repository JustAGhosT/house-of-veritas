"""
House of Veritas - Azure Function: Recurring Task Creator

Creates recurring tasks weekly based on task templates.
Runs every Monday at 8:00 AM to create tasks for the week.

Trigger: Timer (Weekly Monday at 8:00 AM UTC)
Schedule: 0 0 8 * * 1

Task Types:
- Daily tasks (created 7 instances)
- Weekly tasks (created 1 instance)
- Monthly tasks (created if 1st week of month)
- Quarterly tasks (created if 1st week of quarter)
"""

import logging
from datetime import datetime, timedelta
from typing import List, Dict

import azure.functions as func

import sys
sys.path.append("..")
from shared.utils import (
    BaserowClient, EmailClient, config, setup_logging,
    get_current_datetime, format_date, get_week_range
)

logger = setup_logging("recurring-tasks")


def get_recurring_templates(baserow: BaserowClient) -> List[Dict]:
    """Get all recurring task templates."""
    # Get tasks marked as recurring
    all_tasks = baserow.list_rows(config.table_tasks, size=200)
    
    recurring = []
    for task in all_tasks:
        if task.get("Is Recurring") and task.get("Recurrence"):
            recurring.append(task)
    
    return recurring


def should_create_task(recurrence: str, current_date: datetime) -> bool:
    """Determine if a task should be created based on recurrence type."""
    day_of_month = current_date.day
    month = current_date.month
    
    if recurrence == "Daily":
        return True
    elif recurrence == "Weekly":
        return True
    elif recurrence == "Monthly":
        # Create on first Monday of month (day 1-7)
        return day_of_month <= 7
    elif recurrence == "Quarterly":
        # Create in first week of Jan, Apr, Jul, Oct
        return month in [1, 4, 7, 10] and day_of_month <= 7
    
    return False


def create_task_instances(
    baserow: BaserowClient,
    template: Dict,
    week_start: datetime
) -> List[Dict]:
    """Create task instances from a template."""
    recurrence = template.get("Recurrence", "Weekly")
    created_tasks = []
    
    # Determine how many instances to create
    if recurrence == "Daily":
        # Create 7 instances for each day of the week
        for i in range(7):
            due_date = week_start + timedelta(days=i)
            task = create_single_task(baserow, template, due_date)
            if task:
                created_tasks.append(task)
    else:
        # Create single instance due at end of week (Friday)
        due_date = week_start + timedelta(days=4)  # Friday
        task = create_single_task(baserow, template, due_date)
        if task:
            created_tasks.append(task)
    
    return created_tasks


def create_single_task(
    baserow: BaserowClient,
    template: Dict,
    due_date: datetime
) -> Dict:
    """Create a single task instance from template."""
    # Build task data from template
    task_data = {
        "Title": f"{template.get('Title', 'Task')} - {format_date(due_date)}",
        "Description": template.get("Description", ""),
        "Due Date": format_date(due_date),
        "Priority": template.get("Priority", "Medium"),
        "Status": "Not Started",
        "Time Spent": 0,
        "Project": template.get("Project", ""),
        "Is Recurring": False,  # Instance is not recurring
    }
    
    # Copy assigned employee link if present
    assigned = template.get("Assigned To")
    if assigned:
        task_data["Assigned To"] = assigned
    
    # Create the task
    result = baserow.create_row(config.table_tasks, task_data)
    
    if result:
        logger.info(f"Created task: {task_data['Title']}")
        return result
    else:
        logger.error(f"Failed to create task: {task_data['Title']}")
        return None


def notify_employees(
    email_client: EmailClient,
    baserow: BaserowClient,
    created_tasks: List[Dict]
) -> None:
    """Notify employees of their assigned tasks."""
    # Group tasks by assigned employee
    tasks_by_employee = {}
    
    for task in created_tasks:
        assigned = task.get("Assigned To")
        if assigned and isinstance(assigned, list) and assigned:
            employee_id = assigned[0].get("id")
            if employee_id:
                if employee_id not in tasks_by_employee:
                    tasks_by_employee[employee_id] = []
                tasks_by_employee[employee_id].append(task)
    
    # Send notifications
    for employee_id, tasks in tasks_by_employee.items():
        employee = baserow.get_row(config.table_employees, employee_id)
        if employee and employee.get("Email"):
            task_list = "\n".join([
                f"  - {t.get('Title')} (Due: {t.get('Due Date')}, Priority: {t.get('Priority')})"
                for t in tasks
            ])
            
            email_client.send_email(
                employee.get("Email"),
                f"Weekly Tasks Assigned - {len(tasks)} tasks",
                f"""
House of Veritas - Weekly Task Assignment

Hi {employee.get('Full Name', 'Team Member')},

You have been assigned {len(tasks)} tasks for this week:

{task_list}

View and update your tasks at:
{config.baserow_url or 'https://ops.houseofveritas.za'}

---
This is an automated notification from House of Veritas.
"""
            )


def main(timer: func.TimerRequest) -> None:
    """Azure Function entry point."""
    logger.info("Recurring task creation started")
    
    if timer.past_due:
        logger.warning("Timer is running late")
    
    baserow = BaserowClient()
    email_client = EmailClient()
    
    current_date = get_current_datetime()
    week_start, week_end = get_week_range(current_date)
    
    logger.info(f"Creating tasks for week: {week_start} to {week_end}")
    
    # Get recurring templates
    templates = get_recurring_templates(baserow)
    logger.info(f"Found {len(templates)} recurring task templates")
    
    all_created = []
    
    for template in templates:
        recurrence = template.get("Recurrence", "")
        
        # Check if this task should be created this week
        if should_create_task(recurrence, current_date):
            tasks = create_task_instances(baserow, template, datetime.combine(week_start, datetime.min.time()))
            all_created.extend(tasks)
            logger.info(f"Created {len(tasks)} instances of '{template.get('Title')}'")
        else:
            logger.info(f"Skipping '{template.get('Title')}' ({recurrence}) - not due this week")
    
    logger.info(f"Total tasks created: {len(all_created)}")
    
    # Notify employees
    if all_created:
        notify_employees(email_client, baserow, all_created)
    
    # Notify admin
    if all_created:
        email_client.send_email(
            config.admin_email,
            f"Weekly Tasks Created - {len(all_created)} tasks",
            f"""
House of Veritas - Recurring Task Report

Date: {format_date(current_date)}
Week: {week_start} to {week_end}
Tasks Created: {len(all_created)}

Task Summary:
{chr(10).join([f"  - {t.get('Title')}" for t in all_created[:20]])}
{'  ... and more' if len(all_created) > 20 else ''}

---
This is an automated notification from House of Veritas.
"""
        )
