-- Allow authenticated users to upload to homepage-images bucket
CREATE POLICY "Allow authenticated uploads to homepage-images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'homepage-images' AND
  auth.role() = 'authenticated'
);

-- Allow public users to read from homepage-images bucket
CREATE POLICY "Allow public reads from homepage-images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'homepage-images');

-- Allow authenticated users to delete their own uploads
CREATE POLICY "Allow users to delete their own uploads from homepage-images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'homepage-images' AND
  auth.uid() = owner
);
