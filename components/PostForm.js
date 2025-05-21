// components/PostForm.js
import { useState, useEffect } from "react";

export default function PostForm({ initialData = {}, onSubmit }) {
  const [title, setTitle] = useState(initialData.title || "");
  const [content, setContent] = useState(initialData.content || "");
  const [image, setImage] = useState(initialData.image || "");
  const [featuredImage, setFeaturedImage] = useState(initialData.featuredImage || "");
  const [allCategories, setAllCategories] = useState([]); // All categories from DB
  const [selectedCats, setSelectedCats] = useState(initialData.categories || []);
  const [published, setPublished] = useState(
    initialData.published !== undefined ? initialData.published : true
  );
  const [uploading, setUploading] = useState(false);

  // Fetch all categories once
  useEffect(() => {
    async function fetchCats() {
      try {
        const res = await fetch("/api/categories");
        if (!res.ok) throw new Error("Failed to load categories");
        const data = await res.json();
        setAllCategories(data);
      } catch (err) {
        console.error(err);
      }
    }
    fetchCats();
  }, []);

  // Toggle category in selectedCats
  const handleCategoryChange = (catId) => {
    setSelectedCats((prev) => {
      if (prev.includes(catId)) {
        return prev.filter((c) => c !== catId);
      } else {
        return [...prev, catId];
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // We store category names, not IDs. Let's map them.
    // Or if you prefer IDs, store them as IDs in the Post model.
    const categoryNames = allCategories
      .filter((c) => selectedCats.includes(c._id))
      .map((c) => c.name);

    onSubmit({
      title,
      content,
      image,
      featuredImage,
      categories: categoryNames,
      published,
    });
  };

  // Example file upload
  const handleFileChange = async (e, setFn) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      setFn(data.filePath);
    } catch (error) {
      console.error("Image upload failed", error);
    }
    setUploading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Title */}
      <div>
        <label>Title:</label><br />
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      {/* Content */}
      <div>
        <label>Content:</label><br />
        <textarea
          rows={5}
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </div>

      {/* Regular image */}
      <div>
        <label>Image:</label><br />
        <input
          type="file"
          onChange={(e) => handleFileChange(e, setImage)}
        />
        {uploading && <p>Uploading image...</p>}
        {image && <img src={image} alt="Image" style={{ maxWidth: "200px" }} />}
      </div>

      {/* Featured Image */}
      <div>
        <label>Featured Image:</label><br />
        <input
          type="file"
          onChange={(e) => handleFileChange(e, setFeaturedImage)}
        />
        {uploading && <p>Uploading image...</p>}
        {featuredImage && (
          <img src={featuredImage} alt="Featured" style={{ maxWidth: "200px" }} />
        )}
      </div>

      {/* Category checkboxes */}
      <div>
        <label>Categories:</label><br />
        {allCategories.map((cat) => (
          <div key={cat._id}>
            <input
              type="checkbox"
              checked={selectedCats.includes(cat._id)}
              onChange={() => handleCategoryChange(cat._id)}
            />
            <span>{cat.name}</span>
          </div>
        ))}
      </div>

      {/* Published toggle */}
      <div>
        <label>Published:</label>
        <input
          type="checkbox"
          checked={published}
          onChange={(e) => setPublished(e.target.checked)}
        />
      </div>

      <button type="submit">Save Post</button>
    </form>
  );
}
