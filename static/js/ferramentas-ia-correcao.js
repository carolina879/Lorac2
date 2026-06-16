

(function (global) {
  "use strict";

  const API_BASE = "";



  function _toast(msg, type = "success") {
    if (typeof window._exToast === "function") {
      window._exToast(msg, type);
    } else {
      console[type === "error" ? "error" : "log"](msg);
    }
  }

  function _esc(str) {
    return String(str ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  async function _post(endpoint, body) {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || `Erro ${res.status}`);
    }
    return res.json();
  }

  

  /**
   * Renderiza o painel de correção IA dentro do formulário de correção
   * do professor. Deve ser chamado após o HTML do formulário estar no DOM.
   *
   * @param {string} turmaId
   * @param {string} exId
   * @param {string} userId
   * @param {number} qi 
   */
  function renderBotaoCorrecaoIA(turmaId, exId, userId, qi) {
    const safeId = userId.replace(/\W/g, "_");
    const containerId = `ex-ia-btn-${safeId}-${qi}`;
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
      <button
        id="btn-ia-corrigir-${safeId}-${qi}"
        class="btn-ia-corrigir"
        title="A IA sugere uma nota e feedback. Você pode ajustar antes de salvar."
        onclick="AICorrecao.corrigirComIA('${turmaId}','${exId}','${userId}',${qi})"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
        </svg>
        Sugestão IA
      </button>
    `;
  }

  
  async function corrigirComIA(turmaId, exId, userId, qi) {
   
    const ex = (typeof window._exGetOne === "function")
      ? window._exGetOne(turmaId, exId)
      : null;

    if (!ex) { _toast("Exercício não encontrado.", "error"); return; }

    const q = ex.questoes?.[qi];
    const r = ex.respostas?.[userId]?.respostas?.[qi];

    if (!q || q.tipo !== "escrever") {
      _toast("Esta questão não é dissertativa.", "error");
      return;
    }
    if (!r?.texto?.trim()) {
      _toast("O aluno ainda não respondeu esta questão.", "error");
      return;
    }

    const safeId = userId.replace(/\W/g, "_");
    const btn = document.getElementById(`btn-ia-corrigir-${safeId}-${qi}`);
    const notaInput = document.getElementById(`ex-nota-${safeId}-${qi}`);
    const comentInput = document.getElementById(`ex-coment-${safeId}-${qi}`);

    if (btn) { btn.disabled = true; btn.textContent = "🤖 Analisando..."; }

    try {
      const data = await _post("/api/ai/corrigir", {
        enunciado: q.enunciado,
        resposta_aluno: r.texto,
        valor_maximo: q.valor ?? 10,
        criterios: q.criterios ?? null,
      });

      if (notaInput) notaInput.value = data.nota_sugerida;
      if (comentInput) {
        let feedbackCompleto = data.feedback + "\n\n";
        if (data.pontos_positivos?.length) {
          feedbackCompleto += "✅ Pontos positivos:\n" +
            data.pontos_positivos.map(p => `• ${p}`).join("\n") + "\n\n";
        }
        if (data.pontos_melhorar?.length) {
          feedbackCompleto += "📌 Para melhorar:\n" +
            data.pontos_melhorar.map(p => `• ${p}`).join("\n");
        }
        comentInput.value = feedbackCompleto.trim();
      }

      
      _renderAvisoIA(safeId, qi, data.nota_sugerida, data.aviso_professor);

      _toast("✅ Sugestão gerada! Revise e salve.", "success");
    } catch (e) {
      _toast(`❌ Erro na IA: ${e.message}`, "error");
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = `
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
          Sugestão IA
        `;
      }
    }
  }

  function _renderAvisoIA(safeId, qi, nota, aviso) {
    const containerId = `ex-ia-aviso-${safeId}-${qi}`;
    let div = document.getElementById(containerId);
    if (!div) {
      const notaInput = document.getElementById(`ex-nota-${safeId}-${qi}`);
      if (!notaInput) return;
      div = document.createElement("div");
      div.id = containerId;
      notaInput.parentNode.insertBefore(div, notaInput.nextSibling);
    }
    div.innerHTML = `
      <div class="ex-ia-aviso">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <span>
          <strong>Sugestão da IA: ${nota} pts.</strong>
          ${_esc(aviso)} Esta é uma sugestão — você tem a palavra final.
        </span>
        <button onclick="this.parentElement.parentElement.remove()" style="margin-left:auto;background:none;border:none;cursor:pointer;color:inherit;font-size:16px;line-height:1;">✕</button>
      </div>
    `;
  }

  
 
  async function gerarQuestoesAvancado() {
    const tema = document.getElementById("ex-ai-tema")?.value.trim();
    const tipo = document.getElementById("ex-ai-tipo")?.value ?? "marcar";
    const qtd = parseInt(document.getElementById("ex-ai-qtd")?.value) || 3;
    const nivel = document.getElementById("ex-ai-nivel")?.value ?? "médio";

    if (!tema) { _toast("Digite um tema ou cole um texto.", "error"); return; }

    const loadingEl = document.getElementById("ex-ai-loading");
    const errorEl = document.getElementById("ex-ai-error");
    const previewSection = document.getElementById("ex-ai-generated-preview");
    const previewList = document.getElementById("ex-ai-preview-list");

    if (loadingEl) loadingEl.style.display = "block";
    if (errorEl) errorEl.style.display = "none";
    if (previewSection) previewSection.style.display = "none";
    if (previewList) previewList.innerHTML = "";

    try {
      const data = await _post("/api/ai/gerar-questoes", {
        tema_ou_texto: tema,
        tipo,
        quantidade: qtd,
        nivel,
      });

      const generated = data.questoes || [];
      if (!generated.length) throw new Error("Nenhuma questão foi gerada. Tente um tema diferente.");

   
      window._aiGeneratedQuestions = generated.map((q) => {
        const norm = {
          tipo: q.tipo ?? tipo,
          enunciado: q.enunciado ?? "",
          valor: q.tipo === "escrever" ? 10 : 1,
          gabarito_comentado: q.gabarito_comentado ?? "",
        };
        if (norm.tipo === "marcar") {
          norm.alternativas = q.alternativas ?? ["", "", "", ""];
          norm.correta = q.correta ?? 0;
        }
        return norm;
      });

      if (previewList) {
        previewList.innerHTML = window._aiGeneratedQuestions
          .map((q, i) => _renderPreviewQuestao(q, i))
          .join("");
        previewSection.style.display = "block";
      }

      _toast(`✅ ${generated.length} questão(ões) gerada(s)!`, "success");
    } catch (e) {
      if (errorEl) { errorEl.textContent = e.message; errorEl.style.display = "block"; }
      _toast("❌ Erro ao gerar questões.", "error");
    } finally {
      if (loadingEl) loadingEl.style.display = "none";
    }
  }

  function _renderPreviewQuestao(q, i) {
    const tipoLabel = q.tipo === "marcar" ? "Múltipla Escolha" : "Dissertativa";
    const altsHtml = q.tipo === "marcar" && q.alternativas
      ? `<div class="ex-alternativas-list" style="gap:4px;margin-top:8px;">
          ${q.alternativas
            .map(
              (alt, ai) => `
            <div style="display:flex;align-items:center;gap:6px;font-size:13px;
              color:var(--text-1);${ai === q.correta ? "font-weight:600;color:#70e090;" : ""}">
              <span style="width:20px;text-align:center;">${String.fromCharCode(65 + ai)}.</span>
              ${_esc(alt)}
              ${ai === q.correta ? '<span style="margin-left:auto;color:#70e090;">✓ Correta</span>' : ""}
            </div>`
            )
            .join("")}
        </div>`
      : "";

    const gabaritoHtml = q.gabarito_comentado
      ? `<details style="margin-top:10px;">
          <summary style="font-size:11px;color:var(--text-2);cursor:pointer;letter-spacing:.06em;text-transform:uppercase;">
            💡 Gabarito comentado
          </summary>
          <p style="font-size:13px;color:var(--text-2);margin-top:6px;line-height:1.5;">${_esc(q.gabarito_comentado)}</p>
        </details>`
      : "";

    return `
      <div class="ex-questao-editor" style="padding:14px;border-color:rgba(80,140,220,.2);background:rgba(80,140,220,.05);">
        <div class="ex-q-header" style="margin-bottom:8px;">
          <span class="ex-q-label" style="color:#6090d0;">
            Questão Gerada ${i + 1} — ${tipoLabel}
          </span>
        </div>
        <div style="font-size:14px;margin-bottom:4px;">${_esc(q.enunciado)}</div>
        ${altsHtml}
        ${gabaritoHtml}
      </div>`;
  }

  
  function injetarSeletorNivel() {
    const tipoSelect = document.getElementById("ex-ai-tipo");
    if (!tipoSelect || document.getElementById("ex-ai-nivel")) return;

    const wrapper = document.createElement("div");
    wrapper.className = "ex-field";
    wrapper.innerHTML = `
      <label for="ex-ai-nivel">Dificuldade</label>
      <select id="ex-ai-nivel" class="ex-input">
        <option value="fácil">Fácil</option>
        <option value="médio" selected>Médio</option>
        <option value="difícil">Difícil</option>
      </select>
    `;
    tipoSelect.parentElement.parentElement.insertBefore(
      wrapper,
      tipoSelect.parentElement.nextSibling
    );
  }

  
  const CSS = `

    .btn-ia-corrigir {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      background: linear-gradient(135deg, rgba(80,140,220,.15), rgba(120,80,220,.15));
      border: 1px solid rgba(80,140,220,.35);
      border-radius: 8px;
      color: #8ab4f8;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all .2s;
      white-space: nowrap;
    }
    .btn-ia-corrigir:hover:not(:disabled) {
      background: linear-gradient(135deg, rgba(80,140,220,.25), rgba(120,80,220,.25));
      border-color: rgba(80,140,220,.6);
    }
    .btn-ia-corrigir:disabled { opacity: .55; cursor: not-allowed; }

    .ex-ia-aviso {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      margin: 8px 0;
      padding: 10px 14px;
      background: rgba(255,200,80,.08);
      border: 1px solid rgba(255,200,80,.25);
      border-radius: 8px;
      font-size: 12px;
      color: #ffc850;
      line-height: 1.5;
    }
    .ex-ia-aviso svg { flex-shrink: 0; margin-top: 1px; }
    .ex-ia-aviso strong { color: #ffe090; }
  `;

  function _injectCSS() {
    if (document.getElementById("ai-correcao-css")) return;
    const style = document.createElement("style");
    style.id = "ai-correcao-css";
    style.textContent = CSS;
    document.head.appendChild(style);
  }

  

  _injectCSS();

  global.AICorrecao = {
   
    renderBotaoCorrecaoIA,
   
    corrigirComIA,
    
    gerarQuestoesAvancado,
 
    injetarSeletorNivel,
  };

  global._gerarQuestoesIA = gerarQuestoesAvancado;

})(window);
