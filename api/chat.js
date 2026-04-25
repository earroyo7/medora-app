export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Use POST" });
  }

  try {
    const { message, memory = [], healthProfile = {} } = req.body || {};

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const recentMemory = memory.slice(-16).map(m => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: String(m.content || "").slice(0, 1200)
    }));

    const profileSummary = JSON.stringify(healthProfile).slice(0, 6000);

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
            content: `
You are Medora, an advanced AI health companion.

Your personality:
- Warm, calm, emotionally intelligent
- Supportive but not overly robotic
- Short enough to feel conversational
- Personalized using memory whenever relevant
- Helpful with mood, sleep, anxiety, symptoms, food, activity, habits, and doctor-ready notes

Rules:
- Do NOT diagnose.
- Do NOT prescribe medication.
- Do NOT replace a doctor.
- If user mentions self-harm, chest pain, trouble breathing, stroke symptoms, fainting, severe allergic reaction, severe pain, or immediate danger, tell them to seek urgent help now.
- If memory is relevant, reference it naturally.
- If the user shares trackable health data, extract it into healthUpdate.

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
}
`
          },
          {
            role: "system",
            content: `Stored health profile:\n${profileSummary}`
          },
          {
            role: "system",
            content: `Recent conversation memory:\n${recentMemory.map(m => `${m.role}: ${m.content}`).join("\n") || "No recent memory yet."}`
          },
          {
            role: "user",
            content: message
          }
        ],
        text: {
          format: {
            type: "json_object"
          }
        }
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        reply: "Sorry, I could not connect to Medora right now.",
        error: data
      });
    }

    const raw =
      data.output?.[0]?.content?.[0]?.text ||
      '{"reply":"I’m here with you. Tell me a little more.","healthUpdate":{}}';

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = {
        reply: raw,
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