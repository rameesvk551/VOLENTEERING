-- Create PostgreSQL database and user for Travel Ecosystem Auth Service
-- Run this script as postgres superuser

-- Create user (if not exists)
DO
$do$
BEGIN
   IF NOT EXISTS (
      SELECT FROM pg_catalog.pg_roles
      WHERE  rolname = 'travel_user') THEN
      CREATE ROLE travel_user LOGIN PASSWORD 'change_this_password';
   END IF;
END
$do$;

-- Create database
DROP DATABASE IF EXISTS travel_auth;
CREATE DATABASE travel_auth;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE travel_auth TO travel_user;

-- Connect to the database
\c travel_auth

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO travel_user;

-- Display success message
\echo 'Database setup completed successfully!'
\echo 'Database: travel_auth'
\echo 'User: travel_user'
\echo 'Password: change_this_password (please update this)'
