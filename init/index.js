require('dotenv').config({ path: './.env' });
const mongoose   = require('mongoose');
const { Types }  = mongoose;
const Listing    = require('../models/listing.js');
const initData   = require('./data.js');

const MONGODB_URI = "mongodb+srv://sharmarudra775:sharmarudra24@cluster0.iyba3bi.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";



const categories = [
  'Trending', 'Rooms', 'Iconic Cities', 'Mountains', 'Castle',
  'Amazing Pools', 'Farms', 'Camping', 'Arctic', 'Dome', 'Boat'
];

async function main() {
  // Throw a readable error up-front if the URI is still missing
  if (!MONGODB_URI) {
    throw new Error('MongoDB connection string is undefined. Check .env → ATLASDB_URL');
  }

  await mongoose.connect(MONGODB_URI);
  console.log("DB URL:", process.env.ATLASDB_URL);
  console.log('Connected to MongoDB');
}

async function initDB() {
  await Listing.deleteMany({});

  const source = Array.isArray(initData) ? initData : initData.data;
  const newDocs = source.map(item => ({
    ...item,
    owner: new Types.ObjectId('68487cd3cc81a1d954ae13b9'),
    price: (item.price || 0) * 25,
    category: [
      categories[Math.floor(Math.random() * categories.length)],
      categories[Math.floor(Math.random() * categories.length)]
    ]
  }));

  try {
    await Listing.insertMany(newDocs);
    console.log('Database seeded with', newDocs.length, 'documents');
  } catch (err) {
    console.error('Error seeding DB:', err.message);
    if (err.errors) {
      for (const [field, e] of Object.entries(err.errors)) {
        console.error(`   • ${field}: ${e.message}`);
      }
    }
  }
}

main()
  .then(initDB)
  .catch(err => console.error('Startup error:', err.message));

