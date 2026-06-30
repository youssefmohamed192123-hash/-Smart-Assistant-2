import { useRef, useState } from "react";

const ACCEPTED = ".pdf,.ppt,.pptx,.docx,.txt";

export default function UploadZone({ onFileSelected }) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = (fileList) => {
    if (fileList && fileList.length > 0) {
      onFileSelected(fileList[0]);
    }
  };

  return (
    <div
      className={`upload-zone${dragOver ? " dragover" : ""}`}
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        handleFiles(e.dataTransfer.files);
      }}
    >
      <h3>📎 ارفع ملف الدراسة هنا أو اضغط للاختيار</h3>
      <p>سيقوم المساعد الذكي بتحليل المحتوى وتوليد شرح وترجمة لكل قسم تلقائيًا</p>
      <div className="file-types">
        <span className="file-type-pill">PDF</span>
        <span className="file-type-pill">PPT / PPTX</span>
        <span className="file-type-pill">DOCX</span>
        <span className="file-type-pill">TXT</span>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED}
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}
