
# TestSprite AI Testing Report(MCP)

---

## 1️⃣ Document Metadata
- **Project Name:** backend
- **Date:** 2026-06-30
- **Prepared by:** TestSprite AI Team

---

## 2️⃣ Requirement Validation Summary

#### Test TC001 post api v1 auth login with valid credentials
- **Test Code:** [TC001_post_api_v1_auth_login_with_valid_credentials.py](./TC001_post_api_v1_auth_login_with_valid_credentials.py)
- **Test Error:** Traceback (most recent call last):
  File "/var/task/handler.py", line 258, in run_with_retry
    exec(code, exec_env)
  File "<string>", line 36, in <module>
  File "<string>", line 22, in test_post_api_v1_auth_login_with_valid_credentials
AssertionError: Expected status code 200, got 401

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/fc8df81a-ca69-4acd-8c3e-42fbb4e3f843/bfcbf096-5d80-4aca-a8cf-d92994bd3f3d
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC002 post api v1 auth login with invalid credentials
- **Test Code:** [TC002_post_api_v1_auth_login_with_invalid_credentials.py](./TC002_post_api_v1_auth_login_with_invalid_credentials.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/fc8df81a-ca69-4acd-8c3e-42fbb4e3f843/181cc952-b3c3-4ca2-b101-11bef8d0455a
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC003 post api v1 checkins with valid token and geolocation
- **Test Code:** [TC003_post_api_v1_checkins_with_valid_token_and_geolocation.py](./TC003_post_api_v1_checkins_with_valid_token_and_geolocation.py)
- **Test Error:** Traceback (most recent call last):
  File "/var/task/handler.py", line 258, in run_with_retry
    exec(code, exec_env)
  File "<string>", line 60, in <module>
  File "<string>", line 58, in test_post_api_v1_checkins_with_valid_token_and_geolocation
  File "<string>", line 22, in test_post_api_v1_checkins_with_valid_token_and_geolocation
AssertionError: Login failed with status 401

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/fc8df81a-ca69-4acd-8c3e-42fbb4e3f843/ba042bf5-4311-4c96-8504-a7ed4ecbbd8b
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC004 post api v1 checkins without authentication token
- **Test Code:** [TC004_post_api_v1_checkins_without_authentication_token.py](./TC004_post_api_v1_checkins_without_authentication_token.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/fc8df81a-ca69-4acd-8c3e-42fbb4e3f843/ad0666fb-148b-47c4-b3e0-7046381beb0e
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC005 post api v1 checkins with invalid or out of range geolocation
- **Test Code:** [TC005_post_api_v1_checkins_with_invalid_or_out_of_range_geolocation.py](./TC005_post_api_v1_checkins_with_invalid_or_out_of_range_geolocation.py)
- **Test Error:** Traceback (most recent call last):
  File "<string>", line 21, in test_post_api_v1_checkins_with_invalid_out_of_range_geolocation
  File "/var/lang/lib/python3.12/site-packages/requests/models.py", line 1024, in raise_for_status
    raise HTTPError(http_error_msg, response=self)
requests.exceptions.HTTPError: 401 Client Error: Unauthorized for url: http://localhost:4000/api/v1/auth/login

During handling of the above exception, another exception occurred:

Traceback (most recent call last):
  File "/var/task/handler.py", line 258, in run_with_retry
    exec(code, exec_env)
  File "<string>", line 64, in <module>
  File "<string>", line 25, in test_post_api_v1_checkins_with_invalid_out_of_range_geolocation
AssertionError: Login request failed: 401 Client Error: Unauthorized for url: http://localhost:4000/api/v1/auth/login

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/fc8df81a-ca69-4acd-8c3e-42fbb4e3f843/dce29393-063c-4f9a-9099-b8eae6d6ada7
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC006 get api v1 business with valid token
- **Test Code:** [TC006_get_api_v1_business_with_valid_token.py](./TC006_get_api_v1_business_with_valid_token.py)
- **Test Error:** Traceback (most recent call last):
  File "/var/task/handler.py", line 258, in run_with_retry
    exec(code, exec_env)
  File "<string>", line 48, in <module>
  File "<string>", line 21, in test_get_api_v1_business_with_valid_token
AssertionError: Login failed with status 401

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/fc8df81a-ca69-4acd-8c3e-42fbb4e3f843/26370ce8-02df-4092-be7e-72107901ba8e
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC007 get api v1 business without authentication token
- **Test Code:** [TC007_get_api_v1_business_without_authentication_token.py](./TC007_get_api_v1_business_without_authentication_token.py)
- **Test Error:** Traceback (most recent call last):
  File "/var/task/handler.py", line 258, in run_with_retry
    exec(code, exec_env)
  File "<string>", line 16, in <module>
  File "<string>", line 14, in test_get_api_v1_business_without_authentication_token
AssertionError: Expected 401 Unauthorized but got 404

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/fc8df81a-ca69-4acd-8c3e-42fbb4e3f843/12742da8-334a-4a94-ac78-7ee1455808fc
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC008 get api v1 business for unauthorized or inactive tenant
- **Test Code:** [TC008_get_api_v1_business_for_unauthorized_or_inactive_tenant.py](./TC008_get_api_v1_business_for_unauthorized_or_inactive_tenant.py)
- **Test Error:** Traceback (most recent call last):
  File "/var/task/handler.py", line 258, in run_with_retry
    exec(code, exec_env)
  File "<string>", line 43, in <module>
  File "<string>", line 23, in test_get_api_v1_business_unauthorized_or_inactive_tenant
AssertionError: Expected 200 on login but got 401

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/fc8df81a-ca69-4acd-8c3e-42fbb4e3f843/7dd9758d-9e9b-43f4-823d-8c15adbd659a
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---


## 3️⃣ Coverage & Matching Metrics

- **25.00** of tests passed

| Requirement        | Total Tests | ✅ Passed | ❌ Failed  |
|--------------------|-------------|-----------|------------|
| ...                | ...         | ...       | ...        |
---


## 4️⃣ Key Gaps / Risks
{AI_GNERATED_KET_GAPS_AND_RISKS}
---