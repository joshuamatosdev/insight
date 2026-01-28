# Agent Task: Database Layer
**Context:** You are the Database Architect. You have the Shared Contract.
**Goal:** Build the persistence layer using Spring Data JPA and Docker.

## Instructions
1.  **Docker Compose:**
    - Create `docker-compose.yml` for PostgreSQL 16.
    - User: `dev_user`, Pass: `dev_pass`, DB: `sam_opportunities`.
    - Map port `5432`. Persist data to `./pg-data`.

2.  **JPA Entity:**
    - Create `src/main/java/.../Opportunity.java`.
    - Map the fields defined in the **Shared Contract**.
    - Use Lombok `@Data` and `@Entity`.
    - Add a unique constraint on `solicitationNumber` if `id` isn't sufficient (SAM IDs change on updates).

3.  **Repository:**
    - Create `OpportunityRepository` extending `JpaRepository`.
    - Add a custom method: `Optional<Opportunity> findBySolicitationNumber(String solNum)`.

4.  **Configuration:**
    - Write the `spring.datasource` properties in `application.yaml`.

**Output:** `docker-compose.yml`, `Opportunity.java`, `OpportunityRepository.java`, `application.yaml` (DB section only).
