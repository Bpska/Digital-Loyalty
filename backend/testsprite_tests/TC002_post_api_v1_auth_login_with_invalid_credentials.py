import requests

def test_post_api_v1_auth_login_with_invalid_credentials():
    base_url = "http://localhost:4000"
    endpoint = "/api/v1/auth/login"
    url = base_url + endpoint

    invalid_credentials = {
        "email": "invalid_user@example.com",
        "password": "wrong_password"
    }

    headers = {
        "Content-Type": "application/json"
    }

    try:
        response = requests.post(url, json=invalid_credentials, headers=headers, timeout=30)
    except requests.RequestException as e:
        assert False, f"Request failed: {e}"

    assert response.status_code == 401, f"Expected status code 401, got {response.status_code}"
    try:
        response_json = response.json()
    except ValueError:
        assert False, "Response is not in JSON format"

    # Check for an authentication error message in the response
    error_message = response_json.get("error") or response_json.get("message") or ""
    assert error_message, "Response JSON does not contain an error message"
    assert "unauthorized" in error_message.lower() or "invalid" in error_message.lower(), \
        f"Unexpected error message: {error_message}"

test_post_api_v1_auth_login_with_invalid_credentials()