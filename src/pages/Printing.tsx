import { useEffect, useMemo, useRef, useState } from "react";
import { useCardioFlow } from "../context/CardioFlowContext";
import ModelViewer from "../components/ModelViewer";
import { TRAINING_MODEL_URL } from "../config";

type PrintSettings = {
  material: "PLA" | "PETG" | "ABS";
  layerHeight: number; // mm
  infill: number; // %
  wallThickness: number; // mm
  printSpeed: number; // mm/s
  scale: number; // 1 = 100 %
};

export default function Printing() {
  const {
    mode,
    selectedSeries,
    markStepDone,
    showToast,
    printModelUrl,
    setPrintModelUrl,
    surgeonNotes,
    setSurgeonNotes,
    riskNotes,
    setRiskNotes,
  } = useCardioFlow();

  const isTraining = mode === "treino";

  const [rawModelUrl, setRawModelUrl] = useState<string | null>(null);
  const [processedModelUrl, setProcessedModelUrl] = useState<string | null>(
    null
  );
  const [modelLabel, setModelLabel] = useState<string>(
    "Nenhum modelo carregado"
  );
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // “Filtros” de pós-processamento (simulados)
  const [smooth, setSmooth] = useState(true);
  const [hollow, setHollow] = useState(false);
  const [fillHoles, setFillHoles] = useState(true);
  const [addBase, setAddBase] = useState(true);

  // Configurações de impressão
  const [settings, setSettings] = useState<PrintSettings>({
    material: "PLA",
    layerHeight: 0.2,
    infill: 20,
    wallThickness: 1.6,
    printSpeed: 60,
    scale: 1,
  });

  // Se o modo global mudar, limpar estado local de impressão
  useEffect(() => {
    setRawModelUrl(null);
    setProcessedModelUrl(null);
    setUploadedFile(null);
    setModelLabel("Nenhum modelo carregado");
    if (mode === "treino") {
      setPrintModelUrl(null);
    }
  }, [mode, setPrintModelUrl]);

  // Se já vier um modelo do Model3D, usar automaticamente
  useEffect(() => {
    if (!rawModelUrl && printModelUrl) {
      setRawModelUrl(printModelUrl);
      setProcessedModelUrl(null);
      setModelLabel("Modelo vindo do passo Modelo 3D / AR");
    }
  }, [printModelUrl, rawModelUrl]);

  // Treino → modelo de exemplo
  const handleLoadTrainingExample = () => {
    setRawModelUrl(TRAINING_MODEL_URL);
    setProcessedModelUrl(TRAINING_MODEL_URL);
    setUploadedFile(null);
    setModelLabel("Modelo de exemplo (proxy de coração) do Slicer");
    setPrintModelUrl(TRAINING_MODEL_URL);
    showToast("Modelo de exemplo carregado para treino de impressão 3D.", "info");
  };

  // Real → upload do 3D Slicer
  const handleUploadClick = () => {
    if (isTraining) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadedFile(file);

    const url = URL.createObjectURL(file);
    setRawModelUrl(url);
    setProcessedModelUrl(null);
    setPrintModelUrl(url);
    setModelLabel(`Modelo do Slicer: ${file.name}`);
    showToast("Modelo exportado do 3D Slicer carregado.", "success");
  };

  // Aplicar filtros (simulado)
  const handleApplyFilters = () => {
    if (!rawModelUrl && !isTraining) {
      showToast("Carrega primeiro o modelo exportado do 3D Slicer.", "error");
      return;
    }

    if (isTraining && !rawModelUrl) {
      handleLoadTrainingExample();
      return;
    }

    setProcessedModelUrl(rawModelUrl || TRAINING_MODEL_URL);
    markStepDone("printing");
    showToast(
      "Filtros aplicados (demo) e modelo marcado como pronto para impressão.",
      "success"
    );
  };

  // Presets de impressão
  const applyPreset = (preset: "consulta" | "planeamento" | "prototipo") => {
    if (preset === "consulta") {
      setSettings({
        material: "PLA",
        layerHeight: 0.2,
        infill: 15,
        wallThickness: 1.6,
        printSpeed: 60,
        scale: 0.8,
      });
      showToast(
        "Preset aplicado: Modelo para discussão em consulta.",
        "info"
      );
    } else if (preset === "planeamento") {
      setSettings({
        material: "PLA",
        layerHeight: 0.15,
        infill: 22,
        wallThickness: 1.6,
        printSpeed: 50,
        scale: 1,
      });
      showToast(
        "Preset aplicado: Planeamento cirúrgico detalhado.",
        "info"
      );
    } else {
      // prototipagem rápida
      setSettings({
        material: "PLA",
        layerHeight: 0.25,
        infill: 10,
        wallThickness: 1.2,
        printSpeed: 80,
        scale: 0.7,
      });
      showToast("Preset aplicado: Prototipagem rápida.", "info");
    }
  };

  // Estimativas
  const estimates = useMemo(() => {
    if (!rawModelUrl && !processedModelUrl) {
      return {
        volumeCm3: 0,
        massGrams: 0,
        timeHours: 0,
        costEur: 0,
      };
    }

    let baseVolume = 120;
    baseVolume *= Math.pow(settings.scale, 3);

    const infillFactor = settings.infill / 100;
    const wallFactor = 0.4 + (settings.wallThickness / 4) * 0.6;
    const effectiveVolume =
      baseVolume * (0.3 * infillFactor + 0.7 * wallFactor);

    const density =
      settings.material === "PLA"
        ? 1.24
        : settings.material === "PETG"
        ? 1.27
        : 1.04;

    const massGrams = effectiveVolume * density;

    const complexityFactor = 1.8;
    const baseTimeHours =
      (effectiveVolume * complexityFactor) /
      (settings.printSpeed * (0.3 / settings.layerHeight));

    const timeHours = Math.max(0.5, baseTimeHours);
    const costEur = (massGrams / 1000) * 25;

    return {
      volumeCm3: effectiveVolume,
      massGrams,
      timeHours,
      costEur,
    };
  }, [settings, rawModelUrl, processedModelUrl]);

  const handleChangeSetting = <K extends keyof PrintSettings>(
    key: K,
    value: PrintSettings[K]
  ) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleExport = () => {
    const urlToDownload = processedModelUrl || rawModelUrl || TRAINING_MODEL_URL;
    if (!urlToDownload) {
      showToast("Ainda não há nenhum modelo pronto para exportar.", "error");
      return;
    }

    const a = document.createElement("a");
    a.href = urlToDownload;
    a.download = uploadedFile
      ? uploadedFile.name.replace(
          /\.(stl|obj|glb|gltf)$/i,
          "_print_ready.glb"
        )
      : "heart_print_ready.glb";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    markStepDone("printing");
    showToast("Download do modelo pronto para impressão iniciado.", "success");
  };

  const activeModelUrl = processedModelUrl || rawModelUrl;
  const isViewable =
    !uploadedFile || /\.(glb|gltf)$/i.test(uploadedFile.name);

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header + modo (só leitura) */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-1">Impressão 3D</h1>
          <p className="text-slate-700">
            Preparação do modelo cardíaco para impressão 3D: pós-processamento,
            definição de parâmetros e geração do ficheiro final pronto a
            imprimir.
          </p>
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
              : "Real · modelo do 3D Slicer"}
          </div>
        </div>
      </div>

      {/* Banner série */}
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

      {/* Upload / modelo de entrada */}
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <h2 className="text-xl font-semibold mb-2">Modelo de entrada</h2>

        {isTraining ? (
          <>
            <p className="text-sm text-slate-700">
              <span className="font-semibold">Modo Treino:</span> usa um
              modelo de exemplo para demonstrar o workflow de impressão 3D sem
              dados reais do doente.
            </p>
            <button
              className="px-4 py-2 rounded-md bg-sky-600 text-white font-medium"
              onClick={handleLoadTrainingExample}
            >
              Carregar modelo de exemplo (proxy coração)
            </button>
          </>
        ) : (
          <>
            <p className="text-sm text-slate-700">
              <span className="font-semibold">Modo Real:</span> importa o
              ficheiro exportado do 3D Slicer (.stl, .obj, .glb / .gltf) já com
              o coração segmentado.
            </p>
            <button
              className="px-4 py-2 rounded-md border border-sky-600 text-sky-700 font-medium"
              onClick={handleUploadClick}
              title="Carrega o modelo já segmentado exportado do 3D Slicer."
            >
              Selecionar ficheiro do 3D Slicer
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".stl,.obj,.glb,.gltf"
              className="hidden"
              onChange={handleFileChange}
            />
          </>
        )}

        <p className="text-sm text-slate-600">
          Modelo atual: <span className="font-semibold">{modelLabel}</span>
        </p>
        {printModelUrl && !uploadedFile && (
          <p className="text-xs text-emerald-700">
            Modelo recebido diretamente do passo{" "}
            <span className="font-semibold">Modelo 3D / AR</span>.
          </p>
        )}
      </div>

      {/* Filtros + configs + presets */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Filtros */}
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <h2 className="text-xl font-semibold mb-2">Pós-processamento</h2>
          <p className="text-sm text-slate-600">
            Operações aplicadas ao modelo 3D antes de gerar o ficheiro final
            para impressão. Nesta demo são simulações, mas representam passos
            típicos de smoothing e preparação.
          </p>

          <div className="space-y-2 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={smooth}
                onChange={(e) => setSmooth(e.target.checked)}
              />
              <span title="Reduz irregularidades da superfície para um acabamento mais suave.">
                Suavizar superfície (smoothing)
              </span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={hollow}
                onChange={(e) => setHollow(e.target.checked)}
              />
              <span title="Remove material do interior, mantendo a geometria externa.">
                Tornar oco (redução de material)
              </span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={fillHoles}
                onChange={(e) => setFillHoles(e.target.checked)}
              />
              <span title="Corrige buracos e falhas da malha que impediriam a impressão.">
                Fechar buracos / corrigir malhas
              </span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={addBase}
                onChange={(e) => setAddBase(e.target.checked)}
              />
              <span title="Adiciona uma base para estabilizar o modelo na mesa de impressão.">
                Adicionar base de suporte/stand
              </span>
            </label>
          </div>

          <button
            className="mt-4 px-4 py-2 rounded-md bg-sky-600 text-white font-medium"
            onClick={handleApplyFilters}
          >
            Aplicar filtros e gerar modelo para impressão
          </button>

          <p className="text-xs text-slate-500 mt-2">
            Nota: Nesta versão os filtros são apenas simulados (pipeline
            lógica). A implementação real utilizaria algoritmos de
            processamento de malha (p.ex. em Python, C++ ou WebAssembly).
          </p>
        </div>

        {/* Configurações + presets + estimativas */}
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <h2 className="text-xl font-semibold mb-2">
            Configuração de impressão
          </h2>

          {/* Presets */}
          <div className="flex flex-wrap gap-2 text-xs mb-2">
            <span className="text-slate-500 mt-1">Presets rápidos:</span>
            <button
              className="px-3 py-1 rounded-full border border-sky-500 text-sky-700"
              onClick={() => applyPreset("consulta")}
            >
              Consulta (modelo de explicação)
            </button>
            <button
              className="px-3 py-1 rounded-full border border-emerald-500 text-emerald-700"
              onClick={() => applyPreset("planeamento")}
            >
              Planeamento cirúrgico
            </button>
            <button
              className="px-3 py-1 rounded-full border border-amber-500 text-amber-700"
              onClick={() => applyPreset("prototipo")}
            >
              Prototipagem rápida
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <label className="block mb-1 font-medium">Material</label>
              <select
                className="w-full border rounded-md px-2 py-1"
                value={settings.material}
                onChange={(e) =>
                  handleChangeSetting(
                    "material",
                    e.target.value as PrintSettings["material"]
                  )
                }
              >
                <option value="PLA">PLA</option>
                <option value="PETG">PETG</option>
                <option value="ABS">ABS</option>
              </select>
            </div>

            <div>
              <label className="block mb-1 font-medium">
                Layer height (mm)
              </label>
              <select
                className="w-full border rounded-md px-2 py-1"
                value={settings.layerHeight}
                onChange={(e) =>
                  handleChangeSetting(
                    "layerHeight",
                    parseFloat(e.target.value)
                  )
                }
              >
                <option value={0.1}>0.10</option>
                <option value={0.15}>0.15</option>
                <option value={0.2}>0.20</option>
                <option value={0.25}>0.25</option>
              </select>
            </div>

            <div>
              <label className="block mb-1 font-medium">Infill (%)</label>
              <input
                type="number"
                min={0}
                max={100}
                className="w-full border rounded-md px-2 py-1"
                value={settings.infill}
                onChange={(e) =>
                  handleChangeSetting(
                    "infill",
                    Math.min(100, Math.max(0, Number(e.target.value)))
                  )
                }
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">Parede (mm)</label>
              <select
                className="w-full border rounded-md px-2 py-1"
                value={settings.wallThickness}
                onChange={(e) =>
                  handleChangeSetting(
                    "wallThickness",
                    parseFloat(e.target.value)
                  )
                }
              >
                <option value={1.2}>1.2</option>
                <option value={1.6}>1.6</option>
                <option value={2.0}>2.0</option>
              </select>
            </div>

            <div>
              <label className="block mb-1 font-medium">
                Velocidade (mm/s)
              </label>
              <select
                className="w-full border rounded-md px-2 py-1"
                value={settings.printSpeed}
                onChange={(e) =>
                  handleChangeSetting(
                    "printSpeed",
                    parseFloat(e.target.value)
                  )
                }
              >
                <option value={40}>40</option>
                <option value={60}>60</option>
                <option value={80}>80</option>
              </select>
            </div>

            <div>
              <label className="block mb-1 font-medium">Escala (%)</label>
              <input
                type="number"
                min={50}
                max={150}
                className="w-full border rounded-md px-2 py-1"
                value={Math.round(settings.scale * 100)}
                onChange={(e) =>
                  handleChangeSetting(
                    "scale",
                    Math.min(1.5, Math.max(0.5, Number(e.target.value) / 100))
                  )
                }
              />
            </div>
          </div>

          {/* Estimativas */}
          <div className="grid grid-cols-2 gap-4 text-sm mt-4">
            <div className="bg-slate-50 rounded-lg p-3">
              <div className="text-xs text-slate-500 mb-1">
                Tempo estimado de impressão
              </div>
              <div className="text-lg font-semibold">
                {estimates.timeHours > 0
                  ? `${estimates.timeHours.toFixed(1)} h`
                  : "--"}
              </div>
            </div>

            <div className="bg-slate-50 rounded-lg p-3">
              <div className="text-xs text-slate-500 mb-1">
                Consumo estimado de filamento
              </div>
              <div className="text-lg font-semibold">
                {estimates.massGrams > 0
                  ? `${estimates.massGrams.toFixed(0)} g`
                  : "--"}
              </div>
            </div>

            <div className="bg-slate-50 rounded-lg p-3">
              <div className="text-xs text-slate-500 mb-1">
                Volume aproximado
              </div>
              <div className="text-lg font-semibold">
                {estimates.volumeCm3 > 0
                  ? `${estimates.volumeCm3.toFixed(0)} cm³`
                  : "--"}
              </div>
            </div>

            <div className="bg-slate-50 rounded-lg p-3">
              <div className="text-xs text-slate-500 mb-1">Custo estimado</div>
              <div className="text-lg font-semibold">
                {estimates.costEur > 0
                  ? `${estimates.costEur.toFixed(2)} €`
                  : "--"}
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-500 mt-2">
            Estas estimativas são aproximadas e servem apenas como referência
            para o planeamento. A implementação real deveria integrar-se com o
            slicer ou com o perfil concreto da impressora.
          </p>
        </div>
      </div>

      {/* Notas clínicas */}
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-3">
        <h2 className="text-xl font-semibold">Notas clínicas</h2>
        <p className="text-sm text-slate-600">
          Registo rápido da perspetiva da equipa cirúrgica sobre este modelo:
          notas gerais e riscos/pontos a ter em atenção na cirurgia.
        </p>

        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div className="flex flex-col gap-1">
            <label className="font-medium text-slate-700">
              Notas do cirurgião / equipa
            </label>
            <textarea
              className="border rounded-md px-2 py-1 min-h-[80px] text-sm"
              placeholder="Ex.: modelo usado para planear correção de aneurisma da aorta ascendente; atenção à relação com tronco da coronária esquerda..."
              value={surgeonNotes}
              onChange={(e) => setSurgeonNotes(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-medium text-slate-700">
              Riscos / pontos de atenção
            </label>
            <textarea
              className="border rounded-md px-2 py-1 min-h-[80px] text-sm"
              placeholder="Ex.: proximidade do aneurisma ao anel valvular; risco de obstrução coronária; necessidade de avaliar tamanho do enxerto..."
              value={riskNotes}
              onChange={(e) => setRiskNotes(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Viewer + export */}
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">Pré-visualização final</h2>
            <p className="text-sm text-slate-600">
              Visualização do modelo tal como será enviado para impressão (após
              aplicação dos filtros selecionados).
            </p>
          </div>

          <button
            className="px-4 py-2 rounded-md bg-emerald-600 text-white text-sm font-medium disabled:opacity-50"
            onClick={handleExport}
            disabled={!activeModelUrl}
          >
            Exportar modelo para impressão
          </button>
        </div>

        <div className="bg-slate-100 rounded-xl aspect-video flex items-center justify-center overflow-hidden">
          {activeModelUrl && isViewable ? (
            <ModelViewer
              src={activeModelUrl}
              camera-controls
              autoplay
              ar
              ar-modes="webxr scene-viewer quick-look"
              style={{ width: "100%", height: "100%" }}
            />
          ) : activeModelUrl && !isViewable ? (
            <div className="text-center text-slate-500 px-6">
              <div className="text-6xl mb-3">🧱</div>
              <p className="text-lg font-medium mb-1">
                Modelo carregado, mas o viewer deste protótipo só mostra
                ficheiros <span className="font-semibold">.glb / .gltf</span>.
              </p>
              <p className="text-sm">
                O ficheiro{" "}
                <span className="font-semibold">{uploadedFile?.name}</span> será
                usado para as estimativas e exportação para impressão, mas não
                pode ser visualizado em 3D aqui. Para ver em 3D/AR, exporta em
                formato GLB a partir do 3D Slicer (ou converte o STL/OBJ para
                GLB).
              </p>
            </div>
          ) : (
            <div className="text-center text-slate-500">
              <div className="text-6xl mb-3">🖨️</div>
              <p className="text-lg font-medium">
                Ainda não há modelo pronto para imprimir.
              </p>
              <p className="text-sm">
                Carrega um modelo do 3D Slicer (ou um exemplo em modo Treino),
                ajusta os filtros e clica em{" "}
                <span className="font-semibold">
                  “Aplicar filtros e gerar modelo para impressão”
                </span>
                .
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
