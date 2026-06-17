-- One-time cleanup: books imported before the HTML-stripping fix stored Google
-- Books descriptions as raw HTML (<b>, <i>, <br>, &amp; …). This mirrors the
-- htmlToText() helper so existing rows read as clean prose. Idempotent: the
-- regexes/replaces are no-ops on already-clean text.

-- 1. <br> variants -> newline
update books
set description = regexp_replace(description, '<\s*br\s*/?\s*>', E'\n', 'gi')
where description is not null;

-- 2. Block-level closing tags -> newline
update books
set description = regexp_replace(description, '</\s*(p|div|li|h[1-6])\s*>', E'\n', 'gi')
where description is not null;

-- 3. Strip all remaining tags
update books
set description = regexp_replace(description, '<[^>]+>', '', 'g')
where description is not null;

-- 4. Decode common entities (&amp; last so it can't double-decode)
update books
set description =
  replace(
  replace(
  replace(
  replace(
  replace(
  replace(
  replace(
  replace(
  replace(
  replace(
  replace(
    description,
    '&#39;', ''''),
    '&apos;', ''''),
    '&#34;', '"'),
    '&quot;', '"'),
    '&#160;', ' '),
    '&nbsp;', ' '),
    '&#8217;', '’'),
    '&#8216;', '‘'),
    '&#8211;', '–'),
    '&lt;', '<'),
    '&gt;', '>')
where description is not null;

-- &amp; decoded separately/last
update books
set description = replace(description, '&amp;', '&')
where description is not null;

-- 5. Collapse trailing spaces before newlines, 3+ newlines -> 2, then trim
update books
set description = btrim(
  regexp_replace(
    regexp_replace(description, '[ \t]+\n', E'\n', 'g'),
    E'\n{3,}', E'\n\n', 'g'
  )
)
where description is not null;
