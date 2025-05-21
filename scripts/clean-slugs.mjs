import mongoose from 'mongoose';
import { connectToDatabase } from '../utils/db.js';
import slugify from 'slugify';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env.local') });

// Define Post Schema here to ensure it's available
const PostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  slug: {
    type: String,
    unique: true
  },
  content: {
    type: Object,
    required: true
  },
  published: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Create the Post model
const Post = mongoose.models.Post || mongoose.model('Post', PostSchema);

async function cleanSlugs() {
  try {
    await connectToDatabase();
    const posts = await Post.find({});
    
    for (const post of posts) {
      if (!post.title) {
        console.warn(`Skipping post with id ${post._id} - no title found`);
        continue;
      }

      // Create base slug
      let baseSlug = slugify(post.title, {
        lower: true,
        strict: true,
        trim: true
      });
      
      // Check for duplicates
      let slugExists = await Post.findOne({ 
        slug: baseSlug,
        _id: { $ne: post._id }
      });
      
      if (slugExists) {
        let count = 1;
        while (slugExists) {
          const newSlug = `${baseSlug}-${count}`;
          slugExists = await Post.findOne({ 
            slug: newSlug,
            _id: { $ne: post._id }
          });
          if (!slugExists) {
            baseSlug = newSlug;
          }
          count++;
        }
      }
      
      post.slug = baseSlug;
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

cleanSlugs();