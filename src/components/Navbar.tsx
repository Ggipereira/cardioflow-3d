// src/components/Navbar.tsx
import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { useCardioFlow } from "../context/CardioFlowContext";
import type { PipelineStepId } from "../context/CardioFlowContext";

type NavbarVariant = "top" | "sidebar";

type NavbarProps = {
  variant?: NavbarVariant;
};

const PIPELINE_STEP_IDS: PipelineStepId[] = [
  "ct-import",
  "ct-series",
  "slicer-segmentation",
  "export-3d",
  "viewer-3d",
  "ar",
  "printing",
];

const NAV_ITEMS = [
  { to: "/", label: "Pipeline" },
  { to: "/ct-series", label: "TAC → Séries" },
  { to: "/model-3d", label: "Modelo 3D / AR" },
  { to: "/printing", label: "Impressão 3D" },
  { to: "/docs", label: "Documentação" },
];

export default function Navbar({ variant = "top" }: NavbarProps) {
  const { mode, setMode, pipelineSteps } = useCardioFlow();

  const doneCount = PIPELINE_STEP_IDS.filter((id) => pipelineSteps[id]).length;
  const total = PIPELINE_STEP_IDS.length;
  const percent = Math.round((doneCount / total) * 100);
  const isTraining = mode === "treino";

  const [panelScale, setPanelScale] = useState(1);

  const handleResizeStart = (event: React.PointerEvent<HTMLDivElement>) => {
    event.preventDefault();

    const startX = event.clientX;
    const startY = event.clientY;
    const startScale = panelScale;

    const handleMove = (e: PointerEvent) => {
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      const delta = (dx + dy) / 400;
      const next = Math.max(0.85, Math.min(1.2, startScale + delta));
      setPanelScale(next);
    };

    const handleUp = () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    };

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
  };

  // === VARIANTE SIDEBAR (LANDSCAPE MOBILE) ===
  if (variant === "sidebar") {
    return (
      <aside className="safe-area-top safe-area-bottom bg-slate-950/95 text-slate-100 border-r border-slate-800 flex-shrink-0">
        <div
          className="relative h-full w-[260px] max-w-[40vw] flex flex-col gap-6 px-4 py-4 origin-left transition-transform"
          style={{ transform: `scale(${panelScale})` }}
        >
          {/* Logo + nome */}
          <div className="flex items-center gap-3">
            <img
              src="/logo-cf.svg"
              alt="CardioFlow 3D"
              className="h-9 w-9 shrink-0"
            />
            <div className="leading-tight">
              <div className="text-[12px] font-semibold tracking-[0.18em] text-slate-200 uppercase">
                CardioFlow 3D
              </div>
              <div className="text-[11px] text-slate-400">
                TAC → Modelo 3D → AR → Impressão
              </div>
            </div>
          </div>

          {/* Navegação vertical */}
          <nav className="flex flex-col gap-1 text-sm bg-slate-900/60 rounded-2xl px-3 py-3">
            {NAV_ITEMS.map((item) => (
              <SidebarNavItem key={item.to} to={item.to} label={item.label} />
            ))}
          </nav>

          {/* Modo + progresso */}
          <div className="mt-auto space-y-4 text-[11px]">
            <div className="flex flex-col gap-2">
              <span className="text-slate-400">Modo</span>
              <div className="inline-flex rounded-full bg-slate-900/70 p-1">
                <button
                  className={`px-3 py-1.5 rounded-full transition-colors ${
                    isTraining
                      ? "bg-sky-500 text-white shadow-sm"
                      : "text-slate-300 hover:text-white"
                  }`}
                  onClick={() => setMode("treino")}
                >
                  Treino
                </button>
                <button
                  className={`px-3 py-1.5 rounded-full transition-colors ${
                    !isTraining
                      ? "bg-sky-500 text-white shadow-sm"
                      : "text-slate-300 hover:text-white"
                  }`}
                  onClick={() => setMode("real")}
                >
                  Real
                </button>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                <span>Pipeline</span>
                <span>
                  {doneCount}/{total} ({percent}%)
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-400 transition-all"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Handle para redimensionar */}
          <div
            className="absolute bottom-2 right-2 h-4 w-4 rounded-full border border-slate-600/70 bg-slate-900/80 cursor-se-resize"
            onPointerDown={handleResizeStart}
          />
        </div>
      </aside>
    );
  }

  // === VARIANTE TOP (NORMAL) ===
  return (
    <header className="sticky top-0 z-40 bg-gradient-to-b from-slate-950/90 via-slate-950/70 to-transparent backdrop-blur safe-area-top">
      <div className="max-w-6xl mx-auto px-4 pt-2 pb-0">
        <div
          className="relative bg-slate-950/95 border border-slate-800 rounded-3xl shadow-[0_20px_50px_rgba(15,23,42,0.7)] px-4 py-3 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between origin-top transition-transform"
          style={{ transform: `scale(${panelScale})` }}
        >
          {/* Logo + nome */}
          <div className="flex items-center gap-3">
            <img
              src="/logo-cf.svg"
              alt="CardioFlow 3D"
              className="h-10 w-10 shrink-0"
            />
            <div className="leading-tight">
              <div className="text-[13px] font-semibold tracking-[0.18em] text-slate-300 uppercase">
                CardioFlow 3D
              </div>
              <div className="text-[11px] text-slate-400">
                TAC → Modelo 3D → AR → Impressão
              </div>
            </div>
          </div>

          {/* Navegação desktop */}
          <nav className="hidden md:flex items-center gap-2 text-sm bg-slate-900/60 rounded-full px-3 py-1.5">
            {NAV_ITEMS.map((item) => (
              <NavItem key={item.to} to={item.to} label={item.label} />
            ))}
          </nav>

          {/* Modo + progresso */}
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-2 text-[11px]">
              <span className="text-slate-400">Modo</span>
              <div className="flex rounded-full bg-slate-900/70 p-1">
                <button
                  className={`px-3 py-1.5 rounded-full transition-colors ${
                    isTraining
                      ? "bg-sky-500 text-white shadow-sm"
                      : "text-slate-300 hover:text-white"
                  }`}
                  onClick={() => setMode("treino")}
                >
                  Treino
                </button>
                <button
                  className={`px-3 py-1.5 rounded-full transition-colors ${
                    !isTraining
                      ? "bg-sky-500 text-white shadow-sm"
                      : "text-slate-300 hover:text-white"
                  }`}
                  onClick={() => setMode("real")}
                >
                  Real
                </button>
              </div>
            </div>

            <div className="hidden sm:block w-44">
              <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                <span>Pipeline</span>
                <span>
                  {doneCount}/{total} ({percent}%)
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-400 transition-all"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Handle para redimensionar */}
          <div
            className="absolute bottom-2 right-3 h-4 w-4 rounded-full border border-slate-600/70 bg-slate-900/80 cursor-se-resize"
            onPointerDown={handleResizeStart}
          />
        </div>

        {/* Navegação mobile por baixo */}
        <nav className="md:hidden mt-3">
          <div className="flex overflow-x-auto gap-2 bg-slate-950/95 rounded-2xl px-3 py-2 border border-slate-800">
            {NAV_ITEMS.map((item) => (
              <NavItemMobile
                key={item.to}
                to={item.to}
                label={item.label === "Documentação" ? "Docs" : item.label}
              />
            ))}
          </div>
        </nav>
      </div>
    </header>
  );
}

type NavItemProps = { to: string; label: string };

function NavItem({ to, label }: NavItemProps) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          "px-3 py-1.5 rounded-full transition-colors",
          "flex items-center justify-center",
          isActive
            ? "bg-slate-100 text-slate-900 shadow-sm"
            : "text-slate-200 hover:text-white hover:bg-slate-800/70",
        ].join(" ")
      }
    >
      {label}
    </NavLink>
  );
}

function NavItemMobile({ to, label }: NavItemProps) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          "px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-colors",
          isActive
            ? "bg-slate-100 text-slate-900 shadow-sm"
            : "text-slate-200 hover:text-white hover:bg-slate-800/80",
        ].join(" ")
      }
    >
      {label}
    </NavLink>
  );
}

function SidebarNavItem({ to, label }: NavItemProps) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          "px-3 py-1.5 rounded-full text-xs text-left transition-colors",
          isActive
            ? "bg-slate-100 text-slate-900 shadow-sm"
            : "text-slate-200 hover:text-white hover:bg-slate-800/80",
        ].join(" ")
      }
    >
      {label}
    </NavLink>
  );
}
