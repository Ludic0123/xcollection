-- Xcollection production project: ofdbdblaewkjvfxcvvsm
-- Repair missing schema and save a spot + first blog as one transaction.
BEGIN;
ALTER TABLE public.visits ADD COLUMN IF NOT EXISTS photo_urls jsonb NOT NULL DEFAULT '[]'::jsonb;


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

alter table public.sakes add column if not exists model text;



GRANT SELECT ON public.master_sake_brands, public.master_sake_models TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.master_sake_brands, public.master_sake_models TO authenticated;



CREATE OR REPLACE FUNCTION public.save_spot_with_visit(
  p_spot_id uuid, p_visit_id uuid, p_spot jsonb, p_visit jsonb, p_edit boolean DEFAULT false
) RETURNS uuid
LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
DECLARE
  s public.spots%ROWTYPE;
  v public.visits%ROWTYPE;
  existing_owner uuid;
  existing_spot uuid;
BEGIN
  IF auth.uid() IS NULL OR NOT EXISTS (SELECT 1 FROM public.members WHERE id = auth.uid() AND is_admin) THEN
    RAISE EXCEPTION '管理者としてログインしてください' USING ERRCODE = '42501';
  END IF;
  IF p_spot_id IS NULL OR p_visit_id IS NULL OR p_edit IS NULL OR p_spot IS NULL THEN
    RAISE EXCEPTION '保存データが不足しています' USING ERRCODE = '22023';
  END IF;
  PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_spot_id::text, 0));
  SELECT user_id INTO existing_owner FROM public.spots WHERE id = p_spot_id FOR UPDATE;
  IF FOUND AND NOT p_edit THEN
    IF existing_owner = auth.uid() AND EXISTS (SELECT 1 FROM public.visits WHERE id = p_visit_id AND spot_id = p_spot_id AND user_id = auth.uid()) THEN
      RETURN p_spot_id;
    END IF;
    RAISE EXCEPTION 'この登録IDは既に使われています' USING ERRCODE = '23505';
  ELSIF NOT FOUND AND p_edit THEN
    RAISE EXCEPTION '更新対象が見つかりません。再読み込みしてください' USING ERRCODE = 'P0002';
  END IF;
  s := pg_catalog.jsonb_populate_record(NULL::public.spots, p_spot);
  IF s.name IS NULL OR btrim(s.name) = '' THEN
    RAISE EXCEPTION 'お店の名前を入力してください' USING ERRCODE = '22023';
  END IF;
  IF NOT p_edit AND p_visit IS NULL THEN
    RAISE EXCEPTION 'ブログを入力してください' USING ERRCODE = '22023';
  END IF;
  IF p_edit THEN
    UPDATE public.spots SET name = s.name, category = s.category, genre = s.genre, prefecture = s.prefecture, city = s.city, address = s.address, price_range_lunch = s.price_range_lunch, price_range_dinner = s.price_range_dinner, url = s.url, map_url = s.map_url, notes = s.notes, want_to_visit = s.want_to_visit, cover_image_url = s.cover_image_url, cover_image_exterior = s.cover_image_exterior, cover_image_food = s.cover_image_food, photo_urls = s.photo_urls, reservation_methods = s.reservation_methods, is_featured = s.is_featured, lat = s.lat, lng = s.lng, chef_id = s.chef_id, meal_times = s.meal_times WHERE id = p_spot_id;
    IF NOT FOUND THEN RAISE EXCEPTION '更新権限がありません' USING ERRCODE = '42501'; END IF;
  ELSE
    INSERT INTO public.spots(id, user_id, name, category, genre, prefecture, city, address, price_range_lunch, price_range_dinner, url, map_url, notes, want_to_visit, cover_image_url, cover_image_exterior, cover_image_food, photo_urls, reservation_methods, is_featured, lat, lng, chef_id, meal_times)
      VALUES(p_spot_id, auth.uid(), s.name, s.category, s.genre, s.prefecture, s.city, s.address, s.price_range_lunch, s.price_range_dinner, s.url, s.map_url, s.notes, s.want_to_visit, s.cover_image_url, s.cover_image_exterior, s.cover_image_food, s.photo_urls, s.reservation_methods, s.is_featured, s.lat, s.lng, s.chef_id, s.meal_times);
  END IF;
  IF p_visit IS NOT NULL THEN
    v := pg_catalog.jsonb_populate_record(NULL::public.visits, p_visit);
    IF v.title IS NULL OR btrim(v.title) = '' OR v.visited_at IS NULL OR v.body_blocks IS NULL OR pg_catalog.jsonb_array_length(v.body_blocks) = 0 THEN
      RAISE EXCEPTION '訪問日・ブログタイトル・本文を入力してください' USING ERRCODE = '22023';
    END IF;
    SELECT spot_id INTO existing_spot FROM public.visits WHERE id = p_visit_id FOR UPDATE;
    IF FOUND THEN
      IF existing_spot <> p_spot_id THEN
        RAISE EXCEPTION '訪問記録のお店が一致しません' USING ERRCODE = '22023';
      END IF;
      UPDATE public.visits SET visited_at = v.visited_at, rating = v.rating, price = v.price, title = v.title, comment = v.comment, body_blocks = v.body_blocks, photo_urls = v.photo_urls WHERE id = p_visit_id;
      IF NOT FOUND THEN RAISE EXCEPTION 'ブログの更新権限がありません' USING ERRCODE = '42501'; END IF;
    ELSE
      INSERT INTO public.visits(id, user_id, spot_id, visited_at, rating, price, title, comment, body_blocks, photo_urls)
        VALUES(p_visit_id, auth.uid(), p_spot_id, v.visited_at, v.rating, v.price, v.title, v.comment, v.body_blocks, v.photo_urls);
    END IF;
  END IF;
  RETURN p_spot_id;
END;
$$;
REVOKE ALL ON FUNCTION public.save_spot_with_visit(uuid, uuid, jsonb, jsonb, boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.save_spot_with_visit(uuid, uuid, jsonb, jsonb, boolean) TO authenticated;
NOTIFY pgrst, 'reload schema';
COMMIT;
