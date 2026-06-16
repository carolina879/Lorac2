
const PrimeirosSocorros = (() => {

  let _state = {
    fase: 'menu',
    tipo: null,
    passo: 0,
    checklist: [],
    tempoDecorrido: 0,
    timerInterval: null,
    metronomeInterval: null,
    metronomeActive: false,
    tempoTotal: 0,
    compressoes: 0,
    respiracoes: 0,
    completada: false,
    erros: [],
    checklistTotal: 0,
    checklistMarcados: 0,
  };

  let _audioCtx = null;
  function _getAudio() {
    if (!_audioCtx) {
      try { _audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e) {}
    }
    return _audioCtx;
  }
  function _beep(freq = 880, dur = 0.05, vol = 0.3) {
    const ctx = _getAudio();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = 'sine';
      gain.gain.setValueAtTime(vol, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + dur);
    } catch(e) {}
  }

  const SIMULACOES = {
    rcp: {
      titulo: 'RCP — Ressuscitação Cardiopulmonar',
      emoji: '❤️',
      cor: '#e85555',
      corLight: 'rgba(232,85,85,0.15)',
      descricao: 'Procedimento completo de RCP em adultos',
      tempo: 120,
      tempoLabel: '~2 min',
      dificuldade: 'Essencial',
      passos: [
        {
          num: 1, titulo: 'Verificar Segurança', icone: '👀',
          instrucoes: 'Certifique-se de que o ambiente é seguro. Cheque se a vítima responde: chacoalhe os ombros e chame em voz alta. Se não responder, acione imediatamente o SAMU (192).',
          checklist: ['Ambiente seguro verificado', 'Vítima não responde ao chamado', 'SAMU (192) acionado', 'DEA solicitado se disponível'],
          duracao: 15, urgencia: 'alta',
        },
        {
          num: 2, titulo: 'Posicionar a Vítima', icone: '🛏️',
          instrucoes: 'Deite a vítima de costas em superfície firme e plana. Se suspeitar de trauma cervical, minimize o movimento do pescoço. Ajoelhe-se ao lado da vítima.',
          checklist: ['Vítima deitada de costas', 'Superfície firme e plana', 'Espaço adequado ao redor'],
          duracao: 10, urgencia: 'media',
        },
        {
          num: 3, titulo: 'Abrir Via Aérea', icone: '🌬️',
          instrucoes: 'Coloque uma mão na testa e incline a cabeça para trás. Com os dedos da outra mão sob o queixo, levante-o. Observe por no máximo 10 segundos se há respiração normal.',
          checklist: ['Cabeça inclinada para trás', 'Queixo levantado', 'Respiração verificada (≤10s)'],
          duracao: 10, urgencia: 'alta',
        },
        {
          num: 4, titulo: 'Compressões Torácicas', icone: '🤛',
          instrucoes: 'Entrelace os dedos e posicione o calcanhar da mão no centro do tórax. Braços esticados, comprima 5–6 cm no ritmo de 100–120 compressões/min. Use o metrônomo abaixo!',
          checklist: ['Mãos no centro do tórax', 'Profundidade 5–6 cm', 'Ritmo 100–120 bpm', 'Braços estendidos', '30 compressões realizadas'],
          duracao: 60, urgencia: 'alta',
          compressionesAlvo: 30,
          metrônomo: true,
        },
        {
          num: 5, titulo: 'Respirações de Resgate', icone: '💨',
          instrucoes: 'Após 30 compressões, faça 2 respirações de resgate de ~1 segundo cada. Veja o tórax expandir. Se o tórax não subir, reposicione a cabeça e tente novamente. Ratio: 30:2.',
          checklist: ['2 respirações de resgate', 'Tórax expandiu', 'Sem vazamento lateral', 'Duração ~1s cada'],
          duracao: 10, urgencia: 'media',
          respiracoesAlvo: 2,
        },
        {
          num: 6, titulo: 'Ciclo Contínuo 30:2', icone: '🔄',
          instrucoes: 'Continue o ciclo 30 compressões → 2 respirações sem interrupções. Troque o socorrista a cada 2 minutos se possível. Pare apenas se a vítima mostrar sinais de vida, DEA estiver pronto, ou SAMU assumir.',
          checklist: ['Ciclo 30:2 mantido', 'Trocas a cada 2 min', 'Pausas mínimas (<10s)', 'Monitorando sinais de vida'],
          duracao: 30, urgencia: 'alta',
        },
      ],
    },

    engasgo: {
      titulo: 'Engasgo — Manobra de Heimlich',
      emoji: '🫁',
      cor: '#e8a04a',
      corLight: 'rgba(232,160,74,0.15)',
      descricao: 'Desobstrução de vias aéreas em adultos e crianças',
      tempo: 60,
      tempoLabel: '~1 min',
      dificuldade: 'Essencial',
      passos: [
        {
          num: 1, titulo: 'Reconhecer o Engasgo', icone: '❓',
          instrucoes: 'Sinais: vítima segura o pescoço com as mãos, incapaz de falar, tossir ou respirar. Pergunte em voz alta: "Você está engasgado?". Se tossir com força, encoraje-a a continuar.',
          checklist: ['Perguntou "Está engasgado?"', 'Tosse inefetiva confirmada', 'Pediu ajuda ao redor'],
          duracao: 8, urgencia: 'alta',
        },
        {
          num: 2, titulo: 'Posicionar Atrás', icone: '🚪',
          instrucoes: 'Fique em pé atrás da vítima. Para crianças, ajoelhe-se. Envolva os braços pela cintura da vítima. Incline-a levemente para frente.',
          checklist: ['Posicionado atrás', 'Braços pela cintura', 'Vítima inclinada para frente'],
          duracao: 8, urgencia: 'media',
        },
        {
          num: 3, titulo: 'Localizar o Ponto', icone: '👊',
          instrucoes: 'Faça um punho com uma mão e posicione-o com o polegar para dentro, logo acima do umbigo e abaixo do esterno (processo xifoide). Cubra o punho com a outra mão.',
          checklist: ['Punho acima do umbigo', 'Abaixo do esterno', 'Polegar virado para dentro', 'Mão por cima'],
          duracao: 10, urgencia: 'alta',
        },
        {
          num: 4, titulo: 'Compressões Abdominais', icone: '⬆️',
          instrucoes: 'Execute compressões rápidas e fortes para dentro e para cima. Cada compressão deve ser um movimento distinto. Repita até o objeto sair ou a vítima perder consciência.',
          checklist: ['Compressões para dentro e para cima', 'Movimentos firmes e distintos', 'Objeto expelido ou tosse efetiva'],
          duracao: 20, urgencia: 'alta',
        },
        {
          num: 5, titulo: 'Se Inconsciente', icone: '🔄',
          instrucoes: 'Se a vítima perder consciência, deite-a com cuidado no chão e inicie RCP. A cada abertura de via aérea, verifique se o objeto está visível — remova-o com os dedos APENAS se visível.',
          checklist: ['Vítima deitada com cuidado', 'RCP iniciado se necessário', 'Objeto verificado na abertura de vias'],
          duracao: 15, urgencia: 'alta',
        },
      ],
    },

    queimaduras: {
      titulo: 'Queimaduras — Primeiros Socorros',
      emoji: '🔥',
      cor: '#ff7043',
      corLight: 'rgba(255,112,67,0.15)',
      descricao: 'Tratamento correto para queimaduras de 1º, 2º e 3º grau',
      tempo: 90,
      tempoLabel: '~1.5 min',
      dificuldade: 'Importante',
      passos: [
        {
          num: 1, titulo: 'Avaliar e Classificar', icone: '📏',
          instrucoes: '1º Grau: vermelhidão, sem bolhas (ex: solar). 2º Grau: bolhas, pele úmida, muito doloroso. 3º Grau: pele carbonizada ou branca, sem dor (nervos destruídos). Estime a área afetada.',
          checklist: ['Grau identificado (1º/2º/3º)', 'Extensão avaliada', 'Ambiente seguro'],
          duracao: 15, urgencia: 'media',
        },
        {
          num: 2, titulo: 'Afastar da Fonte', icone: '🧯',
          instrucoes: 'Se roupa em chamas: DEITAR-ROLAR (Stop, Drop, Roll). Não remova roupas grudadas na pele. Remova roupas e acessórios SOLTOS ao redor da queimadura.',
          checklist: ['Afastado da fonte de calor', 'Roupas grudadas: NÃO removidas', 'Roupas soltas ao redor: removidas'],
          duracao: 15, urgencia: 'alta',
        },
        {
          num: 3, titulo: 'Resfriar com Água', icone: '💧',
          instrucoes: 'Aplique água corrente fria (15–25°C) por 20 minutos para 1º e 2º grau. NUNCA use gelo, creme, pasta de dente ou manteiga. Queimaduras 3º grau: cubra apenas, não resfrie.',
          checklist: ['Água fria corrente por 20 min', 'Temperatura da água adequada (15–25°C)', 'SEM gelo, SEM cremes', 'Bolhas: não estourar'],
          duracao: 30, urgencia: 'alta',
        },
        {
          num: 4, titulo: 'Remover Joias', icone: '⌚',
          instrucoes: 'ANTES do inchaço: remova anéis, pulseiras, relógios e cintos próximos à área. Se já houver inchaço, NÃO force a remoção. Nunca retire objeto preso na queimadura.',
          checklist: ['Joias removidas antes do inchaço', 'Objetos presos: não removidos', 'Verificado inchaço'],
          duracao: 10, urgencia: 'media',
        },
        {
          num: 5, titulo: 'Cobrir a Queimadura', icone: '🩹',
          instrucoes: 'Use gaze estéril úmida ou pano limpo e levemente úmido. NÃO use algodão (gruda). Envolva sem apertar. Para 3º grau: use gaze seca. Não aplique nenhum produto na ferida.',
          checklist: ['Cobertura estéril aplicada', 'SEM algodão direto', 'Não muito apertado', 'SEM produtos tópicos'],
          duracao: 10, urgencia: 'media',
        },
        {
          num: 6, titulo: 'Monitorar e Encaminhar', icone: '🏥',
          instrucoes: 'Sempre acione emergência para queimaduras 2º/3º grau, face, mãos, genitais, articulações ou extensas. Observe sinais de choque (palidez, sudorese, confusão). Mantenha a vítima aquecida.',
          checklist: ['SAMU acionado para 2º/3º grau', 'Sinais de choque monitorados', 'Vítima aquecida e confortável'],
          duracao: 10, urgencia: 'alta',
        },
      ],
    },

    avc: {
      titulo: 'AVC — Acidente Vascular Cerebral',
      emoji: '🧠',
      cor: '#7c4dff',
      corLight: 'rgba(124,77,255,0.15)',
      descricao: 'Identificar e agir rápido no AVC: tempo é cérebro!',
      tempo: 45,
      tempoLabel: '~45 seg',
      dificuldade: 'Reconhecimento',
      passos: [
        {
          num: 1, titulo: 'Teste F.A.C.E.', icone: '😮',
          instrucoes: 'Use o protocolo FACE para reconhecer AVC:\n• FACE: Peça para sorrir — um lado cai?\n• ARMS: Levante os dois braços — um cai?\n• SPEECH: Fale uma frase — está arrastada?\n• TIME: Hora dos sintomas! Ligue 192.',
          checklist: ['F: Assimetria facial verificada', 'A: Fraqueza nos braços verificada', 'S: Fala arrastada verificada', 'T: Hora dos sintomas anotada'],
          duracao: 15, urgencia: 'alta',
        },
        {
          num: 2, titulo: 'Acionar Emergência', icone: '📞',
          instrucoes: 'Ligue IMEDIATAMENTE para o SAMU (192). Informe: localização exata, sintomas observados e horário de início. NÃO perca tempo tentando levar ao hospital sozinho — ambulância é mais rápida e segura.',
          checklist: ['SAMU 192 acionado', 'Localização informada', 'Horário dos sintomas informado', 'Sintomas descritos'],
          duracao: 10, urgencia: 'alta',
        },
        {
          num: 3, titulo: 'Posicionar e Monitorar', icone: '🛋️',
          instrucoes: 'Deite a vítima de costas com a cabeça e ombros levemente elevados (≈30°). NÃO ofereça água, alimento ou medicamentos. Se inconsciente mas respirando, posição lateral de segurança (PLS).',
          checklist: ['Vítima deitada com cabeça elevada', 'SEM água ou medicamentos', 'Consciente: tranquilizar', 'Inconsciente: PLS se respirando'],
          duracao: 10, urgencia: 'alta',
        },
        {
          num: 4, titulo: 'Enquanto Aguarda', icone: '⏱️',
          instrucoes: 'Mantenha a vítima calma e aquecida. Anote qualquer mudança nos sintomas. Se parar de respirar, inicie RCP. NÃO dê AAS (aspirina) sem orientação médica. Guarde todos os medicamentos que a vítima toma.',
          checklist: ['Vítima calma e aquecida', 'Sintomas monitorados', 'Medicamentos da vítima separados', 'RCP pronto se necessário'],
          duracao: 10, urgencia: 'media',
        },
      ],
    },

    afogamento: {
      titulo: 'Afogamento — Resgate e RCP',
      emoji: '🌊',
      cor: '#26c6da',
      corLight: 'rgba(38,198,218,0.15)',
      descricao: 'Resgate seguro e primeiros socorros no afogamento',
      tempo: 90,
      tempoLabel: '~1.5 min',
      dificuldade: 'Avançado',
      passos: [
        {
          num: 1, titulo: 'Segurança do Resgate', icone: '🏊',
          instrucoes: 'NUNCA entre na água sem equipamento se não for nadador treinado. Prefira: lançar corda/bóia, usar vara/toalha, ou usar embarcação. "Alcance, Jogue, Não Vá" é a regra de ouro.',
          checklist: ['Avaliou própria segurança', 'Tentou alcançar com objeto', 'Acionou socorro/bombeiros', 'Entrou na água apenas como último recurso'],
          duracao: 15, urgencia: 'alta',
        },
        {
          num: 2, titulo: 'Retirar da Água', icone: '🦺',
          instrucoes: 'Ao retirar: mantenha o rosto fora da água. Se possível, mantenha a vítima horizontal. Não tente drenar a água dos pulmões — não funciona e perde tempo vital.',
          checklist: ['Vítima retirada com cuidado', 'Rosto mantido fora da água', 'SEM tentar drenar pulmões'],
          duracao: 15, urgencia: 'alta',
        },
        {
          num: 3, titulo: 'Verificar Respiração', icone: '👂',
          instrucoes: 'Deite em superfície firme. Verifique se respira (Ver, Ouvir, Sentir — máx 10s). Afogados precisam de ventilação ANTES das compressões (diferente do padrão). Inicie com 5 respirações de resgate.',
          checklist: ['Superfície firme', 'Respiração verificada (≤10s)', '5 respirações de resgate iniciais', 'SAMU acionado'],
          duracao: 15, urgencia: 'alta',
        },
        {
          num: 4, titulo: 'RCP Adaptado', icone: '❤️',
          instrucoes: 'Se sem pulso: inicie RCP com ritmo 30:2. Para afogados, mantenha ventilações — elas são críticas. Continue até a vítima respirar, chegada do SAMU ou exaustão.',
          checklist: ['RCP iniciado (30:2)', 'Ventilações mantidas', 'Troca de socorrista a cada 2 min', 'SAMU monitorado'],
          duracao: 30, urgencia: 'alta',
          compressionesAlvo: 30,
          metrônomo: true,
        },
        {
          num: 5, titulo: 'Cuidados Pós-Resgate', icone: '🌡️',
          instrucoes: 'Mesmo recuperando consciência, SEMPRE encaminhe ao hospital. Pode ocorrer "afogamento secundário" horas depois. Mantenha aquecido. Vítimas de água fria podem recuperar após longos períodos de RCP.',
          checklist: ['Hospital mesmo se recuperou', 'Aquecimento iniciado', 'Monitorando respiração', 'Família informada'],
          duracao: 15, urgencia: 'media',
        },
      ],
    },
  };

  function _injectCSS() {
    if (document.getElementById('ps-css')) return;
    const s = document.createElement('style');
    s.id = 'ps-css';
    s.textContent = `
      #ps-overlay {
        position: fixed; inset: 0;
        background: rgba(0,0,0,0.92);
        backdrop-filter: blur(12px);
        z-index: 10000;
        display: flex; align-items: center; justify-content: center;
        font-family: var(--font-sans, 'DM Sans', sans-serif);
        animation: ps-fadein .3s ease;
        padding: 16px;
      }
      @keyframes ps-fadein { from { opacity:0; transform: scale(0.97) } to { opacity:1; transform: scale(1) } }
      @keyframes ps-pulse { 0%,100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(232,85,85,0.6) } 50% { transform: scale(1.08); box-shadow: 0 0 0 12px rgba(232,85,85,0) } }
      @keyframes ps-metro { 0% { transform: scale(1); background: #e85555 } 10% { transform: scale(1.35); background: #ff6b6b } 100% { transform: scale(1) } }
      @keyframes ps-ring { from { stroke-dashoffset: 251.2 } to { stroke-dashoffset: 0 } }
      @keyframes ps-shine { 0%,100% { opacity:0 } 50% { opacity:1 } }
      @keyframes ps-checkanim { from { transform: scale(0); opacity:0 } to { transform: scale(1); opacity:1 } }
      @keyframes ps-stepenter { from { opacity:0; transform: translateY(10px) } to { opacity:1; transform: translateY(0) } }

      #ps-box {
        background: var(--bg-1, #151210);
        border: 1px solid rgba(255,255,255,0.08);
        border-radius: 24px;
        width: 100%; max-width: 660px;
        max-height: 92vh;
        display: flex; flex-direction: column;
        overflow: hidden;
        box-shadow: 0 40px 100px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.05);
      }

      .ps-header {
        display: flex; align-items: center; gap: 14px;
        padding: 18px 20px;
        border-bottom: 1px solid rgba(255,255,255,0.06);
        background: linear-gradient(135deg, var(--bg-2, #1a1612), var(--bg-1, #151210));
        flex-shrink: 0;
      }
      .ps-header-icon {
        width: 44px; height: 44px; border-radius: 12px;
        background: linear-gradient(135deg, rgba(232,85,85,0.2), rgba(232,85,85,0.05));
        border: 1px solid rgba(232,85,85,0.25);
        display: flex; align-items: center; justify-content: center;
        font-size: 22px; flex-shrink: 0;
      }
      .ps-header-info { flex: 1; min-width: 0; }
      .ps-header-title {
        margin: 0; font-size: 17px; font-weight: 700;
        color: var(--text-0, #f0e8df);
        font-family: var(--font-display, 'DM Serif Display', serif);
        letter-spacing: -0.01em;
      }
      .ps-header-sub {
        margin: 2px 0 0; font-size: 11.5px;
        color: var(--text-2, #8a7a6a);
      }
      .ps-close-btn {
        background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08);
        cursor: pointer; color: var(--text-2, #8a7a6a); font-size: 16px;
        padding: 0; width: 30px; height: 30px; border-radius: 8px;
        display: flex; align-items: center; justify-content: center;
        transition: all .15s; flex-shrink: 0;
      }
      .ps-close-btn:hover { background: rgba(232,85,85,0.15); color: #e85555; border-color: rgba(232,85,85,0.3); }

      .ps-body {
        flex: 1; overflow-y: auto; padding: 20px;
        display: flex; flex-direction: column; gap: 16px;
        scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.1) transparent;
      }


      .ps-menu-title {
        font-size: 13px; font-weight: 700; letter-spacing: .08em;
        text-transform: uppercase; color: var(--text-2, #8a7a6a);
        margin-bottom: 4px;
      }
      .ps-menu-grid {
        display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
        gap: 10px;
      }
      .ps-card {
        display: flex; flex-direction: column; gap: 8px;
        padding: 16px 14px;
        background: var(--bg-2, #1a1612);
        border: 1.5px solid rgba(255,255,255,0.07);
        border-radius: 16px; cursor: pointer;
        transition: all .2s cubic-bezier(.4,0,.2,1);
        position: relative; overflow: hidden;
      }
      .ps-card::before {
        content: ''; position: absolute; inset: 0;
        background: var(--card-color, rgba(232,160,74,0.05));
        opacity: 0; transition: opacity .2s;
      }
      .ps-card:hover { border-color: var(--card-accent, #e8a04a); transform: translateY(-3px); box-shadow: 0 12px 32px rgba(0,0,0,0.4); }
      .ps-card:hover::before { opacity: 1; }
      .ps-card-top { display: flex; align-items: center; justify-content: space-between; }
      .ps-card-emoji { font-size: 28px; line-height: 1; }
      .ps-card-badge {
        font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: .06em;
        padding: 3px 7px; border-radius: 20px;
        background: var(--card-color, rgba(232,160,74,0.15));
        color: var(--card-accent, #e8a04a);
        border: 1px solid var(--card-accent, rgba(232,160,74,0.3));
      }
      .ps-card-label {
        font-size: 14px; font-weight: 700; color: var(--text-0, #f0e8df); line-height: 1.2;
      }
      .ps-card-sub {
        font-size: 11px; color: var(--text-2, #8a7a6a); line-height: 1.35;
      }
      .ps-card-footer {
        display: flex; align-items: center; gap: 6px; margin-top: 4px;
        font-size: 11px; color: var(--text-2, #8a7a6a);
      }
      .ps-card-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--card-accent, #e8a04a); }

      .ps-sim-bar {
        display: flex; justify-content: space-between; align-items: center;
        padding-bottom: 14px; border-bottom: 1px solid rgba(255,255,255,0.06);
      }
      .ps-sim-info { display: flex; flex-direction: column; gap: 2px; }
      .ps-sim-label {
        font-size: 11px; color: var(--text-2, #8a7a6a); font-weight: 600;
        text-transform: uppercase; letter-spacing: .07em;
      }
      .ps-sim-title {
        font-size: 15px; font-weight: 700; color: var(--text-0, #f0e8df);
      }
      .ps-sim-actions { display: flex; gap: 6px; }
      .ps-btn-tiny {
        padding: 5px 11px; font-size: 11.5px; font-weight: 600;
        background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
        border-radius: 8px; cursor: pointer; color: var(--text-1, #c8b89a);
        transition: all .2s;
      }
      .ps-btn-tiny:hover { border-color: rgba(255,255,255,0.25); color: var(--text-0, #f0e8df); }

    
      .ps-progress-wrap { display: flex; align-items: center; gap: 10px; }
      .ps-progress {
        flex: 1; height: 5px;
        background: rgba(255,255,255,0.07);
        border-radius: 99px; overflow: hidden;
      }
      .ps-progress-fill {
        height: 100%; border-radius: 99px;
        background: var(--ps-accent, linear-gradient(90deg, #e8a04a, #f0c060));
        transition: width .5s cubic-bezier(.4,0,.2,1);
      }
      .ps-progress-label {
        font-size: 11px; color: var(--text-2, #8a7a6a); font-weight: 600;
        white-space: nowrap;
      }

      .ps-passo {
        background: var(--bg-2, #1a1612);
        border: 1px solid rgba(255,255,255,0.07);
        border-radius: 16px; padding: 16px;
        animation: ps-stepenter .25s ease;
      }
      .ps-passo-header {
        display: flex; align-items: center; gap: 12px; margin-bottom: 12px;
      }
      .ps-passo-num {
        width: 34px; height: 34px; flex-shrink: 0;
        display: flex; align-items: center; justify-content: center;
        background: var(--passo-bg, linear-gradient(135deg, #e8a04a, #f0c060));
        border-radius: 10px; font-weight: 800; color: #151210;
        font-size: 14px;
      }
      .ps-passo-icone { font-size: 18px; }
      .ps-passo-info { flex: 1; }
      .ps-passo-titulo {
        font-size: 15px; font-weight: 700; color: var(--text-0, #f0e8df); margin: 0;
      }
      .ps-urgencia {
        display: inline-flex; align-items: center; gap: 4px;
        font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .06em;
        padding: 2px 7px; border-radius: 20px; margin-top: 3px;
      }
      .ps-urgencia.alta { background: rgba(232,85,85,0.15); color: #e85555; border: 1px solid rgba(232,85,85,0.25); }
      .ps-urgencia.media { background: rgba(232,160,74,0.15); color: #e8a04a; border: 1px solid rgba(232,160,74,0.25); }
      .ps-urgencia.baixa { background: rgba(100,200,100,0.12); color: #78c850; border: 1px solid rgba(100,200,100,0.2); }

      .ps-passo-instrucoes {
        font-size: 13.5px; line-height: 1.65; color: var(--text-1, #c8b89a);
        margin: 0 0 14px; padding: 0; white-space: pre-line;
      }


      .ps-timer-visual {
        display: flex; align-items: center; gap: 14px;
        background: rgba(232,160,74,.06); border: 1px solid rgba(232,160,74,.18);
        border-radius: 12px; padding: 12px 16px; margin: 12px 0;
      }
      .ps-timer-ring { position: relative; width: 48px; height: 48px; flex-shrink: 0; }
      .ps-timer-ring svg { transform: rotate(-90deg); }
      .ps-timer-ring-track { fill: none; stroke: rgba(232,160,74,.15); stroke-width: 4; }
      .ps-timer-ring-fill { fill: none; stroke: #e8a04a; stroke-width: 4; stroke-linecap: round; transition: stroke-dashoffset .9s linear; }
      .ps-timer-ring-text { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; color: #e8a04a; font-family: 'DM Mono', monospace; }
      .ps-timer-info { flex: 1; }
      .ps-timer-label { font-size: 11px; color: var(--text-2, #8a7a6a); font-weight: 600; text-transform: uppercase; letter-spacing: .06em; }
      .ps-timer-count { font-size: 22px; font-family: 'DM Mono', monospace; font-weight: 700; color: var(--text-0, #f0e8df); line-height: 1.2; }

      .ps-metronome {
        background: rgba(232,85,85,.06); border: 1px solid rgba(232,85,85,.2);
        border-radius: 12px; padding: 16px;
        display: flex; flex-direction: column; align-items: center; gap: 12px; margin: 8px 0;
      }
      .ps-metro-header { display: flex; justify-content: space-between; align-items: center; width: 100%; }
      .ps-metro-label { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: .07em; color: #e85555; }
      .ps-metro-bpm { font-size: 12px; color: var(--text-2, #8a7a6a); }
      .ps-metro-dots { display: flex; gap: 8px; align-items: center; }
      .ps-metro-dot {
        width: 14px; height: 14px; border-radius: 50%;
        background: rgba(232,85,85,0.2);
        transition: all .08s;
      }
      .ps-metro-dot.beat {
        animation: ps-metro .5s ease forwards;
      }
      .ps-metro-btn {
        padding: 8px 20px; border-radius: 10px; border: none;
        font-size: 13px; font-weight: 700; cursor: pointer;
        transition: all .2s;
      }
      .ps-metro-btn.on {
        background: linear-gradient(135deg, #e85555, #ff7070);
        color: white; box-shadow: 0 4px 12px rgba(232,85,85,0.3);
      }
      .ps-metro-btn.off {
        background: rgba(255,255,255,0.06);
        border: 1px solid rgba(255,255,255,0.12);
        color: var(--text-1, #c8b89a);
      }
      .ps-compress-counter {
        display: flex; align-items: baseline; gap: 4px;
        font-size: 11px; color: var(--text-2, #8a7a6a);
      }
      .ps-compress-num {
        font-size: 28px; font-family: 'DM Mono', monospace; font-weight: 700;
        color: #e85555; line-height: 1;
      }


      .ps-checklist { display: flex; flex-direction: column; gap: 7px; margin-top: 14px; }
      .ps-checklist-title {
        font-size: 11px; font-weight: 700; color: var(--text-2, #8a7a6a);
        text-transform: uppercase; letter-spacing: .07em; margin-bottom: 2px;
      }
      .ps-check-item {
        display: flex; align-items: center; gap: 10px;
        padding: 9px 12px; background: rgba(0,0,0,.2);
        border: 1px solid rgba(255,255,255,0.05);
        border-radius: 10px; cursor: pointer;
        transition: all .15s; user-select: none;
      }
      .ps-check-item:hover { background: rgba(255,255,255,0.04); border-color: rgba(255,255,255,0.1); }
      .ps-check-item.done { background: rgba(120,200,80,.08); border-color: rgba(120,200,80,.2); }
      .ps-check-box {
        width: 20px; height: 20px; min-width: 20px;
        border: 2px solid rgba(255,255,255,0.2);
        border-radius: 6px; display: flex;
        align-items: center; justify-content: center;
        font-size: 12px; transition: all .2s;
      }
      .ps-check-item.done .ps-check-box {
        border-color: #78c850; background: rgba(120,200,80,.2); color: #78c850;
        animation: ps-checkanim .2s ease;
      }
      .ps-check-label {
        font-size: 13px; color: var(--text-1, #c8b89a); line-height: 1.4; flex: 1;
      }
      .ps-check-item.done .ps-check-label { color: rgba(120,200,80,0.9); }


      .ps-btn-group {
        display: flex; gap: 10px; margin-top: 16px;
      }
      .ps-btn {
        flex: 1; padding: 11px; font-size: 13.5px; font-weight: 700;
        border-radius: 11px; border: none; cursor: pointer;
        transition: all .2s; letter-spacing: .01em;
      }
      .ps-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none !important; }
      .ps-btn-primary {
        background: linear-gradient(135deg, #e8a04a, #f0c060);
        color: #151210;
        box-shadow: 0 4px 12px rgba(232,160,74,0.2);
      }
      .ps-btn-primary:hover:not(:disabled) {
        transform: translateY(-2px); box-shadow: 0 8px 20px rgba(232,160,74,.35);
      }
      .ps-btn-secondary {
        background: rgba(255,255,255,0.04);
        border: 1px solid rgba(255,255,255,0.1);
        color: var(--text-0, #f0e8df);
      }
      .ps-btn-secondary:hover:not(:disabled) { background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.2); }


      .ps-score-bar {
        display: flex; align-items: center; gap: 8px; padding: 10px 14px;
        background: rgba(255,255,255,0.03); border-radius: 10px;
        border: 1px solid rgba(255,255,255,0.07);
        font-size: 12px; color: var(--text-2, #8a7a6a);
      }
      .ps-score-fill { height: 4px; flex: 1; background: rgba(255,255,255,0.08); border-radius: 4px; overflow: hidden; }
      .ps-score-fill-inner { height: 100%; border-radius: 4px; background: linear-gradient(90deg, #e85555, #e8a04a, #78c850); transition: width .6s ease; }

      .ps-resultado { text-align: center; padding: 12px 8px; }
      .ps-resultado-emoji {
        font-size: 72px; line-height: 1; margin-bottom: 14px;
        filter: drop-shadow(0 8px 24px rgba(255,255,255,0.1));
      }
      .ps-resultado-titulo {
        font-size: 22px; font-weight: 700; color: var(--text-0, #f0e8df);
        margin: 0 0 8px; font-family: var(--font-display, 'DM Serif Display', serif);
      }
      .ps-resultado-desc { font-size: 13px; color: var(--text-1, #c8b89a); margin: 0 0 20px; }
      .ps-grade {
        display: inline-flex; align-items: center; gap: 8px;
        padding: 8px 20px; border-radius: 99px; margin-bottom: 20px;
        font-size: 15px; font-weight: 700;
      }
      .ps-grade.s { background: rgba(120,200,80,0.15); color: #78c850; border: 1px solid rgba(120,200,80,0.3); }
      .ps-grade.a { background: rgba(232,160,74,0.15); color: #e8a04a; border: 1px solid rgba(232,160,74,0.3); }
      .ps-grade.b { background: rgba(100,160,255,0.12); color: #7eb0ff; border: 1px solid rgba(100,160,255,0.25); }
      .ps-grade.c { background: rgba(200,150,100,0.12); color: #c89664; border: 1px solid rgba(200,150,100,0.2); }
      .ps-resultado-stats {
        display: grid; grid-template-columns: 1fr 1fr;
        gap: 10px; margin: 4px 0 20px;
      }
      .ps-stat-box {
        background: var(--bg-2, #1a1612); border: 1px solid rgba(255,255,255,0.07);
        border-radius: 12px; padding: 12px;
      }
      .ps-stat-label { font-size: 10.5px; color: var(--text-2, #8a7a6a); text-transform: uppercase; font-weight: 700; margin-bottom: 4px; letter-spacing: .06em; }
      .ps-stat-valor { font-size: 22px; font-weight: 700; color: #e8a04a; font-family: 'DM Mono', monospace; }
      .ps-aviso {
        font-size: 12px; color: var(--text-2, #8a7a6a);
        background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07);
        border-radius: 10px; padding: 12px; line-height: 1.5;
        margin-bottom: 16px; text-align: left;
      }
    `;
    document.head.appendChild(s);
  }

  function _renderMenu() {
    const body = document.getElementById('ps-body');
    body.innerHTML = `
      <div class="ps-menu-title">Escolha uma simulação</div>
      <div class="ps-menu-grid">
        ${Object.entries(SIMULACOES).map(([key, sim]) => `
          <div class="ps-card" style="--card-accent:${sim.cor};--card-color:${sim.corLight}"
               onclick="PrimeirosSocorros.iniciarSimulacao('${key}')">
            <div class="ps-card-top">
              <div class="ps-card-emoji">${sim.emoji}</div>
              <div class="ps-card-badge">${sim.dificuldade}</div>
            </div>
            <div class="ps-card-label">${sim.titulo.split('—')[0].trim()}</div>
            <div class="ps-card-sub">${sim.descricao}</div>
            <div class="ps-card-footer">
              <div class="ps-card-dot"></div>
              ${sim.passos.length} passos · ${sim.tempoLabel}
            </div>
          </div>
        `).join('')}
      </div>
      <div style="font-size:11.5px;color:var(--text-2,#8a7a6a);text-align:center;padding:4px 0 0;line-height:1.5;">
        ⚠️ Simulações educativas apenas. Em emergências reais, ligue <strong style="color:var(--text-1,#c8b89a)">192 (SAMU)</strong> imediatamente.
      </div>
    `;
  }


  function _renderSimulacao() {
    const sim = SIMULACOES[_state.tipo];
    const passo = sim.passos[_state.passo];
    const totalPassos = sim.passos.length;
    const progresso = ((_state.passo + 1) / totalPassos) * 100;
    const circumference = 2 * Math.PI * 20; // r=20

    if (!passo) return;
    const body = document.getElementById('ps-body');

    const total = _state.checklist.reduce((a, arr) => a + (arr ? arr.length : 0), 0);
    const marcados = _state.checklist.reduce((a, arr) => a + (arr ? arr.filter(Boolean).length : 0), 0);
    _state.checklistTotal = total;
    _state.checklistMarcados = marcados;

    
    const cor = sim.cor;
    const bgCor = sim.corLight;

    body.innerHTML = `
      <div class="ps-sim-bar">
        <div class="ps-sim-info">
          <div class="ps-sim-label">${sim.emoji} ${sim.titulo.split('—')[0].trim()}</div>
          <div class="ps-sim-title">${passo.icone} ${passo.titulo}</div>
        </div>
        <div class="ps-sim-actions">
          <button class="ps-btn-tiny" onclick="PrimeirosSocorros.sair()">✕ Sair</button>
          <button class="ps-btn-tiny" onclick="PrimeirosSocorros.duvidaIA()" style="border-color:var(--ps-accent);color:var(--ps-accent)">🤖 Ajuda IA</button>
        </div>
      </div>

      <div class="ps-progress-wrap">
        <div class="ps-progress">
          <div class="ps-progress-fill" style="width:${progresso}%;background:linear-gradient(90deg,${cor},${cor}cc)"></div>
        </div>
        <div class="ps-progress-label">${_state.passo + 1}/${totalPassos}</div>
      </div>

      ${total > 0 ? `
      <div class="ps-score-bar">
        <span>Progresso</span>
        <div class="ps-score-fill"><div class="ps-score-fill-inner" style="width:${total > 0 ? (marcados/total*100) : 0}%"></div></div>
        <span>${marcados}/${total} itens</span>
      </div>` : ''}

      <div class="ps-passo">
        <div class="ps-passo-header">
          <div class="ps-passo-num" style="background:linear-gradient(135deg,${cor},${cor}bb);color:#fff">${passo.num}</div>
          <div class="ps-passo-info">
            <h3 class="ps-passo-titulo">${passo.titulo}</h3>
            <div class="ps-urgencia ${passo.urgencia || 'media'}">
              ${passo.urgencia === 'alta' ? '🔴 Urgente' : passo.urgencia === 'media' ? '🟡 Atenção' : '🟢 Cuidado'}
            </div>
          </div>
          <div class="ps-passo-icone">${passo.icone}</div>
        </div>

        <p class="ps-passo-instrucoes">${passo.instrucoes}</p>

        <div class="ps-timer-visual">
          <div class="ps-timer-ring">
            <svg width="48" height="48" viewBox="0 0 48 48">
              <circle class="ps-timer-ring-track" cx="24" cy="24" r="20"/>
              <circle class="ps-timer-ring-fill" cx="24" cy="24" r="20"
                stroke-dasharray="${circumference}"
                stroke-dashoffset="${circumference}"
                id="ps-ring-fill"
                stroke="${cor}"/>
            </svg>
            <div class="ps-timer-ring-text" id="ps-timer-display" style="color:${cor}">${passo.duracao}</div>
          </div>
          <div class="ps-timer-info">
            <div class="ps-timer-label">Tempo estimado do passo</div>
            <div class="ps-timer-count" id="ps-timer-count">${passo.duracao}s</div>
          </div>
        </div>

        ${passo.metrônomo ? `
        <div class="ps-metronome">
          <div class="ps-metro-header">
            <div class="ps-metro-label">⚡ Metrônomo RCP</div>
            <div class="ps-metro-bpm">110 bpm (ideal)</div>
          </div>
          <div class="ps-metro-dots" id="ps-metro-dots">
            ${Array(8).fill(0).map((_,i) => `<div class="ps-metro-dot" id="ps-dot-${i}"></div>`).join('')}
          </div>
          <div style="display:flex;align-items:center;gap:14px">
            <button class="ps-metro-btn off" id="ps-metro-btn" onclick="PrimeirosSocorros.toggleMetronome()">
              ▶ Iniciar Metrônomo
            </button>
            <div class="ps-compress-counter">
              <span class="ps-compress-num" id="ps-compress-display">${_state.compressoes}</span>
              <span>/ ${passo.compressionesAlvo} compressões</span>
            </div>
          </div>
          <div style="font-size:11px;color:var(--text-2,#8a7a6a)">
            Clique no ritmo para contar compressões
            <button onclick="PrimeirosSocorros.addCompressao()" style="margin-left:8px;background:rgba(232,85,85,0.15);border:1px solid rgba(232,85,85,0.3);border-radius:6px;padding:3px 10px;font-size:11px;color:#e85555;cursor:pointer;font-weight:700">
              + Comprimir
            </button>
          </div>
        </div>
        ` : ''}

        ${passo.respiracoesAlvo ? `
        <div class="ps-timer-visual" style="background:rgba(100,200,255,.06);border-color:rgba(100,200,255,.2)">
          <div style="font-size:20px">💨</div>
          <div class="ps-timer-info">
            <div class="ps-timer-label">Respirações de resgate</div>
            <div class="ps-timer-count" id="ps-resp-display" style="color:#64c8ff">${_state.respiracoes} / ${passo.respiracoesAlvo}</div>
          </div>
          <button onclick="PrimeirosSocorros.addRespiracao()" style="padding:8px 14px;background:rgba(100,200,255,0.1);border:1px solid rgba(100,200,255,0.25);border-radius:8px;font-size:12px;color:#64c8ff;cursor:pointer;font-weight:700">
            + Soprar
          </button>
        </div>
        ` : ''}

        <div class="ps-checklist">
          <div class="ps-checklist-title">✅ Checklist do passo</div>
          ${passo.checklist.map((item, i) => `
            <div class="ps-check-item ${_state.checklist[_state.passo] && _state.checklist[_state.passo][i] ? 'done' : ''}"
                 onclick="PrimeirosSocorros.marcarCheckbox(${i})">
              <div class="ps-check-box">${_state.checklist[_state.passo] && _state.checklist[_state.passo][i] ? '✓' : ''}</div>
              <div class="ps-check-label">${item}</div>
            </div>
          `).join('')}
        </div>

        <div class="ps-btn-group">
          <button class="ps-btn ps-btn-secondary" onclick="PrimeirosSocorros.passoAnterior()" ${_state.passo === 0 ? 'disabled' : ''}>← Anterior</button>
          <button class="ps-btn ps-btn-primary" onclick="PrimeirosSocorros.proximoPasso()">
            ${_state.passo === totalPassos - 1 ? '🏁 Concluir' : 'Próximo →'}
          </button>
        </div>
      </div>
    `;


    _startTimer(passo.duracao);
  }

  let _timerStartTime = null;
  let _timerDuration = 0;
  let _timerRAF = null;

  function _startTimer(duracao) {
    _timerDuration = duracao;
    _timerStartTime = Date.now();
    const circumference = 2 * Math.PI * 20;

    if (_state.timerInterval) clearInterval(_state.timerInterval);
    _state.timerInterval = setInterval(() => {
      const elapsed = (Date.now() - _timerStartTime) / 1000;
      _state.tempoDecorrido += 1;
      const remaining = Math.max(0, _timerDuration - elapsed);
      const progress = elapsed / _timerDuration;

      const disp = document.getElementById('ps-timer-display');
      const cnt = document.getElementById('ps-timer-count');
      const ring = document.getElementById('ps-ring-fill');

      if (disp) disp.textContent = Math.ceil(remaining);
      if (cnt) cnt.textContent = Math.ceil(remaining) + 's';
      if (ring) {
        const offset = circumference - (Math.min(progress, 1) * circumference);
        ring.style.strokeDashoffset = offset;
      }
    }, 500);
  }


  let _metroDotIdx = 0;
  function toggleMetronome() {
    _state.metronomeActive = !_state.metronomeActive;
    const btn = document.getElementById('ps-metro-btn');
    if (btn) {
      btn.textContent = _state.metronomeActive ? '⏹ Parar Metrônomo' : '▶ Iniciar Metrônomo';
      btn.className = `ps-metro-btn ${_state.metronomeActive ? 'on' : 'off'}`;
    }

    if (_state.metronomeInterval) { clearInterval(_state.metronomeInterval); _state.metronomeInterval = null; }
    if (_state.metronomeActive) {
      const BPM = 110;
      const interval = (60 / BPM) * 1000;
      _metroDotIdx = 0;
      _state.metronomeInterval = setInterval(() => {
        const prevDot = document.getElementById(`ps-dot-${(_metroDotIdx + 7) % 8}`);
        if (prevDot) prevDot.classList.remove('beat');
        const dot = document.getElementById(`ps-dot-${_metroDotIdx}`);
        if (dot) { dot.classList.remove('beat'); void dot.offsetWidth; dot.classList.add('beat'); }
        _beep(_metroDotIdx === 0 ? 1046 : 880, 0.04, _metroDotIdx === 0 ? 0.4 : 0.2);
        _metroDotIdx = (_metroDotIdx + 1) % 8;
      }, interval);
    }
  }

  function addCompressao() {
    _state.compressoes++;
    const disp = document.getElementById('ps-compress-display');
    if (disp) disp.textContent = _state.compressoes;
    _beep(660, 0.04, 0.15);
  }

  function addRespiracao() {
    _state.respiracoes++;
    const disp = document.getElementById('ps-resp-display');
    if (disp) disp.textContent = `${_state.respiracoes} / ${SIMULACOES[_state.tipo].passos[_state.passo].respiracoesAlvo}`;
    _beep(440, 0.15, 0.2);
  }

  function _renderResultado() {
    const sim = SIMULACOES[_state.tipo];
    const body = document.getElementById('ps-body');
    const tempoMin = Math.floor(_state.tempoDecorrido / 60);
    const tempoSec = _state.tempoDecorrido % 60;

   
    const checkTotal = _state.checklist.reduce((a, arr) => a + (arr ? arr.length : 0), 0);
    const checkMarcados = _state.checklist.reduce((a, arr) => a + (arr ? arr.filter(Boolean).length : 0), 0);
    const pct = checkTotal > 0 ? Math.round(checkMarcados / checkTotal * 100) : 100;

    let grade, gradeText, gradeEmoji;
    if (pct >= 90) { grade='s'; gradeText='Excelente — S'; gradeEmoji='🥇'; }
    else if (pct >= 70) { grade='a'; gradeText='Muito Bom — A'; gradeEmoji='⭐'; }
    else if (pct >= 50) { grade='b'; gradeText='Bom — B'; gradeEmoji='👍'; }
    else { grade='c'; gradeText='Pratique Mais — C'; gradeEmoji='📚'; }

    body.innerHTML = `
      <div class="ps-resultado">
        <div class="ps-resultado-emoji">${gradeEmoji}</div>
        <h2 class="ps-resultado-titulo">Simulação Concluída!</h2>
        <p class="ps-resultado-desc">Você completou: <strong>${sim.titulo.split('—')[0].trim()}</strong></p>

        <div class="ps-grade ${grade}">${gradeText} · ${pct}% checklist</div>

        <div class="ps-resultado-stats">
          <div class="ps-stat-box">
            <div class="ps-stat-label">Tempo Total</div>
            <div class="ps-stat-valor">${tempoMin}m${tempoSec}s</div>
          </div>
          <div class="ps-stat-box">
            <div class="ps-stat-label">Passos</div>
            <div class="ps-stat-valor">${sim.passos.length}/${sim.passos.length}</div>
          </div>
          ${_state.compressoes > 0 ? `
          <div class="ps-stat-box">
            <div class="ps-stat-label">Compressões</div>
            <div class="ps-stat-valor">${_state.compressoes}</div>
          </div>` : ''}
          ${_state.respiracoes > 0 ? `
          <div class="ps-stat-box">
            <div class="ps-stat-label">Respirações</div>
            <div class="ps-stat-valor">${_state.respiracoes}</div>
          </div>` : ''}
          <div class="ps-stat-box">
            <div class="ps-stat-label">Checklist</div>
            <div class="ps-stat-valor">${checkMarcados}/${checkTotal}</div>
          </div>
          <div class="ps-stat-box">
            <div class="ps-stat-label">Score</div>
            <div class="ps-stat-valor" style="color:${pct>=90?'#78c850':pct>=70?'#e8a04a':'#7eb0ff'}">${pct}%</div>
          </div>
        </div>

        <div class="ps-aviso">
          ⚠️ <strong>Aviso:</strong> Esta é uma simulação educativa. Em emergência real, acione imediatamente o <strong>SAMU — 192</strong> ou <strong>Bombeiros — 193</strong>. Nenhuma simulação substitui treinamento presencial certificado.
        </div>

        <div class="ps-btn-group">
          <button class="ps-btn ps-btn-secondary" onclick="PrimeirosSocorros.abrir()">↩ Novo Treino</button>
          <button class="ps-btn ps-btn-primary" onclick="PrimeirosSocorros.fechar()">✓ Concluir</button>
        </div>
      </div>
    `;
  }


  function abrir() {
   
    document.querySelectorAll('.mt-dropdown-content').forEach(d => d.classList.remove('show'));

    document.getElementById('ps-overlay')?.remove();
    _injectCSS();
    _resetState();

    const overlay = document.createElement('div');
    overlay.id = 'ps-overlay';
    overlay.innerHTML = `
      <div id="ps-box">
        <div class="ps-header">
          <div class="ps-header-icon">🚑</div>
          <div class="ps-header-info">
            <h2 class="ps-header-title">Primeiros Socorros</h2>
            <p class="ps-header-sub">5 simulações interativas de emergência</p>
            <div style="display:flex;align-items:center;gap:12px">
              <h2 class="ps-header-title">Primeiros Socorros</h2>
              <span style="font-family:var(--font-mono, monospace);font-size:0.65rem;background:rgba(232,85,85,0.15);color:#e85555;border:1px solid rgba(232,85,85,0.3);padding:2px 8px;border-radius:20px;letter-spacing:0.06em;font-weight:700;">SAÚDE & EMERGÊNCIA</span>
            </div>
            <p class="ps-header-sub">Simulações interativas e procedimentos de salvamento</p>
          </div>
          <button class="ps-close-btn" onclick="PrimeirosSocorros.fechar()">✕</button>
        </div>
        <div class="ps-body" id="ps-body"></div>
      </div>
    `;
    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';
    overlay.addEventListener('click', e => { if (e.target === overlay) fechar(); });

    const handleEsc = e => { if (e.key === 'Escape') { fechar(); document.removeEventListener('keydown', handleEsc); } };
    document.addEventListener('keydown', handleEsc);

    _renderMenu();
  }

  function fechar() {
    _cleanup();
    document.getElementById('ps-overlay')?.remove();
    document.body.style.overflow = '';
  }

  function sair() { fechar(); }

  function iniciarSimulacao(tipo) {
    _state.tipo = tipo;
    _state.fase = 'simulacao';
    _state.passo = 0;
    _state.tempoDecorrido = 0;
    _state.compressoes = 0;
    _state.respiracoes = 0;
    _state.checklist = new Array(SIMULACOES[tipo].passos.length).fill(null).map(() => []);
    _cleanup();
    _renderSimulacao();
  }

  function proximoPasso() {
    const sim = SIMULACOES[_state.tipo];
    _cleanup();
    if (_state.passo < sim.passos.length - 1) {
      _state.passo++;
      _renderSimulacao();
    } else {
      _state.fase = 'resultado';
      _state.completada = true;
      _renderResultado();
    }
  }

  function passoAnterior() {
    if (_state.passo > 0) {
      _cleanup();
      _state.passo--;
      _renderSimulacao();
    }
  }

  function marcarCheckbox(index) {
    if (!_state.checklist[_state.passo]) _state.checklist[_state.passo] = [];
    _state.checklist[_state.passo][index] = !_state.checklist[_state.passo][index];
    _beep(_state.checklist[_state.passo][index] ? 880 : 440, 0.06, 0.15);

    const items = document.querySelectorAll('.ps-check-item');
    if (items[index]) {
      const done = _state.checklist[_state.passo][index];
      items[index].classList.toggle('done', done);
      items[index].querySelector('.ps-check-box').textContent = done ? '✓' : '';
    }
   
    const checkTotal = _state.checklist.reduce((a, arr) => a + (arr ? arr.length : 0), 0);
    const checkMarcados = _state.checklist.reduce((a, arr) => a + (arr ? arr.filter(Boolean).length : 0), 0);
    const fill = document.querySelector('.ps-score-fill-inner');
    if (fill) fill.style.width = (checkTotal > 0 ? checkMarcados/checkTotal*100 : 0) + '%';
    const scoreText = document.querySelectorAll('.ps-score-bar span');
    if (scoreText[2]) scoreText[2].textContent = `${checkMarcados}/${checkTotal} itens`;
  }

  function _cleanup() {
    if (_state.timerInterval) { clearInterval(_state.timerInterval); _state.timerInterval = null; }
    if (_state.metronomeInterval) { clearInterval(_state.metronomeInterval); _state.metronomeInterval = null; }
    _state.metronomeActive = false;
  }

  function _resetState() {
    _state = {
      fase: 'menu', tipo: null, passo: 0, checklist: [],
      tempoDecorrido: 0, timerInterval: null,
      metronomeInterval: null, metronomeActive: false,
      tempoTotal: 0, compressoes: 0, respiracoes: 0,
      completada: false, erros: [],
      checklistTotal: 0, checklistMarcados: 0,
    };
  }

  async function duvidaIA() {
    const sim = SIMULACOES[_state.tipo];
    const passo = sim.passos[_state.passo];
    const prompt = `Estou na simulação de primeiros socorros: "${sim.titulo}". 
    O passo atual é: "${passo.titulo}". 
    As instruções são: "${passo.instrucoes}". 
    
    Explique de forma simples e rápida por que este passo é importante e dê uma dica extra de segurança.`;

    try {
      if (window.App && App.toast) App.toast("🤖 IA está gerando orientações...", "info");
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: prompt, context: "Você é um instrutor de primeiros socorros experiente." })
      });
      const data = await res.json();
      const reply = data.response || "Não consegui contato com o tutor.";
      
      if (window.App && App.toast) App.toast("🤖 IA: " + reply, "success");
      else alert("Tutor IA: " + reply);
    } catch (e) {
      console.error("Erro IA:", e);
    }
  }

  return {
    abrir, fechar, sair,
    iniciarSimulacao,
    proximoPasso, passoAnterior,
    marcarCheckbox,
    toggleMetronome,
    addCompressao,
    addRespiracao,
    duvidaIA
  };
})();