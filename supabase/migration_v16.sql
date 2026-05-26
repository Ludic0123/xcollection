-- v16: 管理者が他会員のレコードを更新できるポリシー

drop policy if exists members_update_admin on public.members;
create policy members_update_admin on public.members
  for update
  using (
    exists (select 1 from public.members me where me.id = auth.uid() and me.is_admin = true)
  )
  with check (
    exists (select 1 from public.members me where me.id = auth.uid() and me.is_admin = true)
  );

notify pgrst, 'reload schema';
