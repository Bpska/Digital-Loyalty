import requests

BASE_URL = "http://localhost:4000"
LOGIN_ENDPOINT = "/api/v1/auth/login"
BUSINESS_ENDPOINT = "/api/v1/business"
TIMEOUT = 30

VALID_CREDENTIALS = {
    "email": "valid_user@example.com",
    "password": "valid_password"
}

def test_get_api_v1_business_with_valid_token():
    try:
        # Step 1: Login to get a valid token
        login_response = requests.post(
            BASE_URL + LOGIN_ENDPOINT,
            json=VALID_CREDENTIALS,
            timeout=TIMEOUT
        )
        assert login_response.status_code == 200, f"Login failed with status {login_response.status_code}"
        login_json = login_response.json()
        access_token = login_json.get("token")
        assert access_token is not None, "No access token found in the login response"

        headers = {
            "Authorization": f"Bearer {access_token}"
        }

        # Step 2: Call GET /api/v1/business with the valid token
        business_response = requests.get(
            BASE_URL + BUSINESS_ENDPOINT,
            headers=headers,
            timeout=TIMEOUT
        )
        assert business_response.status_code == 200, f"Expected status 200 but got {business_response.status_code}"

        business_data = business_response.json()
        # Validate the presence of key business fields (assumed keys - adjust if schema differs)
        assert isinstance(business_data, dict), "Business response is not a JSON object"
        assert "id" in business_data, "Business id missing in response"
        # The PRD does not specify alternate keys, so check only 'name'
        assert "name" in business_data, "Business name missing in response"

    except requests.RequestException as e:
        assert False, f"Request failed: {e}"

test_get_api_v1_business_with_valid_token()