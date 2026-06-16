# Lindy's Book Tracker

A personal book tracking app built with Next.js, Tailwind CSS, and Supabase.

## Setup

### 1. Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project.
2. In the SQL editor, run the contents of `supabase/migrations/0001_init.sql`.
3. Create a Storage bucket named **`covers`**:
   - Dashboard → Storage → New bucket → Name: `covers` → Public: **on**
   - Add these storage policies (SQL editor):

```sql
-- Allow users to upload their own covers
create policy "covers_insert" on storage.objects for insert
  with check (bucket_id = 'covers' and auth.uid()::text = (storage.foldername(name))[1]);

-- Allow public read
create policy "covers_select" on storage.objects for select
  using (bucket_id = 'covers');

-- Allow users to delete their own covers
create policy "covers_delete" on storage.objects for delete
  using (bucket_id = 'covers' and auth.uid()::text = (storage.foldername(name))[1]);
```

4. In Authentication → URL Configuration, add your Vercel URL to **Redirect URLs**:
   - `https://your-app.vercel.app/auth/callback`
   - `http://localhost:3000/auth/callback` (for local dev)

### 2. Local development

```bash
cp .env.local.example .env.local
# Fill in NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
# from Supabase dashboard → Settings → API

npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 3. Deploy to Vercel

```bash
npx vercel
```

Set these environment variables in Vercel dashboard → Settings → Environment Variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 4. Seed data (optional)

Edit `supabase/seed.sql`, replace `YOUR_USER_ID` with your real user id (find it in Supabase → Authentication → Users), uncomment the SQL, and run it in the SQL editor.

## Features

- **Auth** — register, login, logout, reset password, change password
- **Book Search** — Google Books primary, Open Library fallback; import to your library
- **Manual Books** — add books not found in search, with cover image upload
- **Library** — view all your books with search, status/ownership filters, and sorting
- **Book Detail** — track reading status, ownership, start/finish dates
- **Ratings** — rate Plot, Characters, Writing, and Spice (1–5 stars each)
- **Notes** — private notes per book
- **Collections** — group books into named collections (TBR, Romantasy, etc.)
- **Dashboard** — at-a-glance counts and recently added books
