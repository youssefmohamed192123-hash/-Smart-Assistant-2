import { useState, useCallback } from "react";
import UploadZone from "../components/UploadZone";
import LoadingScreen from "../components/LoadingScreen";
import ProgressBar from "../components/ProgressBar";
import SectionCard from "../components/SectionCard";

const STAGE = {
  IDLE: "idle",
  UPLOADING: "uploading",
  GENERATING: "generating",
  DONE: "done"
};

export default function Home() {
  const [stage, setStage] = useState(STAGE.IDLE);
  const [error, setError] = useState(null);
  const [fileName, setFileName] = useState("");
  const [sections, setSections] = useState([]);
  const [chunkProgress, setChunkProgress] = useState({ current: 0, total: 0 });
  const [viewedCount, setViewedCount] = useState(0);
  const viewedIds = useState(() => new Set())[0];

  const reset = () => {
    setStage(STAGE.IDLE);
    setError(null);
    setFileName("");
    setSections([]);
    setChunkProgress({ current: 0, total: 0 });
    setViewedCount(0);
    viewedIds.clear();
  };

  const handleViewed = useCallback(
    (index) => {
      if (!viewedIds.has(index)) {
        viewedIds.add(index);
        setViewedCount(viewedIds.size);
      }
    },
    [viewedIds]
  );

  const handleFile = async (file) => {
    setError(null);
    setSections([]);
    setFileName(file.name);
    setStage(STAGE.UPLOADING);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData
      });
      const uploadData = await uploadRes.json();

      if (!uploadRes.ok) {
        throw new Error(uploadData.error || "فشل تحميل الملف.");
      }

      const { chunks } = uploadData;
      setStage(STAGE.GENERATING);
      setChunkProgress({ current: 0, total: chunks.length });

      const allSections = [];

      for (let i = 0; i < chunks.length; i++) {
        const res = await fetch("/api/process-chunk", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chunkText: chunks[i], chunkIndex: i })
        });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || `فشل تحليل الجزء ${i + 1}.`);
        }

        if (Array.isArray(data.sections)) {
          allSections.push(...data.sections);
          setSections([...allSections]);
        }

        setChunkProgress({ current: i + 1, total: chunks.length });
      }

      setStage(STAGE.DONE);
    } catch (err) {
      console.error(err);
      setError(err.message || "حدث خطأ غير متوقع.");
      setStage(STAGE.IDLE);
    }
  };

  return (
    <div className="wrap" dir="rtl">
      <h1>Smart Study Assistant</h1>
      <div className="sub">مساعدك الذكي لمراجعة أي محاضرة أو كتاب أو ملف دراسي بالعربية والإنجليزية</div>

      {error && <div className="error-box">{error}</div>}

      {stage === STAGE.IDLE && <UploadZone onFileSelected={handleFile} />}

      {stage === STAGE.UPLOADING && (
        <LoadingScreen
          title={`جاري قراءة الملف: ${fileName}`}
          subtitle="يتم استخراج النص وتقسيمه إلى أجزاء..."
        />
      )}

      {(stage === STAGE.GENERATING || stage === STAGE.DONE) && (
        <>
          <button className="reset-btn" onClick={reset}>
            ⟳ رفع ملف جديد
          </button>

          <ProgressBar
            current={stage === STAGE.DONE ? sections.length : viewedCount}
            total={sections.length || 1}
            label={
              stage === STAGE.GENERATING
                ? `جاري التحليل بالذكاء الاصطناعي... (${chunkProgress.current} / ${chunkProgress.total} جزء)`
                : `${viewedCount} / ${sections.length} قسم تمت مراجعته`
            }
          />

          {stage === STAGE.GENERATING && sections.length === 0 && (
            <LoadingScreen
              title="جاري توليد المحتوى التعليمي..."
              subtitle={`معالجة الجزء ${chunkProgress.current} من ${chunkProgress.total}`}
            />
          )}

          {sections.length > 0 && (
            <div className="toc">
              {sections.map((s, i) => (
                <a key={i} href={`#section-${i}`}>
                  {i + 1}. {s.titleAr || s.titleEn || "قسم"}
                </a>
              ))}
            </div>
          )}

          <div id="sections">
            {sections.map((section, i) => (
              <SectionCard
                key={i}
                section={section}
                index={i}
                onViewed={handleViewed}
              />
            ))}
          </div>

          {stage === STAGE.GENERATING && (
            <div className="loading-screen">
              <div className="spinner" />
              <div className="loading-sub">
                جاري تحليل المزيد من المحتوى...
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
