-- my-tabelog: スキーマ作成 (実行は Supabase SQL Editor で)
-- カテゴリ: お店・ホテルを spots テーブルで統合管理

-- ========== spots: お店・ホテル ==========
create table if not exists spots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  category text not null check (category in ('restaurant','hotel','cafe','bar','other')),
  genre text,                  -- 焼肉・ラーメン・ビジネスホテル など自由文字
  city text,                   -- 東京・京都・那覇 など
  address text,
  price_range smallint check (price_range between 1 and 5),  -- 1:¥ 〜 5:¥¥¥¥¥
  url text,
  map_url text,
  notes text,
  want_to_visit boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists spots_user_id_idx on spots(user_id);
create index if not exists spots_city_idx on spots(city);
create index if not exists spots_category_idx on spots(category);

-- ========== visits: 訪問記録 (1スポットに複数回) ==========
create table if not exists visits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  spot_id uuid not null references spots(id) on delete cascade,
  visited_at date not null default current_date,
  rating smallint check (rating between 1 and 5),
  price integer,               -- 円
  comment text,
  created_at timestamptz not null default now()
);
create index if not exists visits_spot_id_idx on visits(spot_id);
create index if not exists visits_user_id_idx on visits(user_id);
create index if not exists visits_visited_at_idx on visits(visited_at desc);

-- ========== trip_plans: 街ごとの旅行プラン ==========
create table if not exists trip_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,         -- 例: 京都2泊3日
  city text,                   -- 例: 京都
  start_date date,
  end_date date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists trip_plans_user_id_idx on trip_plans(user_id);

-- ========== trip_plan_items: プランに紐づくスポット ==========
create table if not exists trip_plan_items (
  id uuid primary key default gen_random_uuid(),
  trip_plan_id uuid not null references trip_plans(id) on delete cascade,
  spot_id uuid references spots(id) on delete set null,  -- nullable: 自由入力も許容
  custom_name text,                                       -- spot_id が無いとき用
  day_number smallint not null default 1,                 -- 何日目
  display_order smallint not null default 0,              -- 同日内の表示順
  estimated_price integer,                                -- 予定金額(円)
  notes text,
  created_at timestamptz not null default now()
);
create index if not exists trip_plan_items_plan_idx on trip_plan_items(trip_plan_id);
create index if not exists trip_plan_items_spot_idx on trip_plan_items(spot_id);

-- ========== RLS ==========
alter table spots enable row level security;
alter table visits enable row level security;
alter table trip_plans enable row level security;
alter table trip_plan_items enable row level security;

-- 公開閲覧モード: SELECT は誰でも可、書き込みは作成者本人のみ

-- spots
drop policy if exists spots_select_own on spots;
drop policy if exists spots_select_public on spots;
create policy spots_select_public on spots for select using (true);
drop policy if exists spots_insert_own on spots;
create policy spots_insert_own on spots for insert with check (user_id = auth.uid());
drop policy if exists spots_update_own on spots;
create policy spots_update_own on spots for update using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists spots_delete_own on spots;
create policy spots_delete_own on spots for delete using (user_id = auth.uid());

-- visits
drop policy if exists visits_select_own on visits;
drop policy if exists visits_select_public on visits;
create policy visits_select_public on visits for select using (true);
drop policy if exists visits_insert_own on visits;
create policy visits_insert_own on visits for insert with check (user_id = auth.uid());
drop policy if exists visits_update_own on visits;
create policy visits_update_own on visits for update using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists visits_delete_own on visits;
create policy visits_delete_own on visits for delete using (user_id = auth.uid());

-- trip_plans
drop policy if exists trip_plans_select_own on trip_plans;
drop policy if exists trip_plans_select_public on trip_plans;
create policy trip_plans_select_public on trip_plans for select using (true);
drop policy if exists trip_plans_insert_own on trip_plans;
create policy trip_plans_insert_own on trip_plans for insert with check (user_id = auth.uid());
drop policy if exists trip_plans_update_own on trip_plans;
create policy trip_plans_update_own on trip_plans for update using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists trip_plans_delete_own on trip_plans;
create policy trip_plans_delete_own on trip_plans for delete using (user_id = auth.uid());

-- trip_plan_items: 閲覧は誰でも可、書き込みは親プランの所有者のみ
drop policy if exists trip_plan_items_select_own on trip_plan_items;
drop policy if exists trip_plan_items_select_public on trip_plan_items;
create policy trip_plan_items_select_public on trip_plan_items for select using (true);
drop policy if exists trip_plan_items_insert_own on trip_plan_items;
create policy trip_plan_items_insert_own on trip_plan_items for insert
  with check (exists (select 1 from trip_plans p where p.id = trip_plan_id and p.user_id = auth.uid()));
drop policy if exists trip_plan_items_update_own on trip_plan_items;
create policy trip_plan_items_update_own on trip_plan_items for update
  using (exists (select 1 from trip_plans p where p.id = trip_plan_id and p.user_id = auth.uid()))
  with check (exists (select 1 from trip_plans p where p.id = trip_plan_id and p.user_id = auth.uid()));
drop policy if exists trip_plan_items_delete_own on trip_plan_items;
create policy trip_plan_items_delete_own on trip_plan_items for delete
  using (exists (select 1 from trip_plans p where p.id = trip_plan_id and p.user_id = auth.uid()));

-- ========== updated_at 自動更新トリガー ==========
create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists spots_set_updated_at on spots;
create trigger spots_set_updated_at before update on spots
  for each row execute function set_updated_at();

drop trigger if exists trip_plans_set_updated_at on trip_plans;
create trigger trip_plans_set_updated_at before update on trip_plans
  for each row execute function set_updated_at();
