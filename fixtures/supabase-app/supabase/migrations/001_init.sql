create table agent_jobs (id uuid primary key);
alter table agent_jobs enable row level security;
create policy "read own jobs" on agent_jobs for select using (true);
