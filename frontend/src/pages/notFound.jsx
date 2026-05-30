import { useNavigate } from "react-router-dom";
import "./notFound.css";

const NotFound = () => {
  const navigate = useNavigate();
   const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  return (
    <div className="nf-page" >
      <div className="nf-overlay" />

      <div className="nf-content">
        <div className="nf-icon">
          <svg
            width="34"
            height="34"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
            <circle cx="12" cy="12" r="3" />
            <line x1="3" y1="3" x2="21" y2="21" />
          </svg>
        </div>

        <h1>Error 404 Page</h1>

        <p>The page you are looking for cannot be found. <br />
          It might have been removed, renamed, or is temporarily unavailable.
        </p>
      </div>

      <div className="nf-footer">
        <button onClick={handleGoBack}>Go back</button>
      </div>
    </div>
  );
};

export default NotFound;