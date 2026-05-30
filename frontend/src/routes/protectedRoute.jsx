import { useContext, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/authContext";
import "./protectedRoute.css";

const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useContext(AuthContext);

  // 👇 new state that limits loader duration
  const [showLoader, setShowLoader] = useState(true);

  // ⏱️ force loader to stop after 1.5s MAX
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoader(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (loading && showLoader) {
    return (
      <div className="app-loader">
        <div className="loader-center">
          <div className="loader-spinner"></div>
          <p className="loader-text">Chargement...</p>
        </div>
      </div>
    );
  }


  return children;
};

export default ProtectedRoute;