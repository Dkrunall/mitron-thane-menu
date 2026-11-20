// Mitron Thane — QR table ordering
// Generates supabase/migrations/0015_party_menu.sql: the Party beverage
// menu (transcribed from "BEVERAGE MENU.pdf" / "FINAL NY MENU MITRON
// THANE-2026.xlsx", which list the same 130 drinks at the same prices),
// plus the schema + setting that switches customers between the All Day
// and Party beverage menus. Food is never affected by the switch.
//
// Run with: node scripts/generate-party-menu-sql.js
//
// IDs are derived from a hash of the category/item name, so re-running
// produces identical SQL and the migration can be applied more than once
// (every insert is `on conflict (id) do nothing`).

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const OUT = path.join(__dirname, '..', 'supabase', 'migrations', '0015_party_menu.sql');

// ── item builders ────────────────────────────────────────────────────────
// Every row: { name, description, alcoholic, sizes: [[label, price], ...] }.
// One size -> plain item priced at it, with the size (e.g. "Pint") as its
// description. Several sizes -> one variant per size (the customer picks
// on the item screen), item price = the cheapest, used for "From ₹...".
const one = (name, price, description, alcoholic = true) => ({ name, description, alcoholic, sizes: [[null, price]] });
const sized = (label) => (name, price) => ({ name, description: label, alcoholic: true, sizes: [[null, price]] });
const glassBottle = (name, glass, bottle) => ({ name, description: null, alcoholic: true, sizes: [['Glass', glass], ['Bottle', bottle]] });
const pegBottle = (name, peg, bottle) => ({ name, description: null, alcoholic: true, sizes: [['30ml', peg], ['Bottle', bottle]] });
const pint = sized('Pint');
const bottle = sized('Bottle');
const soft = (name, price) => one(name, price, null, false);

// [section, category name (as headed in the PDF), sort_order (PDF order),
// All Day category whose cover photo it reuses, items]. Names, prices and
// serving sizes are exactly as printed in the PDF; the only change is
// "Can liit", which is the Cranberry Liit (its "canberry" typo fixed too).
const DATA = [
  ['Bar', 'Long Island Iced Tea', 17, 'Long Island Iced Tea', [
    one('Hawaiian Liit', 999, 'White Rum, Dark Rum, Spice Rum, Herbal Liq, Ginger, Pineapple'),
    one('Floral Liit', 999, 'Five White Spirits, Orange, Lavender, Tonic Water'),
    one('Last Call', 999, 'Whisky, Dark Rum, Tequila, Lime, Aromatic Tea, Beer'),
    one('Liit', 999, 'Five White Spirits, Lime, Coke'),
    one('Jager Liit', 1150, 'Five White Spirits, Jager, Top up with Red bull'),
    one('Cranberry Liit', 999, 'Five White Spirit, cranberry juice, lime juice Top'),
  ]],
  ['Bar', 'Shots', 18, 'Shots', [
    one('Kamikaze', 500, 'Vodka, Orange Liq, Lime'),
    one('B-52', 799, 'Baileys, Kahlua, Orange Liq'),
    one('Jager bomb', 1099, 'Jagermiester, Red Bull Energy Drink'),
    one('Jagerbeer Boom', 1125, 'Jagermeister & Beer'),
  ]],
  ['Bar', "Beer'S", 19, 'Beer', [
    pint('Tuborg Green', 380),
    pint('Kingfisher Ultra', 390),
    pint('Carlsberg', 380),
    pint('Carlsberg Elephant', 400),
    pint('Budweiser', 450),
    pint('Budweiser Magnum', 500),
    pint('Corona Extra', 700),
    pint('Hoegaarden', 620),
  ]],
  ['Bar', 'Breezers', 20, 'Breezer', [
    pint('Breezer Cranberry', 495),
    pint('Breezer Jamaican Passion', 495),
  ]],
  ['Bar', 'Red Wine', 21, 'Red Wine', [
    glassBottle('Fratelli Classic Shiraz', 605, 2650),
    glassBottle('Fratelli Shiraz Rose', 605, 2650),
    glassBottle("Jacob'S Creek Classic Shiraz", 1080, 5180),
    glassBottle('Campo Viejo Rioja Tempranillo', 1475, 7150),
    glassBottle('Mateus Rose', 1890, 8600),
    glassBottle('Brancott Estate Pinot Noir', 1890, 8600),
  ]],
  ['Bar', 'White Wine', 22, 'White Wine', [
    glassBottle('Fratelli Classic Chenin Wine', 605, 2656),
    glassBottle("Jacob'S Creek Classic Chardonnay", 1080, 5185),
    glassBottle('Two Ocean Chardonnay Wine', 1205, 5300),
    glassBottle('Campo Viejo Rioja Viura', 1475, 7150),
    glassBottle('Brancott Estate Sauvignon Blanc', 1770, 8250),
  ]],
  ['Bar', 'Sparkling Wine and Champagne', 23, 'Sparkling Wine & Champagne', [
    bottle('Fratelli Noi Sparkling', 3756),
    bottle('Chandon Brut', 6250),
    bottle('Chandon Brut Rose', 7260),
    bottle('Moet Chandon Brut Imperial', 24200),
    bottle('Moet Chandon Imperial Ice', 25410),
    bottle('Dom Perignon', 62920),
  ]],
  ['Bar', 'Single Malt', 24, 'Single Malt', [
    pegBottle('Singleton 12', 945, 21540),
    pegBottle('Singleton 15', 1395, 28435),
    pegBottle('Singleton 18', 2356, 49005),
    pegBottle('Glenfiddich Spec Res 12', 1080, 22520),
    pegBottle('Glenfiddich Spec Res 15', 1400, 28435),
    pegBottle('Glenfiddich Spec Res 18', 1695, 35090),
    pegBottle('Glenmorangie The Original', 954, 21540),
    pegBottle('Talisker Malt 10', 945, 21540),
    pegBottle('Lagavulin', 1760, 35090),
    pegBottle('Laphroige', 1275, 28435),
    pegBottle('Aberfeldy', 946, 21540),
    pegBottle('The Glenlivet 12', 1080, 22520),
    pegBottle('The Glenlivet 15', 1330, 27225),
  ]],
  ['Bar', 'Blended Scotch', 25, 'Blended Scotch', [
    pegBottle("Ballantine'S Finest Scotch", 450, 9625),
    pegBottle('J.W. Red Label', 490, 11350),
    pegBottle("Teacher'S Highland Cream", 415, 9480),
    pegBottle('Jameson Triple Distilled Irish', 500, 11750),
    pegBottle('Jameson Triple Triple cask', 599, 14125),
    pegBottle('Black Dog Triple Gold Reserve', 505, 11495),
    pegBottle("Teacher'S 50", 515, 11855),
    pegBottle('Johnnie Walker Blonde', 490, 12540),
    pegBottle('Jameson Stout Edition', 490, 12540),
    pegBottle('Chivas Regal 12', 710, 15180),
    pegBottle('J.W. Black Label', 690, 15800),
    pegBottle("Dewar'S Spec. Reserve 12", 640, 14520),
    pegBottle('Jameson Black Barrel', 700, 16500),
    pegBottle("Dewar'S 15", 860, 18150),
    pegBottle('J.W. Double Black', 825, 18340),
    pegBottle("Dewar'S 18", 880, 20570),
    pegBottle('Monkey Shoulder', 890, 18975),
    pegBottle('J.W. Gold Reserve', 1000, 23990),
    pegBottle('Copper Dog', 860, 18150),
    pegBottle('Royal Salute 21', 3045, 64125),
    pegBottle('Hibiki Harmony', 2600, 54450),
    pegBottle('J.W.Blue Label', 2730, 64230),
  ]],
  ['Bar', 'American Whisky / Bourbon', 26, 'American Whisky & Bourbon', [
    pegBottle("Jack Daniel'S No. 7", 700, 15800),
    pegBottle("Jack Daniel'S Honey Liq", 700, 15800),
    pegBottle("Jack Daniel'S Fire Liq", 670, 15125),
    pegBottle("Jack Daniel'S Apple Liq", 670, 15125),
    pegBottle('Jim Beam Bourbon', 585, 13280),
    pegBottle('Jim Beam Black', 725, 15939),
    pegBottle('jim beam white', 585, 13280),
    pegBottle('Woodford Reserve', 770, 17600),
    pegBottle("Maker'S Mark Whisky", 940, 20900),
    pegBottle('Gentleman Jack', 955, 21750),
  ]],
  ['Bar', 'Vodka', 27, 'Vodka', [
    pegBottle('Absolut', 505, 11385),
    pegBottle('Ketel One', 400, 9250),
    pegBottle("Absolut Flavour'S", 530, 12000),
    pegBottle('Ciroc', 750, 16040),
    pegBottle('Grey Goose', 780, 17700),
    pegBottle('Belvedere', 915, 18755),
    pegBottle('Beluga Noble', 925, 19325),
    pegBottle('Grey Goose Altius', 2850, 57500),
  ]],
  ['Bar', 'Gin', 28, 'Gin', [
    pegBottle('Tanqueray', 505, 12015),
    pegBottle('Bombay Sapphire', 480, 10560),
    pegBottle('Monkey 47', 725, 12340),
    pegBottle("Hendrick'S", 875, 21175),
    pegBottle('Tanqueray 10 (1Lit)', 780, 19800),
    pegBottle('Roku Gin The Japanese', 875, 21175),
  ]],
  ['Bar', 'Rum', 29, 'Rum', [
    pegBottle('Bacardi Black', 370, 7925),
    pegBottle('Bacardi C.B. Superior', 370, 7925),
    pegBottle('Bacardi Gold', 385, 8710),
    pegBottle('Bacardi Limon', 425, 9500),
    pegBottle('Bacardi Grand Reserva Anjeo 4', 650, 13750),
    pegBottle('Bacardi Grand Reserva Ocho 8', 625, 14400),
    pegBottle('Bacardi Grand Reserva Diez 10', 985, 21175),
  ]],
  ['Bar', 'Tequila', 30, 'Tequila', [
    pegBottle('Camino Real Bianco', 450, 10350),
    pegBottle('Camino Real Gold', 475, 11150),
    pegBottle('Jose Cuervo Silver', 600, 13915),
    pegBottle('Jose Cuervo Reposado', 750, 20810),
    pegBottle('Patron Silver', 880, 19960),
    pegBottle('1800 Silver', 1275, 29040),
    pegBottle('Don Julio Blanco', 880, 19960),
    pegBottle('Patron Reposado', 1400, 29040),
    pegBottle('Don Julio Reposado', 910, 20810),
    pegBottle('Patron El Alto', 3750, 85000),
    pegBottle('Don Julio 1942', 3450, 78650),
    pegBottle('Clase Azul', 4600, 94380),
  ]],
  ['Bar', 'Liqueur', 31, 'Liqueur', [
    pegBottle('Baileys Irish Cream', 725, 13310),
    pegBottle('Jagermeister', 760, 15730),
    pegBottle('Absinthe Green', 910, 19640),
    pegBottle('Molinari Sambuca Extra', 790, 14400),
  ]],
  ['Beverages', 'Soft Beverages', 37, 'Soft Beverages', [
    soft('Bottle Water', 120),
    soft('Fresh Lime Soda/ Water', 240),
    soft('Canned Juice (by Glass)', 265),
    soft('Diet Coke Can', 220),
    soft('Ginger Ale Can', 220),
    soft('Tonic Water Can', 220),
    soft('Soft Drink Can', 220),
    soft('Perrier Water', 330),
    soft('Soda Regular Btl', 220),
    soft('Softdrinks 500ml', 240),
    soft('Red Bull Energy Drink', 400),
  ]],
];

// ── SQL helpers ──────────────────────────────────────────────────────────
function uuidFrom(key) {
  const h = crypto.createHash('sha1').update(`mitron-party-menu:${key}`).digest('hex');
  // Shape it as an RFC 4122 v5-style UUID.
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-5${h.slice(13, 16)}-${((parseInt(h[16], 16) & 0x3) | 0x8).toString(16)}${h.slice(17, 20)}-${h.slice(20, 32)}`;
}
const q = (s) => (s === null || s === undefined ? 'null' : `'${String(s).replace(/'/g, "''")}'`);

const categoryRows = [];
const imageSources = [];
const itemRows = [];
const variantRows = [];
let itemCount = 0;

for (const [section, catName, sortOrder, allDayName, items] of DATA) {
  const catId = uuidFrom(`cat:${catName}`);
  categoryRows.push(`  (${q(catId)}, ${q(catName)}, ${q(section)}, ${sortOrder}, 'party')`);
  imageSources.push(`  (${q(catId)}::uuid, ${q(allDayName)})`);

  items.forEach((it, i) => {
    itemCount++;
    const itemId = uuidFrom(`item:${catName}:${it.name}`);
    const basePrice = Math.min(...it.sizes.map(([, p]) => p));
    itemRows.push(
      `  (${q(itemId)}, ${q(catId)}, ${q(it.name)}, ${q(it.description)}, ${basePrice}, null, null, ${it.alcoholic}, true, ${i})`
    );
    if (it.sizes.length > 1) {
      it.sizes.forEach(([label, price], j) => {
        variantRows.push(`  (${q(uuidFrom(`variant:${catName}:${it.name}:${label}`))}, ${q(itemId)}, ${q(label)}, ${price}, ${j})`);
      });
    }
  });
}

const sql = `-- Mitron Thane — QR table ordering
-- 0015_party_menu.sql: GENERATED by scripts/generate-party-menu-sql.js — edit
-- the script, not this file.
--
-- Two beverage menus, switched from Admin -> Menu Items:
--   * All Day — every existing Bar / Beverages category.
--   * Party   — the ${itemCount} drinks from "BEVERAGE MENU.pdf", same names,
--               prices and serving sizes (30ml / Bottle, Glass / Bottle).
-- Customers see exactly one of them; Food (and any category with no
-- beverage_menu) is always shown.
--
-- Run this whole file once in the Supabase SQL editor.

-- ── 1. categories.beverage_menu ───────────────────────────────────────────
alter table public.categories
  add column if not exists beverage_menu text
  check (beverage_menu in ('all_day', 'party'));

update public.categories
set beverage_menu = 'all_day'
where section in ('Bar', 'Beverages') and beverage_menu is null;

-- ── 2. the switch: single-row settings table ──────────────────────────────
create table if not exists public.app_settings (
  id boolean primary key default true check (id),
  party_menu_enabled boolean not null default false,
  updated_at timestamptz not null default now()
);

insert into public.app_settings (id) values (true) on conflict (id) do nothing;

alter table public.app_settings enable row level security;

drop policy if exists "public can read app settings" on public.app_settings;
create policy "public can read app settings"
  on public.app_settings for select
  to anon, authenticated
  using (true);

drop policy if exists "admins update app settings" on public.app_settings;
create policy "admins update app settings"
  on public.app_settings for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ── 3. Party menu categories ──────────────────────────────────────────────
insert into public.categories (id, name, section, sort_order, beverage_menu) values
${categoryRows.join(',\n')}
on conflict (id) do nothing;

-- Reuse each All Day category's cover photo for its Party counterpart.
update public.categories p
set image_url = a.image_url
from (values
${imageSources.join(',\n')}
) as src(party_id, all_day_name)
join public.categories a on a.name = src.all_day_name and a.beverage_menu = 'all_day'
where p.id = src.party_id
  and p.image_url is null;

-- ── 4. Party menu items ───────────────────────────────────────────────────
insert into public.menu_items (id, category_id, name, description, price, image_url, dietary_type, is_alcoholic, is_available, sort_order) values
${itemRows.join(',\n')}
on conflict (id) do nothing;

-- ── 5. Serving sizes (30ml / Bottle, Glass / Bottle) ──────────────────────
insert into public.menu_item_variants (id, menu_item_id, label, price, sort_order) values
${variantRows.join(',\n')}
on conflict (id) do nothing;
`;

fs.writeFileSync(OUT, sql);
console.log(`Wrote ${OUT}: ${DATA.length} categories, ${itemCount} items, ${variantRows.length} variants`);
