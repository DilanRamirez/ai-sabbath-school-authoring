import { createRoot } from "react-dom/client";
import { ThemeProvider, CssBaseline } from "@mui/material";
import "./index.css";
import App from "./App.tsx";
import theme from "./theme/theme.ts";
import LoginPage from "./components/auth/login.tsx";

createRoot(document.getElementById("root")!).render(
  (() => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      return <LoginPage />;
    }
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    );
  })()
);
