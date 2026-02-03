-- Enable Row Level Security on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_provider_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PROFILES POLICIES
-- ============================================

-- Users can read their own profile
CREATE POLICY "Users can read own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

-- Providers can view patient profiles they're connected to
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

-- Patients can view provider profiles they're connected to
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

-- ============================================
-- PATIENTS POLICIES
-- ============================================

-- Patients can read their own record
CREATE POLICY "Patients can read own record"
    ON patients FOR SELECT
    USING (user_id = auth.uid());

-- Patients can update their own record
CREATE POLICY "Patients can update own record"
    ON patients FOR UPDATE
    USING (user_id = auth.uid());

-- Providers can view connected patients
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

-- ============================================
-- PROVIDERS POLICIES
-- ============================================

-- Providers can read their own record
CREATE POLICY "Providers can read own record"
    ON providers FOR SELECT
    USING (user_id = auth.uid());

-- Providers can update their own record
CREATE POLICY "Providers can update own record"
    ON providers FOR UPDATE
    USING (user_id = auth.uid());

-- Patients can view connected providers
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

-- ============================================
-- INVITATIONS POLICIES
-- ============================================

-- Providers can create invitations
CREATE POLICY "Providers can create invitations"
    ON invitations FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM providers
            WHERE id = invitations.provider_id
            AND user_id = auth.uid()
        )
    );

-- Providers can read their own invitations
CREATE POLICY "Providers can read own invitations"
    ON invitations FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM providers
            WHERE id = invitations.provider_id
            AND user_id = auth.uid()
        )
    );

-- Providers can update their own invitations
CREATE POLICY "Providers can update own invitations"
    ON invitations FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM providers
            WHERE id = invitations.provider_id
            AND user_id = auth.uid()
        )
    );

-- Anyone can read invitation by token (for accepting)
CREATE POLICY "Anyone can read invitation by token"
    ON invitations FOR SELECT
    USING (TRUE);

-- ============================================
-- PATIENT_PROVIDER_RELATIONSHIPS POLICIES
-- ============================================

-- Patients can read their relationships
CREATE POLICY "Patients can read own relationships"
    ON patient_provider_relationships FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM patients
            WHERE id = patient_provider_relationships.patient_id
            AND user_id = auth.uid()
        )
    );

-- Providers can read their relationships
CREATE POLICY "Providers can read own relationships"
    ON patient_provider_relationships FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM providers
            WHERE id = patient_provider_relationships.provider_id
            AND user_id = auth.uid()
        )
    );

-- Patients can create relationships (when accepting invitation)
CREATE POLICY "Patients can create relationships"
    ON patient_provider_relationships FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM patients
            WHERE id = patient_provider_relationships.patient_id
            AND user_id = auth.uid()
        )
    );

-- Patients can update their relationships (e.g., disconnect)
CREATE POLICY "Patients can update own relationships"
    ON patient_provider_relationships FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM patients
            WHERE id = patient_provider_relationships.patient_id
            AND user_id = auth.uid()
        )
    );

-- ============================================
-- MEDICAL_FILES POLICIES
-- ============================================

-- Patients can CRUD their own files
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

-- Providers can read files shared with them
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

-- ============================================
-- FILE_SHARES POLICIES
-- ============================================

-- Patients can create shares for their own files
CREATE POLICY "Patients can create shares"
    ON file_shares FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM patients
            WHERE id = file_shares.patient_id
            AND user_id = auth.uid()
        )
    );

-- Patients can read their own shares
CREATE POLICY "Patients can read own shares"
    ON file_shares FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM patients
            WHERE id = file_shares.patient_id
            AND user_id = auth.uid()
        )
    );

-- Patients can update their own shares (revoke)
CREATE POLICY "Patients can update own shares"
    ON file_shares FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM patients
            WHERE id = file_shares.patient_id
            AND user_id = auth.uid()
        )
    );

-- Providers can read shares directed to them
CREATE POLICY "Providers can read shares to them"
    ON file_shares FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM providers
            WHERE id = file_shares.provider_id
            AND user_id = auth.uid()
        )
    );

-- Providers can update shares (add notes, mark reviewed)
CREATE POLICY "Providers can update shares to them"
    ON file_shares FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM providers
            WHERE id = file_shares.provider_id
            AND user_id = auth.uid()
        )
    );

-- ============================================
-- AUDIT_LOGS POLICIES
-- ============================================

-- Insert-only for authenticated users
CREATE POLICY "Users can insert audit logs"
    ON audit_logs FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- Users can read their own audit logs
CREATE POLICY "Users can read own audit logs"
    ON audit_logs FOR SELECT
    USING (user_id = auth.uid());

-- ============================================
-- STORAGE POLICIES (for medical-files bucket)
-- ============================================

-- Note: These should be applied in Supabase dashboard or via SQL for storage schema
-- Patients can upload to their own folder
-- Patients can read their own files
-- Providers can read files that have been shared with them
