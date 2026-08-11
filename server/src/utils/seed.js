import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import User from '../modules/auth/auth.model.js';
import MenuItem from '../modules/menu/menu.model.js';
import Coupon from '../modules/coupons/coupon.model.js';
import Review from '../modules/reviews/review.model.js';
import Notification from '../modules/notifications/notification.model.js';
import Contact from '../modules/contact/contact.model.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, '../../.env') });

const seedUsers = [
  {
    name: 'Admin User',
    email: 'admin@rasoijunction.com',
    password: 'Admin@123',
    phone: '9876543210',
    role: 'admin',
    isVerified: true,
  },
  {
    name: 'Customer User',
    email: 'customer@example.com',
    password: 'Customer@123',
    phone: '9876543211',
    role: 'customer',
    isVerified: true,
    loyaltyPoints: 350,
  },
  {
    name: 'Kitchen Chef',
    email: 'chef@rasoijunction.com',
    password: 'Chef@123',
    phone: '9876543212',
    role: 'chef',
    isVerified: true,
  },
  {
    name: 'Delivery Rider',
    email: 'delivery@rasoijunction.com',
    password: 'Delivery@123',
    phone: '9876543213',
    role: 'delivery',
    isVerified: true,
  }
];

const seedMenuItems = [
  // ─── North Indian (18 items) ──────────────────────────────────────
  {
    name: 'Butter Chicken',
    description: 'Juicy tandoori chicken cooked in a rich, velvety tomato and butter gravy finished with cream.',
    price: 350,
    category: 'North Indian',
    image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=500&q=80',
    isVeg: false,
    isAvailable: true,
    isTodaySpecial: true,
    isFeatured: true,
    prepTime: 20,
    ratings: { average: 4.8, count: 234 }
  },
  {
    name: 'Paneer Tikka',
    description: 'Fresh cottage cheese cubes marinated in spiced yogurt and grilled to perfection in a clay oven.',
    price: 280,
    category: 'North Indian',
    image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=500&q=80',
    isVeg: true,
    isAvailable: true,
    isTodaySpecial: false,
    isFeatured: true,
    prepTime: 15,
    ratings: { average: 4.7, count: 189 }
  },
  {
    name: 'Chicken Biryani',
    description: 'Fragrant long-grain basmati rice layered with spiced chicken, caramelized onions, and fresh mint, slow-cooked on dum.',
    price: 320,
    category: 'North Indian',
    image: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=500&q=80',
    isVeg: false,
    isAvailable: true,
    isTodaySpecial: false,
    isFeatured: true,
    prepTime: 25,
    ratings: { average: 4.8, count: 456 }
  },
  {
    name: 'Garlic Naan',
    description: 'Soft tandoori leavened flatbread brushed with fresh minced garlic and butter.',
    price: 60,
    category: 'North Indian',
    image: 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&w=500&q=80',
    isVeg: true,
    isAvailable: true,
    prepTime: 8,
    ratings: { average: 4.7, count: 520 }
  },
  {
    name: 'Dal Makhani',
    description: 'Black lentils slow-cooked overnight with spices, butter, and cream to achieve a rich, creamy texture.',
    price: 220,
    category: 'North Indian',
    image: 'https://images.unsplash.com/photo-1585938338392-50a59970d2ee?auto=format&fit=crop&w=500&q=80',
    isVeg: true,
    isAvailable: true,
    prepTime: 18,
    ratings: { average: 4.8, count: 350 }
  },
  {
    name: 'Butter Roti',
    description: 'Whole wheat flour flatbread cooked in tandoor and brushed with fresh butter.',
    price: 30,
    category: 'North Indian',
    image: 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&w=500&q=80',
    isVeg: true,
    isAvailable: true,
    prepTime: 6,
    ratings: { average: 4.7, count: 480 }
  },
  {
    name: 'Shahi Paneer',
    description: 'Cottage cheese pieces cooked in a rich, creamy onion-cashew gravy with royal spices.',
    price: 270,
    category: 'North Indian',
    image: 'https://images.unsplash.com/photo-1585938338392-50a59970d2ee?auto=format&fit=crop&w=500&q=80',
    isVeg: true,
    isAvailable: true,
    prepTime: 15,
    ratings: { average: 4.6, count: 120 }
  },
  {
    name: 'Kadhai Paneer',
    description: 'Paneer cubes cooked with fresh ground spices, bell peppers, and onions in a traditional wok.',
    price: 280,
    category: 'North Indian',
    image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=500&q=80',
    isVeg: true,
    isAvailable: true,
    prepTime: 15,
    ratings: { average: 4.5, count: 95 }
  },
  {
    name: 'Malai Kofta',
    description: 'Paneer and potato dumplings simmered in a rich, creamy, slightly sweet cashew nut gravy.',
    price: 290,
    category: 'North Indian',
    image: 'https://images.unsplash.com/photo-1585938338392-50a59970d2ee?auto=format&fit=crop&w=500&q=80',
    isVeg: true,
    isAvailable: true,
    prepTime: 20,
    ratings: { average: 4.7, count: 110 }
  },
  {
    name: 'Chole Bhature',
    description: 'Spiced tangy chickpea curry served with two large, fluffy, deep-fried leavened flatbreads.',
    price: 180,
    category: 'North Indian',
    image: 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&w=500&q=80',
    isVeg: true,
    isAvailable: true,
    prepTime: 12,
    ratings: { average: 4.8, count: 320 }
  },
  {
    name: 'Aloo Gobhi Masala',
    description: 'Classic dry potato and cauliflower dish cooked with ginger, garlic, turmeric, and fresh coriander.',
    price: 160,
    category: 'North Indian',
    image: 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&w=500&q=80',
    isVeg: true,
    isAvailable: true,
    prepTime: 15,
    ratings: { average: 4.3, count: 65 }
  },
  {
    name: 'Baingan Bharta',
    description: 'Smoky roasted eggplant mashed and cooked with onions, tomatoes, green chilies, and mustard oil.',
    price: 190,
    category: 'North Indian',
    image: 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&w=500&q=80',
    isVeg: true,
    isAvailable: true,
    prepTime: 15,
    ratings: { average: 4.4, count: 72 }
  },
  {
    name: 'Bhindi Do Pyaza',
    description: 'Fresh okra stir-fried with plenty of onions, tomatoes, and dry aromatic Indian spices.',
    price: 170,
    category: 'North Indian',
    image: 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&w=500&q=80',
    isVeg: true,
    isAvailable: true,
    prepTime: 10,
    ratings: { average: 4.4, count: 54 }
  },
  {
    name: 'Jeera Rice',
    description: 'Fragrant basmati rice tempered with ghee, cumin seeds, and fresh green coriander leaves.',
    price: 120,
    category: 'North Indian',
    image: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=500&q=80',
    isVeg: true,
    isAvailable: true,
    prepTime: 10,
    ratings: { average: 4.6, count: 180 }
  },
  {
    name: 'Kashmiri Pulao',
    description: 'Exotic mildly sweet basmati rice loaded with dry fruits, nuts, fresh fruits, and saffron.',
    price: 210,
    category: 'North Indian',
    image: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=500&q=80',
    isVeg: true,
    isAvailable: true,
    prepTime: 12,
    ratings: { average: 4.5, count: 85 }
  },
  {
    name: 'Chicken Tikka Masala',
    description: 'Roasted marinated chicken chunks cooked in a spiced tomato, onion, and bell pepper sauce.',
    price: 340,
    category: 'North Indian',
    image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=500&q=80',
    isVeg: false,
    isAvailable: true,
    prepTime: 20,
    ratings: { average: 4.7, count: 215 }
  },
  {
    name: 'Mutton Rogan Josh',
    description: 'Tender mutton pieces slow-cooked in a rich gravy flavored with Kashmiri red chilies and local spices.',
    price: 420,
    category: 'North Indian',
    image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=500&q=80',
    isVeg: false,
    isAvailable: true,
    prepTime: 30,
    ratings: { average: 4.8, count: 198 }
  },
  {
    name: 'Laccha Paratha',
    description: 'Multi-layered tandoori whole wheat flatbread brushed with butter.',
    price: 50,
    category: 'North Indian',
    image: 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&w=500&q=80',
    isVeg: true,
    isAvailable: true,
    prepTime: 8,
    ratings: { average: 4.7, count: 140 }
  },

  // ─── South Indian (10 items) ──────────────────────────────────────
  {
    name: 'Masala Dosa',
    description: 'Crispy rice and lentil crepe stuffed with aromatic spiced potato mash, served with sambar and coconut chutney.',
    price: 150,
    category: 'South Indian',
    image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=500&q=80',
    isVeg: true,
    isAvailable: true,
    isTodaySpecial: true,
    isFeatured: false,
    prepTime: 12,
    ratings: { average: 4.9, count: 312 }
  },
  {
    name: 'Rava Masala Dosa',
    description: 'Crispy semolina crepe filled with spiced potato mixture, onion, coriander, served with chutneys.',
    price: 170,
    category: 'South Indian',
    image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=500&q=80',
    isVeg: true,
    isAvailable: true,
    prepTime: 12,
    ratings: { average: 4.6, count: 134 }
  },
  {
    name: 'Onion Uttapam',
    description: 'Thick savory pancake topped with finely chopped onions, green chilies, and fresh herbs.',
    price: 140,
    category: 'South Indian',
    image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=500&q=80',
    isVeg: true,
    isAvailable: true,
    prepTime: 10,
    ratings: { average: 4.5, count: 112 }
  },
  {
    name: 'Idli Sambar (2 Pcs)',
    description: 'Soft, fluffy steamed rice-lentil cakes served with hot lentil vegetable stew and coconut chutney.',
    price: 90,
    category: 'South Indian',
    image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=500&q=80',
    isVeg: true,
    isAvailable: true,
    prepTime: 8,
    ratings: { average: 4.7, count: 210 }
  },
  {
    name: 'Medu Vada (2 Pcs)',
    description: 'Deep-fried savory donut-shaped lentil fritters, crispy outside and soft inside, served with sambar.',
    price: 100,
    category: 'South Indian',
    image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=500&q=80',
    isVeg: true,
    isAvailable: true,
    prepTime: 8,
    ratings: { average: 4.6, count: 176 }
  },
  {
    name: 'Lemon Rice',
    description: 'Zesty cooked rice mixed with mustard seeds, roasted peanuts, curry leaves, and lemon juice.',
    price: 130,
    category: 'South Indian',
    image: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=500&q=80',
    isVeg: true,
    isAvailable: true,
    prepTime: 10,
    ratings: { average: 4.4, count: 68 }
  },
  {
    name: 'Coconut Rice',
    description: 'Mildly flavored rice cooked with freshly grated coconut, cashews, and mild South Indian tempering.',
    price: 140,
    category: 'South Indian',
    image: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=500&q=80',
    isVeg: true,
    isAvailable: true,
    prepTime: 10,
    ratings: { average: 4.3, count: 45 }
  },
  {
    name: 'Mysore Masala Dosa',
    description: 'Crispy crepe with spicy garlic red chutney spread filled with seasoned potato mash.',
    price: 160,
    category: 'South Indian',
    image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=500&q=80',
    isVeg: true,
    isAvailable: true,
    prepTime: 12,
    ratings: { average: 4.8, count: 245 }
  },
  {
    name: 'Appam with Stew (2 Pcs)',
    description: 'Bowl-shaped thin fermented rice pancakes with soft centers and lacy edges, served with coconut milk veg stew.',
    price: 190,
    category: 'South Indian',
    image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=500&q=80',
    isVeg: true,
    isAvailable: true,
    prepTime: 15,
    ratings: { average: 4.7, count: 98 }
  },
  {
    name: 'Paniyaram (7 Pcs)',
    description: 'Small ball-shaped steamed rice-lentil dumplings seasoned with mustard, curry leaves, and onions.',
    price: 110,
    category: 'South Indian',
    image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=500&q=80',
    isVeg: true,
    isAvailable: true,
    prepTime: 10,
    ratings: { average: 4.6, count: 120 }
  },

  // ─── Chinese (8 items) ──────────────────────────────────────────
  {
    name: 'Chilli Paneer',
    description: 'Crispy paneer chunks tossed with colorful bell peppers and onions in a tangy chili soy sauce.',
    price: 240,
    category: 'Chinese',
    image: 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&w=500&q=80',
    isVeg: true,
    isAvailable: true,
    prepTime: 12,
    ratings: { average: 4.6, count: 140 }
  },
  {
    name: 'Vegetable Spring Rolls',
    description: 'Crisp golden rolls packed with seasoned stir-fried vegetables, served with sweet chili sauce.',
    price: 180,
    category: 'Chinese',
    image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=500&q=80',
    isVeg: true,
    isAvailable: true,
    prepTime: 10,
    ratings: { average: 4.5, count: 98 }
  },
  {
    name: 'Veg Hakka Noodles',
    description: 'Wok-tossed noodles with crunch julienned vegetables, garlic, ginger, and soy sauce.',
    price: 180,
    category: 'Chinese',
    image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=500&q=80',
    isVeg: true,
    isAvailable: true,
    prepTime: 10,
    ratings: { average: 4.6, count: 175 }
  },
  {
    name: 'Schezwan Fried Rice',
    description: 'Spicy wok-tossed basmati rice with vegetables in a hot housemade Schezwan chili paste.',
    price: 190,
    category: 'Chinese',
    image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=500&q=80',
    isVeg: true,
    isAvailable: true,
    prepTime: 10,
    ratings: { average: 4.5, count: 142 }
  },
  {
    name: 'Veg Manchurian Gravy',
    description: 'Deep-fried vegetable balls simmered in a dark, thick, savory garlic-coriander soy sauce.',
    price: 210,
    category: 'Chinese',
    image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=500&q=80',
    isVeg: true,
    isAvailable: true,
    prepTime: 12,
    ratings: { average: 4.5, count: 165 }
  },
  {
    name: 'Gobi Manchurian Dry',
    description: 'Crisp batter-coated cauliflower florets tossed in a spicy, sweet, and tangy onion-chili sauce.',
    price: 190,
    category: 'Chinese',
    image: 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&w=500&q=80',
    isVeg: true,
    isAvailable: true,
    prepTime: 10,
    ratings: { average: 4.4, count: 130 }
  },
  {
    name: 'Steamed Veg Momos (6 Pcs)',
    description: 'Steamed flour pockets filled with finely minced spiced cabbage, carrot, paneer, and ginger, served with spicy dip.',
    price: 120,
    category: 'Chinese',
    image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=500&q=80',
    isVeg: true,
    isAvailable: true,
    prepTime: 12,
    ratings: { average: 4.7, count: 289 }
  },
  {
    name: 'Chilli Chicken Dry',
    description: 'Stir-fried batter-coated chicken pieces tossed with bell peppers and green chilies in a spicy soy sauce.',
    price: 290,
    category: 'Chinese',
    image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=500&q=80',
    isVeg: false,
    isAvailable: true,
    prepTime: 12,
    ratings: { average: 4.7, count: 184 }
  },

  // ─── Italian (8 items) ──────────────────────────────────────────
  {
    name: 'Margherita Pizza',
    description: 'Classic Italian thin crust pizza topped with fresh tomato sauce, fresh mozzarella cheese, and sweet basil leaves.',
    price: 290,
    category: 'Italian',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=500&q=80',
    isVeg: true,
    isAvailable: true,
    prepTime: 15,
    ratings: { average: 4.7, count: 210 }
  },
  {
    name: 'Penne Alfredo Pasta',
    description: 'Penne pasta tossed in rich, creamy Parmesan cheese sauce with fresh herbs and mushrooms.',
    price: 260,
    category: 'Italian',
    image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=500&q=80',
    isVeg: true,
    isAvailable: true,
    prepTime: 14,
    ratings: { average: 4.6, count: 125 }
  },
  {
    name: 'Pasta Arrabbiata',
    description: 'Spicy penne pasta tossed in a rich, chunk tomato-garlic sauce spiked with dried red chili flakes.',
    price: 240,
    category: 'Italian',
    image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=500&q=80',
    isVeg: true,
    isAvailable: true,
    prepTime: 12,
    ratings: { average: 4.5, count: 110 }
  },
  {
    name: 'Garlic Bread with Cheese',
    description: 'Toasted baguette slices brushed with garlic butter and topped with bubbling melted mozzarella.',
    price: 150,
    category: 'Italian',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=500&q=80',
    isVeg: true,
    isAvailable: true,
    prepTime: 8,
    ratings: { average: 4.7, count: 230 }
  },
  {
    name: 'Veg Giardiniera Pizza',
    description: 'Premium thin crust pizza topped with bell peppers, olives, onions, sweet corn, baby corn, and mushrooms.',
    price: 340,
    category: 'Italian',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=500&q=80',
    isVeg: true,
    isAvailable: true,
    prepTime: 15,
    ratings: { average: 4.6, count: 164 }
  },
  {
    name: 'Tomato Basil Bruschetta',
    description: 'Grilled crusty Italian bread rubbed with garlic, topped with marinated diced tomatoes, basil, and balsamic glaze.',
    price: 170,
    category: 'Italian',
    image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=500&q=80',
    isVeg: true,
    isAvailable: true,
    prepTime: 10,
    ratings: { average: 4.4, count: 74 }
  },
  {
    name: 'Creamy Mushroom Risotto',
    description: 'Slow-cooked Arborio rice with mushrooms, white wine, garlic, and rich butter Parmesan cheese sauce.',
    price: 320,
    category: 'Italian',
    image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=500&q=80',
    isVeg: true,
    isAvailable: true,
    prepTime: 18,
    ratings: { average: 4.5, count: 62 }
  },
  {
    name: 'Vegetable Lasagna',
    description: 'Layers of lasagna pasta sheet baked with ricotta, mozzarella, spinach, marinara sauce, and zucchini.',
    price: 360,
    category: 'Italian',
    image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=500&q=80',
    isVeg: true,
    isAvailable: true,
    prepTime: 20,
    ratings: { average: 4.7, count: 83 }
  },

  // ─── Desserts (8 items) ─────────────────────────────────────────
  {
    name: 'Gulab Jamun',
    description: 'Deep-fried golden milk-solid dumplings soaked in cardamom flavored sugar syrup.',
    price: 120,
    category: 'Desserts',
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=500&q=80',
    isVeg: true,
    isAvailable: true,
    prepTime: 5,
    ratings: { average: 4.8, count: 320 }
  },
  {
    name: 'Rasmalai (2 Pcs)',
    description: 'Spongy flattened cottage cheese discs soaked in chilled thickened milk flavored with saffron and pistachios.',
    price: 140,
    category: 'Desserts',
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=500&q=80',
    isVeg: true,
    isAvailable: true,
    prepTime: 5,
    ratings: { average: 4.9, count: 290 }
  },
  {
    name: 'Kaju Katli (4 Pcs)',
    description: 'Traditional diamond-shaped Indian sweets made of roasted cashew nuts and sugar syrup.',
    price: 150,
    category: 'Desserts',
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=500&q=80',
    isVeg: true,
    isAvailable: true,
    prepTime: 5,
    ratings: { average: 4.8, count: 180 }
  },
  {
    name: 'Cardamom Rice Kheer',
    description: 'Traditional slow-cooked rice pudding enriched with condensed milk, cardamom, almonds, and saffron.',
    price: 110,
    category: 'Desserts',
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=500&q=80',
    isVeg: true,
    isAvailable: true,
    prepTime: 10,
    ratings: { average: 4.6, count: 95 }
  },
  {
    name: 'Chocolate Lava Cake',
    description: 'Rich chocolate cake with a molten warm chocolate center, baked fresh and served warm.',
    price: 180,
    category: 'Desserts',
    image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=500&q=80',
    isVeg: true,
    isAvailable: true,
    prepTime: 12,
    ratings: { average: 4.8, count: 215 }
  },
  {
    name: 'Vanilla Bean Ice Cream',
    description: 'Two scoops of classic, rich, creamy vanilla bean ice cream loaded with natural vanilla flavors.',
    price: 90,
    category: 'Desserts',
    image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=500&q=80',
    isVeg: true,
    isAvailable: true,
    prepTime: 5,
    ratings: { average: 4.4, count: 115 }
  },
  {
    name: 'Warm Brownie with Ice Cream',
    description: 'A warm walnut fudge brownie served with a scoop of vanilla ice cream and hot chocolate drizzle.',
    price: 190,
    category: 'Desserts',
    image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=500&q=80',
    isVeg: true,
    isAvailable: true,
    prepTime: 5,
    ratings: { average: 4.9, count: 340 }
  },
  {
    name: 'Mango Kulfi',
    description: 'Traditional dense Indian ice cream flavored with sweet Alphonso mango pulp, saffron, and nuts.',
    price: 130,
    category: 'Desserts',
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=500&q=80',
    isVeg: true,
    isAvailable: true,
    prepTime: 5,
    ratings: { average: 4.7, count: 125 }
  },

  // ─── Beverages (8 items) ────────────────────────────────────────
  {
    name: 'Mango Lassi',
    description: 'Creamy yogurt drink blended with sweet ripe mangoes and saffron.',
    price: 80,
    category: 'Beverages',
    image: 'https://images.unsplash.com/photo-1497534446932-c925b458314e?auto=format&fit=crop&w=500&q=80',
    isVeg: true,
    isAvailable: true,
    prepTime: 5,
    ratings: { average: 4.9, count: 410 }
  },
  {
    name: 'Masala Chai',
    description: 'Freshly brewed milk tea simmered with ginger, cardamom, cloves, cinnamon, and black pepper.',
    price: 40,
    category: 'Beverages',
    image: 'https://images.unsplash.com/photo-1497534446932-c925b458314e?auto=format&fit=crop&w=500&q=80',
    isVeg: true,
    isAvailable: true,
    prepTime: 6,
    ratings: { average: 4.9, count: 680 }
  },
  {
    name: 'Filter Coffee',
    description: 'Traditional hot frothy chicory-blended coffee brewed in a brass filter setup.',
    price: 50,
    category: 'Beverages',
    image: 'https://images.unsplash.com/photo-1497534446932-c925b458314e?auto=format&fit=crop&w=500&q=80',
    isVeg: true,
    isAvailable: true,
    prepTime: 5,
    ratings: { average: 4.8, count: 420 }
  },
  {
    name: 'Sweet Lassi',
    description: 'Thick, sweet, churned Punjabi yogurt beverage garnished with fresh cream and pistachios.',
    price: 70,
    category: 'Beverages',
    image: 'https://images.unsplash.com/photo-1497534446932-c925b458314e?auto=format&fit=crop&w=500&q=80',
    isVeg: true,
    isAvailable: true,
    prepTime: 5,
    ratings: { average: 4.7, count: 210 }
  },
  {
    name: 'Fresh Lime Soda',
    description: 'Chilled carbonated water mixed with fresh lime juice, simple syrup, and black salt (choice of sweet/salted).',
    price: 80,
    category: 'Beverages',
    image: 'https://images.unsplash.com/photo-1497534446932-c925b458314e?auto=format&fit=crop&w=500&q=80',
    isVeg: true,
    isAvailable: true,
    prepTime: 5,
    ratings: { average: 4.6, count: 185 }
  },
  {
    name: 'Cold Coffee with Ice Cream',
    description: 'Thick blended milk and coffee drink topped with a scoop of rich vanilla ice cream.',
    price: 150,
    category: 'Beverages',
    image: 'https://images.unsplash.com/photo-1497534446932-c925b458314e?auto=format&fit=crop&w=500&q=80',
    isVeg: true,
    isAvailable: true,
    prepTime: 5,
    ratings: { average: 4.7, count: 320 }
  },
  {
    name: 'Iced Peach Tea',
    description: 'Refreshing brewed black tea served chilled with sweet peach flavor and mint leaves.',
    price: 110,
    category: 'Beverages',
    image: 'https://images.unsplash.com/photo-1497534446932-c925b458314e?auto=format&fit=crop&w=500&q=80',
    isVeg: true,
    isAvailable: true,
    prepTime: 5,
    ratings: { average: 4.5, count: 145 }
  },
  {
    name: 'Jeera Masala Shikanji',
    description: 'Spiced Indian lemonade seasoned with roasted cumin powder, mint, and black salt.',
    price: 80,
    category: 'Beverages',
    image: 'https://images.unsplash.com/photo-1497534446932-c925b458314e?auto=format&fit=crop&w=500&q=80',
    isVeg: true,
    isAvailable: true,
    prepTime: 5,
    ratings: { average: 4.8, count: 165 }
  }
];

const runSeed = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/rasoi_junction';
    console.log(`Connecting to MongoDB at: ${mongoUri}`);
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB. Seeding data...');

    // Clear existing users
    const deleteRes = await User.deleteMany({
      email: { $in: seedUsers.map(u => u.email) }
    });
    console.log(`🧹 Cleaned up ${deleteRes.deletedCount} existing seed users.`);

    // Create new users
    for (const u of seedUsers) {
      const user = new User(u);
      await user.save();
      console.log(`👤 Created user: ${user.name} (${user.role}) - ${user.email}`);
    }
    // Clear and seed coupons
    await Coupon.deleteMany({});
    const seedCoupons = [
      { code: 'WELCOME10', type: 'Percentage', value: 10, minOrder: 500, status: 'Active' },
      { code: 'RASOI50', type: 'Flat', value: 50, minOrder: 300, status: 'Active' },
      { code: 'FESTIVAL20', type: 'Percentage', value: 20, minOrder: 1000, status: 'Inactive' },
    ];
    for (const c of seedCoupons) {
      await Coupon.create(c);
      console.log(`🎟️ Created coupon: ${c.code} (${c.type})`);
    }

    // Clear and seed reviews
    await Review.deleteMany({});
    const seedReviews = [
      { dishName: 'Butter Chicken', customerName: 'Customer User', rating: 5, comment: 'Absolutely delicious! The butter chicken was cooked to perfection.' },
      { dishName: 'Paneer Tikka', customerName: 'Customer User', rating: 4, comment: 'Sizzling hot and very tasty. The green chutney was a great addition.' }
    ];
    for (const r of seedReviews) {
      await Review.create(r);
      console.log(`⭐ Created review for: ${r.dishName}`);
    }

    // Clear and seed notifications
    await Notification.deleteMany({});
    const seedNotifications = [
      { message: 'System Notification: Seeding completed successfully. 60 items loaded.', type: 'System', read: true },
      { message: 'Welcome to Rasoi Junction Administration Panel!', type: 'System', read: false }
    ];
    for (const n of seedNotifications) {
      await Notification.create(n);
      console.log(`🔔 Created notification: ${n.message}`);
    }

    // Clear contact submissions
    await Contact.deleteMany({});
    console.log('🧹 Cleaned up existing contact inquiries.');

    // Clear existing menu items
    const deleteMenuRes = await MenuItem.deleteMany({});
    console.log(`🧹 Cleaned up ${deleteMenuRes.deletedCount} existing seed menu items.`);

    // Create new menu items
    const dishImages = {
      'Butter Chicken': '/dishes/butter_chicken.png',
      'Paneer Tikka': 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=500&q=80',
      'Chicken Biryani': 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=500&q=80',
      'Garlic Naan': '/dishes/garlic_naan.png',
      'Dal Makhani': '/dishes/dal_makhani.png',
      'Butter Roti': 'https://images.unsplash.com/photo-1508746829417-e6f548d8d6ed?auto=format&fit=crop&w=500&q=80',
      'Shahi Paneer': 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=500&q=80',
      'Kadhai Paneer': 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=500&q=80',
      'Malai Kofta': '/dishes/malai_kofta.png',
      'Chole Bhature': '/dishes/chole_bhature.png',
      'Aloo Gobhi Masala': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=500&q=80',
      'Baingan Bharta': 'https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=500&q=80',
      'Bhindi Do Pyaza': 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&w=500&q=80',
      'Jeera Rice': 'https://images.unsplash.com/photo-1596560548464-f010689b7718?auto=format&fit=crop&w=500&q=80',
      'Kashmiri Pulao': 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=500&q=80',
      'Chicken Tikka Masala': 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=500&q=80',
      'Mutton Rogan Josh': '/dishes/mutton_rogan_josh.png',
      'Laccha Paratha': '/dishes/laccha_paratha.png',
      'Masala Dosa': 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=500&q=80',
      'Rava Masala Dosa': 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=500&q=80',
      'Onion Uttapam': 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=500&q=80',
      'Idli Sambar (2 Pcs)': 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=500&q=80',
      'Medu Vada (2 Pcs)': 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=500&q=80',
      'Lemon Rice': 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=500&q=80',
      'Coconut Rice': 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=500&q=80',
      'Mysore Masala Dosa': 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=500&q=80',
      'Appam with Stew (2 Pcs)': 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=500&q=80',
      'Paniyaram (7 Pcs)': 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=500&q=80',
      'Chilli Paneer': '/dishes/chilli_paneer.png',
      'Vegetable Spring Rolls': 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=500&q=80',
      'Veg Hakka Noodles': 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=500&q=80',
      'Schezwan Fried Rice': 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=500&q=80',
      'Veg Manchurian Gravy': 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=500&q=80',
      'Gobi Manchurian Dry': 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=500&q=80',
      'Steamed Veg Momos (6 Pcs)': 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=500&q=80',
      'Chilli Chicken Dry': '/dishes/chilli_chicken.png',
      'Margherita Pizza': 'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?auto=format&fit=crop&w=500&q=80',
      'Penne Alfredo Pasta': 'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?auto=format&fit=crop&w=500&q=80',
      'Pasta Arrabbiata': 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=500&q=80',
      'Garlic Bread with Cheese': '/dishes/garlic_bread_cheese.png',
      'Veg Giardiniera Pizza': 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=500&q=80',
      'Tomato Basil Bruschetta': 'https://images.unsplash.com/photo-1572448862527-d3c904757de6?auto=format&fit=crop&w=500&q=80',
      'Creamy Mushroom Risotto': 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?auto=format&fit=crop&w=500&q=80',
      'Vegetable Lasagna': '/dishes/vegetable_lasagna.png',
      'Gulab Jamun': '/dishes/gulab_jamun.png',
      'Rasmalai (2 Pcs)': '/dishes/rasmalai.png',
      'Kaju Katli (4 Pcs)': '/dishes/kaju_katli.png',
      'Cardamom Rice Kheer': 'https://images.unsplash.com/photo-1631452180775-75dc2254e9db?auto=format&fit=crop&w=500&q=80',
      'Chocolate Lava Cake': '/dishes/chocolate_lava_cake.png',
      'Vanilla Bean Ice Cream': 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?auto=format&fit=crop&w=500&q=80',
      'Warm Brownie with Ice Cream': 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=500&q=80',
      'Mango Kulfi': '/dishes/mango_kulfi.png',
      'Mango Lassi': '/dishes/mango_lassi.png',
      'Masala Chai': 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=500&q=80',
      'Filter Coffee': 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=500&q=80',
      'Sweet Lassi': 'https://images.unsplash.com/photo-1571006682887-8e6580f55cf5?auto=format&fit=crop&w=500&q=80',
      'Fresh Lime Soda': 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=500&q=80',
      'Cold Coffee with Ice Cream': 'https://images.unsplash.com/photo-1541658016709-82535e94bc69?auto=format&fit=crop&w=500&q=80',
      'Iced Peach Tea': 'https://images.unsplash.com/photo-1497534446932-c925b458314e?auto=format&fit=crop&w=500&q=80',
      'Jeera Masala Shikanji': 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=500&q=80'
    };

    for (const m of seedMenuItems) {
      if (dishImages[m.name]) {
        m.image = dishImages[m.name];
      }
      const menuItem = new MenuItem(m);
      await menuItem.save();
      console.log(`🍽️ Created menu item: ${menuItem.name} (${menuItem.category}) - ₹${menuItem.price}`);
    }

    console.log('🎉 Seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
};

runSeed();
