import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import User from './src/modules/auth/auth.model.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, '../.env') });

const demoUsers = [
  {
    name: 'Demo Manager',
    email: 'manager@demo.com',
    password: 'Demo@123',
    phone: '9876543100',
    role: 'manager',
    isVerified: true,
  },
  {
    name: 'Demo Staff',
    email: 'staff@demo.com',
    password: 'Demo@123',
    phone: '9876543101',
    role: 'staff',
    isVerified: true,
  },
  {
    name: 'Demo Delivery',
    email: 'delivery@demo.com',
    password: 'Demo@123',
    phone: '9876543102',
    role: 'delivery',
    isVerified: true,
  },
  {
    name: 'Demo Customer',
    email: 'customer@demo.com',
    password: 'Demo@123',
    phone: '9876543103',
    role: 'customer',
    isVerified: true,
    loyaltyPoints: 100,
  },
  {
    name: 'Demo Chef',
    email: 'chef@demo.com',
    password: 'Demo@123',
    phone: '9876543104',
    role: 'chef',
    isVerified: true,
  }
];

const seedDemoUsers = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/rasoi_junction';
    console.log(`Connecting to MongoDB at: ${mongoUri}`);
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB. Seeding demo users...');

    // Delete existing demo users if they exist
    await User.deleteMany({ email: { $in: demoUsers.map(u => u.email) } });

    for (const u of demoUsers) {
      const user = new User(u);
      await user.save();
      console.log(`👤 Created demo user: ${user.name} (${user.role}) - ${user.email}`);
    }

    console.log('✅ Demo users seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding demo users:', err);
    process.exit(1);
  }
};

seedDemoUsers();
