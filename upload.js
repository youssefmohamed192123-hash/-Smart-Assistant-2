// pages/api/upload.js
import { extractText } from "../../lib/extractText";
import { splitIntoChunks } from "../../lib/chunkText";
import formidable from "formidable";

export const config = {
  api: {
    bodyParser: false
  }
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const form = formidable({ maxFileSize: 25 * 1024 * 1024 });

    const { files } = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve({ fields, files });
      });
    });

    const uploaded = files.file?.[0] || files.file;
    if (!uploaded) {
      return res.status(400).json({ error: "No file uploaded." });
    }

    const text = await extractText(
      uploaded.filepath,
      uploaded.mimetype,
      uploaded.originalFilename
    );

    if (!text || !text.trim()) {
      return res.status(400).json({ error: "Could not extract any text from this file." });
    }

    const chunks = splitIntoChunks(text);

    return res.status(200).json({
      fileName: uploaded.originalFilename,
      chunkCount: chunks.length,
      chunks
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || "Failed to process file." });
  }
}
