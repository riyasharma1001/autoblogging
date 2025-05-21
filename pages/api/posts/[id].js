// pages/api/posts/[id].js
import dbConnect from '../../../utils/db';
import Post from '../../../models/Post';
import slugify from 'slugify';

export default async function handler(req, res) {
  await dbConnect();
  const { id } = req.query;

  switch (req.method) {
    case 'DELETE':
      try {
        const deletedPost = await Post.findByIdAndDelete(id);
        
        if (!deletedPost) {
          return res.status(404).json({ error: 'Post not found' });
        }

        return res.status(200).json({ message: 'Post deleted successfully' });
      } catch (error) {
        console.error('Delete error:', error);
        return res.status(500).json({ error: 'Error deleting post' });
      }
      break;

    case 'PUT':
      try {
        const updates = req.body;

        console.log('Updating post:', id, updates); // For debugging

        const updatedPost = await Post.findByIdAndUpdate(
          id,
          { 
            ...updates,
            featuredImage: updates.featuredImage 
          },
          { new: true }
        );

        if (!updatedPost) {
          return res.status(404).json({ message: 'Post not found' });
        }

        console.log('Updated post:', updatedPost); // For debugging
        return res.status(200).json(updatedPost);

      } catch (error) {
        console.error('Update error:', error);
        return res.status(500).json({ message: error.message });
      }
      break;

    default:
      res.setHeader('Allow', ['DELETE', 'PUT']);
      return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
}
