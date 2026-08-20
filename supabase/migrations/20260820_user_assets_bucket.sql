-- Public bucket for user assets (business logos, etc).
insert into storage.buckets (id, name, public)
values ('user-assets', 'user-assets', true)
on conflict (id) do nothing;

-- Public read for everything under logos/.
create policy "public_read_logos" on storage.objects
  for select using (
    bucket_id = 'user-assets'
    and (storage.foldername(name))[1] = 'logos'
  );

-- Writes only allowed in the user's own folder: logos/{user_id}/...
create policy "upload_own_logos" on storage.objects
  for insert with check (
    bucket_id = 'user-assets'
    and (storage.foldername(name))[1] = 'logos'
    and (storage.foldername(name))[2] = auth.uid()::text
  );

create policy "update_own_logos" on storage.objects
  for update using (
    bucket_id = 'user-assets'
    and (storage.foldername(name))[1] = 'logos'
    and (storage.foldername(name))[2] = auth.uid()::text
  );

create policy "delete_own_logos" on storage.objects
  for delete using (
    bucket_id = 'user-assets'
    and (storage.foldername(name))[1] = 'logos'
    and (storage.foldername(name))[2] = auth.uid()::text
  );