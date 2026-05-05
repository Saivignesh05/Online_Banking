import './LoadingSpinner.css';

export default function LoadingSpinner({ fullPage = false, size = 40 }) {
  if (fullPage) {
    return (
      <div className="spinner-fullpage">
        <div className="spinner" style={{ width: size, height: size }} />
        <p className="spinner-text">Loading...</p>
      </div>
    );
  }

  return <div className="spinner" style={{ width: size, height: size }} />;
}
