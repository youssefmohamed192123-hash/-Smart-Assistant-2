// lib/extractText.js
// Extracts raw text from uploaded files of type PDF, DOCX, PPTX, or TXT.

const fs = require("fs");

async function extractFromPdf(buffer) {
  const pdfParse = require("pdf-parse");
  const data = await pdfParse(buffer);
  return data.text;
}

async function extractFromDocx(buffer) {
  const mammoth = require("mammoth");
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

// PPTX is a zip archive containing slideN.xml files with <a:t> text runs.
async function extractFromPptx(buffer) {
  const JSZip = require("jszip");
  const xml2js = require("xml2js");
  const zip = await JSZip.loadAsync(buffer);

  const slideFiles = Object.keys(zip.files)
    .filter((name) => /^ppt\/slides\/slide\d+\.xml$/.test(name))
    .sort((a, b) => {
      const numA = parseInt(a.match(/slide(\d+)\.xml/)[1], 10);
      const numB = parseInt(b.match(/slide(\d+)\.xml/)[1], 10);
      return numA - numB;
    });

  const parser = new xml2js.Parser();
  const slideTexts = [];

  for (const fileName of slideFiles) {
    const xmlContent = await zip.files[fileName].async("string");
    const matches = [...xmlContent.matchAll(/<a:t>([^<]*)<\/a:t>/g)];
    const text = matches.map((m) => m[1]).join(" ");
    slideTexts.push(`--- Slide ---\n${text}`);
  }

  return slideTexts.join("\n\n");
}

function extractFromTxt(buffer) {
  return buffer.toString("utf-8");
}

async function extractText(filePath, mimeType, originalName) {
  const buffer = fs.readFileSync(filePath);
  const lowerName = (originalName || "").toLowerCase();

  if (mimeType === "application/pdf" || lowerName.endsWith(".pdf")) {
    return extractFromPdf(buffer);
  }
  if (
    mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    lowerName.endsWith(".docx")
  ) {
    return extractFromDocx(buffer);
  }
  if (
    mimeType === "application/vnd.openxmlformats-officedocument.presentationml.presentation" ||
    lowerName.endsWith(".pptx") ||
    lowerName.endsWith(".ppt")
  ) {
    return extractFromPptx(buffer);
  }
  if (mimeType === "text/plain" || lowerName.endsWith(".txt")) {
    return extractFromTxt(buffer);
  }

  throw new Error("Unsupported file type. Please upload a PDF, DOCX, PPTX, or TXT file.");
}

module.exports = { extractText };
