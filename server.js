const express = require("express");
const cors = require("cors");
const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static("public"));
const ANTHROPIC_API_KEY =
  process.env.ANTHROPIC_API_KEY || "sk-ant-api03-lhB...ZAAA";
const MODEL = "claude-sonnet-4-20250514";
const DEFAULT_SYSTEM = `Bạn là trợ lý ảo của website. Hãy trả lời lịch sự, ngắn gọn bằng tiếng Việt.
Nếu không biết câu trả lời, hãy thành thật nói không biết và đề nghị hỗ trợ thêm.`;
app.post("/api/chat", async (req, res) => {
  const { messages, system } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "messages phải là một mảng" });
  }
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1024,
        system: system || DEFAULT_SYSTEM,
        messages: messages,
      }),
    });
    if (!response.ok) {
      const err = await response.json();
      console.error("Anthropic API error:", err);
      return res.status(response.status).json({ error: err.error?.message });
    }
    const data = await response.json();
    const reply = data.content?.[0]?.text || "";
    res.json({ reply, usage: data.usage });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: "Lỗi server nội bộ" });
  }
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server đang chạy tại http://localhost:${PORT}`);
});
