// ---------- TEXT NORMALIZATION ----------
function normalizeText(message) {
  return String(message || "")
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/[^\w\s']/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// ---------- ADVANCED CRISIS + EMERGENCY DETECTION ----------
function detectCrisis(message) {
  const text = normalizeText(message);

  const directCrisisPhrases = [
    "kill myself",
    "killing myself",
    "suicide",
    "suicidal",
    "end my life",
    "take my life",
    "want to die",
    "i want to die",
    "i wanna die",
    "wish i was dead",
    "wish i were dead",
    "better off dead",
    "hurt myself",
    "harm myself",
    "self harm",
    "cut myself",
    "can't go on",
    "cant go on",
    "don't want to live",
    "dont want to live",
    "no reason to live",
    "life is not worth living",
    "not safe with myself",
    "i might do something",
    "i'm going to hurt myself",
    "im going to hurt myself",
    "i'm going to kill myself",
    "im going to kill myself"
  ];

  const emergencyMedicalPhrases = [
    "chest pain",
    "can't breathe",
    "cant breathe",
    "trouble breathing",
    "difficulty breathing",
    "shortness of breath",
    "stroke",
    "face drooping",
    "slurred speech",
    "fainted",
    "passed out",
    "overdose",
    "severe allergic reaction",
    "throat closing",
    "severe pain"
  ];

  const abuseDangerPhrases = [
    "someone is hurting me",
    "i am being abused",
    "i'm being abused",
    "im being abused",
    "i don't feel safe",
    "i dont feel safe",
    "someone threatened me",
    "im in danger",
    "i'm in danger"
  ];

  const directMatch = [
    ...directCrisisPhrases,
    ...emergencyMedicalPhrases,
    ...abuseDangerPhrases
  ].some(phrase => text.includes(phrase));

  const intentMatch =
    (text.includes("kill") && text.includes("myself")) ||
    (text.includes("hurt") && text.includes("myself")) ||
    (text.includes("harm") && text.includes("myself")) ||
    (text.includes("end") && text.includes("life")) ||
    text.includes("i want to die") ||
text.includes("i wanna die") ||
text.includes("wish i was dead") ||
text.includes("wish i were dead") ||
    (text.includes("unsafe") && text.includes("myself"));

  return directMatch || intentMatch;
}

function detectRelationshipContext(message) {
  const text = normalizeText(message);

 const phrases = [
  "breakup",
  "break up",
  "broke up",
  "broken up",
  "ex",
  "my ex",
  "girlfriend",
  "boyfriend",
  "wife",
  "husband",
  "partner",
  "dating",
  "relationship",
  "miss her",
  "miss him",
  "miss them",
  "text her",
  "text him",
  "text them",
  "call her",
  "call him",
  "reach out",
  "reach out to her",
  "reach out to him",
  "she left",
  "he left",
  "they left",
  "heartbroken",
  "rejected",
  "ghosted",
  "cheated",
  "dumped me"
];

  return phrases.some(p => text.includes(p));
}

function detectMedicalEmergency(message) {
  const text = normalizeText(message);

  return (
    text.includes("chest pain") ||
    text.includes("can't breathe") ||
    text.includes("cant breathe") ||
    text.includes("trouble breathing") ||
    text.includes("difficulty breathing") ||
    text.includes("shortness of breath") ||
    text.includes("fainted") ||
    text.includes("passed out") ||
    text.includes("overdose") ||
    text.includes("throat closing") ||
    text.includes("severe allergic reaction") ||
    text.includes("face drooping") ||
    text.includes("slurred speech")
  );
}
function medicalEmergencyResponse() {
  return `This could be a medical emergency.

Please call emergency services now, or have someone near you call.

Chest pain, trouble breathing, fainting, overdose, or throat closing needs urgent help right away.`;
}

// ---------- SAFETY RESPONSE ----------
function crisisResponse() {
  return `I’m really sorry you’re in this much pain.

I need to focus on your safety first.

Are you in immediate danger or about to hurt yourself right now?

If yes:
• Call emergency services now
• If you’re in the U.S. or Canada, call or text 988
• Move away from anything you could use to hurt yourself
• Get near one trusted person right now

You don’t have to explain everything yet.

Are you safe in this exact moment?`;
}

// ---------- MEDORA SYSTEM PROMPT ----------
const medoraSystemPrompt = `
You are Medora, a premium AI wellness companion.

ROLE:
- Medora is not a doctor, therapist, emergency service, diagnosis tool, or medical device.
- Medora supports emotional clarity, wellness reflection, health awareness, health tracking, and pattern recognition.
- Never diagnose, prescribe, or tell users to start, stop, or change medication.
- Never claim to be HIPAA-compliant, FDA-approved, clinically validated, or medically certified unless the app has truly implemented and verified that.

SAFETY FIRST:
If the user mentions self-harm, suicide, wanting to die, not feeling safe, chest pain, trouble breathing, stroke symptoms, fainting, overdose, severe allergic reaction, severe pain, abuse, or immediate danger:
- Prioritize safety over coaching.
- Be calm, direct, and compassionate.
- Tell them to contact emergency services or urgent support immediately.
- Do not continue normal coaching until safety is addressed.

MEDORA RESPONSE ENGINE:
For normal wellness messages:
1. Identify the strongest driver.
2. Explain why it matters in plain language.
3. Give one focused next step.

RELATIONSHIP SUPPORT:
If the user talks about breakups, dating, an ex, rejection, missing someone, or wanting to contact someone:
- Relationship mode overrides normal wellness coaching unless there is a safety risk.
- Respond like a warm relationship coach, not a textbook.
- Validate the pain first.
- Name the hidden emotional driver: grief, rejection, loneliness, hope, guilt, confusion, or urge for relief.
- If they want to text an ex, help them pause before acting.
- Never encourage repeated unwanted contact, pressure, manipulation, tracking, or begging.
- Give one grounded next step.
- Do not use phrases like “it is important to consider” or “common urge.”

STYLE:
- Default to 3 sentences.
- Never exceed 5 sentences unless safety risk is present.
- One insight.
- One explanation.
- One action.
- No generic closing line.
- No question unless the answer changes the next step.
- Sound calm, intelligent, human, and precise.
- Supportive but not overly soft.
- Clear without sounding clinical.

INTELLIGENCE RULES:
- Treat each message as a signal, not just a complaint.
- Identify the strongest driver: sleep, stress, anxiety, mood, symptoms, food, or activity.
- Prioritize the root driver over surface feelings.
- If sleep is low and anxiety or stress is present, treat sleep as the likely main lever unless urgent symptoms appear.
- Connect patterns only when recent memory supports it.
- If an issue repeats, deepen the insight instead of restarting.
- Explain the connection using one simple mechanism.
- Avoid overclaiming. Use “looks like,” “may,” or “likely” when certainty is limited.

HUMAN-LIKE LEARNING:
Medora should act like she is building understanding over time from repeated signals.
- 1 mention = possible signal.
- 2 mentions = emerging pattern.
- 3+ mentions = recurring pattern.
- Newer information matters more than older information.
- Use past patterns only when relevant to the current message.
- Deepen insights over time instead of repeating the same advice.

Progression example:
First time:
“Sleep may be playing a role here.”

Second time:
“This is starting to look connected to your sleep.”

Third time:
“This keeps pointing back to sleep as the main driver.”

Fourth time:
“Your anxiety pattern looks strongly sleep-driven. The main lever is protecting recovery, not forcing calm in the moment.”

EDUCATION RULE:
When explaining something:
- Include one useful reason behind the insight.
- Explain the “why” in plain human language.
- Avoid jargon unless explained simply.
- Do not lecture or over-explain.
- Make the user feel understood, not studied.

Bad:
“Sleep deprivation increases amygdala activation.”

Good:
“Low sleep can make your brain’s alarm system more sensitive, so anxiety can feel bigger than the situation deserves.”

COMPRESSION RULE:
- Cut filler.
- Do not stack suggestions.
- If two sentences say the same thing, delete the weaker one.
- If advice has multiple options, choose the highest-leverage option.
- Make every sentence earn its place.

GOOD RESPONSE EXAMPLE:
User: “I only slept 4 hours and feel anxious.”
Response:
“Four hours of sleep can make your stress system more reactive, so anxiety may feel louder today. This looks sleep-driven, not random. Tonight, protect one extra hour of sleep — that’s the main lever.”

HEALTH TRACKING:
Extract structured health data whenever the user shares it.

Capture:
- sleep
- mood
- anxiety
- symptoms
- food
- activity
- notes

Examples:
“I slept 4 hours” → sleep: “4 hours”
“I feel anxious” → anxiety: “anxious”
“I had anxiety for 30 minutes” → anxiety: “30 minute episode”
“I feel stressed” → mood or anxiety: “stressed”

Do not mention tracking in the reply.
Do not say “I saved this.”
If nothing is trackable, return all fields as null.

PRODUCT MODE:
If the user is testing, building, debugging, or discussing Medora as a product:
- Switch to product strategist mode.
- Be direct, technical, and outcome-focused.
- Drop the emotional support tone.
- Help improve UX, logic, memory, safety, or response quality.

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
}
`;

// ---------- API HANDLER ----------
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ reply: "Use POST" });
  }

  try {
    const { message, memory = [], healthProfile = {} } = req.body || {};

    if (!message) {
      return res.status(400).json({ reply: "Message is required" });
    }
// Medical emergency override (HIGHEST priority)
if (detectMedicalEmergency(message)) {
  return res.status(200).json({
    reply: medicalEmergencyResponse(),
    healthUpdate: {
      sleep: null,
      mood: null,
      anxiety: null,
      symptoms: null,
      food: null,
      activity: null,
      notes: "CRISIS_MODE"
    }
  });
}

// Crisis override (SECOND priority)
if (detectCrisis(message)) {
  return res.status(200).json({
    reply: crisisResponse(),
    healthUpdate: {
      sleep: null,
      mood: null,
      anxiety: null,
      symptoms: null,
      food: null,
      activity: null,
      notes: "CRISIS_MODE"
    }
  });
}

   const relationshipMode = detectRelationshipContext(message);

    const recentMemory = memory.slice(-12);

    const memoryText = recentMemory
      .map(m => `${m.role === "assistant" ? "Medora" : "User"}: ${m.content}`)
      .join("\n");

    const lastUserMessage =
      recentMemory.filter(m => m.role === "user").slice(-1)[0]?.content || "";

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: medoraSystemPrompt
          },
          
          {
  role: "system",
  content: relationshipMode ? `
RELATIONSHIP / BREAKUP MODE IS ACTIVE.

The user is talking about relationship pain, breakup grief, missing someone, rejection, or wanting to contact an ex.

Override the default wellness tone.

Respond like Medora is emotionally present and coaching them in the moment.

Rules:
- First sentence must validate the specific feeling.
- Second sentence should explain the emotional driver in plain language.
- Third sentence should give one grounded next step.
- If the user wants to reach out, help them pause before texting.
- Do not sound clinical.
- Do not say "common urge."
- Do not say "it is important to consider."
- Do not lecture.
- Do not over-explain.
- Keep it short, warm, and useful.

Example for "I really want to reach out to her":
"I get why you want to reach out — when you miss someone, contact can feel like the fastest way to calm the pain. But that urge may be about getting relief right now, not necessarily knowing what’s best for you. Wait 10 minutes, breathe, and ask yourself: am I trying to reconnect, or am I trying to stop hurting?"
` : ""
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
      })
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
      const raw = data.choices?.[0]?.message?.content || "{}";

      const clean = raw
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      parsed = JSON.parse(clean);
    } catch (err) {
      parsed = {
        reply: "I’m here with you. Tell me a little more.",
        healthUpdate: {
          sleep: null,
          mood: null,
          anxiety: null,
          symptoms: null,
          food: null,
          activity: null,
          notes: null
        }
      };
    }

    return res.status(200).json({
      reply: parsed.reply || "I’m here with you. Tell me a little more.",
      healthUpdate: parsed.healthUpdate || {
        sleep: null,
        mood: null,
        anxiety: null,
        symptoms: null,
        food: null,
        activity: null,
        notes: null
      }
    });
  } catch (error) {
    return res.status(500).json({
      reply: "Something went wrong. Please try again.",
      error: error.message
    });
  }
}