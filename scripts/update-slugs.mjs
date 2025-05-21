import mongoose from 'mongoose';
import { connectToDatabase } from '../utils/db.js';
import slugify from 'slugify';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env.local') });

const PostSchema = new mongoose.Schema({
  title: String,
  slug: String,
  content: Object,
  published: Boolean,
}, { timestamps: true });

const Post = mongoose.models.Post || mongoose.model('Post', PostSchema);

async function updateSlugs() {
  try {
    await connectToDatabase();
    const posts = await Post.find({});
    
    for (const post of posts) {
      if (!post.title) {
        console.warn(`Skipping post with id ${post._id} - no title found`);
        continue;
      }

      // Create clean SEO-friendly slug
      const newSlug = slugify(post.title, {
        lower: true,
        strict: true,
        trim: true
      });
      
      post.slug = newSlug;
      await post.save();
      console.log(`Updated slug for post: ${post.title} -> ${post.slug}`);
    }
    
    console.log('Finished updating slugs');
    process.exit(0);
  } catch (error) {
    console.error('Error updating slugs:', error);
    process.exit(1);
  }
}

updateSlugs();