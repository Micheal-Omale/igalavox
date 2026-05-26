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

-- Community Impact
CREATE TABLE IF NOT EXISTS communities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_name TEXT NOT NULL,
  lga TEXT NOT NULL,
  latitude NUMERIC,
  longitude NUMERIC
);

CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL CHECK (category IN ('water', 'electricity', 'roads', 'healthcare')),
  title TEXT,
  description TEXT NOT NULL,
  community_name TEXT NOT NULL,
  lga TEXT NOT NULL,
  latitude NUMERIC,
  longitude NUMERIC,
  image_url TEXT,
  image_urls TEXT[],
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'resolved')),
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE reports ADD COLUMN IF NOT EXISTS image_urls TEXT[];
ALTER TABLE reports ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT false;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE reports DROP CONSTRAINT IF EXISTS reports_image_urls_max_3;
ALTER TABLE reports ADD CONSTRAINT reports_image_urls_max_3 CHECK (image_urls IS NULL OR cardinality(image_urls) <= 3);

CREATE TABLE IF NOT EXISTS community_evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID REFERENCES reports(id) ON DELETE SET NULL,
  title TEXT,
  description TEXT NOT NULL,
  media_url TEXT NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('youtube', 'tiktok', 'facebook')),
  category TEXT DEFAULT 'general',
  community_name TEXT,
  lga TEXT,
  approved BOOLEAN DEFAULT false,
  rejected BOOLEAN DEFAULT false,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE community_evidence ADD COLUMN IF NOT EXISTS report_id UUID;
ALTER TABLE community_evidence ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE community_evidence ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE community_evidence ADD COLUMN IF NOT EXISTS media_url TEXT;
ALTER TABLE community_evidence ADD COLUMN IF NOT EXISTS media_type TEXT;
ALTER TABLE community_evidence ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'general';
ALTER TABLE community_evidence ADD COLUMN IF NOT EXISTS community_name TEXT;
ALTER TABLE community_evidence ADD COLUMN IF NOT EXISTS lga TEXT;
ALTER TABLE community_evidence ADD COLUMN IF NOT EXISTS approved BOOLEAN DEFAULT false;
ALTER TABLE community_evidence ADD COLUMN IF NOT EXISTS rejected BOOLEAN DEFAULT false;
ALTER TABLE community_evidence ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;
ALTER TABLE community_evidence ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'community_evidence_report_id_fkey'
  ) THEN
    ALTER TABLE community_evidence
      ADD CONSTRAINT community_evidence_report_id_fkey
      FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE SET NULL;
  END IF;
END $$;

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE audio_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE names ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_evidence ENABLE ROW LEVEL SECURITY;

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

-- Community Impact policies
DROP POLICY IF EXISTS "Public read communities" ON communities;
DROP POLICY IF EXISTS "Admins manage communities" ON communities;
DROP POLICY IF EXISTS "Public read approved reports" ON reports;
DROP POLICY IF EXISTS "Public submit pending reports" ON reports;
DROP POLICY IF EXISTS "Admins manage reports" ON reports;
DROP POLICY IF EXISTS "Public read approved evidence" ON community_evidence;
DROP POLICY IF EXISTS "Public submit pending evidence" ON community_evidence;
DROP POLICY IF EXISTS "Admins manage evidence" ON community_evidence;

CREATE POLICY "Public read communities" ON communities FOR SELECT TO public USING (true);
CREATE POLICY "Admins manage communities" ON communities FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

CREATE POLICY "Public read approved reports" ON reports FOR SELECT TO public
USING (status IN ('approved', 'resolved'));
CREATE POLICY "Public submit pending reports" ON reports FOR INSERT TO public
WITH CHECK (status = 'pending' AND verified = false);
CREATE POLICY "Admins manage reports" ON reports FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

CREATE POLICY "Public read approved evidence" ON community_evidence FOR SELECT TO public
USING (approved = true);
CREATE POLICY "Public submit pending evidence" ON community_evidence FOR INSERT TO public
WITH CHECK (approved = false AND featured = false AND rejected = false);
CREATE POLICY "Admins manage evidence" ON community_evidence FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- Indexes
CREATE INDEX IF NOT EXISTS idx_names_name ON names(name);
CREATE INDEX IF NOT EXISTS idx_communities_lga ON communities(lga);
CREATE UNIQUE INDEX IF NOT EXISTS idx_communities_name_lga ON communities(community_name, lga);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_category ON reports(category);
CREATE INDEX IF NOT EXISTS idx_reports_lga ON reports(lga);
CREATE INDEX IF NOT EXISTS idx_community_evidence_report_id ON community_evidence(report_id);
CREATE INDEX IF NOT EXISTS idx_community_evidence_approved ON community_evidence(approved);
CREATE INDEX IF NOT EXISTS idx_community_evidence_featured ON community_evidence(featured);

INSERT INTO communities (community_name, lga, latitude, longitude) VALUES
  ('Idah', 'Idah', 7.1135, 6.7385),
  ('Anyigba', 'Dekina', 7.4934, 7.1737),
  ('Ankpa', 'Ankpa', 7.4025, 7.6319),
  ('Ejule', 'Ofu', 7.0415, 6.9193),
  ('Abejukolo', 'Omala', 7.8681, 7.5097),
  ('Ibaji', 'Ibaji', 6.8739, 6.6905),
  ('Olamaboro', 'Olamaboro', 7.5401, 7.5631),
  ('Omala', 'Omala', 7.7167, 7.5500),
  ('Igalamela-Odolu', 'Igalamela-Odolu', 7.1711, 6.8264),
  ('Bassa', 'Bassa', 7.9000, 7.0500)
ON CONFLICT (community_name, lga) DO UPDATE SET
  latitude = EXCLUDED.latitude,
  longitude = EXCLUDED.longitude;

-- Clean up any obsolete entries
DELETE FROM communities WHERE community_name = 'Ayingba' AND lga = 'Dekina';

-- Storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('audio', 'audio', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;
INSERT INTO storage.buckets (id, name, public) VALUES ('impact-reports', 'impact-reports', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

-- Storage policies
DROP POLICY IF EXISTS "Public read audio" ON storage.objects;
DROP POLICY IF EXISTS "Admin upload audio" ON storage.objects;
DROP POLICY IF EXISTS "Admin update audio" ON storage.objects;
DROP POLICY IF EXISTS "Admin delete audio" ON storage.objects;
DROP POLICY IF EXISTS "Public read impact reports" ON storage.objects;
DROP POLICY IF EXISTS "Public upload impact reports" ON storage.objects;
DROP POLICY IF EXISTS "Admin delete impact reports" ON storage.objects;

CREATE POLICY "Public read audio" ON storage.objects FOR SELECT TO public USING (bucket_id = 'audio');
CREATE POLICY "Admin upload audio" ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = 'audio');
CREATE POLICY "Admin update audio" ON storage.objects FOR UPDATE TO public USING (bucket_id = 'audio');
CREATE POLICY "Admin delete audio" ON storage.objects FOR DELETE TO public USING (bucket_id = 'audio');

CREATE POLICY "Public read impact reports" ON storage.objects FOR SELECT TO public USING (bucket_id = 'impact-reports');
CREATE POLICY "Public upload impact reports" ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = 'impact-reports');
CREATE POLICY "Admin delete impact reports" ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'impact-reports'
  AND EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- Marketplace
CREATE TABLE IF NOT EXISTS vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  cultural_story TEXT,
  category TEXT,
  vendor_name TEXT,
  vendor_whatsapp TEXT,
  vendor_email TEXT,
  price NUMERIC DEFAULT 0,
  inventory_count INTEGER DEFAULT 0,
  featured BOOLEAN DEFAULT false,
  published BOOLEAN DEFAULT true,
  image_urls TEXT[],
  materials_used TEXT,
  availability TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE products ADD COLUMN IF NOT EXISTS vendor_whatsapp TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS vendor_email TEXT;

ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read products" ON products;
DROP POLICY IF EXISTS "Admins manage products" ON products;
DROP POLICY IF EXISTS "Public read vendors" ON vendors;
DROP POLICY IF EXISTS "Admins manage vendors" ON vendors;

CREATE POLICY "Public read products" ON products FOR SELECT TO public USING (published = true);
CREATE POLICY "Admins manage products" ON products FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

CREATE POLICY "Public read vendors" ON vendors FOR SELECT TO public USING (true);
CREATE POLICY "Admins manage vendors" ON vendors FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_vendor_name ON products(vendor_name);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);

INSERT INTO storage.buckets (id, name, public) VALUES ('marketplace-products', 'marketplace-products', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

DROP POLICY IF EXISTS "Public read marketplace products" ON storage.objects;
DROP POLICY IF EXISTS "Admins upload marketplace products" ON storage.objects;
DROP POLICY IF EXISTS "Admins update marketplace products" ON storage.objects;
DROP POLICY IF EXISTS "Admins delete marketplace products" ON storage.objects;

CREATE POLICY "Public read marketplace products" ON storage.objects FOR SELECT TO public USING (bucket_id = 'marketplace-products');
CREATE POLICY "Admins upload marketplace products" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'marketplace-products'
  AND EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
CREATE POLICY "Admins update marketplace products" ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'marketplace-products'
  AND EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
CREATE POLICY "Admins delete marketplace products" ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'marketplace-products'
  AND EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

