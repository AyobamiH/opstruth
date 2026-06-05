create table public.agent_jobs (
  id uuid primary key,
  status text not null
);

alter table public.agent_jobs enable row level security;

create policy "read own jobs"
on public.agent_jobs
for select
using (true);
