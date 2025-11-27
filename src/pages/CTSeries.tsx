import { useEffect, useState } from "react";
import type React from "react";
import { useCardioFlow } from "../context/CardioFlowContext";
import type { SeriesInfo } from "../context/CardioFlowContext";

type Series = {
  id: string;
  description: string;
  modality: string;
  bodyPart: string;
  slices: number;
  studyDate: string;
  protocol: string;
};

// Séries de exemplo para modo treino
const TRAINING_SERIES: Series[] = [
  {
    id: "SERIES_01",
    description: "CTA Aorta / Coração ECG-gated",
    modality: "CT",
    bodyPart: "Coração / Aorta",
    slices: 320,
    studyDate: "2025-03-12",
    protocol: "Angio-CT cardíaco com contraste",
  },
  {
    id: "SERIES_02",
    description: "CT Tórax baixa dose",
    modality: "CT",
    bodyPart: "Tórax",
    slices: 80,
    studyDate: "2025-03-12",
    protocol: "Screening / follow-up",
  },
  {
    id: "SERIES_03",
    description: "CT Abdómen / Pélvis com contraste",
    modality: "CT",
    bodyPart: "Abdómen / Pélvis",
    slices: 260,
    studyDate: "2025-03-12",
    protocol: "Estudo vascular",
  },
  {
    id: "SERIES_04",
    description: "Localizers (scout views)",
    modality: "CT",
    bodyPart: "Geral",
    slices: 4,
    studyDate: "2025-03-12",
    protocol: "Scout",
  },
];

type FilterKey = "todas" | "cardio" | "torax" | "abdomem";

export default function CTSeries() {
  const { mode, setSelectedSeries, markStepDone, showToast } = useCardioFlow();

  const isTraining = mode === "treino";

  const [seriesList, setSeriesList] = useState<Series[]>([]);
  const [filter, setFilter] = useState<FilterKey>("todas");

  // Sempre que o modo muda (navbar), atualiza a lista
  useEffect(() => {
    if (mode === "treino") {
      setSeriesList(TRAINING_SERIES);
      setSelectedSeries(null);
    } else {
      setSeriesList([]);
      setSelectedSeries(null);
    }
  }, [mode, setSelectedSeries]);

  // Upload de ficheiros "reais"
  const handleFilesSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    // Agrupamento simplificado por prefixo de nome de ficheiro
    const map = new Map<string, Series>();

    for (const file of files) {
      const name = file.name;
      const prefix = name.split("_")[0] || "SERIE";

      const existing = map.get(prefix);
      if (!existing) {
        map.set(prefix, {
          id: prefix,
          description: `Série a partir de: ${prefix}`,
          modality: "CT",
          bodyPart: "Desconhecido",
          slices: 1,
          studyDate: new Date().toISOString().slice(0, 10),
          protocol: "Importado via upload (demo)",
        });
      } else {
        existing.slices += 1;
      }
    }

    setSeriesList(Array.from(map.values()));
    markStepDone("ct-import");
    showToast("Ficheiros DICOM importados (demo).", "success");
  };

  const handleUseSeries = (s: Series) => {
    const info: SeriesInfo = {
      id: s.id,
      description: s.description,
      bodyPart: s.bodyPart,
      slices: s.slices,
      studyDate: s.studyDate,
      protocolType: s.protocol,
    };
    setSelectedSeries(info);
    markStepDone("ct-series");
    showToast("Série selecionada como base para o modelo 3D.", "success");
  };

  const filteredSeries = seriesList.filter((s) => {
    if (filter === "todas") return true;

    const desc = s.description.toLowerCase();
    const part = s.bodyPart.toLowerCase();

    if (filter === "cardio") {
      return (
        desc.includes("aorta") ||
        desc.includes("coração") ||
        part.includes("coração")
      );
    }

    if (filter === "torax") {
      return (
        part.includes("tórax") ||
        part.includes("torax") ||
        part.includes("pulm")
      );
    }

    if (filter === "abdomem") {
      return (
        part.includes("abdómen") ||
        part.includes("abdomen") ||
        part.includes("pélvis") ||
        part.includes("pelvis")
      );
    }

    return true;
  });

  const filterButtonBase =
    "px-3 py-1 text-xs md:text-sm rounded-full border transition";

  return (
    <div className="mt-6 space-y-5">
      {/* Header */}
      <header className="space-y-2">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
              TAC → Séries
            </h1>
            <p className="text-sm text-slate-600 max-w-2xl">
              Seleção e organização das séries de TAC antes da segmentação e
              criação do modelo 3D.
            </p>
          </div>

          {/* Badge de modo (só leitura) */}
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
                ? "Treino · séries de exemplo"
                : "Real · upload de DICOM"}
            </div>
          </div>
        </div>
      </header>

      {/* Card de upload / explicação */}
      <section className="bg-white rounded-xl shadow-sm p-5 space-y-3 border border-slate-200">
        <h2 className="text-lg font-semibold text-slate-900">
          Importar séries de TAC
        </h2>

        {isTraining ? (
          <div className="space-y-2 text-sm text-slate-600">
            <p>
              Neste modo estás a trabalhar com um{" "}
              <span className="font-semibold">
                conjunto de séries de exemplo
              </span>{" "}
              para treino e demonstração.
            </p>
            <p className="text-xs text-slate-500">
              Podes alterar filtros em baixo e escolher uma série para usar como
              base no modelo 3D. Se quiseres voltar ao estado inicial, repõe o
              exemplo de treino.
            </p>
            <button
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-50"
              onClick={() => {
                setSeriesList(TRAINING_SERIES);
                setSelectedSeries(null);
                showToast("Séries de treino repostas.", "info");
              }}
            >
              Repor exemplo de treino
            </button>
          </div>
        ) : (
          <div className="space-y-3 text-sm text-slate-600">
            <p>
              No modo <span className="font-semibold">Real</span> podes simular
              a importação de ficheiros DICOM a partir de um estudo de TAC.
            </p>
            <div>
              <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-sky-600 text-sky-700 font-medium cursor-pointer hover:bg-sky-50 text-xs md:text-sm">
                Escolher ficheiros DICOM
                <input
                  type="file"
                  multiple
                  accept=".dcm,.dicom"
                  className="hidden"
                  onChange={handleFilesSelected}
                />
              </label>
              <p className="text-xs text-slate-500 mt-2">
                Para a demo podes selecionar vários ficheiros .dcm com nomes
                semelhantes por série. O sistema agrupa-os por prefixo de nome
                (ex: <code className="font-mono">SERIE1_001.dcm</code>,{" "}
                <code className="font-mono">SERIE1_002.dcm</code>, etc.).
              </p>
            </div>
          </div>
        )}
      </section>

      {/* Filtros rápidos */}
      <section className="bg-white rounded-xl shadow-sm p-4 flex flex-wrap items-center gap-3 border border-slate-200">
        <span className="text-sm font-medium text-slate-700">
          Filtro anatómico:
        </span>
        <button
          className={`${filterButtonBase} ${
            filter === "todas"
              ? "bg-slate-900 text-white border-slate-900"
              : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
          }`}
          onClick={() => setFilter("todas")}
        >
          Todas
        </button>
        <button
          className={`${filterButtonBase} ${
            filter === "cardio"
              ? "bg-sky-600 text-white border-sky-600"
              : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
          }`}
          onClick={() => setFilter("cardio")}
        >
          Cardíaco / Aorta
        </button>
        <button
          className={`${filterButtonBase} ${
            filter === "torax"
              ? "bg-sky-600 text-white border-sky-600"
              : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
          }`}
          onClick={() => setFilter("torax")}
        >
          Tórax
        </button>
        <button
          className={`${filterButtonBase} ${
            filter === "abdomem"
              ? "bg-sky-600 text-white border-sky-600"
              : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
          }`}
          onClick={() => setFilter("abdomem")}
        >
          Abdómen / Pélvis
        </button>
      </section>

      {/* Séries: cards em mobile + tabela em desktop */}
      <section className="bg-white rounded-xl shadow-sm p-4 sm:p-5 border border-slate-200">
        <h2 className="text-lg font-semibold mb-3 text-slate-900">
          Séries detetadas
        </h2>

        {filteredSeries.length === 0 ? (
          <p className="text-sm text-slate-500">
            Ainda não há séries para mostrar.{" "}
            {isTraining
              ? "Se mexeste nos dados, repõe o exemplo de treino."
              : "Importa ficheiros DICOM para ver as séries agrupadas."}
          </p>
        ) : (
          <>
            {/* Versão em cards para ecrãs pequenos */}
            <div className="space-y-3 lg:hidden">
              {filteredSeries.map((s) => (
                <div
                  key={s.id}
                  className="border border-slate-200 rounded-lg bg-slate-50/60 px-3 py-2.5 text-xs sm:text-sm flex flex-col gap-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[11px] font-semibold text-slate-800">
                      {s.id}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {s.studyDate}
                    </span>
                  </div>
                  <div className="font-medium text-slate-900">
                    {s.description}
                  </div>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-600">
                    <span>{s.modality}</span>
                    <span>· {s.bodyPart}</span>
                    <span>· {s.slices} slices</span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {s.protocol}
                  </div>
                  <button
                    className="mt-2 inline-flex justify-center items-center rounded-md bg-sky-600 text-white text-xs font-medium px-3 py-1.5 hover:bg-sky-700"
                    onClick={() => handleUseSeries(s)}
                  >
                    Usar série
                  </button>
                </div>
              ))}
            </div>

            {/* Tabela clássica em ecrãs maiores */}
            <div className="hidden lg:block overflow-x-auto mt-1">
              <table className="w-full text-sm border-separate border-spacing-0">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left py-2.5 px-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500 border-b border-slate-200">
                      ID Série
                    </th>
                    <th className="text-left py-2.5 px-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500 border-b border-slate-200">
                      Descrição
                    </th>
                    <th className="text-left py-2.5 px-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500 border-b border-slate-200">
                      Mod.
                    </th>
                    <th className="text-left py-2.5 px-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500 border-b border-slate-200">
                      Região
                    </th>
                    <th className="text-right py-2.5 px-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500 border-b border-slate-200">
                      Slices
                    </th>
                    <th className="text-left py-2.5 px-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500 border-b border-slate-200">
                      Data
                    </th>
                    <th className="text-left py-2.5 px-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500 border-b border-slate-200">
                      Protocolo
                    </th>
                    <th className="text-left py-2.5 px-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500 border-b border-slate-200">
                      Ação
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSeries.map((s, idx) => (
                    <tr
                      key={s.id}
                      className={`border-b border-slate-100 last:border-0 ${
                        idx % 2 === 0 ? "bg-white" : "bg-slate-50/60"
                      } hover:bg-sky-50 transition-colors`}
                    >
                      <td className="py-2.5 px-2 font-mono text-xs text-slate-700">
                        {s.id}
                      </td>
                      <td className="py-2.5 px-2 text-slate-800">
                        {s.description}
                      </td>
                      <td className="py-2.5 px-2 text-slate-700">
                        {s.modality}
                      </td>
                      <td className="py-2.5 px-2 text-slate-700">
                        {s.bodyPart}
                      </td>
                      <td className="py-2.5 px-2 text-right text-slate-800">
                        {s.slices}
                      </td>
                      <td className="py-2.5 px-2 text-slate-700">
                        {s.studyDate}
                      </td>
                      <td className="py-2.5 px-2 text-slate-700">
                        {s.protocol}
                      </td>
                      <td className="py-2.5 px-2">
                        <button
                          className="inline-flex items-center rounded-md bg-sky-600 text-white text-xs font-medium px-3 py-1.5 hover:bg-sky-700"
                          onClick={() => handleUseSeries(s)}
                        >
                          Usar série
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
