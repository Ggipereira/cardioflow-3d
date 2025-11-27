// src/pages/Pipeline.tsx
import { useNavigate } from "react-router-dom";
import { useCardioFlow } from "../context/CardioFlowContext";
import type { PipelineStepId } from "../context/CardioFlowContext";
import CaseSummary from "../components/CaseSummary";

type StepConfig = {
  id: PipelineStepId;
  title: string;
  description: string;
  route: string;
};

const STEPS: StepConfig[] = [
  {
    id: "ct-import",
    title: "1. Importação da TAC",
    description:
      "Recolha do estudo de TAC (PACS / DICOM) e organização inicial dos dados.",
    route: "/ct-series",
  },
  {
    id: "ct-series",
    title: "2. Seleção da série cardíaca",
    description:
      "Escolha da série mais adequada para segmentação (gated, campo de visão correto, sem artefactos).",
    route: "/ct-series",
  },
  {
    id: "slicer-segmentation",
    title: "3. Segmentação no 3D Slicer",
    description:
      "Criação do modelo cardíaco segmentado a partir da série selecionada.",
    route: "/docs",
  },
  {
    id: "export-3d",
    title: "4. Exportação do modelo 3D",
    description:
      "Exportação do modelo segmentado (STL/GLB) pronto a ser carregado na plataforma.",
    route: "/docs",
  },
  {
    id: "viewer-3d",
    title: "5. Validação em Modelo 3D / AR",
    description:
      "Carregamento e inspeção do modelo em 3D, incluindo vistas oblíquas e rotação livre.",
    route: "/model-3d",
  },
  {
    id: "ar",
    title: "6. Validação em Realidade Aumentada",
    description:
      "Visualização do modelo em escala real em AR (quando o dispositivo for compatível).",
    route: "/model-3d",
  },
  {
    id: "printing",
    title: "7. Preparação para Impressão 3D",
    description:
      "Configuração de parâmetros de impressão e geração do ficheiro final.",
    route: "/printing",
  },
];

export default function Pipeline() {
  const { pipelineSteps, markStepDone, resetPipeline, mode } = useCardioFlow();
  const navigate = useNavigate();

  const handleGoToStep = (step: StepConfig) => {
    navigate(step.route);
  };

  const isStepLocked = (index: number) => {
    if (index === 0) return false;
    const prevId = STEPS[index - 1].id;
    return !pipelineSteps[prevId];
  };

  const isTraining = mode === "treino";

  return (
    <div className="mt-4 grid gap-6 md:grid-cols-[minmax(0,2fr),minmax(0,1fr)]">
      {/* Coluna principal */}
      <div className="space-y-5">
        {/* Header */}
        <header className="space-y-2">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
              Pipeline CardioFlow 3D
            </h1>
            <span
              className={`inline-flex items-center rounded-full px-3 py-0.5 text-[11px] font-medium border ${
                isTraining
                  ? "bg-sky-50 text-sky-800 border-sky-200"
                  : "bg-emerald-50 text-emerald-800 border-emerald-200"
              }`}
            >
              {isTraining ? "Modo Treino (demo)" : "Modo Real (caso clínico)"}
            </span>
          </div>

          <p className="text-sm text-slate-600 max-w-2xl">
            Sequência de passos desde a TAC até ao modelo cardíaco em 3D,
            validado em AR e pronto para impressão 3D.
          </p>
        </header>

        {/* Caixa de ajuda + reset */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5">
          <p className="text-slate-600 max-w-xl">
            Cada cartão representa um passo da pipeline. Podes navegar diretamente
            para o passo ou marcá-lo como concluído. Alguns passos só ficam
            disponíveis depois de concluir o anterior.
          </p>
          <button
            className="self-start md:self-auto px-3 py-1.5 rounded-md border border-slate-300 text-slate-700 hover:bg-slate-100 transition text-xs font-medium"
            onClick={resetPipeline}
          >
            Repor pipeline
          </button>
        </div>

        {/* Lista de passos */}
        <div className="space-y-4">
          {STEPS.map((step, index) => {
            const done = pipelineSteps[step.id];
            const locked = isStepLocked(index);

            return (
              <div
                key={step.id}
                className={`relative overflow-hidden rounded-xl border bg-white/95 shadow-sm flex flex-col gap-3 p-4 md:p-5 transition hover:shadow-md ${
                  done ? "border-emerald-200" : "border-slate-200"
                } ${locked ? "opacity-75" : ""}`}
              >
                {/* barra lateral de estado */}
                <div
                  className={`absolute inset-y-0 left-0 w-1 ${
                    done ? "bg-emerald-400" : "bg-slate-200"
                  }`}
                />

                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="flex gap-3">
                    {/* bolinha com step */}
                    <div
                      className={`mt-1 flex h-8 w-8 items-center justify-center rounded-full border text-[11px] font-semibold ${
                        done
                          ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                          : "bg-slate-50 border-slate-200 text-slate-600"
                      }`}
                    >
                      {index + 1}
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-base md:text-lg font-semibold text-slate-900">
                          {step.title}
                        </h2>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${
                            done
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {done ? "Concluído" : "Por concluir"}
                        </span>
                        {locked && !done && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-50 text-amber-700 border border-amber-100">
                            Depende do passo anterior
                          </span>
                        )}
                      </div>

                      <p className="mt-1 text-sm text-slate-700">
                        {step.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 text-xs">
                    <button
                      className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                        locked
                          ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                          : "bg-sky-600 text-white hover:bg-sky-700"
                      }`}
                      onClick={() => !locked && handleGoToStep(step)}
                      disabled={locked}
                    >
                      Ir para este passo
                    </button>
                    <label className="flex items-center gap-1 text-[11px] text-slate-600">
                      <input
                        type="checkbox"
                        className="rounded border-slate-300"
                        checked={done}
                        onChange={() => markStepDone(step.id)}
                      />
                      <span>Marcar como concluído</span>
                    </label>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Coluna direita: resumo do caso (sticky) */}
      <div className="md:sticky md:top-24">
        <CaseSummary />
      </div>
    </div>
  );
}
