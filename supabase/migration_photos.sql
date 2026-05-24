-- 写真機能の追加: cover_image_url カラム + Storage バケット + ポリシー

-- ========== cover_image_url カラム追加 ==========
alter table spots add column if not exists cover_image_url text;
alter table trip_plans add column if not exists cover_image_url text;

-- ========== Storage バケット ==========
insert into storage.buckets (id, name, public)
  values ('photos', 'photos', true)
  on conflict (id) do nothing;

-- ========== Storage ポリシー ==========
-- 既存ポリシーが残っていれば削除
drop policy if exists "photos_public_read" on storage.objects;
drop policy if exists "photos_authenticated_insert" on storage.objects;
drop policy if exists "photos_authenticated_update" on storage.objects;
drop policy if exists "photos_authenticated_delete" on storage.objects;

-- 閲覧: 誰でもOK
create policy "photos_public_read" on storage.objects
  for select using (bucket_id = 'photos');

-- アップロード: 認証ユーザーのみ
create policy "photos_authenticated_insert" on storage.objects
  for insert with check (bucket_id = 'photos' and auth.role() = 'authenticated');

-- 更新: 認証ユーザーのみ
create policy "photos_authenticated_update" on storage.objects
  for update using (bucket_id = 'photos' and auth.role() = 'authenticated');

-- 削除: 認証ユーザーのみ
create policy "photos_authenticated_delete" on storage.objects
  for delete using (bucket_id = 'photos' and auth.role() = 'authenticated');
