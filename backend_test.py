#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime

class LogoutAPITester:
    def __init__(self, base_url="http://localhost:8001"):
        self.base_url = base_url
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED: {details}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details
        })

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/api/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if headers:
            test_headers.update(headers)
        
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        print(f"   Method: {method}")
        print(f"   Expected Status: {expected_status}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=10)

            print(f"   Actual Status: {response.status_code}")
            
            success = response.status_code == expected_status
            
            if success:
                self.log_test(name, True)
                try:
                    return True, response.json()
                except:
                    return True, response.text
            else:
                self.log_test(name, False, f"Expected {expected_status}, got {response.status_code}. Response: {response.text[:200]}")
                return False, {}

        except Exception as e:
            self.log_test(name, False, f"Exception: {str(e)}")
            return False, {}

    def test_register_user(self):
        """Register a test user for logout testing"""
        timestamp = datetime.now().strftime('%H%M%S')
        test_email = f"logout_test_{timestamp}@example.com"
        
        success, response = self.run_test(
            "User Registration",
            "POST",
            "auth/register",
            200,
            data={
                "email": test_email,
                "password": "TestPass123!",
                "full_name": "Logout Test User",
                "phone": "09123456789"
            }
        )
        
        if success and 'access_token' in response:
            self.token = response['access_token']
            print(f"   ✅ Registered user: {test_email}")
            print(f"   ✅ Got token: {self.token[:20]}...")
            return True, test_email
        
        return False, None

    def test_login_user(self, email):
        """Test login to get fresh token"""
        success, response = self.run_test(
            "User Login",
            "POST", 
            "auth/login",
            200,
            data={
                "email": email,
                "password": "TestPass123!"
            }
        )
        
        if success and 'access_token' in response:
            self.token = response['access_token']
            print(f"   ✅ Login successful, got token: {self.token[:20]}...")
            return True
        
        return False

    def test_auth_me_with_token(self):
        """Test /api/auth/me with valid token"""
        if not self.token:
            self.log_test("Auth Me (with token)", False, "No token available")
            return False
            
        success, response = self.run_test(
            "Auth Me (with token)",
            "GET",
            "auth/me",
            200,
            headers={'Authorization': f'Bearer {self.token}'}
        )
        
        if success:
            print(f"   ✅ User info retrieved: {response.get('full_name', 'Unknown')}")
        
        return success

    def test_logout_endpoint(self):
        """Test the logout endpoint with Authorization header"""
        if not self.token:
            self.log_test("Logout Endpoint", False, "No token available")
            return False
            
        success, response = self.run_test(
            "Logout Endpoint",
            "POST",
            "auth/logout",
            200,
            headers={'Authorization': f'Bearer {self.token}'}
        )
        
        if success:
            print(f"   ✅ Logout response: {response}")
        
        return success

    def test_auth_me_after_logout(self):
        """Test /api/auth/me after logout (should still work with JWT since no blacklist)"""
        if not self.token:
            self.log_test("Auth Me (after logout)", False, "No token available")
            return False
            
        # Note: Since this app uses stateless JWTs without blacklisting,
        # the token should still be valid on the server side
        success, response = self.run_test(
            "Auth Me (after logout - JWT still valid)",
            "GET",
            "auth/me", 
            200,  # Should still work since JWT is stateless
            headers={'Authorization': f'Bearer {self.token}'}
        )
        
        if success:
            print(f"   ✅ JWT still valid (expected for stateless tokens): {response.get('full_name', 'Unknown')}")
        
        return success

    def test_logout_without_token(self):
        """Test logout endpoint without Authorization header"""
        success, response = self.run_test(
            "Logout Without Token",
            "POST",
            "auth/logout",
            401  # Should require authentication
        )
        
        return success

    def run_all_tests(self):
        """Run all logout-related tests"""
        print("🚀 Starting Logout API Tests")
        print("=" * 50)
        
        # Test user registration
        reg_success, test_email = self.test_register_user()
        if not reg_success:
            print("❌ Cannot proceed without user registration")
            return False
        
        # Test authenticated endpoints before logout
        self.test_auth_me_with_token()
        
        # Test logout endpoint
        logout_success = self.test_logout_endpoint()
        
        # Test auth/me after logout (JWT should still be valid)
        self.test_auth_me_after_logout()
        
        # Test logout without token
        self.test_logout_without_token()
        
        # Print summary
        print("\n" + "=" * 50)
        print(f"📊 Test Summary: {self.tests_passed}/{self.tests_run} tests passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return True
        else:
            print("⚠️  Some tests failed. Check details above.")
            return False

def main():
    tester = LogoutAPITester()
    success = tester.run_all_tests()
    
    # Save detailed results
    with open('/app/test_reports/backend_api_results.json', 'w') as f:
        json.dump({
            'timestamp': datetime.now().isoformat(),
            'total_tests': tester.tests_run,
            'passed_tests': tester.tests_passed,
            'success_rate': f"{(tester.tests_passed/tester.tests_run)*100:.1f}%" if tester.tests_run > 0 else "0%",
            'test_results': tester.test_results
        }, f, indent=2)
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())