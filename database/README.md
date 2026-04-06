# PostgreSQL + TimescaleDB for KukkutRaksha AI

## Overview
Self-hosted time-series database optimized for IoT sensor data with automatic compression and continuous aggregates.

## Quick Start

### 1. Create Environment File
```bash
cp .env.example .env
# Edit .env with your secure passwords
```

### 2. Start Database
```bash
docker-compose up -d
```

### 3. Verify Installation
```bash
docker-compose logs timescaledb
# Wait for: "database system is ready to accept connections"
```

### 4. Access pgAdmin (Development Only)
- URL: http://localhost:5050
- Email: admin@kukkutraksha.local
- Password: (from .env)

## Database Schema

### Tables Created:
- **farms**: Farm metadata and configuration
- **sensor_data**: Real-time IoT readings (hypertable)
- **disease_predictions**: 10-day risk forecasts
- **alerts**: System alerts and notifications

### Features Enabled:
✅ TimescaleDB hypertables for time-series optimization
✅ Automatic compression (data older than 7 days)
✅ Continuous aggregates (hourly stats)
✅ Optimized indexes for fast queries
✅ Alert tracking with acknowledgment

## Connection Strings

### Backend Application
```
postgresql://kukkut_admin:YOUR_PASSWORD@localhost:5432/kukkutraksha_db
```

### Direct psql Access
```bash
docker exec -it kukkut_timescaledb psql -U kukkut_admin -d kukkutraksha_db
```

## Useful Queries

### Latest Sensor Readings
```sql
SELECT * FROM sensor_data 
WHERE farm_id = 1 
ORDER BY time DESC 
LIMIT 10;
```

### Hourly Averages (using continuous aggregate)
```sql
SELECT bucket, avg_temp, avg_humidity, avg_ammonia
FROM sensor_data_hourly
WHERE farm_id = 1
ORDER BY bucket DESC
LIMIT 24;
```

### Unacknowledged Alerts
```sql
SELECT * FROM alerts 
WHERE is_acknowledged = FALSE 
ORDER BY created_at DESC;
```

### Disease Predictions
```sql
SELECT prediction_date, risk_level, risk_score, recommendations
FROM disease_predictions
WHERE farm_id = 1
ORDER BY prediction_date DESC
LIMIT 10;
```

## Maintenance

### Backup Database
```bash
docker exec kukkut_timescaledb pg_dump -U kukkut_admin kukkutraksha_db > backup.sql
```

### Restore Database
```bash
docker exec -i kukkut_timescaledb psql -U kukkut_admin -d kukkutraksha_db < backup.sql
```

### View Database Size
```sql
SELECT pg_size_pretty(pg_database_size('kukkutraksha_db'));
```

### Compression Stats
```sql
SELECT * FROM timescaledb_information.compression_stats 
WHERE hypertable_name = 'sensor_data';
```

## Security Notes

⚠️ **Production Checklist:**
- [ ] Change default passwords in .env
- [ ] Remove pgAdmin service or restrict access
- [ ] Enable SSL/TLS for connections
- [ ] Configure firewall rules (port 5432)
- [ ] Set up automated backups
- [ ] Monitor disk usage
- [ ] Update Docker images regularly

## Troubleshooting

### Database Won't Start
```bash
docker-compose down
docker volume rm database_timescale_data
docker-compose up -d
```
(Note: This deletes all data!)

### Check Logs
```bash
docker-compose logs -f timescaledb
```

### Restart Services
```bash
docker-compose restart
```

## Performance Tips

1. **Retention Policy**: Add data retention if needed
   ```sql
   SELECT add_retention_policy('sensor_data', INTERVAL '90 days');
   ```

2. **Query Optimization**: Use time ranges in WHERE clauses
   ```sql
   -- Good (uses partition pruning)
   SELECT * FROM sensor_data 
   WHERE time > NOW() - INTERVAL '1 day';
   
   -- Bad (scans entire table)
   SELECT * FROM sensor_data;
   ```

3. **Monitor Continuous Aggregates**:
   ```sql
   SELECT * FROM timescaledb_information.continuous_aggregates;
   ```

## Resources

- [TimescaleDB Documentation](https://docs.timescale.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Docker Compose Reference](https://docs.docker.com/compose/)
