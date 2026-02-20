#!/usr/bin/env python3
"""
House of Veritas - Baserow Data Seeding Script

This script seeds the Baserow database with initial data for:
- Employees (4 users)
- Assets (sample equipment and vehicles)
- Document Expiry tracking (18 governance documents)

Prerequisites:
- Baserow instance running
- API token with write permissions
- Tables created as per schema

Usage:
    export BASEROW_URL="https://ops.houseofveritas.za"
    export BASEROW_TOKEN="your-api-token"
    python seed-baserow.py
"""

import os
import json
import requests
from datetime import datetime, timedelta
from typing import Dict, List, Any

# Configuration
BASEROW_URL = os.environ.get("BASEROW_URL", "http://localhost:3002")
BASEROW_TOKEN = os.environ.get("BASEROW_TOKEN", "")

# Table IDs (update after creating tables in Baserow)
TABLE_IDS = {
    "employees": 1,      # Update with actual table ID
    "assets": 2,         # Update with actual table ID
    "tasks": 3,          # Update with actual table ID
    "time_clock": 4,     # Update with actual table ID
    "incidents": 5,      # Update with actual table ID
    "vehicle_logs": 6,   # Update with actual table ID
    "expenses": 7,       # Update with actual table ID
    "document_expiry": 8 # Update with actual table ID
}

# Headers for API requests
def get_headers():
    return {
        "Authorization": f"Token {BASEROW_TOKEN}",
        "Content-Type": "application/json"
    }

def create_row(table_id: int, data: Dict[str, Any]) -> Dict:
    """Create a single row in a Baserow table."""
    url = f"{BASEROW_URL}/api/database/rows/table/{table_id}/"
    response = requests.post(url, headers=get_headers(), json=data)
    response.raise_for_status()
    return response.json()

def create_rows_batch(table_id: int, rows: List[Dict[str, Any]]) -> List[Dict]:
    """Create multiple rows in a Baserow table."""
    url = f"{BASEROW_URL}/api/database/rows/table/{table_id}/batch/"
    response = requests.post(url, headers=get_headers(), json={"items": rows})
    response.raise_for_status()
    return response.json()

# ============================================
# Employee Data
# ============================================
EMPLOYEES = [
    {
        "Full Name": "Hans van der Berg",
        "ID Number": "7501015001083",
        "Role": "Owner",
        "Employment Start Date": "2020-01-01",
        "Probation Status": "N/A",
        "Leave Balance": 0,
        "Email": "hans@houseofveritas.za",
        "Phone": "+27 82 555 0001",
        "Active": True
    },
    {
        "Full Name": "Charl Pieterse",
        "ID Number": "8805125002087",
        "Role": "Employee",
        "Employment Start Date": "2022-03-15",
        "Probation Status": "Completed",
        "Leave Balance": 15,
        "Email": "charl@houseofveritas.za",
        "Phone": "+27 72 555 0002",
        "Active": True
    },
    {
        "Full Name": "Lucky Mokoena",
        "ID Number": "9210085003085",
        "Role": "Employee",
        "Employment Start Date": "2023-06-01",
        "Probation Status": "Completed",
        "Leave Balance": 8,
        "Email": "lucky@houseofveritas.za",
        "Phone": "+27 83 555 0003",
        "Active": True
    },
    {
        "Full Name": "Irma van der Berg",
        "ID Number": "7803225004089",
        "Role": "Resident",
        "Employment Start Date": "2020-01-01",
        "Probation Status": "N/A",
        "Leave Balance": 0,
        "Email": "irma@houseofveritas.za",
        "Phone": "+27 84 555 0004",
        "Active": True
    }
]

# ============================================
# Asset Data
# ============================================
ASSETS = [
    # Workshop Tools
    {
        "Asset ID": "WS-001",
        "Type": "Tool",
        "Description": "Makita Cordless Drill Set",
        "Purchase Date": "2022-01-15",
        "Purchase Price": 3500,
        "Condition": "Good",
        "Location": "Workshop"
    },
    {
        "Asset ID": "WS-002",
        "Type": "Tool",
        "Description": "Bosch Angle Grinder",
        "Purchase Date": "2022-03-20",
        "Purchase Price": 1800,
        "Condition": "Good",
        "Location": "Workshop"
    },
    {
        "Asset ID": "WS-003",
        "Type": "Equipment",
        "Description": "Workshop Workbench",
        "Purchase Date": "2021-06-01",
        "Purchase Price": 8500,
        "Condition": "Excellent",
        "Location": "Workshop"
    },
    {
        "Asset ID": "WS-004",
        "Type": "Tool",
        "Description": "Complete Socket Set (Metric/Imperial)",
        "Purchase Date": "2022-08-10",
        "Purchase Price": 2200,
        "Condition": "Excellent",
        "Location": "Workshop"
    },
    # Garden Equipment
    {
        "Asset ID": "GD-001",
        "Type": "Equipment",
        "Description": "Honda Petrol Lawnmower",
        "Purchase Date": "2023-02-01",
        "Purchase Price": 12000,
        "Condition": "Excellent",
        "Location": "Garden"
    },
    {
        "Asset ID": "GD-002",
        "Type": "Tool",
        "Description": "Stihl Hedge Trimmer",
        "Purchase Date": "2023-02-01",
        "Purchase Price": 4500,
        "Condition": "Good",
        "Location": "Garden"
    },
    {
        "Asset ID": "GD-003",
        "Type": "Equipment",
        "Description": "Garden Hose Reel System",
        "Purchase Date": "2022-09-15",
        "Purchase Price": 1500,
        "Condition": "Good",
        "Location": "Garden"
    },
    # Vehicles
    {
        "Asset ID": "VH-001",
        "Type": "Vehicle",
        "Description": "Toyota Hilux 2.4 GD-6 Single Cab (White)",
        "Purchase Date": "2021-01-15",
        "Purchase Price": 385000,
        "Condition": "Good",
        "Location": "Garage"
    },
    # Household
    {
        "Asset ID": "HH-001",
        "Type": "Household",
        "Description": "Samsung Side-by-Side Refrigerator",
        "Purchase Date": "2022-04-01",
        "Purchase Price": 22000,
        "Condition": "Excellent",
        "Location": "House"
    },
    {
        "Asset ID": "HH-002",
        "Type": "Household",
        "Description": "LG Washing Machine 9kg",
        "Purchase Date": "2022-04-01",
        "Purchase Price": 8500,
        "Condition": "Excellent",
        "Location": "House"
    }
]

# ============================================
# Document Expiry Data
# ============================================
today = datetime.now()
DOCUMENTS = [
    {
        "Doc Name": "Property Charter",
        "Type": "Governance",
        "Last Review": (today - timedelta(days=180)).strftime("%Y-%m-%d"),
        "Next Review": (today + timedelta(days=185)).strftime("%Y-%m-%d"),
        "Renewal Cycle": "Annual",
        "Alert Schedule": "60d, 30d, 7d"
    },
    {
        "Doc Name": "House Rules",
        "Type": "Governance",
        "Last Review": (today - timedelta(days=90)).strftime("%Y-%m-%d"),
        "Next Review": (today + timedelta(days=275)).strftime("%Y-%m-%d"),
        "Renewal Cycle": "Annual",
        "Alert Schedule": "60d, 30d, 7d"
    },
    {
        "Doc Name": "Workshop Safety Manual",
        "Type": "Safety",
        "Last Review": (today - timedelta(days=60)).strftime("%Y-%m-%d"),
        "Next Review": (today + timedelta(days=305)).strftime("%Y-%m-%d"),
        "Renewal Cycle": "Annual",
        "Alert Schedule": "60d, 30d, 7d"
    },
    {
        "Doc Name": "Employment Contract - Charl",
        "Type": "HR",
        "Last Review": (today - timedelta(days=365)).strftime("%Y-%m-%d"),
        "Next Review": (today + timedelta(days=730)).strftime("%Y-%m-%d"),
        "Renewal Cycle": "3-Year",
        "Alert Schedule": "60d, 30d, 7d"
    },
    {
        "Doc Name": "Employment Contract - Lucky",
        "Type": "HR",
        "Last Review": (today - timedelta(days=180)).strftime("%Y-%m-%d"),
        "Next Review": (today + timedelta(days=915)).strftime("%Y-%m-%d"),
        "Renewal Cycle": "3-Year",
        "Alert Schedule": "60d, 30d, 7d"
    },
    {
        "Doc Name": "Resident Agreement - Irma",
        "Type": "Governance",
        "Last Review": (today - timedelta(days=365)).strftime("%Y-%m-%d"),
        "Next Review": (today + timedelta(days=365)).strftime("%Y-%m-%d"),
        "Renewal Cycle": "2-Year",
        "Alert Schedule": "60d, 30d, 7d"
    },
    {
        "Doc Name": "Vehicle Usage Policy",
        "Type": "Operations",
        "Last Review": (today - timedelta(days=120)).strftime("%Y-%m-%d"),
        "Next Review": (today + timedelta(days=245)).strftime("%Y-%m-%d"),
        "Renewal Cycle": "Annual",
        "Alert Schedule": "60d, 30d, 7d"
    },
    {
        "Doc Name": "Tool Checkout Policy",
        "Type": "Operations",
        "Last Review": (today - timedelta(days=100)).strftime("%Y-%m-%d"),
        "Next Review": (today + timedelta(days=265)).strftime("%Y-%m-%d"),
        "Renewal Cycle": "Annual",
        "Alert Schedule": "60d, 30d, 7d"
    },
    {
        "Doc Name": "Expense Reimbursement Policy",
        "Type": "Finance",
        "Last Review": (today - timedelta(days=200)).strftime("%Y-%m-%d"),
        "Next Review": (today + timedelta(days=165)).strftime("%Y-%m-%d"),
        "Renewal Cycle": "Annual",
        "Alert Schedule": "60d, 30d, 7d"
    },
    {
        "Doc Name": "Leave Policy",
        "Type": "HR",
        "Last Review": (today - timedelta(days=150)).strftime("%Y-%m-%d"),
        "Next Review": (today + timedelta(days=215)).strftime("%Y-%m-%d"),
        "Renewal Cycle": "Annual",
        "Alert Schedule": "60d, 30d, 7d"
    },
    {
        "Doc Name": "Overtime Policy",
        "Type": "HR",
        "Last Review": (today - timedelta(days=150)).strftime("%Y-%m-%d"),
        "Next Review": (today + timedelta(days=215)).strftime("%Y-%m-%d"),
        "Renewal Cycle": "Annual",
        "Alert Schedule": "60d, 30d, 7d"
    },
    {
        "Doc Name": "Incident Reporting Procedure",
        "Type": "Safety",
        "Last Review": (today - timedelta(days=80)).strftime("%Y-%m-%d"),
        "Next Review": (today + timedelta(days=285)).strftime("%Y-%m-%d"),
        "Renewal Cycle": "Annual",
        "Alert Schedule": "60d, 30d, 7d"
    },
    {
        "Doc Name": "Emergency Contact List",
        "Type": "Safety",
        "Last Review": (today - timedelta(days=30)).strftime("%Y-%m-%d"),
        "Next Review": (today + timedelta(days=60)).strftime("%Y-%m-%d"),
        "Renewal Cycle": "Annual",
        "Alert Schedule": "60d, 30d, 7d"
    },
    {
        "Doc Name": "Asset Maintenance Schedule",
        "Type": "Operations",
        "Last Review": (today - timedelta(days=45)).strftime("%Y-%m-%d"),
        "Next Review": (today + timedelta(days=320)).strftime("%Y-%m-%d"),
        "Renewal Cycle": "Annual",
        "Alert Schedule": "60d, 30d, 7d"
    },
    {
        "Doc Name": "Garden Maintenance Plan",
        "Type": "Operations",
        "Last Review": (today - timedelta(days=60)).strftime("%Y-%m-%d"),
        "Next Review": (today + timedelta(days=305)).strftime("%Y-%m-%d"),
        "Renewal Cycle": "Annual",
        "Alert Schedule": "60d, 30d, 7d"
    },
    {
        "Doc Name": "Household Task Roster",
        "Type": "Operations",
        "Last Review": (today - timedelta(days=15)).strftime("%Y-%m-%d"),
        "Next Review": (today + timedelta(days=75)).strftime("%Y-%m-%d"),
        "Renewal Cycle": "Annual",
        "Alert Schedule": "60d, 30d, 7d"
    },
    {
        "Doc Name": "Financial Approval Matrix",
        "Type": "Finance",
        "Last Review": (today - timedelta(days=180)).strftime("%Y-%m-%d"),
        "Next Review": (today + timedelta(days=185)).strftime("%Y-%m-%d"),
        "Renewal Cycle": "Annual",
        "Alert Schedule": "60d, 30d, 7d"
    },
    {
        "Doc Name": "POPIA Consent Form",
        "Type": "Compliance",
        "Last Review": (today - timedelta(days=365)).strftime("%Y-%m-%d"),
        "Next Review": (today + timedelta(days=730)).strftime("%Y-%m-%d"),
        "Renewal Cycle": "3-Year",
        "Alert Schedule": "60d, 30d, 7d"
    },
    {
        "Doc Name": "Succession Protocol",
        "Type": "Governance",
        "Last Review": (today - timedelta(days=500)).strftime("%Y-%m-%d"),
        "Next Review": (today + timedelta(days=595)).strftime("%Y-%m-%d"),
        "Renewal Cycle": "3-Year",
        "Alert Schedule": "60d, 30d, 7d"
    }
]

# ============================================
# Sample Tasks
# ============================================
TASKS = [
    {
        "Title": "Weekly lawn mowing",
        "Description": "Mow front and back lawns, edge pathways",
        "Due Date": (today + timedelta(days=2)).strftime("%Y-%m-%d"),
        "Priority": "Medium",
        "Status": "Not Started",
        "Project": "Garden",
        "Is Recurring": True,
        "Recurrence": "Weekly"
    },
    {
        "Title": "Service Toyota Hilux",
        "Description": "10,000km service - oil change, filter replacement",
        "Due Date": (today + timedelta(days=14)).strftime("%Y-%m-%d"),
        "Priority": "High",
        "Status": "Not Started",
        "Project": "Vehicle Maintenance"
    },
    {
        "Title": "Organize workshop tools",
        "Description": "Sort and label all tools, update inventory",
        "Due Date": (today + timedelta(days=7)).strftime("%Y-%m-%d"),
        "Priority": "Low",
        "Status": "In Progress",
        "Project": "Workshop",
        "Time Spent": 2
    },
    {
        "Title": "Fix garden irrigation",
        "Description": "Repair broken sprinkler heads in zone 3",
        "Due Date": (today + timedelta(days=3)).strftime("%Y-%m-%d"),
        "Priority": "High",
        "Status": "Not Started",
        "Project": "Garden"
    },
    {
        "Title": "Prepare monthly expense report",
        "Description": "Compile all receipts and submit to Hans",
        "Due Date": (today + timedelta(days=5)).strftime("%Y-%m-%d"),
        "Priority": "Medium",
        "Status": "Not Started",
        "Project": "Administration",
        "Is Recurring": True,
        "Recurrence": "Monthly"
    }
]


def seed_employees():
    """Seed employee data."""
    print("Seeding employees...")
    for emp in EMPLOYEES:
        try:
            result = create_row(TABLE_IDS["employees"], emp)
            print(f"  Created: {emp['Full Name']} (ID: {result['id']})")
        except Exception as e:
            print(f"  Error creating {emp['Full Name']}: {e}")


def seed_assets():
    """Seed asset data."""
    print("Seeding assets...")
    for asset in ASSETS:
        try:
            result = create_row(TABLE_IDS["assets"], asset)
            print(f"  Created: {asset['Asset ID']} - {asset['Description']} (ID: {result['id']})")
        except Exception as e:
            print(f"  Error creating {asset['Asset ID']}: {e}")


def seed_documents():
    """Seed document expiry data."""
    print("Seeding documents...")
    for doc in DOCUMENTS:
        try:
            result = create_row(TABLE_IDS["document_expiry"], doc)
            print(f"  Created: {doc['Doc Name']} (ID: {result['id']})")
        except Exception as e:
            print(f"  Error creating {doc['Doc Name']}: {e}")


def seed_tasks():
    """Seed sample tasks."""
    print("Seeding tasks...")
    for task in TASKS:
        try:
            result = create_row(TABLE_IDS["tasks"], task)
            print(f"  Created: {task['Title']} (ID: {result['id']})")
        except Exception as e:
            print(f"  Error creating {task['Title']}: {e}")


def main():
    """Main entry point."""
    print("=" * 60)
    print("House of Veritas - Baserow Data Seeding")
    print("=" * 60)
    
    if not BASEROW_TOKEN:
        print("\nERROR: BASEROW_TOKEN environment variable not set!")
        print("Please set the token: export BASEROW_TOKEN='your-token'")
        return
    
    print(f"\nUsing Baserow URL: {BASEROW_URL}")
    print("\nIMPORTANT: Update TABLE_IDS in this script with actual table IDs from Baserow!")
    print("\nStarting seed process...\n")
    
    # Uncomment to run seeding (after updating TABLE_IDS)
    # seed_employees()
    # seed_assets()
    # seed_documents()
    # seed_tasks()
    
    print("\n" + "=" * 60)
    print("Seeding complete! (dry run - uncomment functions to execute)")
    print("=" * 60)


if __name__ == "__main__":
    main()
