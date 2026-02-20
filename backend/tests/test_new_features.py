"""
Test suite for House of Veritas new features:
- Assets Enhanced API
- Inventory API with OCR import
- OCR API
- Marketplace API
- Files API
"""
import pytest
import requests
import os

# Use localhost:3000 for Next.js app
BASE_URL = "http://localhost:3000"


class TestAssetsEnhancedAPI:
    """Tests for /api/assets/enhanced endpoint"""
    
    def test_get_all_assets(self):
        """GET /api/assets/enhanced - Returns all assets with summary"""
        response = requests.get(f"{BASE_URL}/api/assets/enhanced")
        assert response.status_code == 200
        
        data = response.json()
        assert "assets" in data
        assert "summary" in data
        assert isinstance(data["assets"], list)
        assert len(data["assets"]) > 0
        
        # Verify summary structure
        summary = data["summary"]
        assert "total" in summary
        assert "totalValue" in summary
        assert "forSale" in summary
        assert "needsAttention" in summary
        print(f"✓ Found {summary['total']} assets with total value R{summary['totalValue']}")
    
    def test_filter_assets_by_category(self):
        """GET /api/assets/enhanced?category=vehicles - Filter by category"""
        response = requests.get(f"{BASE_URL}/api/assets/enhanced?category=vehicles")
        assert response.status_code == 200
        
        data = response.json()
        assets = data["assets"]
        
        # All returned assets should be vehicles
        for asset in assets:
            assert asset["category"] == "vehicles"
        print(f"✓ Filtered to {len(assets)} vehicle assets")
    
    def test_filter_assets_by_condition(self):
        """GET /api/assets/enhanced?condition=excellent - Filter by condition"""
        response = requests.get(f"{BASE_URL}/api/assets/enhanced?condition=excellent")
        assert response.status_code == 200
        
        data = response.json()
        assets = data["assets"]
        
        for asset in assets:
            assert asset["condition"] == "excellent"
        print(f"✓ Filtered to {len(assets)} excellent condition assets")
    
    def test_filter_assets_by_sale_status(self):
        """GET /api/assets/enhanced?saleStatus=for_sale - Filter by sale status"""
        response = requests.get(f"{BASE_URL}/api/assets/enhanced?saleStatus=for_sale")
        assert response.status_code == 200
        
        data = response.json()
        assets = data["assets"]
        
        for asset in assets:
            assert asset["saleStatus"] == "for_sale"
        print(f"✓ Filtered to {len(assets)} assets for sale")
    
    def test_create_asset(self):
        """POST /api/assets/enhanced - Create new asset"""
        payload = {
            "name": "TEST_New Power Drill",
            "description": "Test asset for automated testing",
            "category": "workshop_tools",
            "condition": "good",
            "brand": "DeWalt",
            "model": "DCD777",
            "location": "Workshop",
            "saleStatus": "not_for_sale",
            "tags": ["test", "power-tool"]
        }
        
        response = requests.post(
            f"{BASE_URL}/api/assets/enhanced",
            json=payload
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] == True
        assert "asset" in data
        assert data["asset"]["name"] == payload["name"]
        assert data["asset"]["category"] == payload["category"]
        print(f"✓ Created asset with ID: {data['asset']['id']}")
        
        return data["asset"]["id"]
    
    def test_delete_asset(self):
        """DELETE /api/assets/enhanced?id=xxx - Delete asset"""
        # First create an asset to delete
        create_payload = {
            "name": "TEST_Asset to Delete",
            "category": "household_items",
            "condition": "fair",
            "location": "Storage"
        }
        
        create_response = requests.post(
            f"{BASE_URL}/api/assets/enhanced",
            json=create_payload
        )
        assert create_response.status_code == 200
        asset_id = create_response.json()["asset"]["id"]
        
        # Now delete it
        delete_response = requests.delete(f"{BASE_URL}/api/assets/enhanced?id={asset_id}")
        assert delete_response.status_code == 200
        
        data = delete_response.json()
        assert data["success"] == True
        print(f"✓ Deleted asset {asset_id}")


class TestInventoryAPI:
    """Tests for /api/inventory endpoint"""
    
    def test_get_inventory(self):
        """GET /api/inventory - Returns inventory items with alerts"""
        response = requests.get(f"{BASE_URL}/api/inventory")
        assert response.status_code == 200
        
        data = response.json()
        assert "items" in data
        assert "alerts" in data
        assert "summary" in data
        
        # Verify summary structure
        summary = data["summary"]
        assert "totalItems" in summary
        assert "totalValue" in summary
        assert "lowStockCount" in summary
        assert "criticalCount" in summary
        print(f"✓ Found {summary['totalItems']} inventory items, {summary['criticalCount']} critical")
    
    def test_filter_inventory_by_category(self):
        """GET /api/inventory?category=fuel - Filter by category"""
        response = requests.get(f"{BASE_URL}/api/inventory?category=fuel")
        assert response.status_code == 200
        
        data = response.json()
        items = data["items"]
        
        for item in items:
            assert item["category"] == "fuel"
        print(f"✓ Filtered to {len(items)} fuel items")
    
    def test_consume_inventory_item(self):
        """POST /api/inventory - Consume action"""
        payload = {
            "action": "consume",
            "itemId": "inv_001",  # Cement 50kg bags
            "quantity": 1,
            "usedBy": "test_user",
            "purpose": "Automated testing"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/inventory",
            json=payload
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] == True
        assert "item" in data
        print(f"✓ Consumed 1 unit, new stock: {data['item']['currentStock']}")
    
    def test_restock_inventory_item(self):
        """POST /api/inventory - Restock action"""
        payload = {
            "action": "restock",
            "itemId": "inv_001",  # Cement 50kg bags
            "quantity": 2,
            "unitCost": 89.95
        }
        
        response = requests.post(
            f"{BASE_URL}/api/inventory",
            json=payload
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] == True
        assert "item" in data
        print(f"✓ Restocked 2 units, new stock: {data['item']['currentStock']}")
    
    def test_generate_shopping_list(self):
        """PUT /api/inventory - Generate shopping list"""
        payload = {
            "action": "generate-shopping-list",
            "store": "cashbuild"
        }
        
        response = requests.put(
            f"{BASE_URL}/api/inventory",
            json=payload
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] == True
        assert "shoppingList" in data
        assert "totalEstimatedCost" in data
        print(f"✓ Generated shopping list with {len(data['shoppingList'])} items, total: R{data['totalEstimatedCost']}")
    
    def test_import_from_ocr(self):
        """PUT /api/inventory - Import items from OCR"""
        payload = {
            "action": "import-from-ocr",
            "items": [
                {"name": "TEST_OCR Item 1", "quantity": 5, "unit": "pieces"},
                {"name": "TEST_OCR Item 2", "quantity": 10, "unit": "boxes"}
            ]
        }
        
        response = requests.put(
            f"{BASE_URL}/api/inventory",
            json=payload
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] == True
        assert "imported" in data
        assert data["imported"] >= 0
        print(f"✓ Imported {data['imported']} items from OCR")


class TestOCRAPI:
    """Tests for /api/ocr endpoint"""
    
    def test_get_ocr_results(self):
        """GET /api/ocr - Returns processed OCR results"""
        response = requests.get(f"{BASE_URL}/api/ocr")
        assert response.status_code == 200
        
        data = response.json()
        assert "results" in data
        assert "total" in data
        assert "configured" in data
        print(f"✓ OCR API configured: {data['configured']}, {data['total']} results")


class TestMarketplaceAPI:
    """Tests for /api/marketplace endpoint"""
    
    def test_get_listings(self):
        """GET /api/marketplace - Returns marketplace listings"""
        response = requests.get(f"{BASE_URL}/api/marketplace")
        assert response.status_code == 200
        
        data = response.json()
        assert "listings" in data
        assert "summary" in data
        
        summary = data["summary"]
        assert "total" in summary
        assert "active" in summary
        assert "totalViews" in summary
        assert "potentialRevenue" in summary
        print(f"✓ Found {summary['total']} listings, {summary['active']} active, R{summary['potentialRevenue']} potential revenue")
    
    def test_get_platforms(self):
        """GET /api/marketplace?action=platforms - Returns available platforms"""
        response = requests.get(f"{BASE_URL}/api/marketplace?action=platforms")
        assert response.status_code == 200
        
        data = response.json()
        assert "platforms" in data
        
        platforms = data["platforms"]
        assert "gumtree" in platforms
        assert "facebook" in platforms
        assert "olx" in platforms
        print(f"✓ Found {len(platforms)} marketplace platforms")
    
    def test_create_listing(self):
        """POST /api/marketplace - Create new listing"""
        payload = {
            "assetId": "test_asset_001",
            "assetName": "TEST_Listing Item",
            "platform": "gumtree",
            "price": 500,
            "title": "Test Listing for Automated Testing",
            "description": "This is a test listing",
            "category": "tools",
            "condition": "good"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/marketplace",
            json=payload
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] == True
        assert "listing" in data
        assert data["listing"]["status"] == "draft"
        print(f"✓ Created listing with ID: {data['listing']['id']}")
    
    def test_generate_listing_content(self):
        """POST /api/marketplace - Generate listing content"""
        payload = {
            "action": "generate-listing",
            "assetId": "test_asset",
            "assetName": "Test Power Tool",
            "category": "tools",
            "condition": "good",
            "brand": "Bosch",
            "model": "GSR 18V",
            "price": 1500,
            "description": "Cordless drill in good condition"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/marketplace",
            json=payload
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] == True
        assert "generated" in data
        assert "title" in data["generated"]
        assert "description" in data["generated"]
        print(f"✓ Generated listing: {data['generated']['title']}")


class TestFilesAPI:
    """Tests for /api/files endpoint"""
    
    def test_get_file_config(self):
        """GET /api/files - Returns file upload configuration"""
        response = requests.get(f"{BASE_URL}/api/files")
        assert response.status_code == 200
        
        data = response.json()
        assert "maxFileSize" in data
        assert "allowedMimeTypes" in data
        assert "azureConfigured" in data
        assert "containers" in data
        
        # Verify config values
        assert data["maxFileSize"] == 10485760  # 10MB
        assert "image/jpeg" in data["allowedMimeTypes"]
        assert "application/pdf" in data["allowedMimeTypes"]
        print(f"✓ File API configured, Azure: {data['azureConfigured']}, max size: {data['maxFileSize']/1024/1024}MB")


class TestAuthFlow:
    """Tests for authentication flow"""
    
    def test_login_with_hans_credentials(self):
        """POST /api/auth/login - Login with Hans credentials"""
        payload = {
            "email": "hans@houseofv.com",
            "password": "hans123"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json=payload
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] == True
        assert "user" in data
        assert data["user"]["id"] == "hans"
        assert "Owner" in data["user"]["role"] or data["user"]["role"] == "admin"
        print(f"✓ Logged in as {data['user']['name']} ({data['user']['role']})")
    
    def test_login_invalid_password(self):
        """POST /api/auth/login - Invalid password returns error"""
        payload = {
            "email": "hans@houseofv.com",
            "password": "wrongpassword"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json=payload
        )
        assert response.status_code == 401
        
        data = response.json()
        assert "error" in data
        print(f"✓ Invalid password correctly rejected: {data['error']}")
    
    def test_login_nonexistent_user(self):
        """POST /api/auth/login - Nonexistent user returns error"""
        payload = {
            "email": "nobody@houseofv.com",
            "password": "test123"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json=payload
        )
        # Can be 401 or 404 depending on implementation
        assert response.status_code in [401, 404]
        
        data = response.json()
        assert "error" in data
        print(f"✓ Nonexistent user correctly rejected: {data['error']}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
