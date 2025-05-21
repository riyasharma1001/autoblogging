import crypto from 'crypto';

const algorithm = 'aes-256-cbc';
const key = Buffer.from(process.env.RECOVERY_PHRASES_KEY, 'hex');

// Encrypt function
export const encrypt = (text) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return { iv: iv.toString('hex'), encryptedData: encrypted.toString('hex') };
};

// Decrypt function
export const decrypt = (text, iv) => {
  const decipher = crypto.createDecipheriv(algorithm, key, Buffer.from(iv, 'hex'));
  let decrypted = decipher.update(Buffer.from(text, 'hex'));
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
};

export const generateRecoveryPhrases = () => {
  const phrases = process.env.RECOVERY_PHRASES.split('|');
  const selectedPhrases = [];
  const usedIndices = new Set();

  while (selectedPhrases.length < 7) { // Changed from 5 to 7
    const index = Math.floor(Math.random() * phrases.length);
    if (!usedIndices.has(index)) {
      usedIndices.add(index);
      const phrase = phrases[index];
      selectedPhrases.push(encrypt(phrase));
    }
  }

  return selectedPhrases;
};