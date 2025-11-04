-- Migration: Add tags field to apis table
-- Description: Add tags field for categorizing and searching APIs

ALTER TABLE apis ADD COLUMN tags TEXT DEFAULT '';
