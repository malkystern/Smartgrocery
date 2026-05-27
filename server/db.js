const stores = [
  { id: 1, name: 'Seasons Kosher',     logo_color: '#2196F3', location: 'Cedarhurst, NY' },
  { id: 2, name: 'Evergreen Kosher',   logo_color: '#4CAF50', location: 'Monsey, NY' },
  { id: 3, name: 'Pomegranate',        logo_color: '#9C27B0', location: 'Brooklyn, NY' },
  { id: 4, name: 'KRM (Kings Kosher)', logo_color: '#FF5722', location: 'Brooklyn, NY' },
  { id: 5, name: 'Glatt Mart',         logo_color: '#F44336', location: 'Boro Park, NY' },
  { id: 6, name: 'Rockland Kosher',    logo_color: '#009688', location: 'Spring Valley, NY' },
];

const certs = [
  { id: 1, name: 'Orthodox Union',            abbreviation: 'OU' },
  { id: 2, name: 'OK Kosher',                 abbreviation: 'OK' },
  { id: 3, name: 'Star-K',                    abbreviation: 'Star-K' },
  { id: 4, name: 'Kof-K',                     abbreviation: 'Kof-K' },
  { id: 5, name: 'Chicago Rabbinical Council', abbreviation: 'CRC' },
];

const products = [
  // Dairy
  { id:1,  name:'Whole Milk',           category:'Dairy',     unit:'1 gallon',  brand:'Golden Flow',    cert_id:1, kosher_level:'cholov_yisroel' },
  { id:2,  name:'Butter',               category:'Dairy',     unit:'1 lb',      brand:"Breakstone's",   cert_id:1, kosher_level:'kosher' },
  { id:3,  name:'Cream Cheese',         category:'Dairy',     unit:'8 oz',      brand:'Philadelphia',   cert_id:1, kosher_level:'kosher' },
  { id:4,  name:'Shredded Mozzarella',  category:'Dairy',     unit:'16 oz',     brand:'Haolam',         cert_id:2, kosher_level:'cholov_yisroel' },
  { id:5,  name:'Greek Yogurt',         category:'Dairy',     unit:'5.3 oz',    brand:'Chobani',        cert_id:1, kosher_level:'kosher' },
  { id:6,  name:'Sour Cream',           category:'Dairy',     unit:'16 oz',     brand:"Breakstone's",   cert_id:1, kosher_level:'kosher' },
  { id:7,  name:'Heavy Cream',          category:'Dairy',     unit:'1 pint',    brand:'Golden Flow',    cert_id:1, kosher_level:'cholov_yisroel' },
  // Meat
  { id:8,  name:'Chicken Breast',       category:'Meat',      unit:'per lb',    brand:'Empire',         cert_id:1, kosher_level:'glatt' },
  { id:9,  name:'Ground Beef 80/20',    category:'Meat',      unit:'per lb',    brand:'Alle',           cert_id:1, kosher_level:'glatt' },
  { id:10, name:'Flanken',              category:'Meat',      unit:'per lb',    brand:'Meal Mart',      cert_id:2, kosher_level:'glatt' },
  { id:11, name:'Chicken Cutlets',      category:'Meat',      unit:'per lb',    brand:'Empire',         cert_id:1, kosher_level:'glatt' },
  { id:12, name:'Turkey Breast',        category:'Meat',      unit:'per lb',    brand:'Meal Mart',      cert_id:2, kosher_level:'glatt' },
  { id:13, name:'Hot Dogs (Glatt)',     category:'Meat',      unit:'per pack',  brand:'Empire',         cert_id:1, kosher_level:'glatt' },
  { id:14, name:'Hot Dogs (Kosher)',    category:'Meat',      unit:'per pack',  brand:'Hebrew National',cert_id:4, kosher_level:'kosher' },
  // Bakery
  { id:15, name:'Challah Bread',        category:'Bakery',    unit:'1 loaf',    brand:"Zomick's",       cert_id:1, kosher_level:'pas_yisroel' },
  { id:16, name:'White Sandwich Bread', category:'Bakery',    unit:'20 oz',     brand:"Streit's",       cert_id:1, kosher_level:'kosher' },
  { id:17, name:'Rye Bread',            category:'Bakery',    unit:'16 oz',     brand:"Streit's",       cert_id:1, kosher_level:'kosher' },
  { id:18, name:'Matzah',               category:'Bakery',    unit:'5 lb',      brand:'Manischewitz',   cert_id:1, kosher_level:'pas_yisroel' },
  { id:19, name:'Bagels',               category:'Bakery',    unit:'6-pack',    brand:'Lenders',        cert_id:1, kosher_level:'kosher' },
  // Pantry
  { id:20, name:'Olive Oil',            category:'Pantry',    unit:'500 ml',    brand:"Lieber's",       cert_id:1, kosher_level:'kosher' },
  { id:21, name:'Pasta',                category:'Pantry',    unit:'500 g',     brand:'Osem',           cert_id:2, kosher_level:'kosher' },
  { id:22, name:'Rice',                 category:'Pantry',    unit:'2 lb',      brand:'Kemach',         cert_id:1, kosher_level:'kosher' },
  { id:23, name:'Canned Tomatoes',      category:'Pantry',    unit:'28 oz',     brand:"Lieber's",       cert_id:1, kosher_level:'kosher' },
  { id:24, name:'Chicken Broth',        category:'Pantry',    unit:'32 oz',     brand:'Manischewitz',   cert_id:1, kosher_level:'kosher' },
  { id:25, name:'Sugar',                category:'Pantry',    unit:'5 lb',      brand:'Domino',         cert_id:1, kosher_level:'kosher' },
  { id:26, name:'Flour',                category:'Pantry',    unit:'5 lb',      brand:'Kemach',         cert_id:1, kosher_level:'kosher' },
  { id:27, name:'Honey',                category:'Pantry',    unit:'16 oz',     brand:"Lieber's",       cert_id:1, kosher_level:'kosher' },
  { id:28, name:'Grape Juice',          category:'Pantry',    unit:'64 oz',     brand:'Kedem',          cert_id:1, kosher_level:'kosher' },
  { id:29, name:'Tuna (Canned)',        category:'Pantry',    unit:'5 oz can',  brand:'Bumble Bee',     cert_id:4, kosher_level:'kosher' },
  // Frozen
  { id:30, name:'Cheese Pizza',         category:'Frozen',    unit:'1 pizza',   brand:'Meal Mart',      cert_id:2, kosher_level:'cholov_yisroel' },
  { id:31, name:'Blintzes',             category:'Frozen',    unit:'13 oz',     brand:'Golden',         cert_id:1, kosher_level:'kosher' },
  { id:32, name:'Knishes',              category:'Frozen',    unit:'4-pack',    brand:"Gabila's",       cert_id:1, kosher_level:'kosher' },
  { id:33, name:'Veggie Burgers',       category:'Frozen',    unit:'4-pack',    brand:"Dr. Praeger's",  cert_id:1, kosher_level:'kosher' },
  // Beverages
  { id:34, name:'Orange Juice',         category:'Beverages', unit:'52 oz',     brand:'Tropicana',      cert_id:1, kosher_level:'kosher' },
  { id:35, name:'Seltzer',              category:'Beverages', unit:'12-pack',   brand:'Vintage',        cert_id:1, kosher_level:'kosher' },
  { id:36, name:'Apple Juice',          category:'Beverages', unit:'64 oz',     brand:'Kedem',          cert_id:1, kosher_level:'kosher' },
  // Produce
  { id:37, name:'Apples',               category:'Produce',   unit:'3 lb bag',  brand:'Fresh',          cert_id:1, kosher_level:'kosher' },
  { id:38, name:'Bananas',              category:'Produce',   unit:'per lb',    brand:'Fresh',          cert_id:1, kosher_level:'kosher' },
  { id:39, name:'Tomatoes',             category:'Produce',   unit:'per lb',    brand:'Fresh',          cert_id:1, kosher_level:'kosher' },
  { id:40, name:'Broccoli',             category:'Produce',   unit:'per head',  brand:'Fresh',          cert_id:1, kosher_level:'kosher' },
  { id:41, name:'Carrots',              category:'Produce',   unit:'2 lb bag',  brand:'Fresh',          cert_id:1, kosher_level:'kosher' },
  { id:42, name:'Onions',               category:'Produce',   unit:'3 lb bag',  brand:'Fresh',          cert_id:1, kosher_level:'kosher' },
  { id:43, name:'Potatoes',             category:'Produce',   unit:'5 lb bag',  brand:'Fresh',          cert_id:1, kosher_level:'kosher' },
  // Deli
  { id:44, name:'Pastrami',             category:'Deli',      unit:'per lb',    brand:'Meal Mart',      cert_id:2, kosher_level:'glatt' },
  { id:45, name:'Salami',               category:'Deli',      unit:'7 oz',      brand:'Hebrew National',cert_id:4, kosher_level:'kosher' },
  { id:46, name:'Turkey Deli Slices',   category:'Deli',      unit:'per lb',    brand:'Meal Mart',      cert_id:2, kosher_level:'glatt' },
];

// Store index: 0=Seasons, 1=Evergreen, 2=Pomegranate, 3=KRM, 4=Glatt Mart, 5=Rockland
const priceTable = {
  1:  [5.49,5.29,5.99,4.99,4.89,5.19],
  2:  [4.29,4.19,4.79,3.99,3.89,4.09],
  3:  [3.49,3.39,3.79,3.19,3.09,3.29],
  4:  [6.49,6.29,6.99,5.99,5.89,6.19],
  5:  [1.79,1.69,1.99,1.59,1.49,1.69],
  6:  [2.99,2.89,3.29,2.69,2.59,2.79],
  7:  [3.99,3.79,4.29,3.59,3.49,3.79],
  8:  [7.99,7.79,8.99,6.99,6.89,7.49],
  9:  [6.99,6.79,7.49,6.29,6.19,6.59],
  10: [11.99,11.49,12.99,10.99,10.79,11.29],
  11: [8.49,8.29,9.49,7.49,7.39,7.99],
  12: [9.49,9.29,10.49,8.49,8.39,8.99],
  13: [6.49,6.29,6.99,5.99,5.89,6.19],
  14: [4.99,4.79,5.49,4.49,4.39,4.69],
  15: [7.99,7.49,9.99,6.99,6.79,7.49],
  16: [3.49,3.29,3.79,2.99,2.89,3.19],
  17: [3.79,3.59,4.09,3.29,3.19,3.49],
  18: [8.99,8.79,9.49,8.49,8.29,8.69],
  19: [4.49,4.29,4.99,3.99,3.89,4.19],
  20: [7.99,7.79,8.49,7.49,7.29,7.69],
  21: [2.49,2.39,2.79,2.19,2.09,2.29],
  22: [3.49,3.29,3.79,2.99,2.89,3.19],
  23: [2.29,2.19,2.59,1.99,1.89,2.09],
  24: [3.29,3.19,3.69,2.99,2.89,3.09],
  25: [4.49,4.29,4.99,3.99,3.89,4.19],
  26: [4.29,4.09,4.79,3.79,3.69,3.99],
  27: [5.49,5.29,5.99,4.99,4.89,5.19],
  28: [6.49,6.29,6.99,5.99,5.89,6.19],
  29: [1.99,1.89,2.29,1.79,1.69,1.89],
  30: [9.99,9.79,10.99,8.99,8.79,9.49],
  31: [5.49,5.29,5.99,4.99,4.89,5.19],
  32: [5.99,5.79,6.49,5.49,5.39,5.69],
  33: [5.49,5.29,5.99,4.99,4.89,5.19],
  34: [4.99,4.79,5.49,4.49,4.39,4.69],
  35: [6.99,6.79,7.49,6.49,6.29,6.69],
  36: [5.49,5.29,5.99,4.99,4.89,5.19],
  37: [3.99,3.79,4.29,3.59,3.49,3.79],
  38: [0.79,0.69,0.89,0.59,0.55,0.69],
  39: [2.49,2.29,2.79,2.09,1.99,2.19],
  40: [2.49,2.29,2.79,2.09,1.99,2.19],
  41: [2.29,2.09,2.59,1.89,1.79,1.99],
  42: [2.49,2.29,2.79,2.09,1.99,2.19],
  43: [4.49,4.29,4.99,3.99,3.89,4.19],
  44: [12.99,12.49,13.99,11.99,11.79,12.29],
  45: [5.49,5.29,5.99,4.99,4.89,5.19],
  46: [10.99,10.49,11.99,9.99,9.79,10.29],
};

const substitutions = [
  { product_id:8,  substitute_id:11, reason:'Chicken cutlets — same brand, often on sale' },
  { product_id:11, substitute_id:8,  reason:'Chicken breast — same Empire brand, lower price' },
  { product_id:13, substitute_id:14, reason:'Kosher hot dogs at lower price point' },
  { product_id:15, substitute_id:16, reason:'White bread for everyday use — significant savings' },
  { product_id:9,  substitute_id:10, reason:'Flanken adds rich flavor at similar price' },
  { product_id:10, substitute_id:9,  reason:'Ground beef — more versatile, often cheaper' },
  { product_id:44, substitute_id:46, reason:'Turkey deli — lighter, lower cost per lb' },
  { product_id:3,  substitute_id:6,  reason:'Sour cream works in many cream cheese recipes' },
];

function getCert(certId) {
  return certs.find(c => c.id === certId) || { name: '', abbreviation: '' };
}

function formatProduct(p) {
  const cert = getCert(p.cert_id);
  return {
    id: p.id, name: p.name, brand: p.brand, category: p.category,
    unit: p.unit, kosher_level: p.kosher_level,
    cert: { name: cert.name, abbreviation: cert.abbreviation },
  };
}

function getPrice(productId, storeIndex) {
  const prices = priceTable[productId];
  return prices ? prices[storeIndex] : null;
}

module.exports = { stores, products, substitutions, formatProduct, getPrice };
