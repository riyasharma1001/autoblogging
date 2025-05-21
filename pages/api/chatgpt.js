// pages/api/chatgpt.js
import OpenAI from "openai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { prompt } = req.body;

  try {
    // 1) Retrieve your ChatGPT API key from environment
    const apiKey = process.env.CHATGPT_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "No ChatGPT API key configured." });
    }

    // 2) Instantiate the OpenAI client with the server-side API key
    const openai = new OpenAI({ apiKey });

    // 3) Use a free model like "gpt-3.5-turbo" to avoid GPT-4 quota
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Free model
      messages: [
        { role: "system", content: "You are a Expert in blogpost writing and SEO optimization." },
        { role: "user", content: prompt },
      ],
      store: true,
    });

    // 4) Extract the text
    const generatedText = completion.choices?.[0]?.message?.content;
    if (!generatedText) {
      return res.status(400).json({ error: "No content returned by ChatGPT." });
    }

    // Return the AI text
    return res.status(200).json({ result: generatedText });
  } catch (err) {
    console.error("ChatGPT error:", err);
    return res.status(500).json({ error: err.message || "ChatGPT request failed." });
  }
}
