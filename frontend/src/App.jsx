import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import UrlAnalytics from "./pages/UrlAnalytics";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route
        path="/dashboard"
        element={<Dashboard />}
      />

      <Route
        path="/dashboard/url/:shortId"
        element={<UrlAnalytics />}
      />
    </Routes>
  );
}

export default App;