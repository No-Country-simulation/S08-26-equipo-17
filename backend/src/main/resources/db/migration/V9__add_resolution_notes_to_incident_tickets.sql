-- V8: Add resolution_notes to incident_tickets (FR-17)
ALTER TABLE incident_tickets ADD COLUMN IF NOT EXISTS resolution_notes TEXT;
