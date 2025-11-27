import { useCardioFlow } from "../context/CardioFlowContext";
import type { PipelineStepId } from "../context/CardioFlowContext";

const STEP_ORDER: PipelineStepId[] = [
  "ct-import",
  "ct-series",
  "slicer-segmentation",
  "export-3d",
  "viewer-3d",
  "ar",
  "printing",
];

export default function CaseSummary() {
  const {
    mode,
    selectedSeries,
    pipelineSteps,
    modelUrl,
    printModelUrl,
    surgeonNotes,
    riskNotes,
    preferredViewSaved,
  } = useCardioFlow();

  const doneCount = STEP_ORDER.filter((id) => pipelineSteps[id]).length;
  const total = STEP_ORDER.length;
  const percent = Math.round((doneCount / total) * 100);

  const shortText = (txt: string, max = 80) =>
    txt.length > max ? txt.slice(0, max) + "…" : txt;

  return (
    <aside className="bg-white rounded-xl shadow-sm p-4 space-y-4 text-sm">
      <div>
        <div className="text-xs uppercase text-slate-400 tracking-wide mb-1">
          Resumo do caso
        </div>
        <div className="text-[13px]">
          Modo{" "}
          <span className="font-semibold">
            {mode === "treino" ? "Treino" : "Real"}
          </span>
        </div>
      </div>

      {/* Série selecionada */}
      <div>
        <div className="text-xs font-semibold text-slate-500 mb-1">
          Série de TAC selecionada
        </div>
        {selectedSeries ? (
          <div className="text-slate-700 space-y-1">
            <div className="font-medium">{selectedSeries.description}</div>
            <div className="text-xs text-slate-500">
              Série {selectedSeries.id} · {selectedSeries.bodyPart} ·{" "}
              {selectedSeries.slices} slices · {selectedSeries.studyDate}
            </div>
          </div>
        ) : (
          <div className="text-xs text-slate-500">
            Nenhuma série selecionada. Começa em{" "}
            <span className="font-semibold">TAC → Séries</span>.
          </div>
        )}
      </div>

      {/* Info modelo 3D */}
      <div>
        <div className="text-xs font-semibold text-slate-500 mb-1">
          Modelo 3D atual
        </div>
        {modelUrl ? (
          <div className="text-xs text-slate-600">
            Existe um modelo carregado no passo{" "}
            <span className="font-semibold">Modelo 3D / AR</span>.
          </div>
        ) : (
          <div className="text-xs text-slate-500">
            Nenhum modelo carregado ainda no passo Modelo 3D / AR.
          </div>
        )}

        {printModelUrl && (
          <div className="mt-1 text-xs text-emerald-700">
            Modelo já enviado para o passo{" "}
            <span className="font-semibold">Impressão 3D</span>.
          </div>
        )}

        {preferredViewSaved && (
          <div className="mt-1 text-xs text-sky-700">
            Vista preferida marcada no{" "}
            <span className="font-semibold">Modelo 3D</span> (ponto de
            explicação ao doente / equipa).
          </div>
        )}
      </div>

      {/* Notas clínicas */}
      <div>
        <div className="text-xs font-semibold text-slate-500 mb-1">
          Notas clínicas
        </div>
        {surgeonNotes ? (
          <div className="text-xs text-slate-700">
            <span className="font-semibold">Notas do cirurgião/equipa: </span>
            {shortText(surgeonNotes)}
          </div>
        ) : (
          <div className="text-xs text-slate-500">
            Sem notas registadas pelo cirurgião/equipa.
          </div>
        )}

        {riskNotes && (
          <div className="mt-1 text-xs text-amber-700">
            <span className="font-semibold">Riscos / pontos de atenção: </span>
            {shortText(riskNotes)}
          </div>
        )}
      </div>

      {/* Progresso pipeline */}
      <div>
        <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
          <span>Progresso da pipeline</span>
          <span>
            {doneCount}/{total} ({percent}%)
          </span>
        </div>
        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-400"
            style={{ width: `${percent}%` }}
          />
        </div>

        <ul className="mt-2 space-y-1 text-[11px] text-slate-600">
          {STEP_ORDER.map((id) => (
            <li key={id} className="flex items-center gap-1">
              <span
                className={`inline-block w-2 h-2 rounded-full ${
                  pipelineSteps[id] ? "bg-emerald-500" : "bg-slate-300"
                }`}
              />
              <span>{labelForStep(id)}</span>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}

function labelForStep(id: PipelineStepId): string {
  switch (id) {
    case "ct-import":
      return "Importação TAC";
    case "ct-series":
      return "Seleção de séries";
    case "slicer-segmentation":
      return "Segmentação no 3D Slicer";
    case "export-3d":
      return "Exportação do modelo 3D";
    case "viewer-3d":
      return "Viewer 3D validado";
    case "ar":
      return "Validação em AR";
    case "printing":
      return "Impressão 3D pronta";
    default:
      return id;
  }
}
