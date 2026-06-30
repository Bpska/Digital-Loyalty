import requests

BASE_URL = "http://localhost:4000"

def test_get_api_v1_business_without_authentication_token():
    url = f"{BASE_URL}/api/v1/business"
    headers = {}  # No authentication token provided

    try:
        response = requests.get(url, headers=headers, timeout=30)
    except requests.RequestException as e:
        assert False, f"Request failed: {e}"

    assert response.status_code == 401, f"Expected 401 Unauthorized but got {response.status_code}"

test_get_api_v1_business_without_authentication_token()