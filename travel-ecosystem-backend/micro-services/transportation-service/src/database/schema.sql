-- GTFS Static Tables with PostGIS

-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- Agencies
CREATE TABLE IF NOT EXISTS agencies (
  agency_id VARCHAR(255) PRIMARY KEY,
  agency_name VARCHAR(255) NOT NULL,
  agency_url VARCHAR(512) NOT NULL,
  agency_timezone VARCHAR(50) NOT NULL,
  agency_lang VARCHAR(10),
  agency_phone VARCHAR(50)
);

-- Stops with spatial index
CREATE TABLE IF NOT EXISTS stops (
  stop_id VARCHAR(255) PRIMARY KEY,
  stop_code VARCHAR(50),
  stop_name VARCHAR(255) NOT NULL,
  stop_desc TEXT,
  stop_lat DECIMAL(10, 8) NOT NULL,
  stop_lon DECIMAL(11, 8) NOT NULL,
  stop_location GEOGRAPHY(POINT, 4326),
  zone_id VARCHAR(255),
  stop_url VARCHAR(512),
  location_type INTEGER DEFAULT 0,
  parent_station VARCHAR(255),
  stop_timezone VARCHAR(50),
  wheelchair_boarding INTEGER
);

CREATE INDEX IF NOT EXISTS idx_stops_location 
  ON stops USING GIST (stop_location);

-- Trigger to automatically set stop_location from lat/lon
CREATE OR REPLACE FUNCTION update_stop_location()
RETURNS TRIGGER AS $$
BEGIN
  NEW.stop_location = ST_SetSRID(ST_MakePoint(NEW.stop_lon, NEW.stop_lat), 4326)::geography;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_stop_location
  BEFORE INSERT OR UPDATE ON stops
  FOR EACH ROW
  EXECUTE FUNCTION update_stop_location();

-- Routes
CREATE TABLE IF NOT EXISTS routes (
  route_id VARCHAR(255) PRIMARY KEY,
  agency_id VARCHAR(255) REFERENCES agencies(agency_id),
  route_short_name VARCHAR(50),
  route_long_name VARCHAR(255) NOT NULL,
  route_desc TEXT,
  route_type INTEGER NOT NULL,
  route_url VARCHAR(512),
  route_color VARCHAR(6),
  route_text_color VARCHAR(6),
  route_sort_order INTEGER
);

CREATE INDEX IF NOT EXISTS idx_routes_agency 
  ON routes(agency_id);

-- Trips
CREATE TABLE IF NOT EXISTS trips (
  trip_id VARCHAR(255) PRIMARY KEY,
  route_id VARCHAR(255) NOT NULL REFERENCES routes(route_id),
  service_id VARCHAR(255) NOT NULL,
  trip_headsign VARCHAR(255),
  trip_short_name VARCHAR(50),
  direction_id INTEGER,
  block_id VARCHAR(255),
  shape_id VARCHAR(255),
  wheelchair_accessible INTEGER,
  bikes_allowed INTEGER
);

CREATE INDEX IF NOT EXISTS idx_trips_route 
  ON trips(route_id);
CREATE INDEX IF NOT EXISTS idx_trips_service 
  ON trips(service_id);

-- Stop Times
CREATE TABLE IF NOT EXISTS stop_times (
  id SERIAL PRIMARY KEY,
  trip_id VARCHAR(255) NOT NULL REFERENCES trips(trip_id),
  arrival_time VARCHAR(8) NOT NULL,
  departure_time VARCHAR(8) NOT NULL,
  stop_id VARCHAR(255) NOT NULL REFERENCES stops(stop_id),
  stop_sequence INTEGER NOT NULL,
  stop_headsign VARCHAR(255),
  pickup_type INTEGER DEFAULT 0,
  drop_off_type INTEGER DEFAULT 0,
  shape_dist_traveled DECIMAL(10, 2),
  timepoint INTEGER DEFAULT 1,
  UNIQUE(trip_id, stop_sequence)
);

CREATE INDEX IF NOT EXISTS idx_stop_times_trip 
  ON stop_times(trip_id);
CREATE INDEX IF NOT EXISTS idx_stop_times_stop 
  ON stop_times(stop_id);
CREATE INDEX IF NOT EXISTS idx_stop_times_arrival 
  ON stop_times(arrival_time);

-- Calendar
CREATE TABLE IF NOT EXISTS calendar (
  service_id VARCHAR(255) PRIMARY KEY,
  monday INTEGER NOT NULL,
  tuesday INTEGER NOT NULL,
  wednesday INTEGER NOT NULL,
  thursday INTEGER NOT NULL,
  friday INTEGER NOT NULL,
  saturday INTEGER NOT NULL,
  sunday INTEGER NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL
);

-- Calendar Dates (exceptions)
CREATE TABLE IF NOT EXISTS calendar_dates (
  service_id VARCHAR(255) NOT NULL,
  date DATE NOT NULL,
  exception_type INTEGER NOT NULL,
  PRIMARY KEY (service_id, date)
);

-- Shapes
CREATE TABLE IF NOT EXISTS shapes (
  id SERIAL PRIMARY KEY,
  shape_id VARCHAR(255) NOT NULL,
  shape_pt_lat DECIMAL(10, 8) NOT NULL,
  shape_pt_lon DECIMAL(11, 8) NOT NULL,
  shape_pt_location GEOGRAPHY(POINT, 4326),
  shape_pt_sequence INTEGER NOT NULL,
  shape_dist_traveled DECIMAL(10, 2),
  UNIQUE(shape_id, shape_pt_sequence)
);

CREATE INDEX IF NOT EXISTS idx_shapes_id 
  ON shapes(shape_id);
CREATE INDEX IF NOT EXISTS idx_shapes_location 
  ON shapes USING GIST (shape_pt_location);

-- GTFS-RT Tables

-- Vehicle Positions
CREATE TABLE IF NOT EXISTS vehicle_positions (
  id SERIAL PRIMARY KEY,
  vehicle_id VARCHAR(255) NOT NULL,
  trip_id VARCHAR(255),
  route_id VARCHAR(255),
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  vehicle_location GEOGRAPHY(POINT, 4326),
  bearing DECIMAL(5, 2),
  speed DECIMAL(5, 2),
  timestamp BIGINT NOT NULL,
  current_stop_sequence INTEGER,
  current_status VARCHAR(50),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_vehicle_positions_vehicle 
  ON vehicle_positions(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_positions_trip 
  ON vehicle_positions(trip_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_positions_location 
  ON vehicle_positions USING GIST (vehicle_location);
CREATE INDEX IF NOT EXISTS idx_vehicle_positions_timestamp 
  ON vehicle_positions(timestamp);

-- Trip Updates
CREATE TABLE IF NOT EXISTS trip_updates (
  id SERIAL PRIMARY KEY,
  trip_id VARCHAR(255) NOT NULL,
  route_id VARCHAR(255),
  start_date DATE,
  schedule_relationship VARCHAR(50),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_trip_updates_trip 
  ON trip_updates(trip_id);
CREATE INDEX IF NOT EXISTS idx_trip_updates_updated 
  ON trip_updates(updated_at);

-- Stop Time Updates (child of trip_updates)
CREATE TABLE IF NOT EXISTS stop_time_updates (
  id SERIAL PRIMARY KEY,
  trip_update_id INTEGER NOT NULL REFERENCES trip_updates(id) ON DELETE CASCADE,
  stop_sequence INTEGER,
  stop_id VARCHAR(255),
  arrival_delay INTEGER,
  departure_delay INTEGER,
  arrival_time BIGINT,
  departure_time BIGINT
);

CREATE INDEX IF NOT EXISTS idx_stop_time_updates_trip_update 
  ON stop_time_updates(trip_update_id);
CREATE INDEX IF NOT EXISTS idx_stop_time_updates_stop 
  ON stop_time_updates(stop_id);
