require("dotenv").config({ path: require("path").resolve(__dirname, ".env") });

const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");

const mongoose = require("mongoose");
const app = require("./app");

/* Background Jobs */
require("./jobs/reminder.job");

/* MongoDB Connection */
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");
  })
  .catch((err) => {
    console.error("Mongo Error:", err);
  });

/* Start Server */
const { initWorker } = require("./features/invoices/scan.controller");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Pre-initialize OCR Worker for Singleton use
    await initWorker();
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("FATAL: Server failed to start due to OCR initialization error.");
    process.exit(1);
  }
};

startServer();
