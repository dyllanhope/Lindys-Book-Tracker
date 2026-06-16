-- Enums
create type reading_status as enum ('not_started', 'currently_reading', 'finished', 'did_not_finish');
create type rating_category as enum ('plot', 'characters', 'writing', 'spice');
create type external_source as enum ('google', 'openlibrary', 'manual');

-- updated_at trigger
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Books
create table books (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  title           text not null,
  author          text,
  series          text,
  isbn            text,
  description     text,
  cover_url       text,
  external_source external_source,
  external_id     text,
  owned           boolean not null default false,
  reading_status  reading_status not null default 'not_started',
  date_added      timestamptz not null default now(),
  date_started    date,
  date_finished   date,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index books_user_id_idx on books(user_id);
create index books_user_status_idx on books(user_id, reading_status);

create trigger books_updated_at
  before update on books
  for each row execute function set_updated_at();

alter table books enable row level security;

create policy "books_select" on books for select using (auth.uid() = user_id);
create policy "books_insert" on books for insert with check (auth.uid() = user_id);
create policy "books_update" on books for update using (auth.uid() = user_id);
create policy "books_delete" on books for delete using (auth.uid() = user_id);

-- Ratings
create table ratings (
  id          uuid primary key default gen_random_uuid(),
  book_id     uuid not null references books(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  category    rating_category not null,
  score       integer not null check (score >= 1 and score <= 5),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (book_id, category)
);

create index ratings_book_id_idx on ratings(book_id);

create trigger ratings_updated_at
  before update on ratings
  for each row execute function set_updated_at();

alter table ratings enable row level security;

create policy "ratings_select" on ratings for select using (auth.uid() = user_id);
create policy "ratings_insert" on ratings for insert with check (auth.uid() = user_id);
create policy "ratings_update" on ratings for update using (auth.uid() = user_id);
create policy "ratings_delete" on ratings for delete using (auth.uid() = user_id);

-- Notes
create table notes (
  id          uuid primary key default gen_random_uuid(),
  book_id     uuid not null references books(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  body        text not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger notes_updated_at
  before update on notes
  for each row execute function set_updated_at();

alter table notes enable row level security;

create policy "notes_select" on notes for select using (auth.uid() = user_id);
create policy "notes_insert" on notes for insert with check (auth.uid() = user_id);
create policy "notes_update" on notes for update using (auth.uid() = user_id);
create policy "notes_delete" on notes for delete using (auth.uid() = user_id);

-- Collections
create table collections (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null,
  created_at  timestamptz not null default now(),
  unique (user_id, name)
);

alter table collections enable row level security;

create policy "collections_select" on collections for select using (auth.uid() = user_id);
create policy "collections_insert" on collections for insert with check (auth.uid() = user_id);
create policy "collections_update" on collections for update using (auth.uid() = user_id);
create policy "collections_delete" on collections for delete using (auth.uid() = user_id);

-- Collection books (many-to-many)
create table collection_books (
  collection_id uuid not null references collections(id) on delete cascade,
  book_id       uuid not null references books(id) on delete cascade,
  primary key (collection_id, book_id)
);

create index collection_books_book_id_idx on collection_books(book_id);

alter table collection_books enable row level security;

create policy "collection_books_select" on collection_books for select
  using (exists (
    select 1 from collections c
    where c.id = collection_id and c.user_id = auth.uid()
  ));

create policy "collection_books_insert" on collection_books for insert
  with check (exists (
    select 1 from collections c
    where c.id = collection_id and c.user_id = auth.uid()
  ));

create policy "collection_books_delete" on collection_books for delete
  using (exists (
    select 1 from collections c
    where c.id = collection_id and c.user_id = auth.uid()
  ));
