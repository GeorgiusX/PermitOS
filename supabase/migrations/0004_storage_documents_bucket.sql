-- Storage: private documents bucket (50 MB limit, PDFs + images)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents',
  'documents',
  false,
  52428800,
  ARRAY['application/pdf', 'image/png', 'image/jpeg', 'image/webp', 'image/tiff']
);

-- RLS policies on storage.objects
CREATE POLICY "auth_insert_documents"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'documents');

CREATE POLICY "auth_select_documents"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'documents');

CREATE POLICY "auth_delete_documents"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'documents');
