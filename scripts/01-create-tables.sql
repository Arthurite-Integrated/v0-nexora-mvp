-- Nexora MVP Database Schema
-- Users table for all user types (caregivers, professionals, admins)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT CHECK (role IN ('caregiver','professional','admin')) NOT NULL,
  phone TEXT,
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Professionals table with extended profile information
CREATE TABLE professionals (
  id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  specialization TEXT NOT NULL,
  location TEXT,
  bio TEXT,
  credentials_url TEXT,
  verified BOOLEAN DEFAULT FALSE,
  years_experience INTEGER,
  consultation_fee DECIMAL(10,2),
  languages TEXT[], -- Array of languages spoken
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Availability slots for professionals
CREATE TABLE availability_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID REFERENCES professionals(id) ON DELETE CASCADE,
  day_of_week INTEGER CHECK (day_of_week BETWEEN 0 AND 6), -- 0 = Sunday, 6 = Saturday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bookings table
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID REFERENCES professionals(id) ON DELETE CASCADE,
  caregiver_id UUID REFERENCES users(id) ON DELETE CASCADE,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  status TEXT CHECK (status IN ('pending','confirmed','cancelled','completed')) DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Prevent double booking
  UNIQUE(professional_id, appointment_date, appointment_time)
);

-- Reviews table for professional ratings
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID REFERENCES professionals(id) ON DELETE CASCADE,
  caregiver_id UUID REFERENCES users(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can read their own data
CREATE POLICY "Users can read own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid() = id);

-- Professionals can manage their own profiles
CREATE POLICY "Professionals can read own profile" ON professionals FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Professionals can update own profile" ON professionals FOR UPDATE USING (auth.uid() = id);

-- Anyone can read verified professionals
CREATE POLICY "Anyone can read verified professionals" ON professionals FOR SELECT USING (verified = true);

-- Professionals can manage their availability
CREATE POLICY "Professionals can manage availability" ON availability_slots FOR ALL USING (auth.uid() = professional_id);

-- Booking policies
CREATE POLICY "Users can read own bookings" ON bookings FOR SELECT USING (auth.uid() = caregiver_id OR auth.uid() = professional_id);
CREATE POLICY "Caregivers can create bookings" ON bookings FOR INSERT WITH CHECK (auth.uid() = caregiver_id);
CREATE POLICY "Professionals can update booking status" ON bookings FOR UPDATE USING (auth.uid() = professional_id);

-- Review policies
CREATE POLICY "Anyone can read reviews" ON reviews FOR SELECT TO authenticated;
CREATE POLICY "Caregivers can create reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = caregiver_id);
