export default function LoadingScreen({ title, subtitle }) {
  return (
    <div className="loading-screen">
      <div className="spinner" />
      <div className="loading-title">{title}</div>
      <div className="loading-sub">{subtitle}</div>
    </div>
  );
}
