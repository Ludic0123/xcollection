-- v9: chefs (大将/シェフ) を独立テーブルとして追加

create table if not exists public.chefs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,                       -- 氏名（漢字）
  name_kana text,                           -- フリガナ
  specialty text,                           -- 専門（寿司／フレンチ／懐石 など）
  birth_year int,                           -- 生年（任意）
  hometown text,                            -- 出身地
  bio text,                                 -- 略歴・経歴 (自由テキスト)
  training_history text,                    -- 修行元・修行歴 (自由テキスト)
  awards text,                              -- 受賞歴・メディア掲載 など
  cover_image_url text,
  photo_urls jsonb not null default '[]',
  is_featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists chefs_user_id_idx on public.chefs(user_id);
create index if not exists chefs_specialty_idx on public.chefs(specialty);

alter table public.chefs enable row level security;
drop policy if exists chefs_select_public on public.chefs;
create policy chefs_select_public on public.chefs for select using (true);
drop policy if exists chefs_insert_own on public.chefs;
create policy chefs_insert_own on public.chefs for insert with check (user_id = auth.uid());
drop policy if exists chefs_update_own on public.chefs;
create policy chefs_update_own on public.chefs for update using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists chefs_delete_own on public.chefs;
create policy chefs_delete_own on public.chefs for delete using (user_id = auth.uid());

drop trigger if exists chefs_set_updated_at on public.chefs;
create trigger chefs_set_updated_at before update on public.chefs
  for each row execute function set_updated_at();

-- spots.chef_id  (店ごとに大将を1人紐付け)
alter table public.spots add column if not exists chef_id uuid references public.chefs(id) on delete set null;
create index if not exists spots_chef_id_idx on public.spots(chef_id) where chef_id is not null;
