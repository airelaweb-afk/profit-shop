-- Luna Oficio · esquema inicial
-- Cuentas reales, socios Pro y panel de administración sobre Supabase.
-- Los PDF e imágenes siguen procesándose en el navegador: aquí no se guarda ningún archivo.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Correos que entran como administradores en cuanto se registran.
-- ---------------------------------------------------------------------------
create table if not exists public.admin_allowlist (
  email text primary key,
  added_at timestamptz not null default now()
);

insert into public.admin_allowlist (email)
values ('airelaweb@gmail.com')
on conflict (email) do nothing;

-- ---------------------------------------------------------------------------
-- Perfiles (uno por usuario de auth.users)
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  name text not null default '',
  is_admin boolean not null default false,
  pro_until timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_email_idx on public.profiles (lower(email));
create index if not exists profiles_created_idx on public.profiles (created_at desc);

-- ---------------------------------------------------------------------------
-- Socios Pro: cada cobro registrado (Stripe automático o alta manual)
-- ---------------------------------------------------------------------------
create table if not exists public.memberships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete set null,
  email text not null,
  name text not null default '',
  method text not null default 'stripe'
    check (method in ('stripe', 'revolut', 'bizum', 'transferencia', 'otro')),
  amount_cents integer not null default 2900 check (amount_cents >= 0),
  currency text not null default 'eur',
  months integer not null default 12 check (months between 1 and 120),
  starts_at timestamptz not null default now(),
  expires_at timestamptz not null,
  status text not null default 'activo'
    check (status in ('activo', 'revocado', 'reembolsado')),
  source text not null default 'admin' check (source in ('admin', 'stripe')),
  stripe_session_id text unique,
  stripe_payment_intent text,
  stripe_customer_id text,
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists memberships_user_idx on public.memberships (user_id);
create index if not exists memberships_email_idx on public.memberships (lower(email));
create index if not exists memberships_expires_idx on public.memberships (expires_at desc);
create index if not exists memberships_pi_idx on public.memberships (stripe_payment_intent);

-- ---------------------------------------------------------------------------
-- Notas del administrador (pendientes, recordatorios)
-- ---------------------------------------------------------------------------
create table if not exists public.admin_notes (
  id uuid primary key default gen_random_uuid(),
  text text not null,
  done boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select p.is_admin from public.profiles p where p.id = auth.uid()),
    false
  );
$$;

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Recalcula profiles.pro_until a partir de los cobros activos del usuario.
create or replace function public.refresh_pro_until(p_user uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_user is null then
    return;
  end if;
  update public.profiles
  set pro_until = (
    select max(m.expires_at)
    from public.memberships m
    where m.user_id = p_user and m.status = 'activo'
  )
  where id = p_user;
end;
$$;

-- ---------------------------------------------------------------------------
-- Triggers
-- ---------------------------------------------------------------------------

-- Nuevo usuario → perfil, admin si está en la lista, y enlaza cobros previos por correo.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text := lower(coalesce(new.email, ''));
  v_name text := coalesce(new.raw_user_meta_data ->> 'name', '');
begin
  insert into public.profiles (id, email, name, is_admin)
  values (
    new.id,
    v_email,
    v_name,
    exists (select 1 from public.admin_allowlist a where lower(a.email) = v_email)
  )
  on conflict (id) do update
    set email = excluded.email,
        name = case when excluded.name <> '' then excluded.name else public.profiles.name end;

  update public.memberships
  set user_id = new.id
  where user_id is null and lower(email) = v_email;

  perform public.refresh_pro_until(new.id);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Si el usuario cambia de correo en auth, el perfil lo sigue.
create or replace function public.handle_user_email_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.email is distinct from old.email then
    update public.profiles set email = lower(new.email) where id = new.id;
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_updated on auth.users;
create trigger on_auth_user_updated
  after update of email on auth.users
  for each row execute function public.handle_user_email_change();

-- Un usuario normal no puede tocar is_admin ni pro_until de su perfil.
create or replace function public.protect_profile_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() and auth.uid() is not null then
    new.is_admin := old.is_admin;
    new.pro_until := old.pro_until;
    new.email := old.email;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_protect on public.profiles;
create trigger profiles_protect
  before update on public.profiles
  for each row execute function public.protect_profile_fields();

drop trigger if exists profiles_touch on public.profiles;
create trigger profiles_touch
  before update on public.profiles
  for each row execute function public.touch_updated_at();

-- Cada cambio en un cobro recalcula el Pro del usuario (y enlaza por correo si falta).
create or replace function public.memberships_after_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'DELETE' then
    perform public.refresh_pro_until(old.user_id);
    return old;
  end if;
  if new.user_id is null then
    select p.id into new.user_id
    from public.profiles p
    where lower(p.email) = lower(new.email)
    limit 1;
    if new.user_id is not null then
      update public.memberships set user_id = new.user_id where id = new.id;
    end if;
  end if;
  perform public.refresh_pro_until(new.user_id);
  if tg_op = 'UPDATE' and old.user_id is distinct from new.user_id then
    perform public.refresh_pro_until(old.user_id);
  end if;
  return new;
end;
$$;

drop trigger if exists memberships_refresh on public.memberships;
create trigger memberships_refresh
  after insert or update or delete on public.memberships
  for each row execute function public.memberships_after_change();

drop trigger if exists memberships_touch on public.memberships;
create trigger memberships_touch
  before update on public.memberships
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.admin_allowlist enable row level security;
alter table public.profiles enable row level security;
alter table public.memberships enable row level security;
alter table public.admin_notes enable row level security;

drop policy if exists "allowlist admin read" on public.admin_allowlist;
create policy "allowlist admin read" on public.admin_allowlist
  for select using (public.is_admin());

drop policy if exists "profiles read own or admin" on public.profiles;
create policy "profiles read own or admin" on public.profiles
  for select using (id = auth.uid() or public.is_admin());

drop policy if exists "profiles update own or admin" on public.profiles;
create policy "profiles update own or admin" on public.profiles
  for update using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

drop policy if exists "memberships read own or admin" on public.memberships;
create policy "memberships read own or admin" on public.memberships
  for select using (user_id = auth.uid() or public.is_admin());

drop policy if exists "memberships admin write" on public.memberships;
create policy "memberships admin write" on public.memberships
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "notes admin" on public.admin_notes;
create policy "notes admin" on public.admin_notes
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- RPC para el panel de administración
-- ---------------------------------------------------------------------------

create or replace function public.admin_stats()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  result jsonb;
begin
  if not public.is_admin() then
    raise exception 'solo administradores' using errcode = '42501';
  end if;

  select jsonb_build_object(
    'users_total', (select count(*) from public.profiles),
    'users_7d', (select count(*) from public.profiles where created_at > now() - interval '7 days'),
    'users_30d', (select count(*) from public.profiles where created_at > now() - interval '30 days'),
    'pro_active', (select count(*) from public.profiles where pro_until > now()),
    'pro_expiring_30d', (
      select count(*) from public.profiles
      where pro_until > now() and pro_until <= now() + interval '30 days'
    ),
    'memberships_total', (select count(*) from public.memberships),
    'memberships_unlinked', (select count(*) from public.memberships where user_id is null and status = 'activo'),
    'revenue_cents', (
      select coalesce(sum(amount_cents), 0) from public.memberships where status <> 'reembolsado'
    ),
    'revenue_30d_cents', (
      select coalesce(sum(amount_cents), 0) from public.memberships
      where status <> 'reembolsado' and starts_at > now() - interval '30 days'
    ),
    'stripe_count', (select count(*) from public.memberships where source = 'stripe'),
    'last_signup_at', (select max(created_at) from public.profiles),
    'last_payment_at', (select max(starts_at) from public.memberships)
  ) into result;

  return result;
end;
$$;

create or replace function public.admin_list_users(
  p_search text default '',
  p_limit integer default 50,
  p_offset integer default 0
)
returns table (
  id uuid,
  email text,
  name text,
  is_admin boolean,
  pro_until timestamptz,
  created_at timestamptz,
  last_sign_in_at timestamptz,
  email_confirmed_at timestamptz,
  memberships_count bigint
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'solo administradores' using errcode = '42501';
  end if;

  return query
  select
    p.id,
    p.email,
    p.name,
    p.is_admin,
    p.pro_until,
    p.created_at,
    u.last_sign_in_at,
    u.email_confirmed_at,
    (select count(*) from public.memberships m where m.user_id = p.id) as memberships_count
  from public.profiles p
  left join auth.users u on u.id = p.id
  where p_search = ''
     or p.email ilike '%' || p_search || '%'
     or p.name ilike '%' || p_search || '%'
  order by p.created_at desc
  limit greatest(1, least(p_limit, 200))
  offset greatest(0, p_offset);
end;
$$;

-- Alta manual de un socio (pago visto en Stripe/Revolut/Bizum). Amplía el Pro
-- desde la fecha de caducidad actual si todavía está vigente.
create or replace function public.admin_grant_pro(
  p_email text,
  p_name text default '',
  p_method text default 'stripe',
  p_amount_cents integer default 2900,
  p_months integer default 12,
  p_paid_at timestamptz default now(),
  p_notes text default ''
)
returns public.memberships
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid;
  v_current timestamptz;
  v_start timestamptz;
  v_row public.memberships;
begin
  if not public.is_admin() then
    raise exception 'solo administradores' using errcode = '42501';
  end if;
  if p_email is null or position('@' in p_email) = 0 then
    raise exception 'correo no válido';
  end if;

  select id, pro_until into v_user, v_current
  from public.profiles
  where lower(email) = lower(trim(p_email))
  limit 1;

  v_start := greatest(coalesce(p_paid_at, now()), coalesce(v_current, '-infinity'::timestamptz));
  if v_start = '-infinity'::timestamptz then
    v_start := now();
  end if;

  insert into public.memberships (
    user_id, email, name, method, amount_cents, months, starts_at, expires_at, notes, source
  ) values (
    v_user,
    lower(trim(p_email)),
    coalesce(p_name, ''),
    coalesce(p_method, 'stripe'),
    coalesce(p_amount_cents, 2900),
    coalesce(p_months, 12),
    coalesce(p_paid_at, now()),
    v_start + make_interval(months => coalesce(p_months, 12)),
    coalesce(p_notes, ''),
    'admin'
  )
  returning * into v_row;

  return v_row;
end;
$$;

create or replace function public.admin_set_admin(p_user uuid, p_admin boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'solo administradores' using errcode = '42501';
  end if;
  if p_user = auth.uid() and not p_admin then
    raise exception 'no puedes quitarte el acceso a ti mismo';
  end if;
  update public.profiles set is_admin = p_admin where id = p_user;
end;
$$;

-- Lo que el propio usuario ve en /cuenta: su Pro y sus cobros.
create or replace function public.my_memberships()
returns setof public.memberships
language sql
stable
security invoker
set search_path = public
as $$
  select * from public.memberships
  where user_id = auth.uid()
  order by starts_at desc;
$$;

-- Permisos de ejecución
revoke all on function public.admin_stats() from public, anon, authenticated;
revoke all on function public.admin_list_users(text, integer, integer) from public, anon, authenticated;
revoke all on function public.admin_grant_pro(text, text, text, integer, integer, timestamptz, text) from public, anon, authenticated;
revoke all on function public.admin_set_admin(uuid, boolean) from public, anon, authenticated;
revoke all on function public.refresh_pro_until(uuid) from public, anon, authenticated;

grant execute on function public.is_admin() to authenticated, anon;
grant execute on function public.admin_stats() to authenticated;
grant execute on function public.admin_list_users(text, integer, integer) to authenticated;
grant execute on function public.admin_grant_pro(text, text, text, integer, integer, timestamptz, text) to authenticated;
grant execute on function public.admin_set_admin(uuid, boolean) to authenticated;
grant execute on function public.my_memberships() to authenticated;
