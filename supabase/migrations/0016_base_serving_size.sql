-- Mitron Thane — QR table ordering
-- 0016_base_serving_size.sql: make every serving size orderable.
--
-- The original seed stored an item's *first* size only as its base price
-- (e.g. Singleton 12 Yo: price 860 with description "30ml", plus a single
-- "Bottle" variant; Caesar Salad: price 450 = Veg, plus "Chicken" and
-- "Prawns" variants). The item screen only offers the variants, so that
-- first size — the 30ml peg, the glass of wine, the Veg / Plain dish — could
-- never be ordered. This adds it as a variant of its own, listed first.
--
-- Safe to run more than once: nothing is added twice.
-- Run after 0015_party_menu.sql, in the Supabase SQL editor.

-- ── 1. All Day drinks: "30ml" / "Glass" base size ─────────────────────────
-- Matches by data, not by id, so it also covers drinks added since the seed.
insert into public.menu_item_variants (menu_item_id, label, price, sort_order)
select i.id, i.description, i.price, -1
from public.menu_items i
join public.categories c on c.id = i.category_id
where c.section in ('Bar', 'Beverages')
  and i.description in ('30ml', 'Glass')
  and exists (select 1 from public.menu_item_variants v where v.menu_item_id = i.id)
  and not exists (
    select 1 from public.menu_item_variants v
    where v.menu_item_id = i.id and lower(v.label) = lower(i.description)
  );

-- The size now shows as a choice, so it no longer needs to be the description.
update public.menu_items i
set description = null
where i.description in ('30ml', 'Glass')
  and exists (
    select 1 from public.menu_item_variants v
    where v.menu_item_id = i.id and v.label = i.description
  );

-- ── 2. Food: the first option named in the dish (Veg, Plain, Paneer, ...) ──
-- Matched by the item's exact name in the Food section.
insert into public.menu_item_variants (menu_item_id, label, price, sort_order)
select i.id, b.label, i.price, -1
from (values
  -- Soups & Salad / Between Breads / Bar Bites
  ('Caesar Salad (Veg / Chicken / Prawns)', 'Veg'),
  ('Micro Burgers (Veg / Chicken)', 'Veg'),
  ('French Fries (Salted / Peri Peri / Truffle / Cheesy)', 'Salted'),
  ('Refried Bean Nachos (Veg / Chicken)', 'Veg'),
  -- Sushi rolls: the base price is the half roll; "8 pcs" is the full roll
  ('Truffle Enoki Roll', '4 pcs'),
  ('Mexican Avocado Roll', '4 pcs'),
  ('Crispy Veg Maki', '4 pcs'),
  ('Crispy Avocado Roll', '4 pcs'),
  ('Avocado & Cream Cheese', '4 pcs'),
  ('Asparagus Tempura Roll', '4 pcs'),
  ('Aburi Salmon Roll', '4 pcs'),
  ('Crab California Roll', '4 pcs'),
  ('Salmon Cream Cheese Roll', '4 pcs'),
  ('Spicy Prawn Tempura Roll', '4 pcs'),
  ('Spicy Tuna Truffle', '4 pcs'),
  ('Assorted Matrix (Veg / Non-Veg)', 'Veg'),
  ('Sushi Boat (Veg / Non-Veg)', 'Veg'),
  -- Dimsum / Asian / Tandoor
  ('Cheung Fun Steam / Crispy (Veg / Chicken / Prawns)', 'Veg'),
  ('Open Faced Bao (Chilli Paneer / Chilli Chicken / Prawns n Chives)', 'Chilli Paneer'),
  ('Assorted Steam Dimsum Basket (Veg / Non-Veg)', 'Veg'),
  ('Asian Chilli (Chicken / Prawns)', 'Chicken'),
  ('Laziz Boti (Chicken / Mutton)', 'Chicken'),
  ('Tandoori Platter (Veg / Non-Veg)', 'Veg'),
  ('Thai Curry Red / Green (Veg / Chicken / Seafood)', 'Veg'),
  ('Sri Lankan Curry (Veg / Chicken / Seafood)', 'Veg'),
  ('Steamed Chicken / River Sole In Smoky Superior Soy', 'Chicken'),
  -- Mains Indian / Breads
  ('Plain / Achari Dal Khichdi', 'Plain'),
  ('Dum Biryani (Veg / Chicken / Mutton)', 'Veg'),
  ('Kadhai Masala (Paneer / Chicken / Mutton)', 'Paneer'),
  ('Tikka Masala (Paneer / Chicken)', 'Paneer'),
  ('Nihari (Chicken / Mutton)', 'Chicken'),
  ('Naan (Plain / Butter Garlic / Cheese)', 'Plain'),
  ('Kulcha (Plain / Aloo / Paneer)', 'Plain'),
  ('Tandoori Roti (Plain / Butter)', 'Plain'),
  ('Khamiri Roti (Plain / Butter)', 'Plain')
) as b(item_name, label)
join public.menu_items i on i.name = b.item_name
join public.categories c on c.id = i.category_id and c.section = 'Food'
where exists (select 1 from public.menu_item_variants v where v.menu_item_id = i.id)
  and not exists (
    select 1 from public.menu_item_variants v
    where v.menu_item_id = i.id and lower(v.label) = lower(b.label)
  );
