import mongoose from 'mongoose';
import slugify from 'slugify';

const PostSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: Object },
  image: String,
  featuredImage: String, // Make sure this field exists
  categories: [String],
  published: { type: Boolean, default: false },
  slug: { type: String, unique: true }
}, {
  timestamps: true
});

// Generate clean SEO-friendly slug from title
PostSchema.pre('save', async function(next) {
  if (this.title && (!this.slug || this.isModified('title'))) {
    // Create base slug
    let baseSlug = slugify(this.title, {
      lower: true,      // Convert to lowercase
      strict: true,     // Remove special characters
      trim: true        // Trim whitespace
    });
    
    // Check if the slug exists (excluding current document)
    let slugExists = await mongoose.models.Post.findOne({
      slug: baseSlug,
      _id: { $ne: this._id }
    });

    if (slugExists) {
      // Find a unique slug by appending a number
      let count = 1;
      let newSlug = baseSlug;
      while (slugExists) {
        newSlug = `${baseSlug}-${count}`;
        slugExists = await mongoose.models.Post.findOne({
          slug: newSlug,
          _id: { $ne: this._id }
        });
        count++;
      }
      baseSlug = newSlug;
    }
    
    this.slug = baseSlug;
  }
  next();
});

export default mongoose.models.Post || mongoose.model('Post', PostSchema);
