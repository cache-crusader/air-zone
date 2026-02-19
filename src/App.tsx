import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import ZonesPage from "./pages/ZonesPage";
import ZoneDetailPage from "./pages/ZoneDetailPage";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect bare root to /zones */}
        <Route path="/" element={<Navigate to="/zones" replace />} />

        {/* Zones list */}
        <Route path="/zones" element={<ZonesPage />} />

        {/* Zone detail */}
        <Route path="/zones/:id" element={<ZoneDetailPage />} />

        {/* Catch-all: back to zones */}
        <Route path="*" element={<Navigate to="/zones" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
