# Agent Task: Orchestrator & Logic
**Context:** You are the Lead Developer. The DB and API layers are built.
**Goal:** Orchestrate the parallel ingestion of data.

## Instructions
1.  **Ingestion Service:**
    - Create `IngestionService.java`.
    - Inject `SamApiClient` and `OpportunityRepository`.
    - **Method:** `runIngestion()`.
    - **Parallel Logic:**
        - Define a list of NAICS codes to search (e.g., ["541511", "541512", "518210"]).
        - Use `ExecutorService` (newVirtualThreadPerTaskExecutor) to spawn a thread for *each* NAICS code simultaneously.
        - **Critical:** Ensure `SamApiClient` handles the rate limiting so these parallel threads don't get banned.
        - Collect results from all threads and save them to the DB.

2.  **Controller:**
    - `POST /ingest`: Triggers `runIngestion()` manually.

**Output:** `IngestionService.java` (with Virtual Thread logic) and `IngestController.java`.
