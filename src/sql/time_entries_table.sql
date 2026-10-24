-- Create time_entries table for employee time tracking
CREATE TABLE IF NOT EXISTS time_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID REFERENCES "user"(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES booking(id) ON DELETE SET NULL,
  clock_in TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  clock_out TIMESTAMPTZ NULL,
  total_hours DECIMAL(5,2) NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for efficient queries
CREATE INDEX IF NOT EXISTS idx_time_entries_employee_id ON time_entries(employee_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_clock_in ON time_entries(clock_in);
CREATE INDEX IF NOT EXISTS idx_time_entries_booking_id ON time_entries(booking_id);

-- Enable RLS (Row Level Security)
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;

-- Create policies for time_entries
CREATE POLICY "Users can view their own time entries" ON time_entries
  FOR SELECT
  USING (auth.uid() = employee_id);

CREATE POLICY "Users can insert their own time entries" ON time_entries
  FOR INSERT
  WITH CHECK (auth.uid() = employee_id);

CREATE POLICY "Users can update their own time entries" ON time_entries
  FOR UPDATE
  USING (auth.uid() = employee_id);

-- Admins can view all time entries
CREATE POLICY "Admins can view all time entries" ON time_entries
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM "user"
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_time_entries_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_time_entries_updated_at
  BEFORE UPDATE ON time_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_time_entries_updated_at();