const mongoose = require('mongoose');
mongoose.connect('mongodb://rasoijunction:Aman62478140@ac-87z5zkp-shard-00-00.8edue7r.mongodb.net:27017,ac-87z5zkp-shard-00-01.8edue7r.mongodb.net:27017,ac-87z5zkp-shard-00-02.8edue7r.mongodb.net:27017/rasoi_junction?ssl=true&replicaSet=atlas-aag00q-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0').then(async () => {
  const User = mongoose.model('User', new mongoose.Schema({ email: String, isVerified: Boolean, registrationOtp: String }));
  const searchEmail = 'amankr5471@gmail.com'.trim();
  const user = await User.findOne({ email: { $regex: new RegExp('^' + searchEmail + '$', 'i') } });
  console.log('User found:', user);
  mongoose.disconnect();
}).catch(console.error);
