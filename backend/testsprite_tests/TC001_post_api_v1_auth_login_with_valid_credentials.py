import requests

BASE_URL = "http://localhost:4000"
LOGIN_ENDPOINT = "/api/v1/auth/login"
TIMEOUT = 30

def test_post_api_v1_auth_login_with_valid_credentials():
    url = BASE_URL + LOGIN_ENDPOINT
    headers = {
        "Content-Type": "application/json"
    }
    # Assuming valid credentials - replace with actual valid test credentials
    payload = {
        "email": "validuser@example.com",
        "password": "ValidPassword123!"
    }
    try:
        response = requests.post(url, json=payload, headers=headers, timeout=TIMEOUT)
    except requests.RequestException as e:
        assert False, f"Request failed: {e}"

    assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
    
    try:
        json_data = response.json()
    except ValueError:
        assert False, "Response is not valid JSON"

    assert isinstance(json_data, dict), "Response JSON is not an object"
    assert "accessToken" in json_data, "Response JSON does not contain JWT access token"

    # Check that the token value is a non-empty string
    token = json_data.get("accessToken")
    assert isinstance(token, str) and len(token) > 0, "JWT access token is not a non-empty string"

test_post_api_v1_auth_login_with_valid_credentials()