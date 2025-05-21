const crypto = require('crypto');

// Generate a 32-byte (256-bit) key
const key = crypto.randomBytes(32);

// Convert to hex string
const hexKey = key.toString('hex');

console.log('Generated RECOVERY_PHRASES_KEY:');
console.log(hexKey);