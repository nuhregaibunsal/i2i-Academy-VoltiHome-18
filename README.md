# VoltWise

VoltWise is a real-time IoT energy analytics and budget auditing platform that monitors household
electricity consumption. Telemetry from simulated smart-home appliances is streamed through Kafka,
evaluated against budget quotas in an in-memory grid, persisted for historical analysis, and turned
into personalized Turkish saving advice by an LLM that is emailed to the household contact.

## Architecture

| Component | Responsibility | Stack |
|-----------|----------------|-------|
| **VoltWise Web App** | Single-page monitoring dashboard with live polling, modal detail views and charts | React + Vite + Recharts |
| **VoltWise Core** | Modular Spring Boot monolith: registration, telemetry ingestion, tariff/anomaly rules, AI pipeline | Spring Boot 3, Java 21 |
| **VoltWise Telemetry Sensors** | Autonomous simulation engine that mocks appliances and publishes wattage | Spring Boot 3, Java 21 |
| **Apache Kafka** | Bidirectional event backbone (registration + telemetry topics) | KRaft single node |
| **Apache Ignite** | In-memory data grid for live home state and consecutive breach counters | Ignite 2.16 thin client |
| **PostgreSQL** | Source of truth for homes, appliances, event logs, snapshots, AI recommendations | PostgreSQL 16 |
| **Google Gemini** | Generates personalized behavioral energy advice | Gemini REST API |

### Event flow

```
Web App  ──REST──▶  Core ──▶ PostgreSQL (persist)  ──▶ Kafka registration topic ──▶ Sensors
                     ▲                                                                  │
                     │                                                                  ▼
              Apache Ignite ◀── Core ◀────── Kafka telemetry topic ◀──────────── Sensors (wattage)
                     │
                     ▼
        Tariff / anomaly evaluation ──▶ Gemini ──▶ email + PostgreSQL log
```

## Web App roles

On launch the dashboard presents a lightweight role selection (no credentials):

- **Satıcı (operator)** — the full admin dashboard: a live grid of every home, quota/anomaly counters, and the registration form. New homes are registered by picking from a checklist of common appliances (with preset wattages) or adding custom ones through a modal.
- **Kullanıcı (resident)** — a focused information page for a single selected home: budget usage, live appliance consumption, anomaly flags, the daily consumption chart and the AI-generated saving advice.

## Core modules

- **Home & Metrics** — registration endpoint, live status from Ignite, historical trends from PostgreSQL.
- **Telemetry Processing** — Kafka consumer that atomically updates in-memory home state per message.
- **Tariff & Anomaly Rules** — 80% / 100% quota evaluation, dynamic penalty tariff, 3-cycle consecutive breach detection.
- **AI Notification** — prompt orchestration, Gemini call with fallback, email dispatch and persistence.

## Prerequisites

- Docker & Docker Compose (for the one-command setup)
- For local development without containers: JDK 21, Maven 3.9+, Node.js 20+

## Environment configuration

Copy the example file and fill in the values. No secrets are hardcoded — every parameter is read
from environment variables.

```bash
cp .env.example .env
```

| Variable | Description |
|----------|-------------|
| `POSTGRES_DB` / `POSTGRES_USER` / `POSTGRES_PASSWORD` | Database name and credentials |
| `KAFKA_BOOTSTRAP_SERVERS` | Kafka bootstrap address |
| `KAFKA_TELEMETRY_TOPIC` / `KAFKA_REGISTRATION_TOPIC` | Topic names |
| `IGNITE_HOST` / `IGNITE_PORT` | Ignite thin-client endpoint |
| `GEMINI_API_KEY` / `GEMINI_MODEL` | Google Gemini credentials (falls back to a static tip when empty) |
| `MAIL_HOST` / `MAIL_PORT` / `MAIL_USERNAME` / `MAIL_PASSWORD` / `MAIL_FROM` | SMTP settings for advisory emails |
| `QUOTA_WARNING_THRESHOLD` / `QUOTA_BREACH_THRESHOLD` | Quota trigger ratios (default 0.8 / 1.0) |
| `PENALTY_MULTIPLIER` | Penalty tariff multiplier applied after a breach (default 1.5) |
| `CONSECUTIVE_BREACH_LIMIT` | Consecutive cycles before an appliance is flagged anomalous (default 3) |

## Quick start (Docker)

```bash
cp .env.example .env
docker compose up --build
```

Once the stack is healthy:

- Web App: http://localhost:8081
- Core API: http://localhost:8080
- Swagger UI: http://localhost:8080/swagger-ui.html

The PostgreSQL schema in `db/init/01_schema.sql` is executed automatically on first container start.

## Local development

Run each module in its own terminal after exporting the variables from `.env`.

```bash
# Core
cd voltwise-core
mvn spring-boot:run

# Sensors
cd voltwise-sensors
mvn spring-boot:run

# Web App
cd voltwise-webapp
npm install
npm run dev
```

The Vite dev server runs on http://localhost:5173 and proxies `/api` to the Core on port 8080.

## REST API

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/homes` | Register a home and its appliance topology |
| `GET` | `/api/homes` | Live summaries of every registered home (from Ignite) |
| `GET` | `/api/homes/{id}/status` | Real-time status of a home and its appliances (from Ignite) |
| `GET` | `/api/homes/{id}/history` | Paginated consumption history from PostgreSQL (`?page=&size=`, newest first) |
| `GET` | `/api/homes/{id}/recommendations` | Paginated AI advisory history from PostgreSQL (`?page=&size=`, newest first) |

### Sample registration payload

```json
{
  "name": "Yıldız Apartmanı 3",
  "contactEmail": "resident@example.com",
  "budgetLimit": 500.0,
  "baseRatePerKwh": 2.5,
  "appliances": [
    { "name": "Klima", "nominalWatt": 1200, "safeLimitWatt": 1800 },
    { "name": "Çamaşır Makinesi", "nominalWatt": 800, "safeLimitWatt": 1500 },
    { "name": "Buzdolabı", "nominalWatt": 150, "safeLimitWatt": 300 }
  ]
}
```

After registration the Sensors service starts emitting wattage for the new appliances within seconds,
and the dashboard reflects the accumulating cost and any quota or anomaly alerts in real time.

## Project structure

```
VoltiHome/
├── docker-compose.yml
├── .env.example
├── db/init/01_schema.sql
├── voltwise-core/       Spring Boot backend (modular monolith)
├── voltwise-sensors/    Telemetry simulation engine
└── voltwise-webapp/     React + Vite dashboard
```
