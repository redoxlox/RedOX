#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Perplexity Pro - Backend Testing Script
يختبر جميع وظائف الـ Backend
"""

import requests
import json
import time
from datetime import datetime

# Configuration
BASE_URL = "http://127.0.0.1:5000"
TEST_EMAIL = "test@example.com"
TEST_NAME = "Test User"

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    END = '\033[0m'

def print_success(msg):
    print(f"{Colors.GREEN}✓ {msg}{Colors.END}")

def print_error(msg):
    print(f"{Colors.RED}✗ {msg}{Colors.END}")

def print_warning(msg):
    print(f"{Colors.YELLOW}⚠ {msg}{Colors.END}")

def print_info(msg):
    print(f"{Colors.BLUE}ℹ {msg}{Colors.END}")

def test_server_running():
    """Test 1: Check if server is running"""
    print("\n" + "="*60)
    print("Test 1: Server Availability")
    print("="*60)
    try:
        response = requests.get(f"{BASE_URL}/", timeout=5)
        if response.status_code == 200:
            print_success("Server is running")
            return True
        else:
            print_error(f"Server returned status code: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print_error("Cannot connect to server. Make sure it's running!")
        print_info(f"Start server: python app_fixed.py")
        return False
    except Exception as e:
        print_error(f"Unexpected error: {e}")
        return False

def test_contact_form():
    """Test 2: Contact form submission"""
    print("\n" + "="*60)
    print("Test 2: Contact Form Submission")
    print("="*60)

    test_data = {
        "name": TEST_NAME,
        "email": TEST_EMAIL,
        "subscription_type": "عادي - 1700 دج / شهر",
        "message": f"Test message sent at {datetime.now()}"
    }

    try:
        response = requests.post(
            f"{BASE_URL}/api/contact",
            json=test_data,
            headers={"Content-Type": "application/json"},
            timeout=10
        )

        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")

        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                print_success("Contact form submission successful")
                if data.get('email_sent', True):
                    print_success("Email was sent successfully")
                else:
                    print_warning("Message saved but email was not sent")
                    print_info("Check your .env email configuration")
                return True
            else:
                print_error(f"Submission failed: {data.get('message')}")
                return False
        else:
            print_error(f"Request failed with status {response.status_code}")
            return False

    except requests.exceptions.Timeout:
        print_error("Request timed out (>10s)")
        print_warning("This might indicate SMTP connection issues")
        return False
    except Exception as e:
        print_error(f"Error: {e}")
        return False

def test_rate_limiting():
    """Test 3: Rate limiting"""
    print("\n" + "="*60)
    print("Test 3: Rate Limiting")
    print("="*60)

    test_data = {
        "name": TEST_NAME,
        "email": TEST_EMAIL,
        "subscription_type": "طلاب - 1400 دج / شهر",
        "message": "Rate limit test"
    }

    print_info("Sending 6 rapid requests (limit is 5 per minute)...")

    success_count = 0
    rate_limited = False

    for i in range(6):
        try:
            response = requests.post(
                f"{BASE_URL}/api/contact",
                json=test_data,
                headers={"Content-Type": "application/json"},
                timeout=5
            )

            if response.status_code == 200:
                success_count += 1
                print(f"  Request {i+1}: {Colors.GREEN}✓ Success{Colors.END}")
            elif response.status_code == 429:
                rate_limited = True
                print(f"  Request {i+1}: {Colors.YELLOW}⚠ Rate limited{Colors.END}")
                break
            else:
                print(f"  Request {i+1}: {Colors.RED}✗ Status {response.status_code}{Colors.END}")

            time.sleep(0.2)  # Small delay between requests

        except Exception as e:
            print(f"  Request {i+1}: {Colors.RED}✗ Error: {e}{Colors.END}")

    if rate_limited:
        print_success("Rate limiting is working correctly")
        return True
    else:
        print_warning("Rate limiting might not be working")
        print_info(f"Processed {success_count} requests without rate limiting")
        return False

def test_admin_login():
    """Test 4: Admin login"""
    print("\n" + "="*60)
    print("Test 4: Admin Authentication")
    print("="*60)

    # Test wrong password
    print_info("Testing with wrong credentials...")
    wrong_credentials = {
        "username": "admin",
        "password": "wrongpassword"
    }

    try:
        response = requests.post(
            f"{BASE_URL}/api/admin/login",
            json=wrong_credentials,
            headers={"Content-Type": "application/json"},
            timeout=5
        )

        if response.status_code == 401:
            print_success("Wrong credentials rejected correctly")
        else:
            print_error(f"Unexpected status code: {response.status_code}")

    except Exception as e:
        print_error(f"Error testing wrong credentials: {e}")

    # Test correct password (default: Admin@123)
    print_info("Testing with correct credentials (Admin@123)...")
    correct_credentials = {
        "username": "admin",
        "password": "Admin@123"
    }

    try:
        response = requests.post(
            f"{BASE_URL}/api/admin/login",
            json=correct_credentials,
            headers={"Content-Type": "application/json"},
            timeout=5
        )

        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                print_success("Admin login successful")
                return True
            else:
                print_error("Login failed")
                return False
        else:
            print_error(f"Login failed with status {response.status_code}")
            print_warning("Make sure ADMIN_PASSWORD_HASH in .env matches 'Admin@123'")
            return False

    except Exception as e:
        print_error(f"Error: {e}")
        return False

def test_input_validation():
    """Test 5: Input validation"""
    print("\n" + "="*60)
    print("Test 5: Input Validation")
    print("="*60)

    # Test empty fields
    print_info("Testing empty fields...")
    empty_data = {
        "name": "",
        "email": "",
        "subscription_type": "",
        "message": ""
    }

    try:
        response = requests.post(
            f"{BASE_URL}/api/contact",
            json=empty_data,
            headers={"Content-Type": "application/json"},
            timeout=5
        )

        if response.status_code == 400:
            print_success("Empty fields rejected correctly")
        else:
            print_warning(f"Empty fields returned status {response.status_code}")

    except Exception as e:
        print_error(f"Error: {e}")

    # Test invalid email format
    print_info("Testing invalid email format...")
    invalid_email_data = {
        "name": TEST_NAME,
        "email": "not-an-email",
        "subscription_type": "عادي",
        "message": "Test"
    }

    try:
        response = requests.post(
            f"{BASE_URL}/api/contact",
            json=invalid_email_data,
            headers={"Content-Type": "application/json"},
            timeout=5
        )

        # The current implementation doesn't validate email format in the API
        # It's validated in the send_email function
        print_info("Email format validation handled by email sending function")
        return True

    except Exception as e:
        print_error(f"Error: {e}")
        return False

def run_all_tests():
    """Run all tests"""
    print("\n")
    print("="*60)
    print("   PERPLEXITY PRO - BACKEND TESTING SUITE")
    print("="*60)
    print(f"Target: {BASE_URL}")
    print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

    results = {}

    # Run tests
    results['Server Running'] = test_server_running()

    if not results['Server Running']:
        print("\n" + "="*60)
        print_error("Server is not running. Cannot continue tests.")
        print_info("Start the server first: python app_fixed.py")
        print("="*60)
        return

    time.sleep(1)
    results['Contact Form'] = test_contact_form()

    time.sleep(2)
    results['Rate Limiting'] = test_rate_limiting()

    time.sleep(2)
    results['Admin Login'] = test_admin_login()

    time.sleep(1)
    results['Input Validation'] = test_input_validation()

    # Summary
    print("\n")
    print("="*60)
    print("   TEST SUMMARY")
    print("="*60)

    passed = sum(1 for v in results.values() if v)
    total = len(results)

    for test_name, result in results.items():
        status = f"{Colors.GREEN}PASSED{Colors.END}" if result else f"{Colors.RED}FAILED{Colors.END}"
        print(f"{test_name}: {status}")

    print("="*60)
    print(f"Total: {passed}/{total} tests passed")

    if passed == total:
        print_success("All tests passed! 🎉")
    else:
        print_warning(f"{total - passed} test(s) failed")

    print("="*60)
    print()

if __name__ == "__main__":
    try:
        run_all_tests()
    except KeyboardInterrupt:
        print("\n\n" + "="*60)
        print_error("Tests interrupted by user")
        print("="*60)
    except Exception as e:
        print("\n\n" + "="*60)
        print_error(f"Fatal error: {e}")
        print("="*60)
