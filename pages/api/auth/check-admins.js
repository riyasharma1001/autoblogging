import dbConnect from "../../../utils/db";
import User from "../../../models/User";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    await dbConnect();
    const count = await User.countDocuments();
    return res.status(200).json({ count });
  } catch (error) {
    console.error("Check admins error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
