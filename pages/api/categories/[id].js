// pages/api/categories/[id].js
// pages/api/categories/[id].js
import { connectToDB } from "../../../utils/db";
import Category from "../../../models/Category";


export default async function handler(req, res) {
  await connectToDB();
  const { id } = req.query;

  const category = await Category.findById(id);
  if (!category) {
    return res.status(404).json({ error: "Category not found" });
  }

  if (req.method === "GET") {
    return res.status(200).json(category);
  } else if (req.method === "PUT") {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: "Name is required" });
    }
    category.name = name;
    await category.save();
    return res.status(200).json(category);
  } else if (req.method === "DELETE") {
    await Category.findByIdAndDelete(id);
    return res.status(200).json({ message: "Category deleted" });
  } else {
    res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
