-- Drop unused columns from members
alter table members drop column if exists email;
alter table members drop column if exists sort_order;

-- Drop unused columns from partners
alter table partners drop column if exists website_url;
alter table partners drop column if exists sort_order;

-- Drop unused columns from announcements
alter table announcements drop column if exists link_url;
alter table announcements drop column if exists link_text;
alter table announcements drop column if exists bg_color;
alter table announcements drop column if exists text_color;
