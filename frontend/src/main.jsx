import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { AuthProvider } from "./context/authContext.jsx";
import SplashScreen from "./components/SplashScreen.jsx";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./index.css";

const FIRST_LAUNCH_KEY = "mediManage_first_launch_done";

function Root() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const alreadyDone = window.localStorage.getItem(FIRST_LAUNCH_KEY) === "true";
    if (alreadyDone) setShowSplash(false);
  }, []);

  return showSplash ? (
    <SplashScreen
      onFinish={() => {
        window.localStorage.setItem(FIRST_LAUNCH_KEY, "true");
        setShowSplash(false);
      }}
    />
  ) : (
    <App />
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Root />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
