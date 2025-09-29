require('dotenv').config();
const mongoose = require('mongoose');

console.log('Testing MongoDB Atlas connection...');
console.log('Connection string (partial):', process.env.MONGO_URI.substring(0, 50) + '...');

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB Atlas connected successfully!');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Connection failed:', err.message);
    console.error('💡 Make sure to:');
    console.error('   1. Replace <your-password> with actual password');
    console.error('   2. Replace cluster URL with your actual cluster URL');
    console.error('   3. Add your IP address to Network Access in Atlas');
    process.exit(1);
  });

setTimeout(() => {
  console.log('⏰ Connection timeout after 10 seconds');
  process.exit(1);
}, 10000);
