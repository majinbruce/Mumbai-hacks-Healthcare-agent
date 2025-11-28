-- Healthcare Agent Database Schema
-- This file is automatically executed when PostgreSQL container starts

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Predictions table
CREATE TABLE IF NOT EXISTS predictions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    festival VARCHAR(255),
    aqi VARCHAR(100),
    epidemic VARCHAR(255),
    current_staffing JSONB NOT NULL,
    current_supply JSONB NOT NULL,
    recommendations JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Knowledge base table
CREATE TABLE IF NOT EXISTS knowledge_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    festival VARCHAR(255),
    aqi VARCHAR(100),
    season VARCHAR(50),
    health_impact TEXT NOT NULL,
    recommended_staffing TEXT,
    required_supplies TEXT,
    patient_advisory TEXT,
    source VARCHAR(100), -- 'pdf', 'csv', 'excel', 'manual'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Uploaded files tracking
CREATE TABLE IF NOT EXISTS uploaded_files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    filename VARCHAR(500) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_size INTEGER NOT NULL,
    entries_extracted INTEGER DEFAULT 0,
    upload_status VARCHAR(50) DEFAULT 'processing', -- 'processing', 'completed', 'failed'
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_predictions_created_at ON predictions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_predictions_festival ON predictions(festival);
CREATE INDEX IF NOT EXISTS idx_predictions_aqi ON predictions(aqi);
CREATE INDEX IF NOT EXISTS idx_predictions_epidemic ON predictions(epidemic);

CREATE INDEX IF NOT EXISTS idx_knowledge_festival ON knowledge_entries(festival);
CREATE INDEX IF NOT EXISTS idx_knowledge_aqi ON knowledge_entries(aqi);
CREATE INDEX IF NOT EXISTS idx_knowledge_season ON knowledge_entries(season);
CREATE INDEX IF NOT EXISTS idx_knowledge_created_at ON knowledge_entries(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_uploaded_files_created_at ON uploaded_files(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_uploaded_files_status ON uploaded_files(upload_status);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to auto-update updated_at
CREATE TRIGGER update_predictions_updated_at BEFORE UPDATE ON predictions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_knowledge_updated_at BEFORE UPDATE ON knowledge_entries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample knowledge data
INSERT INTO knowledge_entries (festival, aqi, season, health_impact, recommended_staffing, required_supplies, patient_advisory, source)
VALUES
(
    'Diwali',
    'Hazardous (300+)',
    'Winter',
    'Air pollution levels spike during Diwali due to fireworks. Increased respiratory issues including asthma attacks, COPD exacerbations, and allergic reactions. Emergency cases rise by 40%.',
    'Increase pulmonologists by 50%, respiratory therapists by 60%, ER doctors by 40%, nurses by 45%',
    'Respiratory medications: +200%, oxygen cylinders: +150%, nebulizers: +80%, inhalers: +120%, masks (N95): +300%',
    'Avoid outdoor activities during peak pollution hours. Use N95 masks when outdoors. Keep windows closed. Use air purifiers indoors.',
    'manual'
),
(
    NULL,
    'Very High (201-300)',
    'Summer',
    'Extreme AQI levels during summer cause heat stress combined with poor air quality. Respiratory distress, cardiovascular complications increase significantly.',
    'Increase cardiologists by 25%, pulmonologists by 40%, ER staff by 50%',
    'Cardiac medications: +80%, respiratory medications: +150%, oxygen supply: +100%, IV fluids: +200%',
    'Stay indoors during peak hours. Use air conditioning with filters. Drink plenty of water. Monitor heart rate and breathing.',
    'manual'
)
ON CONFLICT DO NOTHING;

-- Create a view for prediction statistics
CREATE OR REPLACE VIEW prediction_statistics AS
SELECT
    COUNT(*) as total_predictions,
    COUNT(CASE WHEN festival IS NOT NULL THEN 1 END) as festival_predictions,
    COUNT(CASE WHEN aqi IS NOT NULL THEN 1 END) as aqi_predictions,
    COUNT(CASE WHEN epidemic IS NOT NULL THEN 1 END) as epidemic_predictions,
    DATE_TRUNC('day', created_at) as prediction_date,
    COUNT(*) as daily_count
FROM predictions
GROUP BY prediction_date
ORDER BY prediction_date DESC;

-- Create a view for knowledge statistics
CREATE OR REPLACE VIEW knowledge_statistics AS
SELECT
    COUNT(*) as total_entries,
    COUNT(DISTINCT festival) as unique_festivals,
    COUNT(DISTINCT aqi) as unique_aqi_levels,
    COUNT(DISTINCT season) as unique_seasons,
    source,
    COUNT(*) as count_by_source
FROM knowledge_entries
GROUP BY source;
