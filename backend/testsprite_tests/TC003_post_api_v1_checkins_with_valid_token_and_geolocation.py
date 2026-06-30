import requests

BASE_URL = "http://localhost:4000"
LOGIN_ENDPOINT = "/api/v1/auth/login"
CHECKIN_ENDPOINT = "/api/v1/checkins"
TIMEOUT = 30

def test_post_api_v1_checkins_with_valid_token_and_geolocation():
    # Valid user credentials for login (replace with valid test credentials)
    login_payload = {
        "email": "testuser@example.com",
        "password": "testpassword"
    }

    try:
        # Authenticate to get JWT token
        login_resp = requests.post(
            BASE_URL + LOGIN_ENDPOINT,
            json=login_payload,
            timeout=TIMEOUT
        )
        assert login_resp.status_code == 200, f"Login failed with status {login_resp.status_code}"
        token_response = login_resp.json()
        assert "accessToken" in token_response or "token" in token_response, "No access token in login response"
        access_token = token_response.get("accessToken") or token_response.get("token")
        assert isinstance(access_token, str) and len(access_token) > 0, "Access token is invalid"

        # Prepare checkin payload with valid geolocation
        checkin_payload = {
            "latitude": 37.7749,
            "longitude": -122.4194
        }

        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"
        }

        # Create checkin
        checkin_resp = requests.post(
            BASE_URL + CHECKIN_ENDPOINT,
            json=checkin_payload,
            headers=headers,
            timeout=TIMEOUT
        )
        assert checkin_resp.status_code == 200, f"Checkin failed with status {checkin_resp.status_code}"
        checkin_record = checkin_resp.json()
        assert isinstance(checkin_record, dict), "Checkin response is not a JSON object"
        # Validate minimal expected fields in checkin record
        assert "id" in checkin_record, "Checkin record missing 'id'"
        assert "latitude" in checkin_record, "Checkin record missing 'latitude'"
        assert "longitude" in checkin_record, "Checkin record missing 'longitude'"
        assert checkin_record["latitude"] == checkin_payload["latitude"], "Latitude mismatch"
        assert checkin_record["longitude"] == checkin_payload["longitude"], "Longitude mismatch"
    except requests.RequestException as e:
        assert False, f"HTTP request failed: {e}"
    except AssertionError as ae:
        raise ae

test_post_api_v1_checkins_with_valid_token_and_geolocation()