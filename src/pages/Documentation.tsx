import { Link } from "react-router-dom";

export default function Documentation() {
  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Título + resumo */}
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">Documentação da Plataforma</h1>
        <p className="text-slate-700 max-w-3xl">
          Esta página descreve a lógica da plataforma{" "}
          <span className="font-semibold">CardioFlow 3D</span>: como passar de
          um estudo de TAC a um modelo cardíaco em 3D, validado em Realidade
          Aumentada e pronto para impressão 3D, tanto em{" "}
          <span className="font-semibold">Modo Treino</span> como em{" "}
          <span className="font-semibold">Modo Real</span>.
        </p>
      </header>

      {/* 1. Visão geral */}
      <section className="bg-white rounded-xl shadow-sm p-6 space-y-3">
        <h2 className="text-xl font-semibold">1. Visão geral da pipeline</h2>
        <p className="text-sm text-slate-700">
          A pipeline completa é visível em{" "}
          <Link
            to="/"
            className="text-sky-700 underline underline-offset-2 font-medium"
          >
            Pipeline CardioFlow 3D
          </Link>
          , mas pode ser resumida em quatro blocos principais:
        </p>

        <ol className="list-decimal list-inside text-sm text-slate-700 space-y-1">
          <li>
            <span className="font-semibold">Aquisição e seleção de TAC:</span>{" "}
            organização das séries e escolha da série cardíaca ótima.
          </li>
          <li>
            <span className="font-semibold">Segmentação e modelo 3D:</span>{" "}
            trabalho no 3D Slicer e exportação do modelo segmentado.
          </li>
          <li>
            <span className="font-semibold">Visualização 3D / AR:</span>{" "}
            carregamento do modelo na plataforma, validação e AR.
          </li>
          <li>
            <span className="font-semibold">Impressão 3D:</span> preparação do
            ficheiro final para impressão e estimativa de recursos.
          </li>
        </ol>

        <p className="text-xs text-slate-500">
          Nesta versão, várias etapas (segmentação, smoothing real, etc.) são
          simuladas na interface. A integração com algoritmos clínicos reais é
          pensada como um passo seguinte, mantendo a arquitetura modular.
        </p>
      </section>

      {/* 2. Papéis: cirurgião vs engenheiro */}
      <section className="bg-white rounded-xl shadow-sm p-6 space-y-3">
        <h2 className="text-xl font-semibold">
          2. Papéis: cirurgião vs engenheiro / equipa técnica
        </h2>

        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">O que faz o cirurgião</h3>
            <ul className="list-disc list-inside text-slate-700 space-y-1">
              <li>Indica o objetivo clínico (ex.: planeamento de cirurgia).</li>
              <li>Valida a série de TAC escolhida como adequada.</li>
              <li>
                Revê o modelo 3D / AR e confirma se representa corretamente a
                anatomia relevante.
              </li>
              <li>
                Decide se é necessária impressão 3D e aprova os parâmetros
                principais (escala, material).
              </li>
            </ul>
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">O que faz o engenheiro / equipa técnica</h3>
            <ul className="list-disc list-inside text-slate-700 space-y-1">
              <li>
                Organiza e filtra as séries de TAC na página{" "}
                <span className="font-semibold">TAC → Séries</span>.
              </li>
              <li>
                Executa a segmentação no 3D Slicer e exporta o modelo 3D
                adequado.
              </li>
              <li>
                Carrega o modelo na página{" "}
                <span className="font-semibold">Modelo 3D / AR</span> e valida a
                integridade geométrica.
              </li>
              <li>
                Configura os parâmetros de impressão na página{" "}
                <span className="font-semibold">Impressão 3D</span> e gera o
                ficheiro final.
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 3. Modos de utilização */}
      <section className="bg-white rounded-xl shadow-sm p-6 space-y-3">
        <h2 className="text-xl font-semibold">3. Modos de utilização</h2>
        <p className="text-sm text-slate-700">
          A plataforma funciona em dois modos, controlados globalmente (barra
          superior) e refletidos nas páginas principais.
        </p>

        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-1">Modo Treino</h3>
            <p className="text-slate-700">
              Desenhado para aulas, demonstrações e treino sem dados reais de
              doentes.
            </p>
            <ul className="mt-2 list-disc list-inside text-slate-700 space-y-1">
              <li>Séries de TAC de exemplo na página TAC → Séries.</li>
              <li>
                Modelo 3D de treino na página Modelo 3D / AR (substituível mais
                tarde por um coração real de demonstração).
              </li>
              <li>
                Estimativas de impressão baseadas em valores típicos, sem
                ligação a uma impressora específica.
              </li>
            </ul>
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-1">Modo Real</h3>
            <p className="text-slate-700">
              Pensado para casos clínicos supervisionados, com dados reais.
            </p>
            <ul className="mt-2 list-disc list-inside text-slate-700 space-y-1">
              <li>Importação de ficheiros DICOM na página TAC → Séries.</li>
              <li>
                Upload de modelos 3D reais exportados do 3D Slicer
                (segmentação cardíaca).
              </li>
              <li>
                Preparação de ficheiros finais para impressão 3D com parâmetros
                ajustáveis (material, escala, infill, etc.).
              </li>
            </ul>
          </div>
        </div>

        <p className="text-xs text-slate-500">
          O modo selecionado é guardado em localStorage, para manter o contexto
          entre páginas e sessões.
        </p>
      </section>

      {/* 4. Ligações entre páginas (fluxo clínico) */}
      <section className="bg-white rounded-xl shadow-sm p-6 space-y-3">
        <h2 className="text-xl font-semibold">
          4. Fluxo clínico entre as páginas
        </h2>

        <ol className="list-decimal list-inside text-sm text-slate-700 space-y-2">
          <li>
            <span className="font-semibold">TAC → Séries:</span> o utilizador
            importa as séries (modo real) ou usa o conjunto de treino e escolhe
            a série cardíaca ótima. Esta escolha é guardada como{" "}
            <span className="font-semibold">“série ativa”</span>.
          </li>
          <li>
            <span className="font-semibold">3D Slicer (offline):</span> com base
            nessa série, a equipa executa a segmentação e exporta o modelo 3D
            (STL / OBJ / GLB).
          </li>
          <li>
            <span className="font-semibold">Modelo 3D / AR:</span> o modelo
            segmentado é carregado na plataforma, associado ao caso (série
            ativa) e validado em 3D e AR.
          </li>
          <li>
            <span className="font-semibold">Impressão 3D:</span> o mesmo modelo
            é preparado com filtros lógicos e parâmetros de impressão,
            produzindo um ficheiro final pronto a enviar para o slicer da
            impressora.
          </li>
        </ol>

        <p className="text-xs text-slate-500">
          A página <span className="font-semibold">Pipeline</span> acompanha
          este fluxo, permitindo marcar automaticamente ou manualmente os passos
          como concluídos.
        </p>
      </section>

      {/* 5. Notas técnicas e limitações */}
      <section className="bg-white rounded-xl shadow-sm p-6 space-y-3">
        <h2 className="text-xl font-semibold">5. Notas técnicas e limitações</h2>

        <div className="space-y-2 text-sm text-slate-700">
          <p>
            <span className="font-semibold">Integração DICOM:</span> neste
            protótipo a organização de séries é feita com base em nomes de
            ficheiros e exemplos pré-definidos. Uma versão clínica real deverá
            ler metadados DICOM (SeriesInstanceUID, BodyPartExamined, etc.) e
            integrar-se com o PACS.
          </p>
          <p>
            <span className="font-semibold">Processamento de malha:</span> os
            “filtros” de pós-processamento (suavizar, tornar oco, etc.) são
            simulados a nível de interface. A implementação real implicaria
            algoritmos de processamento de malha em backend ou WebAssembly.
          </p>
          <p>
            <span className="font-semibold">Estimativas de impressão:</span>{" "}
            baseiam-se em aproximações simples e destinam-se apenas a dar ordem
            de grandeza (tempo, filamento, custo), não valores exatos.
          </p>
          <p>
            <span className="font-semibold">Segurança e dados:</span> o
            protótipo não implementa autenticação nem encriptação de dados.
            Qualquer utilização real teria de cumprir requisitos de proteção de
            dados (RGPD) e normas hospitalares.
          </p>
        </div>
      </section>
    </div>
  );
}
