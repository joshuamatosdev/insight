# Agent Task: API Client (Parallel Fetcher)
**Context:** You are the Integration Engineer. You have the Shared Contract.
**Goal:** Build a robust SAM.gov client that handles rate limits.

## Instructions
1.  **Virtual Threads Config:**
    - Create a config class enabling Virtual Threads:
    - `spring.threads.virtual.enabled=true` (in properties).
    - Define a `RestClient.Builder` bean.

2.  **SAM.gov Client:**
    - Create `SamApiClient.java`.
    - Use `RestClient` (Functional).
    - **Endpoint:** `GET /opportunities/v2/search`.
    - **Parameters:** `api_key`, `postedFrom`, `limit`, `ptype`, `ncode`.
    - **Resilience:** Add a simple Rate Limiter (e.g., "sleep 500ms between calls") to avoid 429 errors.

3.  **DTO Mapping:**
    - Create a Java `record` for the raw JSON response from SAM.gov.
    - Create a mapper method to convert that raw Record into the `Opportunity` entity from the Shared Contract.

**Output:** `SamApiClient.java`, DTO records, and `RestClient` configuration.
