-- v3: 会員制度（コードベースの招待登録）

-- ========== members テーブル ==========
create table if not exists public.members (
  id uuid primary key references auth.users(id) on delete cascade,
  member_code text unique not null,
  invited_by uuid references auth.users(id) on delete set null,
  display_name text,
  created_at timestamptz not null default now()
);

create index if not exists members_member_code_idx on public.members(member_code);
create index if not exists members_invited_by_idx on public.members(invited_by);

-- ========== RLS ==========
alter table public.members enable row level security;

drop policy if exists members_select_self on public.members;
create policy members_select_self on public.members
  for select using (id = auth.uid());

-- ========== 会員コード検証用RPC（anonからでも呼べる）==========
create or replace function public.validate_member_code(code text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  return exists(select 1 from public.members where member_code = code);
end;
$$;

-- ========== 新規ユーザー作成時に members レコード自動作成 ==========
create or replace function public.handle_new_member()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  new_code text;
  inviter_id uuid;
  provided_code text;
  attempt int := 0;
begin
  provided_code := nullif(trim(new.raw_user_meta_data->>'invited_by_code'), '');

  -- 会員0人のとき（ブートストラップ）はコードなしOK
  -- それ以外は招待コード必須
  if provided_code is null then
    if exists (select 1 from public.members) then
      raise exception 'Invitation code required';
    end if;
  else
    select id into inviter_id from public.members where member_code = provided_code;
    if inviter_id is null then
      raise exception 'Invalid invitation code: %', provided_code;
    end if;
  end if;

  -- 8桁の会員コード生成（衝突回避）
  loop
    new_code := upper(substring(md5(random()::text || clock_timestamp()::text || new.id::text) from 1 for 8));
    exit when not exists (select 1 from public.members where member_code = new_code);
    attempt := attempt + 1;
    if attempt > 20 then
      raise exception 'Could not generate unique member code';
    end if;
  end loop;

  insert into public.members (id, member_code, invited_by)
  values (new.id, new_code, inviter_id);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_member();

-- ========== 既存ユーザーをブートストラップ ==========
-- 既にサインアップ済みのユーザーをまとめて初期会員にする
insert into public.members (id, member_code, invited_by)
select
  u.id,
  upper(substring(md5(u.id::text || clock_timestamp()::text) from 1 for 8)),
  null
from auth.users u
where u.id not in (select id from public.members);
