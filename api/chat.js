export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ reply: "Use POST" });
  }

  try {
    const { message, memory = [], healthProfile = {} } = req.body || {};

    if (!message) {
      return res.status(400).json({ reply: "Message is required" });
    }

    const memoryText = memory
      .slice(-16)
      .map(m => `${m.role}: ${m.content}`)
      .join("\n");

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: `You are Medora, a warm AI health companion.

Use recent memory when relevant.
Do not diagnose or replace a doctor.
For emergencies, self-harm, chest pain, trouble breathing, stroke symptoms, fainting, severe allergic reaction, or immediate danger, tell the user to seek urgent help now.

Return ONLY valid JSON:
{
  "reply": "string",
  "healthUpdate": {
    "sleep": null,
    "mood": null,
    "anxiety": null,
    "symptoms": null,
    "food": null,
    "activity": null,
    "notes": null
  }
}`
          },
          {
            role: "user",
            content:
              "Stored health profile:\n" +
              JSON.stringify(healthProfile).slice(0, 6000) +
              "\n\nRecent memory:\n" +
              (memoryText || "No memory yet.") +
              "\n\nCurrent user message:\n" +
              message
          }
        ]
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        reply: "Sorry, I could not connect to Medora right now.",
        error: data
      });
    }

    let parsed;
    try {
      parsed = JSON.parse(data.choices?.[0]?.message?.content || "{}");
    } catch {
      parsed = {
        reply: data.choices?.[0]?.message?.content || "I’m here with you.",
        healthUpdate: {}
      };
    }

    return res.status(200).json({
      reply: parsed.reply || "I’m here with you. Tell me a little more.",
      healthUpdate: parsed.healthUpdate || {}
    });

  } catch (error) {
    return res.status(500).json({
      reply: "Something went wrong. Please try again.",
      error: error.message
    });
  }
}