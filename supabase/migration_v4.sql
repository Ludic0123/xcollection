-- v4: 会員番号 + 日本酒 + グルメ会(events) + マップ座標

-- ============================================
-- 1) members.member_number 追加（既存ユーザー含めて連番）
-- ============================================
alter table public.members add column if not exists member_number bigint;
create sequence if not exists members_member_number_seq;
update public.members
  set member_number = nextval('members_member_number_seq')
  where member_number is null;
alter table public.members alter column member_number set default nextval('members_member_number_seq');
alter table public.members alter column member_number set not null;
create unique index if not exists members_member_number_uq on public.members(member_number);

-- 招待検証: 会員番号 + 招待コード(member_code) の組み合わせを検証
create or replace function public.validate_invitation(num bigint, code text)
returns boolean
language plpgsql security definer set search_path = public
as $$
begin
  return exists(
    select 1 from public.members
    where member_number = num and member_code = code
  );
end;
$$;

-- handle_new_member: invited_by_code + invited_by_number でinviterを引く
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
begin
  provided_code := nullif(trim(new.raw_user_meta_data->>'invited_by_code'), '');
  begin
    provided_number := (new.raw_user_meta_data->>'invited_by_number')::bigint;
  exception when others then provided_number := null; end;

  if provided_code is null or provided_number is null then
    if exists (select 1 from public.members) then
      raise exception 'Invitation required';
    end if;
  else
    select id into inviter_id from public.members
      where member_number = provided_number and member_code = provided_code;
    if inviter_id is null then
      raise exception 'Invalid invitation';
    end if;
  end if;

  loop
    new_code := upper(substring(md5(random()::text || clock_timestamp()::text || new.id::text) from 1 for 8));
    exit when not exists (select 1 from public.members where member_code = new_code);
    attempt := attempt + 1;
    if attempt > 20 then raise exception 'Could not generate unique code'; end if;
  end loop;

  insert into public.members (id, member_code, invited_by)
  values (new.id, new_code, inviter_id);
  return new;
end;
$$;

-- ============================================
-- 2) spots に lat / lng 追加（マップ用）
-- ============================================
alter table public.spots add column if not exists lat numeric(10, 7);
alter table public.spots add column if not exists lng numeric(10, 7);
create index if not exists spots_latlng_idx on public.spots(lat, lng) where lat is not null;

-- ============================================
-- 3) sakes 日本酒テーブル
-- ============================================
create table if not exists public.sakes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,                  -- 銘柄
  brewery text,                        -- 蔵元
  region text,                         -- 産地
  sake_type text,                      -- 純米 / 大吟醸 / 純米吟醸 / etc
  rice_polishing_pct int,              -- 精米歩合
  alcohol_pct numeric(4,1),            -- アルコール度数
  price_yen int,                       -- 参考価格(円)
  notes text,
  cover_image_url text,
  photo_urls jsonb not null default '[]',
  rating smallint check (rating between 1 and 5),
  is_featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists sakes_user_id_idx on public.sakes(user_id);
create index if not exists sakes_region_idx on public.sakes(region);

alter table public.sakes enable row level security;
drop policy if exists sakes_select_public on public.sakes;
create policy sakes_select_public on public.sakes for select using (true);
drop policy if exists sakes_insert_own on public.sakes;
create policy sakes_insert_own on public.sakes for insert with check (user_id = auth.uid());
drop policy if exists sakes_update_own on public.sakes;
create policy sakes_update_own on public.sakes for update using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists sakes_delete_own on public.sakes;
create policy sakes_delete_own on public.sakes for delete using (user_id = auth.uid());

drop trigger if exists sakes_set_updated_at on public.sakes;
create trigger sakes_set_updated_at before update on public.sakes
  for each row execute function set_updated_at();

-- ============================================
-- 4) events グルメ会テーブル（3タイプ統合）
-- ============================================
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  organizer_id uuid not null references auth.users(id) on delete cascade,
  event_type text not null check (event_type in ('dining_meetup','sake_meetup','sake_distribution')),
  title text not null,
  description text,
  cover_image_url text,
  -- 共通
  event_date date,
  event_time time,
  location_text text,                  -- 場所(自由)
  spot_id uuid references public.spots(id) on delete set null,  -- 店指定の場合
  sake_id uuid references public.sakes(id) on delete set null,  -- 日本酒指定の場合
  max_participants int,
  budget_yen int,                      -- 一人あたり予算/参加費
  deadline timestamptz,                -- 募集締切
  status text not null default 'open' check (status in ('open','closed','cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists events_type_status_idx on public.events(event_type, status);
create index if not exists events_organizer_idx on public.events(organizer_id);
create index if not exists events_event_date_idx on public.events(event_date);

alter table public.events enable row level security;
-- 会員のみ閲覧
drop policy if exists events_select_member on public.events;
create policy events_select_member on public.events for select
  using (auth.uid() is not null and exists (select 1 from public.members m where m.id = auth.uid()));
-- 会員のみ作成（自分が主催者として）
drop policy if exists events_insert_member on public.events;
create policy events_insert_member on public.events for insert
  with check (organizer_id = auth.uid() and exists (select 1 from public.members m where m.id = auth.uid()));
-- 主催者のみ更新・削除
drop policy if exists events_update_organizer on public.events;
create policy events_update_organizer on public.events for update
  using (organizer_id = auth.uid()) with check (organizer_id = auth.uid());
drop policy if exists events_delete_organizer on public.events;
create policy events_delete_organizer on public.events for delete
  using (organizer_id = auth.uid());

drop trigger if exists events_set_updated_at on public.events;
create trigger events_set_updated_at before update on public.events
  for each row execute function set_updated_at();

-- ============================================
-- 5) event_participants 参加者
-- ============================================
create table if not exists public.event_participants (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  joined_at timestamptz not null default now(),
  comment text,
  unique (event_id, user_id)
);
create index if not exists event_participants_event_idx on public.event_participants(event_id);

alter table public.event_participants enable row level security;
-- 会員のみ閲覧
drop policy if exists ep_select_member on public.event_participants;
create policy ep_select_member on public.event_participants for select
  using (auth.uid() is not null and exists (select 1 from public.members m where m.id = auth.uid()));
-- 自分の参加レコードのみ作成
drop policy if exists ep_insert_self on public.event_participants;
create policy ep_insert_self on public.event_participants for insert
  with check (user_id = auth.uid() and exists (select 1 from public.members m where m.id = auth.uid()));
-- 自分の参加レコードのみ削除（キャンセル）
drop policy if exists ep_delete_self on public.event_participants;
create policy ep_delete_self on public.event_participants for delete
  using (user_id = auth.uid());
