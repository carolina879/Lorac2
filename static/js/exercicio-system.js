
window._ExercicioState = window._ExercicioState || {

  exercicios: JSON.parse(localStorage.getItem('ss_exercicios') || '{}'),
};

const API_BASE = "";

function _exSave() {
  try { localStorage.setItem('ss_exercicios', JSON.stringify(window._ExercicioState.exercicios)); } catch(e){}
}


async function _exFetchFromBackend(turmaId) {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000); 
    const response = await fetch(`${API_BASE}/api/turmas/${turmaId}/exercicios`, {
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!response.ok) {
      console.warn(`⚠️ Erro ao buscar exercícios do backend: ${response.status}`);
      return null;
    }
    const data = await response.json();
    
    
    const exercicios = {};
    (data.exercicios || []).forEach(ex => {
      exercicios[ex.id] = {
        id: ex.id,
        title: ex.title || ex.name || '',
        description: ex.description || '',
        questoes: ex.questions || ex.questoes || [],
        respostas: ex.respostas || {},
        deadline: ex.deadline || null,
        limTentativas: ex.limTentativas || 0,
        createdAt: typeof ex.createdAt === 'string' ? new Date(ex.createdAt).getTime() : (ex.createdAt || Date.now()),
      };
    });
    
    return exercicios;
  } catch (e) {
    if (e.name === 'AbortError') {
      console.warn('⏱️ Timeout ao buscar exercícios do backend — usando localStorage');
    } else {
      console.error('❌ Erro ao conectar backend:', e);
    }
    return null;
  }
}


async function _exSaveToBackend(turmaId, exercicio) {
  try {
    const payload = {
      title: exercicio.title,
      description: exercicio.description,
      questions: exercicio.questoes,
      deadline: exercicio.deadline,
      limTentativas: exercicio.limTentativas,
    };
    
    const response = await fetch(`${API_BASE}/api/turmas/${turmaId}/exercicios`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    
    if (!response.ok) {
      console.error(`❌ Erro ao salvar no backend: ${response.status}`);
      return false;
    }
    
    const data = await response.json();
    console.log('✅ Exercício salvo no backend:', data);
    return true;
  } catch (e) {
    console.error('❌ Erro ao enviar para backend:', e);
    return false;
  }
}


async function _exShareGlobally(turmaId, exId) {
  try {
    const response = await fetch(`${API_BASE}/api/turmas/${turmaId}/exercicios/${exId}/share`, {
      method: 'POST'
    });
    if (!response.ok) throw new Error();
    _exToast('✨ Exercício publicado no Banco Global!', 'success');
  } catch (e) {
    _exToast('Erro ao compartilhar exercício.', 'error');
  }
}

async function _exImportFromGlobal(turmaId, exercise) {
  const success = await _exSaveToBackend(turmaId, exercise);
  if (success) {
    _exToast('✅ Exercício importado!', 'success');
    _closeModal('modal-global-bank');
    renderExerciciosTabContent(turmaId);
  }
}

(function injectExStyles() {
  if (document.getElementById('ex-styles')) return;
  const style = document.createElement('style');
  style.id = 'ex-styles';
  style.textContent = `
   
    .sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }

    @keyframes spin { to { transform: rotate(360deg); } }
    
    .ex-container { padding: 8px 0 40px; }
    .ex-section-title { font-family: var(--font-display, serif); font-size: 26px; color: var(--text-0,#fff); margin-bottom: 20px; }
    .ex-section-label { font-size: 12px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: var(--text-2,#aaa); }
    .ex-empty { text-align: center; padding: 48px 24px; color: var(--text-2,#aaa); }
    .ex-empty-icon { font-size: 40px; margin-bottom: 12px; }

    .ex-prof-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
    .ex-prof-actions { display: flex; gap: 8px; }

    
    .ex-list { display: flex; flex-direction: column; gap: 14px; }
    .ex-card { background: var(--bg-2,#1e1c18); border: 1px solid var(--border,rgba(255,220,170,.08)); border-radius: 16px; padding: 20px; display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; transition: border-color .2s, background .2s; cursor: pointer; }
    .ex-card:hover { border-color: rgba(232,160,74,.35); background: rgba(232,160,74,.03); }
    .ex-card-left { display: flex; gap: 14px; align-items: flex-start; flex: 1; }
    .ex-card-num-badge { background: rgba(232,160,74,.12); color: var(--accent,#e8a04a); border: 1px solid rgba(232,160,74,.22); border-radius: 10px; padding: 6px 12px; font-size: 12px; font-weight: 600; white-space: nowrap; }
    .ex-card-info { flex: 1; }
    .ex-card-title { font-size: 16px; font-weight: 600; color: var(--text-0,#fff); margin-bottom: 4px; }
    .ex-card-desc { font-size: 13px; color: var(--text-2,#aaa); margin-bottom: 6px; }
    .ex-card-meta { font-size: 12px; color: var(--text-3,#666); margin-bottom: 6px; }
    .ex-card-actions { display: flex; gap: 8px; flex-shrink: 0; flex-wrap: wrap; align-items: center; }
    button.danger { background: rgba(220,60,60,.12) !important; color: #e07060 !important; border-color: rgba(220,60,60,.22) !important; }

    
    .ex-badge { display: inline-flex; align-items: center; font-size: 11px; font-weight: 600; padding: 3px 9px; border-radius: 100px; margin-top: 4px; }
    .ex-badge.pendente { background: rgba(200,160,80,.12); color: #c8a050; }
    .ex-badge.respondido { background: rgba(100,200,120,.12); color: #60c080; }
    .ex-badge.aguardando { background: rgba(80,140,220,.12); color: #70a0e0; }
    .ex-badge.corrigido { background: rgba(150,100,220,.12); color: #b070e0; }
    .ex-corrigir-badge { display: inline-flex; align-items: center; font-size: 11px; font-weight: 600; padding: 3px 9px; border-radius: 100px; background: rgba(220,120,60,.15); color: #e08040; border: 1px solid rgba(220,120,60,.25); }
    .ex-prof-stats { display: flex; gap: 10px; align-items: center; margin-top: 4px; font-size: 12px; color: var(--text-2,#aaa); flex-wrap: wrap; }

   
    .ex-modal-overlay { position: fixed !important; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,.75); z-index: 99999 !important; display: flex; align-items: center; justify-content: center; padding: 20px; overflow-y: auto; }
    .ex-modal-box { background: var(--bg-2,#1e1c18); border: 1px solid var(--border,rgba(255,220,170,.08)); border-radius: 20px; width: 100%; position: relative; display: flex; flex-direction: column; max-height: 90vh; overflow-y: auto; }
    .ex-modal-large { max-width: 680px; }
    .ex-modal-placar { max-width: 380px; text-align: center; padding: 40px 32px; border-radius: 24px; }
    .ex-modal-header { padding: 24px 28px 16px; border-bottom: 1px solid var(--border,rgba(255,220,170,.08)); display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; flex-shrink: 0; }
    .ex-modal-header h3 { font-family: var(--font-display,serif); font-size: 22px; color: var(--text-0,#fff); }
    .ex-modal-subtitle { font-size: 13px; color: var(--text-2,#aaa); margin-top: 4px; }
    .ex-modal-close { background: none; border: none; color: var(--text-2,#aaa); font-size: 20px; cursor: pointer; padding: 2px; line-height: 1; flex-shrink: 0; }
    .ex-modal-body { padding: 24px 28px; overflow-y: auto; flex: 1; }
    .ex-modal-footer { padding: 16px 28px; border-top: 1px solid var(--border,rgba(255,220,170,.08)); display: flex; justify-content: flex-end; gap: 10px; flex-shrink: 0; } .ex-modal-overlay .ex-modal-footer { display: flex; }

 
    .ex-field { margin-bottom: 16px; }
    .ex-field label { display: block; font-size: 11.5px; font-weight: 600; text-transform: uppercase; letter-spacing: .08em; color: var(--text-2,#aaa); margin-bottom: 6px; }
    .ex-input { width: 100%; background: var(--bg-3,#2a2820); border: 1px solid var(--border,rgba(255,220,170,.08)); border-radius: 10px; padding: 10px 13px; font-size: 14px; color: var(--text-0,#fff); outline: none; font-family: inherit; transition: border-color .2s; }
    .ex-input:focus { border-color: rgba(232,160,74,.35); }
    .ex-textarea { width: 100%; background: var(--bg-3,#2a2820); border: 1px solid var(--border,rgba(255,220,170,.08)); border-radius: 10px; padding: 10px 13px; font-size: 14px; color: var(--text-0,#fff); outline: none; font-family: inherit; resize: vertical; transition: border-color .2s; }
    .ex-textarea:focus { border-color: rgba(232,160,74,.35); }

    
    .ex-questoes-header { display: flex; align-items: center; justify-content: space-between; margin: 20px 0 12px; flex-wrap: wrap; gap: 10px; }
    .ex-questoes-list { display: flex; flex-direction: column; gap: 20px; }
    .ex-questao-editor { background: var(--bg-3,#2a2820); border: 1px solid var(--border,rgba(255,220,170,.08)); border-radius: 14px; padding: 18px; }
    .ex-q-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
    .ex-q-label { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; color: var(--accent,#e8a04a); }
    .ex-q-remove { background: none; border: none; color: var(--text-3,#666); font-size: 16px; cursor: pointer; padding: 2px; }
    .ex-q-remove:hover { color: #e07060; }
    .ex-q-enunciado { margin-bottom: 12px; }
    .ex-alternativas-list { display: flex; flex-direction: column; gap: 8px; margin-bottom: 10px; }
    .ex-alt-row { display: flex; align-items: center; gap: 8px; }
    .ex-radio { accent-color: var(--accent,#e8a04a); width: 16px; height: 16px; flex-shrink: 0; }
    .ex-alt-letra { width: 24px; height: 24px; border-radius: 50%; border: 1.5px solid var(--border,rgba(255,220,170,.15)); display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; color: var(--text-2,#aaa); flex-shrink: 0; }
    .ex-alt-input { flex: 1; }
    .ex-add-alt-btn { background: none; border: 1px dashed var(--border,rgba(255,220,170,.15)); border-radius: 8px; color: var(--text-2,#aaa); font-size: 12px; padding: 6px 12px; cursor: pointer; margin-top: 4px; }
    .ex-add-alt-btn:hover { border-color: var(--accent,#e8a04a); color: var(--accent,#e8a04a); }
    .ex-q-dica { font-size: 11px; color: var(--text-3,#666); margin-top: 8px; font-style: italic; }

 
    .ex-questoes-responder { display: flex; flex-direction: column; gap: 24px; }
    .ex-questao-responder { background: var(--bg-3,#2a2820); border: 1.5px solid var(--border,rgba(255,220,170,.08)); border-radius: 14px; padding: 20px; transition: border-color .3s; }
    .ex-questao-responder.correta { border-color: rgba(100,200,120,.4); background: rgba(100,200,120,.05); }
    .ex-questao-responder.errada { border-color: rgba(220,80,80,.4); background: rgba(220,80,80,.05); }
    .ex-q-num { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; color: var(--text-3,#666); margin-bottom: 4px; display: flex; align-items: center; gap: 8px; }
    .ex-q-tipo-badge { padding: 2px 8px; border-radius: 100px; font-size: 10px; font-weight: 600; }
    .ex-q-tipo-badge.marcar { background: rgba(232,160,74,.15); color: #e8a04a; }
    .ex-q-tipo-badge.escrever { background: rgba(80,140,220,.15); color: #6090d0; }
    .ex-q-enunciado-text { font-size: 15px; font-weight: 500; color: var(--text-0,#fff); margin-bottom: 16px; line-height: 1.5; }
    .ex-alts-responder { display: flex; flex-direction: column; gap: 8px; }
    .ex-alt-label { display: flex; align-items: center; gap: 10px; padding: 10px 14px; border-radius: 10px; border: 1.5px solid var(--border,rgba(255,220,170,.08)); cursor: pointer; transition: all .18s; font-size: 14px; color: var(--text-1,#ddd); }
    .ex-alt-label:not(.disabled):hover { border-color: rgba(232,160,74,.35); background: rgba(232,160,74,.06); }
    .ex-alt-label.disabled { cursor: default; }
    .ex-alt-label.alt-correta { border-color: rgba(100,200,120,.5) !important; background: rgba(100,200,120,.1) !important; color: #70e090 !important; }
    .ex-alt-label.alt-errada { border-color: rgba(220,80,80,.5) !important; background: rgba(220,80,80,.1) !important; color: #e07070 !important; }
    .ex-alt-label input[type=radio] { accent-color: var(--accent,#e8a04a); width: 16px; height: 16px; flex-shrink: 0; }
    .ex-alt-letra-badge { width: 24px; height: 24px; border-radius: 50%; border: 1.5px solid currentColor; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; flex-shrink: 0; opacity: .7; }
    .ex-certo-icon { margin-left: auto; font-weight: 700; color: #60d080; }
    .ex-errado-icon { margin-left: auto; font-weight: 700; color: #e07070; }
    .ex-feedback { margin-top: 12px; padding: 10px 14px; border-radius: 10px; font-size: 13.5px; font-weight: 500; }
    .feedback-certo { background: rgba(100,200,120,.12); color: #70e090; border: 1px solid rgba(100,200,120,.25); }
    .feedback-errado { background: rgba(220,80,80,.1); color: #e07070; border: 1px solid rgba(220,80,80,.22); }
    .ex-resp-textarea { margin-top: 8px; }
    .ex-correcao-box { margin-top: 10px; background: rgba(150,100,220,.08); border: 1px solid rgba(150,100,220,.2); border-radius: 10px; padding: 12px; }
    .ex-correcao-nota { font-size: 14px; font-weight: 600; color: #b070e0; margin-bottom: 4px; }
    .ex-correcao-comentario { font-size: 13px; color: var(--text-1,#ddd); margin-top: 4px; }
    .ex-aguardando-badge { margin-top: 10px; font-size: 12px; color: #70a0e0; font-style: italic; }

   
    .ex-placar-final { background: var(--bg-3,#2a2820); border: 1px solid var(--border,rgba(255,220,170,.1)); border-radius: 16px; padding: 20px; margin-bottom: 24px; text-align: center; }
    .ex-placar-emoji { font-size: 36px; margin-bottom: 8px; }
    .ex-placar-label { font-size: 12px; text-transform: uppercase; letter-spacing: .08em; color: var(--text-2,#aaa); margin-bottom: 6px; }
    .ex-placar-num { font-size: 32px; font-weight: 700; color: var(--text-0,#fff); }
    .ex-placar-pct { font-size: 16px; color: var(--text-2,#aaa); font-weight: 400; }
    .ex-placar-bar { background: var(--bg-4,#333); border-radius: 100px; height: 8px; margin-top: 12px; overflow: hidden; }
    .ex-placar-bar-fill { height: 100%; background: linear-gradient(90deg, #e8a04a, #c96a4a); border-radius: 100px; transition: width .6s ease; }

    .ex-placar-big-emoji { font-size: 60px; margin-bottom: 16px; }
    .ex-placar-big-titulo { font-size: 14px; color: var(--text-2,#aaa); margin-bottom: 12px; }
    .ex-placar-big-num { font-family: var(--font-display,serif); font-size: 52px; font-weight: 700; color: var(--accent,#e8a04a); }
    .ex-placar-big-num span { font-size: 28px; color: var(--text-2,#aaa); }
    .ex-placar-big-msg { font-size: 18px; font-weight: 600; color: var(--text-0,#fff); margin: 12px 0; }
    .ex-placar-big-pct-bar { background: var(--bg-3,#2a2820); border-radius: 100px; height: 10px; margin: 16px 0 6px; overflow: hidden; }
    .ex-placar-big-fill { height: 100%; background: linear-gradient(90deg,#e8a04a,#c96a4a); border-radius: 100px; transition: width .8s ease; }
    .ex-placar-big-pct-text { font-size: 13px; color: var(--text-2,#aaa); margin-bottom: 24px; }
    .ex-placar-btn-fechar { width: 100%; padding: 13px; margin-top: 8px; }

    .ex-resultado-aluno-card { background: var(--bg-3,#2a2820); border: 1px solid var(--border,rgba(255,220,170,.08)); border-radius: 14px; padding: 18px; margin-bottom: 16px; }
    .ex-resultado-aluno-header { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 12px; flex-wrap: wrap; }
    .ex-resultado-aluno-avatar { width: 38px; height: 38px; border-radius: 50%; background: var(--accent,#e8a04a); color: #0f0d0a; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 15px; flex-shrink: 0; }
    .ex-resultado-aluno-info { flex: 1; }
    .ex-resultado-aluno-nome { font-size: 15px; font-weight: 600; color: var(--text-0,#fff); }
    .ex-resultado-aluno-data { font-size: 12px; color: var(--text-3,#666); margin-top: 2px; }
    .ex-resultado-badges { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
    .ex-resultado-score { font-size: 13px; font-weight: 700; padding: 4px 12px; border-radius: 100px; }
    .score-bom { background: rgba(100,200,120,.12); color: #60d080; }
    .score-ruim { background: rgba(220,80,80,.1); color: #e07070; }
    .ex-resultado-disc-section { border-top: 1px solid var(--border,rgba(255,220,170,.08)); padding-top: 14px; display: flex; flex-direction: column; gap: 16px; }
    .ex-resultado-disc-item { background: var(--bg-2,#1e1c18); border-radius: 10px; padding: 14px; }
    .ex-resultado-disc-q { font-size: 13px; color: var(--text-2,#aaa); margin-bottom: 6px; }
    .ex-resultado-disc-resp { font-size: 14px; color: var(--text-0,#fff); background: var(--bg-3,#2a2820); border-radius: 8px; padding: 10px; margin-bottom: 10px; border-left: 3px solid rgba(232,160,74,.3); line-height: 1.5; }
    .ex-resultado-disc-corrigido { font-size: 13px; color: #b070e0; padding: 8px; background: rgba(150,100,220,.07); border-radius: 8px; }
    .ex-corrigir-form { display: flex; flex-direction: column; gap: 8px; }
    .ex-nota-input { max-width: 140px; }
    .ex-comentario-input { }
  `;
  (document.head || document.documentElement).appendChild(style);
})();


function _exGet(turmaId) {
  return window._ExercicioState.exercicios[turmaId] || {};
}

function _exGetOne(turmaId, exId) {
  return (_exGet(turmaId))[exId] || null;
}

function _exSet(turmaId, exId, data) {
  if (!window._ExercicioState.exercicios[turmaId]) window._ExercicioState.exercicios[turmaId] = {};
  window._ExercicioState.exercicios[turmaId][exId] = data;
  _exSave();
}

function _genId() { return Date.now().toString(36) + Math.random().toString(36).slice(2,7); }

async function renderExerciciosTabContent(turmaIdParam) {
  const panel = document.getElementById('turma-tab-exercicios');
  if (!panel) {
    console.error('❌ Painel #turma-tab-exercicios não encontrado no DOM');
    return;
  }

  const _s = _getAppState() || {};
  const turmaId = turmaIdParam || _s.currentTurma?.id || window.__currentTurmaId__;
  let user = _s.user;

 
  if (!user) { try { user = JSON.parse(localStorage.getItem('studysync_user')); } catch(e){} }

  if (!turmaId || !user) {
    console.warn('⚠️ Erro de renderização: Usuário ou Turma não identificados.');
    panel.innerHTML = '<div class="ex-container"><div class="ex-empty"><div class="ex-empty-icon">⚠️</div><p>Sessão inválida. Recarregue a página.</p></div></div>';
    return;
  }

  
  panel.innerHTML = '<div class="ex-container" style="display:flex;align-items:center;justify-content:center;padding:60px 0;gap:12px;color:var(--text-2,#aaa)"><span style="font-size:20px;animation:spin 1s linear infinite;display:inline-block">⏳</span> Carregando exercícios...</div>';

  console.log(`📖 Renderizando exercícios para turma: ${turmaId}`);

  
  let exMap = await _exFetchFromBackend(turmaId);
  
  
  if (!exMap) {
    console.log('📦 Usando localStorage como fallback');
    exMap = _exGet(turmaId);
  } else {
    console.log('🌐 Exercícios carregados do backend');
   
    const localTurma = window._ExercicioState.exercicios[turmaId] || {};
    Object.keys(exMap).forEach(id => {
      if (localTurma[id] && localTurma[id].respostas) {
        exMap[id].respostas = { ...exMap[id].respostas, ...localTurma[id].respostas };
      }
    });
    window._ExercicioState.exercicios[turmaId] = exMap;
    _exSave();
  }

  const isProfessor = user?.role === 'professor';
  const isOwner = isProfessor && (_s.currentTurma?.professor_id === user?.id);

  const exercicios = Object.values(exMap).sort((a, b) => b.createdAt - a.createdAt);
  
  console.log(`📊 Total de exercícios encontrados: ${exercicios.length}`);

  let html = `<div class="ex-container">`;

  if (isProfessor) {
    html += `
      <div class="ex-prof-header">
        <h2 class="ex-section-title">📝 Exercícios</h2>
        <div class="ex-prof-actions">
          <button class="btn-secondary" onclick="ExSys.openGlobalBank('${turmaId}')" style="margin-right: 8px;">
            🌐 Banco Global
          </button>
          ${isOwner ? `
          <button class="btn-primary" onclick="ExSys.openCreateExercicio('${turmaId}')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Novo Exercício
          </button>` : ''}
        </div>
      </div>
    `;
  } else {
    html += `<h2 class="ex-section-title">📝 Exercícios</h2>`;
  }

  if (!exercicios.length) {
    html += `<div class="ex-empty"><div class="ex-empty-icon">📝</div><p>Nenhum exercício disponível ainda.</p></div>`;
  } else {
    html += `<div class="ex-list">`;
    exercicios.forEach(ex => {
      const totalQ = ex.questoes.length;
      const respostasAluno = ex.respostas?.[user.id];
      const attempts = respostasAluno?.tentativas || 0;
      const respondeu = !!respostasAluno?.concluido;

     
      let acertos = 0, totalMarcar = 0;
      if (respondeu) {
        ex.questoes.forEach((q, qi) => {
          if (q.tipo === 'marcar') {
            totalMarcar++;
            if (respostasAluno.respostas?.[qi]?.correta) acertos++;
          }
        });
      }

  
      const now = new Date();
      const deadlineDate = ex.deadline ? new Date(ex.deadline) : null;
      const isExpired = deadlineDate && now > deadlineDate;
      const deadlineFmt = deadlineDate ? deadlineDate.toLocaleDateString('pt-BR') + ' ' + deadlineDate.toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'}) : 'Sem prazo';

      
      let badge = '';
      if (respondeu) {
        const totalDisc = ex.questoes.filter(q => q.tipo === 'escrever').length;
        const corrigidasCount = ex.questoes.filter((q, qi) => q.tipo === 'escrever' && respostasAluno.respostas?.[qi]?.nota !== undefined).length;
        if (totalDisc > 0 && corrigidasCount < totalDisc) {
          badge = `<span class="ex-badge aguardando">Aguardando correção</span>`;
        } else if (totalDisc > 0) {
          badge = `<span class="ex-badge corrigido">Corrigido</span>`;
        } else {
          badge = `<span class="ex-badge respondido">Respondido</span>`;
        }
      } else {
        badge = `<span class="ex-badge pendente">Pendente</span>`;
      }

     
      let profInfo = '';
      if (isProfessor) {
        const respondidos = Object.values(ex.respostas || {}).filter(r => r.concluido).length;
        const totalDisc = ex.questoes.filter(q => q.tipo === 'escrever').length;
        const paraCorrigir = Object.values(ex.respostas || {}).filter(r => {
          return r.concluido && ex.questoes.some((q, qi) => q.tipo === 'escrever' && r.respostas?.[qi]?.nota === undefined);
        }).length;
        profInfo = `
          <div class="ex-prof-stats">
            <span>👥 ${respondidos} respondeu${respondidos !== 1 ? 'ram' : ''}</span>
            ${totalDisc > 0 && paraCorrigir > 0 ? `<span class="ex-corrigir-badge">✏️ ${paraCorrigir} para corrigir</span>` : ''}
          </div>
        `;
      }

      
      const cardOnClick = isProfessor
        ? `ExSys.openResultados('${turmaId}','${ex.id}')`
        : `ExSys.openResponder('${turmaId}','${ex.id}')`;

      html += `
        <div class="ex-card" onclick="event.stopPropagation(); ${cardOnClick}" title="${isProfessor ? 'Ver resultados' : (respondeu ? 'Ver suas respostas' : 'Responder exercício')}">
          <div class="ex-card-left">
            <div class="ex-card-num-badge">${totalQ} questão${totalQ !== 1 ? 'ões' : ''}</div>
            <div class="ex-card-info">
              <div class="ex-card-title">${_escHtml(ex.title)}</div>
              ${ex.description ? `<div class="ex-card-desc">${_escHtml(ex.description)}</div>` : ''}
              <div class="ex-card-meta">
                📅 ${new Date(ex.createdAt).toLocaleDateString('pt-BR')}
                &nbsp;·&nbsp;
                ${ex.questoes.filter(q=>q.tipo==='marcar').length} marcar
                &nbsp;·&nbsp;
                ${ex.questoes.filter(q=>q.tipo==='escrever').length} escrever
              </div>
              ${!isProfessor ? badge : profInfo}
            </div>
          </div>
          <div class="ex-card-actions" onclick="event.stopPropagation()">
            ${isProfessor ? `
              <button class="btn-secondary small" onclick="ExSys.exportPdf('${turmaId}','${ex.id}')">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                PDF
              </button>
              <button class="btn-secondary small" onclick="ExSys.openResultados('${turmaId}','${ex.id}')">
                📊 Resultados
              </button>
              <button class="btn-secondary small danger" onclick="ExSys.deleteExercicio('${turmaId}','${ex.id}')">
                🗑️
              </button>
            ` : `
              <button class="btn-primary small" onclick="ExSys.openResponder('${turmaId}','${ex.id}')">
                ${respondeu ? '👁️ Ver Respostas' : '✏️ Responder'}
              </button>
            `}
          </div>
        </div>
      `;
    });
    html += `</div>`;
  }

  html += `</div>`;
  panel.innerHTML = html + getExStyles();
  
  console.log(`✅ Renderização completa! ${exercicios.length} exercícIos exibidos.`);
}


function openCreateExercicio(turmaId, initialData = null) {
  turmaId = turmaId || _getTurmaId();
  if (!turmaId) { _exToast('Turma não encontrada.', 'error'); return; }

  const modalId = 'modal-criar-exercicio';
  let modal = document.getElementById(modalId);
  if (modal) modal.remove();

  
  let draft = null;
  if (initialData) {
    if (typeof initialData === 'string') {
      draft = _exGetOne(turmaId, initialData);
    } else {
      draft = initialData;
    }
  }

  const html = `
    <div id="${modalId}" class="ex-modal-overlay" onclick="ExSys._closeOnOverlay(event,'${modalId}')">
      <div class="ex-modal-box ex-modal-large">
        <div class="ex-modal-header">
          <h3>📝 Criar Exercício</h3>
          <button class="ex-modal-close" onclick="ExSys._closeModal('${modalId}')">✕</button>
        </div>

        <div class="ex-modal-body">
          <div class="ex-field">
            <label for="ex-create-title">Título do exercício</label>
            <input id="ex-create-title" name="ex-create-title" type="text" placeholder="Ex: Lista 1 – Equações" class="ex-input" value="${draft ? _escHtml(draft.title) : ''}" />
          </div>
          <div class="ex-field">
            <label for="ex-create-desc">Descrição (opcional)</label>
            <textarea id="ex-create-desc" name="ex-create-desc" placeholder="Instruções gerais..." class="ex-textarea" rows="2">${draft ? _escHtml(draft.description) : ''}</textarea>
          </div>
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px; margin-bottom:20px;">
            <div class="ex-field">
              <label for="ex-create-deadline">Prazo de Entrega</label>
              <input id="ex-create-deadline" type="datetime-local" class="ex-input" />
            </div>
            <div class="ex-field">
              <label for="ex-create-attempts">Limite de Tentativas</label>
              <input id="ex-create-attempts" type="number" min="0" value="0" placeholder="0 = Ilimitado" class="ex-input" />
            </div>
          </div>

          <div class="ex-questoes-header">
            <span class="ex-section-label">Questões</span>
            <div style="display:flex;gap:8px">
              <button class="btn-secondary small" onclick="ExSys._addQuestao('marcar')">
                ＋ Marcar (múltipla escolha)
              </button>
              <button class="btn-secondary small" onclick="ExSys._toggleAIGenerator()">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                Gerar com IA
              </button>
              <button class="btn-secondary small" onclick="ExSys._addQuestao('escrever')">
                ＋ Escrever (dissertativa)
              </button>
            </div>
          </div>

          <div id="ex-questoes-list" class="ex-questoes-list"></div>

         
          <div id="ex-ai-generator-section" style="display:none; margin-top:20px; padding-top:20px; border-top:1px solid var(--border);">
            <h4 class="ex-section-label" style="margin-bottom:15px;">🤖 Gerar Questões com IA</h4>
            <div class="ex-field">
              <label for="ex-ai-tema">Tema ou Texto Base</label>
              <textarea id="ex-ai-tema" class="ex-textarea" rows="4" placeholder="Ex: Revolução Francesa, Leis de Newton, ou cole um texto completo..."></textarea>
            </div>
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px; margin-bottom:16px;">
              <div class="ex-field">
                <label for="ex-ai-tipo">Tipo de Questão</label>
                <select id="ex-ai-tipo" class="ex-input">
                  <option value="marcar">Múltipla Escolha</option>
                  <option value="escrever">Dissertativa</option>
                </select>
              </div>
              <div class="ex-field">
                <label for="ex-ai-qtd">Quantidade</label>
                <input id="ex-ai-qtd" type="number" min="1" max="10" value="3" class="ex-input" />
              </div>
            </div>
            <div id="ex-ai-loading" style="display:none; text-align:center; padding:15px; color:var(--text-2);">
              <span style="font-size:20px;animation:spin 1s linear infinite;display:inline-block">⏳</span> Gerando...
            </div>
            <div id="ex-ai-error" style="display:none; color:#e07060; font-size:13px; text-align:center; padding:10px; background:rgba(224,112,96,0.1); border-radius:8px;"></div>
            <div id="ex-ai-generated-preview" style="margin-top:15px; border-top:1px dashed var(--border); padding-top:15px; display:none;">
              <h5 class="ex-section-label" style="margin-bottom:10px;">Questões Geradas</h5>
              <div id="ex-ai-preview-list" class="ex-questoes-list" style="gap:10px;"></div>
              <div style="display:flex; gap:10px; margin-top:15px;">
                <button class="btn-secondary" onclick="ExSys._clearAIGenerated()">Limpar</button>
                <button class="btn-primary" onclick="ExSys._addAIGeneratedToExercise()">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  Adicionar ao Exercício
                </button>
              </div>
            </div>
            <button class="btn-primary" onclick="ExSys._gerarQuestoesIA()" style="width:100%; margin-top:15px;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
              Gerar Questões
            </button>
          </div>
        </div>

        <div class="ex-modal-footer">
          <button class="btn-secondary" onclick="ExSys._closeModal('${modalId}')">Cancelar</button>
          <button class="btn-primary" onclick="ExSys._salvarExercicio('${turmaId}')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17,21 17,13 7,13"/><polyline points="7,3 7,8 15,8"/></svg>
            Salvar Exercício
          </button>
        </div>
      </div>
    </div>
  `;

  _showModal(html);

  if (draft) {
    
    window._exQuestoes = JSON.parse(JSON.stringify(draft.questoes || []));
    requestAnimationFrame(() => {
      window._exQuestoes.forEach((_, i) => _renderQuestaoEditor(i));
    });
  } else {
  
    document.getElementById('ex-ai-tema').value = '';
    document.getElementById('ex-ai-qtd').value = '3';
    document.getElementById('ex-ai-tipo').value = 'marcar';
    window._exQuestoes = [];
  }
}

let _qIndex = 0;
function _addQuestao(tipo) {
  window._exQuestoes = window._exQuestoes || [];
  const idx = window._exQuestoes.length;
  const q = { tipo, enunciado: '', alternativas: tipo === 'marcar' ? ['','','',''] : [], correta: 0, valor: 1 };
  if (tipo === 'escrever') q.valor = 10; 
  window._exQuestoes.push(q);
  _renderQuestaoEditor(idx);
}

function _renderQuestaoEditor(idx) {
  const container = document.getElementById('ex-questoes-list');
  if (!container) return;
  const q = window._exQuestoes[idx];
  if (!q) return;

  const qDiv = document.createElement('div');
  qDiv.className = 'ex-questao-editor';
  qDiv.id = `ex-q-${idx}`;
  qDiv.dataset.idx = idx;

  if (q.tipo === 'marcar') {
    qDiv.innerHTML = `
      <div style="float:right; width:100px;">
        <label style="font-size:10px;">Pontos</label>
        <input type="number" step="0.1" value="${q.valor||1}" class="ex-input" 
          oninput="ExSys._updateValor(${idx}, this.value)" style="padding:4px 8px; font-size:12px;" />
      </div>
      <div class="ex-q-header">
        <span class="ex-q-label">Questão ${idx+1} — Múltipla Escolha</span>
        <button class="ex-q-remove" onclick="ExSys._removeQuestao(${idx})">✕</button>
      </div>
      <label for="ex-q-enunciado-${idx}" class="sr-only">Enunciado da questão ${idx+1}</label>
      <textarea id="ex-q-enunciado-${idx}" name="ex-q-enunciado-${idx}" class="ex-textarea ex-q-enunciado" placeholder="Enunciado da questão..." rows="2"
        oninput="ExSys._updateEnunciado(${idx},this.value)">${_escHtml(q.enunciado)}</textarea>
      <div class="ex-alternativas-list" id="ex-alts-${idx}">
        ${q.alternativas.map((alt, ai) => `
          <div class="ex-alt-row">
            <input type="radio" id="ex-radio-${idx}-${ai}" name="ex-correta-${idx}" value="${ai}" ${q.correta===ai?'checked':''}
              onchange="ExSys._setCorreta(${idx},${ai})" class="ex-radio" />
            <label for="ex-radio-${idx}-${ai}" class="ex-alt-letra">${String.fromCharCode(65+ai)}</label>
            <label for="ex-alt-input-${idx}-${ai}" class="sr-only">Texto da alternativa ${String.fromCharCode(65+ai)}</label>
            <input type="text" id="ex-alt-input-${idx}-${ai}" name="ex-alt-input-${idx}-${ai}" class="ex-input ex-alt-input" placeholder="Alternativa ${String.fromCharCode(65+ai)}..."
              value="${_escHtml(alt)}" oninput="ExSys._updateAlt(${idx},${ai},this.value)" />
          </div>
        `).join('')}
      </div>
      <button class="ex-add-alt-btn" onclick="ExSys._addAlt(${idx})">＋ Adicionar alternativa</button>
      <div class="ex-q-dica">☝️ Marque o rádio da alternativa correta.</div>
    `;
  } else {
    qDiv.innerHTML = `
      <div style="float:right; width:100px;">
        <label style="font-size:10px;">Pontos</label>
        <input type="number" step="0.1" value="${q.valor||1}" class="ex-input" 
          oninput="ExSys._updateValor(${idx}, this.value)" style="padding:4px 8px; font-size:12px;" />
      </div>
      <div class="ex-q-header">
        <span class="ex-q-label">Questão ${idx+1} — Dissertativa</span>
        <button class="ex-q-remove" onclick="ExSys._removeQuestao(${idx})">✕</button>
      </div>
      <label for="ex-q-enunciado-${idx}" class="sr-only">Enunciado da questão ${idx+1}</label>
      <textarea id="ex-q-enunciado-${idx}" name="ex-q-enunciado-${idx}" class="ex-textarea ex-q-enunciado" placeholder="Enunciado da questão..." rows="2"
        oninput="ExSys._updateEnunciado(${idx},this.value)">${_escHtml(q.enunciado)}</textarea>
      <div class="ex-q-dica">✏️ O aluno responderá com texto livre. Você corrige depois.</div>
    `;
  }

  container.appendChild(qDiv);
}

function _updateEnunciado(idx, val) {
  if (window._exQuestoes?.[idx]) window._exQuestoes[idx].enunciado = val;
}
function _updateValor(idx, val) {
  if (window._exQuestoes?.[idx]) window._exQuestoes[idx].valor = parseFloat(val) || 0;
}
function _updateAlt(idx, ai, val) {
  if (window._exQuestoes?.[idx]) window._exQuestoes[idx].alternativas[ai] = val;
}
function _setCorreta(idx, ai) {
  if (window._exQuestoes?.[idx]) window._exQuestoes[idx].correta = ai;
}
function _addAlt(idx) {
  if (!window._exQuestoes?.[idx]) return;
  window._exQuestoes[idx].alternativas.push('');
  
  const container = document.getElementById(`ex-alts-${idx}`);
  if (container) {
    const alts = window._exQuestoes[idx].alternativas;
    container.innerHTML = alts.map((alt, ai) => `
      <div class="ex-alt-row">
        <input type="radio" id="ex-radio-${idx}-${ai}" name="ex-correta-${idx}" value="${ai}" ${window._exQuestoes[idx].correta===ai?'checked':''}
          onchange="ExSys._setCorreta(${idx},${ai})" class="ex-radio" />
        <label for="ex-radio-${idx}-${ai}" class="ex-alt-letra">${String.fromCharCode(65+ai)}</label>
        <label for="ex-alt-input-${idx}-${ai}" class="sr-only">Texto da alternativa ${String.fromCharCode(65+ai)}</label>
        <input type="text" id="ex-alt-input-${idx}-${ai}" name="ex-alt-input-${idx}-${ai}" class="ex-input ex-alt-input" placeholder="Alternativa ${String.fromCharCode(65+ai)}..."
          value="${_escHtml(alt)}" oninput="ExSys._updateAlt(${idx},${ai},this.value)" />
      </div>
    `).join('');
  }
}
function _removeQuestao(idx) {
  if (!window._exQuestoes) return;
  window._exQuestoes.splice(idx, 1);
  
  const container = document.getElementById('ex-questoes-list');
  if (container) container.innerHTML = '';
  window._exQuestoes.forEach((_, i) => _renderQuestaoEditor(i));
}

function _salvarExercicio(turmaId) {
  const title = document.getElementById('ex-create-title')?.value.trim();
  const desc = document.getElementById('ex-create-desc')?.value.trim();
  const deadline = document.getElementById('ex-create-deadline')?.value;
  const limTentativas = parseInt(document.getElementById('ex-create-attempts')?.value) || 0;

  if (!title) { _exToast('Digite um título para o exercício.', 'error'); return; }

  const questoes = window._exQuestoes || [];
  if (!questoes.length) { _exToast('Adicione pelo menos uma questão.', 'error'); return; }

  for (let i = 0; i < questoes.length; i++) {
    const q = questoes[i];
    if (!(q.enunciado || '').trim()) { _exToast(`Questão ${i+1} está sem enunciado.`, 'error'); return; }
    if (q.tipo === 'marcar') {
      const altsValidas = q.alternativas.filter(a => a.trim());
      if (altsValidas.length < 2) { _exToast(`Questão ${i+1}: adicione pelo menos 2 alternativas.`, 'error'); return; }
    }
  }

  const exId = _genId();
  const exercicio = {
    id: exId,
    title,
    description: desc,
    deadline,
    limTentativas,
    questoes,
    respostas: {},
    createdAt: Date.now(),
  };

  
  _exSet(turmaId, exId, exercicio);
  
  
  _closeModal('modal-criar-exercicio');
  
 
  _exToast('✅ Exercício criado com sucesso!', 'success');
  
 
  setTimeout(async () => {
    await renderExerciciosTabContent(turmaId);
  }, 200);
  
  
  _exSaveToBackend(turmaId, exercicio).then(success => {
    if (success) {
      _exToast('✅ Sincronizado com servidor!', 'success');
     
      setTimeout(() => renderExerciciosTabContent(turmaId), 300);
    } else {
      _exToast('⚠️ Salvo localmente, mas falha na sincronização com servidor.', 'warning');
    }
  }).catch(err => {
    console.error('Erro ao sincronizar:', err);
  });
}

let _aiGeneratedQuestions = [];

function _toggleAIGenerator() {
  const section = document.getElementById('ex-ai-generator-section');
  if (section) {
    section.style.display = section.style.display === 'none' ? 'block' : 'none';
    
    if (section.style.display === 'none') {
      _clearAIGenerated();
    }
  }
}

async function _gerarQuestoesIA() {
  const tema = document.getElementById('ex-ai-tema')?.value.trim();
  const tipo = document.getElementById('ex-ai-tipo')?.value;
  const qtd = parseInt(document.getElementById('ex-ai-qtd')?.value) || 3;

  if (!tema) { _exToast('Digite um tema ou cole um texto para a IA gerar questões.', 'error'); return; }
  if (qtd < 1 || qtd > 10) { _exToast('A quantidade de questões deve ser entre 1 e 10.', 'error'); return; }

  const loadingEl = document.getElementById('ex-ai-loading');
  const errorEl = document.getElementById('ex-ai-error');
  const previewSection = document.getElementById('ex-ai-generated-preview');
  const previewList = document.getElementById('ex-ai-preview-list');

  if (loadingEl) loadingEl.style.display = 'block';
  if (errorEl) errorEl.style.display = 'none';
  if (previewSection) previewSection.style.display = 'none';
  if (previewList) previewList.innerHTML = '';

  try {
    const prompt = `Gere ${qtd} questões de ${tipo === 'marcar' ? 'múltipla escolha (com 4 alternativas e indicando a correta)' : 'dissertativas'} sobre o seguinte tema/texto: "${tema}". Responda APENAS com um array JSON de objetos, sem texto adicional. Cada questão deve ter 'enunciado', 'tipo', e se for múltipla escolha, 'alternativas' (array de strings) e 'correta' (índice da alternativa correta, 0-3).`;

    const res = await fetch(`${API_BASE}/api/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: prompt, context: 'Você é um professor que gera questões para exercícios.' })
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || `Erro ${res.status} ao gerar questões.`);
    }

    const data = await res.json();
    let generated = [];
    try {
     
      const jsonString = data.response.match(/\[[\s\S]*\]/)?.[0];
      generated = JSON.parse(jsonString || data.response);
    } catch (parseError) {
      console.error('Erro ao parsear JSON da IA:', parseError, data.response);
      throw new Error('A IA retornou um formato inesperado. Tente novamente.');
    }

    _aiGeneratedQuestions = generated.map(q => {
     
      const newQ = {
        tipo: q.tipo || tipo,
        enunciado: q.enunciado || '',
        valor: q.tipo === 'escrever' ? 10 : 1,
      };
      if (newQ.tipo === 'marcar') {
        newQ.alternativas = q.alternativas || ['', '', '', ''];
        newQ.correta = q.correta !== undefined ? q.correta : 0;
      }
      return newQ;
    });

    if (_aiGeneratedQuestions.length === 0) {
      throw new Error('A IA não conseguiu gerar questões. Tente um tema diferente ou mais específico.');
    }

    if (previewList) {
      previewList.innerHTML = _aiGeneratedQuestions.map((q, i) => `
        <div class="ex-questao-editor" style="padding:12px; border-color:rgba(80,140,220,.2); background:rgba(80,140,220,.05);">
          <div class="ex-q-header" style="margin-bottom:8px;">
            <span class="ex-q-label" style="color:#6090d0;">Questão Gerada ${i+1} — ${q.tipo === 'marcar' ? 'Múltipla Escolha' : 'Dissertativa'}</span>
          </div>
          <div class="ex-q-enunciado-text" style="font-size:14px; margin-bottom:10px;">${_escHtml(q.enunciado)}</div>
          ${q.tipo === 'marcar' ? `
            <div class="ex-alternativas-list" style="gap:4px;">
              ${q.alternativas.map((alt, ai) => `
                <div style="display:flex; align-items:center; gap:6px; font-size:13px; color:var(--text-1); ${ai === q.correta ? 'font-weight:600; color:#70e090;' : ''}">
                  <span style="width:20px; text-align:center;">${String.fromCharCode(65+ai)}.</span> ${_escHtml(alt)}
                  ${ai === q.correta ? '<span style="margin-left:auto; color:#70e090;">✓</span>' : ''}
                </div>
              `).join('')}
            </div>
          ` : ''}
        </div>
      `).join('');
      previewSection.style.display = 'block';
    }
    _exToast('✅ Questões geradas com sucesso!', 'success');

  } catch (e) {
    console.error('Erro ao gerar questões com IA:', e);
    if (errorEl) { errorEl.textContent = e.message; errorEl.style.display = 'block'; }
    _exToast('❌ Erro ao gerar questões.', 'error');
  } finally {
    if (loadingEl) loadingEl.style.display = 'none';
  }
}

function _addAIGeneratedToExercise() {
  _aiGeneratedQuestions.forEach(q => {
    window._exQuestoes.push(q);
    _renderQuestaoEditor(window._exQuestoes.length - 1);
  });
  _clearAIGenerated();
  _exToast('✅ Questões adicionadas ao exercício!', 'success');
}

function _clearAIGenerated() {
  _aiGeneratedQuestions = [];
  document.getElementById('ex-ai-generated-preview').style.display = 'none';
  document.getElementById('ex-ai-preview-list').innerHTML = '';
  document.getElementById('ex-ai-tema').value = '';
}

function openResponder(turmaId, exId) {
  const ex = _exGetOne(turmaId, exId);
  const user = _getUser();
  if (!ex || !user) return;

  const modalId = 'modal-responder-exercicio';
  let modal = document.getElementById(modalId);
  if (modal) modal.remove();

  const userResp = (ex.respostas || {})[user.id] || {};
  const jaConcluido = !!userResp.concluido;
  const tentativasFeitas = parseInt(userResp.tentativas) || 0;
  const limTentativas = ex.limTentativas || 0;
  
  const agora = new Date();
  const prazo = ex.deadline ? new Date(ex.deadline) : null;
  const prazoExpirado = prazo && agora > prazo;
  const semTentativas = limTentativas > 0 && tentativasFeitas >= limTentativas;
  
  const bloqueado = prazoExpirado || semTentativas;
  const respostasAntigas = userResp.respostas || {};

  let questoesHtml = '';
  ex.questoes.forEach((q, qi) => {
    const respAnterior = respostasAntigas[qi];
    if (q.tipo === 'marcar') {
     
      const mostrarFeedback = jaConcluido && respAnterior !== undefined;
      const selecionada = respAnterior?.escolha;

      questoesHtml += `
        <div class="ex-questao-responder ${mostrarFeedback ? (respAnterior.correta ? 'correta' : 'errada') : ''}" id="ex-resp-q-${qi}">
          <div class="ex-q-num">Questão ${qi+1} <span class="ex-q-tipo-badge marcar">Marcar</span> <span style="margin-left:auto; color:var(--accent)">${q.valor||1} pts</span></div>
          <div class="ex-q-enunciado-text">${_escHtml(q.enunciado)}</div>
          <div class="ex-alts-responder">
            ${q.alternativas.map((alt, ai) => {
              let cls = '';
              const isSelected = selecionada === ai;
              if (mostrarFeedback) {
                if (ai === q.correta) cls = 'alt-correta';
                else if (ai === respAnterior?.escolha && !respAnterior.correta) cls = 'alt-errada';
              }
              return `
                <label for="ex-resp-${qi}-${ai}" class="ex-alt-label ${cls} ${bloqueado ? 'disabled' : ''}">
                  <input type="radio" id="ex-resp-${qi}-${ai}" name="ex-resp-${qi}" value="${ai}"
                    ${isSelected ? 'checked' : ''}
                    ${bloqueado ? 'disabled' : ''}
                    onchange="ExSys._responderMarcar('${turmaId}','${exId}',${qi},${ai})" />
                  <span class="ex-alt-letra-badge">${String.fromCharCode(65+ai)}</span>
                  <span>${_escHtml(alt)}</span>
                  ${mostrarFeedback && ai === q.correta ? '<span class="ex-certo-icon">✓</span>' : ''}
                  ${mostrarFeedback && ai === respAnterior?.escolha && !respAnterior.correta ? '<span class="ex-errado-icon">✗</span>' : ''}
                </label>
              `;
            }).join('')}
          </div>
          ${mostrarFeedback ? `
            <div class="ex-feedback ${respAnterior.correta ? 'feedback-certo' : 'feedback-errado'}">
              ${respAnterior.correta ? '🎉 Correto!' : `❌ Incorreto. A resposta certa era: <strong>${String.fromCharCode(65+q.correta)}</strong>`}
            </div>
          ` : ''}
        </div>
      `;
    } else {
   
      const nota = respAnterior?.nota;
      const comentario = respAnterior?.comentario;
      questoesHtml += `
        <div class="ex-questao-responder dissertativa" id="ex-resp-q-${qi}">
          <div class="ex-q-num">Questão ${qi+1} <span class="ex-q-tipo-badge escrever">Dissertativa</span> <span style="margin-left:auto; color:var(--accent)">${q.valor||1} pts</span></div>
          <div class="ex-q-enunciado-text">${_escHtml(q.enunciado)}</div>
          <label for="ex-resp-texto-${qi}" class="sr-only">Resposta da questão ${qi+1}</label>
          <textarea class="ex-textarea ex-resp-textarea" id="ex-resp-texto-${qi}" name="ex-resp-texto-${qi}"
            placeholder="Digite sua resposta aqui..."
            ${bloqueado ? 'disabled' : ''}
            rows="4">${_escHtml(respAnterior?.texto || '')}</textarea>
          ${nota !== undefined ? `
            <div class="ex-correcao-box">
              <div class="ex-correcao-nota">📊 Nota: <strong>${nota}/10</strong></div>
              ${comentario ? `<div class="ex-correcao-comentario">💬 ${_escHtml(comentario)}</div>` : ''}
            </div>
          ` : (tentativasFeitas > 0 ? `<div class="ex-aguardando-badge">⏳ Aguardando correção do professor</div>` : '')}
        </div>
      `;
    }
  });

  
  let placarHtml = '';
  if (bloqueado) {
    const msgStatus = prazoExpirado ? "Atividade encerrada (prazo expirado)." : "Limite de tentativas atingido.";
    const marcarQs = ex.questoes.filter(q => q.tipo === 'marcar');
    const total = marcarQs.length;
    if (total > 0 && tentativasFeitas > 0) {
      const acertos = marcarQs.filter((q, qi) => {
        const realIdx = ex.questoes.indexOf(q);
        return userResp.respostas?.[realIdx]?.correta;
      }).length;
      const pct = Math.round((acertos/total)*100);
      placarHtml = `
        <div class="ex-placar-final">
          <div class="ex-placar-emoji">${pct>=70?'🏆':pct>=50?'😊':'😅'}</div>
          <div style="color:#e07070; font-size:13px; margin-bottom:10px; font-weight:600;">${msgStatus}</div>
          <div class="ex-placar-label">Resultado das questões de marcar</div>
          <div class="ex-placar-num">${acertos} / ${total} <span class="ex-placar-pct">(${pct}%)</span></div>
          <div class="ex-placar-bar"><div class="ex-placar-bar-fill" style="width:${pct}%"></div></div>
        </div>
      `;
    } else {
      placarHtml = `
        <div class="ex-placar-final" style="border-color:#e07070; background:rgba(224,112,112,0.05);">
          <div class="ex-placar-emoji">🚫</div>
          <div style="color:#e07070; font-size:15px; font-weight:600;">${msgStatus}</div>
        </div>
      `;
    }
  }

  const html = `
    <div id="${modalId}" class="ex-modal-overlay" onclick="ExSys._closeOnOverlay(event,'${modalId}')">
      <div class="ex-modal-box ex-modal-large">
        <div class="ex-modal-header">
          <div>
            <h3>${_escHtml(ex.title)}</h3>
            ${ex.description ? `<p class="ex-modal-subtitle">${_escHtml(ex.description)}</p>` : ''}
          </div>
          <button class="ex-modal-close" onclick="ExSys._closeModal('${modalId}')">✕</button>
        </div>

        <div class="ex-modal-body">
          ${placarHtml}
          <div class="ex-questoes-responder">${questoesHtml}</div>
        </div>

        <div class="ex-modal-footer">
          <button class="btn-secondary" onclick="ExSys._closeModal('${modalId}')">${bloqueado || jaConcluido ? 'Fechar' : 'Cancelar'}</button>
          ${!bloqueado && (!jaConcluido || (limTentativas === 0 || tentativasFeitas < limTentativas)) ? `
            <button class="btn-primary" onclick="ExSys._concluirExercicio('${turmaId}','${exId}')">
              ✅ Concluir e Enviar
            </button>
          ` : ''}
        </div>
      </div>
    </div>
  `;

  _showModal(html);

 
  if (!jaConcluido) {
    window._exRespostasTemp = window._exRespostasTemp || {};
    window._exRespostasTemp[exId] = window._exRespostasTemp[exId] || {};
  }
}

function _responderMarcar(turmaId, exId, qi, escolha) {
  const ex = _exGetOne(turmaId, exId);
  const user = _getUser();
  if (!ex || !user) return;

  const userResp = ex.respostas?.[user.id] || {};
  const tentativasFeitas = userResp.tentativas || 0;
  const limTentativas = ex.limTentativas || 0;

 
  if (limTentativas > 0 && tentativasFeitas >= limTentativas) return;
  if (ex.deadline && new Date() > new Date(ex.deadline)) return;


  if (userResp.concluido && (limTentativas === 0 || tentativasFeitas >= limTentativas)) return;

  const q = ex.questoes[qi];
  const correta = escolha === q.correta;

  window._exRespostasTemp = window._exRespostasTemp || {};
  window._exRespostasTemp[exId] = window._exRespostasTemp[exId] || {};
  window._exRespostasTemp[exId][qi] = { escolha, correta };

  
}

async function _concluirExercicio(turmaId, exId) {
  const ex = _exGetOne(turmaId, exId);
  const user = _getUser();
  if (!ex || !user) return;

  const userResp = ex.respostas?.[user.id] || {};
  const tentativasFeitas = userResp.tentativas || 0;
  if (ex.limTentativas > 0 && tentativasFeitas >= ex.limTentativas) {
    _exToast('Limite de tentativas atingido.', 'error');
    return;
  }

  const respostas = window._exRespostasTemp?.[exId] || {};

  
  ex.questoes.forEach((q, qi) => {
    if (q.tipo === 'escrever') {
      const texto = document.getElementById(`ex-resp-texto-${qi}`)?.value?.trim() || '';
      respostas[qi] = { texto };
    }
  });

  const novaTentativa = tentativasFeitas + 1;

  
  if (!ex.respostas) ex.respostas = {};
  ex.respostas[user.id] = { 
    ...userResp,
    concluido: true, 
    tentativas: novaTentativa, 
    respostas, 
    concluidoAt: Date.now(), 
    username: user.username 
  };
  _exSet(turmaId, exId, ex);

 
  try {
    const res = await fetch(`${API_BASE}/api/turmas/${turmaId}/exercicios/${exId}/respostas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: user.id,
        username: user.username,
        respostas: respostas
      })
    });
    if (!res.ok) {
      const err = await res.json();
      console.error('Erro backend:', err);
    }
  } catch (e) {
    console.error('Erro de conexão ao enviar respostas:', e);
  }

 
  const marcarQs = ex.questoes.filter(q => q.tipo === 'marcar');
  const acertos = marcarQs.filter((q, qi) => {
    return respostas[qi]?.correta;
  }).length;
  const total = marcarQs.length;

  _closeModal('modal-responder-exercicio');
  delete window._exRespostasTemp?.[exId];

 
  if (total > 0) {
    _showPlacarModal(acertos, total, ex.title);
  } else {
    _exToast('✅ Respostas enviadas! Aguarde a correção do professor.', 'success');
  }

  await renderExerciciosTabContent(turmaId);
}

function _showPlacarModal(acertos, total, titulo) {
  const pct = Math.round((acertos/total)*100);
  const emoji = pct >= 90 ? '🏆' : pct >= 70 ? '🌟' : pct >= 50 ? '😊' : '😅';
  const msg = pct >= 90 ? 'Excelente!' : pct >= 70 ? 'Muito bem!' : pct >= 50 ? 'Bom esforço!' : 'Continue praticando!';

  const modalId = 'modal-placar-final';
  let m = document.getElementById(modalId);
  if (m) m.remove();

  _showModal(`
    <div id="${modalId}" class="ex-modal-overlay" onclick="ExSys._closeOnOverlay(event,'${modalId}')">
      <div class="ex-modal-box ex-modal-placar">
        <button class="ex-modal-close" onclick="ExSys._closeModal('${modalId}')">✕</button>
        <div class="ex-placar-big-emoji">${emoji}</div>
        <div class="ex-placar-big-titulo">${_escHtml(titulo)}</div>
        <div class="ex-placar-big-num">${acertos}<span>/${total}</span></div>
        <div class="ex-placar-big-msg">${msg}</div>
        <div class="ex-placar-big-pct-bar">
          <div class="ex-placar-big-fill" style="width:${pct}%"></div>
        </div>
        <div class="ex-placar-big-pct-text">${pct}% de acerto</div>
        <button class="btn-primary ex-placar-btn-fechar" onclick="ExSys._closeModal('${modalId}')">Fechar</button>
      </div>
    </div>
  `);
}

function openResultados(turmaId, exId) {
  const ex = _exGetOne(turmaId, exId);
  if (!ex) return;

  const modalId = 'modal-resultados-exercicio';
  let m = document.getElementById(modalId);
  if (m) m.remove();

  const alunos = Object.entries(ex.respostas || {}).filter(([,r]) => r.concluido);
  const totalMarcar = ex.questoes.filter(q => q.tipo === 'marcar').length;
  const totalEscrever = ex.questoes.filter(q => q.tipo === 'escrever').length;

 
  let heatmapHtml = '';
  let criticalQuestions = [];
  
  if (alunos.length > 0) {
    const statsPerQuestion = ex.questoes.map((q, qi) => {
      if (q.tipo !== 'marcar') return null;
      const errados = alunos.filter(([,r]) => r.respostas?.[qi] && !r.respostas[qi].correta).length;
      const errorRate = (errados / alunos.length) * 100;
      if (errorRate >= 80) criticalQuestions.push(qi + 1);
      return { qi, errorRate };
    });

    if (criticalQuestions.length > 0) {
      heatmapHtml = `
        <div class="ex-heatmap-alert">
          <span style="font-size: 24px;">⚠️</span>
          <div>
            Sua turma está com dificuldade em <strong>"${ex.title}"</strong>.<br>
            <small>As questões ${criticalQuestions.join(', ')} tiveram mais de 80% de erro.</small>
          </div>
        </div>
      `;
    }
    
    heatmapHtml += `<div style="margin-bottom: 24px;">
      <div class="ex-section-label" style="margin-bottom:10px;">Mapa de Dificuldade (Taxa de Erro)</div>
      <div style="display: flex; gap: 4px;">
        ${statsPerQuestion.map((stat, i) => {
          if (!stat) return '';
          const color = stat.errorRate >= 80 ? '#e07060' : stat.errorRate >= 50 ? '#e8a04a' : '#7a9e7e';
          return `
            <div style="flex: 1; text-align: center;">
              <div style="height: 40px; background: var(--bg-3); border-radius: 6px; display: flex; align-items: flex-end; overflow: hidden; border: 1px solid var(--border);">
                <div style="width: 100%; height: ${stat.errorRate}%; background: ${color}; opacity: 0.8;"></div>
              </div>
              <div style="font-size: 9px; margin-top: 4px; color: var(--text-3);">Q${i+1}</div>
            </div>`;
        }).join('')}
      </div>
    </div>`;
  }

  let alunosHtml = '';
  if (!alunos.length) {
    alunosHtml = `<div class="ex-empty"><p>Nenhum aluno respondeu ainda.</p></div>`;
  } else {
    alunosHtml = alunos.map(([userId, resp]) => {
      const acertos = ex.questoes.filter((q, qi) => q.tipo === 'marcar' && resp.respostas?.[qi]?.correta).length;
      const pct = totalMarcar > 0 ? Math.round((acertos/totalMarcar)*100) : null;

      
      const discPendentes = ex.questoes.filter((q, qi) => q.tipo === 'escrever' && resp.respostas?.[qi]?.nota === undefined).length;

      return `
        <div class="ex-resultado-aluno-card">
          <div class="ex-resultado-aluno-header">
            <div class="ex-resultado-aluno-avatar">${(userId[0]||'A').toUpperCase()}</div>
            <div class="ex-resultado-aluno-info">
              <div class="ex-resultado-aluno-nome">${_escHtml(resp.username || userId)}</div>
              <div class="ex-resultado-aluno-data">
                Respondeu em ${new Date(resp.concluidoAt).toLocaleDateString('pt-BR')}
              </div>
            </div>
            <div class="ex-resultado-badges">
              ${pct !== null ? `<span class="ex-resultado-score ${pct>=70?'score-bom':'score-ruim'}">${acertos}/${totalMarcar} (${pct}%)</span>` : ''}
              ${discPendentes > 0 ? `<span class="ex-corrigir-badge">✏️ ${discPendentes} p/ corrigir</span>` : ''}
            </div>
          </div>

          <div class="ex-resultado-mc-details" style="margin-bottom: 12px; display: flex; flex-direction: column; gap: 4px;">
            ${ex.questoes.map((q, qi) => {
              if (q.tipo !== 'marcar') return '';
              const r = resp.respostas?.[qi];
              const correta = !!r?.correta;
              const escolha = r?.escolha !== undefined ? String.fromCharCode(65 + r.escolha) : '—';
              return `
                <div style="font-size:12px; padding:6px 10px; background:rgba(0,0,0,0.2); border-radius:8px; display:flex; justify-content:space-between; align-items:center;">
                  <span>Questão ${qi+1}: <strong>${escolha}</strong></span>
                  <span style="color:${correta?'#60d080':'#e07070'}; font-weight:700;">${correta?'✓ Correta':'✗ Incorreta (Certa: '+String.fromCharCode(65+q.correta)+')'}</span>
                </div>
              `;
            }).join('')}
          </div>

          ${totalEscrever > 0 ? `
            <div class="ex-resultado-disc-section">
              ${ex.questoes.map((q, qi) => {
                if (q.tipo !== 'escrever') return '';
                const r = resp.respostas?.[qi];
                return `
                  <div class="ex-resultado-disc-item">
                    <div class="ex-resultado-disc-q"><strong>Q${qi+1}:</strong> ${_escHtml(q.enunciado)}</div>
                    <div class="ex-resultado-disc-resp">${_escHtml(r?.texto || '(sem resposta)')}</div>
                    ${r?.nota !== undefined ? `
                      <div class="ex-resultado-disc-corrigido">
                        ✅ Nota: <strong>${r.nota}/10</strong>
                        ${r.comentario ? `· ${_escHtml(r.comentario)}` : ''}
                      </div>
                    ` : `
                      <div class="ex-corrigir-form">
                        <label for="ex-nota-${userId.replace(/\W/g,'_')}-${qi}" class="sr-only">Nota do aluno (0-10)</label>
                        <button id="btn-ia-${userId.replace(/\W/g,'_')}-${qi}" class="btn-secondary small" onclick="ExSys._gerarCorrecaoIA('${turmaId}','${exId}','${userId}',${qi})" style="margin-bottom:8px;">
                          🤖 Sugestão IA
                        </button>
                        <input type="number" min="0" max="10" step="0.5" placeholder="Nota (0-10)"
                          class="ex-input ex-nota-input" id="ex-nota-${userId.replace(/\W/g,'_')}-${qi}" name="ex-nota-${userId.replace(/\W/g,'_')}-${qi}" />
                        <label for="ex-coment-${userId.replace(/\W/g,'_')}-${qi}" class="sr-only">Comentário da correção</label>
                        <textarea class="ex-textarea ex-comentario-input" rows="2" placeholder="Comentário (opcional)..."
                          id="ex-coment-${userId.replace(/\W/g,'_')}-${qi}" name="ex-coment-${userId.replace(/\W/g,'_')}-${qi}"></textarea>
                        <button class="btn-primary small" onclick="ExSys._salvarCorrecao('${turmaId}','${exId}','${userId}',${qi})">
                          💾 Salvar correção
                        </button>
                      </div>
                    `}
                  </div>
                `;
              }).join('')}
            </div>
          ` : ''}
        </div>
      `;
    }).join('');
  }

  _showModal(`
    <div id="${modalId}" class="ex-modal-overlay" onclick="ExSys._closeOnOverlay(event,'${modalId}')">
      <div class="ex-modal-box ex-modal-large">
        <div class="ex-modal-header">
          <div>
            <h3>📊 Resultados — ${_escHtml(ex.title)}</h3>
            <p class="ex-modal-subtitle">${alunos.length} aluno${alunos.length!==1?'s':''} respondeu${alunos.length!==1?'ram':''}</p>
          </div>
          <button class="ex-modal-close" onclick="ExSys._closeModal('${modalId}')">✕</button>
        </div>
        <div class="ex-modal-body">${alunosHtml}</div>
        <div class="ex-modal-footer">
          <button class="btn-secondary" onclick="ExSys._closeModal('${modalId}')">Fechar</button>
          ${alunos.length > 0 ? `
            <button class="btn-secondary" onclick="ExSys._exportarCsvResultados('${turmaId}','${exId}')">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Baixar CSV
            </button>
          ` : ''}
        </div>
      </div>
    </div>
  `);
}

async function openGlobalBank(turmaId) {
  const modalId = 'modal-global-bank';
  _showModal(`
    <div id="${modalId}" class="ex-modal-overlay">
      <div class="ex-modal-box ex-modal-large">
        <div class="ex-modal-header">
          <h3>🌐 Banco Global de Questões</h3>
          <button class="ex-modal-close" onclick="ExSys._closeModal('${modalId}')">✕</button>
        </div>
        <div class="ex-modal-body" id="global-bank-list">
          <div class="empty-state">Carregando banco global...</div>
        </div>
      </div>
    </div>
  `);

  try {
    const res = await fetch(`${API_BASE}/api/exercises/global`);
    const data = await res.json();
    const list = document.getElementById('global-bank-list');
    
    if (!data.exercises.length) {
      list.innerHTML = '<div class="empty-state">Nenhum exercício compartilhado ainda.</div>';
      return;
    }

    list.innerHTML = data.exercises.map(ex => `
      <div class="ex-card">
        <div class="ex-card-info">
          <div class="ex-card-title">${_escHtml(ex.title)}</div>
          <div class="ex-card-desc">${_escHtml(ex.description)}</div>
          <div class="ex-card-meta">Compartilhado por: <strong>${ex.shared_by}</strong> · ${ex.questoes.length} questões</div>
        </div>
        <button class="btn-primary small" onclick='ExSys._exImportFromGlobal("${turmaId}", ${JSON.stringify(ex).replace(/'/g, "&apos;")})'>
          📥 Importar
        </button>
      </div>
    `).join('');
  } catch (e) {
    document.getElementById('global-bank-list').innerHTML = 'Erro ao carregar banco.';
  }
}

function _exportarCsvResultados(turmaId, exId) {
  const ex = _exGetOne(turmaId, exId);
  if (!ex) return;

  const alunos = Object.entries(ex.respostas || {}).filter(([,r]) => r.concluido);
  if (!alunos.length) { _exToast('Nenhum aluno respondeu ainda.', 'error'); return; }

 
  const questoesCols = ex.questoes.map((q, qi) => {
    const tipo = q.tipo === 'marcar' ? 'MC' : 'Diss';
    return [`Q${qi+1} (${tipo}) - Resposta`, q.tipo === 'marcar' ? `Q${qi+1} - Acerto` : `Q${qi+1} - Nota`];
  }).flat();

  const headers = ['Aluno', 'Data Entrega', ...questoesCols, 'Total MC (%)', 'Nota Final'];
  const rows = [headers];

  alunos.forEach(([userId, resp]) => {
    const row = [resp.username || userId, resp.concluidoAt ? new Date(resp.concluidoAt).toLocaleDateString('pt-BR') : ''];

    let acertosTotal = 0, totalMarcar = 0;
    let somaNotas = 0, totalDisc = 0;

    ex.questoes.forEach((q, qi) => {
      const r = resp.respostas?.[qi];
      if (q.tipo === 'marcar') {
        const letra = r?.escolha !== undefined ? String.fromCharCode(65 + r.escolha) : '—';
        const acerto = r?.correta ? 'Sim' : 'Não';
        row.push(letra, acerto);
        totalMarcar++;
        if (r?.correta) acertosTotal++;
      } else {
        const texto = r?.texto ? r.texto.replace(/"/g, '""').replace(/\n/g, ' ') : '—';
        const nota = r?.nota !== undefined ? r.nota : '—';
        row.push(`"${texto}"`, nota);
        totalDisc++;
        if (r?.nota !== undefined) somaNotas += r.nota;
      }
    });

    const pctMC = totalMarcar > 0 ? `${Math.round((acertosTotal / totalMarcar) * 100)}%` : '—';
    const notaFinal = totalDisc > 0 && somaNotas > 0 ? (somaNotas / totalDisc).toFixed(1) : '—';
    row.push(pctMC, notaFinal);
    rows.push(row);
  });

  const csvContent = rows.map(r => r.join(';')).join('\n');
  const bom = '\uFEFF'; // BOM para Excel reconhecer UTF-8
  const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `resultados_${ex.title.replace(/[^a-zA-Z0-9]/g, '_')}.csv`;
  link.click();
  URL.revokeObjectURL(url);
  _exToast('✅ CSV baixado com sucesso!', 'success');
}

function _salvarCorrecao(turmaId, exId, userId, qi) {
  const ex = _exGetOne(turmaId, exId);
  if (!ex) return;

  const safeId = userId.replace(/\W/g,'_');
  const notaInput = document.getElementById(`ex-nota-${safeId}-${qi}`);
  const comentInput = document.getElementById(`ex-coment-${safeId}-${qi}`);

  const notaVal = parseFloat(notaInput?.value);
  if (isNaN(notaVal) || notaVal < 0 || notaVal > 10) {
    _exToast('Digite uma nota válida entre 0 e 10.', 'error');
    return;
  }
  const comentario = comentInput?.value?.trim() || '';

  if (!ex.respostas[userId].respostas[qi]) ex.respostas[userId].respostas[qi] = {};
  ex.respostas[userId].respostas[qi].nota = notaVal;
  ex.respostas[userId].respostas[qi].comentario = comentario;
  _exSet(turmaId, exId, ex);

  _exToast('✅ Correção salva!', 'success');
  openResultados(turmaId, exId); 
}


function exportPdf(turmaId, exId) {
  const ex = _exGetOne(turmaId, exId);
  if (!ex) return;

  const turmaName = _getTurmaName() || 'Turma';

  let html = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8"/>
      <title>${ex.title}</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Segoe UI', Arial, sans-serif; color: #1a1a2e; padding: 40px; font-size: 14px; line-height: 1.6; }
        .pdf-header { border-bottom: 3px solid #e8a04a; padding-bottom: 16px; margin-bottom: 28px; }
        .pdf-school { font-size: 11px; text-transform: uppercase; letter-spacing: 0.12em; color: #888; margin-bottom: 4px; }
        .pdf-title { font-size: 22px; font-weight: 700; color: #1a1a2e; margin-bottom: 4px; }
        .pdf-subtitle { font-size: 13px; color: #555; }
        .pdf-meta { display: flex; gap: 24px; margin-top: 10px; font-size: 12px; color: #777; }
        .pdf-meta span { display: flex; align-items: center; gap: 4px; }
        .questao { margin-bottom: 30px; page-break-inside: avoid; }
        .questao-num { font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #e8a04a; font-weight: 600; margin-bottom: 6px; }
        .questao-enunciado { font-size: 14px; font-weight: 500; margin-bottom: 12px; }
        .alternativas { list-style: none; margin-left: 8px; }
        .alternativas li { margin-bottom: 8px; display: flex; align-items: center; gap: 10px; }
        .alt-letra { width: 24px; height: 24px; border: 1.5px solid #ccc; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; flex-shrink: 0; }
        .resp-area { margin-top: 8px; }
        .resp-line { border-bottom: 1px solid #ddd; height: 28px; margin-bottom: 8px; }
        .tipo-badge { display: inline-block; font-size: 10px; letter-spacing: 0.08em; text-transform: uppercase; padding: 2px 8px; border-radius: 100px; margin-bottom: 8px; }
        .tipo-marcar { background: #fff3e0; color: #e65100; }
        .tipo-escrever { background: #e3f2fd; color: #1565c0; }
        .pdf-footer { margin-top: 40px; border-top: 1px solid #eee; padding-top: 12px; font-size: 11px; color: #aaa; display: flex; justify-content: space-between; }
      </style>
    </head>
    <body>
      <div class="pdf-header">
        <div class="pdf-school">StudySync · ${turmaName}</div>
        <div class="pdf-title">${_escHtmlPdf(ex.title)}</div>
        ${ex.description ? `<div class="pdf-subtitle">${_escHtmlPdf(ex.description)}</div>` : ''}
        <div class="pdf-meta">
          <span>📅 ${new Date(ex.createdAt).toLocaleDateString('pt-BR')}</span>
          <span>📝 ${ex.questoes.length} questões</span>
          <span>Nome: ______________________________</span>
        </div>
      </div>
  `;

  ex.questoes.forEach((q, qi) => {
    html += `
      <div class="questao">
        <div class="questao-num">Questão ${qi+1}</div>
        <span class="tipo-badge ${q.tipo==='marcar'?'tipo-marcar':'tipo-escrever'}">${q.tipo==='marcar'?'Múltipla Escolha':'Dissertativa'}</span>
        <div class="questao-enunciado">${_escHtmlPdf(q.enunciado)}</div>
    `;

    if (q.tipo === 'marcar') {
      html += `<ul class="alternativas">`;
      q.alternativas.forEach((alt, ai) => {
        html += `<li><div class="alt-letra">${String.fromCharCode(65+ai)}</div> ${_escHtmlPdf(alt)}</li>`;
      });
      html += `</ul>`;
    } else {
      html += `<div class="resp-area">${Array(6).fill('<div class="resp-line"></div>').join('')}</div>`;
    }

    html += `</div>`;
  });

  html += `
      <div class="pdf-footer">
        <span>Gerado pelo StudySync</span>
        <span>${new Date().toLocaleString('pt-BR')}</span>
      </div>
    </body>
    </html>
  `;

  const win = window.open('', '_blank');
  if (!win) { _exToast('Popup bloqueado. Permita popups para exportar.', 'error'); return; }
  win.document.write(html);
  win.document.close();
  setTimeout(() => { win.focus(); win.print(); }, 400);
}

function deleteExercicio(turmaId, exId) {
  if (!confirm('Tem certeza que deseja excluir este exercício? Todas as respostas serão perdidas.')) return;
  const exMap = _exGet(turmaId);
  delete exMap[exId];
  window._ExercicioState.exercicios[turmaId] = exMap;
  _exSave();
  _exToast('🗑️ Exercício excluído.', 'success');
  renderExerciciosTabContent(turmaId);
}

async function _gerarCorrecaoIA(turmaId, exId, userId, qi) {
  const ex = _exGetOne(turmaId, exId);
  if (!ex) return;

  const q = ex.questoes[qi];
  const r = ex.respostas[userId]?.respostas?.[qi];

  if (!q || !r || !r.texto) {
    _exToast('Resposta dissertativa não encontrada.', 'error');
    return;
  }

  const safeId = userId.replace(/\W/g, '_');
  const notaInput  = document.getElementById(`ex-nota-${safeId}-${qi}`);
  const comentInput = document.getElementById(`ex-coment-${safeId}-${qi}`);


  const btn = document.getElementById(`btn-ia-${safeId}-${qi}`);
  const originalBtnHtml = btn?.innerHTML;
  if (btn) { btn.disabled = true; btn.textContent = '🤖 Gerando...'; }

  try {
    const valorMax = q.valor ?? 10;
    const prompt = `Questão: "${q.enunciado}"\nResposta do aluno: "${r.texto}"\n\nAtribua uma nota de 0 a ${valorMax} e forneça um feedback construtivo. Responda APENAS com JSON no formato: {"nota": 7.5, "feedback": "Sua resposta demonstrou..."}`;

    const res = await fetch(`${API_BASE}/api/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: prompt,
        context: 'Você é um professor que corrige questões dissertativas de forma justa e construtiva. Responda sempre em JSON puro, sem markdown.'
      })
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || `Erro ${res.status} ao gerar correção.`);
    }

    const data = await res.json();

    
    let correction;
    try {
      const jsonStr = (data.response || '').replace(/```json|```/g, '').trim();
      const match = jsonStr.match(/\{[\s\S]*\}/);
      correction = JSON.parse(match ? match[0] : jsonStr);
    } catch (parseErr) {
      throw new Error('A IA retornou um formato inesperado. Tente novamente.');
    }

    const nota = Math.max(0, Math.min(parseFloat(correction.nota) || 0, valorMax));
    if (notaInput)  notaInput.value  = nota;
    if (comentInput) comentInput.value = correction.feedback || '';

   
    [notaInput, comentInput].forEach(el => {
      if (!el) return;
      el.style.transition = 'border-color .3s';
      el.style.borderColor = '#70c090';
      setTimeout(() => { el.style.borderColor = ''; }, 2500);
    });

    _exToast('✅ Sugestão da IA preenchida! Revise e salve.', 'success');
  } catch (e) {
    _exToast(`❌ Erro na IA: ${e.message}`, 'error');
  } finally {
    if (btn) { btn.disabled = false; btn.innerHTML = originalBtnHtml; }
  }
}

function _getPortal() {
  let p = document.getElementById('ex-modal-portal');
  if (!p) {
    p = document.createElement('div');
    p.id = 'ex-modal-portal';
    p.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:99999;pointer-events:none;isolation:isolate;';
    document.body.appendChild(p);
  }
  return p;
}
function _showModal(html) {
  const portal = _getPortal();
  portal.style.pointerEvents = 'auto';
  portal.innerHTML = html;
}
function _closeModal(id) {
  const portal = document.getElementById('ex-modal-portal');
  if (portal) { portal.innerHTML = ''; portal.style.pointerEvents = 'none'; }
  const m = document.getElementById(id);
  if (m) m.remove();
}
function _closeOnOverlay(e, id) {
  if (e.target.id === id) _closeModal(id);
}
function _getAppState() {
  try { 
    const app = window.App || (typeof App !== 'undefined' ? App : null);
    if (!app) return null;
    return app.getState ? app.getState() : app.state;
  } catch(e) { return null; }
}
function _getTurmaId() {
  try { 
    const s = _getAppState(); 
    return s?.currentTurma?.id || window.__currentTurmaId__ || null; 
  } catch(e) { return null; }
}
function _getTurmaName() {
  try { const s = _getAppState(); return s && s.currentTurma && s.currentTurma.name || 'Turma'; } catch(e) { return 'Turma'; }
}
function _getUser() {
  try { 
    const s = _getAppState(); 
    return s?.user || JSON.parse(localStorage.getItem('studysync_user'));
  } catch(e) { return null; }
}
function _escHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function _escHtmlPdf(str) {
  if (!str) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
function _exToast(msg, type='success') {
  if (typeof App !== 'undefined' && App.toast) { App.toast(msg, type); return; }
  const t = document.getElementById('toast');
  if (t) { t.textContent = msg; t.className = `toast ${type} show`; setTimeout(()=>t.classList.remove('show'),3000); }
}


function getExStyles() {
  return `
  <style id="ex-styles">
  
    .sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }

    .ex-container { padding: 8px 0 40px; }
    .ex-section-title { font-family: var(--font-display, serif); font-size: 26px; color: var(--text-0,#fff); margin-bottom: 20px; }
    .ex-section-label { font-size: 12px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: var(--text-2,#aaa); }
    .ex-empty { text-align: center; padding: 48px 24px; color: var(--text-2,#aaa); }
    .ex-empty-icon { font-size: 40px; margin-bottom: 12px; }

    .ex-prof-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
    .ex-prof-actions { display: flex; gap: 8px; }

   
    .ex-list { display: flex; flex-direction: column; gap: 14px; }
    .ex-card { background: var(--bg-2,#1e1c18); border: 1px solid var(--border,rgba(255,220,170,.08)); border-radius: 16px; padding: 20px; display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; transition: border-color .2s, background .2s; cursor: pointer; }
    .ex-card:hover { border-color: rgba(232,160,74,.35); background: rgba(232,160,74,.03); }
    .ex-card-left { display: flex; gap: 14px; align-items: flex-start; flex: 1; }
    .ex-card-num-badge { background: rgba(232,160,74,.12); color: var(--accent,#e8a04a); border: 1px solid rgba(232,160,74,.22); border-radius: 10px; padding: 6px 12px; font-size: 12px; font-weight: 600; white-space: nowrap; }
    .ex-card-info { flex: 1; }
    .ex-card-title { font-size: 16px; font-weight: 600; color: var(--text-0,#fff); margin-bottom: 4px; }
    .ex-card-desc { font-size: 13px; color: var(--text-2,#aaa); margin-bottom: 6px; }
    .ex-card-meta { font-size: 12px; color: var(--text-3,#666); margin-bottom: 6px; }
    .ex-card-actions { display: flex; gap: 8px; flex-shrink: 0; flex-wrap: wrap; align-items: center; }
    button.danger { background: rgba(220,60,60,.12) !important; color: #e07060 !important; border-color: rgba(220,60,60,.22) !important; }

    .ex-badge { display: inline-flex; align-items: center; font-size: 11px; font-weight: 600; padding: 3px 9px; border-radius: 100px; margin-top: 4px; }
    .ex-badge.pendente { background: rgba(200,160,80,.12); color: #c8a050; }
    .ex-badge.respondido { background: rgba(100,200,120,.12); color: #60c080; }
    .ex-badge.aguardando { background: rgba(80,140,220,.12); color: #70a0e0; }
    .ex-badge.corrigido { background: rgba(150,100,220,.12); color: #b070e0; }
    .ex-corrigir-badge { display: inline-flex; align-items: center; font-size: 11px; font-weight: 600; padding: 3px 9px; border-radius: 100px; background: rgba(220,120,60,.15); color: #e08040; border: 1px solid rgba(220,120,60,.25); }
    .ex-prof-stats { display: flex; gap: 10px; align-items: center; margin-top: 4px; font-size: 12px; color: var(--text-2,#aaa); flex-wrap: wrap; }

  
    .ex-modal-overlay { position: fixed !important; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,.75); z-index: 99999 !important; display: flex; align-items: center; justify-content: center; padding: 20px; overflow-y: auto; }
    .ex-modal-box { background: var(--bg-2,#1e1c18); border: 1px solid var(--border,rgba(255,220,170,.08)); border-radius: 20px; width: 100%; position: relative; display: flex; flex-direction: column; max-height: 90vh; overflow-y: auto; }
    .ex-modal-large { max-width: 680px; }
    .ex-modal-placar { max-width: 380px; text-align: center; padding: 40px 32px; border-radius: 24px; }
    .ex-modal-header { padding: 24px 28px 16px; border-bottom: 1px solid var(--border,rgba(255,220,170,.08)); display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; flex-shrink: 0; }
    .ex-modal-header h3 { font-family: var(--font-display,serif); font-size: 22px; color: var(--text-0,#fff); }
    .ex-modal-subtitle { font-size: 13px; color: var(--text-2,#aaa); margin-top: 4px; }
    .ex-modal-close { background: none; border: none; color: var(--text-2,#aaa); font-size: 20px; cursor: pointer; padding: 2px; line-height: 1; flex-shrink: 0; }
    .ex-modal-body { padding: 24px 28px; overflow-y: auto; flex: 1; }
    .ex-modal-footer { padding: 16px 28px; border-top: 1px solid var(--border,rgba(255,220,170,.08)); display: flex; justify-content: flex-end; gap: 10px; flex-shrink: 0; } .ex-modal-overlay .ex-modal-footer { display: flex; }

 
    .ex-field { margin-bottom: 16px; }
    .ex-field label { display: block; font-size: 11.5px; font-weight: 600; text-transform: uppercase; letter-spacing: .08em; color: var(--text-2,#aaa); margin-bottom: 6px; }
    .ex-input { width: 100%; background: var(--bg-3,#2a2820); border: 1px solid var(--border,rgba(255,220,170,.08)); border-radius: 10px; padding: 10px 13px; font-size: 14px; color: var(--text-0,#fff); outline: none; font-family: inherit; transition: border-color .2s; }
    .ex-input:focus { border-color: rgba(232,160,74,.35); }
    .ex-textarea { width: 100%; background: var(--bg-3,#2a2820); border: 1px solid var(--border,rgba(255,220,170,.08)); border-radius: 10px; padding: 10px 13px; font-size: 14px; color: var(--text-0,#fff); outline: none; font-family: inherit; resize: vertical; transition: border-color .2s; }
    .ex-textarea:focus { border-color: rgba(232,160,74,.35); }


    .ex-questoes-header { display: flex; align-items: center; justify-content: space-between; margin: 20px 0 12px; flex-wrap: wrap; gap: 10px; }
    .ex-questoes-list { display: flex; flex-direction: column; gap: 20px; }
    .ex-questao-editor { background: var(--bg-3,#2a2820); border: 1px solid var(--border,rgba(255,220,170,.08)); border-radius: 14px; padding: 18px; }
    .ex-q-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
    .ex-q-label { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; color: var(--accent,#e8a04a); }
    .ex-q-remove { background: none; border: none; color: var(--text-3,#666); font-size: 16px; cursor: pointer; padding: 2px; }
    .ex-q-remove:hover { color: #e07060; }
    .ex-q-enunciado { margin-bottom: 12px; }
    .ex-alternativas-list { display: flex; flex-direction: column; gap: 8px; margin-bottom: 10px; }
    .ex-alt-row { display: flex; align-items: center; gap: 8px; }
    .ex-radio { accent-color: var(--accent,#e8a04a); width: 16px; height: 16px; flex-shrink: 0; }
    .ex-alt-letra { width: 24px; height: 24px; border-radius: 50%; border: 1.5px solid var(--border,rgba(255,220,170,.15)); display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; color: var(--text-2,#aaa); flex-shrink: 0; }
    .ex-alt-input { flex: 1; }
    .ex-add-alt-btn { background: none; border: 1px dashed var(--border,rgba(255,220,170,.15)); border-radius: 8px; color: var(--text-2,#aaa); font-size: 12px; padding: 6px 12px; cursor: pointer; margin-top: 4px; }
    .ex-add-alt-btn:hover { border-color: var(--accent,#e8a04a); color: var(--accent,#e8a04a); }
    .ex-q-dica { font-size: 11px; color: var(--text-3,#666); margin-top: 8px; font-style: italic; }

    .ex-questoes-responder { display: flex; flex-direction: column; gap: 24px; }
    .ex-questao-responder { background: var(--bg-3,#2a2820); border: 1.5px solid var(--border,rgba(255,220,170,.08)); border-radius: 14px; padding: 20px; transition: border-color .3s; }
    .ex-questao-responder.correta { border-color: rgba(100,200,120,.4); background: rgba(100,200,120,.05); }
    .ex-questao-responder.errada { border-color: rgba(220,80,80,.4); background: rgba(220,80,80,.05); }
    .ex-q-num { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; color: var(--text-3,#666); margin-bottom: 4px; display: flex; align-items: center; gap: 8px; }
    .ex-q-tipo-badge { padding: 2px 8px; border-radius: 100px; font-size: 10px; font-weight: 600; }
    .ex-q-tipo-badge.marcar { background: rgba(232,160,74,.15); color: #e8a04a; }
    .ex-q-tipo-badge.escrever { background: rgba(80,140,220,.15); color: #6090d0; }
    .ex-q-enunciado-text { font-size: 15px; font-weight: 500; color: var(--text-0,#fff); margin-bottom: 16px; line-height: 1.5; }
    .ex-alts-responder { display: flex; flex-direction: column; gap: 8px; }
    .ex-alt-label { display: flex; align-items: center; gap: 10px; padding: 10px 14px; border-radius: 10px; border: 1.5px solid var(--border,rgba(255,220,170,.08)); cursor: pointer; transition: all .18s; font-size: 14px; color: var(--text-1,#ddd); }
    .ex-alt-label:not(.disabled):hover { border-color: rgba(232,160,74,.35); background: rgba(232,160,74,.06); }
    .ex-alt-label.disabled { cursor: default; }
    .ex-alt-label.alt-correta { border-color: rgba(100,200,120,.5) !important; background: rgba(100,200,120,.1) !important; color: #70e090 !important; }
    .ex-alt-label.alt-errada { border-color: rgba(220,80,80,.5) !important; background: rgba(220,80,80,.1) !important; color: #e07070 !important; }
    .ex-alt-label input[type=radio] { accent-color: var(--accent,#e8a04a); width: 16px; height: 16px; flex-shrink: 0; }
    .ex-alt-letra-badge { width: 24px; height: 24px; border-radius: 50%; border: 1.5px solid currentColor; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; flex-shrink: 0; opacity: .7; }
    .ex-certo-icon { margin-left: auto; font-weight: 700; color: #60d080; }
    .ex-errado-icon { margin-left: auto; font-weight: 700; color: #e07070; }
    .ex-feedback { margin-top: 12px; padding: 10px 14px; border-radius: 10px; font-size: 13.5px; font-weight: 500; }
    .feedback-certo { background: rgba(100,200,120,.12); color: #70e090; border: 1px solid rgba(100,200,120,.25); }
    .feedback-errado { background: rgba(220,80,80,.1); color: #e07070; border: 1px solid rgba(220,80,80,.22); }
    .ex-resp-textarea { margin-top: 8px; }
    .ex-correcao-box { margin-top: 10px; background: rgba(150,100,220,.08); border: 1px solid rgba(150,100,220,.2); border-radius: 10px; padding: 12px; }
    .ex-correcao-nota { font-size: 14px; font-weight: 600; color: #b070e0; margin-bottom: 4px; }
    .ex-correcao-comentario { font-size: 13px; color: var(--text-1,#ddd); margin-top: 4px; }
    .ex-aguardando-badge { margin-top: 10px; font-size: 12px; color: #70a0e0; font-style: italic; }

   
    .ex-placar-final { background: var(--bg-3,#2a2820); border: 1px solid var(--border,rgba(255,220,170,.1)); border-radius: 16px; padding: 20px; margin-bottom: 24px; text-align: center; }
    .ex-placar-emoji { font-size: 36px; margin-bottom: 8px; }
    .ex-placar-label { font-size: 12px; text-transform: uppercase; letter-spacing: .08em; color: var(--text-2,#aaa); margin-bottom: 6px; }
    .ex-placar-num { font-size: 32px; font-weight: 700; color: var(--text-0,#fff); }
    .ex-placar-pct { font-size: 16px; color: var(--text-2,#aaa); font-weight: 400; }
    .ex-placar-bar { background: var(--bg-4,#333); border-radius: 100px; height: 8px; margin-top: 12px; overflow: hidden; }
    .ex-placar-bar-fill { height: 100%; background: linear-gradient(90deg, #e8a04a, #c96a4a); border-radius: 100px; transition: width .6s ease; }

   
    .ex-placar-big-emoji { font-size: 60px; margin-bottom: 16px; }
    .ex-placar-big-titulo { font-size: 14px; color: var(--text-2,#aaa); margin-bottom: 12px; }
    .ex-placar-big-num { font-family: var(--font-display,serif); font-size: 52px; font-weight: 700; color: var(--accent,#e8a04a); }
    .ex-placar-big-num span { font-size: 28px; color: var(--text-2,#aaa); }
    .ex-placar-big-msg { font-size: 18px; font-weight: 600; color: var(--text-0,#fff); margin: 12px 0; }
    .ex-placar-big-pct-bar { background: var(--bg-3,#2a2820); border-radius: 100px; height: 10px; margin: 16px 0 6px; overflow: hidden; }
    .ex-placar-big-fill { height: 100%; background: linear-gradient(90deg,#e8a04a,#c96a4a); border-radius: 100px; transition: width .8s ease; }
    .ex-placar-big-pct-text { font-size: 13px; color: var(--text-2,#aaa); margin-bottom: 24px; }
    .ex-placar-btn-fechar { width: 100%; padding: 13px; margin-top: 8px; }

    .ex-resultado-aluno-card { background: var(--bg-3,#2a2820); border: 1px solid var(--border,rgba(255,220,170,.08)); border-radius: 14px; padding: 18px; margin-bottom: 16px; }
    .ex-resultado-aluno-header { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 12px; flex-wrap: wrap; }
    .ex-resultado-aluno-avatar { width: 38px; height: 38px; border-radius: 50%; background: var(--accent,#e8a04a); color: #0f0d0a; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 15px; flex-shrink: 0; }
    .ex-resultado-aluno-info { flex: 1; }
    .ex-resultado-aluno-nome { font-size: 15px; font-weight: 600; color: var(--text-0,#fff); }
    .ex-resultado-aluno-data { font-size: 12px; color: var(--text-3,#666); margin-top: 2px; }
    .ex-resultado-badges { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
    .ex-resultado-score { font-size: 13px; font-weight: 700; padding: 4px 12px; border-radius: 100px; }
    .score-bom { background: rgba(100,200,120,.12); color: #60d080; }
    .score-ruim { background: rgba(220,80,80,.1); color: #e07070; }
    .ex-resultado-disc-section { border-top: 1px solid var(--border,rgba(255,220,170,.08)); padding-top: 14px; display: flex; flex-direction: column; gap: 16px; }
    .ex-resultado-disc-item { background: var(--bg-2,#1e1c18); border-radius: 10px; padding: 14px; }
    .ex-resultado-disc-q { font-size: 13px; color: var(--text-2,#aaa); margin-bottom: 6px; }
    .ex-resultado-disc-resp { font-size: 14px; color: var(--text-0,#fff); background: var(--bg-3,#2a2820); border-radius: 8px; padding: 10px; margin-bottom: 10px; border-left: 3px solid rgba(232,160,74,.3); line-height: 1.5; }
    .ex-resultado-disc-corrigido { font-size: 13px; color: #b070e0; padding: 8px; background: rgba(150,100,220,.07); border-radius: 8px; }
    .ex-correcao-box { margin-top: 10px; background: rgba(150,100,220,.08); border: 1px solid rgba(150,100,220,.2); border-radius: 10px; padding: 12px; }
  
    .ex-heatmap-alert { background: rgba(192, 57, 43, 0.15); border: 1px solid #e07060; border-radius: 12px; padding: 16px; margin-bottom: 20px; display: flex; align-items: center; gap: 12px; color: #f48771; font-weight: 600; }
    .ex-heatmap-bar-wrap { height: 6px; background: var(--bg-4); border-radius: 10px; flex: 1; overflow: hidden; }
    .ex-heatmap-bar-fill { height: 100%; transition: width 0.3s; }

    .ex-corrigir-form { display: flex; flex-direction: column; gap: 8px; }
    .ex-nota-input { max-width: 140px; }
    .ex-comentario-input { }
  </style>
  `;
}


function openCreateAviso() {
  const turmaId = _getTurmaId();
  if (!turmaId) { _exToast('Turma não encontrada.', 'error'); return; }

  const modalId = 'modal-criar-aviso';
  const m = document.getElementById(modalId);
  if (m) m.remove();

  const html = `
    <div id="${modalId}" class="ex-modal-overlay" onclick="ExSys._closeOnOverlay(event,'${modalId}')">
      <div class="ex-modal-box ex-modal-large">
        <div class="ex-modal-header">
          <h3>📢 Novo Aviso</h3>
          <button class="ex-modal-close" onclick="ExSys._closeModal('${modalId}')">✕</button>
        </div>
        <div class="ex-modal-body">
          <div class="ex-field">
            <label for="aviso-title">Título do aviso</label>
            <input id="aviso-title" name="aviso-title" type="text" placeholder="Ex: Prova dia 10/05" class="ex-input" />
          </div>
          <div class="ex-field">
            <label for="aviso-content">Conteúdo</label>
            <textarea id="aviso-content" name="aviso-content" placeholder="Escreva o aviso aqui..." class="ex-textarea" rows="4"></textarea>
          </div>
        </div>
        <div class="ex-modal-footer">
          <button class="btn-secondary" onclick="ExSys._closeModal('${modalId}')">Cancelar</button>
          <button class="btn-primary" onclick="ExSys._salvarAviso('${turmaId}', '${modalId}')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2L11 13"/><path d="M22 2L15 22 11 13 2 9l20-7z"/></svg>
            Publicar Aviso
          </button>
        </div>
      </div>
    </div>
  `;

  _showModal(html);
}

function _salvarAviso(turmaId, modalId) {
  const title = (document.getElementById('aviso-title')?.value || '').trim();
  const content = (document.getElementById('aviso-content')?.value || '').trim();

  if (!title) { _exToast('Digite o título do aviso.', 'error'); return; }
  if (!content) { _exToast('Digite o conteúdo do aviso.', 'error'); return; }

  fetch(`${API_BASE}/api/turmas/${turmaId}/avisos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, content })
  })
  .then(res => { if (!res.ok) throw new Error('Erro'); return res.json(); })
  .then(() => {
    _exToast('✅ Aviso publicado!', 'success');
    _closeModal(modalId);
    
    const _rs = _getAppState();
    if (_rs && _rs.currentTurma) {
      window.App.abrirTurma(_rs.currentTurma.id);
    }
  })
  .catch(() => _exToast('Erro ao publicar aviso.', 'error'));
}

function renderAvisosTabContent() {
  const panel = document.getElementById('turma-tab-avisos');
  if (!panel) return;

  const _s = _getAppState();
  if (!_s) return;
  const turmaId = _s.currentTurma ? _s.currentTurma.id : null;
  const user = _s.user || null;
  if (!turmaId || !user) return;

  const isProfessor = user.role === 'professor' && _s.currentTurma.professor_id === user.id;
  const avisos = (_s.currentTurma.avisos || []).slice().reverse();

  let html = '<div class="ex-container">';

  if (isProfessor) {
    html += `
      <div class="ex-prof-header">
        <h2 class="ex-section-title">📢 Avisos da Turma</h2>
        <button class="btn-primary" onclick="ExSys.openCreateAviso()">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Novo Aviso
        </button>
      </div>`;
  } else {
    html += '<h2 class="ex-section-title">📢 Avisos</h2>';
  }

  if (!avisos.length) {
    html += '<div class="ex-empty"><div class="ex-empty-icon">📢</div><p>Nenhum aviso publicado ainda.</p></div>';
  } else {
    html += '<div class="ex-list">';
    avisos.forEach(aviso => {
      const data = aviso.createdAt ? new Date(aviso.createdAt).toLocaleDateString('pt-BR') : '';
      html += `
        <div class="ex-card aviso-card">
          <div class="ex-card-header">
            <div>
              <div class="ex-card-title">📌 ${_escHtml(aviso.title)}</div>
              ${data ? `<div class="ex-card-meta">📅 ${data}</div>` : ''}
            </div>
          </div>
          <div class="aviso-content-text">${_escHtml(aviso.content)}</div>
        </div>`;
    });
    html += '</div>';
  }

  html += '</div>';
  panel.innerHTML = html;
}


(function injectAvisoStyles() {
  if (document.getElementById('aviso-extra-styles')) return;
  const s = document.createElement('style');
  s.id = 'aviso-extra-styles';
  s.textContent = `
    .aviso-card { padding: 20px 24px !important; }
    .aviso-content-text { margin-top: 12px; color: var(--text-1, #b8a89a); font-size: 15px; line-height: 1.6; white-space: pre-wrap; }
  `;
  (document.head || document.documentElement).appendChild(s);
})();

window.ExSys = {
  openCreateExercicio,
  openResponder,
  openResultados,
  exportPdf,
  deleteExercicio,
  renderExerciciosTabContent,
  _addQuestao: _addQuestao,
  _removeQuestao: _removeQuestao,
  _updateEnunciado: _updateEnunciado,
  _updateValor: _updateValor,
  _updateAlt: _updateAlt,
  _setCorreta: _setCorreta,
  _addAlt: _addAlt,
  _salvarExercicio: _salvarExercicio,
  _responderMarcar: _responderMarcar,
  _concluirExercicio: _concluirExercicio,
  _salvarCorrecao: _salvarCorrecao,
  _exportarCsvResultados: _exportarCsvResultados,
  _closeModal: _closeModal,
  _closeOnOverlay: _closeOnOverlay,
  _exShareGlobally: _exShareGlobally,
  _exImportFromGlobal: _exImportFromGlobal,
  openGlobalBank,
  _toggleAIGenerator,
  _gerarQuestoesIA,
  _gerarCorrecaoIA,
  _addAIGeneratedToExercise,
  _clearAIGenerated,
  openCreateAviso,
  _salvarAviso,
  renderAvisosTabContent,
};
document.addEventListener('DOMContentLoaded', () => {
  if (typeof window.App !== 'undefined') {
    window.App.openAddExercicioModal = () => ExSys.openCreateExercicio();
  }
});