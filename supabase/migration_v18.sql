-- v18: 昼夜の価格帯 + トップ画像(店構え/料理) + 食材マスタ

-- ============================================================
-- 1) spots に列追加
-- ============================================================
alter table public.spots
  add column if not exists price_range_lunch int,
  add column if not exists price_range_dinner int,
  add column if not exists cover_image_exterior text,  -- 店構え
  add column if not exists cover_image_food text;       -- 料理

-- 既存の単一価格帯を「夜」として移行
update public.spots
set price_range_dinner = price_range
where price_range is not null and price_range_dinner is null;

-- ============================================================
-- 2) 食材マスタ（ジャンル別）
-- ============================================================
create table if not exists public.master_ingredients (
  id uuid primary key default gen_random_uuid(),
  genre text not null,        -- 例: 寿司 / 焼肉（spotsのジャンル名に対応）
  name text not null,         -- 例: 赤身
  display_order int not null default 100,
  created_at timestamptz not null default now(),
  unique (genre, name)
);

alter table public.master_ingredients enable row level security;

drop policy if exists "mi_select" on public.master_ingredients;
drop policy if exists "mi_write" on public.master_ingredients;
create policy "mi_select" on public.master_ingredients
  for select using (true);
create policy "mi_write" on public.master_ingredients
  for all using (
    exists (select 1 from public.members where id = auth.uid() and is_admin = true)
  ) with check (
    exists (select 1 from public.members where id = auth.uid() and is_admin = true)
  );

grant select on public.master_ingredients to anon, authenticated;

-- ============================================================
-- 3) 種データ（寿司の例）
-- ============================================================
insert into public.master_ingredients (genre, name, display_order) values
  ('寿司', '赤身', 10),
  ('寿司', '中トロ', 20),
  ('寿司', '大トロ', 30),
  ('寿司', 'コハダ', 40),
  ('寿司', 'ウニ', 50),
  ('寿司', 'イクラ', 60),
  ('寿司', '車海老', 70),
  ('寿司', 'アワビ', 80),
  ('寿司', '穴子', 90),
  ('寿司', '玉子', 100)
on conflict (genre, name) do nothing;

-- ============================================================
-- 4) PostgREST スキーマキャッシュ再読込
-- ============================================================
notify pgrst, 'reload schema';
