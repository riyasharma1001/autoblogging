import connectToDatabase from '../utils/db';
import Settings from '../models/Settings';

export async function getSettings() {
  try {
    await connectToDatabase();
    const settings = await Settings.findOne({}) || {};
    return JSON.parse(JSON.stringify(settings));
  } catch (error) {
    console.error('Error getting settings:', error);
    return {};
  }
}

export async function updateSettings(settings) {
  try {
    await connectToDatabase();
    const result = await Settings.findOneAndUpdate(
      {},
      settings,
      { upsert: true, new: true }
    );
    return JSON.parse(JSON.stringify(result));
  } catch (error) {
    console.error('Error updating settings:', error);
    throw error;
  }
}