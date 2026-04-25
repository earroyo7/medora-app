export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Use POST" });
  }

  try {
    const { message, memory = [] } = req.body || {};

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const recentMemory = memory.slice(-12);

    const memoryText = recentMemory
      .map(m => `${m.role}: ${m.content}`)
      .join("\n");

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: [
          {
            role: "system",
            content:
              "You are Medora, a warm, supportive AI health companion. Use recent memory when relevant. If the user mentioned sleep, mood, anxiety, food, symptoms, or activity earlier, reference it naturally. Do not diagnose or replace a doctor. For emergencies, tell the user to seek urgent help immediately."
          },
          {
            role: "system",
            content: `Recent memory:\n${memoryText || "No recent memory yet."}`
          },
          {
            role: "user",
            content: message
          }
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        reply: "Sorry, I could not connect to Medora right now.",
        error: data,
      });
    }

    const reply =
      data.output?.[0]?.content?.[0]?.text ||
      "I’m here with you. Tell me a little more about how you’re feeling.";

    return res.status(200).json({ reply });

  } catch (error) {
    return res.status(500).json({
      reply: "Something went wrong. Please try again.",
      error: error.message,
    });
  }
}