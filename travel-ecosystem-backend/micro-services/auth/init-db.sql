-- Initialize database for Travel Ecosystem Auth Service
-- This file is automatically executed when the PostgreSQL container starts

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Database is already created by docker-compose (POSTGRES_DB=travel_auth)
-- Just add any additional setup here if needed

\echo 'Database initialization completed successfully!'
