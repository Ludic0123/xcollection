-- v7: 電話番号 + 勤務地 を会員プロフィールに追加

alter table public.members
  add column if not exists phone text,
  add column if not exists work_location text;

-- handle_new_member を再定義（v6 + phone + work_location）
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
    phone,
    residence_1, residence_2, high_school, education,
    work_location, company,
    favorite_genres, allergies, drinking_frequency, favorite_sake_types
  ) values (
    new.id, new_code, inviter_id,
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
