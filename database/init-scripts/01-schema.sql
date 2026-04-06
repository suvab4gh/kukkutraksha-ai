-- Enable TimescaleDB extension
CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;

-- Create farms table
CREATE TABLE IF NOT EXISTS farms (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    owner_id VARCHAR(255) NOT NULL,
    location_lat DECIMAL(10, 8),
    location_lng DECIMAL(11, 8),
    address TEXT,
    capacity INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sensor_data hypertable (TimescaleDB optimized for time-series)
CREATE TABLE IF NOT EXISTS sensor_data (
    time TIMESTAMPTZ NOT NULL,
    farm_id INTEGER REFERENCES farms(id),
    device_id VARCHAR(100) NOT NULL,
    temperature DECIMAL(5, 2),
    humidity DECIMAL(5, 2),
    ammonia_ppm DECIMAL(8, 3),
    co2_ppm INTEGER,
    tds_ppm INTEGER,
    ph DECIMAL(4, 2),
    alert_status VARCHAR(20) DEFAULT 'normal'
);

-- Convert to hypertable (TimescaleDB magic)
SELECT create_hypertable('sensor_data', 'time', if_not_exists => TRUE);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_sensor_data_farm_time ON sensor_data (farm_id, time DESC);
CREATE INDEX IF NOT EXISTS idx_sensor_data_device ON sensor_data (device_id);
CREATE INDEX IF NOT EXISTS idx_sensor_data_alerts ON sensor_data (alert_status) WHERE alert_status != 'normal';

-- Create disease_predictions table
CREATE TABLE IF NOT EXISTS disease_predictions (
    id SERIAL PRIMARY KEY,
    farm_id INTEGER REFERENCES farms(id),
    prediction_date DATE NOT NULL,
    risk_level VARCHAR(20) NOT NULL, -- green, yellow, orange, red
    risk_score DECIMAL(5, 2),
    factors JSONB,
    recommendations TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_predictions_farm_date ON disease_predictions (farm_id, prediction_date DESC);

-- Create alerts table
CREATE TABLE IF NOT EXISTS alerts (
    id SERIAL PRIMARY KEY,
    farm_id INTEGER REFERENCES farms(id),
    alert_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL, -- low, medium, high, critical
    message TEXT NOT NULL,
    sensor_data JSONB,
    is_acknowledged BOOLEAN DEFAULT FALSE,
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_alerts_farm_unack ON alerts (farm_id) WHERE is_acknowledged = FALSE;
CREATE INDEX IF NOT EXISTS idx_alerts_created ON alerts (created_at DESC);

-- Create compression policy for old data (optional, saves space)
-- Compress data older than 7 days
SELECT add_compression_policy('sensor_data', INTERVAL '7 days') ON CONFLICT DO NOTHING;

-- Create continuous aggregate for hourly stats (performance optimization)
CREATE MATERIALIZED VIEW IF NOT EXISTS sensor_data_hourly
WITH (timescaledb.continuous) AS
SELECT 
    time_bucket('1 hour', time) AS bucket,
    farm_id,
    device_id,
    AVG(temperature) AS avg_temp,
    MAX(temperature) AS max_temp,
    MIN(temperature) AS min_temp,
    AVG(humidity) AS avg_humidity,
    AVG(ammonia_ppm) AS avg_ammonia,
    AVG(co2_ppm) AS avg_co2,
    COUNT(*) AS reading_count
FROM sensor_data
GROUP BY bucket, farm_id, device_id
WITH NO DATA;

-- Refresh policy for continuous aggregate
SELECT add_continuous_aggregate_policy('sensor_data_hourly',
    start_offset => INTERVAL '2 days',
    end_offset => INTERVAL '1 hour',
    schedule_interval => INTERVAL '1 hour') ON CONFLICT DO NOTHING;

COMMENT ON TABLE farms IS 'Poultry farm metadata and configuration';
COMMENT ON TABLE sensor_data IS 'Real-time IoT sensor readings (hypertable)';
COMMENT ON TABLE disease_predictions IS '10-day disease risk predictions';
COMMENT ON TABLE alerts IS 'System alerts and notifications';
