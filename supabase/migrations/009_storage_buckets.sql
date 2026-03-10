-- Create event-images storage bucket
insert into storage.buckets (id, name, public)
values ('event-images', 'event-images', true)
on conflict (id) do nothing;

-- Drop existing policies if they exist to avoid conflicts
drop policy if exists "Allow authenticated users to upload event images" on storage.objects;
drop policy if exists "Allow public read access to event images" on storage.objects;
drop policy if exists "Allow users to update their own event images" on storage.objects;
drop policy if exists "Allow users to delete their own event images" on storage.objects;

-- Set bucket policies - restrict write operations to admins only
create policy "Allow admins to upload event images"
on storage.objects for insert
with check (
  bucket_id = 'event-images'
  and (
    auth.role() = 'service_role'
    or auth.uid() in (
      select user_id from admin_users
      where role in ('admin', 'super_admin')
    )
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
    auth.role() = 'service_role'
    or auth.uid() in (
      select user_id from admin_users
      where role in ('admin', 'super_admin')
    )
  )
);

create policy "Allow admins to delete event images"
on storage.objects for delete
using (
  bucket_id = 'event-images'
  and (
    auth.role() = 'service_role'
    or auth.uid() in (
      select user_id from admin_users
      where role in ('admin', 'super_admin')
    )
  )
);
