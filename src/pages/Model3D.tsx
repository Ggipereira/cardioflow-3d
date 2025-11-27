import { useEffect, useRef, useState } from "react";
import { useCardioFlow } from "../context/CardioFlowContext";
import ModelViewer from "../components/ModelViewer";
import { TRAINING_MODEL_URL } from "../config";

export default function Model3D() {
  const {
    mode,
    selectedSeries,
    markStepDone,
    showToast,
    modelUrl,
    setModelUrl,
    setPrintModelUrl,
    preferredViewSaved,
    setPreferredViewSaved,
  } = useCardioFlow();

  const [modelSrc, setModelSrc] = useState<string | null>(null);
  const [modelLabel, setModelLabel] = useState<string>(
    "Nenhum modelo carregado"
  );
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const viewerRef = useRef<any>(null);

  const [zoom, setZoom] = useState<number>(1);
  const [viewerKey, setViewerKey] = useState<number>(0);
  const [arSupported, setArSupported] = useState<"unknown" | "yes" | "no">(
    "unknown"
  );
  const [insideView, setInsideView] = useState(false);

  const isTraining = mode === "treino";

  // Deteção simplificada de AR
  useEffect(() => {
    if (typeof window === "undefined") return;
    const ua = window.navigator.userAgent || "";
    const isMobile = /Android|iPhone|iPad|iPod/i.test(ua);
    setArSupported(isMobile ? "yes" : "no");
  }, []);

  // Quando o modo global muda (navbar), limpamos o estado local
  useEffect(() => {
    setModelSrc(null);
    setModelLabel("Nenhum modelo carregado");
    setZoom(1);
    setInsideView(false);
    setViewerKey((k) => k + 1);
  }, [mode]);

  // Se já havia um modelo no contexto, reutilizar ao voltar à página
  useEffect(() => {
    if (modelUrl && !modelSrc) {
      setModelSrc(modelUrl);
      setModelLabel("Modelo previamente carregado");
    }
  }, [modelUrl, modelSrc]);

  const handleLoadExample = () => {
    setModelSrc(TRAINING_MODEL_URL);
    setModelLabel("Modelo de exemplo (coração proxy / treino)");
    setZoom(1);
    setInsideView(false);
    setViewerKey((k) => k + 1);
    setModelUrl(TRAINING_MODEL_URL);
    markStepDone("viewer-3d");
    showToast("Modelo de exemplo carregado no viewer 3D.", "success");
  };

  const handleUploadClick = () => {
    if (isTraining) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setModelSrc(url);
    setModelLabel(`Modelo local: ${file.name}`);
    setZoom(1);
    setInsideView(false);
    setViewerKey((k) => k + 1);
    setModelUrl(url);
    markStepDone("viewer-3d");
    showToast("Modelo 3D carregado do ficheiro.", "success");
  };

  const handleActivateAR = () => {
    if (!modelSrc) {
      showToast("Carrega primeiro um modelo 3D.", "error");
      return;
    }

    const viewer = viewerRef.current as any;
    if (viewer && typeof viewer.activateAR === "function") {
      viewer.activateAR();
      markStepDone("ar");
      showToast("A tentar abrir AR (se o dispositivo suportar).", "info");
    } else {
      showToast("AR não suportada neste navegador / dispositivo.", "error");
    }
  };

  const handleZoomIn = () => {
    setZoom((z) => Math.min(2, z + 0.1));
  };

  const handleZoomOut = () => {
    setZoom((z) => Math.max(0.5, z - 0.1));
  };

  const handleResetView = () => {
    setZoom(1);
    setInsideView(false);
    setViewerKey((k) => k + 1);
  };

  const handleSendToPrinting = () => {
    if (!modelSrc) {
      showToast(
        "Carrega um modelo 3D (exemplo ou real) antes de enviar para impressão.",
        "error"
      );
      return;
    }
    setPrintModelUrl(modelSrc);
    markStepDone("printing");
    showToast(
      "Modelo atual enviado para o passo de Impressão 3D.",
      "success"
    );
  };

  const handleSavePreferredView = () => {
    if (!modelSrc) {
      showToast(
        "Carrega um modelo e posiciona a vista antes de a guardar.",
        "error"
      );
      return;
    }
    setPreferredViewSaved(true);
    showToast(
      "Vista atual marcada como vista preferida para este caso.",
      "success"
    );
  };

  const renderArBadge = () => {
    if (arSupported === "unknown") return null;
    if (arSupported === "yes") {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] bg-emerald-100 text-emerald-700">
          AR potencialmente suportada neste dispositivo
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] bg-slate-200 text-slate-700">
        AR provavelmente não suportada neste dispositivo
      </span>
    );
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header + modo (só leitura) */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-1">Modelo 3D / AR</h1>
          <p className="text-slate-700">
            Modo treino com modelo de exemplo ou modo real com upload do modelo
            cardíaco em 3D. Viewer interativo com zoom, vista interior, AR e
            envio direto para o passo de impressão 3D.
          </p>
          <div className="mt-2">{renderArBadge()}</div>
          {preferredViewSaved && (
            <div className="mt-1 text-xs text-sky-700">
              Vista preferida já marcada para este caso.
            </div>
          )}
        </div>

        <div className="flex flex-col items-end gap-1 text-xs">
          <span className="text-[11px] text-slate-500">Modo atual</span>
          <div
            className={`inline-flex rounded-full px-3 py-1.5 text-[11px] font-medium border ${
              isTraining
                ? "bg-sky-50 text-sky-800 border-sky-200"
                : "bg-emerald-50 text-emerald-800 border-emerald-200"
            }`}
          >
            {isTraining
              ? "Treino · modelo de exemplo"
              : "Real · upload do 3D Slicer"}
          </div>
        </div>
      </div>

      {/* Banner de contexto da série */}
      {selectedSeries && (
        <div className="bg-sky-50 border border-sky-200 rounded-lg p-3 text-sm text-slate-700">
          <div className="font-semibold mb-1">
            Caso atual (série selecionada)
          </div>
          <div>{selectedSeries.description}</div>
          <div className="text-xs text-slate-500">
            Série {selectedSeries.id} · {selectedSeries.bodyPart} ·{" "}
            {selectedSeries.slices} slices · {selectedSeries.studyDate}
          </div>
        </div>
      )}

      {/* Card de carregamento */}
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <h2 className="text-xl font-semibold">Carregar Modelo 3D</h2>

        <div className="flex flex-wrap gap-3">
          <button
            className="px-4 py-2 rounded-md bg-sky-600 text-white font-medium"
            onClick={handleLoadExample}
          >
            {isTraining ? "Modelo de exemplo (treino)" : "Carregar modelo de exemplo"}
          </button>

          <button
            className={`px-4 py-2 rounded-md border font-medium ${
              isTraining
                ? "border-slate-300 text-slate-400 cursor-not-allowed"
                : "border-sky-600 text-sky-700"
            }`}
            onClick={!isTraining ? handleUploadClick : undefined}
            disabled={isTraining}
            title={
              isTraining
                ? "No modo Treino apenas está disponível o modelo de exemplo."
                : "Carrega o modelo cardíaco exportado do 3D Slicer."
            }
          >
            Selecionar ficheiro 3D real
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".glb,.gltf"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        <p className="text-sm text-slate-500">
          Formatos recomendados: <span className="font-semibold">.glb</span> ou{" "}
          <span className="font-semibold">.gltf</span> (exportados do 3D Slicer).
        </p>
        <p className="text-sm text-slate-600">
          Modelo atual: <span className="font-semibold">{modelLabel}</span>
        </p>
      </div>

      {/* Viewer 3D + controlos */}
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">Viewer 3D</h2>
            <p className="text-slate-600 text-sm">
              Rotação, zoom, vista interior, AR e envio do modelo para o passo
              de Impressão 3D.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              className="px-2 py-1 text-sm border rounded-md"
              onClick={handleZoomOut}
              disabled={!modelSrc}
              title="Afasta a câmara (zoom out)."
            >
              Zoom –
            </button>
            <button
              className="px-2 py-1 text-sm border rounded-md"
              onClick={handleResetView}
              disabled={!modelSrc}
              title="Repor posição inicial da vista."
            >
              Reset
            </button>
            <button
              className="px-2 py-1 text-sm border rounded-md"
              onClick={handleZoomIn}
              disabled={!modelSrc}
              title="Aproxima a câmara (zoom in)."
            >
              Zoom +
            </button>
            <button
              className={`px-3 py-1 text-sm rounded-md border ${
                insideView ? "bg-slate-800 text-white" : ""
              }`}
              onClick={() => setInsideView((v) => !v)}
              disabled={!modelSrc}
              title="Coloca a câmara perto do interior do modelo (vista interna experimental)."
            >
              Vista interior
            </button>
            <button
              className="px-3 py-1 text-sm border rounded-md text-slate-700 disabled:opacity-50"
              onClick={handleActivateAR}
              disabled={!modelSrc}
              title="Abre o modo AR (se suportado pelo dispositivo)."
            >
              Ativar AR
            </button>
            <button
              className="px-3 py-1 text-sm rounded-md bg-emerald-600 text-white disabled:opacity-50"
              onClick={handleSendToPrinting}
              disabled={!modelSrc}
              title="Envia este modelo exatamente como está para o passo de Impressão 3D."
            >
              Enviar para Impressão 3D
            </button>
            <button
              className="px-3 py-1 text-sm rounded-md border border-sky-500 text-sky-700 disabled:opacity-50"
              onClick={handleSavePreferredView}
              disabled={!modelSrc || preferredViewSaved}
              title="Marca a vista atual como vista preferida para este caso."
            >
              Guardar vista preferida
            </button>
          </div>
        </div>

        <div className="bg-slate-100 rounded-xl aspect-video flex items-center justify-center overflow-hidden">
          {modelSrc ? (
            <div
              style={{
                width: "100%",
                height: "100%",
                transform: `scale(${zoom})`,
                transformOrigin: "center center",
              }}
            >
              <ModelViewer
                key={viewerKey}
                ref={viewerRef}
                src={modelSrc}
                ar
                ar-modes="webxr scene-viewer quick-look"
                camera-controls
                autoplay
                camera-target="0m 0m 0m"
                camera-orbit={insideView ? "0deg 0deg 0.0001m" : "0deg 75deg auto"}
                field-of-view={insideView ? "120deg" : "45deg"}
                min-camera-orbit="auto auto 0.0001m"
                max-camera-orbit="auto auto auto"
                style={{ width: "100%", height: "100%" }}
              />
            </div>
          ) : (
            <div className="text-center text-slate-500">
              <div className="text-6xl mb-3">🫀</div>
              <p className="text-lg font-medium">
                Ainda não há nenhum modelo carregado.
              </p>
              <p className="text-sm">
                Em <span className="font-semibold">Modo Treino</span>, usa o botão{" "}
                <span className="font-semibold">“Modelo de exemplo (treino)”</span>.
                Em <span className="font-semibold">Modo Real</span>, faz upload
                do modelo cardíaco do doente.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
