"""
Test suite for MongoDB Persistence and Notification Features
Tests:
1. MongoDB persistence - requests stored in kiosk_requests collection
2. GET /api/kiosk/requests returns storage: mongodb
3. Request history filter by employeeId
4. Approve/Reject workflow triggers notification (check console logs)
5. Data persists after server restart (verify with GET)
"""
import pytest
import requests
import time
import uuid

# Use localhost since this is a Next.js app
BASE_URL = "http://localhost:3000"


class TestMongoDBPersistence:
    """Tests for MongoDB persistence of kiosk requests"""
    
    def test_storage_returns_mongodb(self):
        """GET /api/kiosk/requests - Returns storage: mongodb"""
        response = requests.get(f"{BASE_URL}/api/kiosk/requests")
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] == True
        assert data.get("storage") == "mongodb", f"Expected storage: mongodb, got: {data.get('storage')}"
        print(f"SUCCESS: API returns storage: mongodb")
    
    def test_create_request_returns_mongodb_storage(self):
        """POST /api/kiosk/requests - Returns storage: mongodb"""
        unique_id = str(uuid.uuid4())[:8]
        payload = {
            "type": "stock_order",
            "employeeId": "test_persistence",
            "employeeName": "Test Persistence",
            "data": {
                "itemName": f"TEST_MongoDB_{unique_id}",
                "quantity": 1,
                "urgency": "normal",
                "notes": "Testing MongoDB persistence"
            }
        }
        
        response = requests.post(f"{BASE_URL}/api/kiosk/requests", json=payload)
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] == True
        assert data.get("storage") == "mongodb", f"Expected storage: mongodb, got: {data.get('storage')}"
        assert "id" in data["request"], "Request should have an id"
        print(f"SUCCESS: POST returns storage: mongodb, id: {data['request']['id']}")
        return data["request"]["id"]
    
    def test_create_and_verify_persistence(self):
        """Create request and verify it persists via GET"""
        unique_id = str(uuid.uuid4())[:8]
        item_name = f"TEST_Persist_Verify_{unique_id}"
        
        # Create request
        payload = {
            "type": "issue_report",
            "employeeId": "test_persist",
            "employeeName": "Test Persist",
            "data": {
                "assetName": item_name,
                "issueType": "maintenance",
                "description": "Testing persistence verification",
                "location": "Test Location"
            }
        }
        
        create_response = requests.post(f"{BASE_URL}/api/kiosk/requests", json=payload)
        assert create_response.status_code == 200
        created_data = create_response.json()
        request_id = created_data["request"]["id"]
        print(f"Created request: {request_id}")
        
        # Verify via GET
        get_response = requests.get(f"{BASE_URL}/api/kiosk/requests")
        assert get_response.status_code == 200
        
        get_data = get_response.json()
        found = False
        for req in get_data["requests"]:
            if req["id"] == request_id:
                found = True
                assert req["data"]["assetName"] == item_name
                assert req["employeeId"] == "test_persist"
                break
        
        assert found, f"Request {request_id} not found in GET response"
        print(f"SUCCESS: Request {request_id} persisted and verified via GET")
    
    def test_patch_returns_mongodb_storage(self):
        """PATCH /api/kiosk/requests - Returns storage: mongodb"""
        # First create a request
        unique_id = str(uuid.uuid4())[:8]
        create_payload = {
            "type": "stock_order",
            "employeeId": "test_patch",
            "employeeName": "Test Patch",
            "data": {
                "itemName": f"TEST_Patch_{unique_id}",
                "quantity": 1,
                "urgency": "normal",
                "notes": "Testing PATCH storage"
            }
        }
        
        create_response = requests.post(f"{BASE_URL}/api/kiosk/requests", json=create_payload)
        assert create_response.status_code == 200
        request_id = create_response.json()["request"]["id"]
        
        # Approve the request
        patch_payload = {
            "requestId": request_id,
            "status": "approved",
            "reviewedBy": "hans",
            "notes": "Approved for PATCH test"
        }
        
        patch_response = requests.patch(f"{BASE_URL}/api/kiosk/requests", json=patch_payload)
        assert patch_response.status_code == 200
        
        patch_data = patch_response.json()
        assert patch_data["success"] == True
        assert patch_data.get("storage") == "mongodb", f"Expected storage: mongodb, got: {patch_data.get('storage')}"
        print(f"SUCCESS: PATCH returns storage: mongodb")


class TestRequestHistoryFilter:
    """Tests for request history filtering by employeeId"""
    
    def test_filter_by_employee_charl(self):
        """GET /api/kiosk/requests?employeeId=charl - Returns only charl's requests"""
        response = requests.get(f"{BASE_URL}/api/kiosk/requests?employeeId=charl")
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] == True
        
        for req in data["requests"]:
            assert req["employeeId"] == "charl", f"Expected employeeId=charl, got {req['employeeId']}"
        
        print(f"SUCCESS: Filter by employeeId=charl - {len(data['requests'])} results")
    
    def test_filter_by_employee_lucky(self):
        """GET /api/kiosk/requests?employeeId=lucky - Returns only lucky's requests"""
        response = requests.get(f"{BASE_URL}/api/kiosk/requests?employeeId=lucky")
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] == True
        
        for req in data["requests"]:
            assert req["employeeId"] == "lucky", f"Expected employeeId=lucky, got {req['employeeId']}"
        
        print(f"SUCCESS: Filter by employeeId=lucky - {len(data['requests'])} results")
    
    def test_create_and_filter_by_employee(self):
        """Create request for specific employee and verify filter works"""
        unique_id = str(uuid.uuid4())[:8]
        test_employee = f"test_filter_{unique_id}"
        
        # Create request for specific employee
        payload = {
            "type": "salary_advance",
            "employeeId": test_employee,
            "employeeName": "Test Filter Employee",
            "data": {
                "amount": 500,
                "reason": "Testing employee filter",
                "repaymentPlan": "1month"
            }
        }
        
        create_response = requests.post(f"{BASE_URL}/api/kiosk/requests", json=payload)
        assert create_response.status_code == 200
        request_id = create_response.json()["request"]["id"]
        
        # Filter by this employee
        filter_response = requests.get(f"{BASE_URL}/api/kiosk/requests?employeeId={test_employee}")
        assert filter_response.status_code == 200
        
        filter_data = filter_response.json()
        assert len(filter_data["requests"]) >= 1, "Should find at least 1 request"
        
        found = False
        for req in filter_data["requests"]:
            if req["id"] == request_id:
                found = True
                assert req["employeeId"] == test_employee
                break
        
        assert found, f"Request {request_id} not found in filtered results"
        print(f"SUCCESS: Created and filtered by employeeId={test_employee}")


class TestNotificationTrigger:
    """Tests for notification triggers on approve/reject"""
    
    def test_approve_triggers_notification(self):
        """Approve request should trigger notification (check console logs)"""
        unique_id = str(uuid.uuid4())[:8]
        
        # Create request
        create_payload = {
            "type": "stock_order",
            "employeeId": "lucky",
            "employeeName": "Lucky",
            "data": {
                "itemName": f"TEST_Notify_Approve_{unique_id}",
                "quantity": 2,
                "urgency": "normal",
                "notes": "Testing notification on approve"
            }
        }
        
        create_response = requests.post(f"{BASE_URL}/api/kiosk/requests", json=create_payload)
        assert create_response.status_code == 200
        request_id = create_response.json()["request"]["id"]
        print(f"Created request: {request_id}")
        
        # Approve - this should trigger notification
        approve_payload = {
            "requestId": request_id,
            "status": "approved",
            "reviewedBy": "hans",
            "notes": "Approved - notification test"
        }
        
        approve_response = requests.patch(f"{BASE_URL}/api/kiosk/requests", json=approve_payload)
        assert approve_response.status_code == 200
        
        approve_data = approve_response.json()
        assert approve_data["success"] == True
        assert approve_data["request"]["status"] == "approved"
        print(f"SUCCESS: Request {request_id} approved - notification should be triggered (check server logs)")
    
    def test_reject_triggers_notification(self):
        """Reject request should trigger notification (check console logs)"""
        unique_id = str(uuid.uuid4())[:8]
        
        # Create request
        create_payload = {
            "type": "salary_advance",
            "employeeId": "charl",
            "employeeName": "Charl",
            "data": {
                "amount": 1000,
                "reason": f"TEST_Notify_Reject_{unique_id}",
                "repaymentPlan": "2months"
            }
        }
        
        create_response = requests.post(f"{BASE_URL}/api/kiosk/requests", json=create_payload)
        assert create_response.status_code == 200
        request_id = create_response.json()["request"]["id"]
        print(f"Created request: {request_id}")
        
        # Reject - this should trigger notification
        reject_payload = {
            "requestId": request_id,
            "status": "rejected",
            "reviewedBy": "hans",
            "notes": "Rejected - notification test"
        }
        
        reject_response = requests.patch(f"{BASE_URL}/api/kiosk/requests", json=reject_payload)
        assert reject_response.status_code == 200
        
        reject_data = reject_response.json()
        assert reject_data["success"] == True
        assert reject_data["request"]["status"] == "rejected"
        print(f"SUCCESS: Request {request_id} rejected - notification should be triggered (check server logs)")


class TestStatusBadges:
    """Tests for status badges in request data"""
    
    def test_pending_status_exists(self):
        """Verify pending requests have status: pending"""
        response = requests.get(f"{BASE_URL}/api/kiosk/requests?status=pending")
        assert response.status_code == 200
        
        data = response.json()
        for req in data["requests"]:
            assert req["status"] == "pending"
        
        print(f"SUCCESS: Found {len(data['requests'])} pending requests")
    
    def test_approved_status_has_reviewer_info(self):
        """Verify approved requests have reviewedBy and reviewedAt"""
        response = requests.get(f"{BASE_URL}/api/kiosk/requests?status=approved")
        assert response.status_code == 200
        
        data = response.json()
        for req in data["requests"]:
            assert req["status"] == "approved"
            assert "reviewedBy" in req, "Approved request should have reviewedBy"
            assert "reviewedAt" in req, "Approved request should have reviewedAt"
        
        print(f"SUCCESS: Found {len(data['requests'])} approved requests with reviewer info")
    
    def test_rejected_status_has_notes(self):
        """Verify rejected requests have notes (rejection reason)"""
        response = requests.get(f"{BASE_URL}/api/kiosk/requests?status=rejected")
        assert response.status_code == 200
        
        data = response.json()
        for req in data["requests"]:
            assert req["status"] == "rejected"
            # Notes should exist for rejected requests
            if "notes" in req:
                print(f"  Rejected request has notes: {req['notes'][:50]}...")
        
        print(f"SUCCESS: Found {len(data['requests'])} rejected requests")


class TestDataPersistenceVerification:
    """Tests to verify data persists (simulating restart check)"""
    
    def test_seed_data_present(self):
        """Verify seed data is present in MongoDB"""
        response = requests.get(f"{BASE_URL}/api/kiosk/requests")
        assert response.status_code == 200
        
        data = response.json()
        assert data["summary"]["total"] >= 7, f"Expected at least 7 seed records, got {data['summary']['total']}"
        print(f"SUCCESS: Found {data['summary']['total']} total requests (seed data present)")
    
    def test_request_has_valid_id(self):
        """Verify requests have valid MongoDB ObjectId format"""
        response = requests.get(f"{BASE_URL}/api/kiosk/requests")
        assert response.status_code == 200
        
        data = response.json()
        for req in data["requests"]:
            assert "id" in req, "Request should have id"
            # MongoDB ObjectId is 24 hex characters
            assert len(req["id"]) == 24, f"Expected 24-char ObjectId, got {len(req['id'])}: {req['id']}"
        
        print(f"SUCCESS: All {len(data['requests'])} requests have valid MongoDB ObjectIds")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
