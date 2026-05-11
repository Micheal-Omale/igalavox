-- Create auth profile table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  role TEXT DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audio files
CREATE TABLE audio_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  duration INT,
  uploaded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Names system
CREATE TABLE names (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  meaning TEXT NOT NULL,
  origin TEXT,
  origin_story_ai TEXT,
  origin_story_final TEXT,
  gender TEXT,
  tags TEXT[],
  audio_id UUID REFERENCES audio_files(id) ON DELETE SET NULL,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Submissions
CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  meaning TEXT,
  origin TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE audio_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE names ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- Policies for Admins (all operations) - temporarily PUBLIC for MVP without Auth
DROP POLICY IF EXISTS "Admins full access" ON profiles;
DROP POLICY IF EXISTS "Admins full access" ON audio_files;
DROP POLICY IF EXISTS "Admins full access" ON names;
DROP POLICY IF EXISTS "Admins full access" ON submissions;

CREATE POLICY "Admins full access" ON profiles FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Admins full access" ON audio_files FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Admins full access" ON names FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Admins full access" ON submissions FOR ALL TO public USING (true) WITH CHECK (true);

-- Public Read Policies
DROP POLICY IF EXISTS "Public read names" ON names;
DROP POLICY IF EXISTS "Public read audio_files" ON audio_files;

CREATE POLICY "Public read names" ON names FOR SELECT TO anon USING (true);
CREATE POLICY "Public read audio_files" ON audio_files FOR SELECT TO anon USING (true);

-- Orders & submissions creation by public
DROP POLICY IF EXISTS "Public insert submissions" ON submissions;
CREATE POLICY "Public insert submissions" ON submissions FOR INSERT TO anon WITH CHECK (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_names_name ON names(name);

-- Storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('audio', 'audio', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

-- Storage policies
DROP POLICY IF EXISTS "Public read audio" ON storage.objects;
DROP POLICY IF EXISTS "Admin upload audio" ON storage.objects;
DROP POLICY IF EXISTS "Admin update audio" ON storage.objects;
DROP POLICY IF EXISTS "Admin delete audio" ON storage.objects;

CREATE POLICY "Public read audio" ON storage.objects FOR SELECT TO public USING (bucket_id = 'audio');
CREATE POLICY "Admin upload audio" ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = 'audio');
CREATE POLICY "Admin update audio" ON storage.objects FOR UPDATE TO public USING (bucket_id = 'audio');
CREATE POLICY "Admin delete audio" ON storage.objects FOR DELETE TO public USING (bucket_id = 'audio');

