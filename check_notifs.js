const mongoose = require('mongoose');
require('dotenv').config({ path: 'C:\\Users\\rohan\\Documents\\preprimary\\Pre-Primary\\.env' });

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to DB");

  const Notification = mongoose.models.Notification || mongoose.model("Notification", new mongoose.Schema({
    type: String,
    title: String,
    metadata: mongoose.Schema.Types.Mixed,
  }, { strict: false }));

  const notifications = await Notification.find().sort({ createdAt: -1 }).limit(3).lean();
  console.log(JSON.stringify(notifications, null, 2));
  
  await mongoose.disconnect();
}

main().catch(console.error);
