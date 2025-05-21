// pages/admin/ai-key.js
import { useState } from "react";
import { useRouter } from "next/router";
import { setAPIToken } from "../../utils/session";

export default function AIKeyPage() {
  const router = useRouter();
  const [apiKey, setApiKey] = useState("");

  const handleSave = () => {
    if (!apiKey.trim()) {
      alert("Please enter a valid API key.");
      return;
    }
    setAPIToken(apiKey);
    alert("AI API key saved in session storage!");
    router.push("/admin/posts/new");
  };

  return (
    <div style={{ margin: "2rem", textAlign: "center" }}>
      <h1>Set AI API Key</h1>
      <p>Enter your OpenRouter API key below:</p>
      <input
        type="text"
        value={apiKey}
        onChange={(e) => setApiKey(e.target.value)}
        style={{ padding: "8px", width: "300px", marginRight: "8px" }}
      />
      <button onClick={handleSave} style={{ padding: "8px 16px" }}>
        Save Key
      </button>
    </div>
  );
}
