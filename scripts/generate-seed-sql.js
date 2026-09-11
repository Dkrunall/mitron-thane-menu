// Mitron Thane — QR table ordering
// Generates supabase/migrations/0003_seed_tables.sql and 0004_seed_menu.sql
// from the DATA object below (menu transcribed from Mitron's public Zomato
// listing — https://www.zomato.com/mumbai/mitron-wagle-estate-thane-west-thane/menu
// — since no Zillout export was available for this venue; see AGENTS notes).
//
// Run with: node scripts/generate-seed-sql.js

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const OUT_TABLES = path.join(__dirname, '..', 'supabase', 'migrations', '0003_seed_tables.sql');
const OUT_MENU = path.join(__dirname, '..', 'supabase', 'migrations', '0004_seed_menu.sql');

// ── item builder ────────────────────────────────────────────────────────
// I(name, price, description, dietary_type, is_alcoholic, variants)
// variants: [[label, price], ...] — extra serving-size / choice options.
function I(name, price, desc, diet, alcoholic, variants) {
  return { name, price, description: desc || null, dietary_type: diet || null, is_alcoholic: !!alcoholic, variants: variants || [] };
}
const V = (n, p, d, vr) => I(n, p, d, 'veg', false, vr);
const NV = (n, p, d, vr) => I(n, p, d, 'non_veg', false, vr);
const SF = (n, p, d, vr) => I(n, p, d, 'seafood', false, vr);
const EG = (n, p, d, vr) => I(n, p, d, 'egg', false, vr);
const MX = (n, p, d, vr) => I(n, p, d, null, false, vr); // mixed veg/non-veg via variants, or non-alcoholic drink
const AL = (n, p, d, vr) => I(n, p, d, null, true, vr); // alcoholic
const NA = MX;

// ── DATA: section -> category -> items ──────────────────────────────────
const DATA = {
  Food: {
    'Soups & Salad': [
      V('Singapore Laksa', 350, 'Spicy noodle soup flavoured with coconut milk, lemongrass and mint'),
      V('Beijing Soup', 350, 'Mildly-spiced thick soup with glass noodles, spinach, tomato and mushroom garnished with roasted garlic and coriander'),
      V('Broccoli & Almond', 350, "Broccoli cream soup with slivered almonds and goat's cheese"),
      V('Truffle Mushroom Soup', 400, 'Assorted mushroom, fresh black truffle, truffle oil, garlic and chives, served with sesame lavash'),
      V('Avocado & Asparagus Soup', 400, 'Creamy asparagus broth infused with truffle lime, spiked with blackpepper & finished with fresh avocado & cilantro'),
      V('Som Tom Salad', 500, 'Classic raw papaya tangy spicy salad with roasted peanuts, beans and cherry tomatoes'),
      V('Crunchy Lotus Root Salad', 550, 'Thinly sliced lotus stem, chilli, ginger, coriander, vinegar, sesame oil and olive oil'),
      V('Burrata Salad', 600, 'Tomato, honeydew melon, figs, basil, mint, onion, rustic basil pesto with burrata cheese'),
      V('Quinoa & Avocado Salad', 550, 'Avocado, tri colour quinoa, tabbouleh, candid walnut, mascarpone and black aged garlic dressing, garnished with sunflower seeds'),
      MX('Caesar Salad (Veg / Chicken / Prawns)', 450, 'Romaine, ice berg, sundried tomato, green olive, capers, croutons and shaved parmesan cheese', [['Chicken', 500], ['Prawns', 600]]),
    ],
    'Between Breads': [
      V('Avocado On Sourdough Toast', 580, 'Fermented sourdough toast slice, cream cheese, avocado slice, lemon, olive oil & seeds'),
      V('Herb Garlic Bun', 470, 'Freshly baked milky bun, toasted with herb garlic butter (add cheese +100)'),
      V('Cottage Cheese & Cheddar Sando', 580, 'Savory blend of creamy cottage cheese and cream cheese, layered in a soft Japanese-style sandwich'),
      MX('Micro Burgers (Veg / Chicken)', 520, '8 pieces of mini burgers, cocktail sauce, cheese slice', [['Chicken', 580]]),
      EG('Scrambled Egg & Cheese Sando', 580, 'Scrambled egg paired with melted cheese, layered in soft bread for a perfectly balanced, savory-sweet Japanese sandwich'),
      NV('Pulled Chicken Sando', 650, 'Tender Japanese-style pulled chicken with spicy gochujang and creamy mayo, packed into a sandwich bursting with bold, creamy, spicy and tangy flavors'),
    ],
    'Greatest Bar Bites': [
      V('Japanese Edamame Salted / Spicy', 580),
      V('Crispy Lotus Chips', 480, 'Tossed in cheese powder & chilli basil lime seasoning'),
      V('Papad Basket', 370, 'Assorted fried papad with dips'),
      V('Jalapeno Cheese Balls', 560, 'Classic corn and Jalapenos cheese balls with dips'),
      V('Tex Mex Fries', 640, 'Loaded fries with pico de gallo, guacamole, tomato salsa, sour cream and cheese sauce'),
      V('French Fries (Salted / Peri Peri / Truffle / Cheesy)', 600, 'Potato fries, parsley served with signature dip', [['Peri Peri', 620], ['Truffle / Cheesy', 640]]),
      V('Aloo Tikki Ki Chaat', 530, 'Crispy potato patty stuffed with spiced yellow chana dal, topped with sweet yoghurt, mint and tamarind chutney'),
      MX('Refried Bean Nachos (Veg / Chicken)', 530, 'Served with cheese & cheese sauce tomato salsa, sour cream and guacamole', [['Chicken', 580]]),
      NV('Pulled BBQ Chicken Fries', 690, 'Fries topped with tender pulled bbq chicken, cheddar cheese, creamy slaw and cilantro'),
      NV('Jawa Chicken Lollipop', 600, 'Chicken lollipop tossed in umami sauce'),
      NV('Indo-Asian Chicken Popcorn', 580, 'Tempura battered fried chicken poppers with spiced mayo'),
      NV('Murgh Tikka Chaat', 600, 'Chicken tikka, onion, coriander, cucumber, lemon and chat masala spices finished with papdi and yellow sev'),
      SF('Prawns Koliwada', 760, 'Deep fried prawns in garlic, ginger, ajwain, chilli powder in Bengal gram batter'),
    ],
    Sushi: [
      V('Truffle Enoki Roll', 500, 'Uramaki style sushi roll stuffed with tempura fried enoki & shitake mushroom, topped with spicy aioli and quinoa crisp', [['8 pcs', 950]]),
      V('Mexican Avocado Roll', 470, 'Avocado tempura rolled and topped with tanuki flakes & avocado guacamole', [['8 pcs', 910]]),
      V('Crispy Veg Maki', 480, 'Uramaki style roll with tempura vegetables, topped with namjin dressing, tanuki flakes and dehydrated spinach', [['8 pcs', 910]]),
      V('Crispy Avocado Roll', 480, 'Avocado tempura, chilli mayo and epic seasoning', [['8 pcs', 910]]),
      V('Avocado & Cream Cheese', 470, 'Fresh avocado and cream cheese', [['8 pcs', 910]]),
      V('Asparagus Tempura Roll', 480, 'Tempura fried asparagus, cream cheese, tanuki flakes and kimchi aioli', [['8 pcs', 910]]),
      SF('Aburi Salmon Roll', 510, 'Uramaki style sushi rolled with salmon tartare, topped with salmon carpaccio and spicy aioli flamed', [['8 pcs', 980]]),
      SF('Crab California Roll', 520, 'Uramaki style sushi filled with cucumber, avocado and crab sticks, orange tobiko', [['8 pcs', 920]]),
      SF('Salmon Cream Cheese Roll', 530, 'Slice of salmon, avocado & cream cheese wrapped in nori sheet and sushi rice', [['8 pcs', 980]]),
      SF('Spicy Prawn Tempura Roll', 580, 'Tempura fried prawns, sprinkled with shichimi powder and kimchi mayonnaise', [['8 pcs', 1090]]),
      SF('Spicy Tuna Truffle', 500, 'Tuna fish, cucumber, cream cheese, tanuki flakes topped with truffle tuna tartare', [['8 pcs', 940]]),
      MX('Assorted Matrix (Veg / Non-Veg)', 2190, "Assorted chef's choice 21 pcs of maki roll and nigiri", [['Non-Veg', 2750]]),
      MX('Sushi Boat (Veg / Non-Veg)', 2860, "Assorted chef's choice 29 pcs of maki roll and nigiri", [['Non-Veg', 3520]]),
    ],
    Dimsum: [
      V('Broccoli Cream Cheese & Pinenuts', 530, 'Steamed and pan-seared gyoza filled with broccoli, water chestnuts, cream cheese & pine nuts'),
      V('Vegetables Shanghai', 490, 'Water chestnuts, celery, lotus root and American corn wrapped in gyoza skin'),
      V('Crystal Vegetable', 490, 'A translucent dumpling with carrot, celery, water chestnuts, black fungus and corn'),
      V('Cheese And Chilli Oil', 530, 'Cheese, mushroom, water chestnuts, chilli, sesame oil, wrapped in translucent dumpling with chilli oil'),
      V('Spiced Aspargus & Corn Dumpling', 530, 'Sweet corn, asparagus, water chestnut, broccoli, salt, sugar, aromatic powder, potato starch, sesame oil, peri-peri powder, with transparent dough'),
      V('Edamame Truffle', 580, 'A translucent dumpling with edamame, water chestnuts and truffle oil'),
      V('Truffle Mushroom Bao', 600, 'Duet of shiitake & oyster mushroom in thai chilli paste and cream cheese with tobanjan paste wrapped in fermented lotus flour bun'),
      MX('Cheung Fun Steam / Crispy (Veg / Chicken / Prawns)', 540, 'Wrapped in crunchy rice flour sheet served with spicy Cantonese soy sauce', [['Chicken', 610], ['Prawns', 650]]),
      MX('Open Faced Bao (Chilli Paneer / Chilli Chicken / Prawns n Chives)', 490, 'Red lotus flour bao with various proteins, japanese cucumber, spicy aioli & leeks', [['Chilli Chicken', 610], ['Prawns n Chives', 710]]),
      NV('Xiao Long Bao Chicken', 540, 'Soupy dumplings'),
      SF('Chicken & Prawns Poached Peking Dumpling', 540, 'Minced prawn and chicken marinated in sesame oil, Japanese spice and fresh chilli wrapped in transparent dough served with homemade umami sauce'),
      NV('Shanghai Chicken Dumpling', 580, 'Minced chicken marinated in sesame oil and Japanese spice wrapped in gyoza skin and pan grilled'),
      NV('Chicken Gyoza', 610, 'Pan seared steamed chicken dumpling'),
      NV('Singaporean Black Pepper', 610, 'Marinated mince chicken with black pepper sauce wrapped with blue pea infused translucent dough'),
      NV('Chicken Kothey Dumpling', 610, 'Spiced mince chicken in red lotus dough, steamed & pan-seared serve with spicy tomato chutney'),
      SF('Prawn N Chives Dimsum', 620, 'A translucent dumpling filled with minced prawns marinated with Chinese flower chives & sesame oil'),
      SF('Prawns Spinach Roll', 610, 'Marinated mince prawns rolled in spinach steam to perfection, serve with black bean sauce'),
      SF('Prawns Rice Paper Roll', 650, 'Fresh prawns seasoned with celery and thai bird eye chilli, sesame oil wrapped to perfection in delicate rice paper sheet'),
      SF('Curried White Fish Dumpling', 690, 'White fish in fragrant curry, red chilli, sesame oil wrapped in translucent dough serve on a bed of curried sauce'),
      MX('Assorted Steam Dimsum Basket (Veg / Non-Veg)', 1090, 'Basket of 3 types of dim sum, 9 pieces', [['Non-Veg', 1310]]),
    ],
    Pizza: [
      V('Classic Margherita', 680, 'San Marzano tomato sauce, mozzarella, buffalo mozzarella, basil and olive oil'),
      V('Veg Delight', 700, 'San Marzano tomato sauce, zucchini, bell pepper, corn, cherry tomato & mozzarella'),
      V('Garden Fresh Pizza', 700, 'Pesto and San Marzano tomato sauce, button mushroom, broccoli, green & black olive, basil, mozzarella and olive oil'),
      V('Double Cheese Margherita', 700, 'San Marzano tomato sauce, mozzarella, buffalo mozzarella, cheese spread, basil and olive oil'),
      V('Burrata Pizza', 760, 'Marinara sauce, fresh burrata, parmesan, crush pesto, rucola and olive oil'),
      V('Quattro Formaggi', 760, 'Tomato and barbeque sauce, mozzarella, fresh mozzarella, parmesan and yellow cheddar with arugula'),
      V('Funghi Truffle Mushroom', 760, 'San Marzano tomato sauce, assorted mushrooms, fresh truffle, truffle oil, goat cheese and mozzarella'),
      V('Indian Treat', 760, 'Homemade makhani sauce, paneer tikka, fried onion and coriander'),
      NV('Charcoal Chicken', 760, 'Homemade makhani sauce, chicken tikka, fried onion and coriander'),
      NV('Spicy BBQ Chicken Pizza', 760, 'Tomato and bbq sauce, mozzarella, pan toss bbq chicken, chilli flakes, parsley and olive oil'),
      NV('Chicken Overload Pizza', 780, 'Italian San Marzano tomato sauce, mozzarella, grilled chicken, chicken sausages, chicken tikka, chicken pepperoni, parsley and olive oil'),
      NV('Spicy Chicken Pepperoni', 800, 'San Marzano tomato sauce, mozzarella, paprika and chicken pepperoni olive oil'),
    ],
    'Pasta & Risotto': [
      V('Spinach Ricotta Ravioli', 720, 'Gluten free house made semolina pasta, spinach, ricotta cheese filled ravioli in tomato cream sauce'),
      V('Penne Mama Rossa', 690, 'Tomato concasse, cooking cream, assorted vegetables and parmesan cheese'),
      V('Mac N Cheese', 690, 'Elbow cut macaroni in cheesy white sauce with gratinated yellow cheddar'),
      V('Spaghetti Aglio-Olio Peproncino', 640, 'Garlic, paprika, olive oil with kalamata olives and capers'),
      V('Linguine Pistachio Burrata', 720, 'Homemade linguine pasta in creamy basil pesto with crushed pistachio and burrata'),
      V('Penne Alla Porcini', 800, 'Penne pasta in creamy porcini mushroom sauce, parsley and parmesan'),
      V('Four Peppers Risotto', 650, 'Red, yellow and green pepper, pink pepper corn, green peas, eggplant in spicy tomato sauce and parmesan'),
    ],
    'Small Plates': [
      V('Avocado & Edamame Tacos', 550, 'Crisp gyoza style taco stuffed with tempura fried edamame & avocado, finished with bold gochujang mayo, topped with corn scallion kimchi'),
      V('Rock Corn Tempura Ball', 480, 'Thai herbs infused rock corn ball with onion, thai bird eye chilli, cilantro serve with curried mayo'),
      V('Classic Hummus', 600, 'Serve with herbed pita, pickled root vegetable, roasted broccoli and truffle oil'),
      V('Mezze Platter', 690, 'Pita bread, lavash, falafel, baba ghanoush, flavoured hummus, muhammara, tabouleh, cheese olive mix and dried fruits'),
      NV('Tender Chicken Crispy', 580, 'Cajun rubbed crispy chicken with honey mustard sauce'),
      NV('Grilled Peri-Peri Wings', 580, 'Buttermilk-soaked peri peri marinated wings with chilli, garlic and chives'),
      SF('Nori Crisp & Crab', 780, 'Crispy nori sheet, chilli butter garlic crab and lime'),
      NV('Lamb Birria Tacos', 780, 'Gluten free soft shell, montary jack cheese, pulled birria lamb, guacamole'),
      NV('Sesame Lamb Croquette', 780, 'Slow cooked pulled lamb, black sesame, chimmichuri'),
    ],
    'Appetizer Asian': [
      V('Paneer Chilli', 600, 'A spicy paneer deep fried and tossed with chilli, garlic, peppers, spring onion and bold soy sauce'),
      V('Asian BBQ Cottage Cheese', 600, 'Deep fried cottage cheese tossed in peppery BBQ sauce'),
      V('Crispy Lotus Stem', 650, 'Thai lotus root tossed in barbeque sauce, devil chilli and plum sauce'),
      V('Mountain Chilli Tofu', 650, 'Crispy fried silken tofu tossed in homemade mountain chilli sauce'),
      V('Crackling Spinach, Corn & Chestnut', 550, 'Crispy corn & water chestnuts tossed in homemade sweet and sour sauce, crackling spinach'),
      V('Turnip Cake', 580, 'Rice cake with turnip, carrot, celery and daikon topped with Kim yum sauce'),
      V('Mushroom & Babycorn Thai Chilli Basil', 520, 'Crispy fried mushroom wok tossed with garlic, red chilli, basil leaf, Thai chilli paste finished with lime'),
      V('Kung Pao Potato Wedges', 520, 'Potato wedges wok tossed in homemade kung pao sauce'),
      MX('Asian Chilli (Chicken / Prawns)', 640, 'A spicy chicken or prawns deep fried and tossed with chilli, garlic, peppers, spring onion and bold soy sauces', [['Prawns', 720]]),
      NV('Grilled Chicken Skewers', 600, 'Bursting with the bold flavors of coconut, lemongrass and Thai spices'),
      NV('Black Garlic Chicken', 640, 'Dark soy, sichuan peppercorn and roasted garlic flavored chicken'),
      NV('Tiger Chilli Chicken', 600, 'Deep fried chicken tossed in garlic, ginger and thai bird eye chilli'),
      NV('Fire Roasted Mandarin Whiskey Chicken', 600, 'Sichuan pepper infused chicken skewers wok tossed with garlic, Thai chilli and chef special sauce finished with whiskey'),
      SF('Curry Leaf Peppered Calamari', 760, 'Crispy fried calamari tossed in curry leaf, dried red chilli, crushed pepper, candied ginger, capers and roasted garlic finished with cooking wine'),
      SF('Chilli Tempura Prawns', 760, 'Deep fried prawn tossed in dry red chilli, fried garlic, five spice powder and spring onion'),
      NV('Xinjiang Lamb', 780, 'Slice lamb wok tossed with fresh coriander, cumin and chillies'),
      SF('Pan Fried Chilli Fish', 650, 'Deep fried river sole fish, bell pepper & chilli paste tossed in oyster sauce'),
      SF('Salt N Pepper Prawns', 720, 'Crispy fried prawns wok tossed with butter, fried garlic, bell pepper, scallion and seasoning (alcohol contain)'),
    ],
    Tandoor: [
      V('Tafftan', 510, 'Mini aloo kulcha serve with makhani dip'),
      V('Tandoori Paneer Tikka', 640, 'Malai paneer marinated with hung curd, kashmiri chilli paste mustard oil and indian spices'),
      V('Edamame & Peas Seekh', 640, 'Edamame, green peas, cheese, onions, garlic, ginger, green chilli, fresh coriander, garam masala, skewered and grilled to perfection'),
      V('Bharwan Mushroom', 580, 'Mushroom stuffed with cheese, spinach coriander, chilli marinated with hung curd, saffron, mustard oil and Indian spices'),
      V('Achari Soya Chaap', 580, 'Soya chaap soaked in butter milk and marinated with pickled hung curd, cooked in tandoor'),
      V('Paneer Chimichuri', 650, 'Cottage cheese rolled with cheese marinated with thecha flavored hung curd, mustard oil and Indian spices'),
      V('Veg Shammi Kebab', 530, 'Minced mix vegetables tikki with indian spices, cooked in ghee'),
      V('Tandoori Badami Broccoli', 510, 'Broccoli marinated in hung curd, cashew paste indian spices garnished with almond flakes'),
      NV('Laziz Boti (Chicken / Mutton)', 680, 'Khamiri roti topped with mughlai style boti kebab', [['Mutton', 750]]),
      NV('Murgh Thecha Kebab', 680, 'Chicken thigh boneless, marinated in thecha masala, hung curd, mustard oil and Indian spices'),
      NV('Tandoori Chicken Tikka', 680, 'Chicken thigh boneless marinated with hung curd, kashmiri chilli paste, mustard oil and Indian spices'),
      NV('Cheese Chilli Murgh', 700, 'Chicken supreme stuffed with cheese & chilli, marinated with yellow chilli powder hung curd, cashew paste & indian spices'),
      NV('Kalimiri Chicken Tikka', 680, 'Juicy chicken chunks marinated in cashew paste, black pepper, hung curd, garlic, ginger, lemon juice, cooked in tandoor'),
      NV('Tandoori Chicken Drumsticks', 680, 'Chicken drumsticks marinated with hung curd, kashmiri chilli paste, mustard oil and Indian spices'),
      SF('Tandoori Prawns (Angara / Lahsooni)', 760, 'King prawns marinated in choice of masala'),
      NV('Gosht Seekh Kebab', 780, 'Minced spiced lamb with aromatic indian spices, cooked in clay oven'),
      SF('Tandoori Mahi Tikka', 750, 'Rawas marinated with hung curd, kashmiri chilli paste, mustard oil and Indian spices'),
      MX('Tandoori Platter (Veg / Non-Veg)', 1900, "Chef choice a selection of 20 delicious kebab pieces with accompaniment", [['Non-Veg', 2500]]),
    ],
    'Mains Asian': [
      V('Teriyaki Exotic Vegetables', 530, 'Zucchini, baby corn, shitake, lotus stem, chinese cabbage, cherry tomato and tofu wok tossed in teriyaki sauce'),
      V('Braised Waterchestnut, Corn & Pokchoy', 500, 'Sauteed pokchoy topped with corn & water chestnut in creamy butter garlic sauce'),
      V('Paneer In Choice Of Sauce (Manchurian / Kung Pao / Hunan / Thai Chilli Basil)', 530),
      MX('Thai Curry Red / Green (Veg / Chicken / Seafood)', 610, 'Authentic Thai curry served with steam rice', [['Chicken', 680], ['Seafood', 740]]),
      MX('Sri Lankan Curry (Veg / Chicken / Seafood)', 530, 'Slow cooked curry in rich blend of onion, cumin, red chilli paste, coconut cream and signature spices, served with steam rice', [['Chicken', 600], ['Seafood', 640]]),
      NV('Chicken In Choice Of Sauce (Manchurian / Kung Pao / Hunan / Thai Chilli Basil)', 580),
      SF('Sichuan Style Crispy Prawns', 640, 'Tiger prawns wok tossed with garlic, dried red chilli, scallion and crispy chilli sauce, finished with sesame oil'),
      NV('Hainanese Roast Lamb', 710, 'Twice cooked lamb enhanced with a star anise and dark soy sauce with fresh green onion and dried chilli'),
      MX('Steamed Chicken / River Sole In Smoky Superior Soy', 580, 'Garlic, ginger and black bean marinated steam chicken / river sole topped with smoky superior sauce finished with fresh coriander', [['River Sole', 650]]),
    ],
    'Indo Chinese Bowls': [
      V('Coriander Pot Noodles', 530, 'Wok-tossed noodles in a fragrant homemade coriander sauce, finished with a medley of exotic vegetables'),
      V('Classic Pot Rice', 570, 'Fragrant rice cooked in a pot with exotic veggies and Chinese five blend spice infused gravy'),
      V('Asian Chilli Bowl Paneer', 640, 'Wok tossed fried rice, classic chinese chilli sauce with paneer'),
      V('Hakka Noodles Bowl', 570, 'Stir fried Hakka noodle with chilli teriyaki sauce and exotic veg'),
      V('Triple Schezwan Fried Rice', 570, 'Indo-asian Schezwan fried rice along with Schezwan gravy'),
      V('Indo-Asian Manchurian Meal', 570, 'Wok tossed fried rice along with manchurian gravy'),
    ],
    'Rice & Noodles': [
      V('Steamed Basmati Rice', 280),
      V('Steamed Jasmine Rice', 360),
      V('Burnt Garlic Fried Rice', 400),
      V('Crispy Chilli Garlic Fried Rice', 420, 'Steam basmati rice wok tossed with garlic, red chilli, crispy chilli sauce'),
      V('Hakka Noodles', 400, 'Classic Chinese style stir fry noodle with vegetables, soy sauce and scallion'),
      V('Bang Bang Noodles', 430, 'Stir fried noodle tossed with garlic, fresh red chilli, coriander, mushroom oyster sauce, sweet soya sauce with tangy and spicy sauce'),
      V('Pad Thai Noodles', 580, 'Rice noodle tossed with chinese cabbage, pokchoy, beansprouts, red and yellow capsicum flavored with tamarind and peanuts'),
    ],
    'Mains Indian': [
      V('Dal Makhani', 430),
      V('Yellow Dal Tadka', 390),
      V('Plain / Achari Dal Khichdi', 360, null, [['Achari', 380]]),
      V('Subzi Diwani Handi', 580, 'Vegetables cooked in spinach puree, garlic, onion, tomato with indian spices'),
      V('Gulnar Kofta', 580, "Kofta made from paneer & nuts delicately spiced & cooked in rich aromatic tomato based gravy finished with cream and subtle saffron"),
      MX('Dum Biryani (Veg / Chicken / Mutton)', 640, 'Basmati rice cooked and dum with onion tomato masala and Indian spices', [['Chicken', 720], ['Mutton', 840]]),
      MX('Kadhai Masala (Paneer / Chicken / Mutton)', 580, 'Cooked with bell peppers, onions, tomatoes, garlic ginger, and traditional kadhai spices in a rich aromatic gravy', [['Chicken', 700], ['Mutton', 800]]),
      MX('Tikka Masala (Paneer / Chicken)', 580, 'Cooked in a creamy tomato-onion gravy with garlic, ginger, fenugreek and aromatic spices', [['Chicken', 700]]),
      NV('Butter Chicken', 700, 'Chicken tikka cooked in creamy tomato & fenugreek gravy, finished with butter'),
      NV('Nihari (Chicken / Mutton)', 700, 'Slow-cooked tender chicken or mutton in a fragrant, spiced bone marrow gravy with ginger, garlic, whole spices and a hint of red chilli', [['Mutton', 800]]),
      NV('Mutton Pepper Fry Masala', 800, 'Mutton pieces stir-fried with black pepper, onions, garlic, ginger, curry leaves and aromatic South-Indian spices'),
    ],
    'Epicurian Masterpiece': [
      NV('Herbed Grilled Chicken', 750, 'Grilled chicken breast, lemon-jalapeno pilaf, mash potato and mushroom pepper corn jus'),
      NV('Fettucini Chicken Schnitzel', 790, 'Fettucini pasta, mushroom, mamarossa and crispy chicken'),
      SF('Beurre Blanc Grilled Salmon', 850, 'Norwegian salmon, mushroom, spinach and green emulsion'),
      SF('Fish Café De Paris', 800, 'Grilled basa, tomato quinoa, vegetables and café de paris sauce'),
    ],
    'Indian Breads': [
      V('Naan (Plain / Butter Garlic / Cheese)', 110, null, [['Butter Garlic', 140], ['Cheese', 160]]),
      V('Cheese Chilli Naan', 170),
      V('Kulcha (Plain / Aloo / Paneer)', 140, null, [['Aloo', 170], ['Paneer', 200]]),
      V('Chur Chur Paratha', 180),
      V('Tandoori Roti (Plain / Butter)', 100, null, [['Butter', 110]]),
      V('Khamiri Roti (Plain / Butter)', 110, null, [['Butter', 140]]),
    ],
    Desserts: [
      V('Saffron Tres Leches', 680, 'Delicate sponge soaked in a saffron based rich milk, layered with saffron mousse and served with pistachio and fragrant rose petals'),
      V('The Coconut', 730, 'Light coconut mousse with coconut water and malai jelly, encased in dark chocolate and served with vanilla bean ice cream and almond crumble'),
      V('Chocolate Pebble', 650, 'Velvety dark chocolate mousse with a luscious molten boozy center, served with chocolate soil and berries'),
      V('Date Toffee Pudding', 700, 'Warm sticky date pudding drenched in buttery toffee sauce, served with citrus marmalade and vanilla bean ice cream and almond soil'),
      V('French Toast', 650, 'With Nutella, flavoured whipped cream berry compote, mix berries, organic honey and dusted sugar'),
      V('Pull Me Up Tiramisu', 730, 'Espresso and rum-soaked sponge layered with airy mascarpone mousse, served with cocoa dust and a dramatic pull-me-up pour'),
      V('Lemon Tart', 700, 'Crisp almond tart shell filled with smooth lemon curd, paired with mascarpone mousse, torched meringue and almond brittle'),
      V('Sugarfree Signature Crêpe', 700, 'Healthy delicate crêpes layered with dark chocolate mousse, served warm with rich chocolate sauce'),
    ],
  },

  Bar: {
    'Signature Cocktails': [
      AL('Espresso Martini', 550, 'The espresso martini is a sumptuous mix of vodka, coffee liqueur and espresso'),
      AL('Roselle G&T', 750, 'A deconstructed g&t with flavours like roselle & elderflower'),
      AL('Umami Fashioned', 750, 'Chestnut and sherry sweetened by maple & cacao with the mushroom scent'),
      AL('Brotherwood', 750, 'A cocktail which represents different friends in a group. Flavour forward drink with chamomile vodka & vanilla liqueur paired with fig and green apple with a spice touch of cinnamon'),
      AL('Grape Picante', 770, 'A cocktail which brings the romance and spice in a love through its flavours like black grape and jalapeno with coriander and tequila'),
      AL('Ruby', 770, 'A tequila cocktail showcases its gem factors through its flavours like strawberry and rhubarb with Italian lemon and berry yogurt'),
      AL('Amalgam', 770, 'A delicious refreshing cocktail showcases 2 category of flavours like Gin basil & pineapple campari and homemade kumis liquor'),
      AL('Emerald', 770, 'A tropical vodka cocktail with coconut and bellpeppers were binded together for a perfect cocktail'),
      AL('Olmec', 830, 'A highball drink made with tequila pairs glorious with elderflower and shisho for its floral aromas and spice touch from jalapeno and basil with quinine'),
      AL('Shiso Spritz', 830, 'A vodka spritzer combination of grapefruit and shisho with elderflower and italian lemon'),
      AL('Sansho Milk Punch', 830, 'A clarified milk punch of tequila and vermouth with tomato paired magnificent on sichuan pepper and honey'),
      AL('Peaches & Melons', 830, 'Walnut cake filtered with whisky were 2 flavours like peaches and melons which brings the joy and balance to the drink'),
    ],
    'Classic Cocktails': [
      AL('Red Bull Vodka', 550, 'Vodka, Red Bull Energy Drink'),
      AL('Red Bull Tropical Gin', 550, 'Gin, Red Bull Yellow Edition'),
      AL('Cosmopolitan', 590, 'Vodka, Orange Liq, Lime, Cranberry'),
      AL('Old Fashioned', 590, 'Whiskey, Sugar Cube, Angostura Bitter'),
      AL('Whisky Sour', 590, 'Whiskey, Lime, Rich Syrup, Egg White, Angostura Bitter'),
      AL('Bellini / Mimosa', 590, 'Peach Puree, Sparkling Wine / Orange'),
      AL('Old Maid', 590, 'Gin, Cucumber, Basil, Lime, Elderflower'),
      AL('Energy Lemonade', 600, 'Vodka, Red Bull Energy Drink, Lime Juice'),
      AL('Negroni', 630, 'Gin, Campari, Sweet Vermouth'),
      AL('Manhattan', 630, 'Whisky, Sweet Vermouth, Angostura Bitters'),
      AL('Tropical Energy Punch', 680, 'Rum, Red Bull Yellow Edition, Pineapple Juice, Orange Juice, Grenadine'),
      AL('Tequila Melon Bull', 700, 'Tequila, Red Bull Red Edition'),
      AL('Tropical Tequila', 720, 'Tequila, Orange Juice, Lime Juice & Red Bull Yellow Edition'),
      AL('Beach Breeze', 720, 'Vodka, Sweet Lime Juice & Red Bull Energy Drink'),
      AL('Paloma', 820, 'Tequila, Grapefruit, Agave Nectar, Salt, Lime, Sparkling Water'),
    ],
    'Long Island Iced Tea': [
      AL('LIIT', 830, '5 White Spirits, Lime, Coke'),
      AL('Hawaiian LIIT', 860, 'White Rum, Dark Rum, Spice Rum, Herbal Liq, Ginger, Pineapple'),
      AL('Floral LIIT', 860, '5 White Spirits, Orange, Lavender, Tonic Water'),
      AL('Last Call', 860, 'Whisky, Dark Rum, Tequila, Aromatic Tea, Beer'),
      AL('Jager LIIT', 1100, '5 White Spirits, Jager, Red Bull Top'),
      AL('Jannat Ki Sair', 1430, '5 White Spirits, Jager, Absinth, Red Wine Top'),
    ],
    Shots: [
      AL('Kamakazi', 490, 'Vodka, Orange Liq, Lime'),
      AL('Dancing Leaf', 550, 'Citron Vodka, Bianco, Malic Acid, Cardamom Tincture And Jade Genseng Oolang Infusion'),
      AL('Mastiha Madness', 550, 'Gin, Mastiha Liq, Malic Acid, Kaffir Leaf Sacchurum & Apple'),
      AL('MILF', 550, 'Coconut Rum, Hibiscus Tequila, Elderflower'),
      AL('B52', 720, 'Baileys, Kalhua, Orange Liq'),
      AL('Sambuca Shooter', 720, 'Sambuca, Coffee Beans'),
      AL('Albama', 720, 'Gin, Amaretto, Orange'),
      AL('Brain Hemerrhage', 880, 'Triple Sec, Vodka, Baileys, Grenadine'),
      AL('Jäger Energy', 880, 'Jägermeister, Red Bull Energy Drink'),
      AL('Jägermeister After Dark', 880, 'Jagermeister, Chocolate Liquor'),
      AL('Jägerbeer Boom', 950, 'Jagermeister, & Beer'),
    ],
    'Sparkling Wine & Champagne': [
      AL('Fratelli Noi Brut', 3300, 'Bottle'),
      AL("Jacob's Creek Sparkling", 4620, 'Bottle'),
      AL("Jacob's Creek Crisp Rose", 4950, 'Bottle'),
      AL('Chandon Brut', 5500, 'Bottle'),
      AL('Chandon Brut Rose', 6600, 'Bottle'),
      AL('Moet Chandon Brut Imperial', 22000, 'Bottle'),
      AL('Moet Chandon Ice Imperial', 23100, 'Bottle'),
      AL('Dom Perignon', 57200, 'Bottle'),
      AL('Dom Perignon Rose', 71500, 'Bottle'),
    ],
    'White Wine': [
      AL('Fratelli Classic Chenin', 550, 'Glass', [['Bottle', 2310]]),
      AL("Jacob's Creek Classic Chardonnay", 940, 'Glass', [['Bottle', 4510]]),
      AL("Two Ocean's Chardonnay", 1050, 'Glass', [['Bottle', 4620]]),
      AL('Frontera Chardonnay', 1270, 'Glass', [['Bottle', 5610]]),
      AL('Campo Viejo Rioja Viura', 1270, 'Glass', [['Bottle', 5830]]),
      AL('Golden Sparrow Pinot Grigio', 1320, 'Glass', [['Bottle', 6050]]),
      AL('Black Tower Riesling', 1320, 'Glass', [['Bottle', 6050]]),
      AL('Brancott Estate Sauvignon Blanc', 1540, 'Glass', [['Bottle', 7150]]),
    ],
    'Red Wine': [
      AL('Fratelli Classic Shiraz', 550, 'Glass', [['Bottle', 2310]]),
      AL('Fratelli Shiraz Rose', 550, 'Glass', [['Bottle', 2310]]),
      AL("Jacob's Creek Classic Shiraz", 940, 'Glass', [['Bottle', 4510]]),
      AL('Frontera Merlot', 1210, 'Glass', [['Bottle', 5500]]),
      AL('Campo Viejo Rioja Tempranillo', 1270, 'Glass', [['Bottle', 5830]]),
      AL('Castello Banfi Sasso Toscana', 1320, 'Glass', [['Bottle', 6050]]),
      AL('Zonin Ventiterre Merlot', 1320, 'Glass', [['Bottle', 6050]]),
      AL('Black Tower Dornfelder Pinot Noir', 1320, 'Glass', [['Bottle', 6050]]),
      AL('Mateus Rose', 1650, 'Glass', [['Bottle', 7150]]),
      AL('Brancott Estate Pinot Noir', 1650, 'Glass', [['Bottle', 7480]]),
    ],
    'Single Malt': [
      AL('Ardmore', 800, '30ml', [['Bottle', 18150]]),
      AL('Aultmore 12 Yo', 800, '30ml', [['Bottle', 18150]]),
      AL('Longitude 77', 800, '30ml', [['Bottle', 18150]]),
      AL('Glenmorangie The Original', 860, '30ml', [['Bottle', 19580]]),
      AL('Singleton 12 Yo', 860, '30ml', [['Bottle', 19580]]),
      AL('Talisker 10 Yo', 860, '30ml', [['Bottle', 19580]]),
      AL('Aberfeldy 12 Yo', 860, '30ml', [['Bottle', 19580]]),
      AL('Aberlour 12 Yo', 870, '30ml', [['Bottle', 20350]]),
      AL('Bowmore 12 Yo', 900, '30ml', [['Bottle', 20680]]),
      AL('Glenfiddich 12 Yo', 940, '30ml', [['Bottle', 19580]]),
      AL('The Glenlivet 12 Yo', 940, '30ml', [['Bottle', 19580]]),
      AL('Tenjaku Pure Japanese', 1020, '30ml', [['Bottle', 21450]]),
      AL('Caol Ila 12 Yo', 1120, '30ml', [['Bottle', 25850]]),
      AL('Laphroaig 10 Yo', 1160, '30ml', [['Bottle', 25850]]),
      AL('The Glenlivet 15 Yo', 1210, '30ml', [['Bottle', 24750]]),
      AL('Oban 14 Yo', 1210, '30ml', [['Bottle', 27500]]),
      AL('Glenfiddich 15 Yo', 1270, '30ml', [['Bottle', 25850]]),
      AL('Singleton 15 Yo', 1270, '30ml', [['Bottle', 25850]]),
      AL('Glenfiddich 18 Yo', 1540, '30ml', [['Bottle', 31900]]),
      AL('Lagavulin 16 Yo', 1600, '30ml', [['Bottle', 31900]]),
      AL("The Yamazaki Distiller's Reserve", 1760, '30ml', [['Bottle', 41800]]),
      AL('The Glenlivet 18 Yo', 2150, '30ml', [['Bottle', 44550]]),
      AL('Singleton 18 Yo', 2150, '30ml', [['Bottle', 44550]]),
      AL('Glenmorangie Signet', 3520, '30ml', [['Bottle', 82500]]),
    ],
    'Blended Scotch': [
      AL("Dewar's White Label", 290, '30ml', [['Bottle', 7150]]),
      AL("William Lawson's", 290, '30ml', [['Bottle', 7150]]),
      AL('Black & White', 330, '30ml', [['Bottle', 7700]]),
      AL('Jameson Triple Distilled Irish', 330, '30ml', [['Bottle', 7700]]),
      AL("Ballantine's Finest", 360, '30ml', [['Bottle', 7700]]),
      AL("Teacher's Highland Cream", 360, '30ml', [['Bottle', 8250]]),
      AL('Scottish Leader', 360, '30ml', [['Bottle', 8250]]),
      AL("100 Piper's Deluxe", 360, '30ml', [['Bottle', 8250]]),
      AL('Black Dog Black Reserve', 360, '30ml', [['Bottle', 8250]]),
      AL("Dewar's 8Yo Portugese Smooth", 410, '30ml', [['Bottle', 9350]]),
      AL('Johnnie Walker Blonde', 410, '30ml', [['Bottle', 9350]]),
      AL('J.W. Red Label', 410, '30ml', [['Bottle', 9460]]),
      AL('J & B Rare', 410, '30ml', [['Bottle', 9460]]),
      AL('Black Dog Triple Gold Reserve', 460, '30ml', [['Bottle', 10450]]),
      AL('Jameson Stout Edition', 460, '30ml', [['Bottle', 10450]]),
      AL("100 Piper's 8 Yo Blended Malt", 460, '30ml', [['Bottle', 10450]]),
      AL("Ballantine's 7 Yo American Barrel", 460, '30ml', [['Bottle', 10450]]),
      AL("Teacher's 50", 470, '30ml', [['Bottle', 10780]]),
      AL("100 Piper's 12 Yo", 470, '30ml', [['Bottle', 10780]]),
      AL("Ballantine's 12 Yo", 510, '30ml', [['Bottle', 11550]]),
      AL('Jameson Black Barrel', 550, '30ml', [['Bottle', 12650]]),
      AL("Dewar's Reserve 12 Yo", 580, '30ml', [['Bottle', 13200]]),
      AL('J.W. Black Label', 600, '30ml', [['Bottle', 13750]]),
      AL('Chivas Regal 12 Yo', 600, '30ml', [['Bottle', 12650]]),
      AL('Tenjaku Japanese', 610, '30ml', [['Bottle', 12650]]),
      AL('J.W. Double Black', 720, '30ml', [['Bottle', 15950]]),
      AL('Roe & Co Irish', 760, '30ml', [['Bottle', 15950]]),
      AL("Dewar's 18 Yo", 800, '30ml', [['Bottle', 18700]]),
      AL('Monkey Shoulder', 780, '30ml', [['Bottle', 16500]]),
      AL('Copper Dog', 780, '30ml', [['Bottle', 16500]]),
      AL('Suntory Toki', 800, '30ml', [['Bottle', 16720]]),
      AL("Dewar's 15 Yo", 780, '30ml', [['Bottle', 16500]]),
      AL('Chivas Regal Xv', 830, '30ml', [['Bottle', 18920]]),
      AL('Chivas Regal 18 Yo', 870, '30ml', [['Bottle', 19250]]),
      AL('J.W. 18 Yo', 870, '30ml', [['Bottle', 19250]]),
      AL('J.W. Gold Reserve', 910, '30ml', [['Bottle', 20900]]),
      AL("D'Yavol Blended Malt Scotch", 1540, '30ml', [['Bottle', 35200]]),
      AL('Royal Brackla', 1540, '30ml', [['Bottle', 35200]]),
      AL("Dewar's 21 Yo", 2310, '30ml', [['Bottle', 53900]]),
      AL('Hibiki Harmony', 2370, '30ml', [['Bottle', 49500]]),
      AL('J.W. Blue Label', 2480, '30ml', [['Bottle', 58300]]),
      AL('Royal Salute 21 Yo', 2770, '30ml', [['Bottle', 58300]]),
      AL('Chivas Regal 25 Yo', 2920, '30ml', [['Bottle', 66550]]),
    ],
    'American Whisky & Bourbon': [
      AL('Budweiser Magnum Double Barrel', 440, '30ml', [['Bottle', 9900]]),
      AL('Jim Beam Bourbon', 510, '30ml', [['Bottle', 11550]]),
      AL("Evan William's", 550, '30ml', [['Bottle', 12650]]),
      AL("Jack Daniel's Old No. 7", 610, '30ml', [['Bottle', 13750]]),
      AL("Jack Daniel's Honey", 610, '30ml', [['Bottle', 13750]]),
      AL("Jack Daniel's Fire", 610, '30ml', [['Bottle', 13750]]),
      AL("Jack Daniel's Apple", 610, '30ml', [['Bottle', 13750]]),
      AL('Jim Beam Black', 630, '30ml', [['Bottle', 13860]]),
      AL('Woodford Reserve', 770, '30ml', [['Bottle', 17600]]),
      AL('Gentleman Jack', 870, '30ml', [['Bottle', 19800]]),
      AL("Jack Daniel's Single Barrel", 870, '30ml', [['Bottle', 19800]]),
      AL("Maker's Mark", 940, '30ml', [['Bottle', 20900]]),
      AL('Elijah Craig Small Batch', 1270, '30ml', [['Bottle', 27500]]),
    ],
    Vodka: [
      AL('Skyy', 330, '30ml', [['Bottle', 7700]]),
      AL('Ketel One', 350, '30ml', [['Bottle', 7920]]),
      AL('Absolut', 440, '30ml', [['Bottle', 9900]]),
      AL("Absolut Flavour's", 460, '30ml', [['Bottle', 10450]]),
      AL('Absolut Elyx', 680, '30ml', [['Bottle', 15400]]),
      AL('Grey Goose', 680, '30ml', [['Bottle', 15400]]),
      AL('Grey Goose Altius', 2850, '30ml', [['Bottle', 57500]]),
      AL('Ciroc', 680, '30ml', [['Bottle', 15400]]),
      AL("D'Yavol Single Estate", 680, '30ml', [['Bottle', 15400]]),
      AL('Belvedere', 830, '30ml', [['Bottle', 17050]]),
      AL('Beluga Noble', 840, '30ml', [['Bottle', 17600]]),
      AL('Belvedere Smogory', 840, '30ml', [['Bottle', 17600]]),
      AL('Belvedere Bartezek', 840, '30ml', [['Bottle', 17600]]),
      AL("U'Luvka", 920, '30ml', [['Bottle', 19250]]),
    ],
    Gin: [
      AL("Gordon's London Dry", 330, '30ml', [['Bottle', 7150]]),
      AL('Beefeater London Dry', 360, '30ml', [['Bottle', 7920]]),
      AL('Tanqueray', 440, '30ml', [['Bottle', 10450]]),
      AL('Tanqueray Rangpur', 440, '30ml', [['Bottle', 10450]]),
      AL('Tanqueray Malacca', 440, '30ml', [['Bottle', 10450]]),
      AL('Bombay Sapphire', 400, '30ml', [['Bottle', 8800]]),
      AL('Bombay Sapphire Sunset', 400, '30ml', [['Bottle', 8800]]),
      AL('Beefeater Pink', 400, '30ml', [['Bottle', 8800]]),
      AL("Burnett's London Dry", 400, '30ml', [['Bottle', 9350]]),
      AL('Tanqueray No.10 (1 Ltr)', 550, '30ml', [['Bottle', 18000]]),
      AL('Monkey 47', 660, '30ml', [['Bottle', 11220]]),
      AL('Malfy', 680, '30ml', [['Bottle', 16500]]),
      AL('Tenjaku Japanese', 680, '30ml', [['Bottle', 16500]]),
      AL("Hendrick's", 790, '30ml', [['Bottle', 16500]]),
      AL('Roku Gin Japanese', 790, '30ml', [['Bottle', 19250]]),
      AL('Sipsmith', 920, '30ml', [['Bottle', 20900]]),
    ],
    Rum: [
      AL('Bacardi Black', 270, '30ml', [['Bottle', 4950]]),
      AL('Captain Morgan Original', 270, '30ml', [['Bottle', 4950]]),
      AL('Bacardi Carta Blanca Superior', 310, '30ml', [['Bottle', 6600]]),
      AL('Bacardi Gold', 350, '30ml', [['Bottle', 7920]]),
      AL('Bacardi Limon', 350, '30ml', [['Bottle', 7920]]),
      AL('Bacardi Ginger / Mango Chilli', 350, '30ml', [['Bottle', 7920]]),
      AL("Seven River'S Spiced Rum", 350, '30ml', [['Bottle', 7920]]),
      AL('Havana Club 3Yo', 370, '30ml', [['Bottle', 8250]]),
      AL('Bacardi Grand Reserva Anejo 4 Yo', 510, '30ml', [['Bottle', 11550]]),
      AL('Bacardi Grand Reserva Ocho 8 Yo', 570, '30ml', [['Bottle', 13090]]),
      AL('Bacardi Grand Reserva Diez 10 Yo', 850, '30ml', [['Bottle', 19250]]),
    ],
    Tequila: [
      AL('El Jimador Blanco', 390, '30ml', [['Bottle', 8800]]),
      AL('Camino Real Blanco', 400, '30ml', [['Bottle', 9020]]),
      AL('Don Angel Blanco', 400, '30ml', [['Bottle', 9130]]),
      AL('Camino Real Gold', 420, '30ml', [['Bottle', 9680]]),
      AL('Jose Cuervo Silver', 550, '30ml', [['Bottle', 12650]]),
      AL('El Jimador Reposado', 680, '30ml', [['Bottle', 15400]]),
      AL('Jose Cuervo Reposado', 680, '30ml', [['Bottle', 15400]]),
      AL('Patron Silver', 790, '30ml', [['Bottle', 18150]]),
      AL('Patron El Cielo', 2550, '30ml', [['Bottle', 58700]]),
      AL('Don Julio Blanco', 800, '30ml', [['Bottle', 18150]]),
      AL('Don Julio Reposado', 830, '30ml', [['Bottle', 18920]]),
      AL('1800 Silver', 1160, '30ml', [['Bottle', 26400]]),
      AL('Patron Reposado', 1270, '30ml', [['Bottle', 26400]]),
      AL('Patron Anejo', 1480, '30ml', [['Bottle', 33300]]),
      AL('Patron El Alto', 3250, '30ml', [['Bottle', 71500]]),
      AL('1800 Reposado', 1320, '30ml', [['Bottle', 28600]]),
      AL('1800 Anejo', 1380, '30ml', [['Bottle', 30800]]),
      AL('Corralejo Anejo', 1380, '30ml', [['Bottle', 30800]]),
      AL('Don Julio 1942', 3140, '30ml', [['Bottle', 71500]]),
      AL('Clase Azul', 4180, '30ml', [['Bottle', 85800]]),
    ],
    Cognac: [
      AL('Honey Bee Brandy', 360, '30ml', [['Bottle', 6820]]),
      AL('Martell Vs', 510, '30ml', [['Bottle', 11550]]),
      AL('Hennessy Cognac Vs', 740, '30ml', [['Bottle', 16280]]),
      AL('Martell Vsop', 760, '30ml', [['Bottle', 18150]]),
      AL('Hennessy V.S.O.P', 1380, '30ml', [['Bottle', 27500]]),
      AL('Martell Xo', 2150, '30ml', [['Bottle', 49500]]),
      AL('Pisco Puro Quebranta', 490, '30ml', [['Bottle', 10680]]),
    ],
    Aperitifs: [
      AL('Cinzano Rosso', 440, '30ml', [['Bottle', 8250]]),
      AL('Lillet Blanc / Rose', 440, '30ml'),
      AL('Campari', 550, '30ml', [['Bottle', 13200]]),
      AL('Aperol', 660, '30ml', [['Bottle', 12100]]),
    ],
    Liqueur: [
      AL('Malibu Caribbean White', 440, '30ml'),
      AL('Conciere Triple Sec', 440, '30ml'),
      AL('Conciere Amaretto', 500, '30ml'),
      AL('Kahlua Licor Delicioso', 550, '30ml'),
      AL('Cointreau', 620, '30ml'),
      AL('Baileys Irish Cream', 660, '30ml', [['Bottle', 12100]]),
      AL('Baileys Salted Caramel', 660, '30ml', [['Bottle', 12100]]),
      AL('Baileys Strawberry Cream', 660, '30ml', [['Bottle', 12100]]),
      AL('The Choya (Umeshu)', 660, '30ml', [['Bottle', 12100]]),
      AL('Jägermeister Ice Cold Shot', 660, '30ml', [['Bottle', 14300]]),
      AL('Amarula Fruit Cream', 660, '30ml'),
      AL('Sambuca Extra', 720, '30ml'),
      AL('Absinthe Green', 830, '30ml'),
    ],
    Beer: [
      AL('Tuborg White Strong', 290, 'Pint'),
      AL('Carlsberg Elephant', 330, 'Pint'),
      AL('Carlsberg Smooth', 330, 'Pint'),
      AL('Heineken Lager', 330, 'Pint'),
      AL('Kingfisher Ultra', 330, 'Pint'),
      AL('Tuborg Green', 330, 'Pint'),
      AL('Tuborg Ice Draft', 330, 'Pint'),
      AL('King Fisher Ultra Witbier', 360, 'Pint'),
      AL('Budweiser', 390, 'Pint'),
      AL("Seven River'S Wheat", 390, 'Pint'),
      AL('Budweiser Magnum', 430, 'Pint'),
      AL('Heineken Silver', 430, 'Pint'),
      AL('Hoegaarden Original Wit', 540, 'Pint'),
      AL('Corona Extra', 610, 'Pint'),
      AL('Hoegaarden Rosée', 610, 'Pint'),
      AL('Hoegaarden Nectarine', 610, 'Pint'),
      AL('Kronenbourg 1664', 620, 'Pint'),
      AL('Peroni Nastro Azzurro', 770, 'Pint'),
      AL('Cass Lager', 970, 'Pint'),
    ],
    Breezer: [
      AL('Breezer Cranberry / Mango Peach', 450, 'Pint'),
      AL('Breezer Jamaican Passion / Blackberry', 450, 'Pint'),
    ],
  },

  Beverages: {
    Mocktails: [
      NA('Floral Connection', 330, 'Chamomile, Apple, Cranberry'),
      NA('Herbal Passion', 330, 'Kaffir Leaf, Passionfruit, Lychee'),
      NA('Quinine', 330, 'Pineapple, Grape, Peach Tonic Water'),
      NA('Spice Suki', 330, 'Yuzu, Jalapeno, Mint, Apple'),
      NA('Mandarin Root', 330, 'Orange, Beetroot'),
    ],
    'Soft Beverages': [
      NA('Mineral Water', 110),
      NA('Coke / Soda / Sprite (By Glass)', 140),
      NA('Diet Coke', 180),
      NA('Sch Ginger Ale', 180),
      NA('Sch Tonic Water', 180),
      NA('Sprite Can', 180),
      NA('Sprite / Coke (600 Ml)', 220),
      NA('Canned Juice', 240),
      NA('Perrier', 280),
    ],
    'Energy Zone': [
      NA('Red Bull Energy Drink', 270),
      NA('Red Bull Sugarfree', 270),
      NA('Red Bull Energy Yellow Edition', 270),
      NA('Red Bull Red Edition', 270),
    ],
  },

  Brunch: {
    'Sunday Brunch': [
      NA(
        'Sunday Brunch Buffet',
        1099,
        'Every Sunday 12pm-4pm, live music. Unlimited food with one mocktail. Buffet spreads: Soup, Salad Kiosk, Artisanal Cheese Board, Cold Cuts, Fresh Fruit Bar, Appetizer, Sushi Counter, Dimsum Counter, Roasted Chicken (with vegetables and chicken jus), Make Your Own Pasta, Main Offerings, Dessert Table. Menu subject to change without prior notice.'
      ),
    ],
  },
};

// ── build rows ───────────────────────────────────────────────────────────
function sqlStr(v) {
  if (v === null || v === undefined) return 'null';
  return `'${String(v).replace(/'/g, "''")}'`;
}
function sqlBool(v) {
  return v ? 'true' : 'false';
}
function sqlNum(v) {
  const n = parseFloat(v);
  return Number.isFinite(n) ? String(n) : 'null';
}

let categoryRows = [];
let itemRows = [];
let variantRows = [];
let categorySort = 0;

for (const [sectionName, categories] of Object.entries(DATA)) {
  for (const [catName, items] of Object.entries(categories)) {
    const categoryId = crypto.randomUUID();
    categoryRows.push({ id: categoryId, name: catName, section: sectionName, sort_order: categorySort });
    categorySort += 1;

    items.forEach((item, itemSort) => {
      const itemId = crypto.randomUUID();
      itemRows.push({
        id: itemId,
        category_id: categoryId,
        name: item.name,
        description: item.description,
        price: item.price,
        image_url: null,
        dietary_type: item.dietary_type,
        is_alcoholic: item.is_alcoholic,
        is_available: true,
        sort_order: itemSort,
      });
      item.variants.forEach(([label, price], variantSort) => {
        variantRows.push({ id: crypto.randomUUID(), menu_item_id: itemId, label, price, sort_order: variantSort });
      });
    });
  }
}

// ── write 0003_seed_tables.sql ──────────────────────────────────────────
const N_TABLES = 20;
let tablesSql = `-- Mitron Thane — QR table ordering
-- 0003_seed_tables.sql: starter set of ${N_TABLES} dining tables so the
-- customer flow (/order?table=N) works before the admin QR tool adds more.

insert into public.tables (table_number, is_active) values\n`;
tablesSql += Array.from({ length: N_TABLES }, (_, i) => `  (${i + 1}, true)`).join(',\n');
tablesSql += '\non conflict (table_number) do nothing;\n';
fs.writeFileSync(OUT_TABLES, tablesSql);

// ── write 0004_seed_menu.sql ────────────────────────────────────────────
let menuSql = `-- Mitron Thane — QR table ordering
-- 0004_seed_menu.sql: full menu transcribed from Mitron's public Zomato
-- listing (categories, menu items, and serving-size price variants).
-- Generated by scripts/generate-seed-sql.js — do not hand-edit; regenerate
-- from the DATA object in that script instead.

insert into public.categories (id, name, section, sort_order) values\n`;
menuSql += categoryRows
  .map((c) => `  (${sqlStr(c.id)}, ${sqlStr(c.name)}, ${sqlStr(c.section)}, ${c.sort_order})`)
  .join(',\n');
menuSql += ';\n\n';

menuSql += `insert into public.menu_items (id, category_id, name, description, price, image_url, dietary_type, is_alcoholic, is_available, sort_order) values\n`;
menuSql += itemRows
  .map(
    (i) =>
      `  (${sqlStr(i.id)}, ${sqlStr(i.category_id)}, ${sqlStr(i.name)}, ${sqlStr(i.description)}, ${sqlNum(
        i.price
      )}, ${sqlStr(i.image_url)}, ${sqlStr(i.dietary_type)}, ${sqlBool(i.is_alcoholic)}, ${sqlBool(
        i.is_available
      )}, ${i.sort_order})`
  )
  .join(',\n');
menuSql += ';\n\n';

if (variantRows.length) {
  menuSql += `insert into public.menu_item_variants (id, menu_item_id, label, price, sort_order) values\n`;
  menuSql += variantRows
    .map(
      (v) =>
        `  (${sqlStr(v.id)}, ${sqlStr(v.menu_item_id)}, ${sqlStr(v.label)}, ${sqlNum(v.price)}, ${v.sort_order})`
    )
    .join(',\n');
  menuSql += ';\n';
}

fs.writeFileSync(OUT_MENU, menuSql);

console.log(`categories: ${categoryRows.length}`);
console.log(`items: ${itemRows.length}`);
console.log(`variants: ${variantRows.length}`);
console.log(`wrote ${OUT_TABLES}`);
console.log(`wrote ${OUT_MENU}`);
