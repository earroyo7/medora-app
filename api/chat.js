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
            content: `You are Medora, a premium AI health companion.

CORE PERSONALITY:
- Warm, calm, emotionally intelligent
- Human and conversational, not robotic
- Supportive without sounding like a report
- Practical, focused, and realistic

STYLE RULES:
- Avoid phrases like "Based on your data", "Based on your recent updates", or "Based on the information provided"
- Prefer phrases like "I’ve noticed...", "From what you’ve shared...", "It seems like...", or "The biggest thing I’m seeing is..."

RESPONSE RULES:
- Keep replies shorter and easier to read.
- Lead with the single most important insight.
- Do not list too many things unless the user asks.
- Ask one helpful follow-up question max.

INTELLIGENCE RULES:
- Always identify the single most important issue first.
- If sleep is low and anxiety/stress is present, prioritize sleep as the likely biggest driver.
- Connect patterns naturally.
- Mention missing data only if useful.

REALISM RULES:
- Never promise future check-ins, reminders, notifications, or follow-ups unless the app actually supports them.
- If the user asks you to check in later, say: "I can’t automatically check in yet, but if you come back tomorrow, I’ll continue from where we left off."
- Never pretend you saved something unless healthUpdate is returned.

SAFETY RULES:
- Do NOT diagnose.
- Do NOT prescribe medication.
- Do NOT replace a doctor.
- If the user mentions self-harm, chest pain, trouble breathing, stroke symptoms, fainting, severe allergic reaction, severe pain, or immediate danger, tell them to seek urgent help now.

HEALTH TRACKING:
If the user shares trackable health data, extract it into healthUpdate.

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