-- Drop tags column from events table (tags feature not currently used)
alter table events drop column if exists tags;
