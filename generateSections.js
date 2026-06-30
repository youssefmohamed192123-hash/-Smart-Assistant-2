// lib/generateSections.js
const OpenAI = require("openai");

function getClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured on the server.");
  }
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

const SYSTEM_PROMPT = `You are an expert bilingual (English/Arabic) study assistant.
You will be given a raw chunk of text extracted from an educational document
(could be a lecture, slide deck, book chapter, or training material on ANY subject).

Detect one or more logical sections/topics/slides within the chunk and, for each one, produce:
- "titleEn": short English title
- "titleAr": short Arabic title
- "originalContent": the cleaned-up original English content for that section (concise, keep key facts)
- "arabicTranslation": full, accurate Arabic translation of the original content
- "arabicExplanation": a clear, simplified Arabic explanation of the concept aimed at a student
- "vocabulary": array of objects { en, ar, pronunciation } for key terms (3-8 items)
- "concepts": array of strings listing the important concepts/ideas (2-6 items)
- "summary": short Arabic summary (1-3 sentences)

Respond ONLY with valid JSON in this exact shape, no markdown fences, no commentary:
{
  "sections": [
    {
      "titleEn": "...",
      "titleAr": "...",
      "originalContent": "...",
      "arabicTranslation": "...",
      "arabicExplanation": "...",
      "vocabulary": [{ "en": "...", "ar": "...", "pronunciation": "..." }],
      "concepts": ["...", "..."],
      "summary": "..."
    }
  ]
}

If the chunk has no meaningful educational content (e.g. a blank page), return { "sections": [] }.`;

async function generateSectionsFromChunk(chunkText, chunkIndex) {
  const client = getClient();

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.3,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `Document chunk #${chunkIndex + 1}:\n\n${chunkText}`
      }
    ]
  });

  const raw = response.choices[0].message.content;
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    throw new Error("Failed to parse AI response as JSON.");
  }

  return Array.isArray(parsed.sections) ? parsed.sections : [];
}

module.exports = { generateSectionsFromChunk };
