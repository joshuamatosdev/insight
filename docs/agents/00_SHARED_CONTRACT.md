# Project Contract: SAM.gov Ingestor
**Goal:** A Spring Boot 3.2+ application using Java 21 Virtual Threads to ingest government contract opportunities.

## The Data Model (The "Contract")
All agents must adhere to this structure. Do not deviate.

### Core Entity: `Opportunity`
- `id` (String): The SAM.gov `noticeId` (Primary Key).
- `title` (String): Title of the opportunity.
- `solicitationNumber` (String).
- `postedDate` (LocalDate).
- `responseDeadLine` (LocalDate).
- `naicsCode` (String).
- `type` (String): e.g., "Sources Sought", "Solicitation".
- `url` (String): Link to the opportunity.

## Technical Standards
- **Java:** 21 (Must use Virtual Threads).
- **Spring Boot:** 3.2+.
- **Database:** PostgreSQL 16.
- **Concurrency:** `spring.threads.virtual.enabled=true`.
