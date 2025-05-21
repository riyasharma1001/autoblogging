// pages/api/auth/register.js
import dbConnect from "../../../utils/db";
import User from "../../../models/User";
import bcrypt from "bcrypt";
import { generateRecoveryPhrases, decrypt } from '../../../utils/auth';

// Update the handler function to verify admin first
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  try {
    await dbConnect();
    const { username, password, verificationCreds } = req.body;

    // First check if any admin exists in DB
    const adminCount = await User.countDocuments();
    
    // If no admin exists, directly register without verification
    if (adminCount === 0) {
      // Check if username is taken
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ error: "Username already exists" });
      }

      // Generate recovery phrases and create admin
      const recoveryPhrases = generateRecoveryPhrases();
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const newUser = new User({
        username,
        password: hashedPassword,
        recoveryPhrases
      });
      await newUser.save();

      // Return decrypted phrases
      const decryptedPhrases = recoveryPhrases.map(phrase => 
        decrypt(phrase.encryptedData, phrase.iv)
      );

      return res.status(201).json({
        success: true,
        message: "First admin registered successfully",
        recoveryPhrases: decryptedPhrases,
        isFirstAdmin: true
      });
    }

    // If admins exist, verify credentials first
    if (!verificationCreds) {
      return res.status(400).json({ error: "Admin verification required" });
    }

    // Verify existing admin
    const existingAdmin = await User.findOne({ username: verificationCreds.username });
    if (!existingAdmin) {
      return res.status(401).json({ error: "Invalid admin credentials" });
    }

    const isValidAdmin = await bcrypt.compare(verificationCreds.password, existingAdmin.password);
    if (!isValidAdmin) {
      return res.status(401).json({ error: "Invalid admin credentials" });
    }

    // Check if new username is taken
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: "Username already exists" });
    }

    // Create new admin after verification
    const recoveryPhrases = generateRecoveryPhrases();
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newUser = new User({
      username,
      password: hashedPassword,
      recoveryPhrases
    });
    await newUser.save();

    const decryptedPhrases = recoveryPhrases.map(phrase => 
      decrypt(phrase.encryptedData, phrase.iv)
    );

    return res.status(201).json({
      success: true,
      message: "Admin registered successfully",
      recoveryPhrases: decryptedPhrases,
      isFirstAdmin: false
    });

  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
