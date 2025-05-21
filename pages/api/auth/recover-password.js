import { connectToDatabase } from '../../../utils/db';
import User from '../../../models/User';
import bcrypt from 'bcrypt';
import { decrypt, generateRecoveryPhrases } from '../../../utils/auth';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectToDatabase();
    const { username, recoveryPhrases, newPassword } = req.body;

    // Find user
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify recovery phrases by decrypting stored phrases and comparing
    const storedPhrasesDecrypted = user.recoveryPhrases.map(phrase => 
      decrypt(phrase.encryptedData, phrase.iv)
    );

    const phrasesMatch = recoveryPhrases.every(
      (phrase, index) => phrase.toLowerCase().trim() === storedPhrasesDecrypted[index].toLowerCase().trim()
    );

    if (!phrasesMatch) {
      console.log('Provided phrases:', recoveryPhrases);
      console.log('Stored phrases:', storedPhrasesDecrypted);
      return res.status(401).json({ error: 'Invalid recovery phrases' });
    }

    // Update password and generate new recovery phrases
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const newRecoveryPhrases = generateRecoveryPhrases();

    await User.findByIdAndUpdate(user._id, { 
      password: hashedPassword,
      recoveryPhrases: newRecoveryPhrases
    });

    // Return new decrypted phrases
    const newDecryptedPhrases = newRecoveryPhrases.map(phrase => 
      decrypt(phrase.encryptedData, phrase.iv)
    );

    res.status(200).json({ 
      message: 'Password reset successful',
      newRecoveryPhrases: newDecryptedPhrases
    });
  } catch (error) {
    console.error('Password recovery error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}