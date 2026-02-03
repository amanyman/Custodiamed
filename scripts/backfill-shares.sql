-- Backfill file_shares for existing files from connected patients
-- Run this in Supabase SQL Editor

INSERT INTO file_shares (file_id, patient_id, provider_id, status, created_at)
SELECT DISTINCT
  mf.id as file_id,
  mf.patient_id,
  ppr.provider_id,
  'active' as status,
  NOW() as created_at
FROM medical_files mf
JOIN patient_provider_relationships ppr
  ON mf.patient_id = ppr.patient_id
  AND ppr.status = 'active'
WHERE NOT EXISTS (
  SELECT 1 FROM file_shares fs
  WHERE fs.file_id = mf.id
  AND fs.provider_id = ppr.provider_id
);
