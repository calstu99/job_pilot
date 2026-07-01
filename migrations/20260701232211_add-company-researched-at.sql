ALTER TABLE public.jobs
ADD COLUMN company_researched_at timestamptz;

CREATE INDEX jobs_user_id_company_researched_at_idx
ON public.jobs (user_id, company_researched_at DESC)
WHERE company_researched_at IS NOT NULL;

GRANT UPDATE (company_researched_at) ON public.jobs TO authenticated;
