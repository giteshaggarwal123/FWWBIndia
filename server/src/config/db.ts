import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fwwb';
let _connected = false;

export async function connectDB(): Promise<void> {
  try {
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 3000 });
    _connected = true;
    console.log('MongoDB connected');
  } catch (err) {
    console.warn('MongoDB not available – using demo auth only. Run MongoDB for full features.');
    _connected = false;
  }
}

export function isDBConnected(): boolean {
  return _connected && mongoose.connection.readyState === 1;
}
