-- v15: 会員登録の選択肢マスタ化 + members.email カラム追加

-- ============================================================
-- 1) members.email カラム追加 + 既存ユーザーの backfill
-- ============================================================
alter table public.members
  add column if not exists email text;

-- 既存ユーザーの email を auth.users から backfill
update public.members m
set email = u.email
from auth.users u
where m.id = u.id and m.email is null;

-- handle_new_member を再定義（v7 + email）
create or replace function public.handle_new_member()
returns trigger
language plpgsql security definer set search_path = public
as $$
declare
  new_code text;
  inviter_id uuid;
  provided_code text;
  provided_number bigint;
  attempt int := 0;
  m jsonb;
begin
  m := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  provided_code := nullif(trim(m->>'invited_by_code'), '');
  begin provided_number := (m->>'invited_by_number')::bigint;
  exception when others then provided_number := null; end;

  if provided_code is null or provided_number is null then
    if exists (select 1 from public.members) then raise exception 'Invitation required'; end if;
  else
    select id into inviter_id from public.members where member_number = provided_number and member_code = provided_code;
    if inviter_id is null then raise exception 'Invalid invitation'; end if;
  end if;

  loop
    new_code := upper(substring(md5(random()::text || clock_timestamp()::text || new.id::text) from 1 for 8));
    exit when not exists (select 1 from public.members where member_code = new_code);
    attempt := attempt + 1;
    if attempt > 20 then raise exception 'Could not generate unique code'; end if;
  end loop;

  insert into public.members (
    id, member_code, invited_by, email,
    last_name_kanji, first_name_kanji, last_name_kana, first_name_kana,
    phone,
    residence_1, residence_2, high_school, education,
    work_location, company,
    favorite_genres, allergies, drinking_frequency, favorite_sake_types
  ) values (
    new.id, new_code, inviter_id, new.email,
    nullif(m->>'last_name_kanji', ''),
    nullif(m->>'first_name_kanji', ''),
    nullif(m->>'last_name_kana', ''),
    nullif(m->>'first_name_kana', ''),
    nullif(m->>'phone', ''),
    nullif(m->>'residence_1', ''),
    nullif(m->>'residence_2', ''),
    nullif(m->>'high_school', ''),
    nullif(m->>'education', ''),
    nullif(m->>'work_location', ''),
    nullif(m->>'company', ''),
    nullif(m->>'favorite_genres', ''),
    nullif(m->>'allergies', ''),
    nullif(m->>'drinking_frequency', ''),
    nullif(m->>'favorite_sake_types', '')
  );

  return new;
end;
$$;

-- ============================================================
-- 2) 会員登録の選択肢マスタ（3種類）
-- ============================================================

-- 好きなジャンル
create table if not exists public.master_signup_favorite_genres (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  display_order int not null default 100,
  created_at timestamptz not null default now()
);

-- 好きな酒の種類
create table if not exists public.master_signup_favorite_sake_types (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  display_order int not null default 100,
  created_at timestamptz not null default now()
);

-- 酒を飲む頻度
create table if not exists public.master_drinking_frequencies (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  display_order int not null default 100,
  created_at timestamptz not null default now()
);

-- ============================================================
-- 3) RLS: 全員 select 可、admin のみ書き込み可
-- ============================================================
alter table public.master_signup_favorite_genres enable row level security;
alter table public.master_signup_favorite_sake_types enable row level security;
alter table public.master_drinking_frequencies enable row level security;

drop policy if exists "msfg_select" on public.master_signup_favorite_genres;
drop policy if exists "msfg_write" on public.master_signup_favorite_genres;
create policy "msfg_select" on public.master_signup_favorite_genres
  for select using (true);
create policy "msfg_write" on public.master_signup_favorite_genres
  for all using (
    exists (select 1 from public.members where id = auth.uid() and is_admin = true)
  ) with check (
    exists (select 1 from public.members where id = auth.uid() and is_admin = true)
  );

drop policy if exists "msfst_select" on public.master_signup_favorite_sake_types;
drop policy if exists "msfst_write" on public.master_signup_favorite_sake_types;
create policy "msfst_select" on public.master_signup_favorite_sake_types
  for select using (true);
create policy "msfst_write" on public.master_signup_favorite_sake_types
  for all using (
    exists (select 1 from public.members where id = auth.uid() and is_admin = true)
  ) with check (
    exists (select 1 from public.members where id = auth.uid() and is_admin = true)
  );

drop policy if exists "mdf_select" on public.master_drinking_frequencies;
drop policy if exists "mdf_write" on public.master_drinking_frequencies;
create policy "mdf_select" on public.master_drinking_frequencies
  for select using (true);
create policy "mdf_write" on public.master_drinking_frequencies
  for all using (
    exists (select 1 from public.members where id = auth.uid() and is_admin = true)
  ) with check (
    exists (select 1 from public.members where id = auth.uid() and is_admin = true)
  );

-- ============================================================
-- 4) 種データ
-- ============================================================
insert into public.master_signup_favorite_genres (name, display_order) values
  ('寿司', 10),
  ('和食', 20),
  ('焼肉', 30),
  ('鉄板焼き', 40),
  ('天ぷら', 50),
  ('うなぎ', 60),
  ('蕎麦・うどん', 70),
  ('ラーメン', 80),
  ('中華', 90),
  ('イタリアン', 100),
  ('フレンチ', 110),
  ('ビストロ', 120),
  ('創作料理', 130),
  ('居酒屋', 140),
  ('カフェ', 150),
  ('バー', 160),
  ('ワインバー', 170),
  ('スイーツ', 180)
on conflict (name) do nothing;

insert into public.master_signup_favorite_sake_types (name, display_order) values
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
  ('日本酒以外（ワイン・焼酎など）', 130)
on conflict (name) do nothing;

insert into public.master_drinking_frequencies (name, display_order) values
  ('毎日', 10),
  ('週4〜5回', 20),
  ('週2〜3回', 30),
  ('週1回', 40),
  ('月2〜3回', 50),
  ('月1回以下', 60),
  ('飲まない', 70)
on conflict (name) do nothing;

-- ============================================================
-- 5) PostgREST スキーマキャッシュ再読込
-- ============================================================
notify pgrst, 'reload schema';
