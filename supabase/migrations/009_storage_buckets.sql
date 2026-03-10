-- Create event-images storage bucket
insert into storage.buckets (id, name, public)
values ('event-images', 'event-images', true)
on conflict (id) do nothing;

-- Drop existing policies if they exist to avoid conflicts
drop policy if exists "Allow authenticated users to upload event images" on storage.objects;
drop policy if exists "Allow public read access to event images" on storage.objects;
drop policy if exists "Allow users to update their own event images" on storage.objects;
drop policy if exists "Allow users to delete their own event images" on storage.objects;

-- Set bucket policies - permissive for admin operations
create policy "Allow admins to upload event images"
on storage.objects for insert
with check (
  bucket_id = 'event-images'
  and (
    auth.role() = 'authenticated'
    or auth.role() = 'service_role'
  )
);

create policy "Allow public read access to event images"
on storage.objects for select
using (bucket_id = 'event-images');

create policy "Allow admins to update event images"
on storage.objects for update
with check (
  bucket_id = 'event-images'
  and (
    auth.role() = 'authenticated'
    or auth.role() = 'service_role'
  )
);

create policy "Allow admins to delete event images"
on storage.objects for delete
using (
  bucket_id = 'event-images'
  and (
    auth.role() = 'authenticated'
    or auth.role() = 'service_role'
  )
);
