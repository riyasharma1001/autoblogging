// pages/api/categories/index.js
import dbConnect from "../../../utils/db";
import Category from "../../../models/Category";

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === "POST") {
    // Create a new category
    try {
      const { name } = req.body;
      if (!name) {
        return res.status(400).json({ error: "Name is required" });
      }
      // Insert into MongoDB
      const newCat = await Category.create({ name });
      return res.status(201).json({ success: true, category: newCat });
    } catch (err) {
      console.error("Error creating category:", err);
      return res.status(500).json({ error: "Failed to create category" });
    }
  } else if (req.method === "GET") {
    // (Optional) Return all categories if you want a GET endpoint
    try {
      const categories = await Category.find().sort({ name: 1 }).lean();
      return res.status(200).json({ success: true, categories });
    } catch (err) {
      console.error("Error fetching categories:", err);
      return res.status(500).json({ error: "Failed to fetch categories" });
    }
  } else {
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
}
