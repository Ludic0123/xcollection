-- v19: ブログのタイトル + ブロック式本文（note風）

alter table public.visits
  add column if not exists title text,
  add column if not exists body_blocks jsonb not null default '[]'::jsonb;

notify pgrst, 'reload schema';
