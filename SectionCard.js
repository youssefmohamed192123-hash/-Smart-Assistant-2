function speak(text) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = 0.95;
  window.speechSynthesis.speak(utterance);
}

export default function SectionCard({ section, index, onViewed }) {
  const {
    titleEn,
    titleAr,
    originalContent,
    arabicTranslation,
    arabicExplanation,
    vocabulary = [],
    concepts = [],
    summary
  } = section;

  return (
    <div
      className="slide"
      id={`section-${index}`}
      onClick={() => onViewed && onViewed(index)}
    >
      <div className="slide-head">
        <span className="slide-num">{index + 1}</span>
        <span className="slide-title-ar">{titleAr}</span>
      </div>
      {titleEn && <div className="slide-title-en">{titleEn}</div>}

      {originalContent && (
        <div className="block">
          <div className="block-label">النص الأصلي (English)</div>
          <div className="en-text">{originalContent}</div>
          <button className="speak-en-btn" onClick={() => speak(originalContent)}>
            🔊 استمع بالإنجليزية
          </button>
        </div>
      )}

      {arabicTranslation && (
        <div className="block">
          <div className="block-label">الترجمة العربية</div>
          <div className="ar-text">{arabicTranslation}</div>
        </div>
      )}

      {arabicExplanation && (
        <div className="block">
          <div className="block-label">الشرح بالعربية</div>
          <div className="ar-text">{arabicExplanation}</div>
        </div>
      )}

      {concepts.length > 0 && (
        <div className="block">
          <div className="block-label">المفاهيم المهمة</div>
          <div className="concept-list">
            <ul style={{ margin: 0, paddingInlineStart: "20px" }}>
              {concepts.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {vocabulary.length > 0 && (
        <div className="block">
          <div className="block-label">المفردات الأساسية</div>
          <div className="vocab-grid">
            {vocabulary.map((v, i) => (
              <div className="vocab-card" key={i}>
                <div className="vocab-en">
                  {v.en}
                  <button onClick={() => speak(v.en)}>🔊</button>
                </div>
                {v.pronunciation && <div className="vocab-pron">{v.pronunciation}</div>}
                <div className="vocab-ar">{v.ar}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {summary && <div className="summary-box">📌 {summary}</div>}
    </div>
  );
}
