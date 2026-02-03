-- ============================================
-- CUSTODIAMED DATABASE SETUP
-- Run this entire script in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/jawsrfccpjigfjhgpddb/sql/new
-- ============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_role AS ENUM ('patient', 'provider');
CREATE TYPE invitation_status AS ENUM ('pending', 'accepted', 'expired', 'cancelled');
CREATE TYPE relationship_status AS ENUM ('pending', 'active', 'inactive');
CREATE TYPE share_status AS ENUM ('active', 'revoked', 'expired');

-- Profiles table (extends auth.users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'patient',
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Patients table
CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    date_of_birth DATE,
    phone TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Providers table
CREATE TABLE providers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    practice_name TEXT NOT NULL,
    specialty TEXT NOT NULL,
    npi_number TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id),
    UNIQUE(npi_number)
);

-- Invitations table (provider invites patient)
CREATE TABLE invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
    status invitation_status NOT NULL DEFAULT 'pending',
    message TEXT,
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Patient-Provider relationships
CREATE TABLE patient_provider_relationships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
    status relationship_status NOT NULL DEFAULT 'active',
    connected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(patient_id, provider_id)
);

-- Medical files table
CREATE TABLE medical_files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    original_filename TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    storage_path TEXT NOT NULL,
    mime_type TEXT,
    -- DICOM metadata (nullable for non-DICOM files)
    dicom_metadata JSONB,
    study_date DATE,
    modality TEXT,
    body_part TEXT,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- File shares table
CREATE TABLE file_shares (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    file_id UUID NOT NULL REFERENCES medical_files(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
    status share_status NOT NULL DEFAULT 'active',
    expires_at TIMESTAMPTZ,
    provider_notes TEXT,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(file_id, provider_id)
);

-- Audit logs table (HIPAA requirement)
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id UUID,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for better query performance
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_patients_user_id ON patients(user_id);
CREATE INDEX idx_providers_user_id ON providers(user_id);
CREATE INDEX idx_providers_npi ON providers(npi_number);
CREATE INDEX idx_invitations_provider_id ON invitations(provider_id);
CREATE INDEX idx_invitations_email ON invitations(email);
CREATE INDEX idx_invitations_token ON invitations(token);
CREATE INDEX idx_invitations_status ON invitations(status);
CREATE INDEX idx_relationships_patient ON patient_provider_relationships(patient_id);
CREATE INDEX idx_relationships_provider ON patient_provider_relationships(provider_id);
CREATE INDEX idx_medical_files_patient ON medical_files(patient_id);
CREATE INDEX idx_medical_files_study_date ON medical_files(study_date);
CREATE INDEX idx_file_shares_file ON file_shares(file_id);
CREATE INDEX idx_file_shares_patient ON file_shares(patient_id);
CREATE INDEX idx_file_shares_provider ON file_shares(provider_id);
CREATE INDEX idx_file_shares_status ON file_shares(status);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);

-- Updated at trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER patients_updated_at BEFORE UPDATE ON patients FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER providers_updated_at BEFORE UPDATE ON providers FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER invitations_updated_at BEFORE UPDATE ON invitations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER relationships_updated_at BEFORE UPDATE ON patient_provider_relationships FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER medical_files_updated_at BEFORE UPDATE ON medical_files FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER file_shares_updated_at BEFORE UPDATE ON file_shares FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Create profile
    INSERT INTO profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'patient')
    );

    -- Create patient or provider record based on role
    IF COALESCE(NEW.raw_user_meta_data->>'role', 'patient') = 'patient' THEN
        INSERT INTO patients (user_id) VALUES (NEW.id);
    ELSIF NEW.raw_user_meta_data->>'role' = 'provider' THEN
        INSERT INTO providers (user_id, practice_name, specialty, npi_number)
        VALUES (
            NEW.id,
            COALESCE(NEW.raw_user_meta_data->>'practice_name', ''),
            COALESCE(NEW.raw_user_meta_data->>'specialty', ''),
            COALESCE(NEW.raw_user_meta_data->>'npi_number', '')
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user registration
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable Row Level Security on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_provider_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- PROFILES POLICIES
CREATE POLICY "Users can read own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Providers can view connected patient profiles"
    ON profiles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM patient_provider_relationships ppr
            JOIN patients p ON p.id = ppr.patient_id
            JOIN providers pr ON pr.id = ppr.provider_id
            WHERE pr.user_id = auth.uid()
            AND p.user_id = profiles.id
            AND ppr.status = 'active'
        )
    );

CREATE POLICY "Patients can view connected provider profiles"
    ON profiles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM patient_provider_relationships ppr
            JOIN patients p ON p.id = ppr.patient_id
            JOIN providers pr ON pr.id = ppr.provider_id
            WHERE p.user_id = auth.uid()
            AND pr.user_id = profiles.id
            AND ppr.status = 'active'
        )
    );

-- PATIENTS POLICIES
CREATE POLICY "Patients can read own record"
    ON patients FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Patients can update own record"
    ON patients FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY "Providers can view connected patients"
    ON patients FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM patient_provider_relationships ppr
            JOIN providers pr ON pr.id = ppr.provider_id
            WHERE pr.user_id = auth.uid()
            AND ppr.patient_id = patients.id
            AND ppr.status = 'active'
        )
    );

-- PROVIDERS POLICIES
CREATE POLICY "Providers can read own record"
    ON providers FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Providers can update own record"
    ON providers FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY "Patients can view connected providers"
    ON providers FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM patient_provider_relationships ppr
            JOIN patients p ON p.id = ppr.patient_id
            WHERE p.user_id = auth.uid()
            AND ppr.provider_id = providers.id
            AND ppr.status = 'active'
        )
    );

-- INVITATIONS POLICIES
CREATE POLICY "Providers can create invitations"
    ON invitations FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM providers
            WHERE id = invitations.provider_id
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Providers can read own invitations"
    ON invitations FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM providers
            WHERE id = invitations.provider_id
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Providers can update own invitations"
    ON invitations FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM providers
            WHERE id = invitations.provider_id
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Anyone can read invitation by token"
    ON invitations FOR SELECT
    USING (TRUE);

-- PATIENT_PROVIDER_RELATIONSHIPS POLICIES
CREATE POLICY "Patients can read own relationships"
    ON patient_provider_relationships FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM patients
            WHERE id = patient_provider_relationships.patient_id
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Providers can read own relationships"
    ON patient_provider_relationships FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM providers
            WHERE id = patient_provider_relationships.provider_id
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Patients can create relationships"
    ON patient_provider_relationships FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM patients
            WHERE id = patient_provider_relationships.patient_id
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Patients can update own relationships"
    ON patient_provider_relationships FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM patients
            WHERE id = patient_provider_relationships.patient_id
            AND user_id = auth.uid()
        )
    );

-- MEDICAL_FILES POLICIES
CREATE POLICY "Patients can insert own files"
    ON medical_files FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM patients
            WHERE id = medical_files.patient_id
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Patients can read own files"
    ON medical_files FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM patients
            WHERE id = medical_files.patient_id
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Patients can update own files"
    ON medical_files FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM patients
            WHERE id = medical_files.patient_id
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Patients can delete own files"
    ON medical_files FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM patients
            WHERE id = medical_files.patient_id
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Providers can read shared files"
    ON medical_files FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM file_shares fs
            JOIN providers pr ON pr.id = fs.provider_id
            WHERE fs.file_id = medical_files.id
            AND pr.user_id = auth.uid()
            AND fs.status = 'active'
        )
    );

-- FILE_SHARES POLICIES
CREATE POLICY "Patients can create shares"
    ON file_shares FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM patients
            WHERE id = file_shares.patient_id
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Patients can read own shares"
    ON file_shares FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM patients
            WHERE id = file_shares.patient_id
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Patients can update own shares"
    ON file_shares FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM patients
            WHERE id = file_shares.patient_id
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Providers can read shares to them"
    ON file_shares FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM providers
            WHERE id = file_shares.provider_id
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Providers can update shares to them"
    ON file_shares FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM providers
            WHERE id = file_shares.provider_id
            AND user_id = auth.uid()
        )
    );

-- AUDIT_LOGS POLICIES
CREATE POLICY "Users can insert audit logs"
    ON audit_logs FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can read own audit logs"
    ON audit_logs FOR SELECT
    USING (user_id = auth.uid());

-- ============================================
-- STORAGE SETUP
-- ============================================

-- Create storage bucket for medical files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'medical-files',
  'medical-files',
  false,
  104857600, -- 100MB limit
  ARRAY['application/dicom', 'image/jpeg', 'image/png', 'image/gif', 'application/octet-stream']
) ON CONFLICT (id) DO NOTHING;

-- Storage policies for medical-files bucket

-- Patients can upload files to their own folder
CREATE POLICY "Patients can upload own files storage"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'medical-files'
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] IN (
    SELECT p.id::text FROM patients p WHERE p.user_id = auth.uid()
  )
);

-- Patients can read their own files
CREATE POLICY "Patients can read own files storage"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'medical-files'
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] IN (
    SELECT p.id::text FROM patients p WHERE p.user_id = auth.uid()
  )
);

-- Patients can delete their own files
CREATE POLICY "Patients can delete own files storage"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'medical-files'
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] IN (
    SELECT p.id::text FROM patients p WHERE p.user_id = auth.uid()
  )
);

-- Providers can read files shared with them
CREATE POLICY "Providers can read shared files storage"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'medical-files'
  AND auth.uid() IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM file_shares fs
    JOIN medical_files mf ON mf.id = fs.file_id
    JOIN providers pr ON pr.id = fs.provider_id
    WHERE mf.storage_path = name
    AND pr.user_id = auth.uid()
    AND fs.status = 'active'
  )
);
