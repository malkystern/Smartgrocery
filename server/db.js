const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, 'smartgrocery.db');

function initDb() {
  const db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');

  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS stores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      logo_color TEXT NOT NULL,
      location TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS kosher_certs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      abbreviation TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      unit TEXT NOT NULL,
      brand TEXT NOT NULL,
      cert_id INTEGER,
      kosher_level TEXT NOT NULL DEFAULT 'kosher',
      FOREIGN KEY (cert_id) REFERENCES kosher_certs(id)
    );

    CREATE TABLE IF NOT EXISTS prices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      store_id INTEGER NOT NULL,
      price REAL NOT NULL,
      FOREIGN KEY (product_id) REFERENCES products(id),
      FOREIGN KEY (store_id) REFERENCES stores(id)
    );

    CREATE TABLE IF NOT EXISTS substitutions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      substitute_id INTEGER NOT NULL,
      reason TEXT NOT NULL,
      FOREIGN KEY (product_id) REFERENCES products(id),
      FOREIGN KEY (substitute_id) REFERENCES products(id)
    );
  `);

  // Check if already seeded
  const storeCount = db.prepare('SELECT COUNT(*) as count FROM stores').get();
  if (storeCount.count > 0) {
    return db;
  }

  // ─── Seed Stores ───
  const insertStore = db.prepare('INSERT INTO stores (name, logo_color, location) VALUES (?, ?, ?)');
  const stores = [
    { name: 'Seasons Kosher',   logo_color: '#2196F3', location: 'Cedarhurst, NY' },
    { name: 'Evergreen Kosher', logo_color: '#4CAF50', location: 'Monsey, NY' },
    { name: 'Pomegranate',      logo_color: '#9C27B0', location: 'Brooklyn, NY' },
    { name: 'KRM (Kings Kosher)', logo_color: '#FF5722', location: 'Brooklyn, NY' },
    { name: 'Glatt Mart',       logo_color: '#F44336', location: 'Boro Park, NY' },
    { name: 'Rockland Kosher',  logo_color: '#009688', location: 'Spring Valley, NY' },
  ];
  stores.forEach(s => insertStore.run(s.name, s.logo_color, s.location));

  // ─── Seed Kosher Certs ───
  const insertCert = db.prepare('INSERT INTO kosher_certs (name, abbreviation) VALUES (?, ?)');
  const certs = [
    { name: 'Orthodox Union',    abbreviation: 'OU' },
    { name: 'OK Kosher',         abbreviation: 'OK' },
    { name: 'Star-K',            abbreviation: 'Star-K' },
    { name: 'Kof-K',             abbreviation: 'Kof-K' },
    { name: 'Chicago Rabbinical Council', abbreviation: 'CRC' },
  ];
  certs.forEach(c => insertCert.run(c.name, c.abbreviation));
  // cert IDs: OU=1, OK=2, Star-K=3, Kof-K=4, CRC=5

  // ─── Seed Products ───
  const insertProduct = db.prepare(
    'INSERT INTO products (name, category, unit, brand, cert_id, kosher_level) VALUES (?, ?, ?, ?, ?, ?)'
  );

  const products = [
    // Dairy
    { name: 'Whole Milk',          category: 'Dairy',     unit: '1 gallon',  brand: 'Golden Flow',   cert_id: 1, kosher_level: 'cholov_yisroel' },
    { name: 'Butter',              category: 'Dairy',     unit: '1 lb',      brand: "Breakstone's",  cert_id: 1, kosher_level: 'kosher' },
    { name: 'Cream Cheese',        category: 'Dairy',     unit: '8 oz',      brand: 'Philadelphia',  cert_id: 1, kosher_level: 'kosher' },
    { name: 'Shredded Mozzarella', category: 'Dairy',     unit: '16 oz',     brand: 'Haolam',        cert_id: 2, kosher_level: 'cholov_yisroel' },
    { name: 'Greek Yogurt',        category: 'Dairy',     unit: '5.3 oz',    brand: 'Chobani',       cert_id: 1, kosher_level: 'kosher' },
    { name: 'Sour Cream',          category: 'Dairy',     unit: '16 oz',     brand: "Breakstone's",  cert_id: 1, kosher_level: 'kosher' },
    { name: 'Heavy Cream',         category: 'Dairy',     unit: '1 pint',    brand: 'Golden Flow',   cert_id: 1, kosher_level: 'cholov_yisroel' },
    // Meat
    { name: 'Chicken Breast',      category: 'Meat',      unit: 'per lb',    brand: 'Empire',        cert_id: 1, kosher_level: 'glatt' },
    { name: 'Ground Beef 80/20',   category: 'Meat',      unit: 'per lb',    brand: 'Alle',          cert_id: 1, kosher_level: 'glatt' },
    { name: 'Flanken',             category: 'Meat',      unit: 'per lb',    brand: 'Meal Mart',     cert_id: 2, kosher_level: 'glatt' },
    { name: 'Chicken Cutlets',     category: 'Meat',      unit: 'per lb',    brand: 'Empire',        cert_id: 1, kosher_level: 'glatt' },
    { name: 'Turkey Breast',       category: 'Meat',      unit: 'per lb',    brand: 'Meal Mart',     cert_id: 2, kosher_level: 'glatt' },
    { name: 'Hot Dogs (Glatt)',    category: 'Meat',      unit: 'per pack',  brand: 'Empire',        cert_id: 1, kosher_level: 'glatt' },
    { name: 'Hot Dogs (Kosher)',   category: 'Meat',      unit: 'per pack',  brand: 'Hebrew National', cert_id: 4, kosher_level: 'kosher' },
    // Bakery
    { name: 'Challah Bread',       category: 'Bakery',    unit: '1 loaf',    brand: "Zomick's",      cert_id: 1, kosher_level: 'pas_yisroel' },
    { name: 'White Sandwich Bread',category: 'Bakery',    unit: '20 oz',     brand: "Streit's",      cert_id: 1, kosher_level: 'kosher' },
    { name: 'Rye Bread',           category: 'Bakery',    unit: '16 oz',     brand: "Streit's",      cert_id: 1, kosher_level: 'kosher' },
    { name: 'Matzah',              category: 'Bakery',    unit: '5 lb',      brand: 'Manischewitz',  cert_id: 1, kosher_level: 'pas_yisroel' },
    { name: 'Bagels',              category: 'Bakery',    unit: '6-pack',    brand: 'Lenders',       cert_id: 1, kosher_level: 'kosher' },
    // Pantry
    { name: 'Olive Oil',           category: 'Pantry',    unit: '500 ml',    brand: "Lieber's",      cert_id: 1, kosher_level: 'kosher' },
    { name: 'Pasta',               category: 'Pantry',    unit: '500 g',     brand: 'Osem',          cert_id: 2, kosher_level: 'kosher' },
    { name: 'Rice',                category: 'Pantry',    unit: '2 lb',      brand: 'Kemach',        cert_id: 1, kosher_level: 'kosher' },
    { name: 'Canned Tomatoes',     category: 'Pantry',    unit: '28 oz',     brand: "Lieber's",      cert_id: 1, kosher_level: 'kosher' },
    { name: 'Chicken Broth',       category: 'Pantry',    unit: '32 oz',     brand: 'Manischewitz',  cert_id: 1, kosher_level: 'kosher' },
    { name: 'Sugar',               category: 'Pantry',    unit: '5 lb',      brand: 'Domino',        cert_id: 1, kosher_level: 'kosher' },
    { name: 'Flour',               category: 'Pantry',    unit: '5 lb',      brand: 'Kemach',        cert_id: 1, kosher_level: 'kosher' },
    { name: 'Honey',               category: 'Pantry',    unit: '16 oz',     brand: "Lieber's",      cert_id: 1, kosher_level: 'kosher' },
    { name: 'Grape Juice',         category: 'Pantry',    unit: '64 oz',     brand: 'Kedem',         cert_id: 1, kosher_level: 'kosher' },
    { name: 'Tuna (Canned)',       category: 'Pantry',    unit: '5 oz can',  brand: 'Bumble Bee',    cert_id: 4, kosher_level: 'kosher' },
    // Frozen
    { name: 'Cheese Pizza',        category: 'Frozen',    unit: '1 pizza',   brand: 'Meal Mart',     cert_id: 2, kosher_level: 'cholov_yisroel' },
    { name: 'Blintzes',            category: 'Frozen',    unit: '13 oz',     brand: 'Golden',        cert_id: 1, kosher_level: 'kosher' },
    { name: 'Knishes',             category: 'Frozen',    unit: '4-pack',    brand: "Gabila's",      cert_id: 1, kosher_level: 'kosher' },
    { name: 'Veggie Burgers',      category: 'Frozen',    unit: '4-pack',    brand: "Dr. Praeger's", cert_id: 1, kosher_level: 'kosher' },
    // Beverages
    { name: 'Orange Juice',        category: 'Beverages', unit: '52 oz',     brand: 'Tropicana',     cert_id: 1, kosher_level: 'kosher' },
    { name: 'Seltzer',             category: 'Beverages', unit: '12-pack',   brand: 'Vintage',       cert_id: 1, kosher_level: 'kosher' },
    { name: 'Apple Juice',         category: 'Beverages', unit: '64 oz',     brand: 'Kedem',         cert_id: 1, kosher_level: 'kosher' },
    // Produce
    { name: 'Apples',              category: 'Produce',   unit: '3 lb bag',  brand: 'Fresh',         cert_id: 1, kosher_level: 'kosher' },
    { name: 'Bananas',             category: 'Produce',   unit: 'per lb',    brand: 'Fresh',         cert_id: 1, kosher_level: 'kosher' },
    { name: 'Tomatoes',            category: 'Produce',   unit: 'per lb',    brand: 'Fresh',         cert_id: 1, kosher_level: 'kosher' },
    { name: 'Broccoli',            category: 'Produce',   unit: 'per head',  brand: 'Fresh',         cert_id: 1, kosher_level: 'kosher' },
    { name: 'Carrots',             category: 'Produce',   unit: '2 lb bag',  brand: 'Fresh',         cert_id: 1, kosher_level: 'kosher' },
    { name: 'Onions',              category: 'Produce',   unit: '3 lb bag',  brand: 'Fresh',         cert_id: 1, kosher_level: 'kosher' },
    { name: 'Potatoes',            category: 'Produce',   unit: '5 lb bag',  brand: 'Fresh',         cert_id: 1, kosher_level: 'kosher' },
    // Deli
    { name: 'Pastrami',            category: 'Deli',      unit: 'per lb',    brand: 'Meal Mart',     cert_id: 2, kosher_level: 'glatt' },
    { name: 'Salami',              category: 'Deli',      unit: '7 oz',      brand: 'Hebrew National', cert_id: 4, kosher_level: 'kosher' },
    { name: 'Turkey Deli Slices',  category: 'Deli',      unit: 'per lb',    brand: 'Meal Mart',     cert_id: 2, kosher_level: 'glatt' },
  ];

  products.forEach(p =>
    insertProduct.run(p.name, p.category, p.unit, p.brand, p.cert_id, p.kosher_level)
  );

  // Product IDs (by insertion order, 1-indexed):
  // 1=Whole Milk, 2=Butter, 3=Cream Cheese, 4=Shredded Mozzarella, 5=Greek Yogurt, 6=Sour Cream, 7=Heavy Cream
  // 8=Chicken Breast, 9=Ground Beef, 10=Flanken, 11=Chicken Cutlets, 12=Turkey Breast, 13=Hot Dogs(Glatt), 14=Hot Dogs(Kosher)
  // 15=Challah, 16=White Bread, 17=Rye Bread, 18=Matzah, 19=Bagels
  // 20=Olive Oil, 21=Pasta, 22=Rice, 23=Canned Tomatoes, 24=Chicken Broth, 25=Sugar, 26=Flour, 27=Honey, 28=Grape Juice, 29=Tuna
  // 30=Cheese Pizza, 31=Blintzes, 32=Knishes, 33=Veggie Burgers
  // 34=Orange Juice, 35=Seltzer, 36=Apple Juice
  // 37=Apples, 38=Bananas, 39=Tomatoes, 40=Broccoli, 41=Carrots, 42=Onions, 43=Potatoes
  // 44=Pastrami, 45=Salami, 46=Turkey Deli

  // ─── Seed Prices ───
  // Store IDs: 1=Seasons, 2=Evergreen, 3=Pomegranate, 4=KRM, 5=Glatt Mart, 6=Rockland
  // Pricing pattern: Seasons/Evergreen = mid-range, Pomegranate = slightly higher, KRM/Glatt Mart = slightly cheaper, Rockland = competitive
  const insertPrice = db.prepare('INSERT INTO prices (product_id, store_id, price) VALUES (?, ?, ?)');

  // [product_id, [Seasons, Evergreen, Pomegranate, KRM, Glatt Mart, Rockland]]
  const priceData = [
    // Dairy
    [1,  [5.49, 5.29, 5.99, 4.99, 4.89, 5.19]],  // Whole Milk
    [2,  [4.29, 4.19, 4.79, 3.99, 3.89, 4.09]],  // Butter
    [3,  [3.49, 3.39, 3.79, 3.19, 3.09, 3.29]],  // Cream Cheese
    [4,  [6.49, 6.29, 6.99, 5.99, 5.89, 6.19]],  // Shredded Mozzarella
    [5,  [1.79, 1.69, 1.99, 1.59, 1.49, 1.69]],  // Greek Yogurt
    [6,  [2.99, 2.89, 3.29, 2.69, 2.59, 2.79]],  // Sour Cream
    [7,  [3.99, 3.79, 4.29, 3.59, 3.49, 3.79]],  // Heavy Cream
    // Meat
    [8,  [7.99, 7.79, 8.99, 6.99, 6.89, 7.49]],  // Chicken Breast
    [9,  [6.99, 6.79, 7.49, 6.29, 6.19, 6.59]],  // Ground Beef
    [10, [11.99, 11.49, 12.99, 10.99, 10.79, 11.29]], // Flanken
    [11, [8.49, 8.29, 9.49, 7.49, 7.39, 7.99]],  // Chicken Cutlets
    [12, [9.49, 9.29, 10.49, 8.49, 8.39, 8.99]],  // Turkey Breast
    [13, [6.49, 6.29, 6.99, 5.99, 5.89, 6.19]],  // Hot Dogs Glatt
    [14, [4.99, 4.79, 5.49, 4.49, 4.39, 4.69]],  // Hot Dogs Kosher
    // Bakery
    [15, [7.99, 7.49, 9.99, 6.99, 6.79, 7.49]],  // Challah
    [16, [3.49, 3.29, 3.79, 2.99, 2.89, 3.19]],  // White Bread
    [17, [3.79, 3.59, 4.09, 3.29, 3.19, 3.49]],  // Rye Bread
    [18, [8.99, 8.79, 9.49, 8.49, 8.29, 8.69]],  // Matzah
    [19, [4.49, 4.29, 4.99, 3.99, 3.89, 4.19]],  // Bagels
    // Pantry
    [20, [7.99, 7.79, 8.49, 7.49, 7.29, 7.69]],  // Olive Oil
    [21, [2.49, 2.39, 2.79, 2.19, 2.09, 2.29]],  // Pasta
    [22, [3.49, 3.29, 3.79, 2.99, 2.89, 3.19]],  // Rice
    [23, [2.29, 2.19, 2.59, 1.99, 1.89, 2.09]],  // Canned Tomatoes
    [24, [3.29, 3.19, 3.69, 2.99, 2.89, 3.09]],  // Chicken Broth
    [25, [4.49, 4.29, 4.99, 3.99, 3.89, 4.19]],  // Sugar
    [26, [4.29, 4.09, 4.79, 3.79, 3.69, 3.99]],  // Flour
    [27, [5.49, 5.29, 5.99, 4.99, 4.89, 5.19]],  // Honey
    [28, [6.49, 6.29, 6.99, 5.99, 5.89, 6.19]],  // Grape Juice
    [29, [1.99, 1.89, 2.29, 1.79, 1.69, 1.89]],  // Tuna
    // Frozen
    [30, [9.99, 9.79, 10.99, 8.99, 8.79, 9.49]],  // Cheese Pizza
    [31, [5.49, 5.29, 5.99, 4.99, 4.89, 5.19]],  // Blintzes
    [32, [5.99, 5.79, 6.49, 5.49, 5.39, 5.69]],  // Knishes
    [33, [5.49, 5.29, 5.99, 4.99, 4.89, 5.19]],  // Veggie Burgers
    // Beverages
    [34, [4.99, 4.79, 5.49, 4.49, 4.39, 4.69]],  // Orange Juice
    [35, [6.99, 6.79, 7.49, 6.49, 6.29, 6.69]],  // Seltzer
    [36, [5.49, 5.29, 5.99, 4.99, 4.89, 5.19]],  // Apple Juice
    // Produce
    [37, [3.99, 3.79, 4.29, 3.59, 3.49, 3.79]],  // Apples
    [38, [0.79, 0.69, 0.89, 0.59, 0.55, 0.69]],  // Bananas
    [39, [2.49, 2.29, 2.79, 2.09, 1.99, 2.19]],  // Tomatoes
    [40, [2.49, 2.29, 2.79, 2.09, 1.99, 2.19]],  // Broccoli
    [41, [2.29, 2.09, 2.59, 1.89, 1.79, 1.99]],  // Carrots
    [42, [2.49, 2.29, 2.79, 2.09, 1.99, 2.19]],  // Onions
    [43, [4.49, 4.29, 4.99, 3.99, 3.89, 4.19]],  // Potatoes
    // Deli
    [44, [12.99, 12.49, 13.99, 11.99, 11.79, 12.29]], // Pastrami
    [45, [5.49, 5.29, 5.99, 4.99, 4.89, 5.19]],  // Salami
    [46, [10.99, 10.49, 11.99, 9.99, 9.79, 10.29]], // Turkey Deli
  ];

  const seedPrices = db.transaction(() => {
    for (const [productId, storePrices] of priceData) {
      storePrices.forEach((price, idx) => {
        insertPrice.run(productId, idx + 1, price);
      });
    }
  });
  seedPrices();

  // ─── Seed Substitutions ───
  // Format: [product_id, substitute_id, reason]
  const insertSub = db.prepare('INSERT INTO substitutions (product_id, substitute_id, reason) VALUES (?, ?, ?)');
  const subs = [
    [1,  5,  'Greek yogurt is a versatile dairy swap'],         // Whole Milk → Greek Yogurt (illustrative)
    [8,  11, 'Chicken cutlets — same brand, often on sale'],    // Chicken Breast → Chicken Cutlets
    [11, 8,  'Chicken breast — same Empire brand, lower price'], // Chicken Cutlets → Chicken Breast
    [13, 14, 'Kosher hot dogs at lower price point'],           // Hot Dogs Glatt → Hot Dogs Kosher
    [15, 16, 'White bread for everyday use — significant savings'], // Challah → White Bread
    [9,  10, 'Flanken adds rich flavor at similar price'],      // Ground Beef → Flanken
    [10, 9,  'Ground beef — more versatile, often cheaper'],    // Flanken → Ground Beef
    [20, 23, 'Canned tomatoes for cooking — much cheaper'],     // Olive Oil → Canned Tomatoes (illustrative)
    [44, 46, 'Turkey deli — lighter, lower cost per lb'],       // Pastrami → Turkey Deli
    [3,  6,  'Sour cream works in many cream cheese recipes'],  // Cream Cheese → Sour Cream
  ];
  subs.forEach(([pid, sid, reason]) => insertSub.run(pid, sid, reason));

  console.log('SmartGrocery database seeded successfully.');
  return db;
}

module.exports = initDb;
