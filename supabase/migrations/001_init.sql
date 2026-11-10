-- Profiles table (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  created_at timestamptz not null default now()
);

-- Products
create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price numeric(10,2) not null,
  category text not null,
  image_url text,
  stock integer not null default 0,
  tags text[] default '{}',
  created_at timestamptz not null default now()
);

-- Orders
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles on delete cascade not null,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  total numeric(10,2) not null,
  shipping_address jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Order items
create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders on delete cascade not null,
  product_id uuid references public.products on delete cascade not null,
  quantity integer not null,
  price_at_purchase numeric(10,2) not null
);

-- Cart
create table public.cart (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles on delete cascade not null,
  product_id uuid references public.products on delete cascade not null,
  quantity integer not null default 1,
  added_at timestamptz not null default now()
);

-- Returns
create table public.returns (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders on delete cascade not null,
  order_item_id uuid references public.order_items on delete cascade not null,
  user_id uuid references public.profiles on delete cascade not null,
  reason text not null,
  ai_analysis jsonb,
  status text not null default 'pending' check (status in ('pending', 'reviewed', 'approved', 'declined', 'processed')),
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

-- Notifications
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles on delete cascade,
  type text not null check (type in ('cart_abandonment', 'delivery', 'engagement', 'campaign')),
  channel text not null check (channel in ('email', 'in_app')),
  content jsonb not null,
  status text not null default 'pending' check (status in ('pending', 'sent', 'failed')),
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

-- Email templates
create table public.email_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  subject text not null,
  body text not null,
  type text not null check (type in ('cart_abandonment', 'delivery', 'retention', 'return_update')),
  created_at timestamptz not null default now()
);

-- Campaigns
create table public.campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  template_id uuid references public.email_templates,
  target_segment text not null default 'all' check (target_segment in ('all', 'cart_abandoners', 'recent_buyers')),
  status text not null default 'draft' check (status in ('draft', 'sent')),
  sent_count integer default 0,
  created_at timestamptz not null default now(),
  sent_at timestamptz
);

-- Chat logs
create table public.chat_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles on delete cascade,
  mode text not null check (mode in ('text', 'voice')),
  messages jsonb not null default '[]',
  created_at timestamptz not null default now()
);

-- Voice logs
create table public.voice_logs (
  id uuid primary key default gen_random_uuid(),
  chat_log_id uuid references public.chat_logs on delete cascade,
  duration_seconds integer,
  stt_text text,
  tts_audio_url text,
  created_at timestamptz not null default now()
);

-- Indexes
create index idx_products_category on public.products(category);
create index idx_products_tags on public.products using gin(tags);
create index idx_orders_user_id on public.orders(user_id);
create index idx_orders_status on public.orders(status);
create index idx_order_items_order_id on public.order_items(order_id);
create index idx_cart_user_id on public.cart(user_id);
create index idx_returns_user_id on public.returns(user_id);
create index idx_returns_status on public.returns(status);
create index idx_notifications_user_id on public.notifications(user_id);
create index idx_notifications_type on public.notifications(type);
create index idx_chat_logs_user_id on public.chat_logs(user_id);

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.cart enable row level security;
alter table public.returns enable row level security;
alter table public.notifications enable row level security;
alter table public.campaigns enable row level security;
alter table public.email_templates enable row level security;
alter table public.chat_logs enable row level security;
alter table public.voice_logs enable row level security;

-- Admin check function (bypasses RLS to prevent recursion)
create or replace function public.is_admin()
returns boolean
language sql
security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- RLS Policies
-- Profiles: users can read/update own, admins can read all
create policy "Users can read own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Admins can read all profiles" on public.profiles for select using (public.is_admin());

-- Products: public read, admin write
create policy "Anyone can read products" on public.products for select using (true);
create policy "Admins can manage products" on public.products for all using (public.is_admin());

-- Orders: users can read own, admin can read all
create policy "Users can read own orders" on public.orders for select using (auth.uid() = user_id);
create policy "Users can create own orders" on public.orders for insert with check (auth.uid() = user_id);
create policy "Admins can manage orders" on public.orders for all using (public.is_admin());

-- Order items: users can read own (via order), admin all
create policy "Users can read own order items" on public.order_items for select using (exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));
create policy "Users can create own order items" on public.order_items for insert with check (exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));
create policy "Admins can manage order items" on public.order_items for all using (public.is_admin());

-- Cart: users can manage own
create policy "Users can read own cart" on public.cart for select using (auth.uid() = user_id);
create policy "Users can insert own cart" on public.cart for insert with check (auth.uid() = user_id);
create policy "Users can update own cart" on public.cart for update using (auth.uid() = user_id);
create policy "Users can delete own cart" on public.cart for delete using (auth.uid() = user_id);

-- Returns: users can read/create own, admin can manage all
create policy "Users can read own returns" on public.returns for select using (auth.uid() = user_id);
create policy "Users can create own returns" on public.returns for insert with check (auth.uid() = user_id);
create policy "Admins can manage returns" on public.returns for all using (public.is_admin());

-- Notifications: users can read own, admin can manage all
create policy "Users can read own notifications" on public.notifications for select using (auth.uid() = user_id);
create policy "Admins can manage notifications" on public.notifications for all using (public.is_admin());

-- Campaigns: admin only
create policy "Admins can manage campaigns" on public.campaigns for all using (public.is_admin());

-- Email templates: admin only
create policy "Admins can manage email templates" on public.email_templates for all using (public.is_admin());

-- Chat logs: users can read/insert own
create policy "Users can read own chat logs" on public.chat_logs for select using (auth.uid() = user_id or user_id is null);
create policy "Users can insert own chat logs" on public.chat_logs for insert with check (auth.uid() = user_id or user_id is null);

-- Voice logs: users can read own (via chat log)
create policy "Users can read own voice logs" on public.voice_logs for select using (exists (select 1 from public.chat_logs c where c.id = chat_log_id and (c.user_id = auth.uid() or c.user_id is null)));
create policy "Users can insert own voice logs" on public.voice_logs for insert with check (exists (select 1 from public.chat_logs c where c.id = chat_log_id and (c.user_id = auth.uid() or c.user_id is null)));

-- Trigger to auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
