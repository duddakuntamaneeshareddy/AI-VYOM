-- Migration 002: Product detail columns, retailer role, and product reviews
-- Idempotent: safe to re-run. Stays within Supabase free tier (no Realtime, no paid extensions).

-- ============================================================================
-- 1. ALTER products: add description (if missing), specifications, retailer_id
-- ============================================================================
-- Note: 001_init.sql already declares products.description TEXT. We use
-- ADD COLUMN IF NOT EXISTS so this migration is safe whether or not the
-- column already exists, and safe to re-run.
alter table public.products
  add column if not exists description text,
  add column if not exists specifications jsonb not null default '{}'::jsonb,
  add column if not exists retailer_id uuid references public.profiles(id) on delete set null;

comment on column public.products.description is 'Detailed multi-sentence product description shown on the product detail page.';
comment on column public.products.specifications is 'Structured product specs (brand, sku, weight, dimensions, material, color, warranty) stored as JSONB.';
comment on column public.products.retailer_id is 'Optional reference to the profiles row of the retailer who owns this product. NULL for legacy/catalog products.';

create index if not exists idx_products_retailer_id
  on public.products(retailer_id)
  where retailer_id is not null;

-- ============================================================================
-- 2. Extend profiles.role check to allow 'retailer'
-- ============================================================================
-- 001_init.sql declares an inline (auto-named) check: role in ('customer','admin').
-- PostgreSQL auto-names it profiles_role_check. We drop + recreate idempotently
-- inside a DO block with exception handling so it is safe if already updated.
do $$
begin
  alter table public.profiles drop constraint if exists profiles_role_check;
  alter table public.profiles
    add constraint profiles_role_check check (role in ('customer', 'admin', 'retailer'));
exception
  when duplicate_object then null;
  when others then
    raise notice 'profiles_role_check constraint update skipped: %', sqlerrm;
end;
$$;

-- ============================================================================
-- 3. Helper function is_retailer() (mirrors is_admin() exactly)
-- ============================================================================
-- SECURITY DEFINER + set search_path = public to bypass RLS and prevent recursion.
create or replace function public.is_retailer()
returns boolean
language sql
security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'retailer'
  );
$$;

-- ============================================================================
-- 4. CREATE TABLE product_reviews
-- ============================================================================
create table if not exists public.product_reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  comment text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_product_reviews_product_id on public.product_reviews(product_id);
create index if not exists idx_product_reviews_user_id on public.product_reviews(user_id);

comment on table public.product_reviews is 'Customer reviews for products. Realtime is intentionally NOT enabled (Supabase free-tier constraint).';
comment on column public.product_reviews.rating is 'Review rating from 1 (worst) to 5 (best).';

-- ============================================================================
-- 5. RLS on product_reviews
-- ============================================================================
alter table public.product_reviews enable row level security;

-- Public can read all reviews (visible to logged-out visitors on the product page)
drop policy if exists "Public can read all reviews" on public.product_reviews;
create policy "Public can read all reviews" on public.product_reviews
  for select using (true);

-- Authenticated users can insert their own review
drop policy if exists "Users can insert own review" on public.product_reviews;
create policy "Users can insert own review" on public.product_reviews
  for insert with check (auth.uid() = user_id);

-- Users can update their own review
drop policy if exists "Users can update own review" on public.product_reviews;
create policy "Users can update own review" on public.product_reviews
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Users can delete their own review; admins can delete any review
drop policy if exists "Users can delete own review or admin" on public.product_reviews;
create policy "Users can delete own review or admin" on public.product_reviews
  for delete using (auth.uid() = user_id or public.is_admin());

-- ============================================================================
-- 6. Retailer product-management policies on products (additive)
-- ============================================================================
-- Existing policies "Anyone can read products" (SELECT) and "Admins can manage
-- products" (FOR ALL) remain intact. These additive policies grant retailers
-- scoped INSERT/UPDATE/DELETE on rows they own. Multiple matching policies are
-- OR-ed by Postgres, so admin FOR ALL and retailer-specific policies coexist.
drop policy if exists "Retailers can insert own products" on public.products;
create policy "Retailers can insert own products" on public.products
  for insert with check (retailer_id = auth.uid() and public.is_retailer());

drop policy if exists "Retailers can update own products" on public.products;
create policy "Retailers can update own products" on public.products
  for update using (retailer_id = auth.uid() and public.is_retailer())
  with check (retailer_id = auth.uid() and public.is_retailer());

drop policy if exists "Retailers can delete own products" on public.products;
create policy "Retailers can delete own products" on public.products
  for delete using (retailer_id = auth.uid() and public.is_retailer());

-- ============================================================================
-- 7. Backfill existing 15 seeded products with description + specifications
-- ============================================================================
-- Safe to re-run: overwrites with the same values. Names match seed.sql exactly.

update public.products set
  description = 'Premium over-ear headphones featuring hybrid active noise cancellation, 40mm dynamic drivers, and a 30-hour battery life on a single charge. Memory-foam ear cushions provide all-day comfort, while Bluetooth 5.3 with multipoint pairing keeps you connected to two devices at once. A built-in transparency mode lets you hear your surroundings without removing the headset.',
  specifications = '{"brand":"SoundWave","sku":"SW-NC100","weight":"250g","dimensions":"18 x 17 x 8 cm","material":"Aluminum / Memory Foam","color":"Matte Black","warranty":"2 years"}'::jsonb
where name = 'Wireless Noise-Canceling Headphones';

update public.products set
  description = 'A sleek smartwatch with a 1.9-inch always-on AMOLED display, continuous heart-rate and SpO2 monitoring, and built-in GPS tracking. Track over 80 sport modes, receive smartphone notifications, and enjoy a 5-day battery life on a single charge. Water resistance up to 50 meters makes it suitable for swimming and showering.',
  specifications = '{"brand":"PulseTech","sku":"PT-SW7","weight":"38g","dimensions":"44 x 38 x 11 mm","material":"Aluminum / Silicone band","color":"Midnight Blue","warranty":"1 year"}'::jsonb
where name = 'Smart Watch Series 7';

update public.products set
  description = 'Handcrafted from full-grain vegetable-tanned leather, this minimalist backpack features a padded 15-inch laptop compartment, hidden anti-theft pockets, and solid brass hardware. The structured silhouette ages beautifully over time, developing a unique patina. Adjustable shoulder straps ensure all-day carrying comfort.',
  specifications = '{"brand":"Atelier Lane","sku":"AL-MB15","weight":"1.2kg","dimensions":"42 x 30 x 14 cm","material":"Full-grain leather / Brass","color":"Tan","warranty":"1 year"}'::jsonb
where name = 'Minimalist Leather Backpack';

update public.products set
  description = 'Lightweight breathable mesh sneakers engineered for daily runs, featuring a responsive foam midsole and a durable rubber outsole with multi-directional traction lugs. The padded collar and tongue provide a secure, comfortable fit, while reflective accents improve low-light visibility. Designed for neutral runners seeking all-day comfort.',
  specifications = '{"brand":"StridePro","sku":"SP-RN42","weight":"280g","dimensions":"US 7-13 available","material":"Mesh / Rubber / EVA foam","color":"Storm Grey","warranty":"6 months"}'::jsonb
where name = 'Running Performance Sneakers';

update public.products set
  description = 'An elegant ceramic pour-over set including a ribbed dripper and a 600ml carafe, designed for even extraction and heat retention. The minimalist matte glaze complements any kitchen aesthetic, and the ergonomic handle offers a steady, drip-free pour. Compatible with standard size-2 cone filters.',
  specifications = '{"brand":"Brew & Co","sku":"BC-PO600","weight":"700g","dimensions":"15 x 10 x 12 cm","material":"Stoneware ceramic","color":"Matte White","warranty":"1 year"}'::jsonb
where name = 'Ceramic Pour-Over Coffee Set';

update public.products set
  description = 'A voice-controlled smart speaker delivering rich 360-degree room-filling sound with deep bass response. Built-in far-field microphones recognize voice commands from across the room, and the integrated smart home hub controls lights, thermostats, and security devices. Stream music from your favorite services with seamless multi-room audio support.',
  specifications = '{"brand":"NestAudio","sku":"NA-SH1","weight":"820g","dimensions":"14 x 14 x 14 cm","material":"Fabric / Recycled plastic","color":"Chalk","warranty":"1 year"}'::jsonb
where name = 'Smart Home Speaker';

update public.products set
  description = 'A soft, breathable cotton-linen blend throw blanket woven on traditional looms for a textured, natural finish. Perfect for draping over sofas, beds, or armchairs, it provides lightweight warmth year-round. The pre-washed fabric gains softness with every wash without pilling.',
  specifications = '{"brand":"CozyNest","sku":"CN-CL50","weight":"900g","dimensions":"130 x 170 cm","material":"55% Cotton / 45% Linen","color":"Oatmeal","warranty":"No warranty"}'::jsonb
where name = 'Cotton Linen Throw Blanket';

update public.products set
  description = 'A gripping, critically acclaimed novel that weaves together themes of family, memory, and resilience across multiple generations. The prose is both lyrical and propulsive, keeping readers turning pages late into the night. Winner of the National Book Award and a New York Times bestseller.',
  specifications = '{"brand":"Penbridge Press","sku":"PB-FN001","weight":"420g","dimensions":"21 x 14 x 3 cm","material":"Paperback / FSC paper","color":"Cover varies","warranty":"No warranty"}'::jsonb
where name = 'Bestseller Fiction Novel';

update public.products set
  description = 'An eco-friendly TPE yoga mat with a dual-layer non-slip surface and printed alignment guides to support correct posture in every pose. At 6mm thick, it cushions joints during high-impact flows while remaining lightweight enough to carry to the studio. Free from PVC, latex, and toxic dyes.',
  specifications = '{"brand":"ZenFlow","sku":"ZF-YM6","weight":"1.0kg","dimensions":"183 x 61 x 0.6 cm","material":"TPE (Thermoplastic Elastomer)","color":"Sage Green","warranty":"1 year"}'::jsonb
where name = 'Yoga Mat Premium';

update public.products set
  description = 'A space-saving adjustable dumbbell pair that replaces an entire rack, dialing from 5 to 50 pounds per hand in 2.5-pound increments. The quick-select dial locks the plates securely in place, and the contoured ergonomic grip reduces hand fatigue. Ideal for home gyms where floor space is limited.',
  specifications = '{"brand":"IronCore","sku":"IC-AD50","weight":"Varies 5-50 lbs","dimensions":"40 x 20 x 18 cm (each)","material":"Steel / Polypropylene","color":"Black / Silver","warranty":"2 years"}'::jsonb
where name = 'Adjustable Dumbbell Set';

update public.products set
  description = 'A tactile mechanical keyboard with hot-swappable switches, per-key RGB backlighting, and a sturdy aluminum-alloy frame. Pre-lubed linear switches deliver a smooth, quiet typing experience, while the doubleshot PBT keycaps resist shine and wear over time. USB-C and Bluetooth connectivity support up to three paired devices.',
  specifications = '{"brand":"KeyForge","sku":"KF-MK87","weight":"1.1kg","dimensions":"36 x 14 x 4 cm","material":"Aluminum / PBT","color":"Space Gray","warranty":"2 years"}'::jsonb
where name = 'Mechanical Keyboard';

update public.products set
  description = 'A soft, sustainable t-shirt knit from GOTS-certified organic cotton with a relaxed, everyday fit. The mid-weight 220 GSM fabric holds its shape wash after wash, and the reinforced collar resists stretching. Garment-dyed in small batches for a lived-in, slightly heathered finish.',
  specifications = '{"brand":"PureThread","sku":"PT-CT22","weight":"180g","dimensions":"XS-XXL available","material":"100% Organic cotton","color":"Heather Oat","warranty":"No warranty"}'::jsonb
where name = 'Organic Cotton T-Shirt';

update public.products set
  description = 'An ultrasonic essential oil diffuser with a 300ml tank, seven ambient LED light settings, and whisper-quiet operation under 25 decibels. The fine cool-mist output preserves the therapeutic properties of your oils, while the auto-shutoff feature ensures safety when water runs low. Run time up to 10 hours per fill.',
  specifications = '{"brand":"MistLab","sku":"ML-DF300","weight":"380g","dimensions":"16 x 16 x 14 cm","material":"BPA-free Polypropylene","color":"Natural Wood Grain","warranty":"1 year"}'::jsonb
where name = 'Aromatherapy Diffuser';

update public.products set
  description = 'A practical, science-backed guide to building lasting habits and maximizing daily output without burnout. Drawing on research in behavioral psychology and neuroscience, it offers actionable frameworks for goal-setting, focus, and deep work. Includes worksheets and a 30-day implementation plan.',
  specifications = '{"brand":"MindShift Press","sku":"MS-PB30","weight":"390g","dimensions":"21 x 14 x 2.5 cm","material":"Paperback / FSC paper","color":"Cover varies","warranty":"No warranty"}'::jsonb
where name = 'Self-Help Productivity Book';

update public.products set
  description = 'An official size-7 basketball engineered with a high-abrasion composite leather cover for superior grip and durability on both indoor and outdoor courts. The deep-channel design improves ball control and shooting accuracy, while the butyl bladder retains air pressure season after season. NFHS-approved for competitive play.',
  specifications = '{"brand":"CourtKing","sku":"CK-BB7","weight":"620g","dimensions":"Size 7 (29.5 in)","material":"Composite leather / Butyl bladder","color":"Orange / Black","warranty":"1 year"}'::jsonb
where name = 'Basketball Pro';

-- ============================================================================
-- 8. updated_at trigger for product_reviews (intentionally skipped)
-- ============================================================================
-- 001_init.sql has no set_updated_at() trigger function pattern (the orders
-- table also defines updated_at without an auto-update trigger). To avoid
-- scope creep and stay consistent with the existing schema, product_reviews
-- follows the same convention: updated_at defaults to now() on insert and is
-- expected to be maintained by application logic on update. A future migration
-- may add a shared set_updated_at() trigger if desired.
