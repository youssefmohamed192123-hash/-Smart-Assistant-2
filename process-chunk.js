// pages/api/process-chunk.js
import { generateSectionsFromChunk } from "../../lib/generateSections";

export const config = {
  api: {
    bodyParser: { sizeLimit: "8mb" }
  }
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { chunkText, chunkIndex } = req.body;

  if (!chunkText) {
    return res.status(400).json({ error: "chunkText is required." });
  }

  try {
    const sections = await generateSectionsFromChunk(chunkText, chunkIndex || 0);
    return res.status(200).json({ sections });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || "Failed to generate sections." });
  }
}
