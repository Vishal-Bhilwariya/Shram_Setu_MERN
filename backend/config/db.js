const mongoose = require("mongoose");
const dns = require("dns");

// Force Google & Cloudflare DNS to bypass ISP DNS blocking
dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);

const connectDB = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      family: 4,
    });
    console.log("MongoDB Connected");
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    console.log("\n⚠️  Server will continue running but database operations will fail");
    // process.exit(1); // Do not exit so server stays up even if DB fails initially
  }
};

module.exports = connectDB;
