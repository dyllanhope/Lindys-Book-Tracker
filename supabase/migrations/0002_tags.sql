-- Tags: typed/categorized labels (genre, format, mood, custom) attached to books.
-- Mirrors the collections / collection_books many-to-many pattern.

create type tag_category as enum ('genre', 'format', 'mood', 'custom');

create table tags (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null,
  category    tag_category not null default 'custom',
  created_at  timestamptz not null default now()
);

-- One tag per (user, category, case-insensitive name)
create unique index tags_user_cat_name_idx on tags (user_id, category, lower(name));
create index tags_user_id_idx on tags (user_id);

alter table tags enable row level security;

create policy "tags_select" on tags for select using (auth.uid() = user_id);
create policy "tags_insert" on tags for insert with check (auth.uid() = user_id);
create policy "tags_update" on tags for update using (auth.uid() = user_id);
create policy "tags_delete" on tags for delete using (auth.uid() = user_id);

-- Book tags (many-to-many)
create table book_tags (
  book_id uuid not null references books(id) on delete cascade,
  tag_id  uuid not null references tags(id) on delete cascade,
  primary key (book_id, tag_id)
);

create index book_tags_tag_id_idx on book_tags (tag_id);

alter table book_tags enable row level security;

create policy "book_tags_select" on book_tags for select
  using (exists (
    select 1 from tags t
    where t.id = tag_id and t.user_id = auth.uid()
  ));

create policy "book_tags_insert" on book_tags for insert
  with check (exists (
    select 1 from tags t
    where t.id = tag_id and t.user_id = auth.uid()
  ));

create policy "book_tags_delete" on book_tags for delete
  using (exists (
    select 1 from tags t
    where t.id = tag_id and t.user_id = auth.uid()
  ));
