create extension if not exists pgcrypto;

create table if not exists public.analyses (
  id uuid primary key default gen_random_uuid(),
  external_id text unique,
  status text not null default 'draft',
  source_url text,
  analysis_mode text not null default 'standard',
  project_category text not null default '공공 SI',
  owner_id uuid,
  project jsonb not null default '{}'::jsonb,
  estimation jsonb not null default '{}'::jsonb,
  package_summary jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.analysis_files (
  id uuid primary key default gen_random_uuid(),
  analysis_id uuid not null references public.analyses(id) on delete cascade,
  file_name text not null,
  storage_path text,
  mime_type text,
  checksum text,
  parser_status text not null default 'uploaded',
  page_count integer,
  uploaded_at timestamptz not null default now()
);

create table if not exists public.evidence_refs (
  id uuid primary key default gen_random_uuid(),
  analysis_id uuid not null references public.analyses(id) on delete cascade,
  file_id uuid references public.analysis_files(id) on delete set null,
  anchor text not null,
  page_number integer,
  quote text not null,
  confidence numeric(4, 3) not null default 1.000,
  created_at timestamptz not null default now()
);

create table if not exists public.requirements (
  id uuid primary key default gen_random_uuid(),
  analysis_id uuid not null references public.analyses(id) on delete cascade,
  requirement_key text not null,
  title text not null,
  category text not null,
  mandatory boolean not null default true,
  included boolean not null default true,
  source text not null default 'parser',
  review_required boolean not null default false,
  estimate jsonb not null default '{}'::jsonb,
  evidence jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  unique (analysis_id, requirement_key)
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  analysis_id uuid not null references public.analyses(id) on delete cascade,
  language text not null default 'ko',
  version integer not null default 1,
  markdown text not null,
  email_draft text not null,
  generated_by text not null default 'moli',
  generated_at timestamptz not null default now(),
  unique (analysis_id, version)
);

create table if not exists public.share_links (
  id uuid primary key default gen_random_uuid(),
  analysis_id uuid not null references public.analyses(id) on delete cascade,
  token_hash text not null unique,
  permission text not null default 'view',
  expires_at timestamptz not null,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.audit_events (
  id uuid primary key default gen_random_uuid(),
  analysis_id uuid references public.analyses(id) on delete set null,
  actor_id uuid,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.historical_projects (
  id uuid primary key default gen_random_uuid(),
  project_name text not null,
  project_category text not null,
  total_mm numeric(8, 2) not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists analyses_status_idx on public.analyses(status);
create index if not exists analysis_files_analysis_id_idx on public.analysis_files(analysis_id);
create index if not exists evidence_refs_analysis_id_idx on public.evidence_refs(analysis_id);
create index if not exists requirements_analysis_id_idx on public.requirements(analysis_id);
create index if not exists reports_analysis_id_idx on public.reports(analysis_id);
create index if not exists share_links_analysis_id_idx on public.share_links(analysis_id);
create index if not exists audit_events_analysis_id_idx on public.audit_events(analysis_id);
create index if not exists historical_projects_category_idx on public.historical_projects(project_category);

alter table public.analyses enable row level security;
alter table public.analysis_files enable row level security;
alter table public.evidence_refs enable row level security;
alter table public.requirements enable row level security;
alter table public.reports enable row level security;
alter table public.share_links enable row level security;
alter table public.audit_events enable row level security;
alter table public.historical_projects enable row level security;

grant usage on schema public to service_role;
grant select, insert, update, delete on public.analyses, public.analysis_files, public.evidence_refs, public.requirements, public.reports, public.share_links, public.audit_events, public.historical_projects to service_role;
grant usage, select on all sequences in schema public to service_role;

drop policy if exists "service role manages analyses" on public.analyses;
create policy "service role manages analyses" on public.analyses for all to service_role using (true) with check (true);

drop policy if exists "service role manages analysis files" on public.analysis_files;
create policy "service role manages analysis files" on public.analysis_files for all to service_role using (true) with check (true);

drop policy if exists "service role manages evidence refs" on public.evidence_refs;
create policy "service role manages evidence refs" on public.evidence_refs for all to service_role using (true) with check (true);

drop policy if exists "service role manages requirements" on public.requirements;
create policy "service role manages requirements" on public.requirements for all to service_role using (true) with check (true);

drop policy if exists "service role manages reports" on public.reports;
create policy "service role manages reports" on public.reports for all to service_role using (true) with check (true);

drop policy if exists "service role manages share links" on public.share_links;
create policy "service role manages share links" on public.share_links for all to service_role using (true) with check (true);

drop policy if exists "service role manages audit events" on public.audit_events;
create policy "service role manages audit events" on public.audit_events for all to service_role using (true) with check (true);

drop policy if exists "service role manages historical projects" on public.historical_projects;
create policy "service role manages historical projects" on public.historical_projects for all to service_role using (true) with check (true);
