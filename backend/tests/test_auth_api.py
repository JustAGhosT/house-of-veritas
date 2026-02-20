"""
House of Veritas - Authentication API Tests
Tests for login, password reset, and user listing endpoints
"""
import pytest
import requests
import os

# Use localhost since this is a Next.js app running on port 3000
BASE_URL = "http://localhost:3000"

# Test credentials
TEST_USERS = {
    "hans": {"email": "hans@houseofv.com", "password": "hans123", "phone": "+27692381255"},
    "irma": {"email": "irma@houseofv.com", "password": "irma123", "phone": "+27711488390"},
    "charl": {"email": "charl@houseofv.com", "password": "charl123", "phone": "+27711488390"},
    "lucky": {"email": "lucky@houseofv.com", "password": "lucky123", "phone": "+27794142410"},
}


class TestGetUsers:
    """Tests for GET /api/auth/users endpoint"""

    def test_get_all_users_returns_200(self):
        """Test that users endpoint returns 200 status"""
        response = requests.get(f"{BASE_URL}/api/auth/users")
        assert response.status_code == 200

    def test_get_all_users_returns_4_users(self):
        """Test that 4 users are returned (Hans, Irma, Charl, Lucky)"""
        response = requests.get(f"{BASE_URL}/api/auth/users")
        data = response.json()
        assert data["total"] == 4
        assert len(data["users"]) == 4

    def test_get_users_contains_expected_personas(self):
        """Test that all expected personas are present"""
        response = requests.get(f"{BASE_URL}/api/auth/users")
        data = response.json()
        user_ids = [user["id"] for user in data["users"]]
        assert "hans" in user_ids
        assert "irma" in user_ids
        assert "charl" in user_ids
        assert "lucky" in user_ids

    def test_users_have_correct_specialties(self):
        """Test that users have their correct specialties"""
        response = requests.get(f"{BASE_URL}/api/auth/users")
        data = response.json()
        users_by_id = {user["id"]: user for user in data["users"]}
        
        # Hans - Tech, Leadership, Electronics
        assert "Tech" in users_by_id["hans"]["specialty"]
        assert "Leadership" in users_by_id["hans"]["specialty"]
        assert "Electronics" in users_by_id["hans"]["specialty"]
        
        # Irma - Babysitting, Cleaning, Food
        assert "Babysitting" in users_by_id["irma"]["specialty"]
        assert "Cleaning" in users_by_id["irma"]["specialty"]
        assert "Food" in users_by_id["irma"]["specialty"]
        
        # Charl - Tinkerer, Electrician, Plumber, Magicman
        assert "Tinkerer" in users_by_id["charl"]["specialty"]
        assert "Electrician" in users_by_id["charl"]["specialty"]
        assert "Plumber" in users_by_id["charl"]["specialty"]
        assert "Magicman" in users_by_id["charl"]["specialty"]
        
        # Lucky - Gardening, Painting, Manual Labour
        assert "Gardening" in users_by_id["lucky"]["specialty"]
        assert "Painting" in users_by_id["lucky"]["specialty"]
        assert "Manual Labour" in users_by_id["lucky"]["specialty"]

    def test_users_do_not_expose_passwords(self):
        """Test that passwords are not exposed in the response"""
        response = requests.get(f"{BASE_URL}/api/auth/users")
        data = response.json()
        for user in data["users"]:
            assert "password" not in user


class TestLogin:
    """Tests for POST /api/auth/login endpoint"""

    def test_login_hans_with_correct_password(self):
        """Test Hans can login with correct password"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"userId": "hans", "password": "hans123"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["user"]["id"] == "hans"
        assert data["user"]["name"] == "Hans"
        assert data["redirectTo"] == "/dashboard/hans"

    def test_login_irma_with_correct_password(self):
        """Test Irma can login with correct password"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"userId": "irma", "password": "irma123"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["user"]["id"] == "irma"
        assert data["redirectTo"] == "/dashboard/irma"

    def test_login_charl_with_correct_password(self):
        """Test Charl can login with correct password"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"userId": "charl", "password": "charl123"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["user"]["id"] == "charl"
        assert data["redirectTo"] == "/dashboard/charl"

    def test_login_lucky_with_correct_password(self):
        """Test Lucky can login with correct password"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"userId": "lucky", "password": "lucky123"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["user"]["id"] == "lucky"
        assert data["redirectTo"] == "/dashboard/lucky"

    def test_login_with_email_instead_of_userid(self):
        """Test login works with email instead of userId"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": "hans@houseofv.com", "password": "hans123"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["user"]["email"] == "hans@houseofv.com"

    def test_login_fails_with_wrong_password(self):
        """Test login fails with incorrect password"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"userId": "hans", "password": "wrongpassword"}
        )
        assert response.status_code == 401
        data = response.json()
        assert "error" in data
        assert data["error"] == "Invalid password"

    def test_login_fails_with_nonexistent_user(self):
        """Test login fails for non-existent user"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"userId": "nonexistent", "password": "test123"}
        )
        assert response.status_code == 401
        data = response.json()
        assert "error" in data
        assert data["error"] == "User not found"

    def test_login_response_excludes_password(self):
        """Test that login response does not include password"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"userId": "hans", "password": "hans123"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "password" not in data["user"]


class TestPasswordReset:
    """Tests for POST /api/auth/reset-password endpoint"""

    def test_password_reset_via_sms(self):
        """Test password reset via SMS returns success with demo password"""
        response = requests.post(
            f"{BASE_URL}/api/auth/reset-password",
            json={"email": "hans@houseofv.com", "method": "sms"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "message" in data
        # Demo mode returns the password since Twilio is not configured
        assert "demoPassword" in data
        assert len(data["demoPassword"]) == 8  # Generated password is 8 chars

    def test_password_reset_via_email(self):
        """Test password reset via email returns success with demo password"""
        response = requests.post(
            f"{BASE_URL}/api/auth/reset-password",
            json={"email": "irma@houseofv.com", "method": "email"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "demoPassword" in data
        assert "note" in data

    def test_password_reset_fails_for_nonexistent_user(self):
        """Test password reset fails for non-existent user"""
        response = requests.post(
            f"{BASE_URL}/api/auth/reset-password",
            json={"email": "nonexistent@houseofv.com", "method": "sms"}
        )
        assert response.status_code == 404
        data = response.json()
        assert "error" in data

    def test_password_reset_masks_phone_number(self):
        """Test that phone number is masked in response"""
        response = requests.post(
            f"{BASE_URL}/api/auth/reset-password",
            json={"email": "charl@houseofv.com", "method": "sms"}
        )
        assert response.status_code == 200
        data = response.json()
        # Phone should be masked like +27711****90
        assert "****" in data["message"]


class TestDashboardPages:
    """Tests for dashboard page accessibility"""

    def test_hans_dashboard_accessible(self):
        """Test Hans dashboard page is accessible"""
        response = requests.get(f"{BASE_URL}/dashboard/hans")
        assert response.status_code == 200

    def test_irma_dashboard_accessible(self):
        """Test Irma dashboard page is accessible"""
        response = requests.get(f"{BASE_URL}/dashboard/irma")
        assert response.status_code == 200

    def test_charl_dashboard_accessible(self):
        """Test Charl dashboard page is accessible"""
        response = requests.get(f"{BASE_URL}/dashboard/charl")
        assert response.status_code == 200

    def test_lucky_dashboard_accessible(self):
        """Test Lucky dashboard page is accessible"""
        response = requests.get(f"{BASE_URL}/dashboard/lucky")
        assert response.status_code == 200

    def test_login_page_accessible(self):
        """Test login page is accessible"""
        response = requests.get(f"{BASE_URL}/login")
        assert response.status_code == 200


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
