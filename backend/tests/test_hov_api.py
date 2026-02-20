"""
House of Veritas API Tests
Tests for authentication, tasks, expenses, assets, time clock, and documents APIs
"""
import pytest
import requests
import os

BASE_URL = "http://localhost:3000"

class TestIntegrationStatus:
    """Integration status endpoint tests"""
    
    def test_get_integration_status(self):
        """Test GET /api/integration/status returns service status"""
        response = requests.get(f"{BASE_URL}/api/integration/status")
        assert response.status_code == 200
        
        data = response.json()
        assert "status" in data
        assert "services" in data
        assert "docuseal" in data["services"]
        assert "baserow" in data["services"]
        assert "twilio" in data["services"]
        
        # Verify service structure
        for service_name, service in data["services"].items():
            assert "name" in service
            assert "configured" in service
            assert "status" in service


class TestAuthLogin:
    """Authentication login endpoint tests"""
    
    def test_login_hans_success(self):
        """Test login with Hans credentials redirects to /dashboard/hans"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "hans@houseofv.com",
            "password": "hans123"
        })
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] == True
        assert data["redirectTo"] == "/dashboard/hans"
        assert data["user"]["id"] == "hans"
        assert data["user"]["email"] == "hans@houseofv.com"
        # Verify password is NOT in response
        assert "password" not in data["user"]
    
    def test_login_charl_success(self):
        """Test login with Charl credentials redirects to /dashboard/charl"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "charl@houseofv.com",
            "password": "charl123"
        })
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] == True
        assert data["redirectTo"] == "/dashboard/charl"
        assert data["user"]["id"] == "charl"
        assert "password" not in data["user"]
    
    def test_login_lucky_success(self):
        """Test login with Lucky credentials redirects to /dashboard/lucky"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "lucky@houseofv.com",
            "password": "lucky123"
        })
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] == True
        assert data["redirectTo"] == "/dashboard/lucky"
        assert data["user"]["id"] == "lucky"
    
    def test_login_irma_success(self):
        """Test login with Irma credentials redirects to /dashboard/irma"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "irma@houseofv.com",
            "password": "irma123"
        })
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] == True
        assert data["redirectTo"] == "/dashboard/irma"
        assert data["user"]["id"] == "irma"
    
    def test_login_invalid_password(self):
        """Test login with invalid password returns 401"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "hans@houseofv.com",
            "password": "wrongpassword"
        })
        assert response.status_code == 401
        
        data = response.json()
        assert "error" in data
        assert data["error"] == "Invalid password"
    
    def test_login_nonexistent_user(self):
        """Test login with non-existent email returns 401"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "nonexistent@houseofv.com",
            "password": "test123"
        })
        assert response.status_code == 401
        
        data = response.json()
        assert "error" in data
        assert data["error"] == "User not found"


class TestPasswordReset:
    """Password reset endpoint tests"""
    
    def test_reset_password_sms_success(self):
        """Test password reset via SMS generates new password"""
        response = requests.post(f"{BASE_URL}/api/auth/reset-password", json={
            "email": "hans@houseofv.com",
            "method": "sms"
        })
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] == True
        assert "message" in data
        # Demo mode shows password
        assert "demoPassword" in data
        assert len(data["demoPassword"]) == 8
    
    def test_reset_password_email_success(self):
        """Test password reset via email generates new password"""
        response = requests.post(f"{BASE_URL}/api/auth/reset-password", json={
            "email": "charl@houseofv.com",
            "method": "email"
        })
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] == True
        assert "demoPassword" in data
    
    def test_reset_password_nonexistent_user(self):
        """Test password reset for non-existent user returns 404"""
        response = requests.post(f"{BASE_URL}/api/auth/reset-password", json={
            "email": "nonexistent@houseofv.com",
            "method": "sms"
        })
        assert response.status_code == 404
        
        data = response.json()
        assert "error" in data


class TestTasksAPI:
    """Tasks API endpoint tests"""
    
    def test_get_tasks(self):
        """Test GET /api/tasks returns tasks with summary"""
        response = requests.get(f"{BASE_URL}/api/tasks")
        assert response.status_code == 200
        
        data = response.json()
        assert "tasks" in data
        assert "summary" in data
        assert isinstance(data["tasks"], list)
        
        # Verify summary structure
        summary = data["summary"]
        assert "total" in summary
        assert "completed" in summary
        assert "inProgress" in summary
        assert "notStarted" in summary
    
    def test_create_task(self):
        """Test POST /api/tasks creates a new task"""
        response = requests.post(f"{BASE_URL}/api/tasks", json={
            "title": "TEST_API_Task",
            "description": "Test task from API",
            "assignedTo": 2,
            "priority": "High"
        })
        assert response.status_code == 200
        
        data = response.json()
        assert "task" in data
        assert data["task"]["title"] == "TEST_API_Task"
        assert data["task"]["priority"] == "High"
        assert data["task"]["status"] == "Not Started"
    
    def test_create_task_missing_title(self):
        """Test POST /api/tasks without title returns 400"""
        response = requests.post(f"{BASE_URL}/api/tasks", json={
            "description": "Task without title"
        })
        assert response.status_code == 400
        
        data = response.json()
        assert "error" in data
        assert data["error"] == "Title is required"


class TestExpensesAPI:
    """Expenses API endpoint tests"""
    
    def test_get_expenses(self):
        """Test GET /api/expenses returns expenses with summary"""
        response = requests.get(f"{BASE_URL}/api/expenses")
        assert response.status_code == 200
        
        data = response.json()
        assert "expenses" in data
        assert "summary" in data
        
        # Verify summary structure
        summary = data["summary"]
        assert "total" in summary
        assert "pending" in summary
        assert "approved" in summary
        assert "totalAmount" in summary
    
    def test_create_expense(self):
        """Test POST /api/expenses creates a new expense"""
        response = requests.post(f"{BASE_URL}/api/expenses", json={
            "requester": 2,
            "category": "Materials",
            "amount": 500,
            "vendor": "Test Vendor"
        })
        assert response.status_code == 200
        
        data = response.json()
        assert "expense" in data
        assert data["expense"]["amount"] == 500
        assert data["expense"]["approvalStatus"] == "Pending"
    
    def test_create_expense_missing_fields(self):
        """Test POST /api/expenses without required fields returns 400"""
        response = requests.post(f"{BASE_URL}/api/expenses", json={
            "vendor": "Test Vendor"
        })
        assert response.status_code == 400
        
        data = response.json()
        assert "error" in data


class TestAssetsAPI:
    """Assets API endpoint tests"""
    
    def test_get_assets(self):
        """Test GET /api/assets returns assets with summary"""
        response = requests.get(f"{BASE_URL}/api/assets")
        assert response.status_code == 200
        
        data = response.json()
        assert "assets" in data
        assert "summary" in data
        
        # Verify summary structure
        summary = data["summary"]
        assert "total" in summary
        assert "byType" in summary
        assert "checkedOut" in summary
        assert "available" in summary


class TestTimeClockAPI:
    """Time clock API endpoint tests"""
    
    def test_get_time_entries(self):
        """Test GET /api/time returns time entries with summary"""
        response = requests.get(f"{BASE_URL}/api/time")
        assert response.status_code == 200
        
        data = response.json()
        assert "entries" in data
        assert "summary" in data
        
        # Verify summary structure
        summary = data["summary"]
        assert "total" in summary
        assert "todayClockedIn" in summary
    
    def test_clock_in(self):
        """Test POST /api/time with clockIn action"""
        response = requests.post(f"{BASE_URL}/api/time", json={
            "action": "clockIn",
            "employeeId": 2
        })
        assert response.status_code == 200
        
        data = response.json()
        assert "entry" in data
        assert "message" in data
        assert data["message"] == "Clocked in successfully"
    
    def test_clock_in_missing_employee(self):
        """Test POST /api/time clockIn without employeeId returns 400"""
        response = requests.post(f"{BASE_URL}/api/time", json={
            "action": "clockIn"
        })
        assert response.status_code == 400
        
        data = response.json()
        assert "error" in data
    
    def test_invalid_action(self):
        """Test POST /api/time with invalid action returns 400"""
        response = requests.post(f"{BASE_URL}/api/time", json={
            "action": "invalid"
        })
        assert response.status_code == 400
        
        data = response.json()
        assert "error" in data


class TestDocumentsAPI:
    """Documents API endpoint tests"""
    
    def test_get_document_templates(self):
        """Test GET /api/documents/templates returns templates"""
        response = requests.get(f"{BASE_URL}/api/documents/templates")
        assert response.status_code == 200
        
        data = response.json()
        assert "templates" in data
        assert isinstance(data["templates"], list)
        assert len(data["templates"]) > 0
        
        # Verify template structure
        template = data["templates"][0]
        assert "id" in template
        assert "name" in template
        assert "fields" in template


class TestSecurityChecks:
    """Security-related tests"""
    
    def test_password_not_in_login_response(self):
        """Verify password is never exposed in login response"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "hans@houseofv.com",
            "password": "hans123"
        })
        assert response.status_code == 200
        
        data = response.json()
        # Check user object doesn't contain password
        assert "password" not in data.get("user", {})
        # Check entire response doesn't contain password string
        response_text = response.text.lower()
        assert "hans123" not in response_text
    
    def test_api_returns_proper_error_codes(self):
        """Verify APIs return proper HTTP error codes"""
        # 401 for invalid credentials
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "test@test.com",
            "password": "wrong"
        })
        assert response.status_code == 401
        
        # 400 for missing required fields
        response = requests.post(f"{BASE_URL}/api/tasks", json={})
        assert response.status_code == 400


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
