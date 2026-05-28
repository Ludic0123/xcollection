-- v20: 価格帯を細分化（2万円以上は1万円ごと）

-- 上限を20まで拡張
alter table public.spots drop constraint if exists spots_price_range_check;
alter table public.spots add constraint spots_price_range_check check (price_range between 1 and 20);
alter table public.spots drop constraint if exists spots_price_range_lunch_check;
alter table public.spots add constraint spots_price_range_lunch_check check (price_range_lunch between 1 and 20);
alter table public.spots drop constraint if exists spots_price_range_dinner_check;
alter table public.spots add constraint spots_price_range_dinner_check check (price_range_dinner between 1 and 20);

alter table public.hotels drop constraint if exists hotels_price_range_check;
alter table public.hotels add constraint hotels_price_range_check check (price_range between 1 and 20);

alter table public.master_price_ranges drop constraint if exists master_price_ranges_level_check;
alter table public.master_price_ranges add constraint master_price_ranges_level_check check (level between 1 and 20);

-- ラベルを再定義（2万円以上は1万円ごと）
insert into public.master_price_ranges (level, label, display_order) values
  (1,  '〜1,000円',        1),
  (2,  '〜3,000円',        2),
  (3,  '〜6,000円',        3),
  (4,  '〜10,000円',       4),
  (5,  '〜15,000円',       5),
  (6,  '〜20,000円',       6),
  (7,  '20,000〜30,000円', 7),
  (8,  '30,000〜40,000円', 8),
  (9,  '40,000〜50,000円', 9),
  (10, '50,000〜60,000円', 10),
  (11, '60,000〜70,000円', 11),
  (12, '70,000〜80,000円', 12),
  (13, '80,000〜90,000円', 13),
  (14, '90,000〜100,000円',14),
  (15, '100,000円〜',      15)
on conflict (level) do update set label = excluded.label, display_order = excluded.display_order;

NOTIFY pgrst, 'reload schema';
