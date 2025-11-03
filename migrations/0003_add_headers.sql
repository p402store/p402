-- Migration: Add headers field to apis table
-- Description: Add custom headers for API proxy requests (private field)

ALTER TABLE apis ADD COLUMN headers TEXT DEFAULT '{}';
