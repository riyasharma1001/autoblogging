const { connectToDatabase } = require('../utils/db');
const Post = require('../models/Post');
const slugify = require('slugify');

async function generateSlugs() {
  try {
    await connectToDatabase();
    const posts = await Post.find({ slug: { $exists: false } });
    
    for (const post of posts) {
      post.slug = slugify(post.title, {
        lower: true,
        strict: true,
        trim: true
      });
      await post.save();
      console.log(`Generated slug for post: ${post.title} -> ${post.slug}`);
    }
    
    console.log('Finished generating slugs');
    process.exit(0);
  } catch (error) {
    console.error('Error generating slugs:', error);
    process.exit(1);
  }
}

generateSlugs();