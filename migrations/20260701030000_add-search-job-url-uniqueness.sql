CREATE UNIQUE INDEX jobs_user_search_source_url_key
ON public.jobs (user_id, source_url)
WHERE source = 'search' AND source_url IS NOT NULL;
