require('dotenv').config();
const mongoose = require('mongoose');
const Listing = require('../models/listing.js');

const MONGODB_URI = process.env.ATLASDB_URL;

async function updateOwners() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to DB");

    const userId = '68487cd3cc81a1d954ae13b9'; //existing

    // Update all listings to have this owner
    const result = await Listing.updateMany(
      {},
      { $set: { owner: userId } }
    );

    console.log(`Updated ${result.modifiedCount} listings with new owner`);

  } catch (err) {
    console.error("Error updating owners:", err);
  } finally {
    await mongoose.connection.close();
    console.log("Connection closed");
  }
}

updateOwners();

