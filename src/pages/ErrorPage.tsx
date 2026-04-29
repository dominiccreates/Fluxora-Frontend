import { useNavigate } from 'react-router-dom';
import './ErrorPage.css';

interface ErrorPageProps {
  onRetry?: () => void;
  errorMessage?: string;
}

const RECOVERY_STEPS = [
  'Check your internet connection and try again.',
  'Refresh the page — the issue may be temporary.',
  'If the problem persists, return to the dashboard.',
];

export default function ErrorPage({ onRetry, errorMessage }: ErrorPageProps) {
  const navigate = useNavigate();

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  const handleBackToDashboard = () => {
    navigate('/app');
  };

  return (
    <main className="error-page-container" role="main">
      <div className="error-content">
        {/* Error icon */}
        <div className="error-icon-wrapper" aria-hidden="true">
          <div className="error-icon">
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M12 8V12M12 16H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {/* Heading */}
        <h1 className="error-heading">Something went wrong</h1>

        {/* Error message */}
        <p className="error-description" role="alert" aria-live="polite">
          {errorMessage ||
            "We couldn't complete your request. Please try one of the steps below."}
        </p>

        {/* Actionable recovery steps */}
        <section
          className="error-recovery"
          aria-label="Recovery steps"
        >
          <h2 className="error-recovery-title">What you can do</h2>
          <ol className="error-recovery-list">
            {RECOVERY_STEPS.map((step, i) => (
              <li key={i} className="error-recovery-item">
                <span className="error-recovery-number" aria-hidden="true">
                  {i + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </section>

        {/* Actions */}
        <div className="error-actions" role="group" aria-label="Error recovery actions">
          <button
            className="btn-retry"
            onClick={handleRetry}
            type="button"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
            </svg>
            Try again
          </button>

          <button
            className="btn-dashboard"
            onClick={handleBackToDashboard}
            type="button"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            Back to dashboard
          </button>
        </div>
      </div>
    </main>
  );
}
