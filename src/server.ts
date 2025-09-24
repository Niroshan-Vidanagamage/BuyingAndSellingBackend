// src/server.ts
//loads env(dotenv/config), connects to MongoDB atlas using MongoURI
//on success, calls app.listen(port)
//if atlas is unrachable. logs and exits

import 'dotenv/config';
import mongoose from 'mongoose';
import app from './app';

const PORT = Number(process.env.PORT || 4000);
const MONGO_URI = process.env.MONGO_URI!;

async function start() {
  try {
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 8000,   // clearer fail-fast on bad config
    });
    console.log('MongoDB connected (Atlas)');
    app.listen(PORT, () => console.log(`API on http://localhost:${PORT}`));
  } catch (err: any) {
    console.error('Mongo connection error:', err.message);
    process.exit(1);
  }
}
start();
