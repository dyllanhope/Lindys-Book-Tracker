-- Seed data for Book Tracker
-- Replace YOUR_USER_ID with your actual auth.users id after first signup.
-- Find it in Supabase dashboard → Authentication → Users.

-- DO $$
-- DECLARE
--   uid uuid := 'YOUR_USER_ID';
-- BEGIN

-- Sample books
-- INSERT INTO books (user_id, title, author, series, isbn, description, external_source, reading_status, owned) VALUES
--   (uid, 'The Name of the Wind', 'Patrick Rothfuss', 'The Kingkiller Chronicle', '9780756404741', 'A tale of the magically gifted young man who grows to be the most notorious wizard his world has ever seen.', 'manual', 'finished', true),
--   (uid, 'A Court of Thorns and Roses', 'Sarah J. Maas', 'A Court of Thorns and Roses', '9781619634442', 'A huntress who kills a wolf in the woods and is dragged to a magical land as punishment.', 'manual', 'finished', true),
--   (uid, 'The Way of Kings', 'Brandon Sanderson', 'The Stormlight Archive', '9780765326355', 'An epic fantasy tale set in a world of storms and shattered plains.', 'manual', 'currently_reading', true),
--   (uid, 'Iron Flame', 'Rebecca Yarros', 'The Empyrean', '9781649374172', 'The second book in The Empyrean series.', 'manual', 'not_started', false),
--   (uid, 'Babel', 'R.F. Kuang', null, '9780063021433', 'A dark academia novel about the magic of language and the violence of colonialism.', 'manual', 'finished', true);

-- Sample collections
-- INSERT INTO collections (user_id, name) VALUES
--   (uid, 'TBR'),
--   (uid, 'Romantasy'),
--   (uid, 'Favourites');

-- END $$;
