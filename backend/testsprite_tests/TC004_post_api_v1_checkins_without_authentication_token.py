import requests

def test_post_api_v1_checkins_without_authentication_token():
    base_url = "http://localhost:4000"
    url = f"{base_url}/api/v1/checkins"
    # Sample valid payload for check-in (geolocation)
    payload = {
        "latitude": 37.7749,
        "longitude": -122.4194
    }
    headers = {
        "Content-Type": "application/json"
    }
    try:
        response = requests.post(url, json=payload, headers=headers, timeout=30)
    except requests.RequestException as e:
        assert False, f"Request to {url} failed with exception: {e}"

    # Assert that status code is 401 Unauthorized
    assert response.status_code == 401, f"Expected status code 401 but got {response.status_code}"
    # Optionally, assert response content to be Unauthorized message or similar
    try:
        resp_json = response.json()
        assert "error" in resp_json or "message" in resp_json, "Response JSON should contain error or message field"
    except ValueError:
        # Response is not JSON, that's acceptable as well for error cases
        pass

test_post_api_v1_checkins_without_authentication_token()