-- Remove email and sort_order from members
alter table members drop column if exists email;
alter table members drop column if exists sort_order;

-- Remove website_url and sort_order from partners
alter table partners drop column if exists website_url;
alter table partners drop column if exists sort_order;

-- Remove link_url, link_text, bg_color, text_color from announcements
alter table announcements drop column if exists link_url;
alter table announcements drop column if exists link_text;
alter table announcements drop column if exists bg_color;
alter table announcements drop column if exists text_color;

-- Create member-images storage bucket
insert into storage.buckets (id, name, public)
values ('member-images', 'member-images', true)
on conflict (id) do nothing;

-- Create partner-images storage bucket
insert into storage.buckets (id, name, public)
values ('partner-images', 'partner-images', true)
on conflict (id) do nothing;

-- Storage policies for member-images
create policy "Allow admins to upload member images"
on storage.objects for insert
with check (
  bucket_id = 'member-images'
  and (
    auth.role() = 'service_role'
    or auth.uid() in (
      select id from admin_users
      where role in ('admin', 'super_admin')
      and is_active = true
    )
  )
);

create policy "Allow public read access to member images"
on storage.objects for select
using (bucket_id = 'member-images');

create policy "Allow admins to update member images"
on storage.objects for update
with check (
  bucket_id = 'member-images'
  and (
    auth.role() = 'service_role'
    or auth.uid() in (
      select id from admin_users
      where role in ('admin', 'super_admin')
      and is_active = true
    )
  )
);

create policy "Allow admins to delete member images"
on storage.objects for delete
using (
  bucket_id = 'member-images'
  and (
    auth.role() = 'service_role'
    or auth.uid() in (
      select id from admin_users
      where role in ('admin', 'super_admin')
      and is_active = true
    )
  )
);

-- Storage policies for partner-images
create policy "Allow admins to upload partner images"
on storage.objects for insert
with check (
  bucket_id = 'partner-images'
  and (
    auth.role() = 'service_role'
    or auth.uid() in (
      select id from admin_users
      where role in ('admin', 'super_admin')
      and is_active = true
    )
  )
);

create policy "Allow public read access to partner images"
on storage.objects for select
using (bucket_id = 'partner-images');

create policy "Allow admins to update partner images"
on storage.objects for update
with check (
  bucket_id = 'partner-images'
  and (
    auth.role() = 'service_role'
    or auth.uid() in (
      select id from admin_users
      where role in ('admin', 'super_admin')
      and is_active = true
    )
  )
);

create policy "Allow admins to delete partner images"
on storage.objects for delete
using (
  bucket_id = 'partner-images'
  and (
    auth.role() = 'service_role'
    or auth.uid() in (
      select id from admin_users
      where role in ('admin', 'super_admin')
      and is_active = true
    )
  )
);
