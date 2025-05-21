import { connectToDatabase } from '../../../utils/db';
import User from '../../../models/User';
import bcrypt from 'bcrypt';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectToDatabase();
    const { username, password } = req.body;

    // Find user
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if this is the last admin
    const adminCount = await User.countDocuments();
    if (adminCount <= 1) {
      return res.status(400).json({ error: 'Cannot remove last admin' });
    }

    // Remove admin
    await User.findByIdAndDelete(user._id);

    res.status(200).json({ message: 'Admin removed successfully' });
  } catch (error) {
    console.error('Admin removal error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}