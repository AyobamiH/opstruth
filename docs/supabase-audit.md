# Supabase Static Audit

opstruth's Supabase check is a static safety audit. It does not connect to Supabase and does not mutate a database.

## What It Detects

- `supabase/migrations`
- SQL migration files
- `create policy`
- row-level security statements
- `grant` / `revoke`
- `security definer`
- frontend `.from("table")` usage for protected tables
- frontend `insert`, `update`, `delete`, and `upsert` calls

## What It Proves

It can prove that local migration and frontend files contain certain patterns.

It can warn when:

- migrations do not show obvious RLS policy statements
- protected table names appear in frontend code
- frontend write calls are present

## What It Does Not Prove

- live database permissions
- deployed policy state
- current Supabase dashboard settings
- whether migrations were actually applied
- whether a service-role key is stored safely outside the repo

## Protected Tables

Default protected table names include:

```text
agent_jobs
platform_credentials
worker_logs
```

Future config can expand this through `opstruth.config.json`.

## Next Safe Step

Treat Supabase findings as a static review queue. Confirm live permissions with a separate live audit when database safety matters.
