// models/Category.js
import mongoose from "mongoose";

// Define the Category schema
const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  // Add more fields if needed, for example:
  // description: String,
}, {
  timestamps: true // if you want createdAt/updatedAt
});

// Export the Category model
// "Category" is the model name, "CategorySchema" is the schema we just defined
export default mongoose.models.Category ||
  mongoose.model("Category", CategorySchema);
