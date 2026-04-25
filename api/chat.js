export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Use POST" });
  }

  try {
    const { message } = req.body || {};

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: `You are Medora, a warm, supportive AI health companion. 
You help users with wellness, mood, anxiety, sleep, food, symptoms, and health tracking.
You do not diagnose or replace a doctor.
If there is an emergency, tell the user to seek urgent help immediately.

User message: ${message}`,
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