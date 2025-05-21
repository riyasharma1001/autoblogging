// pages/search.js
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Layout from "../components/Layout";

export default function SearchPage() {
  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [query, setQuery] = useState(router.query.query || "");
  const [category, setCategory] = useState(router.query.category || "");
  const [startDate, setStartDate] = useState(router.query.startDate || "");
  const [endDate, setEndDate] = useState(router.query.endDate || "");
  const [page, setPage] = useState(parseInt(router.query.page || 1, 10));

  // Fetch search results from /api/search
  async function fetchResults() {
    const params = new URLSearchParams();
    if (query.trim()) params.set("query", query.trim());
    if (category) params.set("category", category);
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);
    params.set("page", page);

    const url = `/api/search?${params.toString()}`;
    const res = await fetch(url);
    const data = await res.json();
    setPosts(data.posts);
    setTotalCount(data.totalCount);
    setCurrentPage(data.currentPage);
    setTotalPages(data.totalPages);
  }

  // Trigger fetch whenever page or filter changes
  useEffect(() => {
    fetchResults();
  }, [page]);

  // If user changes query, category, or date, reset page to 1
  function handleSubmit(e) {
    e.preventDefault();
    setPage(1);
    // push new query to router so the URL updates
    const params = new URLSearchParams();
    if (query.trim()) params.set("query", query.trim());
    if (category) params.set("category", category);
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);
    params.set("page", "1");
    router.push(`/search?${params.toString()}`, undefined, { shallow: true });
    fetchResults();
  }

  // If user clicks next or prev page
  function handlePageChange(newPage) {
    setPage(newPage);
    const params = new URLSearchParams(router.query);
    params.set("page", newPage);
    router.push(`/search?${params.toString()}`, undefined, { shallow: true });
  }

  return (
    <Layout>
      <h1>Advanced Search</h1>
      <form onSubmit={handleSubmit} style={{ marginBottom: "1rem" }}>
        <input
          type="text"
          placeholder="Search query"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ marginRight: "8px" }}
        />
        <input
          type="text"
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={{ marginRight: "8px" }}
        />
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          style={{ marginRight: "8px" }}
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          style={{ marginRight: "8px" }}
        />
        <button type="submit">Search</button>
      </form>

      <p>Found {totalCount} results</p>

      {posts.map((post) => (
        <div key={post._id} style={{ borderBottom: "1px solid #ccc", marginBottom: "1rem" }}>
          <h2>{post.title}</h2>
          <p>{(post.content || "").substring(0, 150)}...</p>
          <a href={`/posts/${post._id}`} style={{ color: "#0070f3" }}>
            Read More
          </a>
        </div>
      ))}

      {/* Pagination Controls */}
      <div style={{ marginTop: "1rem" }}>
        {currentPage > 1 && (
          <button onClick={() => handlePageChange(currentPage - 1)}>Previous</button>
        )}
        <span style={{ margin: "0 1rem" }}>
          Page {currentPage} of {totalPages}
        </span>
        {currentPage < totalPages && (
          <button onClick={() => handlePageChange(currentPage + 1)}>Next</button>
        )}
      </div>
    </Layout>
  );
}
