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
CREATE POLICY "Patients can upload own files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'medical-files'
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] IN (
    SELECT p.id::text FROM patients p WHERE p.user_id = auth.uid()
  )
);

-- Patients can read their own files
CREATE POLICY "Patients can read own files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'medical-files'
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] IN (
    SELECT p.id::text FROM patients p WHERE p.user_id = auth.uid()
  )
);

-- Patients can delete their own files
CREATE POLICY "Patients can delete own files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'medical-files'
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] IN (
    SELECT p.id::text FROM patients p WHERE p.user_id = auth.uid()
  )
);

-- Providers can read files shared with them
CREATE POLICY "Providers can read shared files"
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
