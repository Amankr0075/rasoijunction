import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import MenuItem from '../modules/menu/menu.model.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, '../../../.env') });

// Carefully curated, verified food image URLs for each dish
// Using a mix of Unsplash direct links and source redirects
const fixedImages = {
  // ─── Indian Desserts & Sweets ──────────────────────────────
  'Rasmalai (2 Pcs)':         '/dishes/rasmalai.png',
  'Gulab Jamun':              '/dishes/gulab_jamun.png',
  'Kaju Katli (4 Pcs)':       '/dishes/kaju_katli.png',
  'Cardamom Rice Kheer':      'https://images.unsplash.com/photo-1631452180775-75dc2254e9db?auto=format&fit=crop&w=500&q=80',
  'Mango Kulfi':              '/dishes/mango_kulfi.png',
  'Chocolate Lava Cake':      '/dishes/chocolate_lava_cake.png',
  'Warm Brownie with Ice Cream': 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=500&q=80',

  // ─── Beverages ─────────────────────────────────────────────
  'Mango Lassi':              '/dishes/mango_lassi.png',
  'Sweet Lassi':              'https://images.unsplash.com/photo-1571006682887-8e6580f55cf5?auto=format&fit=crop&w=500&q=80',
  'Cold Coffee with Ice Cream': 'https://images.unsplash.com/photo-1541658016709-82535e94bc69?auto=format&fit=crop&w=500&q=80',

  // ─── North Indian Curries & Mains ─────────────────────────
  'Butter Chicken':           '/dishes/butter_chicken.png',
  'Mutton Rogan Josh':        '/dishes/mutton_rogan_josh.png',
  'Dal Makhani':              '/dishes/dal_makhani.png',
  'Chole Bhature':            '/dishes/chole_bhature.png',
  'Malai Kofta':              '/dishes/malai_kofta.png',
  'Chilli Paneer':            '/dishes/chilli_paneer.png',
  'Veg Manchurian Gravy':     'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=500&q=80',

  // ─── North Indian Breads & Rice ───────────────────────────
  'Garlic Naan':              '/dishes/garlic_naan.png',
  'Laccha Paratha':           '/dishes/laccha_paratha.png',
  'Butter Roti':              'https://images.unsplash.com/photo-1508746829417-e6f548d8d6ed?auto=format&fit=crop&w=500&q=80',
  'Jeera Rice':               'https://images.unsplash.com/photo-1596560548464-f010689b7718?auto=format&fit=crop&w=500&q=80',

  // ─── South Indian ─────────────────────────────────────────
  'Medu Vada (2 Pcs)':        'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=500&q=80',
  'Appam with Stew (2 Pcs)':  'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=500&q=80',
  'Paniyaram (7 Pcs)':        'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=500&q=80',

  // ─── Chinese ──────────────────────────────────────────────
  'Chilli Chicken Dry':       '/dishes/chilli_chicken.png',

  // ─── Italian ──────────────────────────────────────────────
  'Garlic Bread with Cheese': '/dishes/garlic_bread_cheese.png',
  'Vegetable Lasagna':        '/dishes/vegetable_lasagna.png',
  'Pasta Arrabbiata':         'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=500&q=80',
};

async function runUpdate() {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/rasoi_junction';
    console.log(`Connecting to MongoDB: ${mongoUri}`);
    await mongoose.connect(mongoUri);
    console.log('✅ Connected. Updating dish images...\n');

    let totalUpdated = 0;
    for (const [name, url] of Object.entries(fixedImages)) {
      const res = await MenuItem.updateMany({ name }, { image: url });
      if (res.modifiedCount > 0) {
        console.log(`  ✅ ${name} → image updated`);
        totalUpdated += res.modifiedCount;
      } else if (res.matchedCount > 0) {
        console.log(`  ⏭️  ${name} → already up-to-date`);
      } else {
        console.log(`  ⚠️  ${name} → not found in DB`);
      }
    }

    console.log(`\n🎉 Done! Updated ${totalUpdated} dish images.`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Update failed:', err);
    process.exit(1);
  }
}

runUpdate();
