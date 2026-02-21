"""
Test suite for Manager Approval Workflow API
Tests the /api/kiosk/requests endpoint for approvals functionality
"""
import pytest
import requests
import os

# Use localhost since this is a Next.js app
BASE_URL = "http://localhost:3000"


class TestKioskRequestsAPI:
    """Tests for /api/kiosk/requests endpoint"""
    
    def test_get_all_requests(self):
        """GET /api/kiosk/requests - Returns all requests with summary"""
        response = requests.get(f"{BASE_URL}/api/kiosk/requests")
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] == True
        assert "requests" in data
        assert "summary" in data
        assert isinstance(data["requests"], list)
        
        # Verify summary structure
        summary = data["summary"]
        assert "total" in summary
        assert "pending" in summary
        assert "approved" in summary
        assert "byType" in summary
        assert "stock_order" in summary["byType"]
        assert "salary_advance" in summary["byType"]
        assert "issue_report" in summary["byType"]
        print(f"SUCCESS: GET all requests - {len(data['requests'])} requests, {summary['pending']} pending")
    
    def test_get_requests_filter_by_type_stock_order(self):
        """GET /api/kiosk/requests?type=stock_order - Filter by stock orders"""
        response = requests.get(f"{BASE_URL}/api/kiosk/requests?type=stock_order")
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] == True
        
        # All returned requests should be stock_order type
        for req in data["requests"]:
            assert req["type"] == "stock_order"
        print(f"SUCCESS: Filter by stock_order - {len(data['requests'])} results")
    
    def test_get_requests_filter_by_type_salary_advance(self):
        """GET /api/kiosk/requests?type=salary_advance - Filter by salary advances"""
        response = requests.get(f"{BASE_URL}/api/kiosk/requests?type=salary_advance")
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] == True
        
        for req in data["requests"]:
            assert req["type"] == "salary_advance"
        print(f"SUCCESS: Filter by salary_advance - {len(data['requests'])} results")
    
    def test_get_requests_filter_by_type_issue_report(self):
        """GET /api/kiosk/requests?type=issue_report - Filter by issue reports"""
        response = requests.get(f"{BASE_URL}/api/kiosk/requests?type=issue_report")
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] == True
        
        for req in data["requests"]:
            assert req["type"] == "issue_report"
        print(f"SUCCESS: Filter by issue_report - {len(data['requests'])} results")
    
    def test_get_requests_filter_by_status_pending(self):
        """GET /api/kiosk/requests?status=pending - Filter by pending status"""
        response = requests.get(f"{BASE_URL}/api/kiosk/requests?status=pending")
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] == True
        
        for req in data["requests"]:
            assert req["status"] == "pending"
        print(f"SUCCESS: Filter by pending status - {len(data['requests'])} results")
    
    def test_get_requests_filter_by_status_approved(self):
        """GET /api/kiosk/requests?status=approved - Filter by approved status"""
        response = requests.get(f"{BASE_URL}/api/kiosk/requests?status=approved")
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] == True
        
        for req in data["requests"]:
            assert req["status"] == "approved"
        print(f"SUCCESS: Filter by approved status - {len(data['requests'])} results")
    
    def test_get_requests_filter_by_status_rejected(self):
        """GET /api/kiosk/requests?status=rejected - Filter by rejected status"""
        response = requests.get(f"{BASE_URL}/api/kiosk/requests?status=rejected")
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] == True
        
        for req in data["requests"]:
            assert req["status"] == "rejected"
        print(f"SUCCESS: Filter by rejected status - {len(data['requests'])} results")
    
    def test_get_requests_filter_by_employee(self):
        """GET /api/kiosk/requests?employeeId=charl - Filter by employee"""
        response = requests.get(f"{BASE_URL}/api/kiosk/requests?employeeId=charl")
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] == True
        
        for req in data["requests"]:
            assert req["employeeId"] == "charl"
        print(f"SUCCESS: Filter by employeeId=charl - {len(data['requests'])} results")


class TestApprovalWorkflow:
    """Tests for approval/rejection workflow via PATCH"""
    
    def test_create_and_approve_request(self):
        """POST then PATCH - Create request and approve it"""
        # Create a new request
        create_payload = {
            "type": "stock_order",
            "employeeId": "test_user",
            "employeeName": "Test User",
            "data": {
                "itemName": "TEST_Approval_Item",
                "quantity": 1,
                "urgency": "normal",
                "notes": "Test approval workflow"
            }
        }
        
        create_response = requests.post(
            f"{BASE_URL}/api/kiosk/requests",
            json=create_payload
        )
        assert create_response.status_code == 200
        
        created_data = create_response.json()
        assert created_data["success"] == True
        request_id = created_data["request"]["id"]
        print(f"Created request: {request_id}")
        
        # Approve the request
        approve_payload = {
            "requestId": request_id,
            "status": "approved",
            "reviewedBy": "hans",
            "notes": "Approved via test"
        }
        
        approve_response = requests.patch(
            f"{BASE_URL}/api/kiosk/requests",
            json=approve_payload
        )
        assert approve_response.status_code == 200
        
        approved_data = approve_response.json()
        assert approved_data["success"] == True
        assert approved_data["request"]["status"] == "approved"
        assert approved_data["request"]["reviewedBy"] == "hans"
        assert approved_data["request"]["notes"] == "Approved via test"
        assert "reviewedAt" in approved_data["request"]
        print(f"SUCCESS: Request {request_id} approved")
    
    def test_create_and_reject_request(self):
        """POST then PATCH - Create request and reject it"""
        # Create a new request
        create_payload = {
            "type": "salary_advance",
            "employeeId": "test_user",
            "employeeName": "Test User",
            "data": {
                "amount": 500,
                "reason": "TEST_Rejection_Test",
                "repaymentPlan": "1month"
            }
        }
        
        create_response = requests.post(
            f"{BASE_URL}/api/kiosk/requests",
            json=create_payload
        )
        assert create_response.status_code == 200
        
        created_data = create_response.json()
        request_id = created_data["request"]["id"]
        print(f"Created request: {request_id}")
        
        # Reject the request
        reject_payload = {
            "requestId": request_id,
            "status": "rejected",
            "reviewedBy": "hans",
            "notes": "Rejected - insufficient documentation"
        }
        
        reject_response = requests.patch(
            f"{BASE_URL}/api/kiosk/requests",
            json=reject_payload
        )
        assert reject_response.status_code == 200
        
        rejected_data = reject_response.json()
        assert rejected_data["success"] == True
        assert rejected_data["request"]["status"] == "rejected"
        assert rejected_data["request"]["reviewedBy"] == "hans"
        assert "reviewedAt" in rejected_data["request"]
        print(f"SUCCESS: Request {request_id} rejected")
    
    def test_patch_missing_request_id(self):
        """PATCH /api/kiosk/requests - Missing requestId returns 400"""
        response = requests.patch(
            f"{BASE_URL}/api/kiosk/requests",
            json={"status": "approved"}
        )
        assert response.status_code == 400
        
        data = response.json()
        assert data["success"] == False
        assert "error" in data
        print("SUCCESS: Missing requestId returns 400")
    
    def test_patch_missing_status(self):
        """PATCH /api/kiosk/requests - Missing status returns 400"""
        response = requests.patch(
            f"{BASE_URL}/api/kiosk/requests",
            json={"requestId": "req-001"}
        )
        assert response.status_code == 400
        
        data = response.json()
        assert data["success"] == False
        print("SUCCESS: Missing status returns 400")
    
    def test_patch_nonexistent_request(self):
        """PATCH /api/kiosk/requests - Non-existent request returns 404"""
        response = requests.patch(
            f"{BASE_URL}/api/kiosk/requests",
            json={
                "requestId": "nonexistent-request-id",
                "status": "approved"
            }
        )
        assert response.status_code == 404
        
        data = response.json()
        assert data["success"] == False
        print("SUCCESS: Non-existent request returns 404")


class TestRequestCreation:
    """Tests for creating new requests via POST"""
    
    def test_create_stock_order(self):
        """POST /api/kiosk/requests - Create stock order"""
        payload = {
            "type": "stock_order",
            "employeeId": "test_user",
            "employeeName": "Test User",
            "data": {
                "itemName": "TEST_Stock_Item",
                "quantity": 5,
                "urgency": "urgent",
                "notes": "Test stock order"
            }
        }
        
        response = requests.post(f"{BASE_URL}/api/kiosk/requests", json=payload)
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] == True
        assert data["request"]["type"] == "stock_order"
        assert data["request"]["status"] == "pending"
        assert data["request"]["employeeName"] == "Test User"
        assert "id" in data["request"]
        assert "timestamp" in data["request"]
        print(f"SUCCESS: Created stock order {data['request']['id']}")
    
    def test_create_salary_advance(self):
        """POST /api/kiosk/requests - Create salary advance"""
        payload = {
            "type": "salary_advance",
            "employeeId": "test_user",
            "employeeName": "Test User",
            "data": {
                "amount": 1000,
                "reason": "TEST_Salary_Advance",
                "repaymentPlan": "2months"
            }
        }
        
        response = requests.post(f"{BASE_URL}/api/kiosk/requests", json=payload)
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] == True
        assert data["request"]["type"] == "salary_advance"
        assert data["request"]["status"] == "pending"
        print(f"SUCCESS: Created salary advance {data['request']['id']}")
    
    def test_create_issue_report(self):
        """POST /api/kiosk/requests - Create issue report"""
        payload = {
            "type": "issue_report",
            "employeeId": "test_user",
            "employeeName": "Test User",
            "data": {
                "assetName": "TEST_Asset",
                "issueType": "safety",
                "description": "Test safety issue",
                "location": "Test Location"
            }
        }
        
        response = requests.post(f"{BASE_URL}/api/kiosk/requests", json=payload)
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] == True
        assert data["request"]["type"] == "issue_report"
        assert data["request"]["status"] == "pending"
        print(f"SUCCESS: Created issue report {data['request']['id']}")
    
    def test_create_request_missing_fields(self):
        """POST /api/kiosk/requests - Missing required fields returns 400"""
        payload = {
            "type": "stock_order"
            # Missing employeeId and data
        }
        
        response = requests.post(f"{BASE_URL}/api/kiosk/requests", json=payload)
        assert response.status_code == 400
        
        data = response.json()
        assert data["success"] == False
        print("SUCCESS: Missing fields returns 400")


class TestSeedData:
    """Tests to verify seed data is present"""
    
    def test_seed_data_has_safety_issue(self):
        """Verify seed data includes a safety issue report"""
        response = requests.get(f"{BASE_URL}/api/kiosk/requests?type=issue_report")
        assert response.status_code == 200
        
        data = response.json()
        safety_issues = [r for r in data["requests"] if r.get("data", {}).get("issueType") == "safety"]
        assert len(safety_issues) > 0, "Should have at least one safety issue in seed data"
        print(f"SUCCESS: Found {len(safety_issues)} safety issue(s) in seed data")
    
    def test_seed_data_has_urgent_stock_order(self):
        """Verify seed data includes an urgent stock order"""
        response = requests.get(f"{BASE_URL}/api/kiosk/requests?type=stock_order")
        assert response.status_code == 200
        
        data = response.json()
        urgent_orders = [r for r in data["requests"] if r.get("data", {}).get("urgency") == "urgent"]
        assert len(urgent_orders) > 0, "Should have at least one urgent stock order in seed data"
        print(f"SUCCESS: Found {len(urgent_orders)} urgent stock order(s) in seed data")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
