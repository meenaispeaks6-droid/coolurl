create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index profiles_id_idx on public.profiles(id);

grant select, insert, update, delete on public.profiles to authenticated;
grant all on public.profiles to service_role;

alter table public.profiles enable row level security;
create policy "profiles select own" on public.profiles
  for select to authenticated using (auth.uid() = id);
create policy "profiles insert own" on public.profiles
  for insert to authenticated with check (auth.uid() = id);
create policy "profiles update own" on public.profiles
  for update to authenticated
  using (auth.uid() = id) with check (auth.uid() = id);
create policy "profiles delete own" on public.profiles
  for delete to authenticated using (auth.uid() = id);

create table public.links (
  id text primary key default gen_random_uuid()::text,
  user_id uuid references auth.users(id) on delete cascade,
  slug text not null,
  title text not null default '',
  destination_url text not null,
  clicks_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint links_slug_key unique (slug)
);

create index links_user_created_idx on public.links(user_id, created_at desc);
create index links_slug_idx on public.links(slug);
create index links_user_clicks_idx on public.links(user_id, clicks_count desc);

grant select, insert, update, delete on public.links to authenticated;
grant select, insert, update on public.links to anon;
grant all on public.links to service_role;

alter table public.links enable row level security;

create policy "links select own" on public.links
  for select to authenticated using (auth.uid() = user_id);
create policy "links insert own" on public.links
  for insert to authenticated with check (auth.uid() = user_id);
create policy "links update own" on public.links
  for update to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "links delete own" on public.links
  for delete to authenticated using (auth.uid() = user_id);

create policy "links anon insert" on public.links
  for insert to anon with check (user_id is null);
create policy "links anon select by slug" on public.links
  for select to anon using (true);

create table public.clicks (
  id text primary key default gen_random_uuid()::text,
  link_id text not null references public.links(id) on delete cascade,
  clicked_at timestamptz not null default now(),
  referrer text not null default 'Direct',
  browser text not null default '',
  device text not null default 'desktop' check (device in ('mobile', 'desktop', 'tablet'))
);

create index clicks_link_id_clicked_at_idx on public.clicks(link_id, clicked_at desc);
create index clicks_link_id_referrer_idx on public.clicks(link_id, referrer);
create index clicks_link_id_device_idx on public.clicks(link_id, device);

grant select on public.clicks to authenticated;
grant insert on public.clicks to anon;
grant all on public.clicks to service_role;

alter table public.clicks enable row level security;

create policy "clicks select own link" on public.clicks
  for select to authenticated using (
    exists (
      select 1 from public.links
      where links.id = clicks.link_id
        and links.user_id = auth.uid()
    )
  );
create policy "clicks anon insert" on public.clicks
  for insert to anon with check (true);

create or replace function public.increment_clicks_count()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  update public.links
  set clicks_count = clicks_count + 1,
      updated_at = now()
  where id = new.link_id;
  return new;
end;
$$;

create trigger on_click_inserted
after insert on public.clicks
for each row execute function public.increment_clicks_count();

revoke execute on function public.increment_clicks_count() from public, anon, authenticated;