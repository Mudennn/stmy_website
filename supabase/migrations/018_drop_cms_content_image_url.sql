-- Drop image_url column from cms_content table
-- Only button URLs in metadata are needed for sections like hero

ALTER TABLE cms_content
DROP COLUMN IF EXISTS image_url;
