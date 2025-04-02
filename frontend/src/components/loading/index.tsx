import "./Loading.css";

export default function Loading() {
  return (
    <div className="loading-overlay">
      <div data-testid="loading-spinner" className="loading-spinner"></div>
      <p>Loading...</p>
    </div>
  );
}
