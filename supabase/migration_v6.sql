-- v6: 会員番号8桁化 + 会員プロフィール拡張 + get_inviter_info

-- 1) member_number を 18900000 〜 にシフト
update public.members set member_number = member_number + 18899999 where member_number < 18900000;
select setval('members_member_number_seq', (select coalesce(max(member_number), 18900000) from public.members));

-- 2) プロフィール列追加
alter table public.members
  add column if not exists last_name_kanji text,
  add column if not exists first_name_kanji text,
  add column if not exists last_name_kana text,
  add column if not exists first_name_kana text,
  add column if not exists residence_1 text,
  add column if not exists residence_2 text,
  add column if not exists high_school text,
  add column if not exists education text,
  add column if not exists company text,
  add column if not exists favorite_genres text,
  add column if not exists allergies text,
  add column if not exists drinking_frequency text,
  add column if not exists favorite_sake_types text;

-- 3) members 自分のレコード更新を許可
drop policy if exists members_update_self on public.members;
create policy members_update_self on public.members
  for update using (id = auth.uid()) with check (id = auth.uid());

-- 4) 招待者情報を返す RPC（サインアップ時に表示するため）
create or replace function public.get_inviter_info(num bigint, code text)
returns jsonb
language plpgsql security definer set search_path = public
as $$
declare result jsonb;
begin
  select jsonb_build_object(
    'valid', true,
    'member_number', member_number,
    'last_name', last_name_kanji,
    'first_name', first_name_kanji
  ) into result
  from public.members
  where member_number = num and member_code = code;
  if result is null then
    return jsonb_build_object('valid', false);
  end if;
  return result;
end;
$$;

-- 5) handle_new_member: メタデータからプロフィール列も保存
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
    id, member_code, invited_by,
    last_name_kanji, first_name_kanji, last_name_kana, first_name_kana,
    residence_1, residence_2, high_school, education, company,
    favorite_genres, allergies, drinking_frequency, favorite_sake_types
  ) values (
    new.id, new_code, inviter_id,
    nullif(m->>'last_name_kanji', ''),
    nullif(m->>'first_name_kanji', ''),
    nullif(m->>'last_name_kana', ''),
    nullif(m->>'first_name_kana', ''),
    nullif(m->>'residence_1', ''),
    nullif(m->>'residence_2', ''),
    nullif(m->>'high_school', ''),
    nullif(m->>'education', ''),
    nullif(m->>'company', ''),
    nullif(m->>'favorite_genres', ''),
    nullif(m->>'allergies', ''),
    nullif(m->>'drinking_frequency', ''),
    nullif(m->>'favorite_sake_types', '')
  );

  return new;
end;
$$;
