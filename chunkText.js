// lib/chunkText.js
// Splits raw extracted text into manageable chunks for AI processing,
// trying to break on natural section/slide/paragraph boundaries.

function splitIntoChunks(text, maxCharsPerChunk = 6000) {
  const cleaned = text.replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();

  // Prefer splitting on explicit slide/page/chapter markers if present
  const naturalBreaks = cleaned.split(/(?=\n?---\s*Slide\s*---)|(?=\n?Chapter\s+\d+)|(?=\n?Slide\s+\d+)/gi);

  const segments = naturalBreaks.length > 1 ? naturalBreaks : cleaned.split(/\n\n+/);

  const chunks = [];
  let current = "";

  for (const segment of segments) {
    if ((current + segment).length > maxCharsPerChunk && current.length > 0) {
      chunks.push(current.trim());
      current = segment;
    } else {
      current += (current ? "\n\n" : "") + segment;
    }
  }
  if (current.trim()) chunks.push(current.trim());

  return chunks.filter((c) => c.length > 20);
}

module.exports = { splitIntoChunks };
