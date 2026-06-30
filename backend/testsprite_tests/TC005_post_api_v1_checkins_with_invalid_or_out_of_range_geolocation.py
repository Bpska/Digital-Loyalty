import requests

BASE_URL = "http://localhost:4000"
LOGIN_ENDPOINT = "/api/v1/auth/login"
CHECKINS_ENDPOINT = "/api/v1/checkins"
TIMEOUT = 30

VALID_USER_CREDENTIALS = {
    "email": "validuser@example.com",
    "password": "validpassword"
}

def test_post_api_v1_checkins_with_invalid_out_of_range_geolocation():
    # Step 1: Authenticate and get a valid token
    try:
        login_resp = requests.post(
            BASE_URL + LOGIN_ENDPOINT,
            json=VALID_USER_CREDENTIALS,
            timeout=TIMEOUT
        )
        login_resp.raise_for_status()
        token = login_resp.json().get("access_token") or login_resp.json().get("token")
        assert token and isinstance(token, str), "No valid access token found in login response."
    except requests.RequestException as e:
        assert False, f"Login request failed: {e}"

    # Prepare headers with Bearer token
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    # Step 2: Define invalid/out-of-range geolocation payloads
    invalid_geolocations = [
        {"latitude": 999.0, "longitude": 999.0},   # completely invalid lat/lon
        {"latitude": -999.0, "longitude": -999.0}, # negative invalid lat/lon
        {"latitude": 1000, "longitude": 0},         # latitude out of range
        {"latitude": 0, "longitude": 200},          # longitude out of range
        {"latitude": "NaN", "longitude": "NaN"},    # non-numeric values
        {"latitude": None, "longitude": None},      # null values
        {"latitude": 91.0, "longitude": 181.0},     # slightly out of valid bounds
        {"latitude": -91.0, "longitude": -181.0}
    ]

    for geo in invalid_geolocations:
        payload = {
            "latitude": geo["latitude"],
            "longitude": geo["longitude"]
        }
        try:
            response = requests.post(
                BASE_URL + CHECKINS_ENDPOINT,
                headers=headers,
                json=payload,
                timeout=TIMEOUT
            )
            # Validate that response status code is 400 or 403
            assert response.status_code in [400, 403], (
                f"Expected status code 400 or 403 for payload {payload}, got {response.status_code}"
            )
        except requests.RequestException as e:
            assert False, f"Check-in request failed for payload {payload}: {e}"

test_post_api_v1_checkins_with_invalid_out_of_range_geolocation()
