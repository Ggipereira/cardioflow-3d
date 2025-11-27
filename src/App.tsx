// src/App.tsx
import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import Pipeline from "./pages/Pipeline";
import CTSeries from "./pages/CTSeries";
import Model3D from "./pages/Model3D";
import Printing from "./pages/Printing";
import Documentation from "./pages/Documentation";
import Navbar from "./components/Navbar";

export default function App() {
  const [useSidebarLayout, setUseSidebarLayout] = useState(false);

  useEffect(() => {
    const updateLayout = () => {
      if (typeof window === "undefined") return;
      const { innerWidth, innerHeight } = window;

      const isLandscape = innerWidth > innerHeight;
      const isSmallToMedium = innerWidth < 1024;

      // Sidebar apenas em telemóveis / tablets pequenos em landscape
      setUseSidebarLayout(isLandscape && isSmallToMedium);
    };

    updateLayout();
    window.addEventListener("resize", updateLayout);
    window.addEventListener("orientationchange", updateLayout);

    return () => {
      window.removeEventListener("resize", updateLayout);
      window.removeEventListener("orientationchange", updateLayout);
    };
  }, []);

  return (
    <div className="app-container bg-slate-100 text-slate-900">
      {useSidebarLayout ? (
        // Layout landscape: barra azul como sidebar à esquerda
        <div className="flex min-h-screen">
          <Navbar variant="sidebar" />

          <main className="flex-1 max-w-none px-4 pb-10 pt-4 safe-area-bottom overflow-x-hidden">
            <Routes>
              <Route path="/" element={<Pipeline />} />
              <Route path="/ct-series" element={<CTSeries />} />
              <Route path="/model-3d" element={<Model3D />} />
              <Route path="/printing" element={<Printing />} />
              <Route path="/docs" element={<Documentation />} />
            </Routes>
          </main>
        </div>
      ) : (
        // Layout normal: barra azul no topo
        <>
          <Navbar variant="top" />
          {/* padding-top está tratado via sticky header + safe-area */}
          <main className="max-w-6xl mx-auto px-4 pb-10 pt-2 safe-area-bottom">
            <Routes>
              <Route path="/" element={<Pipeline />} />
              <Route path="/ct-series" element={<CTSeries />} />
              <Route path="/model-3d" element={<Model3D />} />
              <Route path="/printing" element={<Printing />} />
              <Route path="/docs" element={<Documentation />} />
            </Routes>
          </main>
        </>
      )}
    </div>
  );
}
