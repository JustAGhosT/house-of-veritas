"""
House of Veritas - Azure Function: Weekly Backup Export

Exports all Baserow tables to CSV and uploads to Azure Blob Storage.
Provides disaster recovery and audit trail.

Trigger: Timer (Weekly Sunday at midnight UTC)
Schedule: 0 0 0 * * 0

Backup Contents:
- All 8 Baserow tables exported as CSV
- Timestamped backup folders
- 90-day retention policy
"""

import io
import csv
import json
import logging
from datetime import datetime
from typing import Dict, List

import azure.functions as func

import sys
sys.path.append("..")
from shared.utils import (
    BaserowClient, EmailClient, config, setup_logging,
    get_current_datetime, format_date
)

logger = setup_logging("backup-export")

# Try to import Azure Storage SDK
try:
    from azure.storage.blob import BlobServiceClient
    HAS_AZURE_STORAGE = True
except ImportError:
    HAS_AZURE_STORAGE = False
    logger.warning("Azure Storage SDK not available")


# Table configuration
TABLES = {
    "employees": {"id": config.table_employees, "name": "employees"},
    "assets": {"id": config.table_assets, "name": "assets"},
    "tasks": {"id": config.table_tasks, "name": "tasks"},
    "time_clock": {"id": config.table_time_clock, "name": "time_clock"},
    "incidents": {"id": config.table_incidents, "name": "incidents"},
    "vehicle_logs": {"id": config.table_vehicle_logs, "name": "vehicle_logs"},
    "expenses": {"id": config.table_expenses, "name": "expenses"},
    "document_expiry": {"id": config.table_document_expiry, "name": "document_expiry"},
}


def export_table_to_csv(baserow: BaserowClient, table_id: str) -> tuple:
    """Export a Baserow table to CSV format. Returns (csv_content, row_count)."""
    rows = baserow.list_rows(table_id, size=1000)
    
    if not rows:
        return "", 0
    
    # Get field names from first row
    field_names = list(rows[0].keys())
    
    # Create CSV
    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=field_names)
    writer.writeheader()
    
    for row in rows:
        # Convert complex fields to JSON strings
        simplified_row = {}
        for key, value in row.items():
            if isinstance(value, (dict, list)):
                simplified_row[key] = json.dumps(value)
            else:
                simplified_row[key] = value
        writer.writerow(simplified_row)
    
    return output.getvalue(), len(rows)


def upload_to_blob_storage(
    container_name: str,
    blob_name: str,
    content: str
) -> bool:
    """Upload content to Azure Blob Storage."""
    if not HAS_AZURE_STORAGE:
        logger.warning("Azure Storage SDK not available - skipping upload")
        return False
    
    if not config.storage_connection_string:
        logger.warning("Storage connection string not configured")
        return False
    
    try:
        blob_service = BlobServiceClient.from_connection_string(
            config.storage_connection_string
        )
        container_client = blob_service.get_container_client(container_name)
        
        # Create container if it doesn't exist
        if not container_client.exists():
            container_client.create_container()
        
        # Upload blob
        blob_client = container_client.get_blob_client(blob_name)
        blob_client.upload_blob(content, overwrite=True)
        
        logger.info(f"Uploaded: {blob_name}")
        return True
    except Exception as e:
        logger.error(f"Upload failed: {e}")
        return False


def main(timer: func.TimerRequest) -> None:
    """Azure Function entry point."""
    logger.info("Weekly backup started")
    
    if timer.past_due:
        logger.warning("Timer is running late")
    
    baserow = BaserowClient()
    email_client = EmailClient()
    
    current_date = get_current_datetime()
    backup_folder = current_date.strftime("%Y/%m/%d_%H%M%S")
    
    logger.info(f"Creating backup in folder: {backup_folder}")
    
    backup_results = []
    total_records = 0
    
    for table_key, table_config in TABLES.items():
        table_id = table_config["id"]
        table_name = table_config["name"]
        
        logger.info(f"Exporting {table_name}...")
        
        try:
            csv_content, row_count = export_table_to_csv(baserow, table_id)
            
            if csv_content:
                blob_name = f"{backup_folder}/{table_name}.csv"
                uploaded = upload_to_blob_storage(
                    config.backup_container,
                    blob_name,
                    csv_content
                )
                
                backup_results.append({
                    "table": table_name,
                    "rows": row_count,
                    "blob": blob_name,
                    "uploaded": uploaded
                })
                total_records += row_count
                
                logger.info(f"  {table_name}: {row_count} rows exported")
            else:
                logger.info(f"  {table_name}: No data")
                backup_results.append({
                    "table": table_name,
                    "rows": 0,
                    "blob": None,
                    "uploaded": False
                })
        except Exception as e:
            logger.error(f"  {table_name}: Export failed - {e}")
            backup_results.append({
                "table": table_name,
                "rows": 0,
                "blob": None,
                "uploaded": False,
                "error": str(e)
            })
    
    # Generate file list for email
    file_list = []
    for result in backup_results:
        status = "✅" if result.get("uploaded") else "❌"
        file_list.append(
            f"  {status} {result['table']}.csv ({result['rows']} rows)"
        )
    
    # Send backup report
    successful = sum(1 for r in backup_results if r.get("uploaded"))
    
    email_client.send_template_email(
        config.admin_email,
        "backup_complete",
        {
            "date": format_date(current_date),
            "table_count": len(TABLES),
            "record_count": total_records,
            "storage_location": f"{config.backup_container}/{backup_folder}",
            "file_list": chr(10).join(file_list)
        }
    )
    
    logger.info(f"Backup complete. {successful}/{len(TABLES)} tables backed up. {total_records} total records.")
