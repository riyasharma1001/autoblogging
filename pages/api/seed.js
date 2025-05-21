import { connectToDB } from "../../utils/db";
import User from "../../models/User";

export default async function handler(req, res) {
  if (req.method === "GET") {
    await connectToDB();
    const existingAdmin = await User.findOne({ username: "admin" });
    if (!existingAdmin) {
      const adminUser = new User({
        username: "admin",
        password: "password"
      });
      await adminUser.save();
    }
    return res.status(200).json({ message: "Database seeded" });
  }
  res.setHeader("Allow", ["GET"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
