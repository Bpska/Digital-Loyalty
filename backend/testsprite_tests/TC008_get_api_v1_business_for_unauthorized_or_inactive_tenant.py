import requests

BASE_URL = "http://localhost:4000"
LOGIN_ENDPOINT = "/api/v1/auth/login"
BUSINESS_ENDPOINT = "/api/v1/business"
TIMEOUT = 30

def test_get_api_v1_business_unauthorized_or_inactive_tenant():
    # Credentials of an unauthorized or inactive tenant
    credentials = {
        "email": "unauthorized_tenant_user@example.com",
        "password": "somepassword"
    }

    try:
        # Authenticate with the unauthorized or inactive tenant credentials
        login_resp = requests.post(
            BASE_URL + LOGIN_ENDPOINT,
            json=credentials,
            timeout=TIMEOUT
        )
        # Expect a 200 to get token even if tenant is unauthorized/inactive because test states "valid token"
        assert login_resp.status_code == 200, f"Expected 200 on login but got {login_resp.status_code}"
        token = login_resp.json().get("accessToken")
        assert token, "No accessToken found in login response"

        headers = {
            "Authorization": f"Bearer {token}"
        }
        # Call GET /api/v1/business with the token for unauthorized or inactive tenant
        business_resp = requests.get(
            BASE_URL + BUSINESS_ENDPOINT,
            headers=headers,
            timeout=TIMEOUT
        )
        # The test expects 403 Forbidden or 404 Not Found
        assert business_resp.status_code in [403, 404], \
            f"Expected status 403 or 404 but got {business_resp.status_code}"

    except requests.exceptions.RequestException as e:
        assert False, f"Request failed: {e}"

test_get_api_v1_business_unauthorized_or_inactive_tenant()