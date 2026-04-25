export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ reply: "Use POST" });
  }

  try {
    const { message, memory = [], healthProfile = {} } = req.body || {};

    if (!message) {
      return res.status(400).json({ reply: "Message is required" });
    }

    const recentMemory = memory.slice(-12);

const memoryText = recentMemory
  .map(m => `${m.role === "assistant" ? "Medora" : "User"}: ${m.content}`)
  .join("\n");

const lastUserMessage = recentMemory
  .filter(m => m.role === "user")
  .slice(-1)[0]?.content || "";

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
- Avoid robotic phrasing
- Speak like a real supportive human
- Keep responses natural, not clinical

RESPONSE RULES:
- Lead with the most important insight
- Keep responses concise (3–6 sentences max)
- Ask at most ONE follow-up question

INTELLIGENCE RULES:
- Identify patterns across sleep, anxiety, stress
- Prioritize the biggest driver (often sleep)
- Connect insights naturally

REALISM RULES:
- Do NOT pretend to send notifications or reminders
- If asked to follow up later, say:
"I can’t automatically check in yet, but I’ll remember this if you come back."

SAFETY:
- No diagnosing or medical advice
- Urgent symptoms → tell user to seek help immediately

OUTPUT FORMAT:
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
    role: "system",
    content: `USER HEALTH PROFILE:\n${JSON.stringify(healthProfile).slice(0, 4000)}`
  },

  {
    role: "system",
    content: `RECENT CONVERSATION:\n${memoryText || "No prior conversation"}`
  },

  {
    role: "system",
    content: `LAST USER MESSAGE:\n${lastUserMessage}`
  },

  {
    role: "user",
    content: message
  }
]

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        reply: "Sorry, I could not connect to Medora right now.",
        error: data
      });
    }

    let parsed;

try {
  const raw = data.choices?.[0]?.message?.content || "{}";

  // Clean common formatting issues (very important)
  const clean = raw
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  parsed = JSON.parse(clean);

} catch (err) {
  parsed = {
    reply: "I’m here with you. Tell me a little more.",
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