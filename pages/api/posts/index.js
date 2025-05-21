// pages/api/posts/index.js
import dbConnect from "../../../utils/db";
import Post from "../../../models/Post";

export default async function handler(req, res) {
  await dbConnect(); 

  if (req.method === "GET") {
    try {
      const allPosts = await Post.find().sort({ createdAt: -1 }).lean();
      // If you store images as large buffers or base64, you might want to omit or transform them
      return res.status(200).json(allPosts);
    } catch (error) {
      console.error("Error fetching posts:", error);
      return res.status(500).json({ error: "Failed to load posts" });
    }
  } else if (req.method === "POST") {
    // Your existing create-post logic
    try {
      const { title, content, image, featuredImage, categories, published } = req.body;
      const newPost = new Post({
        title,
        content,
        image,
        featuredImage,
        categories: categories || [],
        published: published !== undefined ? published : true,
      });
      await newPost.save();
      return res.status(201).json({ message: "Post created", postId: newPost._id });
    } catch (error) {
      console.error("Error creating post:", error);
      return res.status(400).json({ error: error.message });
    }
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
