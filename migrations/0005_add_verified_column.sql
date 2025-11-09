-- Add verified column to apis table
ALTER TABLE apis ADD COLUMN verified INTEGER DEFAULT 0;

-- Create index for verified column
CREATE INDEX IF NOT EXISTS idx_apis_verified ON apis(verified);
