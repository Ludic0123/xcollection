-- v5: 管理者ロール + マスター管理テーブル

-- ============================================
-- 1) members.is_admin
-- ============================================
alter table public.members add column if not exists is_admin boolean not null default false;
-- 最初の会員 (member_number = 1) を自動で管理者に
update public.members set is_admin = true where member_number = 1;

-- ============================================
-- 2) マスター: genres (カテゴリ別ジャンル)
-- ============================================
create table if not exists public.master_genres (
  id uuid primary key default gen_random_uuid(),
  category text not null,                          -- restaurant / hotel / cafe / bar / other
  name text not null,
  display_order int not null default 0,
  created_at timestamptz not null default now(),
  unique (category, name)
);
create index if not exists master_genres_cat_idx on public.master_genres(category, display_order);

-- ============================================
-- 3) マスター: cities
-- ============================================
create table if not exists public.master_cities (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  display_order int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists master_cities_order_idx on public.master_cities(display_order);

-- ============================================
-- 4) マスター: sake_types
-- ============================================
create table if not exists public.master_sake_types (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  display_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ============================================
-- 5) マスター: reservation_methods
-- ============================================
create table if not exists public.master_reservation_methods (
  id uuid primary key default gen_random_uuid(),
  value text not null unique,                      -- 機械可読の識別子 (phone, online, ...)
  label text not null,                             -- 表示名
  display_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ============================================
-- 6) マスター: price_ranges (level 1-5 固定だが label を編集可能に)
-- ============================================
create table if not exists public.master_price_ranges (
  level smallint primary key check (level between 1 and 5),
  label text not null,
  display_order int not null default 0
);

-- ============================================
-- 共通 RLS: 全員 SELECT、管理者のみ WRITE
-- ============================================
do $$
declare t text;
begin
  for t in select unnest(array[
    'master_genres','master_cities','master_sake_types','master_reservation_methods','master_price_ranges'
  ]) loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists %I_select_public on public.%I', t, t);
    execute format('create policy %I_select_public on public.%I for select using (true)', t, t);
    execute format('drop policy if exists %I_write_admin on public.%I', t, t);
    execute format($p$create policy %I_write_admin on public.%I for all
      using (exists (select 1 from public.members m where m.id = auth.uid() and m.is_admin = true))
      with check (exists (select 1 from public.members m where m.id = auth.uid() and m.is_admin = true))$p$, t, t);
  end loop;
end $$;

-- ============================================
-- 7) 初期データ seed
-- ============================================
insert into public.master_genres (category, name, display_order) values
  ('restaurant', '寿司', 10),
  ('restaurant', '和食', 20),
  ('restaurant', '焼肉', 30),
  ('restaurant', '鉄板焼き', 40),
  ('restaurant', '天ぷら', 50),
  ('restaurant', 'うなぎ', 60),
  ('restaurant', '蕎麦・うどん', 70),
  ('restaurant', 'ラーメン', 80),
  ('restaurant', '中華', 90),
  ('restaurant', 'イタリアン', 100),
  ('restaurant', 'フレンチ', 110),
  ('restaurant', 'ビストロ', 120),
  ('restaurant', '創作料理', 130),
  ('restaurant', '居酒屋', 140),
  ('restaurant', 'その他', 9999),
  ('hotel', 'ラグジュアリーホテル', 10),
  ('hotel', 'デザインホテル', 20),
  ('hotel', 'シティホテル', 30),
  ('hotel', 'ビジネスホテル', 40),
  ('hotel', 'リゾートホテル', 50),
  ('hotel', '旅館', 60),
  ('hotel', 'オーベルジュ', 70),
  ('hotel', 'その他', 9999),
  ('cafe', 'コーヒー専門店', 10),
  ('cafe', 'ベーカリー', 20),
  ('cafe', '喫茶店', 30),
  ('cafe', 'スイーツ', 40),
  ('cafe', 'アフタヌーンティー', 50),
  ('cafe', 'その他', 9999),
  ('bar', 'ワインバー', 10),
  ('bar', 'カクテルバー', 20),
  ('bar', 'ウイスキーバー', 30),
  ('bar', 'クラフトビール', 40),
  ('bar', 'スピークイージー', 50),
  ('bar', 'その他', 9999),
  ('other', 'その他', 9999)
on conflict (category, name) do nothing;

insert into public.master_sake_types (name, display_order) values
  ('純米酒', 10),
  ('特別純米', 20),
  ('純米吟醸', 30),
  ('純米大吟醸', 40),
  ('吟醸', 50),
  ('大吟醸', 60),
  ('本醸造', 70),
  ('特別本醸造', 80),
  ('生酒', 90),
  ('にごり酒', 100),
  ('古酒', 110),
  ('スパークリング', 120),
  ('その他', 9999)
on conflict (name) do nothing;

insert into public.master_reservation_methods (value, label, display_order) values
  ('phone', '電話', 10),
  ('online', 'ネット予約', 20),
  ('ikyu', '一休.com', 30),
  ('omakase', 'OMAKASE', 40),
  ('tablecheck', 'TableCheck', 50),
  ('pocket_concierge', 'Pocket Concierge', 60),
  ('tabelog', '食べログ', 70),
  ('invitation_only', '完全紹介制', 80),
  ('walk_in', '予約不要', 90)
on conflict (value) do nothing;

insert into public.master_price_ranges (level, label, display_order) values
  (1, '¥（〜1,000円）', 1),
  (2, '¥¥（〜3,000円）', 2),
  (3, '¥¥¥（〜6,000円）', 3),
  (4, '¥¥¥¥（〜15,000円）', 4),
  (5, '¥¥¥¥¥（15,000円〜）', 5)
on conflict (level) do update set label = excluded.label;
