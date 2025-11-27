import React, {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

export type Mode = "treino" | "real";

export type PipelineStepId =
  | "ct-import"
  | "ct-series"
  | "slicer-segmentation"
  | "export-3d"
  | "viewer-3d"
  | "ar"
  | "printing";

export type SeriesInfo = {
  id: string;
  description: string;
  bodyPart: string;
  slices: number;
  studyDate: string;
  protocolType?: string;
  isGated?: boolean;
  isPreferred?: boolean;
};

type PipelineState = Record<PipelineStepId, boolean>;

type ToastVariant = "success" | "error" | "info";

type Toast = {
  id: number;
  message: string;
  variant: ToastVariant;
};

type CardioFlowContextValue = {
  mode: Mode;
  setMode: (mode: Mode) => void;

  pipelineSteps: PipelineState;
  markStepDone: (id: PipelineStepId) => void;
  resetPipeline: () => void;

  selectedSeries: SeriesInfo | null;
  setSelectedSeries: (series: SeriesInfo | null) => void;

  // Modelo 3D global
  modelUrl: string | null;
  setModelUrl: (url: string | null) => void;
  printModelUrl: string | null;
  setPrintModelUrl: (url: string | null) => void;

  // Notas clínicas
  surgeonNotes: string;
  setSurgeonNotes: (text: string) => void;
  riskNotes: string;
  setRiskNotes: (text: string) => void;

  // Vista preferida (modelo 3D)
  preferredViewSaved: boolean;
  setPreferredViewSaved: (value: boolean) => void;

  // Toasts
  showToast: (message: string, variant?: ToastVariant) => void;
  toasts: Toast[];
  dismissToast: (id: number) => void;
};

const CardioFlowContext = createContext<CardioFlowContextValue | undefined>(
  undefined
);

const defaultPipeline: PipelineState = {
  "ct-import": false,
  "ct-series": false,
  "slicer-segmentation": false,
  "export-3d": false,
  "viewer-3d": false,
  ar: false,
  printing: false,
};

type ProviderProps = {
  children: ReactNode;
};

export function CardioFlowProvider({ children }: ProviderProps) {
  // Modo global
  const [mode, setModeState] = useState<Mode>(() => {
    if (typeof window === "undefined") return "treino";
    const stored = window.localStorage.getItem("trainingMode");
    if (stored === "false") return "real";
    return "treino";
  });

  const setMode = (newMode: Mode) => {
    setModeState(newMode);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(
        "trainingMode",
        newMode === "treino" ? "true" : "false"
      );
    }
  };

  // Pipeline
  const [pipelineSteps, setPipelineSteps] =
    useState<PipelineState>(defaultPipeline);

  const markStepDone = (id: PipelineStepId) => {
    setPipelineSteps((prev) => ({
      ...prev,
      [id]: true,
    }));
  };

  // Série selecionada
  const [selectedSeries, setSelectedSeries] = useState<SeriesInfo | null>(null);

  // Modelos 3D
  const [modelUrl, setModelUrl] = useState<string | null>(null);
  const [printModelUrl, setPrintModelUrl] = useState<string | null>(null);

  // Notas clínicas
  const [surgeonNotes, setSurgeonNotes] = useState<string>("");
  const [riskNotes, setRiskNotes] = useState<string>("");

  // Vista preferida
  const [preferredViewSaved, setPreferredViewSaved] =
    useState<boolean>(false);

  // Reset global do caso
  const resetPipeline = () => {
    setPipelineSteps(defaultPipeline);
    setSelectedSeries(null);
    setModelUrl(null);
    setPrintModelUrl(null);
    setSurgeonNotes("");
    setRiskNotes("");
    setPreferredViewSaved(false);
  };

  // Toasts
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, variant: ToastVariant = "info") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, variant }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const dismissToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const value: CardioFlowContextValue = {
    mode,
    setMode,
    pipelineSteps,
    markStepDone,
    resetPipeline,
    selectedSeries,
    setSelectedSeries,
    modelUrl,
    setModelUrl,
    printModelUrl,
    setPrintModelUrl,
    surgeonNotes,
    setSurgeonNotes,
    riskNotes,
    setRiskNotes,
    preferredViewSaved,
    setPreferredViewSaved,
    showToast,
    toasts,
    dismissToast,
  };

  return (
    <CardioFlowContext.Provider value={value}>
      {children}
      {/* Toasts */}
      <div className="fixed bottom-4 right-4 space-y-2 z-50">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`px-4 py-2 rounded-md shadow text-sm text-white cursor-pointer ${
              toast.variant === "success"
                ? "bg-emerald-600"
                : toast.variant === "error"
                ? "bg-red-600"
                : "bg-slate-800"
            }`}
            onClick={() => dismissToast(toast.id)}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </CardioFlowContext.Provider>
  );
}

export function useCardioFlow() {
  const ctx = useContext(CardioFlowContext);
  if (!ctx) {
    throw new Error("useCardioFlow must be used within CardioFlowProvider");
  }
  return ctx;
}
