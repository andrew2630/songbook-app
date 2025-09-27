-- Enable full-text search on songs by aggregating title and lyrics.
-- This script adds a generated tsvector column and index for performant lookups.

alter table if exists public."songsHeaders"
  add column if not exists search_vector tsvector generated always as (
    setweight(to_tsvector('simple', coalesce(title, '')), 'A')
  ) stored;

alter table if exists public."songsItems"
  add column if not exists search_vector tsvector generated always as (
    to_tsvector('simple', coalesce(text, ''))
  ) stored;

create index if not exists songs_headers_search_idx
  on public."songsHeaders" using gin (search_vector);

create index if not exists songs_items_search_idx
  on public."songsItems" using gin (search_vector);

create materialized view if not exists public."songs_fts" as
select
  h.id,
  h.language,
  h.title,
  h.page,
  h.externalIndex,
  h.source,
  h.isPublic,
  h.version,
  h.search_vector || coalesce(string_agg(i.search_vector, ' '::tsvector), to_tsvector('simple', '')) as document
from public."songsHeaders" h
left join public."songsItems" i on h.id = i.id and h.language = i.language
where h.isPublic = true
group by h.id, h.language, h.title, h.page, h.externalIndex, h.source, h.isPublic, h.version, h.search_vector;

create index if not exists songs_fts_document_idx
  on public."songs_fts" using gin (document);

create or replace function public.search_songs(query text, lang public.lang2)
returns table (
  id integer,
  language public.lang2,
  title text,
  page integer,
  external_index text,
  source public.song_source,
  rank real
) as $$
  select
    id,
    language,
    title,
    page,
    externalIndex,
    source,
    ts_rank(document, plainto_tsquery('simple', query)) as rank
  from public."songs_fts"
  where language = lang and document @@ plainto_tsquery('simple', query)
  order by rank desc, page asc;
$$ language sql stable;
