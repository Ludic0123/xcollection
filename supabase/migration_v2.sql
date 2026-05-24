-- v2: 訪問写真複数 + 予約方法 + フィーチャー

-- ========== visits.photo_urls ==========
-- 1訪問につき複数枚の画像URLを保持（最大30枚を想定）
alter table visits add column if not exists photo_urls jsonb not null default '[]'::jsonb;

-- ========== spots.reservation_methods ==========
-- 予約方法を複数選択で保持（コード配列）
alter table spots add column if not exists reservation_methods text[] not null default '{}';

-- ========== spots.is_featured ==========
-- トップページのFEATUREDバナーで取り上げるフラグ
alter table spots add column if not exists is_featured boolean not null default false;

create index if not exists spots_is_featured_idx on spots(is_featured) where is_featured = true;
