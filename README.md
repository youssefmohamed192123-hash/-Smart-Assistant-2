# Smart Study Assistant

A generic, subject-agnostic AI-powered study assistant. Upload any educational
document (PDF, PPT/PPTX, DOCX, or TXT) and the app automatically:

1. Extracts the text.
2. Detects sections / chapters / slides / topics.
3. Uses the OpenAI API to generate, per section:
   - Original content
   - Arabic translation
   - Arabic explanation
   - Key vocabulary
   - Important concepts
   - Short summary
4. Displays everything in the existing dark-themed card UI, with English
   text-to-speech and a live progress bar.

## Project structure

```
pages/
  index.js              Main UI (upload, progress, generated cards)
  _app.js                Global styles loader
  api/
    upload.js            Extracts text from the uploaded file, splits into chunks
    process-chunk.js      Sends a chunk to OpenAI and returns generated sections
components/
  UploadZone.js          Drag-and-drop / click-to-upload zone
  LoadingScreen.js        Spinner + status text
  ProgressBar.js          Sticky progress bar
  SectionCard.js          Renders one generated study section + TTS button
lib/
  extractText.js          PDF / DOCX / PPTX / TXT text extraction
  chunkText.js             Splits large documents into AI-sized chunks
  generateSections.js      OpenAI prompt + call for one chunk
styles/globals.css        Dark theme (carried over from the original design)
```

## Local development

```bash
npm install
cp .env.example .env.local   # add your OPENAI_API_KEY
npm run dev
```

Open http://localhost:3000.

## Deploying to Vercel

1. Push this project to a Git repository (GitHub/GitLab/Bitbucket).
2. Import the repo in Vercel.
3. Add an environment variable: `OPENAI_API_KEY` = your OpenAI key.
4. Deploy. Vercel auto-detects this as a Next.js project.

`vercel.json` extends the serverless function timeout for the
`process-chunk` API route since OpenAI generation can take longer than the
default limit on larger chunks.

## Notes

- The app processes a document chunk by chunk, calling `/api/process-chunk`
  once per chunk, and updates the progress bar / cards as each chunk
  completes — this avoids serverless timeouts on large files and gives the
  user real-time feedback.
- Text-to-speech uses the browser's built-in `speechSynthesis` API (English),
  applied to whatever content the AI generates — no hardcoded content remains
  anywhere in the project.
- Works with any subject: lectures, book chapters, training material, course
  notes, etc. — there is no Assembly Language or other subject-specific data
  left in the codebase.
