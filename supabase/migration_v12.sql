-- v12: 日本酒の銘柄・モデルマスター + sakes.model 列

-- ============ master_sake_brands (銘柄) ============
create table if not exists public.master_sake_brands (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  display_order int not null default 0,
  created_at timestamptz not null default now()
);

insert into public.master_sake_brands (name, display_order) values
  ('十四代', 10),
  ('而今', 20),
  ('飛露喜', 30),
  ('獺祭', 40),
  ('新政', 50),
  ('黒龍', 60),
  ('鍋島', 70),
  ('磯自慢', 80),
  ('松の司', 90),
  ('田酒', 100),
  ('紀土', 110),
  ('醸し人九平次', 120),
  ('英君', 130),
  ('鳳凰美田', 140),
  ('くどき上手', 150),
  ('その他', 9999)
on conflict (name) do nothing;

alter table public.master_sake_brands enable row level security;
drop policy if exists msb_select_public on public.master_sake_brands;
create policy msb_select_public on public.master_sake_brands for select using (true);
drop policy if exists msb_write_admin on public.master_sake_brands;
create policy msb_write_admin on public.master_sake_brands for all
  using (exists (select 1 from public.members m where m.id = auth.uid() and m.is_admin = true))
  with check (exists (select 1 from public.members m where m.id = auth.uid() and m.is_admin = true));

-- ============ master_sake_models (モデル/品名) ============
create table if not exists public.master_sake_models (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  display_order int not null default 0,
  created_at timestamptz not null default now()
);

insert into public.master_sake_models (name, display_order) values
  ('純米大吟醸', 10),
  ('純米吟醸', 20),
  ('特別純米', 30),
  ('純米酒', 40),
  ('大吟醸', 50),
  ('吟醸', 60),
  ('本醸造', 70),
  ('生酛', 80),
  ('山廃', 90),
  ('生酒', 100),
  ('原酒', 110),
  ('にごり酒', 120),
  ('スパークリング', 130),
  ('古酒', 140),
  ('その他', 9999)
on conflict (name) do nothing;

alter table public.master_sake_models enable row level security;
drop policy if exists msm_select_public on public.master_sake_models;
create policy msm_select_public on public.master_sake_models for select using (true);
drop policy if exists msm_write_admin on public.master_sake_models;
create policy msm_write_admin on public.master_sake_models for all
  using (exists (select 1 from public.members m where m.id = auth.uid() and m.is_admin = true))
  with check (exists (select 1 from public.members m where m.id = auth.uid() and m.is_admin = true));

-- ============ sakes.model ============
alter table public.sakes add column if not exists model text;

NOTIFY pgrst, 'reload schema';
