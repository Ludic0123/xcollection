-- v10: spots.photo_urls 追加（ホテル・日本酒と同様に複数枚の写真）

alter table public.spots add column if not exists photo_urls jsonb not null default '[]'::jsonb;
