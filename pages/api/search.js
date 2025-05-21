// pages/api/search.js
import { connectToDB } from "../../utils/db";
import Post from "../../models/Post";

export default async function handler(req, res) {
  await connectToDB();

  const {
    query = "",       // text to search
    category = "",    // category filter
    startDate = "",   // date range start
    endDate = "",     // date range end
    page = 1,         // pagination page
    limit = 10        // pagination limit
  } = req.query;

  // Convert page/limit to numbers
  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 10;

  // Build a filter object
  const filter = { published: true };

  // If user typed a search query, use $text
  if (query.trim()) {
    filter.$text = { $search: query.trim() };
  }

  // If category is specified, filter by that category
  if (category) {
    filter.categories = category;
  }

  // If startDate or endDate are provided, filter by createdAt
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) {
      filter.createdAt.$gte = new Date(startDate);
    }
    if (endDate) {
      // set endDate's time to 23:59:59 if you want inclusive
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filter.createdAt.$lte = end;
    }
  }

  // Do a paginated find
  const skip = (pageNum - 1) * limitNum;

  // For text search sorting, you can optionally add { score: { $meta: "textScore" } }
  // But let's do newest first
  const posts = await Post.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum)
    .lean();

  // Convert for Next.js
  const serializedPosts = posts.map((p) => ({
    ...p,
    _id: p._id.toString(),
    createdAt: p.createdAt ? p.createdAt.toISOString() : null,
  }));

  // Also get total count for pagination
  const totalCount = await Post.countDocuments(filter);

  res.status(200).json({
    posts: serializedPosts,
    totalCount,
    currentPage: pageNum,
    totalPages: Math.ceil(totalCount / limitNum),
  });
}
