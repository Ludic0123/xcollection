-- v22: コンテンツテーブルの書き込みを admin 限定に
-- spots / visits / hotels / stays / sakes / chefs / trip_plans / trip_plan_items / events

-- 共通: is_admin_user() を使った admin 限定の書き込みポリシーに置き換え
-- ※ is_admin_user() は SECURITY DEFINER で auth.uid() が admin かを返す既存関数

-- ============ spots ============
drop policy if exists spots_insert_own on public.spots;
drop policy if exists spots_update_own on public.spots;
drop policy if exists spots_delete_own on public.spots;
drop policy if exists spots_insert_admin on public.spots;
drop policy if exists spots_update_admin on public.spots;
drop policy if exists spots_delete_admin on public.spots;
create policy spots_insert_admin on public.spots for insert
  with check (is_admin_user());
create policy spots_update_admin on public.spots for update
  using (is_admin_user()) with check (is_admin_user());
create policy spots_delete_admin on public.spots for delete
  using (is_admin_user());

-- ============ visits ============
drop policy if exists visits_insert_own on public.visits;
drop policy if exists visits_update_own on public.visits;
drop policy if exists visits_delete_own on public.visits;
drop policy if exists visits_insert_admin on public.visits;
drop policy if exists visits_update_admin on public.visits;
drop policy if exists visits_delete_admin on public.visits;
create policy visits_insert_admin on public.visits for insert
  with check (is_admin_user());
create policy visits_update_admin on public.visits for update
  using (is_admin_user()) with check (is_admin_user());
create policy visits_delete_admin on public.visits for delete
  using (is_admin_user());

-- ============ hotels ============
drop policy if exists hotels_insert_own on public.hotels;
drop policy if exists hotels_update_own on public.hotels;
drop policy if exists hotels_delete_own on public.hotels;
drop policy if exists hotels_insert_admin on public.hotels;
drop policy if exists hotels_update_admin on public.hotels;
drop policy if exists hotels_delete_admin on public.hotels;
create policy hotels_insert_admin on public.hotels for insert
  with check (is_admin_user());
create policy hotels_update_admin on public.hotels for update
  using (is_admin_user()) with check (is_admin_user());
create policy hotels_delete_admin on public.hotels for delete
  using (is_admin_user());

-- ============ stays ============
drop policy if exists stays_insert_own on public.stays;
drop policy if exists stays_update_own on public.stays;
drop policy if exists stays_delete_own on public.stays;
drop policy if exists stays_insert_admin on public.stays;
drop policy if exists stays_update_admin on public.stays;
drop policy if exists stays_delete_admin on public.stays;
create policy stays_insert_admin on public.stays for insert
  with check (is_admin_user());
create policy stays_update_admin on public.stays for update
  using (is_admin_user()) with check (is_admin_user());
create policy stays_delete_admin on public.stays for delete
  using (is_admin_user());

-- ============ sakes ============
drop policy if exists sakes_insert_own on public.sakes;
drop policy if exists sakes_update_own on public.sakes;
drop policy if exists sakes_delete_own on public.sakes;
drop policy if exists sakes_insert_admin on public.sakes;
drop policy if exists sakes_update_admin on public.sakes;
drop policy if exists sakes_delete_admin on public.sakes;
create policy sakes_insert_admin on public.sakes for insert
  with check (is_admin_user());
create policy sakes_update_admin on public.sakes for update
  using (is_admin_user()) with check (is_admin_user());
create policy sakes_delete_admin on public.sakes for delete
  using (is_admin_user());

-- ============ chefs ============
drop policy if exists chefs_insert_own on public.chefs;
drop policy if exists chefs_update_own on public.chefs;
drop policy if exists chefs_delete_own on public.chefs;
drop policy if exists chefs_insert_admin on public.chefs;
drop policy if exists chefs_update_admin on public.chefs;
drop policy if exists chefs_delete_admin on public.chefs;
create policy chefs_insert_admin on public.chefs for insert
  with check (is_admin_user());
create policy chefs_update_admin on public.chefs for update
  using (is_admin_user()) with check (is_admin_user());
create policy chefs_delete_admin on public.chefs for delete
  using (is_admin_user());

-- ============ trip_plans ============
drop policy if exists trip_plans_insert_own on public.trip_plans;
drop policy if exists trip_plans_update_own on public.trip_plans;
drop policy if exists trip_plans_delete_own on public.trip_plans;
drop policy if exists trip_plans_insert_admin on public.trip_plans;
drop policy if exists trip_plans_update_admin on public.trip_plans;
drop policy if exists trip_plans_delete_admin on public.trip_plans;
create policy trip_plans_insert_admin on public.trip_plans for insert
  with check (is_admin_user());
create policy trip_plans_update_admin on public.trip_plans for update
  using (is_admin_user()) with check (is_admin_user());
create policy trip_plans_delete_admin on public.trip_plans for delete
  using (is_admin_user());

-- ============ trip_plan_items ============
drop policy if exists trip_plan_items_insert_own on public.trip_plan_items;
drop policy if exists trip_plan_items_update_own on public.trip_plan_items;
drop policy if exists trip_plan_items_delete_own on public.trip_plan_items;
drop policy if exists trip_plan_items_insert_admin on public.trip_plan_items;
drop policy if exists trip_plan_items_update_admin on public.trip_plan_items;
drop policy if exists trip_plan_items_delete_admin on public.trip_plan_items;
create policy trip_plan_items_insert_admin on public.trip_plan_items for insert
  with check (is_admin_user());
create policy trip_plan_items_update_admin on public.trip_plan_items for update
  using (is_admin_user()) with check (is_admin_user());
create policy trip_plan_items_delete_admin on public.trip_plan_items for delete
  using (is_admin_user());

-- ============ events (グルメ会・日本酒会の募集) ============
-- これは会員も新規作成できるべきなので変更しない（既存ポリシーのまま）

notify pgrst, 'reload schema';
