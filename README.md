# Insight Contract Intelligence Platform

**Production:** https://insight.doctrineone.us

[![CI](https://github.com/joshuamatosdev/insight/actions/workflows/ci.yml/badge.svg)](https://github.com/joshuamatosdev/insight/actions/workflows/ci.yml)
[![CD](https://github.com/joshuamatosdev/insight/actions/workflows/cd.yml/badge.svg)](https://github.com/joshuamatosdev/insight/actions/workflows/cd.yml)
[![Security](https://github.com/joshuamatosdev/insight/actions/workflows/security.yml/badge.svg)](https://github.com/joshuamatosdev/insight/actions/workflows/security.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Java](https://img.shields.io/badge/Java-21-orange.svg)](https://openjdk.org/projects/jdk/21/)
[![Node](https://img.shields.io/badge/Node-20-green.svg)](https://nodejs.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)

> **Note:** Replace `YOUR_USERNAME` in the badge URLs with your actual GitHub username or organization name.

> **The Parallel Agent Strategy for Solo Developers**

## ⚡ The Magic Number: 2 + 1

For this project size, **do not launch 10 agents**. You'll spend more time fixing merge conflicts than coding.

| Phase | Agents | Purpose |
|-------|--------|---------|
| **Build** | 2 Parallel | Database + API Client |
| **Integrate** | 1 Sequential | Tie everything together |

---

## 📋 Summary Checklist

- [ ] Create Project Folder (`insight`)
- [ ] Save `00_SHARED_CONTRACT.md` (the "Shared Brain")
- [ ] Launch **Window 1**: Paste Contract + DB Instructions
- [ ] Launch **Window 2**: Paste Contract + API Instructions
- [ ] **Manual Merge**: Copy Java files to `src/main/java/...` and merge `application.yaml` snippets
- [ ] Launch **Window 3**: Paste Contract + Orchestrator Instructions

---

## Step 1: Preparation (The "Shared Brain")

Before opening any AI windows, the Shared Contract must exist. This is the **"Truth"** that prevents Agent 1 from naming a field `contract_id` while Agent 2 names it `solicitation_id`.

**File:** [00_SHARED_CONTRACT.md](00_SHARED_CONTRACT.md)

---

## Step 2: The Parallel Build (Agents 1 & 2)

Open **two separate chat windows** (or terminal tabs if using a CLI tool).

### 🗄️ Window 1: The Database Agent

| Property | Value |
|----------|-------|
| **Role** | Backend Architect |
| **Goal** | Build the storage container |
| **Owns** | `model/` and `repository/` packages |
| **Does NOT touch** | API client |

**Prompt to paste:**

```
I am launching you as Agent 1. Your goal is to build the Database Layer. 

Read 00_SHARED_CONTRACT.md for the data definitions. 
Then, read 01_DATABASE_AGENT.md and execute the tasks. 

Output only the code for the Database entities and repositories. 
Do not build the API client.
```

---

### 🌐 Window 2: The API Agent

| Property | Value |
|----------|-------|
| **Role** | Integration Engineer |
| **Goal** | Build the data fetcher |
| **Owns** | `client/` and `dto/` packages |
| **Does NOT touch** | Database |

**Prompt to paste:**

```
I am launching you as Agent 2. Your goal is to build the SAM.gov Client. 

Read 00_SHARED_CONTRACT.md for the data definitions. 
Then, read 02_API_AGENT.md and execute the tasks. 

Output only the code for the API Client and DTOs. 
Do not build the Database.
```

---

### ⚠️ CRUCIAL SAFETY TIP: application.yaml Merge

**Both agents will try to write to `application.yaml`.**

| Agent | Writes This Block |
|-------|-------------------|
| Agent 1 (DB) | `spring.datasource...` |
| Agent 2 (API) | `sam.gov...` |

**YOUR JOB:** Paste both blocks into the **single** `application.yaml` file yourself. Do not let them overwrite the file blindly.

```yaml
# Final application.yaml structure (YOU merge this)
spring:
  datasource:
    # ... from Agent 1
  jpa:
    # ... from Agent 1
  threads:
    virtual:
      enabled: true  # from Agent 2

sam:
  gov:
    # ... from Agent 2
```

---

## Step 3: The Integration (Agent 3)

> ⏳ **Only start this step after Agents 1 and 2 verify their code compiles.**

### 🔗 Window 3: The Orchestrator

| Property | Value |
|----------|-------|
| **Role** | Lead Developer |
| **Goal** | Connect the API to the DB |
| **Uses** | Code from both Agent 1 & 2 |

**Prompt to paste:**

```
I am launching you as Agent 3. The Database and Client layers are complete 
and adhere to 00_SHARED_CONTRACT.md. 

Now, read 03_ORCHESTRATOR.md. 

Your task is to write the IngestionService that calls the Client (from Agent 2) 
and saves to the Repository (from Agent 1). 

Use Java 21 Virtual Threads as specified.
```

---

## 📁 Project File Structure

After all agents complete, your project should look like:

```
sam-gov-ingestor/
├── docker-compose.yml          # Agent 1
├── build.gradle                # Agent 1 (or shared)
├── src/main/
│   ├── java/com/example/sam/
│   │   ├── SamIngestorApplication.java
│   │   ├── model/
│   │   │   └── Opportunity.java           # Agent 1
│   │   ├── repository/
│   │   │   └── OpportunityRepository.java # Agent 1
│   │   ├── client/
│   │   │   └── SamApiClient.java          # Agent 2
│   │   ├── dto/
│   │   │   └── SamResponse.java           # Agent 2
│   │   ├── config/
│   │   │   └── RestClientConfig.java      # Agent 2
│   │   ├── service/
│   │   │   └── IngestionService.java      # Agent 3
│   │   └── controller/
│   │       └── IngestController.java      # Agent 3
│   └── resources/
│       └── application.yaml               # YOU (merged)
└── workflow/
    ├── 00_SHARED_CONTRACT.md
    ├── 01_DATABASE_AGENT.md
    ├── 02_API_AGENT.md
    └── 03_ORCHESTRATOR.md
```

---

## 🚀 Why This Works

| Benefit | Explanation |
|---------|-------------|
| **2x Faster** | DB and API build simultaneously |
| **No Merge Hell** | Clear ownership boundaries per agent |
| **Single Source of Truth** | The Shared Contract prevents naming conflicts |
| **Scalable** | Same pattern works for larger projects (add more parallel pairs) |

---

## 🛡️ Risk Mitigation

| Risk | Prevention |
|------|------------|
| Field name mismatch | All agents read `00_SHARED_CONTRACT.md` first |
| `application.yaml` overwrite | YOU manually merge the snippets |
| Import errors | Agent 3 only starts after 1 & 2 compile |
| Thread safety | Rate limiter in `SamApiClient` protects parallel calls |
