-- Create a storage bucket for user uploads
insert into storage.buckets (id, name, public)
values ('uploads', 'uploads', true)
on conflict (id) do nothing;

-- Set up RLS policies for the uploads bucket
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'uploads' );

create policy "Authenticated Uploads"
  on storage.objects for insert
  with check ( bucket_id = 'uploads' and auth.role() = 'authenticated' );

-- Allow public uploads if needed (or restrict to auth)
-- For this app, maybe public uploads if users are anon?
-- Based on logs, user has userId.
create policy "Public Uploads"
  on storage.objects for insert
  with check ( bucket_id = 'uploads' );
