# Insight Contract Intelligence Platform - Monitoring Stack

This directory contains the configuration for the Prometheus + Grafana monitoring stack.

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Spring Boot   │────▶│   Prometheus    │────▶│    Grafana      │
│    Backend      │     │   (scraping)    │     │  (dashboards)   │
│  :8080/actuator │     │     :9090       │     │     :3001       │
└─────────────────┘     └─────────────────┘     └─────────────────┘
       │                        │
       │                        │
       ▼                        ▼
  /actuator/prometheus    Alert Rules
  (metrics endpoint)      (alert.rules.yml)
```

## Quick Start

1. **Start the monitoring stack:**
   ```bash
   docker-compose up -d prometheus grafana
   ```

2. **Access the services:**
   - Prometheus: http://localhost:9090
   - Grafana: http://localhost:3001 (default: admin/admin)

3. **The Insight dashboard** is auto-provisioned and available in Grafana.

## Directory Structure

```
docker/monitoring/
├── prometheus.yml          # Prometheus configuration
├── alert.rules.yml         # Alerting rules
└── grafana/
    ├── provisioning/
    │   ├── datasources/
    │   │   └── prometheus.yml   # Auto-configure Prometheus datasource
    │   └── dashboards/
    │       └── dashboard.yml    # Dashboard provisioning config
    └── dashboards/
        └── samgov-dashboard.json # Pre-built dashboard
```

## Metrics Exposed

### Application Metrics (via Actuator)

| Endpoint | Description |
|----------|-------------|
| `/actuator/health` | Health check |
| `/actuator/info` | Application info |
| `/actuator/metrics` | All metrics (JSON) |
| `/actuator/prometheus` | Metrics in Prometheus format |

### Custom Business Metrics

| Metric | Type | Description |
|--------|------|-------------|
| `samgov_opportunities_indexed_total` | Counter | Total opportunities indexed |
| `samgov_opportunities_active` | Gauge | Current active opportunities |
| `samgov_searches_performed_total` | Counter | Total searches performed |
| `samgov_api_calls_total` | Counter | External API calls (labeled by api, status) |
| `samgov_ingestion_duration_seconds` | Timer | Ingestion operation timing |
| `samgov_search_duration_seconds` | Timer | Search operation timing |
| `samgov_user_logins_total` | Counter | User login events |
| `samgov_user_registrations_total` | Counter | User registration events |

### JVM Metrics (Auto-collected)

- `jvm_memory_*` - Heap and non-heap memory usage
- `jvm_gc_*` - Garbage collection metrics
- `jvm_threads_*` - Thread pool metrics
- `jvm_classes_*` - Class loading metrics

### HTTP Metrics (Auto-collected)

- `http_server_requests_seconds_*` - Request latency histograms
- Labels: method, uri, status, exception

### Database Metrics (HikariCP)

- `hikaricp_connections_*` - Connection pool metrics
- `hikaricp_connections_acquire_seconds` - Connection acquisition time
- `hikaricp_connections_usage_seconds` - Connection usage time

## Alerting Rules

The following alerts are configured in `alert.rules.yml`:

### Critical Alerts
- **ServiceDown** - Backend is unreachable for 1+ minute
- **CriticalErrorRate** - 20%+ HTTP 5xx errors
- **CriticalHeapMemoryUsage** - 95%+ heap usage
- **DatabaseConnectionTimeout** - Connection pool timeouts
- **DeadlockedThreads** - JVM deadlock detected

### Warning Alerts
- **HighErrorRate** - 5%+ HTTP 5xx errors
- **HighHeapMemoryUsage** - 85%+ heap usage
- **HighGCPauseTime** - Excessive GC pauses
- **DatabasePoolExhaustion** - 90%+ pool utilization
- **HighAPILatency** - P95 latency > 2 seconds
- **LowCacheHitRate** - Cache hit rate < 50%
- **NoOpportunitiesIngested** - No ingestion in 2 hours

## Using Custom Metrics in Code

Inject `BusinessMetrics` into your services:

```java
@Service
public class OpportunityService {
    private final BusinessMetrics businessMetrics;

    public OpportunityService(BusinessMetrics businessMetrics) {
        this.businessMetrics = businessMetrics;
    }

    public void indexOpportunity(Opportunity opp) {
        // ... indexing logic
        businessMetrics.recordOpportunityIndexed();
    }

    public List<Opportunity> search(String query) {
        return businessMetrics.getSearchTimer().record(() -> {
            businessMetrics.recordSearchPerformed();
            return performSearch(query);
        });
    }
}
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PROMETHEUS_PORT` | 9090 | Prometheus web UI port |
| `GRAFANA_PORT` | 3001 | Grafana web UI port |
| `GRAFANA_USER` | admin | Grafana admin username |
| `GRAFANA_PASSWORD` | admin | Grafana admin password |
| `GRAFANA_ROOT_URL` | http://localhost:3001 | Grafana public URL |
| `ENVIRONMENT` | development | Environment tag for metrics |

## Production Considerations

1. **Change default passwords** - Update `GRAFANA_PASSWORD`
2. **Enable alerting** - Configure Alertmanager for notifications
3. **Adjust retention** - Default is 15 days, adjust in prometheus.yml
4. **Add persistent storage** - Volumes are configured but verify backup
5. **Secure endpoints** - Consider restricting actuator access in production

## Adding New Dashboards

1. Create dashboard in Grafana UI
2. Export as JSON (Share -> Export -> Save to file)
3. Save to `grafana/dashboards/`
4. Dashboard will be auto-loaded on next restart

## Troubleshooting

**Prometheus can't scrape backend:**
- Verify backend is running: `curl http://localhost:8080/actuator/health`
- Check Prometheus targets: http://localhost:9090/targets

**Grafana shows no data:**
- Verify Prometheus has data: http://localhost:9090/graph
- Check datasource configuration in Grafana

**Metrics not appearing:**
- Verify actuator is enabled in application.yaml
- Check `/actuator/prometheus` endpoint directly
