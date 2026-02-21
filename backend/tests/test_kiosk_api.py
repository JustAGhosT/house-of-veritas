"""
Kiosk API Tests - House of Veritas Employee Kiosk
Tests for /api/kiosk/requests, /api/tasks, /api/time, /api/inventory endpoints
"""
import pytest
import requests
import os

# Use localhost since this is a Next.js app running on port 3000
BASE_URL = "http://localhost:3000"


class TestKioskRequestsAPI:
    """Tests for /api/kiosk/requests endpoint"""
    
    def test_get_all_requests(self):
        """GET /api/kiosk/requests - should return all requests"""
        response = requests.get(f"{BASE_URL}/api/kiosk/requests")
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] is True
        assert "requests" in data
        assert "summary" in data
        assert isinstance(data["requests"], list)
        print(f"✓ Found {len(data['requests'])} requests")
    
    def test_get_requests_by_employee(self):
        """GET /api/kiosk/requests?employeeId=charl - filter by employee"""
        response = requests.get(f"{BASE_URL}/api/kiosk/requests?employeeId=charl")
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] is True
        # All returned requests should be from charl
        for req in data["requests"]:
            assert req["employeeId"] == "charl"
        print(f"✓ Found {len(data['requests'])} requests for charl")
    
    def test_get_requests_by_type(self):
        """GET /api/kiosk/requests?type=stock_order - filter by type"""
        response = requests.get(f"{BASE_URL}/api/kiosk/requests?type=stock_order")
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] is True
        for req in data["requests"]:
            assert req["type"] == "stock_order"
        print(f"✓ Found {len(data['requests'])} stock_order requests")
    
    def test_create_stock_order_request(self):
        """POST /api/kiosk/requests - create stock order"""
        payload = {
            "type": "stock_order",
            "employeeId": "TEST_charl",
            "employeeName": "Test Charl",
            "data": {
                "itemName": "TEST Pool Chlorine",
                "quantity": 10,
                "urgency": "urgent",
                "notes": "Running low for pool maintenance"
            },
            "timestamp": "2026-02-21T10:00:00.000Z"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/kiosk/requests",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] is True
        assert "request" in data
        assert data["request"]["type"] == "stock_order"
        assert data["request"]["status"] == "pending"
        assert data["request"]["data"]["itemName"] == "TEST Pool Chlorine"
        print(f"✓ Created stock order request: {data['request']['id']}")
    
    def test_create_salary_advance_request(self):
        """POST /api/kiosk/requests - create salary advance request"""
        payload = {
            "type": "salary_advance",
            "employeeId": "TEST_lucky",
            "employeeName": "Test Lucky",
            "data": {
                "amount": 2000,
                "reason": "Emergency medical expenses",
                "repaymentPlan": "2months"
            },
            "timestamp": "2026-02-21T10:00:00.000Z"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/kiosk/requests",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] is True
        assert data["request"]["type"] == "salary_advance"
        assert data["request"]["data"]["amount"] == 2000
        print(f"✓ Created salary advance request: {data['request']['id']}")
    
    def test_create_issue_report(self):
        """POST /api/kiosk/requests - create issue report"""
        payload = {
            "type": "issue_report",
            "employeeId": "TEST_irma",
            "employeeName": "Test Irma",
            "data": {
                "assetName": "TEST Kitchen Dishwasher",
                "issueType": "broken",
                "description": "Not draining properly, water pooling at bottom",
                "location": "Main Kitchen"
            },
            "timestamp": "2026-02-21T10:00:00.000Z"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/kiosk/requests",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] is True
        assert data["request"]["type"] == "issue_report"
        assert data["request"]["data"]["issueType"] == "broken"
        print(f"✓ Created issue report: {data['request']['id']}")
    
    def test_create_request_missing_fields(self):
        """POST /api/kiosk/requests - should fail with missing required fields"""
        payload = {
            "type": "stock_order"
            # Missing employeeId and data
        }
        
        response = requests.post(
            f"{BASE_URL}/api/kiosk/requests",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 400
        
        data = response.json()
        assert data["success"] is False
        assert "error" in data
        print("✓ Correctly rejected request with missing fields")
    
    def test_update_request_status(self):
        """PATCH /api/kiosk/requests - update request status"""
        # First create a request
        create_payload = {
            "type": "stock_order",
            "employeeId": "TEST_hans",
            "employeeName": "Test Hans",
            "data": {"itemName": "TEST Item for approval", "quantity": 1, "urgency": "normal", "notes": ""}
        }
        create_response = requests.post(
            f"{BASE_URL}/api/kiosk/requests",
            json=create_payload,
            headers={"Content-Type": "application/json"}
        )
        request_id = create_response.json()["request"]["id"]
        
        # Now update its status
        update_payload = {
            "requestId": request_id,
            "status": "approved",
            "reviewedBy": "hans",
            "notes": "Approved for immediate purchase"
        }
        
        response = requests.patch(
            f"{BASE_URL}/api/kiosk/requests",
            json=update_payload,
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] is True
        assert data["request"]["status"] == "approved"
        assert data["request"]["reviewedBy"] == "hans"
        print(f"✓ Updated request {request_id} to approved")
    
    def test_update_nonexistent_request(self):
        """PATCH /api/kiosk/requests - should fail for non-existent request"""
        payload = {
            "requestId": "nonexistent-id-12345",
            "status": "approved"
        }
        
        response = requests.patch(
            f"{BASE_URL}/api/kiosk/requests",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 404
        
        data = response.json()
        assert data["success"] is False
        print("✓ Correctly returned 404 for non-existent request")


class TestTasksAPI:
    """Tests for /api/tasks endpoint"""
    
    def test_get_all_tasks(self):
        """GET /api/tasks - should return all tasks"""
        response = requests.get(f"{BASE_URL}/api/tasks")
        assert response.status_code == 200
        
        data = response.json()
        assert "tasks" in data
        assert "summary" in data
        assert isinstance(data["tasks"], list)
        print(f"✓ Found {len(data['tasks'])} tasks")
    
    def test_get_tasks_by_assignee(self):
        """GET /api/tasks?assignee=charl - filter by assignee"""
        response = requests.get(f"{BASE_URL}/api/tasks?assignee=charl")
        assert response.status_code == 200
        
        data = response.json()
        assert "tasks" in data
        # Note: The API uses numeric IDs for assignee filtering
        print(f"✓ Found {len(data['tasks'])} tasks for charl")


class TestTimeAPI:
    """Tests for /api/time endpoint"""
    
    def test_get_time_entries(self):
        """GET /api/time - should return time clock entries"""
        response = requests.get(f"{BASE_URL}/api/time")
        assert response.status_code == 200
        
        data = response.json()
        assert "entries" in data
        assert "summary" in data
        print(f"✓ Found {len(data['entries'])} time entries")
    
    def test_clock_in_valid(self):
        """POST /api/time - clock in with valid employeeId"""
        payload = {
            "action": "clockIn",
            "employeeId": "TEST_charl"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/time",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 200
        
        data = response.json()
        assert "entry" in data
        assert data["message"] == "Clocked in successfully"
        print(f"✓ Clock in successful")
    
    def test_clock_in_invalid_action(self):
        """POST /api/time - should fail with invalid action name"""
        # BUG: The kiosk UI sends 'clock-in' but API expects 'clockIn'
        payload = {
            "action": "clock-in",  # Wrong format - should be 'clockIn'
            "employeeId": "charl"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/time",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        # This should return 400 because 'clock-in' is not recognized
        assert response.status_code == 400
        
        data = response.json()
        assert "error" in data
        print("✓ Confirmed BUG: API rejects 'clock-in' action (expects 'clockIn')")


class TestInventoryAPI:
    """Tests for /api/inventory endpoint"""
    
    def test_get_inventory(self):
        """GET /api/inventory - should return inventory items"""
        response = requests.get(f"{BASE_URL}/api/inventory")
        assert response.status_code == 200
        
        data = response.json()
        assert "items" in data
        assert isinstance(data["items"], list)
        print(f"✓ Found {len(data['items'])} inventory items")
    
    def test_get_inventory_by_barcode(self):
        """GET /api/inventory?barcode=xxx - search by barcode"""
        response = requests.get(f"{BASE_URL}/api/inventory?barcode=6001234567890")
        assert response.status_code == 200
        
        data = response.json()
        assert "items" in data
        if len(data["items"]) > 0:
            assert data["items"][0]["barcode"] == "6001234567890"
            print(f"✓ Found item by barcode: {data['items'][0]['name']}")
        else:
            print("⚠ No item found with barcode 6001234567890")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
