const mongoose = require('mongoose');
const dns = require('dns');

// Fix for Windows / ISP DNS querySrv ECONNREFUSED on MongoDB Atlas SRV URLs
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {
  console.warn('DNS server fallback notice:', e.message);
}

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000
    });
    console.log("Database Connected Successfully");
  } catch (error) {
    console.error("MongoDB connection notice:", error.message);
    console.log("Backend will operate with Direct Live Upstox Data fallback.");
  }
}

module.exports = connectDB;