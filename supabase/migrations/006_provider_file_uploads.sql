-- Migration: Provider File Uploads
-- Allow providers to upload their own medical imaging files

-- Add provider_id to imaging_studies
ALTER TABLE imaging_studies ADD COLUMN provider_id UUID REFERENCES providers(id) ON DELETE CASCADE;

-- Make patient_id nullable (providers upload without a patient)
ALTER TABLE imaging_studies ALTER COLUMN patient_id DROP NOT NULL;

-- Ensure at least one owner is set
ALTER TABLE imaging_studies ADD CONSTRAINT chk_imaging_studies_owner
  CHECK (patient_id IS NOT NULL OR provider_id IS NOT NULL);

-- Add provider_id to medical_files
ALTER TABLE medical_files ADD COLUMN provider_id UUID REFERENCES providers(id) ON DELETE CASCADE;

-- Make patient_id nullable
ALTER TABLE medical_files ALTER COLUMN patient_id DROP NOT NULL;

-- Ensure at least one owner is set
ALTER TABLE medical_files ADD CONSTRAINT chk_medical_files_owner
  CHECK (patient_id IS NOT NULL OR provider_id IS NOT NULL);

-- Create indexes for provider queries
CREATE INDEX idx_imaging_studies_provider_id ON imaging_studies(provider_id);
CREATE INDEX idx_medical_files_provider_id ON medical_files(provider_id);

-- RLS policies for providers on imaging_studies

CREATE POLICY "Providers can insert own imaging studies"
  ON imaging_studies FOR INSERT
  TO authenticated
  WITH CHECK (
    provider_id IS NOT NULL
    AND provider_id IN (
      SELECT id FROM providers WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Providers can view own imaging studies"
  ON imaging_studies FOR SELECT
  TO authenticated
  USING (
    provider_id IS NOT NULL
    AND provider_id IN (
      SELECT id FROM providers WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Providers can update own imaging studies"
  ON imaging_studies FOR UPDATE
  TO authenticated
  USING (
    provider_id IS NOT NULL
    AND provider_id IN (
      SELECT id FROM providers WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Providers can delete own imaging studies"
  ON imaging_studies FOR DELETE
  TO authenticated
  USING (
    provider_id IS NOT NULL
    AND provider_id IN (
      SELECT id FROM providers WHERE user_id = auth.uid()
    )
  );

-- RLS policies for providers on medical_files

CREATE POLICY "Providers can insert own medical files"
  ON medical_files FOR INSERT
  TO authenticated
  WITH CHECK (
    provider_id IS NOT NULL
    AND provider_id IN (
      SELECT id FROM providers WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Providers can view own medical files"
  ON medical_files FOR SELECT
  TO authenticated
  USING (
    provider_id IS NOT NULL
    AND provider_id IN (
      SELECT id FROM providers WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Providers can update own medical files"
  ON medical_files FOR UPDATE
  TO authenticated
  USING (
    provider_id IS NOT NULL
    AND provider_id IN (
      SELECT id FROM providers WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Providers can delete own medical files"
  ON medical_files FOR DELETE
  TO authenticated
  USING (
    provider_id IS NOT NULL
    AND provider_id IN (
      SELECT id FROM providers WHERE user_id = auth.uid()
    )
  );

-- Storage policies for provider uploads (provider/{providerId}/... path)

CREATE POLICY "Providers can upload own files to storage"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'medical-files'
    AND (storage.foldername(name))[1] = 'provider'
    AND (storage.foldername(name))[2] IN (
      SELECT id::text FROM providers WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Providers can view own files in storage"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'medical-files'
    AND (storage.foldername(name))[1] = 'provider'
    AND (storage.foldername(name))[2] IN (
      SELECT id::text FROM providers WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Providers can delete own files in storage"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'medical-files'
    AND (storage.foldername(name))[1] = 'provider'
    AND (storage.foldername(name))[2] IN (
      SELECT id::text FROM providers WHERE user_id = auth.uid()
    )
  );
