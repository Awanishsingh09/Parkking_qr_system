-- SQL Schema for ParkPing

-- 1. Create the custom ENUM status type
CREATE TYPE public.qr_status AS ENUM ('unregistered', 'active', 'inactive');

-- 2. Create the qr_codes table
CREATE TABLE IF NOT EXISTS public.qr_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status public.qr_status NOT NULL DEFAULT 'unregistered',
    owner_name TEXT NULL,
    phone TEXT NULL,
    car_number TEXT NULL,
    vehicle_type TEXT NULL, -- 'car', 'bike', 'scooter', 'other'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    registered_at TIMESTAMP WITH TIME ZONE NULL,
    scan_count INTEGER DEFAULT 0 NOT NULL
);

-- 3. Enable Row-Level Security (RLS)
ALTER TABLE public.qr_codes ENABLE ROW LEVEL SECURITY;

-- 4. Set up Policies

-- Select Policy: Allow public read access to active or unregistered rows.
-- (Inactive rows cannot be read by public)
CREATE POLICY "Public read active or unregistered" ON public.qr_codes
    FOR SELECT
    USING (status = 'active' OR status = 'unregistered');

-- Update Policy: Allow public to transition unregistered QR codes to active
CREATE POLICY "Public register unregistered" ON public.qr_codes
    FOR UPDATE
    USING (status = 'unregistered')
    WITH CHECK (status = 'active');

-- Admin Policy: Allow authenticated users (Admins) full CRUD operations
CREATE POLICY "Admin full access" ON public.qr_codes
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- 5. RPC function to increment scan count safely
CREATE OR REPLACE FUNCTION public.increment_scan(qr_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE public.qr_codes
    SET scan_count = scan_count + 1
    WHERE id = qr_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

