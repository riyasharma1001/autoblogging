// pages/api/comments/index.js
import dbConnect from "../../../utils/db";
import Comment from "../../../models/Comment";

export default async function handler(req, res) {
  await dbConnect();
  
  if (req.method === "GET") {
    // Optionally filter by postId if provided in query string
    const { postId } = req.query;
    const filter = postId ? { postId } : {};
    const comments = await Comment.find(filter).sort({ createdAt: -1 }).limit(10); // Limit to 10 comments

    // Convert dates to string so they are serializable (if needed)
    const serialized = comments.map((c) => ({
      ...c.toObject(),
      _id: c._id.toString(),
      createdAt: c.createdAt.toISOString(),
    }));
    return res.status(200).json(serialized);
  } else if (req.method === "POST") {
    const { postId, author, content } = req.body;
    if (!postId || !author || !content) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    try {
      const comment = new Comment({ postId, author, content, approved: true });
      await comment.save();
      return res.status(201).json({
        ...comment.toObject(),
        _id: comment._id.toString(),
        createdAt: comment.createdAt.toISOString(),
      });
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
