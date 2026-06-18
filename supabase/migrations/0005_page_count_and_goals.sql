-- Page count per book (from Google Books where available; manually editable).
-- Used to total up pages read across finished books on the dashboard.
alter table books add column page_count integer;

-- Yearly reading goals: one target per (user, year).
create table reading_goals (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  year        integer not null,
  target      integer not null check (target > 0),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create unique index reading_goals_user_year_idx on reading_goals (user_id, year);

alter table reading_goals enable row level security;

create policy "reading_goals_select" on reading_goals for select using (auth.uid() = user_id);
create policy "reading_goals_insert" on reading_goals for insert with check (auth.uid() = user_id);
create policy "reading_goals_update" on reading_goals for update using (auth.uid() = user_id);
create policy "reading_goals_delete" on reading_goals for delete using (auth.uid() = user_id);
