const Boletim = (() => {
  "use strict";

  const esc = s => String(s ?? "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");

  function toast(msg, type = "success") {
    if (typeof window._exToast === "function") window._exToast(msg, type);
    else console[type === "error" ? "error" : "log"](msg);
  }

  function _mediaFromNotas(notas) {
    const vals = Object.values(notas).filter(n => n != null && !isNaN(n));
    if (!vals.length) return null;
    return +(vals.reduce((a, b) => a + +b, 0) / vals.length).toFixed(2);
  }

  function _corNota(media, max = 10) {
    if (media == null) return { bg: "rgba(100,100,100,.15)", txt: "var(--text-3)", label: "—" };
    const pct = media / max;
    if (pct >= 0.7) return { bg: "rgba(80,200,120,.18)", txt: "#50c878", label: "Bom" };
    if (pct >= 0.5) return { bg: "rgba(255,200,60,.18)", txt: "#f0c040", label: "Regular" };
    return       { bg: "rgba(220,80,60,.18)",  txt: "#e06050", label: "Atenção" };
  }

  function _renderGrafico(canvasId, pontos, linhaRef = null, opts = {}) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width  = canvas.offsetWidth  || 520;
    const H = canvas.height = canvas.offsetHeight || 180;

    const PAD = { top: 18, right: 20, bottom: 48, left: 36 };
    const gW = W - PAD.left - PAD.right;
    const gH = H - PAD.top  - PAD.bottom;

    ctx.clearRect(0, 0, W, H);

    const N = pontos.length;
    if (N === 0) {
      ctx.fillStyle = "rgba(255,255,255,.25)";
      ctx.font = "12px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Sem dados ainda", W / 2, H / 2);
      return;
    }

    [0, 5, 7, 10].forEach(v => {
      const y = PAD.top + gH - (v / 10) * gH;
      ctx.beginPath();
      ctx.strokeStyle = v === 7 ? "rgba(80,200,120,.2)" : "rgba(255,255,255,.07)";
      ctx.lineWidth = v === 7 ? 1.5 : 1;
      ctx.setLineDash(v === 7 ? [4, 3] : [2, 4]);
      ctx.moveTo(PAD.left, y);
      ctx.lineTo(PAD.left + gW, y);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = "rgba(255,255,255,.35)";
      ctx.font = "10px var(--font-mono,'DM Mono',monospace)";
      ctx.textAlign = "right";
      ctx.fillText(v, PAD.left - 6, y + 4);
    });

    const xOf = i => PAD.left + (N === 1 ? gW / 2 : (i / (N - 1)) * gW);
    const yOf = v => PAD.top + gH - Math.max(0, Math.min(1, v / 10)) * gH;

    if (linhaRef && linhaRef.length === N) {
      ctx.beginPath();
      ctx.strokeStyle = "rgba(255,255,255,.22)";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([5, 4]);
      linhaRef.forEach((v, i) => {
        if (v == null) return;
        i === 0 ? ctx.moveTo(xOf(i), yOf(v)) : ctx.lineTo(xOf(i), yOf(v));
      });
      ctx.stroke();
      ctx.setLineDash([]);
    }

    const validos = pontos.map((p, i) => p.valor != null ? i : null).filter(i => i !== null);
    if (validos.length > 1) {
      ctx.beginPath();
      validos.forEach((i, ii) => {
        const x = xOf(i), y = yOf((pontos[i].valor / pontos[i].max) * 10);
        ii === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      });
      ctx.lineTo(xOf(validos[validos.length - 1]), PAD.top + gH);
      ctx.lineTo(xOf(validos[0]), PAD.top + gH);
      ctx.closePath();
      const grad = ctx.createLinearGradient(0, PAD.top, 0, PAD.top + gH);
      grad.addColorStop(0, "rgba(80,140,220,.28)");
      grad.addColorStop(1, "rgba(80,140,220,.02)");
      ctx.fillStyle = grad;
      ctx.fill();
    }

    ctx.beginPath();
    ctx.strokeStyle = "#8ab4f8";
    ctx.lineWidth = 2.5;
    ctx.lineJoin = "round";
    let primeiro = true;
    pontos.forEach((p, i) => {
      if (p.valor == null) return;
      const x = xOf(i), y = yOf((p.valor / p.max) * 10);
      if (primeiro) { ctx.moveTo(x, y); primeiro = false; }
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    pontos.forEach((p, i) => {
      const x = xOf(i);
      const notaNorm = p.valor != null ? (p.valor / p.max) * 10 : null;
      const cor = notaNorm != null ? _corNota(notaNorm).txt : "rgba(255,255,255,.3)";

      const label = (p.label || "").length > 10 ? p.label.slice(0, 9) + "…" : (p.label || "");
      ctx.save();
      ctx.translate(x, PAD.top + gH + 10);
      ctx.rotate(-Math.PI / 5);
      ctx.fillStyle = "rgba(255,255,255,.4)";
      ctx.font = "9px sans-serif";
      ctx.textAlign = "right";
      ctx.fillText(label, 0, 0);
      ctx.restore();

      if (notaNorm == null) return;
      const y = yOf(notaNorm);

      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fillStyle = cor;
      ctx.fill();
      ctx.strokeStyle = "rgba(0,0,0,.4)";
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = cor;
      ctx.font = "bold 10px var(--font-mono,'DM Mono',monospace)";
      ctx.textAlign = "center";
      ctx.fillText(notaNorm.toFixed(1), x, y - 9);
    });

    if (linhaRef) {
      const lx = PAD.left;
      const ly = H - 10;
      ctx.fillStyle = "#8ab4f8";
      ctx.fillRect(lx, ly - 5, 14, 2.5);
      ctx.fillStyle = "rgba(255,255,255,.5)";
      ctx.font = "10px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("Você", lx + 18, ly);

      ctx.setLineDash([4, 3]);
      ctx.strokeStyle = "rgba(255,255,255,.3)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(lx + 80, ly - 3);
      ctx.lineTo(lx + 94, ly - 3);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "rgba(255,255,255,.35)";
      ctx.fillText("Média turma", lx + 98, ly);
    }
  }

  function _renderSparkline(canvasId, valores) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width  = 80;
    const H = canvas.height = 28;
    ctx.clearRect(0, 0, W, H);

    const pts = valores.filter(v => v != null);
    if (pts.length < 2) {
      ctx.fillStyle = "rgba(255,255,255,.2)";
      ctx.font = "9px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("—", W / 2, H / 2 + 3);
      return;
    }

    const xOf = i => (i / (pts.length - 1)) * (W - 4) + 2;
    const yOf = v => H - 4 - ((v / 10) * (H - 8));
    const ultima = pts[pts.length - 1];
    const cor = _corNota(ultima).txt;

    ctx.beginPath();
    ctx.strokeStyle = cor;
    ctx.lineWidth = 1.8;
    ctx.lineJoin = "round";
    pts.forEach((v, i) => i === 0 ? ctx.moveTo(xOf(i), yOf(v)) : ctx.lineTo(xOf(i), yOf(v)));
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(xOf(pts.length - 1), yOf(ultima), 2.5, 0, Math.PI * 2);
    ctx.fillStyle = cor;
    ctx.fill();
  }

  function _coletarNotasAluno(turmaId, userId) {

    let exercicios = [];
    try {
      const state = window._ExercicioState;
      if (state?.exercicios?.[turmaId]) {
        exercicios = Object.values(state.exercicios[turmaId]);
      }
    } catch {}

    if (!exercicios.length) {
      const turma = window.App?.getState?.()?.currentTurma;
      if (turma?.exercicios) exercicios = turma.exercicios;
    }

    if (!exercicios.length) {
      try {
        const raw = localStorage.getItem("studysync_exercicios_" + turmaId);
        if (raw) exercicios = JSON.parse(raw);
      } catch {}
    }

    const progress = AlunoTurmaDashboard._loadProgress(userId, turmaId);

    return exercicios.map(ex => {

      let nota = null;
      let corrigido = false;
      let valorMax = 10;

      try {
        const resAluno = ex.respostas?.[userId];
        if (resAluno) {

          const questoes = ex.questoes || [];
          let soma = 0, totalPossivel = 0, algumCorrigido = false;
          questoes.forEach((q, qi) => {
            const resp = resAluno.respostas?.[qi];
            const vMax = q.valor ?? (q.tipo === "marcar" ? 1 : 10);
            totalPossivel += vMax;
            if (resp?.nota != null) {
              soma += +resp.nota;
              algumCorrigido = true;
            } else if (q.tipo === "marcar" && resp != null) {

              const acertou = (String(resp) === String(q.correta)) || resp?.correta === true;
              soma += acertou ? vMax : 0;
              algumCorrigido = true;
            }
          });
          if (algumCorrigido) {
            nota = +(soma).toFixed(2);
            corrigido = true;
            valorMax = totalPossivel || 10;
          }
        }
      } catch {}

      if (nota == null && progress.notas[ex.id] != null) {
        nota = +progress.notas[ex.id];
        corrigido = true;
      }

      return {
        exId: ex.id,
        titulo: ex.title || ex.name || "Exercício",
        nota,
        valorMax,
        corrigido,
        deadline: ex.deadline || ex.due_date || null,
        concluido: progress.exerciciosConcluidos.includes(ex.id),
      };
    });
  }

  async function abrirBoletimAluno(turma, userId) {
    const itens = _coletarNotasAluno(turma.id, userId);
    const notasArr = itens.filter(i => i.nota != null).map(i => ({ nota: i.nota, max: i.valorMax }));
    const mediaGeral = notasArr.length
      ? +(notasArr.reduce((acc, n) => acc + (n.nota / n.max) * 10, 0) / notasArr.length).toFixed(1)
      : null;
    const cor = _corNota(mediaGeral);

    const linhas = itens.length ? itens.map(item => {
      const c = _corNota(item.nota != null ? (item.nota / item.valorMax) * 10 : null);
      const notaStr = item.nota != null ? `${item.nota}/${item.valorMax}` : (item.concluido ? "Aguardando" : "—");
      return `
        <tr>
          <td style="padding:10px 12px;font-size:13px;color:var(--text-1);">${esc(item.titulo)}</td>
          <td style="padding:10px 12px;text-align:center;">
            <span style="font-size:13px;font-weight:700;color:${c.txt};">${notaStr}</span>
          </td>
          <td style="padding:10px 12px;text-align:center;">
            <span style="padding:3px 10px;border-radius:20px;font-size:11px;font-weight:600;
              background:${item.concluido ? "rgba(80,200,120,.15)" : "rgba(220,80,60,.12)"};
              color:${item.concluido ? "#50c878" : "#e06050"};">
              ${item.concluido ? "✅ Feito" : "⏳ Pendente"}
            </span>
          </td>
        </tr>`;
    }).join("") : `<tr><td colspan="3" style="padding:24px;text-align:center;color:var(--text-3);">Nenhum exercício disponível ainda.</td></tr>`;

    const html = `
      <div id="boletim-aluno-modal">
        <!-- Cabeçalho -->
        <div style="display:flex;align-items:center;gap:14px;margin-bottom:22px;">
          <div style="font-size:36px;">${turma.icon || "🏫"}</div>
          <div>
            <h2 style="font-family:var(--font-display);font-size:21px;color:var(--text-0);margin:0 0 3px;">📋 Meu Boletim</h2>
            <div style="font-size:13px;color:var(--text-2);">${esc(turma.name)}</div>
          </div>
        </div>

        <!-- Card média -->
        <div style="display:flex;align-items:center;gap:16px;padding:18px 20px;
          background:${cor.bg};border:1px solid ${cor.txt}33;border-radius:16px;margin-bottom:22px;">
          <div style="font-size:42px;font-weight:800;color:${cor.txt};font-family:var(--font-mono,'DM Mono',monospace);line-height:1;">
            ${mediaGeral != null ? mediaGeral : "—"}
          </div>
          <div>
            <div style="font-size:13px;font-weight:700;color:${cor.txt};">${cor.label}</div>
            <div style="font-size:12px;color:var(--text-2);">Média geral (escala 0–10)</div>
            <div style="font-size:11px;color:var(--text-3);margin-top:2px;">${notasArr.length} exercício(s) corrigido(s) de ${itens.length}</div>
          </div>
        </div>

        <!-- Tabela de notas -->
        <div style="border:1px solid var(--border);border-radius:14px;overflow:hidden;margin-bottom:20px;">
          <table style="width:100%;border-collapse:collapse;">
            <thead>
              <tr style="background:var(--bg-3);">
                <th style="padding:10px 12px;font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--text-3);text-align:left;">Exercício</th>
                <th style="padding:10px 12px;font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--text-3);text-align:center;">Nota</th>
                <th style="padding:10px 12px;font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--text-3);text-align:center;">Status</th>
              </tr>
            </thead>
            <tbody>${linhas}</tbody>
          </table>
        </div>

        <!-- Gráfico evolução -->
        <div style="border:1px solid var(--border);border-radius:14px;padding:16px 14px 10px;margin-bottom:20px;background:var(--bg-2);">
          <div style="font-size:11px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:var(--text-3);margin-bottom:10px;">Evolução das notas</div>
          <canvas id="boletim-aluno-chart" style="width:100%;height:180px;display:block;"></canvas>
        </div>

        <!-- Botão análise IA -->
        <button id="btn-boletim-ia" onclick="Boletim._analisarComIA()" style="
          width:100%;padding:12px;border-radius:12px;margin-bottom:12px;
          background:linear-gradient(135deg,rgba(80,140,220,.2),rgba(120,80,220,.2));
          border:1px solid rgba(80,140,220,.4);color:#8ab4f8;
          font-size:13px;font-weight:700;cursor:pointer;
          display:flex;align-items:center;justify-content:center;gap:8px;
          transition:all .2s;">
          🤖 Analisar com IA — Gerar Plano de Estudos
        </button>

        <!-- Container análise IA -->
        <div id="boletim-ia-resultado" style="display:none;margin-bottom:16px;"></div>

        <button class="btn-secondary" onclick="App.closeModal()" style="width:100%;margin-top:4px;">Fechar</button>
      </div>
    `;

    window._boletimDados = { turma, userId, itens, mediaGeral };

    window.App?.openModal(html);

    requestAnimationFrame(() => {
      const pontos = itens.map(i => ({
        label: i.titulo,
        valor: i.nota,
        max: i.valorMax,
      }));

      let linhaRef = null;
      const profDados = window._boletimProfDados;
      if (profDados) {
        linhaRef = itens.map(item => {
          const vals = profDados.dadosAlunos
            .map(d => { const it = d.itens.find(x => x.exId === item.exId); return it?.nota != null ? (it.nota / it.valorMax) * 10 : null; })
            .filter(v => v != null);
          return vals.length ? +(vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : null;
        });
      }
      _renderGrafico("boletim-aluno-chart", pontos, linhaRef);
    });
  }

  async function _analisarComIA() {
    const dados = window._boletimDados;
    if (!dados) return;

    const btn = document.getElementById("btn-boletim-ia");
    const container = document.getElementById("boletim-ia-resultado");
    if (!btn || !container) return;

    btn.disabled = true;
    btn.textContent = "🤖 Analisando seu desempenho...";

    const resumo = dados.itens.map(i =>
      `• ${i.titulo}: ${i.nota != null ? `${i.nota}/${i.valorMax}` : "não corrigido"} (${i.concluido ? "feito" : "pendente"})`
    ).join("\n");

    const prompt = `Você é um tutor educacional. Analise o boletim do aluno e crie um plano de estudos personalizado em português.

Turma: ${dados.turma.name}
Média geral: ${dados.mediaGeral ?? "sem notas ainda"}

Exercícios:
${resumo}

Responda SOMENTE com JSON no formato:
{
  "diagnostico": "2-3 frases sobre o desempenho geral",
  "pontos_fortes": ["item1", "item2"],
  "pontos_atencao": ["item1", "item2"],
  "plano": [
    {"semana": 1, "foco": "tema", "atividades": ["atividade1", "atividade2"]},
    {"semana": 2, "foco": "tema", "atividades": ["atividade1", "atividade2"]},
    {"semana": 3, "foco": "tema", "atividades": ["atividade1", "atividade2"]}
  ],
  "dica_motivacional": "frase motivacional curta"
}`;

    try {
      const res = await fetch("https://api.cohere.com/v2/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer huoEFQPVRHM2dxExMxQUwATC2E5BjpuBxayswVxl",
        },
        body: JSON.stringify({
          model: "command-a-03-2025",
          messages: [{ role: "user", content: prompt }],
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `HTTP ${res.status}`);
      }
      const data = await res.json();
      const raw = (data.message?.content?.[0]?.text || "").replace(/```json|```/g, "").trim();
      const match = raw.match(/\{[\s\S]*\}/);
      const analise = JSON.parse(match ? match[0] : raw);

      _renderAnaliseIA(container, analise);
      container.style.display = "block";
      btn.style.display = "none";
      toast("✅ Plano de estudos gerado!", "success");
    } catch (e) {
      toast("❌ Erro na análise: " + e.message, "error");
      btn.disabled = false;
      btn.innerHTML = "🤖 Analisar com IA — Gerar Plano de Estudos";
    }
  }

  function _renderAnaliseIA(container, a) {
    const semanas = (a.plano || []).map((s, i) => `
      <div style="padding:12px 14px;background:var(--bg-2);border-radius:10px;border-left:3px solid rgba(80,140,220,.5);">
        <div style="font-size:11px;font-weight:700;color:#8ab4f8;margin-bottom:4px;text-transform:uppercase;letter-spacing:.06em;">Semana ${s.semana} — ${esc(s.foco)}</div>
        ${(s.atividades || []).map(at => `<div style="font-size:13px;color:var(--text-1);margin-top:3px;">▸ ${esc(at)}</div>`).join("")}
      </div>
    `).join("");

    container.innerHTML = `
      <div style="background:rgba(80,140,220,.07);border:1px solid rgba(80,140,220,.25);border-radius:14px;padding:18px;">
        <div style="font-size:12px;font-weight:700;color:#8ab4f8;letter-spacing:.08em;text-transform:uppercase;margin-bottom:12px;">🤖 Análise IA</div>

        <p style="font-size:14px;color:var(--text-1);margin:0 0 14px;line-height:1.6;">${esc(a.diagnostico)}</p>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px;">
          <div style="padding:12px;background:rgba(80,200,120,.1);border-radius:10px;border:1px solid rgba(80,200,120,.2);">
            <div style="font-size:11px;font-weight:700;color:#50c878;margin-bottom:6px;">✅ Pontos Fortes</div>
            ${(a.pontos_fortes || []).map(p => `<div style="font-size:12px;color:var(--text-1);margin-top:3px;">• ${esc(p)}</div>`).join("")}
          </div>
          <div style="padding:12px;background:rgba(220,80,60,.1);border-radius:10px;border:1px solid rgba(220,80,60,.2);">
            <div style="font-size:11px;font-weight:700;color:#e06050;margin-bottom:6px;">📌 Atenção</div>
            ${(a.pontos_atencao || []).map(p => `<div style="font-size:12px;color:var(--text-1);margin-top:3px;">• ${esc(p)}</div>`).join("")}
          </div>
        </div>

        <div style="margin-bottom:14px;">
          <div style="font-size:11px;font-weight:700;color:var(--text-3);letter-spacing:.07em;text-transform:uppercase;margin-bottom:8px;">📅 Plano de Estudos (3 Semanas)</div>
          <div style="display:flex;flex-direction:column;gap:7px;">${semanas}</div>
        </div>

        ${a.dica_motivacional ? `
          <div style="padding:12px 14px;background:rgba(232,160,74,.1);border-radius:10px;border:1px solid rgba(232,160,74,.25);font-size:13px;color:var(--accent);font-style:italic;">
            💡 "${esc(a.dica_motivacional)}"
          </div>
        ` : ""}
      </div>
    `;
  }

  async function abrirBoletimProfessor(turmaId) {
    const turma = window.App?.getState?.()?.currentTurma;
    if (!turma) { toast("Turma não carregada.", "error"); return; }

    const alunos = turma.students || [];
    if (!alunos.length) {
      window.App?.openModal(`
        <h2 class="modal-title">Boletim da Turma</h2>
        <p style="text-align:center;color:var(--text-2);padding:32px 0;">Nenhum aluno matriculado ainda.</p>
        <button class="btn-secondary" onclick="App.closeModal()" style="width:100%;">Fechar</button>
      `);
      return;
    }

    let exercicios = [];
    try {
      const state = window._ExercicioState;
      if (state?.exercicios?.[turmaId]) exercicios = Object.values(state.exercicios[turmaId]);
    } catch {}
    if (!exercicios.length && turma.exercicios) exercicios = turma.exercicios;

    const dadosAlunos = alunos.map(aluno => {
      const itens = _coletarNotasAluno(turmaId, aluno.id);
      const notasArr = itens.filter(i => i.nota != null).map(i => (i.nota / i.valorMax) * 10);
      const media = notasArr.length
        ? +(notasArr.reduce((a, b) => a + b, 0) / notasArr.length).toFixed(1)
        : null;
      const concluidos = itens.filter(i => i.concluido).length;
      return { aluno, itens, media, concluidos, total: itens.length };
    });

    window._boletimProfDados = { turma, exercicios, dadosAlunos };

    const linhas = dadosAlunos.map(({ aluno, media, concluidos, total, itens }, idx) => {
      const cor = _corNota(media);
      const initials = (aluno.username || "A").slice(0, 2).toUpperCase();
      const sparkId = `spark-${aluno.id || idx}`;
      return `
        <tr style="border-bottom:1px solid var(--border);" data-aluno-idx="${idx}">
          <td style="padding:12px 14px;">
            <div style="display:flex;align-items:center;gap:10px;">
              <div style="width:32px;height:32px;border-radius:50%;background:var(--bg-3);
                display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:var(--text-1);flex-shrink:0;">
                ${initials}
              </div>
              <div>
                <div style="font-size:13px;font-weight:600;color:var(--text-0);">${esc(aluno.username || "Aluno")}</div>
                ${aluno.joinedAt ? `<div style="font-size:11px;color:var(--text-3);">Entrou ${new Date(aluno.joinedAt).toLocaleDateString("pt-BR")}</div>` : ""}
              </div>
            </div>
          </td>
          <td style="padding:12px 14px;text-align:center;">
            <div style="display:inline-flex;align-items:center;gap:6px;padding:5px 12px;
              border-radius:20px;background:${cor.bg};border:1px solid ${cor.txt}33;">
              <span style="font-size:16px;font-weight:800;color:${cor.txt};font-family:var(--font-mono,'DM Mono',monospace);">
                ${media != null ? media : "—"}
              </span>
              <span style="font-size:10px;font-weight:600;color:${cor.txt};text-transform:uppercase;">${cor.label}</span>
            </div>
          </td>
          <td style="padding:12px 14px;text-align:center;">
            <span style="font-size:13px;font-weight:600;color:var(--text-1);">${concluidos}/${total}</span>
            ${total > 0 ? `
              <div style="margin-top:4px;height:4px;background:var(--bg-3);border-radius:4px;overflow:hidden;width:60px;display:inline-block;vertical-align:middle;margin-left:6px;">
                <div style="height:100%;background:${cor.txt};width:${total ? Math.round((concluidos/total)*100) : 0}%;border-radius:4px;"></div>
              </div>` : ""}
          </td>
          <td style="padding:12px 14px;text-align:center;">
            <canvas id="${sparkId}" width="80" height="28" style="display:inline-block;vertical-align:middle;"></canvas>
          </td>
          <td style="padding:12px 14px;text-align:center;">
            <button onclick="Boletim._verDetalheAluno('${aluno.id}')"
              style="padding:5px 12px;border-radius:8px;font-size:11px;font-weight:600;cursor:pointer;
              background:var(--bg-3);border:1px solid var(--border);color:var(--text-2);">
              Ver detalhes
            </button>
          </td>
        </tr>
      `;
    }).join("");

    const mediasValidas = dadosAlunos.filter(d => d.media != null).map(d => d.media);
    const mediaTurma = mediasValidas.length
      ? +(mediasValidas.reduce((a, b) => a + b, 0) / mediasValidas.length).toFixed(1)
      : null;
    const emBom = dadosAlunos.filter(d => d.media != null && (d.media / 10) >= 0.7).length;
    const emAtencao = dadosAlunos.filter(d => d.media != null && (d.media / 10) < 0.5).length;
    const emRegular = dadosAlunos.filter(d => d.media != null && (d.media / 10) >= 0.5 && (d.media / 10) < 0.7).length;

    const html = `
      <div id="boletim-prof-modal">
        <div style="display:flex;align-items:center;gap:14px;margin-bottom:20px;">
          <div style="font-size:32px;">${turma.icon || ""}</div>
          <div style="flex:1;">
            <h2 style="font-family:var(--font-display);font-size:20px;color:var(--text-0);margin:0 0 3px;">Boletim da Turma</h2>
            <div style="font-size:13px;color:var(--text-2);">${esc(turma.name)} — ${alunos.length} aluno(s)</div>
          </div>
          <button onclick="Boletim._exportarExcel()" style="
            display:flex;align-items:center;gap:6px;padding:8px 14px;
            background:rgba(80,200,120,.15);border:1px solid rgba(80,200,120,.35);
            color:#50c878;border-radius:10px;font-size:12px;font-weight:700;cursor:pointer;">
            Excel
          </button>
        </div>

        <!-- Cards de resumo -->
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:20px;">
          ${_cardResumoProf("", "Média Turma", mediaTurma != null ? mediaTurma : "—", "var(--accent)")}
          ${_cardResumoProf("", "Acima de 7", emBom, "#50c878")}
          ${_cardResumoProf("", "Entre 5–7", emRegular, "#f0c040")}
          ${_cardResumoProf("", "Abaixo de 5", emAtencao, "#e06050")}
        </div>

        <!-- Legenda de cores -->
        <div style="display:flex;gap:16px;margin-bottom:14px;flex-wrap:wrap;">
          <span style="font-size:12px;color:#50c878;">≥7 — Bom</span>
          <span style="font-size:12px;color:#f0c040;">5–6.9 — Regular</span>
          <span style="font-size:12px;color:#e06050;">&lt;5 — Atenção</span>
          <span style="font-size:12px;color:var(--text-3);">— — Sem nota</span>
        </div>

        <!-- Tabela de alunos -->
        <div style="border:1px solid var(--border);border-radius:14px;overflow:hidden;margin-bottom:16px;">
          <div style="overflow-x:auto;max-height:420px;overflow-y:auto;">
            <table style="width:100%;border-collapse:collapse;min-width:480px;">
              <thead style="position:sticky;top:0;z-index:1;">
                <tr style="background:var(--bg-3);">
                  <th style="padding:10px 14px;font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--text-3);text-align:left;">Aluno</th>
                  <th style="padding:10px 14px;font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--text-3);text-align:center;">Média</th>
                  <th style="padding:10px 14px;font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--text-3);text-align:center;">Exercícios</th>
                  <th style="padding:10px 14px;font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--text-3);text-align:center;">Evolução</th>
                  <th style="padding:10px 14px;font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--text-3);text-align:center;">Ações</th>
                </tr>
              </thead>
              <tbody>${linhas}</tbody>
            </table>
          </div>
        </div>

        <!-- Gráfico geral da turma -->
        <div style="border:1px solid var(--border);border-radius:14px;padding:16px 14px 10px;margin-bottom:16px;background:var(--bg-2);">
          <div style="font-size:11px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:var(--text-3);margin-bottom:10px;">Média da turma por exercício</div>
          <canvas id="boletim-turma-chart" style="width:100%;height:180px;display:block;"></canvas>
        </div>

        <button class="btn-secondary" onclick="App.closeModal()" style="width:100%;">Fechar</button>
      </div>
    `;

    window.App?.openModal(html);

    requestAnimationFrame(() => {

      dadosAlunos.forEach(({ aluno, itens }, idx) => {
        const sparkId = `spark-${aluno.id || idx}`;
        const vals = itens.map(i => i.nota != null ? (i.nota / i.valorMax) * 10 : null);
        _renderSparkline(sparkId, vals);
      });

      if (exercicios.length) {
        const pontosTurma = exercicios.map(ex => {
          const vals = dadosAlunos
            .map(({ itens }) => { const it = itens.find(i => i.exId === ex.id); return it?.nota != null ? (it.nota / it.valorMax) * 10 : null; })
            .filter(v => v != null);
          return {
            label: ex.title || ex.name || "Ex",
            valor: vals.length ? +(vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : null,
            max: 10,
          };
        });
        _renderGrafico("boletim-turma-chart", pontosTurma);
      }
    });
  }

  function _cardResumoProf(icon, label, value, color) {
    return `
      <div style="background:var(--bg-3);border:1px solid var(--border);border-radius:12px;padding:14px;text-align:center;">
        ${icon ? `<div style="font-size:20px;margin-bottom:4px;">${icon}</div>` : ""}
        <div style="font-size:22px;font-weight:800;color:${color};font-family:var(--font-mono,'DM Mono',monospace);">${value}</div>
        <div style="font-size:11px;color:var(--text-3);margin-top:3px;">${label}</div>
      </div>
    `;
  }

  function _verDetalheAluno(alunoId) {
    const dados = window._boletimProfDados;
    if (!dados) return;

    const d = dados.dadosAlunos.find(d => d.aluno.id === alunoId);
    if (!d) return;

    const cor = _corNota(d.media);
    const linhas = d.itens.map(item => {
      const c = _corNota(item.nota != null ? (item.nota / item.valorMax) * 10 : null);
      return `
        <tr style="border-bottom:1px solid var(--border);">
          <td style="padding:10px 12px;font-size:13px;color:var(--text-1);">${esc(item.titulo)}</td>
          <td style="padding:10px 12px;text-align:center;font-size:13px;font-weight:700;color:${c.txt};">
            ${item.nota != null ? `${item.nota}/${item.valorMax}` : "—"}
          </td>
          <td style="padding:10px 12px;text-align:center;">
            <span style="padding:2px 9px;border-radius:20px;font-size:11px;font-weight:600;
              background:${item.concluido ? "rgba(80,200,120,.15)" : "rgba(220,80,60,.12)"};
              color:${item.concluido ? "#50c878" : "#e06050"};">
              ${item.concluido ? "✅ Feito" : "⏳ Pendente"}
            </span>
          </td>
        </tr>
      `;
    }).join("") || `<tr><td colspan="3" style="padding:20px;text-align:center;color:var(--text-3);">Sem exercícios.</td></tr>`;

    const html = `
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;">
        <div style="width:44px;height:44px;border-radius:50%;background:var(--bg-3);
          display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:700;color:var(--text-1);">
          ${(d.aluno.username || "A").slice(0, 2).toUpperCase()}
        </div>
        <div>
          <h3 style="font-family:var(--font-display);font-size:18px;color:var(--text-0);margin:0 0 2px;">${esc(d.aluno.username || "Aluno")}</h3>
          <div style="font-size:12px;color:var(--text-2);">${dados.turma.name}</div>
        </div>
        <div style="margin-left:auto;padding:6px 14px;border-radius:20px;background:${cor.bg};border:1px solid ${cor.txt}33;">
          <span style="font-size:18px;font-weight:800;color:${cor.txt};font-family:var(--font-mono,'DM Mono',monospace);">${d.media ?? "—"}</span>
        </div>
      </div>
      <div style="border:1px solid var(--border);border-radius:12px;overflow:hidden;margin-bottom:16px;">
        <table style="width:100%;border-collapse:collapse;">
          <thead>
            <tr style="background:var(--bg-3);">
              <th style="padding:10px 12px;font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--text-3);text-align:left;">Exercício</th>
              <th style="padding:10px 12px;font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--text-3);text-align:center;">Nota</th>
              <th style="padding:10px 12px;font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--text-3);text-align:center;">Status</th>
            </tr>
          </thead>
          <tbody>${linhas}</tbody>
        </table>
      </div>
      <!-- Gráfico evolução do aluno (detalhe prof) -->
      <div style="border:1px solid var(--border);border-radius:12px;padding:16px 14px 10px;margin-bottom:16px;background:var(--bg-2);">
        <div style="font-size:11px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:var(--text-3);margin-bottom:10px;">Evolução das notas</div>
        <canvas id="boletim-detalhe-chart" style="width:100%;height:180px;display:block;"></canvas>
      </div>
      <button class="btn-secondary" onclick="Boletim.abrirBoletimProfessor('${dados.turma.id}')" style="width:100%;">← Voltar ao Boletim</button>
    `;
    window.App?.openModal(html);

    requestAnimationFrame(() => {
      const pontos = d.itens.map(i => ({
        label: i.titulo,
        valor: i.nota,
        max: i.valorMax,
      }));

      const linhaRef = d.itens.map(item => {
        const vals = dados.dadosAlunos
          .map(da => { const it = da.itens.find(x => x.exId === item.exId); return it?.nota != null ? (it.nota / it.valorMax) * 10 : null; })
          .filter(v => v != null);
        return vals.length ? +(vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : null;
      });
      _renderGrafico("boletim-detalhe-chart", pontos, linhaRef);
    });
  }

  function _exportarExcel() {
    const dados = window._boletimProfDados;
    if (!dados) return;

    try {

      const BOM = "\uFEFF";
      const exTitulos = dados.exercicios.map(e => `"${(e.title || e.name || "Ex").replace(/"/g, "'")}"`)
      const headers = ["Aluno", "Média Geral (/10)", "Exercícios Concluídos", ...dados.exercicios.map(e => (e.title || e.name || "Ex"))];

      const linhas = dados.dadosAlunos.map(({ aluno, itens, media, concluidos, total }) => {
        const notasCols = dados.exercicios.map(ex => {
          const item = itens.find(i => i.exId === ex.id);
          if (!item) return "";
          if (item.nota != null) return `${item.nota}/${item.valorMax}`;
          if (item.concluido) return "Concluído";
          return "Pendente";
        });
        return [
          `"${(aluno.username || "Aluno").replace(/"/g, "'")}"`,
          media != null ? media : "",
          `${concluidos}/${total}`,
          ...notasCols.map(n => `"${n}"`),
        ].join(";");
      });

      const csv = BOM + [headers.join(";"), ...linhas].join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const turmaName = (dados.turma.name || "turma").replace(/[^a-z0-9]/gi, "_");
      a.href = url;
      a.download = `boletim_${turmaName}_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast("Boletim exportado como CSV (abre no Excel)!", "success");
    } catch (e) {
      toast("Erro ao exportar: " + e.message, "error");
    }
  }

  function injectBoletimButton() {
    const observer = new MutationObserver(() => {
      const tabRow = document.querySelector(".turma-tabs-row");
      if (tabRow && !tabRow.querySelector(".btn-boletim")) {
        const btn = document.createElement("button");
        btn.className = "turma-tab-pill btn-boletim";
        btn.innerHTML = "Boletim";
        btn.onclick = () => {
          const appState = window.App?.getState?.() || window.App?.state;
          const turma = appState?.currentTurma;
          const user = appState?.user;
          if (!turma || !user) return;
          const isProfessor = user.role === "professor" && turma.professor_id === user.id;
          if (isProfessor) {
            abrirBoletimProfessor(turma.id);
          } else {
            abrirBoletimAluno(turma, user.id);
          }
        };
        tabRow.appendChild(btn);
        _injectCSS();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  function _injectCSS() {
    if (document.getElementById("boletim-styles")) return;
    const style = document.createElement("style");
    style.id = "boletim-styles";
    style.textContent = `
      #boletim-prof-modal table tr:hover td {
        background: rgba(255,255,255,.025);
      }
    `;
    document.head.appendChild(style);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", injectBoletimButton);
  } else {
    injectBoletimButton();
  }

  return {
    abrirBoletimAluno,
    abrirBoletimProfessor,
    _analisarComIA,
    _verDetalheAluno,
    _exportarExcel,
    injectBoletimButton,
  };
})();