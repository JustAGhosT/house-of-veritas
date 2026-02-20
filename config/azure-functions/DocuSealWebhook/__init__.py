"""
House of Veritas - Azure Function: DocuSeal Webhook Handler

Receives webhooks from DocuSeal when documents are signed/viewed
and updates corresponding records in Baserow.

Trigger: HTTP POST
Events Handled:
- submission.completed - Document fully signed
- submission.viewed - Document viewed by signer
- submission.created - New submission created

Environment Variables Required:
- BASEROW_URL, BASEROW_TOKEN
- TABLE_EMPLOYEES, TABLE_DOCUMENT_EXPIRY
- DOCUSEAL_WEBHOOK_SECRET
"""

import json
import hmac
import hashlib
import logging
import azure.functions as func

import sys
sys.path.append("..")
from shared.utils import (
    BaserowClient, EmailClient, config, setup_logging,
    get_current_datetime, format_date
)

logger = setup_logging("docuseal-webhook")


def validate_signature(payload: bytes, signature: str) -> bool:
    """Validate DocuSeal webhook signature."""
    if not config.docuseal_webhook_secret:
        logger.warning("No webhook secret configured - skipping validation")
        return True
    
    expected = hmac.new(
        config.docuseal_webhook_secret.encode(),
        payload,
        hashlib.sha256
    ).hexdigest()
    
    return hmac.compare_digest(signature, expected)


def handle_submission_completed(data: dict) -> dict:
    """Handle completed document submission."""
    result = {"success": False, "actions": []}
    
    submission_id = data.get("id")
    template = data.get("template", {})
    template_name = template.get("name", "")
    submitters = data.get("submitters", [])
    documents = data.get("documents", [])
    completed_at = data.get("completed_at", format_date(get_current_datetime()))
    
    document_url = documents[0].get("url", "") if documents else ""
    
    logger.info(f"Processing completed submission {submission_id}: {template_name}")
    
    baserow = BaserowClient()
    email_client = EmailClient()
    
    # Update employee contract status if employment contract
    if "Employment Contract" in template_name:
        for submitter in submitters:
            email = submitter.get("email", "")
            if email:
                employee = baserow.get_employee_by_email(email)
                if employee:
                    update_result = baserow.update_row(
                        config.table_employees,
                        employee["id"],
                        {
                            "Contract Ref": document_url,
                            "Probation Status": "Completed"
                        }
                    )
                    if update_result:
                        result["actions"].append(f"Updated employee {email} contract status")
                        logger.info(f"Updated employee contract: {email}")
    
    # Update document expiry record
    doc_record = baserow.find_row_by_field(
        config.table_document_expiry,
        "Doc Name",
        template_name
    )
    
    if doc_record:
        update_result = baserow.update_row(
            config.table_document_expiry,
            doc_record["id"],
            {
                "DocuSeal Ref": document_url,
                "Last Review": completed_at[:10] if completed_at else format_date(get_current_datetime()),
                "Status": "Active"
            }
        )
        if update_result:
            result["actions"].append(f"Updated document expiry: {template_name}")
            logger.info(f"Updated document expiry record: {template_name}")
    
    # Notify admin of completed signature
    email_client.send_email(
        config.admin_email,
        f"Document Signed: {template_name}",
        f"""
A document has been fully signed.

Document: {template_name}
Submission ID: {submission_id}
Completed At: {completed_at}
Signers: {', '.join([s.get('email', '') for s in submitters])}

View the signed document:
{document_url}

---
House of Veritas Document Management
"""
    )
    
    result["success"] = len(result["actions"]) > 0
    return result


def handle_submission_viewed(data: dict) -> dict:
    """Handle document viewed event."""
    submission_id = data.get("id")
    submitter = data.get("submitter", {})
    
    logger.info(f"Document {submission_id} viewed by {submitter.get('email', 'unknown')}")
    
    return {
        "success": True,
        "actions": [f"Logged view event for submission {submission_id}"]
    }


def handle_submission_created(data: dict) -> dict:
    """Handle new submission created event."""
    submission_id = data.get("id")
    template_name = data.get("template", {}).get("name", "")
    
    logger.info(f"New submission created: {submission_id} - {template_name}")
    
    return {
        "success": True,
        "actions": [f"Logged creation of submission {submission_id}"]
    }


def main(req: func.HttpRequest) -> func.HttpResponse:
    """Azure Function entry point."""
    logger.info("DocuSeal webhook received")
    
    # Validate signature
    signature = req.headers.get("X-DocuSeal-Signature", "")
    body = req.get_body()
    
    if not validate_signature(body, signature):
        logger.warning("Invalid webhook signature")
        return func.HttpResponse(
            json.dumps({"error": "Invalid signature"}),
            status_code=401,
            mimetype="application/json"
        )
    
    # Parse payload
    try:
        payload = req.get_json()
    except ValueError:
        logger.error("Invalid JSON payload")
        return func.HttpResponse(
            json.dumps({"error": "Invalid JSON"}),
            status_code=400,
            mimetype="application/json"
        )
    
    event_type = payload.get("event_type", "")
    data = payload.get("data", {})
    
    logger.info(f"Event type: {event_type}")
    
    # Route to handler
    handlers = {
        "submission.completed": handle_submission_completed,
        "submission.viewed": handle_submission_viewed,
        "submission.created": handle_submission_created,
    }
    
    handler = handlers.get(event_type)
    if handler:
        result = handler(data)
    else:
        logger.info(f"Unhandled event type: {event_type}")
        result = {"success": True, "actions": [], "message": f"Event {event_type} acknowledged"}
    
    return func.HttpResponse(
        json.dumps(result),
        status_code=200,
        mimetype="application/json"
    )
