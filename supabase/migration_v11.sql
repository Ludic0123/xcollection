-- v11: spots.prefecture 追加（city は街/エリア名として残す）

alter table public.spots add column if not exists prefecture text;
create index if not exists spots_prefecture_idx on public.spots(prefecture);

NOTIFY pgrst, 'reload schema';
