-- ============================================
-- Add imaging_studies table
-- ============================================
CREATE TABLE imaging_studies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    study_date DATE NOT NULL,
    modality TEXT NOT NULL,
    study_type TEXT,
    description TEXT,
    facility_name TEXT,
    facility_phone TEXT,
    facility_email TEXT,
    file_count INTEGER NOT NULL DEFAULT 0,
    total_size BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add study_id column to medical_files
ALTER TABLE medical_files ADD COLUMN study_id UUID REFERENCES imaging_studies(id) ON DELETE CASCADE;

-- ============================================
-- Add provider_invitations table
-- (separate from "invitations" - these are patient-initiated share links)
-- ============================================
CREATE TABLE provider_invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    study_id UUID NOT NULL REFERENCES imaging_studies(id) ON DELETE CASCADE,
    provider_email TEXT NOT NULL DEFAULT '',
    provider_name TEXT,
    message TEXT,
    token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
    status invitation_status NOT NULL DEFAULT 'pending',
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX idx_imaging_studies_patient ON imaging_studies(patient_id);
CREATE INDEX idx_imaging_studies_study_date ON imaging_studies(study_date);
CREATE INDEX idx_imaging_studies_modality ON imaging_studies(modality);
CREATE INDEX idx_medical_files_study ON medical_files(study_id);
CREATE INDEX idx_provider_invitations_patient ON provider_invitations(patient_id);
CREATE INDEX idx_provider_invitations_study ON provider_invitations(study_id);
CREATE INDEX idx_provider_invitations_token ON provider_invitations(token);
CREATE INDEX idx_provider_invitations_status ON provider_invitations(status);

-- ============================================
-- Updated at triggers
-- ============================================
CREATE TRIGGER imaging_studies_updated_at
    BEFORE UPDATE ON imaging_studies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER provider_invitations_updated_at
    BEFORE UPDATE ON provider_invitations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- Row Level Security
-- ============================================
ALTER TABLE imaging_studies ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_invitations ENABLE ROW LEVEL SECURITY;

-- IMAGING_STUDIES POLICIES

-- Patients can insert their own studies
CREATE POLICY "Patients can insert own studies"
    ON imaging_studies FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM patients
            WHERE id = imaging_studies.patient_id
            AND user_id = auth.uid()
        )
    );

-- Patients can read their own studies
CREATE POLICY "Patients can read own studies"
    ON imaging_studies FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM patients
            WHERE id = imaging_studies.patient_id
            AND user_id = auth.uid()
        )
    );

-- Patients can update their own studies
CREATE POLICY "Patients can update own studies"
    ON imaging_studies FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM patients
            WHERE id = imaging_studies.patient_id
            AND user_id = auth.uid()
        )
    );

-- Patients can delete their own studies
CREATE POLICY "Patients can delete own studies"
    ON imaging_studies FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM patients
            WHERE id = imaging_studies.patient_id
            AND user_id = auth.uid()
        )
    );

-- Providers can read studies shared with them
CREATE POLICY "Providers can read shared studies"
    ON imaging_studies FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM file_shares fs
            JOIN medical_files mf ON mf.id = fs.file_id
            JOIN providers pr ON pr.id = fs.provider_id
            WHERE mf.study_id = imaging_studies.id
            AND pr.user_id = auth.uid()
            AND fs.status = 'active'
        )
    );

-- PROVIDER_INVITATIONS POLICIES

-- Patients can create invitations for their studies
CREATE POLICY "Patients can create provider invitations"
    ON provider_invitations FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM patients
            WHERE id = provider_invitations.patient_id
            AND user_id = auth.uid()
        )
    );

-- Patients can read their own invitations
CREATE POLICY "Patients can read own provider invitations"
    ON provider_invitations FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM patients
            WHERE id = provider_invitations.patient_id
            AND user_id = auth.uid()
        )
    );

-- Patients can delete their own invitations
CREATE POLICY "Patients can delete own provider invitations"
    ON provider_invitations FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM patients
            WHERE id = provider_invitations.patient_id
            AND user_id = auth.uid()
        )
    );

-- Anyone can read invitation by token (for accepting)
CREATE POLICY "Anyone can read provider invitation by token"
    ON provider_invitations FOR SELECT
    USING (TRUE);

-- Authenticated users can update invitation status (for accepting)
CREATE POLICY "Authenticated users can update provider invitations"
    ON provider_invitations FOR UPDATE
    USING (auth.uid() IS NOT NULL);
