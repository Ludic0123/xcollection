-- v8: hotels を spots から分離

-- ============ master_hotel_brands ============
create table if not exists public.master_hotel_brands (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  display_order int not null default 0,
  created_at timestamptz not null default now()
);

insert into public.master_hotel_brands (name, display_order) values
  ('アマン', 10),
  ('リッツカールトン', 20),
  ('フォーシーズンズ', 30),
  ('マンダリン オリエンタル', 40),
  ('ペニンシュラ', 50),
  ('セントレジス', 60),
  ('ブシュロン', 65),
  ('シャングリ・ラ', 70),
  ('パークハイアット', 80),
  ('アンダーズ', 90),
  ('エディション', 100),
  ('ハイアット', 110),
  ('星野リゾート', 120),
  ('独立系・ブティック', 200),
  ('その他', 9999)
on conflict (name) do nothing;

alter table public.master_hotel_brands enable row level security;
drop policy if exists mhb_select_public on public.master_hotel_brands;
create policy mhb_select_public on public.master_hotel_brands for select using (true);
drop policy if exists mhb_write_admin on public.master_hotel_brands;
create policy mhb_write_admin on public.master_hotel_brands for all
  using (exists (select 1 from public.members m where m.id = auth.uid() and m.is_admin = true))
  with check (exists (select 1 from public.members m where m.id = auth.uid() and m.is_admin = true));

-- ============ hotels ============
create table if not exists public.hotels (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  brand text,
  prefecture text,
  address text,
  url text,
  map_url text,
  lat numeric(10,7),
  lng numeric(10,7),
  cover_image_url text,
  photo_urls jsonb not null default '[]',
  price_range smallint check (price_range between 1 and 5),
  notes text,
  rating smallint check (rating between 1 and 5),
  reservation_methods text[] not null default '{}',
  want_to_visit boolean not null default false,
  is_featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists hotels_user_id_idx on public.hotels(user_id);
create index if not exists hotels_prefecture_idx on public.hotels(prefecture);
create index if not exists hotels_latlng_idx on public.hotels(lat, lng) where lat is not null;

alter table public.hotels enable row level security;
drop policy if exists hotels_select_public on public.hotels;
create policy hotels_select_public on public.hotels for select using (true);
drop policy if exists hotels_insert_own on public.hotels;
create policy hotels_insert_own on public.hotels for insert with check (user_id = auth.uid());
drop policy if exists hotels_update_own on public.hotels;
create policy hotels_update_own on public.hotels for update using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists hotels_delete_own on public.hotels;
create policy hotels_delete_own on public.hotels for delete using (user_id = auth.uid());

drop trigger if exists hotels_set_updated_at on public.hotels;
create trigger hotels_set_updated_at before update on public.hotels
  for each row execute function set_updated_at();

-- ============ stays (内部に保持、UIでは集約のみ) ============
create table if not exists public.stays (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  hotel_id uuid not null references public.hotels(id) on delete cascade,
  check_in_date date not null default current_date,
  check_out_date date,
  price integer,
  rating smallint check (rating between 1 and 5),
  comment text,
  photo_urls jsonb not null default '[]',
  created_at timestamptz not null default now()
);
create index if not exists stays_hotel_idx on public.stays(hotel_id);
create index if not exists stays_user_idx on public.stays(user_id);

alter table public.stays enable row level security;
drop policy if exists stays_select_public on public.stays;
create policy stays_select_public on public.stays for select using (true);
drop policy if exists stays_insert_own on public.stays;
create policy stays_insert_own on public.stays for insert with check (user_id = auth.uid());
drop policy if exists stays_update_own on public.stays;
create policy stays_update_own on public.stays for update using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists stays_delete_own on public.stays;
create policy stays_delete_own on public.stays for delete using (user_id = auth.uid());
