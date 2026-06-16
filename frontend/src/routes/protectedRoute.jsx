import { useContext, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/authContext";
import "./protectedRoute.css";

const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useContext(AuthContext);
  const [showLoader, setShowLoader] = useState(true);

  // force loader to stop after 1.5s MAX
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoader(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (!loading && !user) {
    return <Navigate to="/login" />;
  }

  if (role && user?.role !== role) {
    return <Navigate to="/login" />;
  }

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
