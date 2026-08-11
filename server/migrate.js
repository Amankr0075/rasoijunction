import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/rasoi-junction';
console.log('Connecting to', uri);

mongoose.connect(uri).then(async () => {
  try {
    const db = mongoose.connection.db;
    const users = await db.collection('users').find({ role: { $ne: 'customer' }, employeeId: { $exists: false } }).toArray();
    console.log('Found ' + users.length + ' staff without employeeId');
    for (const u of users) {
      let isUnique = false;
      let generatedId = '';
      while (!isUnique) {
        generatedId = 'RJ' + Math.floor(100000 + Math.random() * 900000);
        const existing = await db.collection('users').findOne({ employeeId: generatedId });
        if (!existing) isUnique = true;
      }
      await db.collection('users').updateOne({ _id: u._id }, { $set: { employeeId: generatedId } });
      console.log('Updated', u.email, 'with', generatedId);
    }
    console.log('Done');
  } catch (e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
});
