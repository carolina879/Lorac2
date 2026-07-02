const App = (() => {
  let state = {
    user: null,
    currentRoom: null,
    ws: null,
    wsReconnectTimer: null,
    wsConnected: false,
    wsPingInterval: null,

    focusActive: false,
    focusPhase: 'focus',
    focusInterval: null,
    focusTotal: 25 * 60,
    focusRemaining: 25 * 60,
    focusAmbientSound: 'none',
    focusAudio: null,
    ambientTracks: {
      rain: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      cafe: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
      forest: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
      library: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3'
    },
    focusBreakDuration: 5,

    livekitRoom: null,
    inCall: false,
    callMinimized: false,
    micEnabled: true,
    camEnabled: true,
    screenSharing: false,

    calendarDate: new Date(),
    calSelectedDate: null,
    calEvents: [],

    allRooms: [],

    
    notifications: [],
    notifOpen: false,

    
    friends: [],
    onlineFriends: new Set(),


    profileEmoji: '🧑',
    profileBio: '',

   
    wbActive: false,
    wbTool: 'pen',
    wbColor: '#e8a04a',
    wbSize: 4,
    wbDrawing: false,
    wbLastX: 0,
    wbLastY: 0,
    wbHistory: [],
    wbRedoStack: [],
    wbShapeStart: null,
    wbSnapshot: null,


    flashcards: [],
    fcIndex: 0,
    fcFlipped: false,
    fcMode: 'cards',
    fcReviewQueue: [],
    quizState: null,

    
    docBroadcastTimer: null,

    
    rankTab: 'week',
    rankData: [],

    
    forumQuestions: [],
    forumSort: 'recent',
    forumSearch: '',
    forumCurrentId: null,

   
    tarefas: [],
    tarefasFilter: 'all',
    tarefasSort: 'newest',
    tarefasSearch: '',
    tarefasEditId: null,

   
    badges: [],
    availableBadges: [
      { id: 'first_session', name: 'Primeiros Passos', desc: 'Complete sua primeira sessão de estudo.', icon: '🌱', condition: (stats) => stats.total_sessions >= 1 },
      { id: 'focus_master', name: 'Mestre do Foco', desc: 'Complete 10 sessões de foco.', icon: '🧘', condition: (stats) => stats.total_sessions >= 10 },
      { id: 'streak_7', name: 'Semana de Fogo', desc: 'Mantenha uma sequência de 7 dias.', icon: '🔥', condition: (stats) => stats.streak_days >= 7 },
      { id: 'friend_maker', name: 'Amigo de Todos', desc: 'Adicione 3 amigos.', icon: '🤝', condition: () => state.friends.length >= 3 },
      { id: 'file_sharer', name: 'Compartilhador', desc: 'Compartilhe um arquivo na sala.', icon: '📎', condition: () => false },
      { id: 'pin_creator', name: 'Idealizador', desc: 'Crie seu primeiro post-it.', icon: '📌', condition: () => false },
      { id: 'code_master', name: 'Programador', desc: 'Execute seu primeiro código no editor.', icon: '💻', condition: () => false },
    ],

    
    subjects: ['Matemática', 'Português', 'História', 'Ciências', 'Programação', 'Geral'],
    studySessions: [],

    
    theme: 'dark',

    
    roomFiles: [],

    
    pins: [],
    selectedPinColor: '#fff787',
    nodes: [],
    nodeLinks: [],
    selectedNodeColor: '#fff787',
    selectedNodeShape: 'capsule',
    nodeLinkMode: false,
    linkSourceId: null,

   
    dailyNotes: {},

   
    codeEditor: {
      active: false,
      language: 'javascript',
      content: '// Bem-vindo ao Editor Colaborativo!\n// Digite seu código aqui...\n\nfunction saudacao() {\n  console.log("Olá, Lorc!");\n}\n\nsaudacao();',
      consoleHistory: [],
      typingTimeout: null,
    },
    
 
    turmas: [],
    currentTurma: null,

    
    activePrivateChat: null, 
    privateHistory: {},
    recentChats: [],

    reminderInterval: null,
  };

  const API = ""; 


  const AVATAR_COLORS = [
    ['#e8a04a','#0f0d0a'],['#c96a4a','#0f0d0a'],['#7a9e7e','#0f0d0a'],
    ['#b8a89a','#0f0d0a'],['#a0c4e8','#0f0d0a'],['#c8a0e8','#0f0d0a'],
    ['#e8c4a0','#0f0d0a'],['#a0e8c4','#0f0d0a'],
  ];
  function avatarColor(name) {
    let h = 0;
    for (let c of name) h = (h * 31 + c.charCodeAt(0)) & 0xffff;
    return AVATAR_COLORS[h % AVATAR_COLORS.length];
  }


  function showScreen(id) {
    const login = document.getElementById('screen-login');

   
    if (id !== 'login') {
      if (login) {
        login.classList.remove('active');
        login.style.cssText = 'display:none!important;visibility:hidden;height:0;overflow:hidden;position:absolute;';
      }
      const signupSub = document.getElementById('auth-sub-signup-container');
      if (signupSub) signupSub.style.display = 'none';
    } else {
      if (login) {
        login.style.cssText = '';
        login.classList.add('active');
      }
      return;
    }

    
    document.querySelectorAll('.screen').forEach(s => {
      if (s.id !== 'screen-login') {
        s.classList.remove('active');
        s.style.display = '';
      }
    });


    const target = document.getElementById('screen-' + id);
    if (target) {
      target.classList.add('active');
    }
  }

  function showRoomsScreen() {
    showScreen('rooms');
    loadRooms();
    updateHeaderUser();
  }

  async function showDashboard() {
    showScreen('dashboard');
    updateHeaderUser('dash');
    await loadDashboard();
    renderSrsDashboard();
  }

  async function showCalendar() {
    showScreen('calendar');
    updateHeaderUser('cal');
    await loadCalendarEvents();
    renderCalendar();
  }

  function showProfile() {
    showScreen('profile');
    updateHeaderUser('prof');
    renderProfile();
    renderBadges();
    renderFriendsList();
    
    const myCodeEl = document.getElementById('my-friend-id');
    if (myCodeEl && state.user?.id) {
      myCodeEl.textContent = getFriendCode(state.user.id);
    }
    
    checkAcceptedInvites();
    loadFriendInvites();
  }

  function showRanking() {
    showScreen('ranking');
    updateHeaderUser('rank');
    loadRanking();
  }

  function updateHeaderUser(prefix = '') {
    const username = state.user?.username || '';
    const ids = prefix
      ? [`${prefix}-avatar`, `${prefix}-username`]
      : ['header-avatar', 'header-username'];
    const avatarEl = document.getElementById(ids[0]);
    const usernameEl = document.getElementById(ids[1]);
    if (avatarEl && username) {
      if (state.profileEmoji && state.profileEmoji !== '🧑') {
        avatarEl.style.background = '';
        avatarEl.textContent = state.profileEmoji;
        avatarEl.style.fontSize = '18px';
      } else {
        const [bg] = avatarColor(username);
        avatarEl.style.background = bg;
        avatarEl.textContent = username[0].toUpperCase();
        avatarEl.style.fontSize = '';
      }
    }
    if (usernameEl) usernameEl.textContent = username;


  }

  function logout() {
    try { localStorage.removeItem('studysync_user'); } catch (err) { console.warn('Logout storage error', err); }
    if (state.ws) { state.ws.close(); state.ws = null; }
    state.user = null;
    state.turmas = [];
    if (state.reminderInterval) clearInterval(state.reminderInterval);
    state.reminderInterval = null;

    state.currentRoom = null;
    state.currentTurma = null;
    state.notifications = [];
    state.profileEmoji = '🧑';
    state.profileBio = '';
    window.location.reload();
  }


async function login() {
  const username = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value.trim();

  if (!username || !password) {
    toast('Preencha todos os campos.', 'error');
    return;
  }

  try {
    const res = await fetch(`${API}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: username, password })
    });

    if (!res.ok) {
      
      let errorMessage = 'Erro no login.';
      try {
        const errorData = await res.json();
        errorMessage = errorData.detail || errorMessage;
      } catch (e) {
        
        if (res.status === 401) {
          errorMessage = 'Usuário ou senha incorretos.';
        } else if (res.status === 500) {
          errorMessage = 'Erro interno do servidor.';
        }
      }
      toast(errorMessage, 'error');
      return;
    }

    const data = await res.json();
    if (!data.user) {
      toast('Resposta inválida do servidor.', 'error');
      return;
    }

    state.user = data.user;
    localStorage.setItem('studysync_user', JSON.stringify(data.user));
    loadTheme();
    loadProfilePrefs();
    toast('Login realizado com sucesso!', 'success');
    showRoomsScreen();
  } catch (e) {
  
    console.error('Erro de rede no login:', e);
    toast('Servidor indisponível. Verifique sua conexão.', 'error');
  }
}


  function loginWithUser(user) {
    if (!user || !user.id) {
      showScreen('login');
      return;
    }
    state.user = user;
    loadTheme();
    loadProfilePrefs();
    loadFlashcards();
    loadStudySessions();
    loadCalendarEvents();
    requestNotificationPermission();
    startReminderCheck();

    showRoomsScreen();
  }

  
  async function loadRooms() {
    try {
      const res = await fetch(`${API}/api/rooms`);
      const data = await res.json();
      state.allRooms = data.rooms || [];
      renderRooms(state.allRooms);
    } catch (e) {
      toast('Erro ao carregar salas.', 'error');
      document.getElementById('rooms-grid').innerHTML = '<div class="empty-state">Não foi possível carregar as salas.</div>';
    }
  }

  const ROOM_ICONS = ['📚','💻','🧪','🎨','🧮','📖','🔬','🌐','📝','🎯'];

  function renderRooms(rooms) {
    const grid = document.getElementById('rooms-grid');
    if (!rooms.length) {
      grid.innerHTML = '<div class="empty-state">Nenhuma sala disponível.</div>';
      return;
    }
    grid.innerHTML = rooms.map((room, i) => `
      <div class="room-card" onclick="App.joinRoom('${room.id}', '${escHtml(room.name)}', ${!!room.has_password})">
        <div class="room-card-icon">${ROOM_ICONS[i % ROOM_ICONS.length]}</div>
        <div class="room-card-name">
          ${escHtml(room.name)}
          ${room.has_password ? '<span title="Sala protegida por senha" style="margin-left:6px;font-size:13px;">🔐</span>' : ''}
        </div>
        <div class="room-card-meta">
          <span class="room-online-dot ${room.online_count ? '' : 'empty'}"></span>
          <span>${room.online_count || 0} online</span>
        </div>
      </div>
    `).join('');
  }

  function filterRooms(query) {
    const filtered = state.allRooms.filter(r => r.name.toLowerCase().includes(query.toLowerCase()));
    renderRooms(filtered);
  }

  function openCreateRoom() {
    openModal(`
      <h2 class="modal-title">Nova Sala</h2>
      <div class="modal-form">
        <div class="field-group">
          <label class="field-label">Nome da Sala</label>
          <input id="new-room-name" class="field-input" type="text" placeholder="Ex: Bioquímica — Turma B" maxlength="64" />
        </div>
        <div class="field-group">
          <label class="field-label">🔐 Senha (opcional)</label>
          <input id="new-room-password" class="field-input" type="password" placeholder="Deixe em branco para sala pública" maxlength="64" />
        </div>
        <button class="btn-primary" onclick="App.createRoom()">Criar Sala</button>
      </div>
    `);
    setTimeout(() => document.getElementById('new-room-name')?.focus(), 100);
  }

  async function createRoom() {
    const name = document.getElementById('new-room-name').value.trim();
    if (name.length < 2) { toast('Nome muito curto.', 'error'); return; }
    const password = document.getElementById('new-room-password')?.value || '';
    try {
      await fetch(`${API}/api/rooms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, password: password || null })
      });
      closeModal();
      toast('Sala criada!', 'success');
      loadRooms();
    } catch (e) {
      toast('Erro ao criar sala.', 'error');
    }
  }

  
  async function joinRoom(roomId, roomName, hasPassword = false) {
    if (hasPassword) {
      const pwd = prompt(`🔐 A sala "${roomName}" é protegida por senha.\nDigite a senha para entrar:`);
      if (pwd === null) return;
      try {
        const res = await fetch(`${API}/api/rooms/${roomId}/verify-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: pwd })
        });
        if (!res.ok) {
          const err = await res.json();
          toast(err.detail || 'Senha incorreta. Tente novamente.', 'error');
          return;
        }
      } catch (e) {
        toast('Erro ao verificar senha. Tente novamente.', 'error');
        return;
      }
    }

    state.currentRoom = { id: roomId, name: roomName };
    document.getElementById('current-room-name').textContent = roomName;
    document.getElementById('messages-container').innerHTML =
      '<div class="messages-welcome"><span class="welcome-icon">⏳</span><p>Carregando histórico...</p></div>';

    showScreen('study');
    connectWebSocket(roomId);
    await loadRoomHistory(roomId);
    loadRoomFiles(roomId);
    loadPins();
    loadRecentChats();
    loadCodeContent();

    closeWhiteboard();
    closeFlashcards();
  }

  async function leaveRoom() {
   
    const roomId = state.currentRoom?.id;
    state.currentRoom = null;
    
    if (state.wsReconnectTimer) { clearTimeout(state.wsReconnectTimer); state.wsReconnectTimer = null; }
    if (state.wsPingInterval) { clearInterval(state.wsPingInterval); state.wsPingInterval = null; }

    if (state.livekitRoom) {
      await state.livekitRoom.disconnect();
      state.livekitRoom = null;
    }
    
    if (state.ws) {
    
      state.ws.onclose = null;
      state.ws.onerror = null;
      if (state.ws.readyState === WebSocket.OPEN || state.ws.readyState === WebSocket.CONNECTING) {
        state.ws.close();
      }
      state.ws = null;
    }

    if (state.focusInterval) { clearInterval(state.focusInterval); state.focusInterval = null; }
    state.focusActive = false;
    state.inCall = false;
    state.screenSharing = false;
    closeWhiteboard();
    closeFlashcards();
    document.getElementById('focus-overlay').classList.remove('active');
    document.getElementById('call-screen').classList.remove('active');
    showRoomsScreen();
  }

  async function loadRoomHistory(roomId) {
    try {
      const res = await fetch(`${API}/api/rooms/${roomId}/messages`);
      const data = await res.json();
      const container = document.getElementById('messages-container');
      if (!data.messages?.length) {
        container.innerHTML = '<div class="messages-welcome"><span class="welcome-icon">👋</span><p>Seja o primeiro a mandar uma mensagem!</p></div>';
        return;
      }
      container.innerHTML = '';
      data.messages.forEach(m => appendMessage(m, false));
      scrollToBottom();
    } catch (e) { console.error('Erro ao carregar histórico:', e); }
  }

  
  function connectWebSocket(roomId) {
    if (state.ws) { state.ws.close(); }
    const wsUrl = `${API.replace('http', 'ws')}/ws/${roomId}/${state.user.id}`;
    const ws = new WebSocket(wsUrl);
    state.ws = ws;

    ws.onopen = () => {
      state.wsConnected = true;
      document.getElementById('conn-status').style.display = 'none';
    };

    ws.onmessage = (event) => {
      try { handleWsMessage(JSON.parse(event.data)); }
      catch (e) { console.error('WS parse error:', e); }
    };

    ws.onclose = () => {
      state.wsConnected = false;
      if (state.currentRoom) {
        document.getElementById('conn-status').style.display = 'flex';
        state.wsReconnectTimer = setTimeout(() => {
          if (state.currentRoom) connectWebSocket(state.currentRoom.id);
        }, 3000);
      }
    };

    ws.onerror = (e) => { console.error('WS error:', e); };

    if (state.wsPingInterval) clearInterval(state.wsPingInterval);
    state.wsPingInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ type: 'ping' }));
      else clearInterval(state.wsPingInterval);
    }, 25000);
  }

  function sendWs(payload) {
    if (state.ws?.readyState === WebSocket.OPEN) {
      state.ws.send(JSON.stringify(payload));
      return true;
    }
    return false;
  }

  function handleWsMessage(msg) {
    switch (msg.type) {
      case 'chat_message':
        appendMessage(msg, true);
        scrollToBottom();
        if (msg.username !== state.user?.username) {
          pushNotif('💬', `<strong>${msg.username}</strong> enviou uma mensagem na sala`, false);
        }
        break;
      case 'user_joined':
        appendSystemMsg(`${msg.username} entrou na sala 👋`);
        updateOnlineUsers(msg.online_users);
        if (msg.username !== state.user?.username) {
          pushNotif('👋', `<strong>${msg.username}</strong> entrou na sala`, false);
          if (state.friends.some(f => f.username === msg.username)) {
            state.onlineFriends.add(msg.username);
            updateFriendsList();
          }
        }
        break;
      case 'user_left':
        appendSystemMsg(`${msg.username} saiu da sala`);
        updateOnlineUsers(msg.online_users);
        if (state.friends.some(f => f.username === msg.username)) {
          state.onlineFriends.delete(msg.username);
          updateFriendsList();
        }
        break;
      case 'chat_reaction':
        const msgEl = document.querySelector(`[data-msg-id="${msg.message_id}"]`);
        if (msgEl) {
          const reactionsContainer = msgEl.querySelector('.msg-reactions') || document.createElement('div');
          reactionsContainer.className = 'msg-reactions';
          renderReactions(reactionsContainer, msg.message_id, msg.reactions);
          if (!msgEl.querySelector('.msg-reactions')) msgEl.querySelector('.msg-body').appendChild(reactionsContainer);
        }
        break;
      case 'focus_started':
        handleFocusStarted(msg);
        break;
      case 'focus_ended':
        handleFocusEnded(msg);
        break;
      case 'focus_tick':
        if (!state.focusActive) updateTimerDisplay(msg.remaining, state.focusTotal);
        break;
      case 'whiteboard_draw':
        wbReceiveDraw(msg);
        break;
      case 'whiteboard_clear':
        wbClearCanvas(false);
        break;
      case 'doc_update':
        docReceiveUpdate(msg);
        break;
      case 'call_wb_draw':
        callWbReceiveDraw(msg);
        break;
      case 'call_wb_clear':
        callWbClear(false);
        break;
      case 'pin_add':
        state.pins.push(msg.pin);
        savePins();
        renderPins();
        break;
      case 'pin_delete':
        state.pins = state.pins.filter(p => p.id !== msg.pinId);
        savePins();
        renderPins();
        break;
      case 'code_update':
        codeReceiveUpdate(msg);
        break;
      case 'code_typing':
        codeReceiveTyping(msg);
        break;
      case 'node_link_add':
        state.nodeLinks.push(msg.link);
        saveNodes();
        renderMindMapLinks();
        break;
      case 'node_link_delete':
        state.nodeLinks = state.nodeLinks.filter(l => l.id !== msg.linkId);
        saveNodes();
        renderMindMapLinks();
        break;
      case 'node_add':
        state.nodes.push(msg.node);
        saveNodes();
        renderNodes();
        break;
      case 'node_delete':
        state.nodes = state.nodes.filter(n => n.id !== msg.nodeId);
        saveNodes();
        renderNodes();
        break;
      case 'node_move':
        const node = state.nodes.find(n => n.id === msg.nodeId);
        if (node) { node.x = msg.x; node.y = msg.y; node.content = msg.content || node.content; saveNodes(); renderNodes(); }
        break;
      case 'private_message':
        handleReceivePrivateMessage(msg);
        break;
      case 'pin_move':
        const pin = state.pins.find(p => p.id === msg.pinId);
        if (pin) {
          pin.x = msg.x; pin.y = msg.y;
          savePins();
          renderPins();
        }
        break;
      case 'pong':
        break;
    }
  }

 
  function sendMessage() {
    if (state.focusActive) { toast('Chat bloqueado durante o modo foco.', 'error'); return; }
    const input = document.getElementById('chat-input');
    const content = input.value.trim();
    if (!content) return;

    if (content.startsWith('/ia ') || content.toLowerCase() === '/ia') {
      const question = content.slice(4).trim();
      input.value = ''; input.style.height = '';
      if (!question) { toast('Digite uma pergunta após /ia', 'error'); return; }
      sendChatAIMessage(question);
      return;
    }

    const sent = sendWs({ type: 'chat_message', content, subtype: 'text' });
    if (sent) {
      input.value = ''; input.style.height = '';
    } else {
      toast('Conexão perdida. Aguarde a reconexão para enviar mensagens.', 'error');
    }
  }

  function chatAskAI() {
    if (state.focusActive) { toast('Chat bloqueado durante o modo foco.', 'error'); return; }
    const input = document.getElementById('chat-input');
    const existing = input.value.trim();
    if (existing && !existing.startsWith('/ia')) {
      sendChatAIMessage(existing);
      input.value = ''; input.style.height = '';
    } else {
      input.value = '/ia ';
      input.focus();
      input.setSelectionRange(4, 4);
    }
  }

  async function sendChatAIMessage(question) {
    const container = document.getElementById('messages-container');

    appendMessage({
      user_id: state.user.id,
      username: state.user.username,
      content: `🤖 /ia ${question}`,
      subtype: 'text',
      timestamp: new Date().toISOString()
    }, true);
    scrollToBottom();

    const loadingEl = document.createElement('div');
    loadingEl.className = 'msg-system';
    loadingEl.style.cssText = 'color:var(--accent,#e8a04a);font-style:italic;';
    loadingEl.textContent = '🤖 IA pensando...';
    container.appendChild(loadingEl);
    scrollToBottom();

    try {
      const context = state.currentRoom ? `O estudante está na sala: "${state.currentRoom.name}".` : '';
      const res = await fetch(`${API}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: question, context })
      });

      loadingEl.remove();

      const data = await res.json();
      if (!res.ok) {
        appendSystemMsg(`❌ IA: ${data.detail || 'Erro ao consultar IA'}`);
        return;
      }

      const answer = data.response || '';
      const aiEl = document.createElement('div');
      aiEl.className = 'msg';
      aiEl.style.cssText = 'opacity:0;transform:translateY(8px);';
      aiEl.innerHTML = `
        <div class="msg-avatar" style="background:#e8a04a;color:#0f0d0a;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0;align-self:flex-end;">🤖</div>
        <div class="msg-body">
          <div class="msg-meta">
            <span class="msg-name" style="color:#e8a04a;">Assistente IA</span>
            <span class="msg-time">${formatTime(new Date().toISOString())}</span>
          </div>
          <div class="msg-bubble" style="background:rgba(232,160,74,0.12);border:1px solid rgba(232,160,74,0.25);white-space:pre-wrap;">${escHtml(answer)}</div>
        </div>
      `;
      container.appendChild(aiEl);
      requestAnimationFrame(() => {
        aiEl.style.transition = 'opacity 0.22s, transform 0.22s';
        aiEl.style.opacity = '1';
        aiEl.style.transform = 'translateY(0)';
      });
      scrollToBottom();

    } catch (e) {
      loadingEl.remove();
      appendSystemMsg('❌ Não foi possível conectar à IA.');
    }
  }

  function handleChatKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  }

  function autoResize(el) {
    el.style.height = '';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
  }

  function openImageInput() {
    if (state.focusActive) { toast('Chat bloqueado durante o modo foco.', 'error'); return; }
    document.getElementById('image-input').click();
  }

  function sendImage(input) {
    const file = input.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast('Imagem muito grande (máx 2MB).', 'error'); return; }
    const reader = new FileReader();
    reader.onload = (e) => sendWs({ type: 'chat_message', content: e.target.result, subtype: 'image' });
    reader.readAsDataURL(file);
    input.value = '';
  }

  function appendMessage(msg, animate = true) {
    const container = document.getElementById('messages-container');
    const welcome = container.querySelector('.messages-welcome');
    if (welcome) welcome.remove();

    const isOwn = msg.user_id === state.user?.id || msg.username === state.user?.username;
    const [bg] = avatarColor(msg.username);

    const wrapper = document.createElement('div');
    wrapper.className = `msg${isOwn ? ' own' : ''}`;
    wrapper.dataset.msgId = msg.id;
    if (animate) { wrapper.style.opacity = '0'; wrapper.style.transform = 'translateY(8px)'; }

    const av = document.createElement('div');
    av.className = 'msg-avatar';
    av.style.cssText = `background:${bg};color:#0f0d0a;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:600;flex-shrink:0;align-self:flex-end;`;
    av.textContent = msg.username[0].toUpperCase();

    const body = document.createElement('div');
    body.className = 'msg-body';

    const meta = document.createElement('div');
    meta.className = 'msg-meta';
    meta.innerHTML = `<span class="msg-name" style="color:${bg}">${escHtml(msg.username)}</span><span class="msg-time">${formatTime(msg.timestamp)}</span>`;

    const contentEl = document.createElement('div');
    if (msg.subtype === 'image') {
      contentEl.className = 'msg-bubble-image';
      contentEl.style.position = 'relative';
      contentEl.innerHTML = `<img class="msg-image" src="${msg.content}" alt="imagem" style="display:block" onclick="window.open(this.src,'_blank')" />`;
    } else {
      contentEl.className = 'msg-bubble';
      contentEl.textContent = msg.content;
    }

    const reactionsEl = document.createElement('div');
    reactionsEl.className = 'msg-reactions';
    renderReactions(reactionsEl, msg.id, msg.reactions || {});

    const reactBtn = document.createElement('button');
    reactBtn.className = 'msg-react-trigger';
    reactBtn.innerHTML = '☺';
    reactBtn.onclick = (e) => {
      e.stopPropagation();
      openEmojiPicker(e, msg.id);
    };

    contentEl.appendChild(reactBtn); 
    body.appendChild(meta);
    body.appendChild(contentEl);
    body.appendChild(reactionsEl);

    wrapper.appendChild(av);
    wrapper.appendChild(body);
    container.appendChild(wrapper);

    if (animate) {
      requestAnimationFrame(() => {
        wrapper.style.transition = 'opacity 0.22s, transform 0.22s';
        wrapper.style.opacity = '1'; wrapper.style.transform = 'translateY(0)';
      });
    }
  }

  function renderReactions(container, msgId, reactions) {
    container.innerHTML = Object.entries(reactions).map(([emoji, users]) => {
      const meReacted = users.includes(state.user?.username);
      return `
        <div class="reaction-tag ${meReacted ? 'active' : ''}" onclick="App.toggleReaction('${msgId}', '${emoji}')">
          <span class="reaction-emoji">${emoji}</span>
          <span class="reaction-count">${users.length}</span>
        </div>
      `;
    }).join('');
  }

  function toggleReaction(messageId, emoji) {
    sendWs({ type: 'chat_reaction', message_id: messageId, emoji });
  }

  
  const REACTION_EMOJIS = ['👍','❤️','😂','😮','😢','🔥','🎉','👏','🤔','💯','✅','❓'];

  function openEmojiPicker(e, messageId) {
  
    const existing = document.getElementById('emoji-reaction-picker');
    if (existing) { existing.remove(); return; }

    const picker = document.createElement('div');
    picker.id = 'emoji-reaction-picker';
    picker.className = 'emoji-reaction-picker';
    picker.innerHTML = REACTION_EMOJIS.map(em =>
      `<button class="erp-btn" onclick="App.pickReactionEmoji('${messageId}','${em}')">${em}</button>`
    ).join('');

   
    const rect = e.target.getBoundingClientRect();
    picker.style.top  = (rect.top + window.scrollY - 52) + 'px';
    picker.style.left = (rect.left + window.scrollX - 60) + 'px';

    document.body.appendChild(picker);

   
    setTimeout(() => {
      document.addEventListener('click', function closePicker() {
        picker.remove();
        document.removeEventListener('click', closePicker);
      }, { once: true });
    }, 0);
  }

  function pickReactionEmoji(messageId, emoji) {
    sendWs({ type: 'chat_reaction', message_id: messageId, emoji });
    const picker = document.getElementById('emoji-reaction-picker');
    if (picker) picker.remove();
  }

  function appendSystemMsg(text) {
    const container = document.getElementById('messages-container');
    const el = document.createElement('div');
    el.className = 'msg-system';
    el.textContent = text;
    container.appendChild(el);
    scrollToBottom();
  }

  function scrollToBottom() {
    const c = document.getElementById('messages-container');
    c.scrollTop = c.scrollHeight;
  }

  
  function updateOnlineUsers(users = []) {
    document.getElementById('online-count').textContent = users.length;
    const list = document.getElementById('users-list');
    list.innerHTML = users.map(u => {
      const [bg] = avatarColor(u.username);
      const isFriend = state.friends.some(f => f.username === u.username);
      return `
        <div class="user-item" onclick="App.showUserProfile('${u.user_id}')" style="cursor:pointer" title="Ver perfil de ${escHtml(u.username)}">
          <div style="width:26px;height:26px;border-radius:50%;background:${bg};color:#0f0d0a;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:600;flex-shrink:0;">${u.username[0].toUpperCase()}</div>
          <span class="user-item-name">${escHtml(u.username)}</span>
          ${!isFriend && u.username !== state.user?.username ? `<button onclick="App.addFriendByName('${escHtml(u.username)}')" style="background:none;border:none;color:var(--text-3);cursor:pointer;font-size:14px;padding:2px 4px;" title="Adicionar amigo">+</button>` : ''}
        </div>
      `;
    }).join('');
  }


  function startFocus() {
    const durMin = parseInt(document.getElementById('focus-duration').value);
    const soundType = document.getElementById('focus-ambient-select')?.value || 'none';
    
    if (soundType !== 'none' && state.ambientTracks[soundType]) {
      state.focusAudio = new Audio(state.ambientTracks[soundType]);
      state.focusAudio.loop = true;
      state.focusAudio.play().catch(e => console.warn("Auto-play bloqueado pelo navegador. Clique na página."));
    }

    state.focusTotal = durMin * 60;
    state.focusRemaining = state.focusTotal;
    state.focusPhase = 'focus';
    state.focusActive = true;
    
    updateFocusOverlayUI();

    document.getElementById('focus-overlay').classList.add('active');
    document.getElementById('focus-phase-badge').textContent = 'FOCO';
    document.getElementById('btn-focus-start').style.display = 'none';
    document.getElementById('btn-focus-stop').style.display = '';
    document.getElementById('focus-duration').disabled = true;

    sendWs({ type: 'focus_start', duration: durMin });
    runFocusTick();
  }

  function updateFocusOverlayUI() {
    const overlay = document.getElementById('focus-overlay');
    if (!overlay) return;
    
    if (state.focusPhase === 'focus') {
      overlay.innerHTML = `
        <div class="focus-overlay-content">
          <div class="focus-overlay-icon">🧘</div>
          <h2>Foco Total</h2>
          <p>O chat está silenciado. Aproveite o som ambiente para mergulhar nos estudos.</p>
          <div class="focus-overlay-timer" id="focus-overlay-timer">00:00</div>
          <button class="btn-secondary small" onclick="App.stopFocus()" style="margin-top:30px;">Interromper</button>
        </div>
      `;
    } else {
      overlay.innerHTML = `
        <div class="focus-overlay-content">
          <div class="rest-animation">🌿</div>
          <h2>Pausa Restauradora</h2>
          <p>Siga o movimento do círculo: inspire ao expandir, expire ao contrair.</p>
          <div class="focus-overlay-timer" id="focus-overlay-timer">00:00</div>
          <div style="margin-top:10px; color:var(--accent); font-family:var(--font-mono); font-size:12px; letter-spacing:0.1em;">RESPIRE FUNDO</div>
          <button class="btn-secondary small" onclick="App.stopFocus()" style="margin-top:30px;">Pular Pausa</button>
        </div>
      `;
    }
  }

  function stopFocus() {
    if (state.focusInterval) clearInterval(state.focusInterval);
    
    if (state.focusAudio) {
      state.focusAudio.pause();
      state.focusAudio = null;
    }

    if (state.focusActive && state.focusPhase === 'focus' && state.focusRemaining <= 0) {
      showSubjectPickerModal(state.focusTotal);
      checkAndUnlockBadges();
    }
    
    state.focusActive = false; state.focusInterval = null;
    state.focusRemaining = state.focusTotal;

    document.getElementById('focus-overlay').classList.remove('active');
    document.getElementById('btn-focus-start').style.display = '';
    document.getElementById('btn-focus-stop').style.display = 'none';
    document.getElementById('focus-duration').disabled = false;
    document.getElementById('focus-progress-bar').style.width = '100%';

    sendWs({ type: 'focus_end' });
    updateTimerDisplay(state.focusTotal, state.focusTotal);
  }

  function runFocusTick() {
    if (state.focusInterval) clearInterval(state.focusInterval);
    state.focusInterval = setInterval(() => {
      state.focusRemaining--;
      updateTimerDisplay(state.focusRemaining, state.focusTotal);
      sendWs({ type: 'focus_tick', remaining: state.focusRemaining, phase: state.focusPhase });
      if (state.focusRemaining <= 0) {
        clearInterval(state.focusInterval);
        if (state.focusPhase === 'focus') startBreak();
        else { stopFocus(); toast('Sessão completa! 🎉', 'success'); pushNotif('🎉', 'Sessão de foco concluída!', true); }
      }
    }, 1000);
  }

  function startBreak() {
    state.focusPhase = 'break';
    state.focusTotal = state.focusBreakDuration * 60;
    state.focusRemaining = state.focusTotal;

    if (state.focusAudio) {
      state.focusAudio.pause();
      state.focusAudio = null;
    }

   
    new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3').play().catch(() => {});

    updateFocusOverlayUI();
    document.getElementById('focus-overlay').classList.add('active');
    document.getElementById('focus-phase-badge').textContent = 'PAUSA';
    toast(`Pausa de ${state.focusBreakDuration} min! Descanse 🌿`, 'success');
    runFocusTick();
  }

  function handleFocusStarted(msg) {
    if (!state.focusActive) {
      toast(`${msg.initiated_by} iniciou sessão de foco de ${msg.duration_minutes} min`, 'success');
      document.getElementById('focus-overlay').classList.add('active');
    }
  }

  function handleFocusEnded(msg) {
    if (!state.focusActive) {
      document.getElementById('focus-overlay').classList.remove('active');
      toast(`Modo foco encerrado por ${msg.ended_by}`, 'success');
    }
  }

  function updateTimerDisplay(remaining, total) {
    const m = Math.floor(remaining / 60).toString().padStart(2, '0');
    const s = (remaining % 60).toString().padStart(2, '0');
    const timeStr = `${m}:${s}`;
    document.getElementById('focus-timer').textContent = timeStr;
    document.getElementById('focus-overlay-timer').textContent = timeStr;
    const pct = total > 0 ? (remaining / total) * 100 : 100;
    document.getElementById('focus-progress-bar').style.width = pct + '%';
  }



  async function openPreJoinModal() {
   
    let prejoinMic = true;
    let prejoinCam = true;
    let localStream = null;

    const overlay = document.createElement('div');
    overlay.id = 'prejoin-overlay';
    overlay.style.cssText = `
      position: fixed; inset: 0; background: rgba(0,0,0,0.8);
      z-index: 9999; display: flex; align-items: center; justify-content: center;
      backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);
      animation: fadeIn 0.2s ease;
    `;

    const [bgColor, textColor] = avatarColor(state.user?.username || 'U');
    const initials = (state.user?.username || 'U').charAt(0).toUpperCase();

    overlay.innerHTML = `
      <div style="background: var(--bg-2); border: 1px solid var(--border); border-radius: 20px;
                  padding: 32px; width: 100%; max-width: 480px; position: relative;
                  box-shadow: 0 24px 64px rgba(0,0,0,0.5);">
        <button id="prejoin-close-btn" style="position:absolute;top:16px;right:16px;background:none;
                border:none;color:var(--text-2);cursor:pointer;font-size:20px;line-height:1;">✕</button>

        <h2 style="font-family: var(--font-display); font-size: 24px; color: var(--text-0);
                   margin-bottom: 6px;">Configurar chamada</h2>
        <p style="color: var(--text-2); font-size: 14px; margin-bottom: 24px;">
          Sala: <strong style="color: var(--text-1);">${escHtml(state.currentRoom?.name || '')}</strong>
        </p>

        
        <div class="prejoin-preview-box" style="position:relative;width:100%;aspect-ratio:16/9;
              background:#000;border-radius:14px;overflow:hidden;display:flex;
              align-items:center;justify-content:center;border:1px solid var(--border);
              margin-bottom:20px;">
          <video id="prejoin-video" autoplay muted playsinline
                 style="width:100%;height:100%;object-fit:cover;display:none;"></video>
          <div id="prejoin-avatar-placeholder"
               style="width:80px;height:80px;border-radius:50%;display:flex;align-items:center;
                      justify-content:center;font-size:32px;font-weight:bold;
                      background:${bgColor};color:${textColor};">
            ${initials}
          </div>
          
          <div style="position:absolute;bottom:14px;left:0;right:0;display:flex;justify-content:center;gap:12px;">
            <button id="prejoin-mic-btn" title="Microfone"
                    style="width:44px;height:44px;border-radius:50%;border:none;cursor:pointer;
                           display:flex;align-items:center;justify-content:center;
                           background:rgba(255,255,255,0.15);color:#fff;
                           backdrop-filter:blur(4px);transition:all 0.2s;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                <line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>
              </svg>
            </button>
            <button id="prejoin-cam-btn" title="Câmera"
                    style="width:44px;height:44px;border-radius:50%;border:none;cursor:pointer;
                           display:flex;align-items:center;justify-content:center;
                           background:rgba(255,255,255,0.15);color:#fff;
                           backdrop-filter:blur(4px);transition:all 0.2s;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="23 7 16 12 23 17 23 7"/>
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
              </svg>
            </button>
          </div>
          
          <div id="prejoin-mic-off-badge" style="display:none;position:absolute;top:10px;left:10px;
               background:#e07060;border-radius:50%;width:28px;height:28px;
               display:none;align-items:center;justify-content:center;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5">
              <line x1="1" y1="1" x2="23" y2="23"/>
              <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/>
              <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"/>
              <line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>
            </svg>
          </div>
        </div>


        <div id="prejoin-permission-msg" style="font-size:12px;color:var(--text-2);
             text-align:center;margin-bottom:16px;min-height:16px;"></div>

        
        <div style="display:flex;gap:12px;">
          <button id="prejoin-cancel-btn"
                  style="flex:1;padding:13px;background:var(--bg-3);color:var(--text-1);
                         border:1px solid var(--border);border-radius:10px;
                         font-size:15px;font-weight:600;cursor:pointer;">
            Cancelar
          </button>
          <button id="prejoin-join-btn"
                  style="flex:2;padding:13px;background:var(--accent);color:var(--bg-0);
                         border:none;border-radius:10px;font-size:15px;font-weight:600;
                         cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.29 9.82 19.79 19.79 0 01.22 1.18 2 2 0 012.22 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.18 6.18l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
            </svg>
            Entrar na chamada
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    function updateMicBtn() {
      const btn = document.getElementById('prejoin-mic-btn');
      const badge = document.getElementById('prejoin-mic-off-badge');
      if (!btn) return;
      if (prejoinMic) {
        btn.style.background = 'rgba(255,255,255,0.15)';
      } else {
        btn.style.background = '#e07060';
      }
      if (badge) badge.style.display = prejoinMic ? 'none' : 'flex';
    }

    function updateCamBtn() {
      const btn = document.getElementById('prejoin-cam-btn');
      const video = document.getElementById('prejoin-video');
      const placeholder = document.getElementById('prejoin-avatar-placeholder');
      if (!btn) return;
      if (prejoinCam) {
        btn.style.background = 'rgba(255,255,255,0.15)';
        if (video) video.style.display = 'block';
        if (placeholder) placeholder.style.display = 'none';
      } else {
        btn.style.background = '#e07060';
        if (video) video.style.display = 'none';
        if (placeholder) placeholder.style.display = 'flex';
      }
    }

    function stopStream() {
      if (localStream) {
        localStream.getTracks().forEach(t => t.stop());
        localStream = null;
      }
    }

    function closeOverlay() {
      stopStream();
      overlay.remove();
    }

    
    async function startPreview() {
      const permMsg = document.getElementById('prejoin-permission-msg');
      try {
        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        const video = document.getElementById('prejoin-video');
        if (video) {
          video.srcObject = localStream;
          if (prejoinCam) video.style.display = 'block';
        }
        const placeholder = document.getElementById('prejoin-avatar-placeholder');
        if (placeholder && prejoinCam) placeholder.style.display = 'none';
        if (permMsg) permMsg.textContent = '';
        
        localStream.getAudioTracks().forEach(t => t.enabled = prejoinMic);
      } catch (e) {
        if (permMsg) {
          if (e.name === 'NotAllowedError' || e.name === 'PermissionDeniedError') {
            permMsg.textContent = '⚠️ Permissão negada. Você pode entrar só com áudio ou sem câmera.';
          } else {
            permMsg.textContent = '⚠️ Câmera/microfone não disponíveis.';
          }
          permMsg.style.color = '#e8a04a';
        }
        prejoinCam = false;
        updateCamBtn();
      }
    }

    await startPreview();
    updateMicBtn();
    updateCamBtn();

    document.getElementById('prejoin-close-btn').onclick = closeOverlay;
    document.getElementById('prejoin-cancel-btn').onclick = closeOverlay;

    document.getElementById('prejoin-mic-btn').onclick = () => {
      prejoinMic = !prejoinMic;
      if (localStream) localStream.getAudioTracks().forEach(t => t.enabled = prejoinMic);
      updateMicBtn();
    };

    document.getElementById('prejoin-cam-btn').onclick = async () => {
      prejoinCam = !prejoinCam;
      if (localStream) {
        localStream.getVideoTracks().forEach(t => {
          t.enabled = prejoinCam;
        });
      }
      updateCamBtn();
    };

    document.getElementById('prejoin-join-btn').onclick = async () => {
      closeOverlay();
      await enterCall(prejoinMic, prejoinCam);
    };

    
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeOverlay();
    });
  }

  async function toggleCall() {
    if (state.inCall) await leaveCall();
    else await openPreJoinModal();
  }

  async function enterCall(initialMic = true, initialCam = true) {
    if (typeof LivekitClient === 'undefined') {
      toast('SDK de chamada não carregado. Recarregue a página.', 'error');
      return;
    }
    try {
      toast('Conectando à chamada...', '');
      const roomName = state.currentRoom.id;
      const username = state.user.username + '_' + state.user.id.slice(0, 6);
      const res = await fetch(`${API}/api/livekit-token?room=${encodeURIComponent(roomName)}&username=${encodeURIComponent(username)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Erro ao obter token');

      const room = new LivekitClient.Room({
        adaptiveStream: true, dynacast: true,
        videoCaptureDefaults: { resolution: LivekitClient.VideoPresets.h720.resolution },
      });
      state.livekitRoom = room;

      room.on(LivekitClient.RoomEvent.ParticipantConnected, (p) => {
        appendSystemMsg(`${p.identity.split('_')[0]} entrou na chamada 📹`);
        renderVideoGrid(); subscribeToParticipant(p);
        pushNotif('📹', `<strong>${p.identity.split('_')[0]}</strong> entrou na chamada`, false);
      });
      room.on(LivekitClient.RoomEvent.ParticipantDisconnected, (p) => {
        appendSystemMsg(`${p.identity.split('_')[0]} saiu da chamada`);
        renderVideoGrid();
      });
      room.on(LivekitClient.RoomEvent.TrackSubscribed, () => renderVideoGrid());
      room.on(LivekitClient.RoomEvent.TrackUnsubscribed, () => renderVideoGrid());
      room.on(LivekitClient.RoomEvent.LocalTrackPublished, () => renderVideoGrid());
      room.on(LivekitClient.RoomEvent.LocalTrackUnpublished, () => renderVideoGrid());
      room.on(LivekitClient.RoomEvent.Disconnected, () => { if (state.inCall) leaveCall(); });

      await room.connect(data.url, data.token);

      
      if (room.state !== 'connected') {
        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => reject(new Error('Timeout ao conectar na sala')), 10000);
          room.once(LivekitClient.RoomEvent.Connected, () => { clearTimeout(timeout); resolve(); });
        });
      }

      if (initialMic) await room.localParticipant.setMicrophoneEnabled(true);
      if (initialCam) await room.localParticipant.setCameraEnabled(true);
      
      state.micEnabled = initialMic;
      state.camEnabled = initialCam;
      state.callMinimized = false;
      state.inCall = true;

      showCallScreen(); renderVideoGrid(); updateCallControls();
      sendWs({ type: 'call_join' });
      toast('Você entrou na chamada! 🎥', 'success');
    } catch (e) {
      console.error('Erro ao entrar na chamada:', e);
      toast('Erro ao entrar na chamada: ' + e.message, 'error');
    }
  }

  async function leaveCall() {
    if (state.livekitRoom) { await state.livekitRoom.disconnect(); state.livekitRoom = null; }
    state.inCall = false; state.screenSharing = false;
    state.micEnabled = true; state.camEnabled = true;
    hideCallScreen(); updateCallControls();
    sendWs({ type: 'call_leave' });
    toast('Você saiu da chamada.', '');
  }

  function toggleCallMinimize() {
    state.callMinimized = !state.callMinimized;
    const callEl = document.getElementById('call-screen');
    const btn = document.getElementById('btn-call-minimize');
    if (callEl) {
      callEl.classList.toggle('minimized', state.callMinimized);
      btn.innerHTML = state.callMinimized 
        ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>`
        : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/></svg>`;
    }
  }

  async function toggleMic() {
    if (!state.livekitRoom) return;
    state.micEnabled = !state.micEnabled;
    await state.livekitRoom.localParticipant.setMicrophoneEnabled(state.micEnabled);
    updateCallControls();
    document.getElementById('btn-toggle-mic')?.classList.toggle('disabled', !state.micEnabled);
  }

  async function toggleCam() {
    if (!state.livekitRoom) return;
    state.camEnabled = !state.camEnabled;
    await state.livekitRoom.localParticipant.setCameraEnabled(state.camEnabled);
    renderVideoGrid(); updateCallControls();
    document.getElementById('btn-toggle-cam')?.classList.toggle('disabled', !state.camEnabled);
  }

  async function toggleScreenShare() {
    if (!state.livekitRoom) return;
    try {
      if (state.screenSharing) {
        await state.livekitRoom.localParticipant.setScreenShareEnabled(false);
        state.screenSharing = false;
      } else {
        await state.livekitRoom.localParticipant.setScreenShareEnabled(true);
        state.screenSharing = true;
      }
      renderVideoGrid(); updateCallControls();
    } catch (e) { toast('Erro ao compartilhar tela: ' + e.message, 'error'); }
  }

  function subscribeToParticipant(participant) {
    participant.on(LivekitClient.ParticipantEvent.TrackSubscribed, () => renderVideoGrid());
    participant.on(LivekitClient.ParticipantEvent.TrackUnsubscribed, () => renderVideoGrid());
    participant.on(LivekitClient.ParticipantEvent.IsSpeakingChanged, () => renderSpeakingIndicators());
  }

  function showCallScreen() {
    document.getElementById('call-screen').classList.add('active');
    document.getElementById('call-screen').classList.remove('minimized');
    const dot = document.getElementById('call-indicator');
    if (dot) dot.classList.add('active');
    const btn = document.getElementById('btn-call');
    if (btn) {
      btn.classList.add('in-call');
      btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="1" y1="1" x2="23" y2="23"/><path d="M16.5 16.5L20 20M3.35 3.35A17.93 17.93 0 001.18 7c-.26.5-.18 1.1.2 1.49l2 2a2 2 0 002.12.45c.4-.16.8-.3 1.2-.43a2 2 0 001.38-1.9V7a2 2 0 011.46-1.93 17.9 17.9 0 014.88-.07"/></svg>Sair da Chamada`;
    }
  }

  function hideCallScreen() {
    document.getElementById('call-screen').classList.remove('active');
    const dot = document.getElementById('call-indicator');
    if (dot) dot.classList.remove('active');
    const btn = document.getElementById('btn-call');
    if (btn) {
      btn.classList.remove('in-call');
      btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.29 9.82 19.79 19.79 0 01.22 1.18 2 2 0 012.22 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.18 6.18l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>Entrar na Chamada`;
    }
    document.getElementById('video-grid').innerHTML = '';
  }

  function updateCallControls() {
    const btnMic = document.getElementById('btn-toggle-mic');
    const btnCam = document.getElementById('btn-toggle-cam');
    const btnScreen = document.getElementById('btn-toggle-screen');
    if (btnMic) btnMic.classList.toggle('disabled', !state.micEnabled);
    if (btnCam) btnCam.classList.toggle('disabled', !state.camEnabled);
    if (btnScreen) btnScreen.classList.toggle('active-screen', state.screenSharing);
  }

  function renderVideoGrid() {
    if (!state.livekitRoom) return;
    const grid = document.getElementById('video-grid');
    grid.innerHTML = '';

    const allParticipants = [
      state.livekitRoom.localParticipant,
      ...state.livekitRoom.remoteParticipants.values()
    ];

    let tiles = [];
    for (const participant of allParticipants) {
      const isLocal = participant === state.livekitRoom.localParticipant;
      const name = participant.identity.split('_')[0];

      const screenPub = isLocal
        ? [...participant.trackPublications.values()].find(p => p.source === LivekitClient.Track.Source.ScreenShare)
        : [...participant.trackPublications.values()].find(p => p.source === LivekitClient.Track.Source.ScreenShare && p.track);
      if (screenPub && (isLocal || screenPub.track)) tiles.push({ participant, publication: screenPub, isScreen: true, isLocal, name });

      const camPub = isLocal
        ? [...participant.trackPublications.values()].find(p => p.source === LivekitClient.Track.Source.Camera)
        : [...participant.trackPublications.values()].find(p => p.source === LivekitClient.Track.Source.Camera && p.track);
      tiles.push({ participant, publication: camPub, isScreen: false, isLocal, name });
    }

    const count = tiles.length;
    grid.className = 'video-grid';
    if (count === 1) grid.classList.add('grid-1');
    else if (count === 2) grid.classList.add('grid-2');
    else if (count <= 4) grid.classList.add('grid-4');
    else grid.classList.add('grid-many');

    tiles.forEach(({ participant, publication, isScreen, isLocal, name }) => {
      const tile = document.createElement('div');
      tile.className = 'video-tile' + (isScreen ? ' screen-tile' : '');
      tile.dataset.identity = participant.identity + (isScreen ? '-screen' : '');

      const video = document.createElement('video');
      video.autoplay = true; video.playsInline = true;
      if (isLocal && !isScreen) video.muted = true;
      if (publication?.track) publication.track.attach(video);

      const placeholder = document.createElement('div');
      placeholder.className = 'video-placeholder';
      const [bg] = avatarColor(name);
      placeholder.style.background = bg;
      placeholder.textContent = name[0].toUpperCase();

      const nameTag = document.createElement('div');
      nameTag.className = 'video-nametag';
      nameTag.innerHTML = `${isScreen ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>' : ''}
        <span>${escHtml(name)}${isLocal ? ' (você)' : ''}${isScreen ? ' — tela' : ''}</span>`;

      const micIcon = document.createElement('div');
      micIcon.className = 'video-mic-icon';
      micIcon.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>`;
      const micPub = [...participant.trackPublications.values()].find(p => p.source === LivekitClient.Track.Source.Microphone);
      if (!micPub || micPub.isMuted) micIcon.classList.add('muted');

      tile.appendChild(video); tile.appendChild(placeholder);
      tile.appendChild(nameTag); tile.appendChild(micIcon);
      grid.appendChild(tile);

      const updateVideoVisibility = () => {
        const hasVideo = publication && publication.track && !publication.isMuted;
        video.style.display = hasVideo ? 'block' : 'none';
        placeholder.style.display = hasVideo ? 'none' : 'flex';
      };
      updateVideoVisibility();
      if (publication) {
        publication.on && publication.on('muted', updateVideoVisibility);
        publication.on && publication.on('unmuted', updateVideoVisibility);
      }
    });
  }

  function renderSpeakingIndicators() {
    if (!state.livekitRoom) return;
    const all = [state.livekitRoom.localParticipant, ...state.livekitRoom.remoteParticipants.values()];
    all.forEach(p => {
      const tile = document.querySelector(`[data-identity="${p.identity}"]`);
      if (tile) tile.classList.toggle('speaking', p.isSpeaking);
    });
  }

  

  function toggleWhiteboard() {
    if (state.wbActive) closeWhiteboard();
    else openWhiteboard();
  }

  function openWhiteboard() {
    state.wbActive = true;
    document.getElementById('whiteboard-panel').classList.add('open');
    document.getElementById('flashcard-panel').classList.remove('open');
    document.getElementById('doc-panel')?.classList.remove('open');
    document.getElementById('btn-tool-wb').classList.add('active');
    document.getElementById('btn-tool-fc').classList.remove('active');
    document.getElementById('btn-tool-doc')?.classList.remove('active');
    initCanvas();
    document.addEventListener('keydown', wbKeyHandler);
  }

  function closeWhiteboard() {
    state.wbActive = false;
    const panel = document.getElementById('whiteboard-panel');
    if (panel) panel.classList.remove('open');
    const btn = document.getElementById('btn-tool-wb');
    if (btn) btn.classList.remove('active');
    document.removeEventListener('keydown', wbKeyHandler);
    const ti = document.getElementById('wb-text-input-wrap');
    if (ti) ti.style.display = 'none';
  }

  function wbKeyHandler(e) {
    if (!state.wbActive) return;
    if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); wbUndo(); }
    if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) { e.preventDefault(); wbRedo(); }
    if (e.key === 'p' || e.key === 'P') wbSetTool('pen');
    if (e.key === 'e' || e.key === 'E') wbSetTool('eraser');
    if (e.key === 'l' || e.key === 'L') wbSetTool('line');
    if (e.key === 'r' || e.key === 'R') wbSetTool('rect');
    if (e.key === 'c' || e.key === 'C') wbSetTool('circle');
    if (e.key === 't' || e.key === 'T') wbSetTool('text');
  }

  function initCanvas() {
    const canvas = document.getElementById('wb-canvas');
    if (!canvas) return;
    const panel = canvas.parentElement;
    canvas.width  = panel.clientWidth;
    canvas.height = panel.clientHeight - 58;
    redrawCanvas();
  }

  const WB_TOOL_NAMES = {
    pen: 'Caneta', marker: 'Marcador', eraser: 'Borracha',
    line: 'Linha', rect: 'Retângulo', circle: 'Círculo', arrow: 'Seta', text: 'Texto'
  };
  const WB_CURSORS = {
    pen: 'crosshair', marker: 'crosshair', eraser: 'cell',
    line: 'crosshair', rect: 'crosshair', circle: 'crosshair',
    arrow: 'crosshair', text: 'text'
  };

  function wbSetTool(tool) {
    state.wbTool = tool;
    document.querySelectorAll('.wb-tool-btn[data-tool]').forEach(b => b.classList.toggle('active', b.dataset.tool === tool));
    const indicator = document.getElementById('wb-tool-indicator');
    if (indicator) indicator.textContent = WB_TOOL_NAMES[tool] || tool;
    const canvas = document.getElementById('wb-canvas');
    if (canvas) canvas.style.cursor = WB_CURSORS[tool] || 'crosshair';
    if (tool !== 'text') {
      const ti = document.getElementById('wb-text-input-wrap');
      if (ti) ti.style.display = 'none';
    }
  }

  function wbSetColor(color) {
    state.wbColor = color;
    document.querySelectorAll('.wb-color-btn').forEach(b => b.classList.toggle('active', b.dataset.color === color));
    updateWbSizePreview();
  }

  function wbSetSize(val) {
    state.wbSize = parseInt(val);
    updateWbSizePreview();
  }

  function updateWbSizePreview() {
    const prev = document.getElementById('wb-size-preview');
    if (!prev) return;
    const s = Math.max(4, Math.min(state.wbSize * 2, 28));
    prev.style.width = s + 'px';
    prev.style.height = s + 'px';
    prev.style.background = state.wbColor;
  }

  function wbPointerDown(e) {
    if (!state.wbActive) return;
    e.preventDefault();
    const [x, y] = getCanvasPos(e);

    if (state.wbTool === 'text') {
      wbShowTextInput(x, y);
      return;
    }

    state.wbDrawing = true;
    state.wbLastX = x; state.wbLastY = y;
    state.wbShapeStart = { x, y };
    state.wbRedoStack = [];

    if (state.wbTool === 'pen' || state.wbTool === 'marker' || state.wbTool === 'eraser') {
      const ctx = getCtx();
      ctx.beginPath();
      ctx.moveTo(x, y);
    } else {
      state.wbSnapshot = document.getElementById('wb-canvas').getContext('2d').getImageData(
        0, 0,
        document.getElementById('wb-canvas').width,
        document.getElementById('wb-canvas').height
      );
    }
  }

  function wbPointerMove(e) {
    if (!state.wbDrawing || !state.wbActive) return;
    e.preventDefault();
    const [x, y] = getCanvasPos(e);
    const ctx = getCtx();

    const SHAPE_TOOLS = ['line', 'rect', 'circle', 'arrow'];

    if (state.wbTool === 'pen' || state.wbTool === 'marker') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = state.wbColor;
      ctx.lineWidth = state.wbTool === 'marker' ? state.wbSize * 3 : state.wbSize;
      ctx.globalAlpha = state.wbTool === 'marker' ? 0.45 : 1;
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.globalAlpha = 1;
      const seg = { tool: state.wbTool, color: state.wbColor, size: state.wbSize, x0: state.wbLastX, y0: state.wbLastY, x1: x, y1: y };
      state.wbHistory.push(seg);
      sendWs({ type: 'whiteboard_draw', seg });
    } else if (state.wbTool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = state.wbSize * 4;
      ctx.lineCap = 'round';
      ctx.lineTo(x, y);
      ctx.stroke();
      const seg = { tool: 'eraser', size: state.wbSize * 4, x0: state.wbLastX, y0: state.wbLastY, x1: x, y1: y };
      state.wbHistory.push(seg);
      sendWs({ type: 'whiteboard_draw', seg });
    } else if (SHAPE_TOOLS.includes(state.wbTool)) {
      if (state.wbSnapshot) ctx.putImageData(state.wbSnapshot, 0, 0);
      drawShapePreview(ctx, state.wbTool, state.wbShapeStart.x, state.wbShapeStart.y, x, y);
    }
    state.wbLastX = x; state.wbLastY = y;
  }

  function wbPointerUp(e) {
    if (!state.wbDrawing) return;
    state.wbDrawing = false;

    const SHAPE_TOOLS = ['line', 'rect', 'circle', 'arrow'];
    if (SHAPE_TOOLS.includes(state.wbTool) && state.wbShapeStart && e) {
      const [x, y] = getCanvasPos(e);
      const seg = {
        tool: state.wbTool, color: state.wbColor, size: state.wbSize,
        x0: state.wbShapeStart.x, y0: state.wbShapeStart.y, x1: x, y1: y
      };
      const ctx = getCtx();
      if (state.wbSnapshot) ctx.putImageData(state.wbSnapshot, 0, 0);
      drawShapePreview(ctx, state.wbTool, seg.x0, seg.y0, seg.x1, seg.y1);
      state.wbHistory.push(seg);
      sendWs({ type: 'whiteboard_draw', seg });
    }
    state.wbSnapshot = null;
    state.wbShapeStart = null;

    if (state.wbTool === 'pen' || state.wbTool === 'marker' || state.wbTool === 'eraser') {
      const ctx = getCtx();
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
    }
  }

  function drawShapePreview(ctx, tool, x0, y0, x1, y1, color = state.wbColor, size = state.wbSize) {
    ctx.save();
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    ctx.strokeStyle = color;
    ctx.lineWidth = size;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    if (tool === 'line') {
      ctx.moveTo(x0, y0); ctx.lineTo(x1, y1);
      ctx.stroke();
    } else if (tool === 'rect') {
      ctx.strokeRect(x0, y0, x1 - x0, y1 - y0);
    } else if (tool === 'circle') {
      const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
      const rx = Math.abs(x1 - x0) / 2, ry = Math.abs(y1 - y0) / 2;
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      ctx.stroke();
    } else if (tool === 'arrow') {
      const dx = x1 - x0, dy = y1 - y0;
      const len = Math.sqrt(dx * dx + dy * dy);
      if (len < 2) { ctx.restore(); return; }
      const angle = Math.atan2(dy, dx);
      const headLen = Math.min(20, len * 0.35);
      ctx.moveTo(x0, y0); ctx.lineTo(x1, y1);
      ctx.moveTo(x1, y1);
      ctx.lineTo(x1 - headLen * Math.cos(angle - Math.PI / 6), y1 - headLen * Math.sin(angle - Math.PI / 6));
      ctx.moveTo(x1, y1);
      ctx.lineTo(x1 - headLen * Math.cos(angle + Math.PI / 6), y1 - headLen * Math.sin(angle + Math.PI / 6));
      ctx.stroke();
    }
    ctx.restore();
  }

  function wbShowTextInput(x, y) {
    const wrap = document.getElementById('wb-text-input-wrap');
    const input = document.getElementById('wb-text-input');
    if (!wrap || !input) return;
    wrap.style.display = 'block';
    wrap.style.left = x + 'px';
    wrap.style.top = (y - 20) + 'px';
    input.value = '';
    input.style.color = state.wbColor;
    input.style.fontSize = (state.wbSize * 4 + 10) + 'px';
    input.focus();
    input.onkeydown = function(e) {
      if (e.key === 'Enter') {
        const text = input.value.trim();
        if (text) {
          const ctx = getCtx();
          ctx.save();
          ctx.font = `${state.wbSize * 4 + 10}px DM Sans, sans-serif`;
          ctx.fillStyle = state.wbColor;
          ctx.fillText(text, x, y);
          ctx.restore();
          const seg = { tool: 'text', color: state.wbColor, size: state.wbSize, x, y, text };
          state.wbHistory.push(seg);
          sendWs({ type: 'whiteboard_draw', seg });
          state.wbRedoStack = [];
        }
        wrap.style.display = 'none';
        e.preventDefault();
      } else if (e.key === 'Escape') {
        wrap.style.display = 'none';
      }
    };
  }

  function getCtx() {
    const canvas = document.getElementById('wb-canvas');
    return canvas.getContext('2d');
  }

  function getCanvasPos(e) {
    const canvas = document.getElementById('wb-canvas');
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return [clientX - rect.left, clientY - rect.top];
  }

  function redrawCanvas() {
    const canvas = document.getElementById('wb-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    state.wbHistory.forEach(seg => drawSeg(ctx, seg));
  }

  function drawSeg(ctx, seg) {
    ctx.save();
    ctx.globalAlpha = 1;
    if (seg.tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = seg.size;
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(seg.x0, seg.y0);
      ctx.lineTo(seg.x1, seg.y1);
      ctx.stroke();
    } else if (seg.tool === 'pen' || seg.tool === 'marker') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = seg.color;
      ctx.lineWidth = seg.tool === 'marker' ? seg.size * 3 : seg.size;
      ctx.globalAlpha = seg.tool === 'marker' ? 0.45 : 1;
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(seg.x0, seg.y0);
      ctx.lineTo(seg.x1, seg.y1);
      ctx.stroke();
    } else if (seg.tool === 'text') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.font = `${seg.size * 4 + 10}px DM Sans, sans-serif`;
      ctx.fillStyle = seg.color;
      ctx.fillText(seg.text, seg.x, seg.y);
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = seg.color;
      ctx.lineWidth = seg.size;
      drawShapePreview(ctx, seg.tool, seg.x0, seg.y0, seg.x1, seg.y1);
    }
    ctx.restore();
  }

  function wbReceiveDraw(msg) {
    const ctx = getCtx();
    if (!ctx) return;
    drawSeg(ctx, msg.seg);
    state.wbHistory.push(msg.seg);
  }

  function wbClear(broadcast = true) {
    state.wbHistory = [];
    state.wbRedoStack = [];
    const canvas = document.getElementById('wb-canvas');
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    if (broadcast) sendWs({ type: 'whiteboard_clear' });
  }

  function wbClearCanvas(broadcast) { wbClear(broadcast); }

  function wbUndo() {
    if (!state.wbHistory.length) return;
    const seg = state.wbHistory.pop();
    state.wbRedoStack.push(seg);
    redrawCanvas();
  }

  function wbRedo() {
    if (!state.wbRedoStack.length) return;
    const seg = state.wbRedoStack.pop();
    state.wbHistory.push(seg);
    redrawCanvas();
  }

  function wbDownload() {
    const canvas = document.getElementById('wb-canvas');
    if (!canvas) return;
    const tmp = document.createElement('canvas');
    tmp.width = canvas.width; tmp.height = canvas.height;
    const ctx = tmp.getContext('2d');
    ctx.fillStyle = '#0f0d0a';
    ctx.fillRect(0, 0, tmp.width, tmp.height);
    ctx.drawImage(canvas, 0, 0);
    const a = document.createElement('a');
    a.download = 'studysync-lousa.png';
    a.href = tmp.toDataURL('image/png');
    a.click();
    toast('Imagem salva!', 'success');
  }

 

  function toggleFlashcards() {
    if (document.getElementById('flashcard-panel').classList.contains('open')) closeFlashcards();
    else openFlashcards();
  }

  function openFlashcards() {
    document.getElementById('flashcard-panel').classList.add('open');
    closeWhiteboard();
    document.getElementById('btn-tool-fc').classList.add('active');
    renderFlashcardUI();
  }

  function closeFlashcards() {
    const panel = document.getElementById('flashcard-panel');
    if (panel) panel.classList.remove('open');
    const btn = document.getElementById('btn-tool-fc');
    if (btn) btn.classList.remove('active');
  }

  function switchFcTab(tab) {
    state.fcMode = tab;
    document.querySelectorAll('.fc-tab').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
    renderFlashcardUI();
  }

  function renderFlashcardUI() {
    const body = document.getElementById('fc-body');
    if (!body) return;

    if (state.fcMode === 'cards') {
      if (!state.flashcards.length) {
        body.innerHTML = `
          <div class="empty-state">Nenhum card cadastrado ainda.</div>
          ${fcAddForm()}
        `;
      } else {
        const card = state.flashcards[state.fcIndex] || state.flashcards[0];
        state.fcIndex = Math.min(state.fcIndex, state.flashcards.length - 1);
        body.innerHTML = `
          <div class="fc-card-wrap" onclick="App.fcFlip()">
            <div class="fc-card ${state.fcFlipped ? 'flipped' : ''}" id="fc-card">
              <div class="fc-face fc-front">
                <div class="fc-label">Pergunta</div>
                <div class="fc-text">${escHtml(card.q)}</div>
                <div class="fc-hint">Clique para revelar a resposta</div>
              </div>
              <div class="fc-face fc-back">
                <div class="fc-label">Resposta</div>
                <div class="fc-text">${escHtml(card.a)}</div>
              </div>
            </div>
          </div>
          <div class="fc-nav">
            <button class="fc-nav-btn" onclick="App.fcPrev()">‹</button>
            <span class="fc-progress-text">${state.fcIndex + 1} / ${state.flashcards.length}</span>
            <button class="fc-nav-btn" onclick="App.fcNext()">›</button>
          </div>
          <button class="btn-delete" onclick="App.fcDelete(${state.fcIndex})" style="margin-top:4px;">Remover este card</button>
          ${fcAddForm()}
        `;
      }
    } else if (state.fcMode === 'review') {
      const now = new Date();
      state.fcReviewQueue = state.flashcards.filter(c => !c.nextReview || new Date(c.nextReview) <= now);
      
      if (!state.fcReviewQueue.length) {
        body.innerHTML = `
          <div class="empty-state">
            <div style="font-size:40px; margin-bottom:10px;">✅</div>
            <p>Tudo limpo por aqui! Você revisou todos os cards por hoje.</p>
            <button class="btn-primary" onclick="App.switchFcTab('cards')" style="margin-top:15px;">Ver Todos</button>
          </div>`;
        return;
      }

      const card = state.fcReviewQueue[0];
      body.innerHTML = `
        <div class="fc-label" style="text-align:center; margin-bottom:10px;">Revisão Espaçada (${state.fcReviewQueue.length} restantes)</div>
        <div class="fc-card-wrap" onclick="App.fcFlip()">
          <div class="fc-card ${state.fcFlipped ? 'flipped' : ''}" id="fc-card">
            <div class="fc-face fc-front">
              <div class="fc-text">${escHtml(card.q)}</div>
              <div class="fc-hint">Clique para revelar</div>
            </div>
            <div class="fc-face fc-back">
              <div class="fc-text">${escHtml(card.a)}</div>
            </div>
          </div>
        </div>
        ${state.fcFlipped ? `
          <div class="srs-controls" style="display:grid; grid-template-columns: repeat(4, 1fr); gap: 5px; margin-top:15px;">
            <button class="btn-srs srs-0" onclick="App.submitSrsReview(0)">Errei</button>
            <button class="btn-srs srs-3" onclick="App.submitSrsReview(3)">Difícil</button>
            <button class="btn-srs srs-4" onclick="App.submitSrsReview(4)">Bom</button>
            <button class="btn-srs srs-5" onclick="App.submitSrsReview(5)">Fácil</button>
          </div>
        ` : ''}
      `;
    } else {
      if (!state.flashcards.length) {
        body.innerHTML = '<div class="empty-state">Adicione flashcards primeiro para jogar o quiz!</div>';
        return;
      }
      if (!state.quizState) startQuiz();
      else renderQuizQuestion();
    }
  }

  function fcAddForm() {
    return `
      <div class="fc-add-form">
        <div class="fc-add-title"> Novo flashcard</div>
        <input id="fc-q" class="field-input" placeholder="Pergunta..." style="font-size:13px;padding:9px 12px;" />
        <input id="fc-a" class="field-input" placeholder="Resposta..." style="font-size:13px;padding:9px 12px;" />
        <button class="btn-primary" onclick="App.fcAdd()" style="padding:10px;">Adicionar</button>
      </div>
    `;
  }

  function fcFlip() {
    state.fcFlipped = !state.fcFlipped;
    const card = document.getElementById('fc-card');
    if (card) card.classList.toggle('flipped', state.fcFlipped);
  }

  function fcNext() {
    state.fcFlipped = false;
    state.fcIndex = (state.fcIndex + 1) % state.flashcards.length;
    renderFlashcardUI();
  }

  function fcPrev() {
    state.fcFlipped = false;
    state.fcIndex = (state.fcIndex - 1 + state.flashcards.length) % state.flashcards.length;
    renderFlashcardUI();
  }

  function fcAdd() {
    const q = document.getElementById('fc-q')?.value.trim();
    const a = document.getElementById('fc-a')?.value.trim();
    if (!q || !a) { toast('Preencha pergunta e resposta.', 'error'); return; }
    state.flashcards.push({ 
      q, a, 
      repetitions: 0, easeFactor: 2.5, interval: 0, 
      nextReview: new Date().toISOString() 
    });
    saveFlashcards();
    state.fcIndex = state.flashcards.length - 1;
    state.fcFlipped = false;
    toast('Flashcard adicionado!', 'success');
    renderFlashcardUI();
  }

  function fcDelete(idx) {
    state.flashcards.splice(idx, 1);
    saveFlashcards();
    state.fcIndex = Math.max(0, idx - 1);
    state.fcFlipped = false;
    renderFlashcardUI();
  }

  function saveFlashcards() {
    if (!state.user) return;
    
    localStorage.setItem('studysync_fc_' + state.user.id, JSON.stringify(state.flashcards));
    
    fetch(`${API}/api/users/${state.user.id}/flashcards`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ flashcards: state.flashcards })
    }).catch(() => {}); 
  }

  function startQuiz() {
    const shuffled = [...state.flashcards].sort(() => Math.random() - 0.5);
    state.quizState = { questions: shuffled, current: 0, score: 0, answered: false };
    renderQuizQuestion();
  }

  function renderQuizQuestion() {
    const body = document.getElementById('fc-body');
    const qs = state.quizState;
    if (!body || !qs) return;

    if (qs.current >= qs.questions.length) {
      const pct = Math.round((qs.score / qs.questions.length) * 100);
      body.innerHTML = `
        <div class="quiz-container" style="text-align:center">
          <div class="fc-label" style="margin-bottom:20px;">Fim do Quiz</div>
          <div class="quiz-score-circle">
            <div class="quiz-score-val">${pct}%</div>
            <div class="quiz-score-label">Acertos</div>
          </div>
          <div style="color:var(--text-1); font-size:16px; font-weight:500; margin-bottom:8px;">${qs.score} de ${qs.questions.length} corretas</div>
          <p style="color:var(--text-3); font-size:13px; margin-bottom:24px;">${pct >= 70 ? 'Incrível! Você dominou esse assunto.' : 'Bom esforço! Continue revisando para melhorar.'}</p>
          <button class="btn-primary" onclick="App.startQuiz()" style="width:100%">Tentar Novamente</button>
          <button class="btn-secondary" onclick="App.switchFcTab('cards')" style="width:100%; margin-top:10px;">Voltar para os Cards</button>
        </div>
      `;
      pushNotif('🧠', `Quiz concluído! Você acertou ${qs.score}/${qs.questions.length}`, true);
      return;
    }

    const card = qs.questions[qs.current];
    const others = state.flashcards.filter(c => c.a !== card.a).sort(() => Math.random() - 0.5).slice(0, 3);
    const opts = [...others.map(c => c.a), card.a].sort(() => Math.random() - 0.5);
    const progress = (qs.current / qs.questions.length) * 100;

    body.innerHTML = `
      <div class="quiz-container">
        <div class="quiz-progress-wrapper"><div class="quiz-progress-fill" style="width: ${progress}%"></div></div>
        <div class="fc-label" style="text-align:center; margin-bottom:10px;">Questão ${qs.current + 1} de ${qs.questions.length}</div>
        <div class="quiz-card-question"><div class="quiz-q-text">${escHtml(card.q)}</div></div>
        <div class="quiz-options-grid">
          ${opts.map(opt => `<button class="quiz-opt-btn" onclick="App.quizAnswer('${escHtml(opt)}', '${escHtml(card.a)}')">${escHtml(opt)}</button>`).join('')}
        </div>
        <div class="quiz-result-feedback" id="quiz-result"></div>
      </div>
    `;
  }

  function quizAnswer(chosen, correct) {
    if (state.quizState?.answered) return;
    state.quizState.answered = true;

    document.querySelectorAll('.quiz-opt-btn').forEach(btn => {
      btn.disabled = true;
      if (btn.textContent === correct) btn.classList.add('correct');
      else if (btn.textContent === chosen && chosen !== correct) btn.classList.add('wrong');
    });

    const result = document.getElementById('quiz-result');
    if (chosen === correct) {
      state.quizState.score++;
      if (result) { result.style.color = '#7abc8a'; result.textContent = '✨ Mandou bem!'; }
    } else {
      if (result) { result.style.color = '#e07060'; result.textContent = '❌ Quase lá!'; }
    }

    const nextProgress = ((state.quizState.current + 1) / state.quizState.questions.length) * 100;
    document.querySelector('.quiz-progress-fill').style.width = nextProgress + '%';

    setTimeout(() => {
      state.quizState.current++;
      state.quizState.answered = false;
      renderQuizQuestion();
    }, 1600);
  }

  

  function pushNotif(icon, text, show = true) {
    const notif = { icon, text, time: Date.now(), unread: true };
    state.notifications.unshift(notif);
    if (state.notifications.length > 30) state.notifications.pop();
    saveNotifs();
    updateNotifDot();
    if (show) renderNotifPanel();
  }

  function updateNotifDot() {
    const hasUnread = state.notifications.some(n => n.unread);
    document.querySelectorAll('.notif-dot').forEach(d => d.classList.toggle('visible', hasUnread));
  }

  function toggleNotifPanel() {
    state.notifOpen = !state.notifOpen;
    const panel = document.getElementById('notif-panel');
    if (!panel) return;
    panel.classList.toggle('open', state.notifOpen);
    if (state.notifOpen) {
      renderNotifPanel();
      setTimeout(() => {
        state.notifications.forEach(n => n.unread = false);
        saveNotifs();
        updateNotifDot();
        renderNotifPanel();
      }, 800);
    }
  }

  function renderNotifPanel() {
    const list = document.getElementById('notif-list');
    if (!list) return;
    if (!state.notifications.length) {
      list.innerHTML = '<div class="notif-empty">Nenhuma notificação</div>';
      return;
    }
    list.innerHTML = state.notifications.map((n, i) => `
      <div class="notif-item ${n.unread ? 'unread' : ''}">
        <div class="notif-icon">${n.icon}</div>
        <div class="notif-body">
          <div class="notif-text">${n.text}</div>
          <div class="notif-time">${formatTimeAgo(n.time)}</div>
        </div>
      </div>
    `).join('');
  }

  function clearNotifs() {
    state.notifications = [];
    saveNotifs();
    updateNotifDot();
    renderNotifPanel();
  }

  function saveNotifs() {
    if (state.user) localStorage.setItem('studysync_notifs_' + state.user.id, JSON.stringify(state.notifications));
  }

  function formatTimeAgo(ts) {
    const diff = Math.floor((Date.now() - ts) / 1000);
    if (diff < 60) return 'agora';
    if (diff < 3600) return `${Math.floor(diff/60)}min atrás`;
    if (diff < 86400) return `${Math.floor(diff/3600)}h atrás`;
    return `${Math.floor(diff/86400)}d atrás`;
  }

  async function requestNotificationPermission() {
    if (!("Notification" in window)) return;
    if (Notification.permission === "default") {
      await Notification.requestPermission();
    }
  }

  function showBrowserNotification(title, body) {
    if (Notification.permission === "granted") {
      new Notification(title, {
        body: body,
        icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23e8a04a'%3E%3Cpath d='M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z'/%3E%3C/svg%3E"
      });
    }
  }

  function checkReminders() {
    if (!state.user) return;
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

   
    const dueCards = state.flashcards.filter(c => !c.nextReview || new Date(c.nextReview) <= now).length;
    if (dueCards > 0) {
      const lastCheck = localStorage.getItem('last_fc_reminder_' + state.user.id);
      if (lastCheck !== todayStr) {
        showBrowserNotification("📚 Revisão Pendente", `Você tem ${dueCards} cards para revisar hoje no StudySync!`);
        localStorage.setItem('last_fc_reminder_' + state.user.id, todayStr);
      }
    }

 
    state.calEvents.forEach(ev => {
      if (ev.date && ev.date.includes('T')) {
        const evDate = new Date(ev.date);
        const diffMin = Math.round((evDate - now) / 60000);
        if (diffMin >= 9 && diffMin <= 10) {
          const reminderId = `remind_cal_${ev.id}`;
          if (!sessionStorage.getItem(reminderId)) {
            showBrowserNotification("📅 Lembrete de Sessão", `Sua sessão "${ev.title}" começa em 10 minutos!`);
            sessionStorage.setItem(reminderId, 'true');
          }
        }
      }
    });
  }

  function startReminderCheck() {
    if (state.reminderInterval) clearInterval(state.reminderInterval);
    state.reminderInterval = setInterval(checkReminders, 60000);
    checkReminders();
  }


  function renderProfile() {
    if (!state.user) return;
    const username = state.user.username;
    const [bg] = avatarColor(username);

    const av = document.getElementById('profile-avatar-lg');
    if (av) {
      if (state.profileEmoji !== '🧑') {
        av.style.background = 'var(--bg-3)';
        av.innerHTML = `<span style="font-size:48px">${state.profileEmoji}</span><div class="profile-avatar-edit">✏️</div>`;
      } else {
        av.style.background = bg;
        av.innerHTML = `<span style="font-size:40px;color:var(--bg-0);font-weight:600">${username[0].toUpperCase()}</span><div class="profile-avatar-edit">✏️</div>`;
      }
    }

    const nameEl = document.getElementById('profile-name');
    if (nameEl) nameEl.textContent = username;

    const bioEl = document.getElementById('profile-bio-display');
    if (bioEl) bioEl.textContent = state.profileBio || 'Clique para adicionar uma bio...';

    const sinceEl = document.getElementById('profile-since');
    if (sinceEl) {
      const d = state.user.created_at ? new Date(state.user.created_at).toLocaleDateString('pt-BR') : '—';
      sinceEl.textContent = `Membro desde ${d}`;
    }

    const themeBtn = document.querySelector('.theme-toggle-btn');
    if (themeBtn) {
      const labelSpan = themeBtn.querySelector('.theme-label');
      if (labelSpan) labelSpan.textContent = `Modo ${state.theme === 'dark' ? 'Escuro' : 'Claro'}`;
    }

    renderProfileStats();
    renderFriendsList();
    renderBadges();
    renderSubjectStats();
  }

  async function renderProfileStats() {
    try {
      const res = await fetch(`${API}/api/users/${state.user.id}/dashboard`);
      const data = await res.json();
      const s = data.stats;
      const ids = {
        'pstat-hours': s.total_hours + 'h',
        'pstat-today': s.today_minutes + 'min',
        'pstat-streak': s.streak_days + ' dias',
        'pstat-sessions': s.total_sessions + '',
      };
      Object.entries(ids).forEach(([id, val]) => {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
      });
    } catch(e) {}
  }

  function toggleBioEdit() {
    const display = document.getElementById('profile-bio-display');
    const edit    = document.getElementById('profile-bio-edit');
    if (!display || !edit) return;
    display.style.display = 'none';
    edit.style.display = 'block';
    edit.value = state.profileBio;
    edit.focus();
    edit.onblur = () => saveBio(edit.value);
    edit.onkeydown = e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); edit.blur(); } };
  }

  function saveBio(val) {
    state.profileBio = val.trim();
    saveProfilePrefs();
    const display = document.getElementById('profile-bio-display');
    const edit    = document.getElementById('profile-bio-edit');
    if (display) { display.style.display = ''; display.textContent = state.profileBio || 'Clique para adicionar uma bio...'; }
    if (edit)    edit.style.display = 'none';
    toast('Bio salva!', 'success');
  }

  function saveProfilePrefs() {
    if (!state.user) return;
    const prefs = {
      profileEmoji: state.profileEmoji,
      profileBio: state.profileBio,
    };
    localStorage.setItem('studysync_profile_' + state.user.id, JSON.stringify(prefs));
  }

  function loadProfilePrefs() {
    if (!state.user) return;
    const stored = localStorage.getItem('studysync_profile_' + state.user.id);
    if (!stored) return;
    try {
      const prefs = JSON.parse(stored);
      if (prefs.profileEmoji) state.profileEmoji = prefs.profileEmoji;
      if (prefs.profileBio) state.profileBio = prefs.profileBio;
    } catch (e) {
      console.warn('Erro ao carregar preferências do perfil:', e);
    }
  }

  const PROFILE_EMOJIS = ['🧑','👩','👨','🧑‍💻','👩‍💻','👨‍💻','🦊','🐼','🐨','🦁','🐯','🐸','🦋','🌸','⭐','🔥','💎','🚀','🎯','📚'];

  function toggleEmojiPicker() {
    const picker = document.getElementById('profile-emoji-picker');
    if (!picker) return;
    picker.classList.toggle('open');
    if (picker.classList.contains('open') && !picker.children.length) {
      picker.innerHTML = PROFILE_EMOJIS.map(e =>
        `<span class="profile-emoji-opt" onclick="App.setProfileEmoji('${e}')">${e}</span>`
      ).join('');
    }
  }

  function setProfileEmoji(emoji) {
    state.profileEmoji = emoji;
    saveProfilePrefs();
    renderProfile();
    updateHeaderUser();
    const picker = document.getElementById('profile-emoji-picker');
    if (picker) picker.classList.remove('open');
  }

  function renderFriendsList() {
    const list = document.getElementById('friends-list');
    if (!list) return;
    if (!state.friends.length) {
      list.innerHTML = `<div class="empty-state" style="font-size:13px;padding:20px 0">Nenhum amigo ainda. Compartilhe seu ID!</div>`;
      return;
    }
    list.innerHTML = state.friends.map((f, i) => {
      const online = state.onlineFriends.has(f.username);
      const [bg] = avatarColor(f.username);
      return `
        <div class="friend-item">
          <div class="friend-avatar" style="background:${bg}">${f.username[0].toUpperCase()}</div>
          <div class="friend-info">
            <div class="friend-name">${escHtml(f.username)}</div>
            ${f.friendCode ? `<div class="friend-code-label">ID: ${f.friendCode}</div>` : ''}
          </div>
          <div class="friend-status ${online ? 'online' : 'offline'}">${online ? '● online' : '○ offline'}</div>
          <button class="friend-remove-btn" onclick="App.removeFriend(${i})" title="Remover">✕</button>
        </div>`;
    }).join('');
  }


  function updateFriendsList() {
    if (document.getElementById('screen-profile').classList.contains('active')) {
      renderFriendsList();
    }
  }


  function getFriendCode(userId) {
   
    return (userId || '').replace(/-/g, '').slice(0, 8).toUpperCase();
  }

  function copyFriendId() {
    const code = document.getElementById('my-friend-id')?.textContent;
    if (!code || code === '—') return;
    navigator.clipboard.writeText(code).then(() => toast('ID copiado! 📋', 'success'));
  }

  function addFriend() {
    const input = document.getElementById('friend-input');
    if (!input) return;
    const code = input.value.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    input.value = '';
    sendFriendInvite(code);
  }

  function addFriendByName(username) {
   
    if (!username || username === state.user?.username) return;
    if (state.friends.some(f => f.username.toLowerCase() === username.toLowerCase())) return;
    state.friends.push({ username, addedAt: Date.now(), lastSeen: Date.now(), friendCode: null });
    saveFriends();
    renderFriendsList();
    checkAndUnlockBadges();
  }

  function sendFriendInvite(code) {
    if (!code || code.length < 6) { toast('ID inválido. Deve ter 8 caracteres.', 'error'); return; }
    const myCode = getFriendCode(state.user?.id);
    if (code === myCode) { toast('Esse é o seu próprio ID! 😄', 'error'); return; }

   
    if (state.friends.some(f => f.friendCode === code)) {
      toast('Você já é amigo desta pessoa!', 'error'); return;
    }

    
    const sentKey = 'studysync_invites_sent_' + state.user.id;
    const sent = JSON.parse(localStorage.getItem(sentKey) || '[]');
    if (sent.some(s => s.to === code)) {
      toast('Convite já enviado para este ID!', 'error'); return;
    }

    
    sent.push({ to: code, at: Date.now() });
    localStorage.setItem(sentKey, JSON.stringify(sent));

  
    const inboxKey = 'studysync_inbox_' + code;
    const inbox = JSON.parse(localStorage.getItem(inboxKey) || '[]');

    if (!inbox.some(i => i.from === myCode)) {
      inbox.push({
        from: myCode,
        fromUsername: state.user?.username || 'Anônimo',
        at: Date.now(),
        id: 'inv_' + Date.now()
      });
      localStorage.setItem(inboxKey, JSON.stringify(inbox));
    }

    toast(`Convite enviado! Aguarde ${code} aceitar. 📨`, 'success');
    pushNotif('📨', `Convite enviado para <strong>${code}</strong>`, false);
  }

  function loadFriendInvites() {
    if (!state.user) return;
    const myCode = getFriendCode(state.user.id);
    const inboxKey = 'studysync_inbox_' + myCode;
    const inbox = JSON.parse(localStorage.getItem(inboxKey) || '[]');
    
    const pending = inbox.filter(inv => !state.friends.some(f => f.friendCode === inv.from));

    const section = document.getElementById('friend-invites-section');
    const list = document.getElementById('friend-invites-list');
    if (!section || !list) return;

    if (!pending.length) { section.style.display = 'none'; return; }
    section.style.display = 'block';
    list.innerHTML = pending.map(inv => `
      <div class="friend-invite-card" data-id="${inv.id}">
        <div class="friend-invite-info">
          <div class="friend-invite-avatar">${inv.fromUsername[0].toUpperCase()}</div>
          <div>
            <div class="friend-invite-name">${escHtml(inv.fromUsername)}</div>
            <div class="friend-invite-code">ID: ${inv.from}</div>
          </div>
        </div>
        <div class="friend-invite-actions">
          <button class="friend-accept-btn" onclick="App.acceptInvite('${inv.id}','${inv.from}','${escHtml(inv.fromUsername)}')">✓ Aceitar</button>
          <button class="friend-decline-btn" onclick="App.declineInvite('${inv.id}','${inv.from}')">✕</button>
        </div>
      </div>
    `).join('');
  }

  function acceptInvite(invId, fromCode, fromUsername) {
    const myCode = getFriendCode(state.user.id);


    state.friends.push({
      username: fromUsername,
      friendCode: fromCode,
      addedAt: Date.now(),
      lastSeen: Date.now()
    });
    saveFriends();

    
    const inboxKey = 'studysync_inbox_' + myCode;
    let inbox = JSON.parse(localStorage.getItem(inboxKey) || '[]');
    inbox = inbox.filter(i => i.id !== invId);
    localStorage.setItem(inboxKey, JSON.stringify(inbox));

   
    const confirmKey = 'studysync_inbox_' + fromCode;
    const confirmBox = JSON.parse(localStorage.getItem(confirmKey) || '[]');
    if (!confirmBox.some(i => i.type === 'accepted' && i.from === myCode)) {
      confirmBox.push({ type: 'accepted', from: myCode, fromUsername: state.user?.username, at: Date.now(), id: 'acc_' + Date.now() });
      localStorage.setItem(confirmKey, JSON.stringify(confirmBox));
    }

    renderFriendsList();
    loadFriendInvites();
    checkAndUnlockBadges();
    toast(`${fromUsername} agora é seu amigo! 🤝`, 'success');
    pushNotif('🤝', `<strong>${fromUsername}</strong> aceitou seu convite de amizade!`, false);
  }

  function declineInvite(invId, fromCode) {
    const myCode = getFriendCode(state.user.id);
    const inboxKey = 'studysync_inbox_' + myCode;
    let inbox = JSON.parse(localStorage.getItem(inboxKey) || '[]');
    inbox = inbox.filter(i => i.id !== invId);
    localStorage.setItem(inboxKey, JSON.stringify(inbox));
    loadFriendInvites();
    toast('Convite recusado.', '');
  }

  function checkAcceptedInvites() {
    
    if (!state.user) return;
    const myCode = getFriendCode(state.user.id);
    const inboxKey = 'studysync_inbox_' + myCode;
    let inbox = JSON.parse(localStorage.getItem(inboxKey) || '[]');
    const acceptedItems = inbox.filter(i => i.type === 'accepted');
    if (!acceptedItems.length) return;

    acceptedItems.forEach(item => {
      if (!state.friends.some(f => f.friendCode === item.from)) {
        state.friends.push({
          username: item.fromUsername,
          friendCode: item.from,
          addedAt: Date.now(),
          lastSeen: Date.now()
        });
        toast(`${item.fromUsername} aceitou seu convite! 🎉`, 'success');
        pushNotif('🎉', `<strong>${item.fromUsername}</strong> aceitou seu convite de amizade!`, false);
      }
    });


    inbox = inbox.filter(i => i.type !== 'accepted');
    localStorage.setItem(inboxKey, JSON.stringify(inbox));
    saveFriends();
    renderFriendsList();
  }

  function removeFriend(idx) {
    const name = state.friends[idx]?.username;
    state.friends.splice(idx, 1);
    saveFriends();
    renderFriendsList();
    toast(`${name} removido.`, '');
  }

  function saveFriends() {
    if (state.user) {
      localStorage.setItem('studysync_friends_' + state.user.id, JSON.stringify(state.friends));
      syncFriendsToEduShorts();
    }
  }

  // Sincroniza amigos do StudySync com o "seguindo" do EduShorts (tiktok)
  function syncFriendsToEduShorts() {
    try {
      const raw = localStorage.getItem('edushorts_v1');
      const eduState = raw ? JSON.parse(raw) : { liked: {}, saved: {}, following: {}, likes: {}, notifications: [] };
      if (!eduState.following) eduState.following = {};

      // Para cada amigo, marca como seguindo no EduShorts
      // O campo "following" do EduShorts é indexado por video id
      // Precisamos do mapa de username -> video ids; usamos a chave auxiliar
      const friendUsernames = (state.friends || []).map(f => f.username.toLowerCase());

      // Guarda os usernames dos amigos como lista para o EduShorts ler
      localStorage.setItem('studysync_friend_usernames', JSON.stringify(friendUsernames));

      localStorage.setItem('edushorts_v1', JSON.stringify(eduState));
    } catch (e) {
      console.warn('syncFriendsToEduShorts error:', e);
    }
  }

  

  async function checkAndUnlockBadges() {
    const res = await fetch(`${API}/api/users/${state.user.id}/dashboard`);
    const data = await res.json();
    const stats = data.stats;
    
    let newBadges = [];
    for (const badge of state.availableBadges) {
      if (!state.badges.some(b => b.id === badge.id) && badge.condition(stats)) {
        state.badges.push({ ...badge, unlockedAt: Date.now() });
        newBadges.push(badge);
        pushNotif(badge.icon, `🏆 Conquista desbloqueada: <strong>${badge.name}</strong>! ${badge.desc}`, true);
      }
    }
    if (newBadges.length > 0) {
      saveBadges();
      renderBadges();
    }
  }

  function saveBadges() {
    localStorage.setItem('studysync_badges_' + state.user.id, JSON.stringify(state.badges));
  }

  function renderBadges() {
    const container = document.getElementById('profile-badges-list');
    if (!container) return;
    if (state.badges.length === 0) {
      container.innerHTML = '<div class="empty-state">Complete ações para desbloquear conquistas!</div>';
      return;
    }
    container.innerHTML = state.badges.map(b => `
      <div class="badge-card" title="${b.desc}">
        <div class="badge-icon">${b.icon}</div>
        <div class="badge-name">${b.name}</div>
      </div>
    `).join('');
  }

 

  function showSubjectPickerModal(durationSeconds) {
    const subjects = state.subjects || ['Matemática','Português','História','Ciências','Programação','Geral'];
    const overlay = document.createElement('div');
    overlay.className = 'subject-modal-overlay';
    overlay.id = 'subject-picker-overlay';

    overlay.innerHTML = `
      <div class="subject-modal">
        <h3>🎉 Sessão concluída!</h3>
        <p>Qual matéria você estudou? Isso alimenta seu Dashboard e Relatório.</p>
        <div class="subject-chips">
          ${subjects.map(s => `<div class="subject-chip" onclick="App.pickSubject('${s}')">${s}</div>`).join('')}
        </div>
        <div style="display:flex;gap:8px;margin-bottom:12px;">
          <input id="subject-custom-input" class="field-input" type="text" placeholder="Outra matéria..." style="flex:1;padding:8px 12px;font-size:13px;" />
        </div>
        <div class="subject-modal-actions">
          <button class="btn-secondary" onclick="App.pickSubject('Geral')">Pular</button>
          <button class="btn-primary" onclick="App.pickSubjectCustom()">Confirmar</button>
        </div>
      </div>
    `;

    state._pendingSessionDuration = durationSeconds;
    document.body.appendChild(overlay);


    overlay.querySelectorAll('.subject-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        overlay.querySelectorAll('.subject-chip').forEach(c => c.classList.remove('selected'));
        chip.classList.add('selected');
        document.getElementById('subject-custom-input').value = '';
      });
    });
  }

  function pickSubject(subject) {
    _finishSubjectPick(subject);
  }

  function pickSubjectCustom() {
    const overlay = document.getElementById('subject-picker-overlay');
    const selected = overlay?.querySelector('.subject-chip.selected');
    const custom = document.getElementById('subject-custom-input')?.value.trim();
    const subject = custom || selected?.textContent || 'Geral';
    _finishSubjectPick(subject);
  }

  function _finishSubjectPick(subject) {
    const overlay = document.getElementById('subject-picker-overlay');
    if (overlay) overlay.remove();
    const dur = state._pendingSessionDuration || 0;
    state._pendingSessionDuration = null;
    if (subject) logStudySession(subject, dur);
  }

  function logStudySession(subject, durationSeconds) {
    state.studySessions.push({
      subject,
      duration: durationSeconds,
      date: new Date().toISOString().split('T')[0]
    });
    saveStudySessions();
    renderSubjectStats();
  }

  function saveStudySessions() {
    localStorage.setItem('studysync_sessions_' + state.user.id, JSON.stringify(state.studySessions));
  }

  function renderSubjectStats() {
    const container = document.getElementById('subject-stats');
    if (!container) return;

    const stats = {};
    state.studySessions.forEach(s => {
      if (!stats[s.subject]) stats[s.subject] = 0;
      stats[s.subject] += s.duration;
    });

    const goals = state.user?.subject_goals || {};
    const allSubjects = state.subjects || ['Matemática','Português','História','Ciências','Programação','Geral'];
    const allKeys = new Set([...Object.keys(stats), ...Object.keys(goals), ...allSubjects]);

    const rows = Array.from(allKeys).map(subject => {
      const seconds = stats[subject] || 0;
      const hours = (seconds / 3600).toFixed(1);
      const goalMinutes = goals[subject] || 0;
      const percent = goalMinutes > 0 ? Math.min(100, (seconds / 60 / goalMinutes) * 100) : 0;
      const barColor = percent >= 100 ? 'var(--sage)' : 'var(--accent)';
      return `
        <div class="subject-stat-item">
          <div class="subject-name">${subject}</div>
          <div class="subject-bar-container">
            <div class="subject-bar" style="width:${percent}%;background:${barColor}"></div>
          </div>
          <div class="subject-hours">${hours}h</div>
          <div class="subject-goal-wrap">
            <input class="subject-goal-input" type="number" min="0" max="9999" step="15"
              value="${goalMinutes}" placeholder="0"
              onchange="App.updateSubjectGoal('${subject}', this.value)" />
            <span class="subject-goal-label">min/sem</span>
          </div>
        </div>`;
    }).join('');

    container.innerHTML = `
      <div class="subject-stats-header">
        <span style="font-size:12px;color:var(--text-3)">Defina suas metas semanais por matéria</span>
        <button class="btn-secondary small" onclick="App.saveSubjectGoals()">💾 Salvar metas</button>
      </div>${rows}`;
  }

  function updateSubjectGoal(subject, value) {
    if (!state.user) return;
    if (!state.user.subject_goals) state.user.subject_goals = {};
    state.user.subject_goals[subject] = parseInt(value) || 0;
  }

  async function saveSubjectGoals() {
    if (!state.user) return;
    try {
      const res = await fetch(`${API}/api/users/${state.user.id}/goals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject_goals: state.user.subject_goals || {} })
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      state.user = { ...state.user, ...data.user };
      localStorage.setItem('studysync_user', JSON.stringify(state.user));
      toast(' Metas salvas!', 'success');
      renderSubjectStats();
    } catch(e) {
      toast('Erro ao salvar metas.', 'error');
    }
  }


  async function loadFlashcards() {
    if (!state.user) return;
    try {
      const res = await fetch(`${API}/api/users/${state.user.id}/flashcards`);
      if (res.ok) {
        const data = await res.json();
        state.flashcards = data.flashcards || [];
      
        localStorage.setItem('studysync_fc_' + state.user.id, JSON.stringify(state.flashcards));
        return;
      }
    } catch(e) {}
   
    const stored = localStorage.getItem('studysync_fc_' + state.user.id);
    state.flashcards = stored ? JSON.parse(stored) : [];
  }

  function loadStudySessions() {
    if (!state.user) return;
    const stored = localStorage.getItem('studysync_sessions_' + state.user.id);
    state.studySessions = stored ? JSON.parse(stored) : [];
  }

  function renderSrsDashboard() {
    const container = document.getElementById('dashboard-stats-grid');
    if (!container) return;

    const cards = state.flashcards;
    
    const now = new Date();
    const dueCards = cards.filter(c => !c.nextReview || new Date(c.nextReview) <= now).length;


    let srsCard = document.getElementById('stat-srs-due');
    if (!srsCard) {
      const cardHtml = `
        <div class="stat-card highlight" id="stat-srs-due" onclick="App.openFlashcardsReview()" style="cursor:pointer">
          <div class="stat-value" id="stat-srs-due-val">${dueCards}</div>
          <div class="stat-label">Cards para Revisar</div>
          <div class="stat-icon">🧠</div>
        </div>
      `;
      container.insertAdjacentHTML('beforeend', cardHtml);
    } else {
      document.getElementById('stat-srs-due-val').textContent = dueCards;
    }
  }

  function openFlashcardsReview() {
    state.fcMode = 'review';
    openFlashcards();
  }

  function updateSrsCard(card, quality) {
  
    let { repetitions, easeFactor, interval } = card;
    
    if (!repetitions) repetitions = 0;
    if (!easeFactor) easeFactor = 2.5;
    if (!interval) interval = 0;

    if (quality >= 3) {
      if (repetitions === 0) {
        interval = 1;
      } else if (repetitions === 1) {
        interval = 6;
      } else {
        interval = Math.round(interval * easeFactor);
      }
      repetitions++;
    } else {
      repetitions = 0;
      interval = 1;
    }

    easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    if (easeFactor < 1.3) easeFactor = 1.3;

    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + interval);

    return {
      ...card,
      repetitions,
      easeFactor,
      interval,
      nextReview: nextReview.toISOString()
    };
  }

  function submitSrsReview(quality) {
    const card = state.fcMode === 'review' 
      ? state.fcReviewQueue[0] 
      : state.flashcards[state.fcIndex];
    
    const updatedCard = updateSrsCard(card, quality);
    
  
    const masterIdx = state.flashcards.findIndex(c => c.q === card.q && c.a === card.a);
    if (masterIdx !== -1) {
      state.flashcards[masterIdx] = updatedCard;
      saveFlashcards();
    }

    if (state.fcMode === 'review') {
      state.fcReviewQueue.shift();
      state.fcFlipped = false;
      renderFlashcardUI();
    } else {
      toast('Revisão registrada!', 'success');
      fcNext();
    }
  }

  function exportDashboardData() {
    if (!state.studySessions.length) { toast('Nenhuma sessão para exportar.', 'error'); return; }
    
    let csv = 'Data,Materia,Duracao(seg)\n';
    state.studySessions.forEach(s => {
      csv += `${s.date},${s.subject},${s.duration}\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `studysync_report_${state.user.username}.csv`);
    a.click();
    toast('Relatório exportado! 📊', 'success');
  }

  function exportMonthlyReportPDF() {
    if (!state.user || !state.studySessions.length) {
      toast('Nenhuma sessão para exportar.', 'error');
      return;
    }

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const monthName = now.toLocaleDateString('pt-BR', { month: 'long' });

    const monthlySessions = state.studySessions.filter(s => {
      const d = new Date(s.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    if (monthlySessions.length === 0) {
      toast('Nenhuma sessão encontrada para este mês.', 'error');
      return;
    }

    const stats = {};
    monthlySessions.forEach(s => {
      stats[s.subject] = (stats[s.subject] || 0) + s.duration;
    });

    const totalSec = Object.values(stats).reduce((a, b) => a + b, 0);
    const totalHrs = (totalSec / 3600).toFixed(1);

    const reportHtml = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <title>Relatório StudySync - ${state.user.username}</title>
        <style>
          body { font-family: 'Segoe UI', sans-serif; color: #1e1a15; padding: 50px; background: #fff; line-height: 1.5; }
          .header { border-bottom: 4px solid #e8a04a; padding-bottom: 20px; margin-bottom: 40px; display: flex; justify-content: space-between; align-items: center; }
          .brand { font-size: 28px; font-weight: 800; color: #0f0d0a; }
          .period { text-align: right; color: #7a6e65; }
          .summary { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 40px; }
          .card { background: #f9f5f0; border-radius: 12px; padding: 25px; border: 1px solid #ddd1c2; }
          .card-label { font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; color: #8e7d6e; margin-bottom: 8px; }
          .card-value { font-size: 32px; font-weight: bold; color: #c96a4a; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { text-align: left; background: #161310; color: #fff; padding: 12px 15px; font-size: 13px; }
          td { padding: 12px 15px; border-bottom: 1px solid #ddd1c2; font-size: 14px; }
          tr:nth-child(even) { background: #fdfaf7; }
          .footer { margin-top: 60px; border-top: 1px solid #eee; padding-top: 20px; text-align: center; font-size: 12px; color: #b8a89a; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="brand">StudySync</div>
          <div class="period"><strong>Relatório Mensal de Progresso</strong><br>${monthName.toUpperCase()} / ${currentYear}</div>
        </div>
        <div style="margin-bottom: 20px;">Estudante: <strong>${state.user.username}</strong></div>
        <div class="summary">
          <div class="card">
            <div class="card-label">Tempo Total Investido</div>
            <div class="card-value">${totalHrs}h</div>
          </div>
          <div class="card">
            <div class="card-label">Sessões Concluídas</div>
            <div class="card-value">${monthlySessions.length}</div>
          </div>
        </div>
        <h3 style="color:#27211a; border-left: 4px solid #e8a04a; padding-left: 15px;">Detalhamento por Matéria</h3>
        <table>
          <thead><tr><th>Matéria</th><th>Duração</th><th>Participação</th></tr></thead>
          <tbody>
            ${Object.entries(stats).map(([subj, sec]) => `
              <tr>
                <td>${subj}</td>
                <td>${(sec / 3600).toFixed(1)}h</td>
                <td>${((sec / totalSec) * 100).toFixed(0)}%</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="footer">Gerado em ${new Date().toLocaleString('pt-BR')} via StudySync App.</div>
        <script>
          window.onload = () => { 
            setTimeout(() => { window.print(); }, 1000); 
          };
        </script>
      </body>
      </html>
    `;
    const printWin = window.open('', '_blank');
    printWin.document.write(reportHtml);
    printWin.document.close();
  }


  function loadTheme() {
    const savedTheme = localStorage.getItem('studysync_theme_' + state.user?.id);
    if (savedTheme && (savedTheme === 'dark' || savedTheme === 'light')) {
      state.theme = savedTheme;
    }
    applyTheme();
  }

  function applyTheme() {
    if (state.theme === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
  }

  function toggleTheme() {
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('studysync_theme_' + state.user.id, state.theme);
    applyTheme();
    renderProfile();
  }

 

  function loadRoomFiles(roomId) {
    const saved = localStorage.getItem(`studysync_files_${roomId}`);
    if (saved) state.roomFiles = JSON.parse(saved);
    renderFileList();
  }

  function saveRoomFiles(roomId) {
    localStorage.setItem(`studysync_files_${roomId}`, JSON.stringify(state.roomFiles));
  }

  function uploadFile() {
    const input = document.getElementById('file-upload');
    const file = input.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { toast('Arquivo muito grande (máx 10MB).', 'error'); return; }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const fileData = {
        id: Date.now() + '_' + Math.random().toString(36),
        name: file.name,
        size: file.size,
        type: file.type,
        uploadedBy: state.user.username,
        url: e.target.result,
        uploadedAt: Date.now()
      };
      state.roomFiles.push(fileData);
      saveRoomFiles(state.currentRoom.id);
      renderFileList();
      pushNotif('📎', `<strong>${state.user.username}</strong> compartilhou "${file.name}"`, true);
      
      if (!state.badges.some(b => b.id === 'file_sharer')) {
        const fileSharerBadge = state.availableBadges.find(b => b.id === 'file_sharer');
        if (fileSharerBadge) {
          state.badges.push({ ...fileSharerBadge, unlockedAt: Date.now() });
          saveBadges();
          renderBadges();
          pushNotif('📎', `🏆 Conquista desbloqueada: <strong>${fileSharerBadge.name}</strong>! ${fileSharerBadge.desc}`, true);
        }
      }
    };
    reader.readAsDataURL(file);
    input.value = '';
  }

  function renderFileList() {
    const container = document.getElementById('room-files-list');
    if (!container) return;
    if (!state.roomFiles.length) {
      container.innerHTML = '<div class="empty-state">Nenhum arquivo compartilhado ainda.</div>';
      return;
    }
    container.innerHTML = state.roomFiles.map(f => `
      <div class="file-item" id="file-item-${f.id}">
        <div class="file-icon">${getFileIcon(f.type)}</div>
        <div class="file-info">
          <div class="file-name" title="${f.name}">${f.name}</div>
          <div class="file-meta">${formatFileSize(f.size)} · ${f.uploadedBy} · ${new Date(f.uploadedAt).toLocaleDateString()}</div>
        </div>
        <div class="file-actions">
          ${f.type === 'application/pdf' ? `<button class="file-action-btn file-open-pdf" onclick="App.openFileInPdf('${f.id}')" title="Abrir no leitor de PDF">📖</button>` : ''}
          <button class="file-action-btn file-download-btn" onclick="App.downloadFile('${f.id}')" title="Baixar">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.29 9.82 19.79 19.79 0 01.22 1.18 2 2 0 012.22 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.18 6.18l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
          </button>
          <button class="file-action-btn file-delete-btn" onclick="App.deleteFile('${f.id}')" title="Remover arquivo">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
          </button>
        </div>
      </div>
    `).join('');
  }

  function getFileIcon(type) {
    if (type.startsWith('image/')) return '🖼️';
    if (type === 'application/pdf') return '📄';
    if (type.includes('word')) return '📝';
    return '📎';
  }

  function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  }

  function downloadFile(fileId) {
    const file = state.roomFiles.find(f => f.id === fileId);
    if (file && file.url) {
      const a = document.createElement('a');
      a.href = file.url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  }

  function deleteFile(fileId) {
    state.roomFiles = state.roomFiles.filter(f => f.id !== fileId);
    saveRoomFiles(state.currentRoom.id);
    renderFileList();
    toast('Arquivo removido.', 'success');
  }

  function openFileInPdf(fileId) {
    const file = state.roomFiles.find(f => f.id === fileId);
    if (!file || file.type !== 'application/pdf') return;
    const panel = document.getElementById('pdf-reader-panel');
    if (!panel) return;
    document.getElementById('whiteboard-panel')?.classList.remove('open');
    document.getElementById('btn-tool-wb')?.classList.remove('active');
    document.getElementById('flashcard-panel')?.classList.remove('open');
    document.getElementById('btn-tool-fc')?.classList.remove('active');
    document.getElementById('doc-panel')?.classList.remove('open');
    document.getElementById('btn-tool-doc')?.classList.remove('active');
    document.getElementById('code-editor-panel')?.classList.remove('open');
    document.getElementById('btn-tool-code')?.classList.remove('active');
    document.getElementById('translator-panel')?.classList.remove('open');
    document.getElementById('btn-tool-translator')?.classList.remove('active');
    panel.classList.add('open');
    document.getElementById('btn-tool-pdf')?.classList.add('active');
    fetch(file.url)
      .then(r => r.blob())
      .then(blob => {
        const f = new File([blob], file.name, { type: 'application/pdf' });
        pdfLoadFile(f);
      });
  }


  function loadPins() {
    const saved = localStorage.getItem(`studysync_pins_${state.currentRoom?.id}`);
    if (saved) state.pins = JSON.parse(saved);
    renderPins();
  }

  function savePins() {
    localStorage.setItem(`studysync_pins_${state.currentRoom?.id}`, JSON.stringify(state.pins));
  }

  function selectPinColor(color, el) {
    state.selectedPinColor = color;
    document.querySelectorAll('.pin-color-opt').forEach(opt => opt.classList.remove('active'));
    el.classList.add('active');
  }

  function onMuralClick(e) {
    if (e.target.id !== 'pins-canvas' && e.target.id !== 'pins-container') return;
    const rect = document.getElementById('pins-canvas').getBoundingClientRect();
    const x = e.clientX - rect.left - 80;
    const y = e.clientY - rect.top - 20;
    addPin('', x, y);
  }

  function addPin(content, x, y) {
    const newPin = {
      id: Date.now() + '_' + Math.random().toString(36),
      content: content,
      x, y,
      color: state.selectedPinColor,
      rotation: (Math.random() * 6 - 3), // pequena rotação para parecer real
      author: state.user.username,
      createdAt: Date.now()
    };
    state.pins.push(newPin);
    savePins();
    renderPins();
    
  
    if (!content) {
      setTimeout(() => {
        const el = document.querySelector(`[data-id="${newPin.id}"] .pin-content`);
        if (el) {
          el.contentEditable = "true";
          el.focus();
        }
      }, 50);
    }

    sendWs({ type: 'pin_add', pin: newPin });
    
    if (!state.badges.some(b => b.id === 'pin_creator')) {
      const pinCreatorBadge = state.availableBadges.find(b => b.id === 'pin_creator');
      if (pinCreatorBadge) {
        state.badges.push({ ...pinCreatorBadge, unlockedAt: Date.now() });
        saveBadges();
        renderBadges();
        pushNotif('📌', `🏆 Conquista desbloqueada: <strong>${pinCreatorBadge.name}</strong>! ${pinCreatorBadge.desc}`, true);
      }
    }
  }

  function updatePinContent(pinId, content) {
    const pin = state.pins.find(p => p.id === pinId);
    if (!pin) return;
    pin.content = content;
    savePins();
 
    sendWs({ type: 'pin_move', pinId, x: pin.x, y: pin.y }); 
  }

  function movePin(pinId, x, y) {
    const pin = state.pins.find(p => p.id === pinId);
    if (!pin) return;
    pin.x = x; pin.y = y;
    sendWs({ type: 'pin_move', pinId, x, y });
  }

  function deletePin(pinId) {
    state.pins = state.pins.filter(p => p.id !== pinId);
    savePins();
    renderPins();
    sendWs({ type: 'pin_delete', pinId });
  }

  function renderPins() {
    const canvas = document.getElementById('pins-canvas');
    if (!canvas) return;
    canvas.innerHTML = '';
    
    state.pins.forEach(p => {
      const el = document.createElement('div');
      el.className = 'pin';
      el.style.left = p.x + 'px';
      el.style.top = p.y + 'px';
      el.style.background = p.color;
      el.style.transform = `rotate(${p.rotation || 0}deg)`;
      el.dataset.id = p.id;
      el.innerHTML = `
        <div class="pin-content" contenteditable="false" onblur="this.contentEditable=false; App.updatePinContent('${p.id}', this.innerText)">${escHtml(p.content)}</div>
        <div class="pin-meta">${p.author}</div>
        <button class="pin-delete" onclick="event.stopPropagation(); App.deletePin('${p.id}')">✕</button>
      `;

      
      el.onmousedown = (e) => {
        let startX = e.clientX - el.offsetLeft;
        let startY = e.clientY - el.offsetTop;
        
        const onMouseMove = (moveEvent) => {
          let newX = moveEvent.clientX - startX;
          let newY = moveEvent.clientY - startY;
          el.style.left = newX + 'px';
          el.style.top = newY + 'px';
        };

        const onMouseUp = (upEvent) => {
          document.removeEventListener('mousemove', onMouseMove);
          document.removeEventListener('mouseup', onMouseUp);
          movePin(p.id, parseInt(el.style.left), parseInt(el.style.top));
          savePins();
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
      };

      el.ondblclick = () => {
        const contentEl = el.querySelector('.pin-content');
        if (contentEl) {
          contentEl.contentEditable = "true";
          contentEl.focus();
        }
      };

      canvas.appendChild(el);
    });
  }

  function clearPins() {
    if (!confirm('Deseja apagar todas as ideias desta página?')) return;
    state.pins = [];
    savePins();
    renderPins();
    
  }

  function togglePinBoard() {
    const board = document.getElementById('pin-board');
    if (!board) return;
    board.classList.toggle('open');
    if (board.classList.contains('open')) {
      loadPins();
      const newBoard = board.cloneNode(true);
      board.parentNode.replaceChild(newBoard, board);
      const newContainer = newBoard.querySelector('.pins-container');
      const newPins = state.pins.map(p => {
        const div = document.createElement('div');
        div.className = 'pin';
        div.style.left = p.x + 'px';
        div.style.top = p.y + 'px';
        div.style.background = p.color;
        div.innerHTML = `
          <div class="pin-content">${escHtml(p.content)}</div>
          <div class="pin-meta">${p.author}</div>
          <button class="pin-delete" onclick="App.deletePin('${p.id}')">✕</button>
        `;
        return div;
      });
      newPins.forEach(pin => newContainer.appendChild(pin));
      
      newBoard.addEventListener('click', (e) => {
        if (e.target === newContainer || e.target === newBoard) {
          const rect = newContainer.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          const content = prompt('Digite sua ideia:');
          if (content) addPin(content, x, y);
        }
      });
    }
  }



  async function loadRanking() {
    const list = document.getElementById('ranking-list');
    const podium = document.getElementById('ranking-podium');
    if (list) list.innerHTML = '<div class="empty-state">Carregando ranking...</div>';

    try {
      const period = state.rankTab === 'week' ? 'week' : 'total';
      const res = await fetch(`${API}/api/ranking?period=${period}`);
      if (!res.ok) throw new Error('Falha ao buscar ranking');
      const data = await res.json();

      state.rankData = (data.ranking || []).map(entry => ({
        username:  entry.username,
        hours:     entry.total_hours,
        weekHours: entry.week_hours,
        streak:    entry.streak_days,
        isMe:      entry.user_id === state.user?.id,
        position:  entry.position,
      }));

      renderRanking();
    } catch (e) {
      console.error('Erro ao carregar ranking:', e);
      toast('Erro ao carregar ranking.', 'error');
      if (list) list.innerHTML = '<div class="empty-state">Não foi possível carregar o ranking.</div>';
    }
  }

  function switchRankTab(tab) {
    state.rankTab = tab;
    document.querySelectorAll('.rank-tab').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
    loadRanking();
  }

  function renderRanking() {
    const sorted = [...state.rankData].sort((a, b) => {
      if (state.rankTab === 'week') return b.weekHours - a.weekHours;
      if (state.rankTab === 'streak') return b.streak - a.streak;
      return b.hours - a.hours;
    });

    const getValue = (e) => {
      if (state.rankTab === 'week') return e.weekHours + 'h';
      if (state.rankTab === 'streak') return e.streak + ' dias';
      return e.hours + 'h';
    };

    const podium = document.getElementById('ranking-podium');
    const top3 = [sorted[1], sorted[0], sorted[2]].filter(Boolean);
    if (podium) {
      const medals = ['🥈','🥇','🥉'];
      const pos = [2, 1, 3];
      podium.innerHTML = top3.map((e, i) => {
        if (!e) return '';
        const [bg] = avatarColor(e.username);
        return `
          <div class="podium-col">
            <div class="podium-crown">${medals[i]}</div>
            <div class="podium-avatar" style="background:${bg}">${e.username[0].toUpperCase()}</div>
            <div class="podium-name">${escHtml(e.username)}${e.isMe ? ' (você)' : ''}</div>
            <div class="podium-hours">${getValue(e)}</div>
            <div class="podium-base">${pos[i]}</div>
          </div>
        `;
      }).join('');
    }

    const list = document.getElementById('ranking-list');
    if (list) {
      const rest = sorted.slice(3);
      if (!rest.length) { list.innerHTML = '<div class="empty-state">Adicione amigos para ver o ranking completo!</div>'; return; }
      list.innerHTML = rest.map((e, i) => {
        const [bg] = avatarColor(e.username);
        return `
          <div class="rank-item ${e.isMe ? 'is-me' : ''}">
            <div class="rank-pos">#${i + 4}</div>
            <div class="rank-avatar" style="background:${bg}">${e.username[0].toUpperCase()}</div>
            <div class="rank-name">${escHtml(e.username)}${e.isMe ? ' (você)' : ''}</div>
            <div class="rank-hours">${getValue(e)}</div>
          </div>
        `;
      }).join('');
    }
  }

  async function loadDashboard() {
    if (!state.user) return;

    ['stat-total-hours','stat-today','stat-streak','stat-sessions'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = '—';
    });

    try {
      const [statsRes, dashRes] = await Promise.all([
        fetch(`${API}/api/users/${state.user.id}/stats`),
        fetch(`${API}/api/users/${state.user.id}/dashboard`),
      ]);

      if (!statsRes.ok) throw new Error('Falha ao buscar stats');
      const statsData = await statsRes.json();
      const s = statsData.stats;

      const setEl = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.textContent = val ?? 0;
      };
      setEl('stat-total-hours', s.total_hours);
      setEl('stat-today',       s.today_minutes);
      setEl('stat-streak',      s.streak_days);
      setEl('stat-sessions',    s.total_sessions);

      const greetEl = document.getElementById('dash-greeting');
      if (greetEl) {
        if (s.streak_days >= 7) {
          greetEl.textContent = `🔥 ${s.streak_days} dias seguidos! Incrível, continue assim!`;
        } else if (s.streak_days > 0) {
          greetEl.textContent = `🔥 ${s.streak_days} dia(s) de sequência. Continue firme!`;
        } else {
          greetEl.textContent = 'Entre em uma sala para começar a registrar seu progresso.';
        }
      }

      if (s.last_7_days?.length) renderBarChart(s.last_7_days);

      if (dashRes.ok) {
        const dashData = await dashRes.json();
        renderSessionsList((dashData.sessions || []).slice(-10).reverse());
      }

      renderSubjectStats();

     
      const dashHeader = document.querySelector('.dash-header');
      if (dashHeader && !document.getElementById('dash-export-group')) {
        const btnGroup = document.createElement('div');
        btnGroup.id = 'dash-export-group';
        btnGroup.style.cssText = 'display:flex; gap:10px; margin-top:15px;';
        btnGroup.innerHTML = `
          <button class="btn-secondary small" onclick="App.exportDashboardData()"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Exportar CSV</button>
          <button class="btn-primary small" onclick="App.exportMonthlyReportPDF()"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg> PDF do Mês</button>
        `;
        dashHeader.appendChild(btnGroup);
      }

      await checkAndUnlockBadges();
    } catch (e) {
      console.error('Erro no dashboard:', e);
      toast('Erro ao carregar dashboard.', 'error');
    }
  }

  function renderBarChart(days) {
    const chart = document.getElementById('bar-chart');
    const max = Math.max(...days.map(d => d.minutes), 1);
    chart.innerHTML = days.map(d => {
      const pct = (d.minutes / max) * 100;
      return `
        <div class="bar-col">
          <div class="bar-fill" style="height:${pct}%" data-value="${d.minutes}min"></div>
          <div class="bar-label">${d.date.slice(5)}</div>
        </div>
      `;
    }).join('');
  }

  function renderSessionsList(sessions) {
    const container = document.getElementById('sessions-list');
    if (!sessions.length) {
      container.innerHTML = '<div class="empty-state">Nenhuma sessão registrada ainda.</div>';
      return;
    }
    container.innerHTML = sessions.map(s => `
      <div class="session-item">
        <div class="session-room">📚 Sessão de Estudo</div>
        <div class="session-duration">${formatDuration(s.duration_seconds)}</div>
        <div class="session-date">${s.start_time ? new Date(s.start_time).toLocaleDateString('pt-BR') : ''}</div>
      </div>
    `).join('');
  }


  async function loadCalendarEvents() {
    if (!state.user) return;
    try {
      const res = await fetch(`${API}/api/users/${state.user.id}/calendar`);
      const data = await res.json();
      state.calEvents = data.events || [];
    } catch (e) { console.error('Erro ao carregar eventos:', e); }
  }

  function renderCalendar() {
    const d = state.calendarDate;
    const year = d.getFullYear(), month = d.getMonth();
    const monthNames = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
    document.getElementById('cal-month-title').textContent = `${monthNames[month]} ${year}`;

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrev = new Date(year, month, 0).getDate();
    const today = new Date();
    const eventDates = new Set(state.calEvents.map(e => e.date));

    const grid = document.getElementById('cal-grid');
    const weekdays = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
    let html = `<div class="cal-weekdays">${weekdays.map(w => `<div class="cal-weekday">${w}</div>`).join('')}</div><div class="cal-days">`;

    for (let i = firstDay - 1; i >= 0; i--) html += `<div class="cal-day other-month">${daysInPrev - i}</div>`;

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
      const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
      const isSelected = state.calSelectedDate === dateStr;
      const hasEvent = eventDates.has(dateStr);
      html += `<div class="cal-day${isToday?' today':''}${isSelected?' selected':''}${hasEvent?' has-event':''}" onclick="App.selectCalDay('${dateStr}')">${day}</div>`;
    }

    const totalCells = firstDay + daysInMonth;
    const remaining = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
    for (let i = 1; i <= remaining; i++) html += `<div class="cal-day other-month">${i}</div>`;
    html += '</div>';
    grid.innerHTML = html;
  }

  function selectCalDay(dateStr) {
    state.calSelectedDate = dateStr;
    renderCalendar();
    const [y, m, d] = dateStr.split('-');
    document.getElementById('cal-selected-date').textContent =
      new Date(y, m-1, d).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });

    const dayEvents = state.calEvents.filter(e => e.date === dateStr);
    const container = document.getElementById('cal-events-list');
    if (!dayEvents.length) { container.innerHTML = '<div class="empty-state">Nenhum evento neste dia.</div>'; }
    else {
      container.innerHTML = dayEvents.map(e => `
        <div class="event-card">
          <div class="event-title">${escHtml(e.title)}</div>
          ${e.description ? `<div class="event-desc">${escHtml(e.description)}</div>` : ''}
          <div class="event-actions"><button class="btn-delete" onclick="App.deleteEvent('${e.id}')">Remover</button></div>
        </div>
      `).join('');
    }
    
    const note = getDailyNote(dateStr);
    const noteHtml = `
      <div class="daily-note-section">
        <div class="daily-note-header">
          <span>📝 Notas do dia</span>
          <button class="btn-secondary small" onclick="App.editDailyNote('${dateStr}')">Editar</button>
        </div>
        <div id="daily-note-display" class="daily-note-display">
          ${note ? escHtml(note) : '<span class="empty-state">Nenhuma nota para este dia. Clique em editar para adicionar.</span>'}
        </div>
      </div>
    `;
    const existingNote = document.querySelector('.daily-note-section');
    if (existingNote) existingNote.remove();
    container.insertAdjacentHTML('afterend', noteHtml);
  }

  function calPrev() { state.calendarDate = new Date(state.calendarDate.getFullYear(), state.calendarDate.getMonth() - 1, 1); renderCalendar(); }
  function calNext() { state.calendarDate = new Date(state.calendarDate.getFullYear(), state.calendarDate.getMonth() + 1, 1); renderCalendar(); }

  function openAddEvent() {
    const dateVal = state.calSelectedDate || new Date().toISOString().slice(0,10);
    openModal(`
      <h2 class="modal-title">Novo Evento</h2>
      <div class="modal-form">
        <div class="field-group"><label class="field-label">Título</label><input id="ev-title" class="field-input" type="text" placeholder="Ex: Revisar Cálculo II" /></div>
        <div class="field-group"><label class="field-label">Data</label><input id="ev-date" class="field-input" type="date" value="${dateVal}" /></div>
        <div class="field-group"><label class="field-label">Horário (opcional)</label><input id="ev-time" class="field-input" type="time" /></div>
        <div class="field-group"><label class="field-label">Descrição (opcional)</label><input id="ev-desc" class="field-input" type="text" placeholder="Detalhes..." /></div>
        <button class="btn-primary" onclick="App.saveEvent()">Salvar Evento</button>
      </div>
    `);
    setTimeout(() => document.getElementById('ev-title')?.focus(), 100);
  }

  async function saveEvent() {
    const title = document.getElementById('ev-title').value.trim();
    const date = document.getElementById('ev-date').value;
    const time = document.getElementById('ev-time').value;
    const description = document.getElementById('ev-desc').value.trim();
    if (!title || !date) { toast('Preencha título e data.', 'error'); return; }

    const combinedDate = time ? `${date}T${time}` : date;

    try {
      const res = await fetch(`${API}/api/users/${state.user.id}/calendar`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, date: combinedDate, description })
      });
      const data = await res.json();
      state.calEvents.push(data.event);
      closeModal(); toast('Evento salvo!', 'success');
      pushNotif('📅', `Evento "<strong>${title}</strong>" criado para ${date}`, false);
      renderCalendar();
      if (state.calSelectedDate === date) selectCalDay(date);
    } catch (e) { toast('Erro ao salvar evento.', 'error'); }
  }

  async function deleteEvent(eventId) {
    try {
      await fetch(`${API}/api/calendar/${eventId}`, { method: 'DELETE' });
      state.calEvents = state.calEvents.filter(e => e.id !== eventId);
      toast('Evento removido.', 'success');
      renderCalendar();
      if (state.calSelectedDate) selectCalDay(state.calSelectedDate);
    } catch (e) { toast('Erro ao remover evento.', 'error'); }
  }

 
  function getDailyNote(date) {
    return state.dailyNotes[date] || '';
  }

  function setDailyNote(date, note) {
    if (note && note.trim()) {
      state.dailyNotes[date] = note.trim();
    } else {
      delete state.dailyNotes[date];
    }
    saveDailyNotes();
  }

  function saveDailyNotes() {
    localStorage.setItem('studysync_notes_' + state.user.id, JSON.stringify(state.dailyNotes));
  }

  function editDailyNote(date) {
    const currentNote = getDailyNote(date);
    const modalHtml = `
      <h2 class="modal-title">📝 Notas de ${new Date(date).toLocaleDateString('pt-BR')}</h2>
      <textarea id="daily-note-editor" class="field-input" rows="8" placeholder="Escreva suas anotações aqui...">${escHtml(currentNote)}</textarea>
      <div class="modal-form" style="margin-top:16px;">
        <button class="btn-primary" onclick="App.saveDailyNote('${date}')">Salvar Nota</button>
      </div>
    `;
    openModal(modalHtml);
    setTimeout(() => document.getElementById('daily-note-editor').focus(), 100);
  }

  function saveDailyNote(date) {
    const editor = document.getElementById('daily-note-editor');
    const note = editor.value;
    setDailyNote(date, note);
    closeModal();
    selectCalDay(date);
    toast('Nota salva!', 'success');
  }

  async function openRecentChatsModal() {
    await loadRecentChats();

    const unifiedMap = new Map();
    state.friends.forEach(f => {
      unifiedMap.set(f.username.toLowerCase(), { ...f, isFriend: true, last_msg_time: 0, id: null });
    });

    state.recentChats.forEach(chat => {
      const lower = chat.username.toLowerCase();
      const existing = unifiedMap.get(lower) || { username: chat.username, isFriend: false };
      unifiedMap.set(lower, { ...existing, id: chat.id, last_msg_time: new Date(chat.last_msg_time).getTime() });
    });

    const sortedList = Array.from(unifiedMap.values()).sort((a, b) => (b.last_msg_time - a.last_msg_time) || a.username.localeCompare(b.username));

    const listHtml = sortedList.length > 0
      ? sortedList.map(u => {
          const [bg] = avatarColor(u.username);
          const online = state.onlineFriends.has(u.username);
          const hasHistory = !!u.last_msg_time;
          const action = u.id ? `App.closeModal(); App.openPrivateChat('${u.id}', '${escHtml(u.username)}')` : `App.startChatWithFriend('${escHtml(u.username)}')`;
          return `
            <div class="user-item" onclick="${action}" style="cursor:pointer; padding: 14px 16px; border-bottom: 1px solid var(--border-subtle); display:flex; align-items:center; gap:14px; background: var(--bg-2); transition: background 0.15s;">
              <div style="position:relative;flex-shrink:0;">
                <div style="width:46px;height:46px;border-radius:50%;background:${bg};color:#0f0d0a;display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:700;">${u.username[0].toUpperCase()}</div>
                ${online ? `<div style="position:absolute;bottom:0;right:0;width:12px;height:12px;border-radius:50%;background:#25d366;border:2px solid var(--bg-2);"></div>` : ''}
              </div>
              <div style="flex:1;min-width:0;">
                <div style="display:flex;justify-content:space-between;align-items:baseline;">
                  <div style="font-weight:600;color:var(--text-0);font-size:15px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escHtml(u.username)}</div>
                  ${hasHistory ? `<span style="font-size:11px;color:var(--text-3);">${formatTime(new Date(u.last_msg_time).toISOString())}</span>` : ''}
                </div>
                <div style="font-size:13px;color:var(--text-3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                  ${hasHistory ? (online ? '<span style="color:#7abc8a">● Online</span> · Conversa ativa' : 'Conversa ativa') : (online ? '<span style="color:#7abc8a">● Online</span> · Iniciar conversa' : 'Clique para conversar')}
                </div>
              </div>
            </div>
          `;
        }).join('')
      : `<div style="padding:60px 20px; text-align:center; color:var(--text-3);"><div style="font-size:40px;margin-bottom:15px;">💬</div><p>Nenhuma conversa ativa ou amigos.</p></div>`;

    openModal(`
      <div style="display:flex;flex-direction:column;max-height:85vh;">
        <h2 class="modal-title" style="margin-bottom:15px;padding:0 6px;">💬 Conversas</h2>
        <div style="overflow-y:auto; margin:0 -20px -20px; border-top:1px solid var(--border);">${listHtml}</div>
      </div>
    `);
  }

  async function startChatWithFriend(username) {
    try {
      const res = await fetch(`${API}/api/users/by-username/${encodeURIComponent(username)}`);
      if (!res.ok) throw new Error();
      const userData = await res.json();
      
      closeModal();
      openPrivateChat(userData.id, userData.username);
    } catch (e) {
      toast('Erro ao encontrar usuário para o chat.', 'error');
    }
  }

  

  let aiChatHistory = [];

  function openAIHelp() {
    const modalHtml = `
      <h2 class="modal-title">🤖 Assistente IA — StudySync</h2>
      <div class="ai-chat-container" style="display:flex;flex-direction:column;gap:12px;">
        <div id="ai-chat-messages" class="ai-chat-messages" style="min-height:200px;max-height:340px;overflow-y:auto;display:flex;flex-direction:column;gap:8px;padding:4px 0;">
          <div class="ai-message bot" style="background:var(--surface-2,#2a2520);border-radius:10px;padding:10px 14px;font-size:14px;line-height:1.55;">
            👋 Olá, <strong>${escHtml(state.user?.username || 'estudante')}</strong>! Sou seu assistente de estudos com IA real. Pergunte qualquer coisa sobre matemática, física, química, história, programação, redação e muito mais!
          </div>
        </div>
        <div class="ai-input-area" style="display:flex;gap:8px;align-items:flex-end;">
          <textarea
            id="ai-question"
            class="field-input"
            rows="2"
            placeholder="Digite sua pergunta de estudo..."
            onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();App.askAI();}"
            style="flex:1;resize:none;"
          ></textarea>
          <button class="btn-primary" onclick="App.askAI()" style="padding:10px 18px;white-space:nowrap;">
            Enviar
          </button>
        </div>
        <div style="font-size:11px;opacity:0.5;text-align:center;">Powered by IA • Shift+Enter para nova linha</div>
      </div>
    `;
    openModal(modalHtml);
    setTimeout(() => document.getElementById('ai-question')?.focus(), 120);
  }

  async function askAI() {
    const input = document.getElementById('ai-question');
    if (!input) return;
    const question = input.value.trim();
    if (!question) return;

    const messagesContainer = document.getElementById('ai-chat-messages');
    if (!messagesContainer) return;

    const userBubble = document.createElement('div');
    userBubble.className = 'ai-message user';
    userBubble.style.cssText = 'align-self:flex-end;background:var(--accent,#e8a04a);color:#0f0d0a;border-radius:10px;padding:10px 14px;font-size:14px;max-width:85%;line-height:1.5;';
    userBubble.textContent = question;
    messagesContainer.appendChild(userBubble);
    input.value = '';
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    const thinkingBubble = document.createElement('div');
    thinkingBubble.className = 'ai-message bot thinking';
    thinkingBubble.style.cssText = 'background:var(--surface-2,#2a2520);border-radius:10px;padding:10px 14px;font-size:14px;opacity:0.7;';
    thinkingBubble.innerHTML = '<span style="display:inline-flex;gap:4px;align-items:center;">🤔 <em>Pensando...</em><span class="ai-dots">...</span></span>';
    messagesContainer.appendChild(thinkingBubble);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    try {
      const context = state.currentRoom ? `O estudante está na sala de estudos: "${state.currentRoom.name}".` : '';
      const res = await fetch(`${API}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: question, context })
      });

      thinkingBubble.remove();

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        const errMsg = errData.detail || `Erro ${res.status}`;
        const helpMsg = res.status === 503
          ? `⚠️ ${errMsg}\n\nPara usar a IA, configure a variável OPENAI_API_KEY no servidor.`
          : `❌ ${errMsg}`;
        appendAIBotMessage(messagesContainer, helpMsg);
        return;
      }

      const data = await res.json();
      const answer = data.response || 'Sem resposta da IA.';

      aiChatHistory.push({ role: 'user', content: question });
      aiChatHistory.push({ role: 'assistant', content: answer });
      if (aiChatHistory.length > 20) aiChatHistory = aiChatHistory.slice(-20);

      appendAIBotMessage(messagesContainer, answer);

    } catch (e) {
      thinkingBubble.remove();
      console.error('Erro ao consultar IA:', e);
      appendAIBotMessage(
        messagesContainer,
        '❌ Não foi possível conectar ao servidor de IA. Verifique sua conexão e tente novamente.'
      );
    }
  }

  function appendAIBotMessage(container, text) {
    const bubble = document.createElement('div');
    bubble.className = 'ai-message bot';
    bubble.style.cssText = 'background:var(--surface-2,#2a2520);border-radius:10px;padding:10px 14px;font-size:14px;max-width:90%;line-height:1.6;white-space:pre-wrap;word-break:break-word;';
    bubble.innerHTML = escHtml(text)
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/`([^`]+)`/g, '<code style="background:rgba(255,255,255,0.1);padding:1px 5px;border-radius:4px;font-family:monospace;font-size:13px;">$1</code>');

    container.appendChild(bubble);
    container.scrollTop = container.scrollHeight;
  }

  async function loadAIModel() {
    console.info('IA agora usa API via backend. loadAIModel() não é mais necessário.');
  }

 
  function openModal(html) {
    document.getElementById('modal-content').innerHTML = html;
    document.getElementById('modal-overlay').classList.add('active');
  }
  function closeModal() { document.getElementById('modal-overlay').classList.remove('active'); }

  
  let toastTimer;
  function toast(msg, type = '') {
    const el = document.getElementById('toast');
    el.textContent = msg;
    el.className = `toast show ${type}`;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.className = 'toast', 3000);
  }

  function parseApiError(data) {
    if (!data && data !== 0) return 'Erro desconhecido';
    if (typeof data === 'string') return data;
    if (Array.isArray(data)) return data.map(parseApiError).join('; ');
    if (typeof data === 'object') {
      if (data.detail) return parseApiError(data.detail);
      if (data.message) return parseApiError(data.message);
      if (data.error) return parseApiError(data.error);
      if (data.msg) return parseApiError(data.msg);
      return JSON.stringify(data);
    }
    return String(data);
  }


  function escHtml(str) {
    const div = document.createElement('div');
    div.textContent = String(str ?? '');
    return div.innerHTML;
  }

  function formatTime(isoStr) {
    if (!isoStr) return '';
    try { return new Date(isoStr).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }); }
    catch { return ''; }
  }

  function formatDuration(secs) {
    if (!secs) return '0min';
    const h = Math.floor(secs / 3600), m = Math.floor((secs % 3600) / 60);
    return h > 0 ? `${h}h ${m}min` : `${m}min`;
  }


  function toggleCodeEditor() {
    const panel = document.getElementById('code-editor-panel');
    if (!panel) return;
    
    state.codeEditor.active = !state.codeEditor.active;
    panel.classList.toggle('open', state.codeEditor.active);
    
    if (state.codeEditor.active) {
      document.getElementById('whiteboard-panel')?.classList.remove('open');
      document.getElementById('flashcard-panel')?.classList.remove('open');
      document.getElementById('doc-panel')?.classList.remove('open');
      document.getElementById('btn-tool-wb')?.classList.remove('active');
      document.getElementById('btn-tool-fc')?.classList.remove('active');
      document.getElementById('btn-tool-doc')?.classList.remove('active');
      document.getElementById('btn-tool-code')?.classList.add('active');
      
      loadCodeContent();
      updateCodeLineNumbers();
    } else {
      document.getElementById('btn-tool-code')?.classList.remove('active');
    }
  }

  function loadCodeContent() {
    const roomId = state.currentRoom?.id;
    if (!roomId) return;
    
    const saved = localStorage.getItem(`studysync_code_${roomId}`);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        state.codeEditor.content = data.content || state.codeEditor.content;
        state.codeEditor.language = data.language || 'javascript';
        
        const editor = document.getElementById('code-editor');
        if (editor) editor.value = state.codeEditor.content;
        
        const langSelect = document.getElementById('code-language');
        if (langSelect) langSelect.value = state.codeEditor.language;
      } catch(e) {}
    } else {
      const editor = document.getElementById('code-editor');
      if (editor) editor.value = state.codeEditor.content;
    }
    
    updateCodeLineNumbers();
  }

  function saveCodeContent() {
    const roomId = state.currentRoom?.id;
    if (!roomId) return;
    
    localStorage.setItem(`studysync_code_${roomId}`, JSON.stringify({
      content: state.codeEditor.content,
      language: state.codeEditor.language
    }));
    
    sendWs({
      type: 'code_update',
      content: state.codeEditor.content,
      language: state.codeEditor.language,
      username: state.user?.username
    });
  }

  function codeInput() {
    const editor = document.getElementById('code-editor');
    if (!editor) return;
    
    state.codeEditor.content = editor.value;
    updateCodeLineNumbers();
    saveCodeContent();
    
    sendWs({
      type: 'code_typing',
      username: state.user?.username,
      isTyping: true
    });
    
    clearTimeout(state.codeEditor.typingTimeout);
    state.codeEditor.typingTimeout = setTimeout(() => {
      sendWs({
        type: 'code_typing',
        username: state.user?.username,
        isTyping: false
      });
    }, 1000);
  }

  function codeKeyDown(e) {
    if (e.key === 'Tab') {
      e.preventDefault();
      const editor = document.getElementById('code-editor');
      const start = editor.selectionStart;
      const end = editor.selectionEnd;
      editor.value = editor.value.substring(0, start) + '  ' + editor.value.substring(end);
      editor.selectionStart = editor.selectionEnd = start + 2;
      codeInput();
    }
  }

  function updateCodeLineNumbers() {
    const editor = document.getElementById('code-editor');
    const lineNumbersDiv = document.getElementById('code-line-numbers');
    if (!editor || !lineNumbersDiv) return;
    
    const lines = editor.value.split('\n');
    const lineCount = lines.length;
    
    let html = '';
    for (let i = 1; i <= lineCount; i++) {
      html += `<div>${i}</div>`;
    }
    lineNumbersDiv.innerHTML = html;
  }

  function codeSyncScroll() {
    const editor = document.getElementById('code-editor');
    const lineNumbers = document.getElementById('code-line-numbers');
    if (editor && lineNumbers) {
      lineNumbers.scrollTop = editor.scrollTop;
    }
  }

  function codeChangeLanguage(lang) {
    state.codeEditor.language = lang;
    saveCodeContent();
    
    const editor = document.getElementById('code-editor');
    if (editor) {
      editor.setAttribute('data-language', lang);
    }
    
    codeConsoleAddLine(`🌐 Linguagem alterada para ${lang.toUpperCase()}`, 'info');
  }

  function codeReceiveUpdate(msg) {
    if (msg.username === state.user?.username) return;
    
    const editor = document.getElementById('code-editor');
    if (!editor) return;
    
    state.codeEditor.content = msg.content;
    state.codeEditor.language = msg.language;
    editor.value = msg.content;
    updateCodeLineNumbers();
    
    const langSelect = document.getElementById('code-language');
    if (langSelect) langSelect.value = msg.language;
  }

  function codeReceiveTyping(msg) {
    const typingStatus = document.getElementById('code-typing-status');
    if (!typingStatus) return;
    
    if (msg.isTyping && msg.username !== state.user?.username) {
      typingStatus.textContent = `${msg.username} está digitando...`;
      setTimeout(() => {
        if (typingStatus.textContent === `${msg.username} está digitando...`) {
          typingStatus.textContent = '';
        }
      }, 1500);
    } else if (!msg.isTyping) {
      typingStatus.textContent = '';
    }
  }

  // Mapeia o valor usado no <select> de linguagem para o nome/versão que a
  // API pública do Piston (https://github.com/engineer-man/piston) espera.
  // Piston executa o código de verdade, isolado em containers — por isso
  // só faz sentido rodar no navegador do usuário (front-end), nunca no
  // backend do Lorac.
  const PISTON_RUNTIMES = {
    python: { language: 'python', version: '3.10.0', filename: 'main.py' },
    csharp: { language: 'csharp', version: '6.12.0', filename: 'main.cs' }
  };
  const PISTON_URL = 'https://emkc.org/api/v2/piston/execute';

  async function codeRunRemote(language, code) {
    const runtime = PISTON_RUNTIMES[language];
    if (!runtime) {
      codeConsoleAddLine(`❌ Linguagem "${language}" não suportada para execução.`, 'error');
      return;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const res = await fetch(PISTON_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          language: runtime.language,
          version: runtime.version,
          files: [{ name: runtime.filename, content: code }]
        })
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        codeConsoleAddLine(`❌ Erro ao contatar o serviço de execução (HTTP ${res.status}).`, 'error');
        return;
      }

      const data = await res.json();

      // Erro de compilação (relevante para C#)
      if (data.compile && data.compile.code !== 0) {
        const out = (data.compile.stderr || data.compile.output || '').trim();
        codeConsoleAddLine('❌ Erro de compilação:', 'error');
        out.split('\n').forEach(line => line && codeConsoleAddLine(line, 'error'));
        return;
      }

      const run = data.run || {};
      const stdout = (run.stdout || '').trim();
      const stderr = (run.stderr || '').trim();

      if (stdout) {
        stdout.split('\n').forEach(line => codeConsoleAddLine(line, 'output'));
      }
      if (stderr) {
        stderr.split('\n').forEach(line => codeConsoleAddLine(line, 'error'));
      }
      if (!stdout && !stderr) {
        codeConsoleAddLine('✓ Código executado sem saída.', 'success');
      }

      if (run.code !== 0 && !stderr) {
        codeConsoleAddLine(`⚠️ Processo encerrado com código ${run.code}.`, 'warning');
      }

      if (!stderr && run.code === 0 && !state.badges.some(b => b.id === 'code_master')) {
        const codeMasterBadge = state.availableBadges.find(b => b.id === 'code_master');
        if (codeMasterBadge) {
          state.badges.push({ ...codeMasterBadge, unlockedAt: Date.now() });
          saveBadges();
          renderBadges();
          pushNotif('💻', `🏆 Conquista desbloqueada: <strong>${codeMasterBadge.name}</strong>! ${codeMasterBadge.desc}`, true);
        }
      }
    } catch (err) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        codeConsoleAddLine('❌ Timeout: o serviço de execução demorou demais para responder.', 'error');
      } else {
        codeConsoleAddLine(`❌ Não foi possível executar o código: ${err.message}`, 'error');
        codeConsoleAddLine('💡 Verifique sua conexão com a internet e tente novamente.', 'info');
      }
    } finally {
      codeConsoleAddLine('─'.repeat(40), 'separator');
      codeConsoleAddLine('✨ Execução finalizada', 'success');
    }
  }

  function codeRun() {
    console.log("🚀 Executando codeRun...");
    
    const editor = document.getElementById('code-editor');
    if (editor) {
      state.codeEditor.content = editor.value;
    }
    
    const language = state.codeEditor.language;
    const code = state.codeEditor.content;
    
    console.log("Linguagem:", language);
    console.log("Tamanho do código:", code?.length || 0);
    
    if (!code || code.trim() === '') {
      codeConsoleAddLine('⚠️ Nenhum código para executar!', 'error');
      return;
    }
    
    codeConsoleClear();
    codeConsoleAddLine(`🚀 Executando ${language.toUpperCase()}...`, 'info');
    codeConsoleAddLine('─'.repeat(40), 'separator');
    
    if (language === 'javascript') {
      try {
        let logs = [];
        let errors = [];
        
        const originalLog = console.log;
        const originalError = console.error;
        const originalWarn = console.warn;
        
        console.log = (...args) => {
          const message = args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
          ).join(' ');
          logs.push(message);
          originalLog(...args);
        };
        
        console.error = (...args) => {
          const message = args.map(arg => String(arg)).join(' ');
          errors.push(message);
          originalError(...args);
        };
        
        console.warn = (...args) => {
          const message = args.map(arg => String(arg)).join(' ');
          logs.push(`⚠️ ${message}`);
          originalWarn(...args);
        };
        
        const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
        const wrappedCode = `(async () => { ${code} })()`;
        const func = new AsyncFunction(wrappedCode);
        const promise = func();
        
        const timeoutId = setTimeout(() => {
          codeConsoleAddLine('❌ Timeout: Código executou por muito tempo!', 'error');
        }, 5000);
        
        promise.then((result) => {
          clearTimeout(timeoutId);
          
          if (logs.length > 0) {
            logs.forEach(log => codeConsoleAddLine(log, 'output'));
          }
          
          if (errors.length > 0) {
            errors.forEach(err => codeConsoleAddLine(`❌ ${err}`, 'error'));
          }
          
          if (result !== undefined && logs.length === 0 && errors.length === 0) {
            codeConsoleAddLine(`→ Retorno: ${JSON.stringify(result)}`, 'output');
          } else if (logs.length === 0 && errors.length === 0) {
            codeConsoleAddLine('✓ Código executado com sucesso!', 'success');
          }
          
          if (!state.badges.some(b => b.id === 'code_master')) {
            const codeMasterBadge = state.availableBadges.find(b => b.id === 'code_master');
            if (codeMasterBadge) {
              state.badges.push({ ...codeMasterBadge, unlockedAt: Date.now() });
              saveBadges();
              renderBadges();
              pushNotif('💻', `🏆 Conquista desbloqueada: <strong>${codeMasterBadge.name}</strong>! ${codeMasterBadge.desc}`, true);
            }
          }
        }).catch((err) => {
          clearTimeout(timeoutId);
          codeConsoleAddLine(`❌ Erro na execução: ${err.message}`, 'error');
        });
        
        console.log = originalLog;
        console.error = originalError;
        console.warn = originalWarn;
        
      } catch (err) {
        codeConsoleAddLine(`❌ Erro de sintaxe: ${err.message}`, 'error');
      }
    } else if (language === 'python' || language === 'csharp') {
      // Execução real via Piston (sandbox remoto) — não bloqueia o resto da função.
      codeRunRemote(language, code);
      return;
    } else {
      codeConsoleAddLine(`❌ Linguagem "${language}" não suportada.`, 'error');
      codeConsoleAddLine('─'.repeat(40), 'separator');
      codeConsoleAddLine('✨ Execução finalizada', 'success');
      return;
    }
    
    codeConsoleAddLine('─'.repeat(40), 'separator');
    codeConsoleAddLine('✨ Execução finalizada', 'success');
  }

  function codeConsoleClear() {
    const consoleContent = document.getElementById('code-console-content');
    if (consoleContent) {
      consoleContent.innerHTML = '<div class="code-console-line">> Console limpo</div>';
    }
  }

  function codeConsoleAddLine(text, type = 'output') {
    const consoleContent = document.getElementById('code-console-content');
    if (!consoleContent) return;
    
    const line = document.createElement('div');
    line.className = `code-console-line ${type === 'error' ? 'error' : (type === 'success' ? 'success' : '')}`;
    line.innerHTML = `> ${text}`;
    consoleContent.appendChild(line);
    line.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function codeCopy() {
    const editor = document.getElementById('code-editor');
    if (!editor) return;
    
    navigator.clipboard.writeText(editor.value).then(() => {
      codeConsoleAddLine('📋 Código copiado para a área de transferência!', 'success');
      toast('Código copiado!', 'success');
    }).catch(() => {
      toast('Erro ao copiar código.', 'error');
    });
  }

  function codeClear() {
    if (confirm('Tem certeza que deseja limpar todo o código?')) {
      const editor = document.getElementById('code-editor');
      if (editor) {
        editor.value = '';
        state.codeEditor.content = '';
        updateCodeLineNumbers();
        saveCodeContent();
        codeConsoleAddLine('🗑️ Editor limpo', 'info');
        toast('Editor limpo!', 'success');
      }
    }
  }



  function getDocEditor() {
    return document.getElementById('doc-editor');
  }

  function toggleDoc() {
    const panel = document.getElementById('doc-panel');
    if (!panel) return;
    const isOpen = panel.classList.contains('open');
    if (isOpen) {
      panel.classList.remove('open');
      document.getElementById('btn-tool-doc')?.classList.remove('active');
    } else {
      panel.classList.add('open');
      document.getElementById('btn-tool-doc')?.classList.add('active');
      document.getElementById('whiteboard-panel')?.classList.remove('open');
      document.getElementById('btn-tool-wb')?.classList.remove('active');
      document.getElementById('flashcard-panel')?.classList.remove('open');
      document.getElementById('btn-tool-fc')?.classList.remove('active');
      loadDocContent();
      setTimeout(() => getDocEditor()?.focus(), 60);
    }
  }

  function loadDocContent() {
    const roomId = state.currentRoom?.id;
    if (!roomId) return;
    const saved = localStorage.getItem('studysync_doc_' + roomId);
    const editor = getDocEditor();
    if (editor && saved) editor.innerHTML = saved;
    const titleSaved = localStorage.getItem('studysync_doc_title_' + roomId);
    const titleEl = document.getElementById('gdoc-title');
    if (titleEl && titleSaved) titleEl.value = titleSaved;
    docUpdateWordCount();
  }

  function docInput() {
    const editor = getDocEditor();
    if (!editor) return;
    const html = editor.innerHTML;
    const roomId = state.currentRoom?.id;
    if (roomId) localStorage.setItem('studysync_doc_' + roomId, html);
    docUpdateWordCount();
    clearTimeout(state.docBroadcastTimer);
    state.docBroadcastTimer = setTimeout(() => {
      sendWs({ type: 'doc_update', html, username: state.user?.username });
    }, 200);
  }

  function docKeyDown(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'b') { e.preventDefault(); docToggleBold(); }
    if ((e.ctrlKey || e.metaKey) && e.key === 'i') { e.preventDefault(); docToggleItalic(); }
    if ((e.ctrlKey || e.metaKey) && e.key === 'u') { e.preventDefault(); docToggleUnderline(); }
    if (e.key === 'Tab') {
      e.preventDefault();
      document.execCommand('insertText', false, '\u00a0\u00a0\u00a0\u00a0');
    }
  }

  function docReceiveUpdate(msg) {
    if (msg.username === state.user?.username) return;
    const editor = getDocEditor();
    if (!editor) return;
    editor.innerHTML = msg.html;
    const roomId = state.currentRoom?.id;
    if (roomId) localStorage.setItem('studysync_doc_' + roomId, msg.html);
    docUpdateWordCount();
  }

  function docExecCmd(cmd, val = null) {
    getDocEditor()?.focus();
    document.execCommand(cmd, false, val);
    docInput();
    docUpdateToolbarState();
  }

  function docSetFont(size) { docExecCmd('fontSize', size); }
  function docToggleBold()      { docExecCmd('bold'); }
  function docToggleItalic()    { docExecCmd('italic'); }
  function docToggleUnderline() { docExecCmd('underline'); }
  function docToggleStrike()    { docExecCmd('strikeThrough'); }
  function docToggleUL()        { docExecCmd('insertUnorderedList'); }
  function docToggleOL()        { docExecCmd('insertOrderedList'); }
  function docSetColor(c)       { docExecCmd('foreColor', c); }
  function docAlign(dir) {
    const map = { left:'justifyLeft', center:'justifyCenter', right:'justifyRight', full:'justifyFull' };
    docExecCmd(map[dir] || ('justify' + dir.charAt(0).toUpperCase() + dir.slice(1)));
  }
  function docUndo() { docExecCmd('undo'); }
  function docRedo() { docExecCmd('redo'); }
  function docRemoveFormat() { docExecCmd('removeFormat'); }

  function docPrint() {
    window.print();
  }

  function docInsertImage() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        getDocEditor()?.focus();
        document.execCommand('insertImage', false, ev.target.result);
        docInput();
      };
      reader.readAsDataURL(file);
    };
    input.click();
  }

  function docHighlight(color) {
    getDocEditor()?.focus();
    document.execCommand('hiliteColor', false, color);
    docInput();
  }
  function docClearHighlight() {
    getDocEditor()?.focus();
    document.execCommand('hiliteColor', false, 'transparent');
    docInput();
  }

  function docPickColor(color) {
    docSetColor(color);
    const bar = document.getElementById('doc-color-bar');
    if (bar) bar.style.background = color;
    document.getElementById('doc-color-palette')?.classList.remove('open');
  }

  function docPickHighlight(color) {
    docHighlight(color);
    const bar = document.getElementById('doc-hl-bar');
    if (bar) bar.style.background = color;
  }

  function docUpdateWordCount() {
    const editor = getDocEditor();
    const wc = document.getElementById('doc-wordcount');
    if (!editor || !wc) return;
    const text = editor.innerText || '';
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    wc.textContent = `${words} palavra${words !== 1 ? 's' : ''}`;
  }

  function docUpdateToolbarState() {
   
    const font = document.queryCommandValue('fontName').replace(/"/g, '');
    const size = document.queryCommandValue('fontSize');
    const format = document.queryCommandValue('formatBlock');

    const selFont = document.querySelector('.gdt-font-family');
    const selSize = document.querySelector('.gdt-font-size');
    if (selFont) selFont.value = font || 'DM Sans';
    if (selSize) selSize.value = size || '3';

    [['bold','doc-btn-bold'],['italic','doc-btn-italic'],
     ['underline','doc-btn-underline'],['strikeThrough','doc-btn-strike']
    ].forEach(([cmd, id]) => {
      const btn = document.getElementById(id);
      if (btn) btn.classList.toggle('active', document.queryCommandState(cmd));
    });
  }

  function docClear() {
    const editor = getDocEditor();
    if (!editor) return;
    if (!confirm('Limpar o documento? Todos na sala verão o documento em branco.')) return;
    editor.innerHTML = '';
    docInput();
  }

  function docCopy() {
    const editor = getDocEditor();
    if (!editor) return;
    navigator.clipboard.writeText(editor.innerText).then(() => toast('Texto copiado!', 'success'));
  }

  function docExportTxt() {
    const editor = getDocEditor();
    if (!editor) return;
    const titleEl = document.getElementById('gdoc-title');
    const title = titleEl?.value || 'documento';
    const blob = new Blob([editor.innerText || ''], { type: 'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${title}.txt`;
    a.click();
    toast('Documento exportado!', 'success');
  }

  async function generateAIQuizFromDoc() {
    const editor = getDocEditor();
    if (!editor) return;
    
    const text = editor.innerText.trim();
    if (text.length < 50) {
      toast('Escreva um pouco mais no documento para que a IA possa gerar o quiz.', 'error');
      return;
    }

    toast('🤖 IA analisando o texto... Gerando flashcards.', 'info');

    try {
      const res = await fetch(`${API}/api/ai/generate-quiz`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });

      if (!res.ok) throw new Error();
      const data = await res.json();
      const newCards = data.quiz;

      if (Array.isArray(newCards)) {
        newCards.forEach(c => {
          state.flashcards.push({ 
            q: c.q, a: c.a, 
            repetitions: 0, easeFactor: 2.5, interval: 0, 
            nextReview: new Date().toISOString() 
          });
        });
        saveFlashcards();
        toast(`✨ Sucesso! ${newCards.length} novos flashcards adicionados.`, 'success');
        
        if (confirm(`A IA gerou ${newCards.length} cards. Deseja abrir a área de flashcards agora?`)) {
          openFlashcards();
        }
      }
    } catch (e) {
      toast('A IA não conseguiu processar o texto. Tente selecionar um trecho menor.', 'error');
    }
  }


  let callWbState = {
    active: false, tool: 'pen', color: '#e8a04a', size: 4,
    drawing: false, lastX: 0, lastY: 0, history: [],
    shapeStart: null, snapshot: null
  };

  function toggleCallWb() {
    const panel = document.getElementById('call-wb-panel');
    if (!panel) return;
    callWbState.active = !callWbState.active;
    panel.classList.toggle('open', callWbState.active);
    document.getElementById('btn-call-wb')?.classList.toggle('active', callWbState.active);
    if (callWbState.active) {
      setTimeout(() => initCallCanvas(), 50);
    }
  }

  function initCallCanvas() {
    const canvas = document.getElementById('call-wb-canvas');
    const panel = document.getElementById('call-wb-panel');
    if (!canvas || !panel) return;
    canvas.width  = panel.clientWidth || 800;
    canvas.height = panel.clientHeight || 400;
    callWbRedraw();
  }

  function callWbSetTool(tool) {
    callWbState.tool = tool;
    document.querySelectorAll('.cwb-tool-btn[data-tool]').forEach(b =>
      b.classList.toggle('active', b.dataset.tool === tool));
  }

  function callWbSetColor(color) {
    callWbState.color = color;
    document.querySelectorAll('.cwb-color-btn').forEach(b =>
      b.classList.toggle('active', b.dataset.color === color));
  }

  function callWbSetSize(val) { callWbState.size = parseInt(val); }

  function callWbDown(e) {
    if (!callWbState.active) return;
    callWbState.drawing = true;
    const [x, y] = getCallCanvasPos(e);
    callWbState.lastX = x; callWbState.lastY = y;
    callWbState.shapeStart = { x, y };

    const SHAPE_TOOLS = ['line', 'rect', 'circle', 'arrow'];
    if (SHAPE_TOOLS.includes(callWbState.tool)) {
      const canvas = document.getElementById('call-wb-canvas');
      const ctx = canvas.getContext('2d');
      callWbState.snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
    }
  }

  function callWbMove(e) {
    if (!callWbState.drawing || !callWbState.active) return;
    e.preventDefault();
    const [x, y] = getCallCanvasPos(e);
    const ctx = getCallCtx();
    if (!ctx) return;

    const SHAPE_TOOLS = ['line', 'rect', 'circle', 'arrow'];

    if (callWbState.tool === 'pen' || callWbState.tool === 'marker' || callWbState.tool === 'eraser') {
      const seg = {
        tool: callWbState.tool,
        color: callWbState.color,
        size: callWbState.tool === 'eraser' ? callWbState.size * 4 : callWbState.size,
        x0: callWbState.lastX, y0: callWbState.lastY, x1: x, y1: y
      };
      drawCallSeg(ctx, seg);
      callWbState.history.push(seg);
      sendWs({ type: 'call_wb_draw', seg });
      callWbState.lastX = x; callWbState.lastY = y;
    } else if (SHAPE_TOOLS.includes(callWbState.tool)) {
      if (callWbState.snapshot) ctx.putImageData(callWbState.snapshot, 0, 0);
      drawShapePreview(ctx, callWbState.tool, callWbState.shapeStart.x, callWbState.shapeStart.y, x, y, callWbState.color, callWbState.size);
    }
  }

  function callWbUp(e) {
    if (!callWbState.drawing) return;
    callWbState.drawing = false;

    const SHAPE_TOOLS = ['line', 'rect', 'circle', 'arrow'];
    if (SHAPE_TOOLS.includes(callWbState.tool) && callWbState.shapeStart && e) {
      const [x, y] = getCallCanvasPos(e);
      const seg = {
        tool: callWbState.tool, color: callWbState.color, size: callWbState.size,
        x0: callWbState.shapeStart.x, y0: callWbState.shapeStart.y, x1: x, y1: y
      };
      const ctx = getCallCtx();
      if (callWbState.snapshot) ctx.putImageData(callWbState.snapshot, 0, 0);
      drawShapePreview(ctx, seg.tool, seg.x0, seg.y0, seg.x1, seg.y1, seg.color, seg.size);
      callWbState.history.push(seg);
      sendWs({ type: 'call_wb_draw', seg });
    }
    callWbState.snapshot = null;
    callWbState.shapeStart = null;
  }

  function getCallCtx() {
    const canvas = document.getElementById('call-wb-canvas');
    return canvas ? canvas.getContext('2d') : null;
  }

  function getCallCanvasPos(e) {
    const canvas = document.getElementById('call-wb-canvas');
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return [clientX - rect.left, clientY - rect.top];
  }

  function drawCallSeg(ctx, seg) {
    ctx.save();
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    if (seg.tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = seg.size;
      ctx.beginPath(); ctx.moveTo(seg.x0, seg.y0); ctx.lineTo(seg.x1, seg.y1); ctx.stroke();
    } else if (seg.tool === 'pen' || seg.tool === 'marker') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = seg.color;
      ctx.lineWidth = seg.tool === 'marker' ? seg.size * 3 : seg.size;
      ctx.globalAlpha = seg.tool === 'marker' ? 0.45 : 1;
      ctx.beginPath(); ctx.moveTo(seg.x0, seg.y0); ctx.lineTo(seg.x1, seg.y1); ctx.stroke();
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
      drawShapePreview(ctx, seg.tool, seg.x0, seg.y0, seg.x1, seg.y1, seg.color, seg.size);
    }
    ctx.restore();
  }

  function callWbRedraw() {
    const canvas = document.getElementById('call-wb-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    callWbState.history.forEach(seg => drawCallSeg(ctx, seg));
  }

  function callWbReceiveDraw(msg) {
    const ctx = getCallCtx();
    if (!ctx) return;
    drawCallSeg(ctx, msg.seg);
    callWbState.history.push(msg.seg);
  }

  function callWbClear(broadcast = true) {
    callWbState.history = [];
    const canvas = document.getElementById('call-wb-canvas');
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    if (broadcast) sendWs({ type: 'call_wb_clear' });
  }

  function callWbUndo() {
    if (!callWbState.history.length) return;
    callWbState.history.pop();
    callWbRedraw();
  }

  

  const FORUM_STORAGE_KEY = 'studysync_forum_v1';

  function forumLoad() {
    try {
      const raw = localStorage.getItem(FORUM_STORAGE_KEY);
      state.forumQuestions = raw ? JSON.parse(raw) : [];
    } catch { state.forumQuestions = []; }
  }

  function forumSave() {
    localStorage.setItem(FORUM_STORAGE_KEY, JSON.stringify(state.forumQuestions));
  }

  function showForum() {
    showScreen('forum');
    updateHeaderUser('forum');
    forumLoad();
    forumShowList();
  }

  function forumShowList() {
    document.querySelectorAll('.forum-view').forEach(v => v.classList.remove('active'));
    document.getElementById('forum-view-list').classList.add('active');
    forumRenderList();
  }

  function forumShowNew() {
    document.querySelectorAll('.forum-view').forEach(v => v.classList.remove('active'));
    document.getElementById('forum-view-new').classList.add('active');
    document.getElementById('forum-q-title').value = '';
    document.getElementById('forum-q-body').value = '';
    document.getElementById('forum-q-tags').value = '';
    setTimeout(() => document.getElementById('forum-q-title').focus(), 60);
  }

  function forumShowDetail(id) {
    state.forumCurrentId = id;
    document.querySelectorAll('.forum-view').forEach(v => v.classList.remove('active'));
    document.getElementById('forum-view-detail').classList.add('active');
    forumRenderDetail();
  }

  function forumFilter(val) {
    state.forumSearch = val.toLowerCase();
    forumRenderList();
  }

  function forumSort(mode, btn) {
    state.forumSort = mode;
    document.querySelectorAll('.forum-tab').forEach(t => t.classList.remove('active'));
    if (btn) btn.classList.add('active');
    forumRenderList();
  }

  function forumGetSorted() {
    let qs = [...state.forumQuestions];
    const s = state.forumSearch;
    if (s) qs = qs.filter(q =>
      q.title.toLowerCase().includes(s) ||
      q.body.toLowerCase().includes(s) ||
      (q.tags || []).join(' ').toLowerCase().includes(s)
    );
    if (state.forumSort === 'top') {
      qs.sort((a, b) => (b.votes || 0) - (a.votes || 0));
    } else if (state.forumSort === 'unanswered') {
      qs = qs.filter(q => !q.answers || q.answers.length === 0);
      qs.sort((a, b) => b.createdAt - a.createdAt);
    } else {
      qs.sort((a, b) => b.createdAt - a.createdAt);
    }
    return qs;
  }

  function forumTimeAgo(ts) {
    const diff = Math.floor((Date.now() - ts) / 1000);
    if (diff < 60) return 'agora';
    if (diff < 3600) return `${Math.floor(diff/60)}min atrás`;
    if (diff < 86400) return `${Math.floor(diff/3600)}h atrás`;
    return `${Math.floor(diff/86400)}d atrás`;
  }

  function forumMiniAvatar(name) {
    if (!name || !name.length) name = '?';
    const [bg, fg] = avatarColor(name);
    return `<span class="mini-avatar" style="background:${bg};color:${fg}">${name[0].toUpperCase()}</span>`;
  }

  function forumRenderList() {
    const list = document.getElementById('forum-list');
    const qs = forumGetSorted();
    if (!qs.length) {
      list.innerHTML = `<div class="empty-state">${state.forumSearch ? 'Nenhum resultado encontrado.' : 'Nenhuma pergunta ainda. Seja o primeiro!'}</div>`;
      return;
    }
    list.innerHTML = qs.map(q => {
      const hasBest = (q.answers || []).some(a => a.isBest);
      const ansCount = (q.answers || []).length;
      const tags = (q.tags || []).map(t => `<span class="forum-tag">${t}</span>`).join('');
      const myVote = (q.voters || []).includes(state.user?.username) ? 'voted' : '';
      const votes = q.votes || 0;
      return `
        <div class="forum-card ${hasBest ? 'has-best-answer' : ''}" onclick="App.forumShowDetail('${q.id}')">
          <div class="forum-vote-col" onclick="event.stopPropagation()">
            <button class="forum-vote-btn ${myVote}"
              onclick="App.forumUpvote('${q.id}')"
              title="${myVote ? 'Remover voto' : 'Votar nesta pergunta'}">▲</button>
            <span class="forum-vote-count ${votes > 0 ? 'positive' : ''}">${votes}</span>
          </div>
          <div class="forum-card-body">
            <div class="forum-card-title">${q.title}</div>
            <div class="forum-card-preview">${q.body}</div>
            <div class="forum-card-meta">
              <span class="forum-card-author">${forumMiniAvatar(q.author)}<span>${q.author}</span></span>
              <span class="forum-card-time">${forumTimeAgo(q.createdAt)}</span>
              <span class="forum-answer-count ${ansCount ? 'has-answers' : ''}">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                ${ansCount} ${ansCount === 1 ? 'resposta' : 'respostas'}
              </span>
              ${hasBest ? '<span class="forum-resolved-badge">✓ Resolvida</span>' : ''}
            </div>
            ${tags ? `<div class="forum-tags">${tags}</div>` : ''}
          </div>
        </div>`;
    }).join('');
  }

  function forumRenderDetail() {
    const q = state.forumQuestions.find(x => x.id === state.forumCurrentId);
    if (!q) { forumShowList(); return; }
    const container = document.getElementById('forum-detail-content');
    const myVoteQ = (q.voters || []).includes(state.user?.username) ? 'voted' : '';
    const tags = (q.tags || []).map(t => `<span class="forum-tag">${t}</span>`).join('');
    const isAuthor = q.author === state.user?.username;
    const answersHtml = (q.answers || [])
      .slice()
      .sort((a, b) => (b.isBest ? 1 : 0) - (a.isBest ? 1 : 0) || (b.votes || 0) - (a.votes || 0))
      .map(a => {
        const myVoteA = (a.voters || []).includes(state.user?.username) ? 'voted' : '';
        const aVotes = a.votes || 0;
        return `
          <div class="forum-answer-card ${a.isBest ? 'is-best' : ''}">
            <div class="forum-vote-col" onclick="event.stopPropagation()">
              <button class="forum-vote-btn ${myVoteA}"
                onclick="App.forumUpvote('${q.id}','${a.id}')"
                title="${myVoteA ? 'Remover voto' : 'Votar nesta resposta'}">▲</button>
              <span class="forum-vote-count ${aVotes > 0 ? 'positive' : ''}">${aVotes}</span>
            </div>
            <div class="forum-answer-body">
              <div class="forum-answer-text">${a.body}</div>
              <div class="forum-answer-meta">
                <span class="forum-card-author">${forumMiniAvatar(a.author)}<span>${a.author}</span></span>
                <span class="forum-card-time">${forumTimeAgo(a.createdAt)}</span>
                <span class="forum-best-badge">${a.isBest ? '✓ Melhor Resposta' : ''}</span>
                ${isAuthor ? `<button class="forum-mark-best-btn ${a.isBest ? 'is-best' : ''}" onclick="App.forumMarkBest('${q.id}','${a.id}')">${a.isBest ? '✓ Marcada' : 'Marcar como Melhor'}</button>` : ''}
              </div>
            </div>
          </div>`;
      }).join('');

    container.innerHTML = `
      <div class="forum-detail-question">
        <div class="forum-detail-title">${q.title}</div>
        <div class="forum-detail-body">${q.body}</div>
        ${tags ? `<div class="forum-tags" style="margin-bottom:14px">${tags}</div>` : ''}
        <div class="forum-detail-meta">
          <div class="forum-detail-vote">
            <button class="forum-vote-btn ${myVoteQ}"
              onclick="App.forumUpvote('${q.id}')"
              title="${myVoteQ ? 'Remover voto' : 'Votar nesta pergunta'}">▲</button>
            <span class="forum-vote-count ${(q.votes||0) > 0 ? 'positive' : ''}">${q.votes || 0} ${(q.votes||0) === 1 ? 'voto' : 'votos'}</span>
          </div>
          <span class="forum-card-author">${forumMiniAvatar(q.author)}<span>${q.author}</span></span>
          <span class="forum-card-time">${forumTimeAgo(q.createdAt)}</span>
        </div>
      </div>

      <div class="forum-answers-header">
        <span class="forum-answers-title">${(q.answers||[]).length} ${(q.answers||[]).length === 1 ? 'RESPOSTA' : 'RESPOSTAS'}</span>
      </div>

      <div id="forum-answers-list">
        ${answersHtml || '<div class="empty-state" style="margin-bottom:16px">Ainda sem respostas. Seja o primeiro a responder!</div>'}
      </div>

      <div class="forum-reply-box">
        <div class="forum-reply-title">SUA RESPOSTA</div>
        <textarea id="forum-reply-input" class="forum-reply-input" placeholder="Escreva sua resposta aqui..."></textarea>
        <div class="forum-reply-actions">
          <button class="btn-primary" onclick="App.forumSubmitAnswer('${q.id}')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            Publicar Resposta
          </button>
        </div>
      </div>`;
  }

  function forumSubmitQuestion() {
    const title = document.getElementById('forum-q-title').value.trim();
    const body  = document.getElementById('forum-q-body').value.trim();
    const tagsRaw = document.getElementById('forum-q-tags').value.trim();
    if (!title) { toast('Digite um título para sua pergunta.', 'error'); return; }
    if (!body)  { toast('Descreva sua dúvida com mais detalhes.', 'error'); return; }
    const tags = tagsRaw ? tagsRaw.split(',').map(t => t.trim()).filter(Boolean).slice(0, 5) : [];
    const q = {
      id: 'q_' + Date.now() + '_' + Math.random().toString(36).slice(2,7),
      title, body, tags,
      author: state.user?.username || 'Anônimo',
      createdAt: Date.now(),
      votes: 0,
      voters: [],
      answers: [],
    };
    state.forumQuestions.unshift(q);
    forumSave();
    toast('Pergunta publicada!', 'success');
    forumShowDetail(q.id);
  }

  function forumSubmitAnswer(qId) {
    const input = document.getElementById('forum-reply-input');
    const body = input?.value.trim();
    if (!body) { toast('Escreva sua resposta antes de publicar.', 'error'); return; }
    const q = state.forumQuestions.find(x => x.id === qId);
    if (!q) return;
    q.answers = q.answers || [];
    q.answers.push({
      id: 'a_' + Date.now() + '_' + Math.random().toString(36).slice(2,7),
      body,
      author: state.user?.username || 'Anônimo',
      createdAt: Date.now(),
      votes: 0,
      voters: [],
      isBest: false,
    });
    forumSave();
    toast('Resposta publicada!', 'success');
    forumRenderDetail();
  }

  function forumUpvote(qId, aId) {
    const username = state.user?.username || 'Anônimo';
    const q = state.forumQuestions.find(x => x.id === qId);
    if (!q) return;
    if (aId) {
      const a = (q.answers || []).find(x => x.id === aId);
      if (!a) return;
      a.voters = a.voters || [];
      if (a.voters.includes(username)) {
        a.voters = a.voters.filter(v => v !== username);
        a.votes = Math.max(0, (a.votes || 0) - 1);
      } else {
        a.voters.push(username);
        a.votes = (a.votes || 0) + 1;
      }
    } else {
      q.voters = q.voters || [];
      if (q.voters.includes(username)) {
        q.voters = q.voters.filter(v => v !== username);
        q.votes = Math.max(0, (q.votes || 0) - 1);
      } else {
        q.voters.push(username);
        q.votes = (q.votes || 0) + 1;
      }
    }
    forumSave();
    if (state.forumCurrentId === qId) forumRenderDetail();
    else forumRenderList();
  }

  function forumMarkBest(qId, aId) {
    const q = state.forumQuestions.find(x => x.id === qId);
    if (!q || q.author !== state.user?.username) return;
    (q.answers || []).forEach(a => {
      a.isBest = a.id === aId ? !a.isBest : false;
    });
    forumSave();
    toast(q.answers.find(a => a.id === aId)?.isBest ? '✓ Melhor resposta marcada!' : 'Marcação removida.', 'success');
    forumRenderDetail();
  }

  
  const TAREFAS_STORAGE_KEY = 'studysync_tarefas_v1';

  function tarefasLoad() {
    try {
      const raw = localStorage.getItem(TAREFAS_STORAGE_KEY);
      state.tarefas = raw ? JSON.parse(raw) : [];
    } catch { state.tarefas = []; }
  }

  function tarefasSave() {
    localStorage.setItem(TAREFAS_STORAGE_KEY, JSON.stringify(state.tarefas));
  }


  let tarefasMode = 'checklist';

  function tarefasSwitchMode(mode) {
    tarefasMode = mode;
    const clEl = document.getElementById('tarefas-checklist-mode');
    const kbEl = document.getElementById('tarefas-kanban-mode');
    const ringWrap = document.getElementById('tarefas-ring-wrap');
    const btnCl = document.getElementById('btn-mode-checklist');
    const btnKb = document.getElementById('btn-mode-kanban');
    if (mode === 'checklist') {
      if(clEl) clEl.style.display = '';
      if(kbEl) kbEl.style.display = 'none';
      if(ringWrap) ringWrap.style.display = '';
      if(btnCl) btnCl.classList.add('active');
      if(btnKb) btnKb.classList.remove('active');
      tarefasRender();
    } else {
      if(clEl) clEl.style.display = 'none';
      if(kbEl) kbEl.style.display = '';
      if(ringWrap) ringWrap.style.display = 'none';
      if(btnCl) btnCl.classList.remove('active');
      if(btnKb) btnKb.classList.add('active');
      kanbanRender();
    }
  }

  function showTarefas() {
    showScreen('tarefas');
    updateHeaderUser('tarefas');
    tarefasLoad();
    kanbanLoad();
    tarefasSwitchMode(tarefasMode || 'checklist');
  }

  function tarefasGetFiltered() {
    let list = [...state.tarefas];
    const s = state.tarefasSearch.toLowerCase();
    if (s) list = list.filter(t => t.title.toLowerCase().includes(s) || (t.desc||'').toLowerCase().includes(s));
    if (state.tarefasFilter === 'open') list = list.filter(t => !t.done);
    else if (state.tarefasFilter === 'done') list = list.filter(t => t.done);
    else if (state.tarefasFilter === 'mine') list = list.filter(t => t.author === state.user?.username);

    const sortVal = state.tarefasSort;
    if (sortVal === 'oldest')   list.sort((a,b) => a.createdAt - b.createdAt);
    else if (sortVal === 'priority') {
      const p = { high: 0, normal: 1, low: 2 };
      list.sort((a,b) => (p[a.priority]||1) - (p[b.priority]||1));
    } else if (sortVal === 'alpha') {
      list.sort((a,b) => a.title.localeCompare(b.title));
    } else {
      list.sort((a,b) => b.createdAt - a.createdAt);
    }
    return list;
  }

  function tarefasTimeAgo(ts) {
    const diff = Math.floor((Date.now() - ts) / 1000);
    if (diff < 60) return 'agora';
    if (diff < 3600) return `${Math.floor(diff/60)}min atrás`;
    if (diff < 86400) return `${Math.floor(diff/3600)}h atrás`;
    return `${Math.floor(diff/86400)}d atrás`;
  }

  function tarefasUpdateProgress() {
    const total = state.tarefas.length;
    const done  = state.tarefas.filter(t => t.done).length;
    const pct   = total ? Math.round((done / total) * 100) : 0;
    const circ  = 2 * Math.PI * 26;
    const offset = circ - (pct / 100) * circ;
    const fg = document.getElementById('tarefas-ring-fg');
    if (fg) { fg.style.strokeDashoffset = offset; fg.style.strokeDasharray = circ; }
    const pctEl = document.getElementById('tarefas-ring-pct');
    if (pctEl) pctEl.textContent = pct + '%';
    const sumEl = document.getElementById('tarefas-summary');
    if (sumEl) sumEl.textContent = `${done} de ${total} concluída${total !== 1 ? 's' : ''}`;
  }

  function tarefasRender() {
    tarefasUpdateProgress();
    const list = document.getElementById('tarefas-list');
    const items = tarefasGetFiltered();
    if (!items.length) {
      list.innerHTML = `<div class="empty-state">${state.tarefasSearch || state.tarefasFilter !== 'all' ? 'Nenhuma tarefa encontrada.' : 'Nenhuma tarefa ainda. Adicione a primeira!'}</div>`;
      return;
    }

    const open = items.filter(t => !t.done);
    const done = items.filter(t => t.done);

    let html = '';
    if (open.length) {
      if (state.tarefasFilter === 'all' && done.length) {
        html += `<div class="tarefa-section-label">ABERTAS — ${open.length}</div>`;
      }
      html += open.map(t => tarefasCardHtml(t)).join('');
    }
    if (done.length && state.tarefasFilter !== 'open') {
      html += `<div class="tarefa-section-label">CONCLUÍDAS — ${done.length}</div>`;
      html += done.map(t => tarefasCardHtml(t)).join('');
    }

    list.innerHTML = html;
  }

  function tarefasCardHtml(t) {
    const isOwner = t.author === state.user?.username;
    const priHtml = t.priority && t.priority !== 'normal'
      ? `<span class="tarefa-priority-badge ${t.priority}">${t.priority === 'high' ? '↑ ALTA' : '↓ BAIXA'}</span>` : '';
    const doneBy = t.done && t.completedBy
      ? `<span class="tarefa-completed-by">✓ por ${t.completedBy}</span>` : '';
    const descHtml = t.desc ? `<div class="tarefa-desc">${t.desc}</div>` : '';

    return `
      <div class="tarefa-card ${t.done ? 'done' : ''} ${t.priority !== 'normal' ? 'priority-'+t.priority : ''}" data-id="${t.id}">
        <div class="tarefa-check-wrap">
          <button class="tarefa-check ${t.done ? 'checked' : ''}"
            onclick="App.tarefasToggle('${t.id}')" title="${t.done ? 'Desmarcar' : 'Marcar como concluída'}"></button>
        </div>
        <div class="tarefa-body">
          <div class="tarefa-title">${t.title}</div>
          ${descHtml}
          <div class="tarefa-meta">
            <span class="tarefa-author">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              ${t.author}
            </span>
            <span class="tarefa-time">${tarefasTimeAgo(t.createdAt)}</span>
            ${priHtml}
            ${doneBy}
          </div>
        </div>
        <div class="tarefa-actions">
          ${isOwner ? `
          <button class="tarefa-action-btn" onclick="App.tarefasOpenEdit('${t.id}')" title="Editar">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="tarefa-action-btn del" onclick="App.tarefasDelete('${t.id}')" title="Excluir">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
          </button>` : ''}
        </div>
      </div>`;
  }

  function tarefasSetFilter(f, btn) {
    state.tarefasFilter = f;
    document.querySelectorAll('.tarefas-tab').forEach(t => t.classList.remove('active'));
    if (btn) btn.classList.add('active');
    tarefasRender();
  }

  function tarefasSetSort(val) {
    state.tarefasSort = val;
    tarefasRender();
  }

  function tarefasSearch(val) {
    state.tarefasSearch = val.toLowerCase();
    tarefasRender();
  }

  function tarefasOpenAdd() {
    document.getElementById('tarefas-add-collapsed').style.display = 'none';
    document.getElementById('tarefas-add-form').style.display = 'block';
    setTimeout(() => document.getElementById('tarefas-new-title').focus(), 40);
  }

  function tarefasCloseAdd() {
    document.getElementById('tarefas-add-form').style.display = 'none';
    document.getElementById('tarefas-add-collapsed').style.display = 'flex';
    document.getElementById('tarefas-new-title').value = '';
    document.getElementById('tarefas-new-desc').value = '';
    document.getElementById('tarefas-new-priority').value = 'normal';
  }

  function tarefasAddKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); tarefasSubmit(); }
    if (e.key === 'Escape') tarefasCloseAdd();
  }

  function tarefasSubmit() {
    const title = document.getElementById('tarefas-new-title').value.trim();
    if (!title) { toast('Digite um título para a tarefa.', 'error'); return; }
    const desc     = document.getElementById('tarefas-new-desc').value.trim();
    const priority = document.getElementById('tarefas-new-priority').value;
    const t = {
      id: 'tf_' + Date.now() + '_' + Math.random().toString(36).slice(2,6),
      title, desc, priority,
      author: state.user?.username || 'Anônimo',
      createdAt: Date.now(),
      done: false,
      completedBy: null,
    };
    state.tarefas.unshift(t);
    tarefasSave();
    tarefasCloseAdd();
    tarefasRender();
    toast('Tarefa adicionada!', 'success');
  }

  function tarefasToggle(id) {
    const t = state.tarefas.find(x => x.id === id);
    if (!t) return;
    t.done = !t.done;
    t.completedBy = t.done ? (state.user?.username || 'Anônimo') : null;
    tarefasSave();
    tarefasRender();
  }

  function tarefasDelete(id) {
    state.tarefas = state.tarefas.filter(x => x.id !== id);
    tarefasSave();
    tarefasRender();
    toast('Tarefa removida.', 'success');
  }

  function tarefasOpenEdit(id) {
    const t = state.tarefas.find(x => x.id === id);
    if (!t) return;
    state.tarefasEditId = id;
    document.getElementById('tarefas-edit-title').value = t.title;
    document.getElementById('tarefas-edit-desc').value = t.desc || '';
    document.getElementById('tarefas-edit-priority').value = t.priority || 'normal';
    document.getElementById('tarefas-edit-overlay').classList.add('open');
    setTimeout(() => document.getElementById('tarefas-edit-title').focus(), 50);
  }

  function tarefasCloseEdit() {
    document.getElementById('tarefas-edit-overlay').classList.remove('open');
    state.tarefasEditId = null;
  }

  function tarefasSaveEdit() {
    const t = state.tarefas.find(x => x.id === state.tarefasEditId);
    if (!t) return;
    const title = document.getElementById('tarefas-edit-title').value.trim();
    if (!title) { toast('O título não pode ficar vazio.', 'error'); return; }
    t.title    = title;
    t.desc     = document.getElementById('tarefas-edit-desc').value.trim();
    t.priority = document.getElementById('tarefas-edit-priority').value;
    tarefasSave();
    tarefasCloseEdit();
    tarefasRender();
    toast('Tarefa atualizada!', 'success');
  }

  
  const KANBAN_STORAGE_KEY = 'studysync_kanban_v1';
  let kanbanCards = [];
  let kanbanDragId = null;
  let kanbanEditId = null;

  function kanbanLoad() {
    try {
      const raw = localStorage.getItem(KANBAN_STORAGE_KEY);
      kanbanCards = raw ? JSON.parse(raw) : [];
    } catch { kanbanCards = []; }
  }

  function kanbanSaveStorage() {
    localStorage.setItem(KANBAN_STORAGE_KEY, JSON.stringify(kanbanCards));
  }

  const KANBAN_COLS = ['todo', 'doing', 'review', 'done'];
  const KANBAN_COL_LABELS = { todo: 'A Fazer', doing: 'Em Andamento', review: 'Revisão', done: 'Concluído' };
  const KANBAN_COL_COLORS = { todo: '#e8a04a', doing: '#7aaadd', review: '#c97be0', done: '#7abc8a' };

  function kanbanRender() {
    KANBAN_COLS.forEach(col => {
      const container = document.getElementById('kanban-col-' + col);
      if (!container) return;
      const cards = kanbanCards.filter(c => c.col === col);
      const countEl = document.getElementById('kanban-count-' + col);
      if (countEl) countEl.textContent = cards.length;
      if (!cards.length) {
        container.innerHTML = '<div class="kanban-empty">Nenhum card ainda</div>';
        return;
      }
      container.innerHTML = cards.map(c => kanbanCardHtml(c)).join('');

      container.querySelectorAll('.kanban-card').forEach(el => {
        el.addEventListener('dragstart', e => {
          kanbanDragId = el.dataset.id;
          el.classList.add('dragging');
          e.dataTransfer.effectAllowed = 'move';
        });
        el.addEventListener('dragend', () => el.classList.remove('dragging'));
      });
    });
  }

  function kanbanCardHtml(c) {
    const priColor = c.priority === 'high' ? '#e8a04a' : c.priority === 'low' ? '#7abc8a' : 'var(--text-3)';
    const priLabel = c.priority === 'high' ? '↑ ALTA' : c.priority === 'low' ? '↓ BAIXA' : '';
    const isOwner = c.author === (state.user?.username || 'Anônimo');
    return `
      <div class="kanban-card" data-id="${c.id}" draggable="true">
        <div class="kanban-card-header">
          ${priLabel ? `<span class="kanban-badge" style="color:${priColor}">${priLabel}</span>` : '<span></span>'}
          ${isOwner ? `<div class="kanban-card-actions">
            <button class="kanban-card-btn" onclick="App.kanbanOpenEdit('${c.id}')" title="Editar">✏️</button>
            <button class="kanban-card-btn del" onclick="App.kanbanDeleteCard('${c.id}')" title="Excluir">🗑</button>
          </div>` : `<div class="kanban-card-actions">
            <button class="kanban-card-btn" onclick="App.kanbanOpenEdit('${c.id}')" title="Ver">👁</button>
          </div>`}
        </div>
        <div class="kanban-card-title">${c.title}</div>
        ${c.desc ? `<div class="kanban-card-desc">${c.desc}</div>` : ''}
        <div class="kanban-card-footer">
          <span class="kanban-card-author">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            ${c.author}
          </span>
          ${c.assignee ? `<span class="kanban-card-assignee">→ ${c.assignee}</span>` : ''}
        </div>
        <div class="kanban-card-drag-hint">⠿</div>
      </div>`;
  }

  function kanbanDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const col = e.currentTarget;
    col.classList.add('drag-over');
  }

  function kanbanDragLeave(e) {
    e.currentTarget.classList.remove('drag-over');
  }

  function kanbanDrop(e, targetCol) {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    if (!kanbanDragId) return;
    const card = kanbanCards.find(c => c.id === kanbanDragId);
    if (card && card.col !== targetCol) {
      card.col = targetCol;
      kanbanSaveStorage();
      kanbanRender();
      toast(`Card movido para "${KANBAN_COL_LABELS[targetCol]}"`, 'success');
    }
    kanbanDragId = null;
  }

  function kanbanOpenAdd(defaultCol) {
    kanbanEditId = null;
    document.getElementById('kanban-modal-title').textContent = 'Novo Card';
    document.getElementById('kanban-card-title').value = '';
    document.getElementById('kanban-card-desc').value = '';
    document.getElementById('kanban-card-col').value = defaultCol || 'todo';
    document.getElementById('kanban-card-priority').value = 'normal';
    document.getElementById('kanban-card-assignee').value = '';
    document.getElementById('kanban-modal-overlay').classList.add('open');
    setTimeout(() => document.getElementById('kanban-card-title').focus(), 50);
  }

  function kanbanOpenEdit(id) {
    const c = kanbanCards.find(x => x.id === id);
    if (!c) return;
    kanbanEditId = id;
    document.getElementById('kanban-modal-title').textContent = 'Editar Card';
    document.getElementById('kanban-card-title').value = c.title;
    document.getElementById('kanban-card-desc').value = c.desc || '';
    document.getElementById('kanban-card-col').value = c.col;
    document.getElementById('kanban-card-priority').value = c.priority || 'normal';
    document.getElementById('kanban-card-assignee').value = c.assignee || '';
    document.getElementById('kanban-modal-overlay').classList.add('open');
    setTimeout(() => document.getElementById('kanban-card-title').focus(), 50);
  }

  function kanbanCloseModal() {
    document.getElementById('kanban-modal-overlay').classList.remove('open');
    kanbanEditId = null;
  }

  function kanbanSaveCard() {
    const title = document.getElementById('kanban-card-title').value.trim();
    if (!title) { toast('Digite um título para o card.', 'error'); return; }
    const col      = document.getElementById('kanban-card-col').value;
    const desc     = document.getElementById('kanban-card-desc').value.trim();
    const priority = document.getElementById('kanban-card-priority').value;
    const assignee = document.getElementById('kanban-card-assignee').value.trim();
    if (kanbanEditId) {
      const c = kanbanCards.find(x => x.id === kanbanEditId);
      if (c) { c.title = title; c.desc = desc; c.col = col; c.priority = priority; c.assignee = assignee; }
      toast('Card atualizado!', 'success');
    } else {
      kanbanCards.unshift({
        id: 'kb_' + Date.now() + '_' + Math.random().toString(36).slice(2,6),
        title, desc, col, priority, assignee,
        author: state.user?.username || 'Anônimo',
        createdAt: Date.now(),
      });
      toast('Card adicionado!', 'success');
    }
    kanbanSaveStorage();
    kanbanCloseModal();
    kanbanRender();
  }

  function kanbanDeleteCard(id) {
    kanbanCards = kanbanCards.filter(x => x.id !== id);
    kanbanSaveStorage();
    kanbanRender();
    toast('Card removido.', 'success');
  }

  async function showUserProfile(userId) {
    if (userId === state.user.id) { showProfile(); return; }
    
    try {
      const res = await fetch(`${API}/api/users/${userId}/dashboard`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      const u = data.user;
      const s = data.stats;
      const [bg] = avatarColor(u.username);

      const modalHtml = `
        <div class="user-profile-modal">
          <div class="profile-hero" style="padding:0; margin-bottom:24px;">
            <div class="profile-avatar-lg" style="background:${bg}; color:#0f0d0a; font-size:40px;">${u.username[0].toUpperCase()}</div>
            <div class="profile-info">
              <div class="profile-name">${escHtml(u.username)}</div>
              <div class="profile-bio-display">${escHtml(u.bio || 'Sem bio disponível.')}</div>
              <div class="teacher-badge" style="display:${u.role === 'professor' ? 'inline-flex' : 'none'}">Professor</div>
            </div>
          </div>
          <div class="profile-stats-row" style="grid-template-columns: 1fr 1fr; margin-bottom:24px;">
            <div class="stat-card"><div class="stat-value">${s.total_hours}h</div><div class="stat-label">Total</div></div>
            <div class="stat-card"><div class="stat-value">${s.streak_days}</div><div class="stat-label">Sequência</div></div>
          </div>
          <button class="btn-primary" onclick="App.closeModal(); App.openPrivateChat('${u.id}', '${escHtml(u.username)}')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            Enviar Mensagem Direta
          </button>
        </div>
      `;
      openModal(modalHtml);
    } catch (e) { toast('Erro ao carregar perfil.', 'error'); }
  }

  async function openPrivateChat(userId, username) {
    state.activePrivateChat = { id: userId, username };
    const chatBox = document.getElementById('private-chat-box');
    chatBox.classList.add('active');
    document.getElementById('pchat-name').textContent = username;
    document.getElementById('pchat-messages').innerHTML = '<div class="msg-system">Carregando conversa...</div>';
    
    try {
      const res = await fetch(`${API}/api/private-messages/${state.user.id}/${userId}`);
      const data = await res.json();
      state.privateHistory[userId] = data.messages || [];
      renderPrivateMessages();
    } catch(e) { console.error(e); }
  }

  function closePrivateChat() {
    state.activePrivateChat = null;
    document.getElementById('private-chat-box').classList.remove('active');
  }

  function sendPrivateMessage() {
    const input = document.getElementById('pchat-input');
    const content = input.value.trim();
    if (!content || !state.activePrivateChat) return;
    
    sendWs({
      type: 'private_message',
      target_id: state.activePrivateChat.id,
      content: content
    });
    input.value = '';
  }

  async function loadRecentChats() {
    if (!state.user?.id) return;
    try {
      const res = await fetch(`${API}/api/private-contacts/${state.user.id}`);
      const data = await res.json();
      state.recentChats = data.contacts || [];
      renderRecentChats();
    } catch(e) { console.error('Erro ao carregar contatos privados:', e); }
  }

  function renderRecentChats() {
    const list = document.getElementById('recent-pchats-list');
    if (!list) return;


    const recentHtml = state.recentChats.length > 0 
      ? state.recentChats.map(c => {
      const [bg] = avatarColor(c.username);
      return `
        <div class="user-item" onclick="App.openPrivateChat('${c.id}', '${escHtml(c.username)}')" style="cursor:pointer" title="Conversar com ${escHtml(c.username)}">
          <div style="width:24px;height:24px;border-radius:50%;background:${bg};color:#0f0d0a;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:600;flex-shrink:0;">${c.username[0].toUpperCase()}</div>
          <span class="user-item-name" style="flex:1">${escHtml(c.username)}</span>
          <span style="font-size:9px;color:var(--text-3);font-family:var(--font-mono)">${formatTime(c.last_msg_time)}</span>
        </div>
      `;
        }).join('')
      : '<div class="empty-state" style="padding:10px 0;font-size:11px;">Sem históricos</div>';

   
    const recentUsernames = new Set(state.recentChats.map(c => c.username.toLowerCase()));
    const otherFriends = state.friends.filter(f => !recentUsernames.has(f.username.toLowerCase()));

    const friendsHtml = otherFriends.length > 0
      ? otherFriends.map(f => {
          const [bg] = avatarColor(f.username);
          const online = state.onlineFriends.has(f.username);
          return `
            <div class="user-item" onclick="App.startChatWithFriend('${escHtml(f.username)}')" style="cursor:pointer" title="Conversar com ${escHtml(f.username)}">
              <div style="width:24px;height:24px;border-radius:50%;background:${bg};color:#0f0d0a;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:600;flex-shrink:0;">${f.username[0].toUpperCase()}</div>
              <span class="user-item-name" style="flex:1">${escHtml(f.username)}</span>
              <span style="font-size:9px;color:${online ? '#7abc8a' : 'var(--text-3)'};font-family:var(--font-mono)">${online ? '● on' : '○ off'}</span>
            </div>
          `;
        }).join('')
      : '';

    list.innerHTML = `
      <div style="font-size:9px; color:var(--text-3); text-transform:uppercase; margin-bottom:5px; padding-left:8px; font-weight:700;">Histórico</div>
      ${recentHtml}
      ${friendsHtml ? `<div style="font-size:9px; color:var(--text-3); text-transform:uppercase; margin:12px 0 5px; padding-left:8px; font-weight:700;">Amigos</div>${friendsHtml}` : ''}
    `;
  }

  function handleReceivePrivateMessage(msg) {
    const otherId = msg.from_id === state.user.id ? msg.to_id : msg.from_id;
    if (!state.privateHistory[otherId]) state.privateHistory[otherId] = [];
    state.privateHistory[otherId].push(msg);
    
    loadRecentChats();
    if (state.activePrivateChat && state.activePrivateChat.id === otherId) {
      renderPrivateMessages();
    } else {
      pushNotif('✉️', `Nova mensagem de <strong>${msg.from_name}</strong>`, true);
    }
  }

  function renderPrivateMessages() {
    const container = document.getElementById('pchat-messages');
    const history = state.privateHistory[state.activePrivateChat.id] || [];
    container.innerHTML = history.map(m => {
      const isOwn = m.from_id === state.user.id;
      return `
        <div class="pmsg ${isOwn ? 'own' : ''}">
          <div class="pmsg-bubble">${escHtml(m.content)}</div>
          <div class="pmsg-time">${formatTime(m.timestamp)}</div>
        </div>
      `;
    }).join('');
    container.scrollTop = container.scrollHeight;
  }

  function handlePrivateChatKey(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendPrivateMessage();
    }
  }

  
  let pdfDoc = null;
  let pdfCurrentPage = 1;
  let pdfZoom = 1.0;
  let pdfRendering = false;

 
  function loadNodes() {
    const savedNodes = localStorage.getItem(`studysync_nodes_${state.currentRoom?.id}`);
    const savedLinks = localStorage.getItem(`studysync_links_${state.currentRoom?.id}`);
    if (savedNodes) state.nodes = JSON.parse(savedNodes);
    if (savedLinks) state.nodeLinks = JSON.parse(savedLinks);
    renderNodes();
    renderMindMapLinks();
  }
  function saveNodes() { 
    localStorage.setItem(`studysync_nodes_${state.currentRoom?.id}`, JSON.stringify(state.nodes));
    localStorage.setItem(`studysync_links_${state.currentRoom?.id}`, JSON.stringify(state.nodeLinks));
  }
  function setNodeShape(shape, el) {
    state.selectedNodeShape = shape;
    el.parentElement.querySelectorAll('button').forEach(b => b.classList.remove('active'));
    el.classList.add('active');
  }
  function selectNodeColor(color, el) {
    state.selectedNodeColor = color;
    el.parentElement.querySelectorAll('.pin-color-opt').forEach(opt => opt.classList.remove('active'));
    el.classList.add('active');
  }
  function onMindMapClick(e) {
    if (e.target.id !== 'nodes-canvas' && e.target.id !== 'nodes-container') return;
    const rect = document.getElementById('nodes-canvas').getBoundingClientRect();
    
   
    const isSquareShape = state.selectedNodeShape === 'circle' || state.selectedNodeShape === 'diamond';
    const w = isSquareShape ? 120 : 180;
    const h = isSquareShape ? 120 : 60;

    const x = e.clientX - rect.left - (w / 2);
    const y = e.clientY - rect.top - (h / 2);
    addNode('', x, y);
  }
  function addNode(content, x, y) {
    const newNode = {
      id: 'node_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
      content: content, x, y, color: state.selectedNodeColor, shape: state.selectedNodeShape,
      author: state.user.username, createdAt: Date.now()
    };
    state.nodes.push(newNode); saveNodes(); renderNodes();
    if (!content) {
      setTimeout(() => {
        const el = document.querySelector(`[data-node-id="${newNode.id}"] .pin-content`);
        if (el) { el.contentEditable = "true"; el.focus(); }
      }, 50);
    }
    sendWs({ type: 'node_add', node: newNode });
  }
  function toggleNodeLinkMode() {
    state.nodeLinkMode = !state.nodeLinkMode;
    state.linkSourceId = null;
    document.getElementById('btn-node-link-mode').classList.toggle('active', state.nodeLinkMode);
    document.querySelectorAll('.pin[data-node-id]').forEach(el => el.classList.remove('linking'));
    toast(state.nodeLinkMode ? 'Selecione o balão de origem' : 'Modo ligação desativado');
  }
  function handleNodeClick(nodeId) {
    if (!state.nodeLinkMode) return;
    if (!state.linkSourceId) {
      state.linkSourceId = nodeId;
      const nodeEl = document.querySelector(`[data-node-id="${nodeId}"]`);
      if (nodeEl) nodeEl.classList.add('linking');
      toast('Agora selecione o balão de destino');
    } else {
      if (state.linkSourceId === nodeId) { state.linkSourceId = null; return; }
      const newLink = { id: 'link_' + Date.now(), from: state.linkSourceId, to: nodeId };
      state.nodeLinks.push(newLink);
      saveNodes();
      renderMindMapLinks();
      sendWs({ type: 'node_link_add', link: newLink });
    
      document.querySelectorAll('.pin[data-node-id]').forEach(el => el.classList.remove('linking'));
      toggleNodeLinkMode();
    }
  }
  function updateNodeContent(nodeId, content) {
    const node = state.nodes.find(n => n.id === nodeId);
    if (!node) return;
    node.content = content; saveNodes();
    sendWs({ type: 'node_move', nodeId, x: node.x, y: node.y, content: node.content });
  }
  function deleteNode(nodeId) {
    state.nodes = state.nodes.filter(n => n.id !== nodeId);
    state.nodeLinks = state.nodeLinks.filter(l => l.from !== nodeId && l.to !== nodeId);
    saveNodes(); renderNodes(); renderMindMapLinks();
    sendWs({ type: 'node_delete', nodeId });
  }
  function moveNode(nodeId, x, y) {
    const node = state.nodes.find(n => n.id === nodeId);
    if (!node) return;
    node.x = x; node.y = y;
    sendWs({ type: 'node_move', nodeId, x, y });
  }
  function renderNodes() {
    const canvas = document.getElementById('nodes-canvas');
    if (!canvas) return;
    canvas.innerHTML = '';

    renderMindMapLinks(); 

    state.nodes.forEach(n => {
      const el = document.createElement('div');
      
      let borderRadius = "50px"; 
      let w = 180, h = 60;

      if (n.shape === 'rect') { borderRadius = "8px"; }
      else if (n.shape === 'circle') { borderRadius = "50%"; w = 120; h = 120; }
      else if (n.shape === 'diamond') { w = 120; h = 120; }
      
      el.className = 'pin' + (n.shape === 'diamond' ? ' node-shape-diamond' : '');
      el.style.cssText = `left:${n.x}px; top:${n.y}px; background:${n.color}; border-radius:${borderRadius}; min-height:${h}px; width:${w}px; transform:rotate(0deg); border: 2px solid rgba(0,0,0,0.1); z-index:2; display:flex; align-items:center; justify-content:center; padding:10px;`;
      el.dataset.nodeId = n.id;
      el.onclick = (e) => {
        if (state.nodeLinkMode) { e.stopPropagation(); handleNodeClick(n.id); }
      };
      el.innerHTML = `
        <div class="pin-content" style="text-align:center; width:100%; height:100%; display:flex; align-items:center; justify-content:center; outline:none; overflow:hidden;" contenteditable="false" 
             onblur="this.contentEditable=false; App.updateNodeContent('${n.id}', this.innerText)">${escHtml(n.content)}</div>
        <button class="pin-delete" onclick="event.stopPropagation(); App.deleteNode('${n.id}')">✕</button>
      `;
      el.onmousedown = (e) => {
       
        if (state.nodeLinkMode) return;
        if (e.target.contentEditable === "true" || e.target.tagName === 'BUTTON' || e.target.closest('button')) return;

        let startX = e.clientX - el.offsetLeft;
        let startY = e.clientY - el.offsetTop;
        let moved = false;

        const onMouseMove = (me) => { 
          moved = true;
          const nx = me.clientX - startX;
          const ny = me.clientY - startY;
          el.style.left = nx + 'px'; 
          el.style.top = ny + 'px'; 
          n.x = nx; n.y = ny;
          renderMindMapLinks();
        };
        const onMouseUp = () => {
          document.removeEventListener('mousemove', onMouseMove);
          document.removeEventListener('mouseup', onMouseUp);
          if (moved) {
            moveNode(n.id, n.x, n.y);
            saveNodes();
          }
        };
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
      };
      el.ondblclick = () => {
        const contentEl = el.querySelector('.pin-content');
        if (contentEl) { contentEl.contentEditable = "true"; contentEl.focus(); }
      };
      canvas.appendChild(el);
    });
  }
  function renderMindMapLinks() {
    const svg = document.getElementById('nodes-svg');
    if (!svg) return;
  
    const lines = svg.querySelectorAll('line');
    lines.forEach(l => l.remove());

    state.nodeLinks.forEach(link => {
      const fromNode = state.nodes.find(n => n.id === link.from);
      const toNode = state.nodes.find(n => n.id === link.to);
      if (!fromNode || !toNode) return;

      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      
      
      const isSquareFrom = fromNode.shape === 'circle' || fromNode.shape === 'diamond';
      const isSquareTo = toNode.shape === 'circle' || toNode.shape === 'diamond';
      
      line.setAttribute("x1", fromNode.x + (isSquareFrom ? 60 : 90));
      line.setAttribute("y1", fromNode.y + (isSquareFrom ? 60 : 30));
      line.setAttribute("x2", toNode.x + (isSquareTo ? 60 : 90));
      line.setAttribute("y2", toNode.y + (isSquareTo ? 60 : 30));

      line.setAttribute("stroke", "rgba(232,160,74,0.6)");
      line.setAttribute("stroke-width", "2");
      line.setAttribute("marker-end", "url(#arrowhead)");
      line.setAttribute("data-link-id", link.id);
      svg.appendChild(line);
    });
  }
  function clearNodes() {
    if (!confirm('Deseja limpar todo o mapa mental?')) return;
    state.nodes = []; saveNodes(); renderNodes();
    state.nodeLinks = []; renderMindMapLinks();
  }
  function toggleMindMap() {
    const board = document.getElementById('mindmap-board');
    if (!board) return;
    const isOpen = board.classList.toggle('open');
    if (isOpen) {
        document.getElementById('pin-board')?.classList.remove('open');
        loadNodes();
    }
  }

  function togglePdfReader() {
    const panel = document.getElementById('pdf-reader-panel');
    if (!panel) return;
    if (panel.classList.contains('open')) {
      panel.classList.remove('open');
      document.getElementById('btn-tool-pdf')?.classList.remove('active');
    } else {
      panel.classList.add('open');
      document.getElementById('btn-tool-pdf')?.classList.add('active');
      document.getElementById('whiteboard-panel')?.classList.remove('open');
      document.getElementById('btn-tool-wb')?.classList.remove('active');
      document.getElementById('flashcard-panel')?.classList.remove('open');
      document.getElementById('btn-tool-fc')?.classList.remove('active');
      document.getElementById('doc-panel')?.classList.remove('open');
      document.getElementById('btn-tool-doc')?.classList.remove('active');
      document.getElementById('code-editor-panel')?.classList.remove('open');
      document.getElementById('btn-tool-code')?.classList.remove('active');
      document.getElementById('translator-panel')?.classList.remove('open');
      document.getElementById('btn-tool-translator')?.classList.remove('active');
    }
  }

  async function _pdfLoadLib() {
    
    const CDN = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/';
    const [mainResp, workerResp] = await Promise.all([
      fetch(CDN + 'pdf.min.js'),
      fetch(CDN + 'pdf.worker.min.js'),
    ]);
    const [mainText, workerText] = await Promise.all([
      mainResp.text(),
      workerResp.text(),
    ]);

    const mainBlob = new Blob([mainText], { type: 'text/javascript' });
    const mainUrl  = URL.createObjectURL(mainBlob);
    await new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = mainUrl; s.onload = resolve; s.onerror = reject;
      document.head.appendChild(s);
    });
    URL.revokeObjectURL(mainUrl);

    
    const workerBlob = new Blob([workerText], { type: 'text/javascript' });
    window.pdfjsLib.GlobalWorkerOptions.workerSrc = URL.createObjectURL(workerBlob);
    
  }

  async function pdfLoadFile(file) {
    if (!file) return;
    if (!window.pdfjsLib) {
      toast('Carregando leitor de PDF...', 'info');
      await _pdfLoadLib();
    }
    const arrayBuffer = await file.arrayBuffer();
    try {
      pdfDoc = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      pdfCurrentPage = 1;
      pdfZoom = 1.0;
      document.getElementById('pdf-filename').textContent = file.name;
      document.getElementById('pdf-total-pages').textContent = pdfDoc.numPages;
      document.getElementById('pdf-nav').style.display = 'flex';
      document.getElementById('pdf-drop-zone').style.display = 'none';
      document.getElementById('pdf-canvas-wrap').style.display = 'flex';
      document.getElementById('pdf-zoom-label').textContent = '100%';
      pdfRenderPage(pdfCurrentPage);
      toast('PDF carregado!', 'success');
    } catch (e) {
      toast('Erro ao abrir PDF', 'error');
    }
  }

  async function pdfRenderPage(num) {
    if (!pdfDoc || pdfRendering) return;
    pdfRendering = true;
    const page = await pdfDoc.getPage(num);
    const viewport = page.getViewport({ scale: pdfZoom * 1.5 });
    const canvas = document.getElementById('pdf-canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
    pdfRendering = false;
    document.getElementById('pdf-current-page').textContent = num;
  }

  function pdfNextPage() {
    if (!pdfDoc || pdfCurrentPage >= pdfDoc.numPages) return;
    pdfCurrentPage++;
    pdfRenderPage(pdfCurrentPage);
  }

  function pdfPrevPage() {
    if (!pdfDoc || pdfCurrentPage <= 1) return;
    pdfCurrentPage--;
    pdfRenderPage(pdfCurrentPage);
  }

  function pdfZoomIn() {
    pdfZoom = Math.min(pdfZoom + 0.25, 3.0);
    document.getElementById('pdf-zoom-label').textContent = Math.round(pdfZoom * 100) + '%';
    pdfRenderPage(pdfCurrentPage);
  }

  function pdfZoomOut() {
    pdfZoom = Math.max(pdfZoom - 0.25, 0.5);
    document.getElementById('pdf-zoom-label').textContent = Math.round(pdfZoom * 100) + '%';
    pdfRenderPage(pdfCurrentPage);
  }

  function pdfChangePdf() {
    pdfDoc = null;
    pdfCurrentPage = 1;
    pdfZoom = 1.0;
    document.getElementById('pdf-filename').textContent = 'Leitor de PDF';
    document.getElementById('pdf-nav').style.display = 'none';
    document.getElementById('pdf-drop-zone').style.display = 'flex';
    document.getElementById('pdf-canvas-wrap').style.display = 'none';
    document.getElementById('pdf-file-input').value = '';
  }


  let translatorHistory = [];
  let translatorDebounce = null;

  const LANG_NAMES = {
    auto:'Detectar', pt:'Português', en:'Inglês', es:'Espanhol',
    fr:'Francês', de:'Alemão', it:'Italiano', ja:'Japonês',
    ko:'Coreano', 'zh-CN':'Chinês', ru:'Russo', ar:'Árabe'
  };

  function toggleTranslator() {
    const panel = document.getElementById('translator-panel');
    if (!panel) return;
    if (panel.classList.contains('open')) {
      panel.classList.remove('open');
      document.getElementById('btn-tool-translator')?.classList.remove('active');
    } else {
      panel.classList.add('open');
      document.getElementById('btn-tool-translator')?.classList.add('active');
      document.getElementById('whiteboard-panel')?.classList.remove('open');
      document.getElementById('btn-tool-wb')?.classList.remove('active');
      document.getElementById('flashcard-panel')?.classList.remove('open');
      document.getElementById('btn-tool-fc')?.classList.remove('active');
      document.getElementById('doc-panel')?.classList.remove('open');
      document.getElementById('btn-tool-doc')?.classList.remove('active');
      document.getElementById('code-editor-panel')?.classList.remove('open');
      document.getElementById('btn-tool-code')?.classList.remove('active');
      document.getElementById('pdf-reader-panel')?.classList.remove('open');
      document.getElementById('btn-tool-pdf')?.classList.remove('active');
    }
  }

  function translatorOnInput() {
    const input = document.getElementById('translator-input');
    const count = document.getElementById('translator-char-count');
    if (count) count.textContent = (input?.value?.length || 0) + ' caracteres';
    clearTimeout(translatorDebounce);
    translatorDebounce = setTimeout(() => {
      if (input?.value?.trim().length > 3) translatorTranslate();
    }, 1000);
  }

  async function translatorTranslate() {
    const text = document.getElementById('translator-input')?.value?.trim();
    if (!text) return;
    const from = document.getElementById('translator-from')?.value || 'auto';
    const to = document.getElementById('translator-to')?.value || 'pt';
    const outputEl = document.getElementById('translator-output');
    if (!outputEl) return;

    outputEl.className = 'translator-result-box loading';
    outputEl.innerHTML = '<span style="opacity:0.6">Traduzindo...</span>';

    try {
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${from}&tl=${to}&dt=t&q=${encodeURIComponent(text)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('network');
      const data = await res.json();

      const translated = data[0]?.map(chunk => chunk[0]).join('') || '';
      if (!translated) throw new Error('empty');

      outputEl.className = 'translator-result-box';
      outputEl.textContent = translated;
      document.getElementById('translator-copy-btn').style.display = 'flex';

      const detectedEl = document.getElementById('translator-detected');
      if (detectedEl && from === 'auto') {
        const detected = data[2];
        detectedEl.textContent = detected ? `Detectado: ${LANG_NAMES[detected] || detected.toUpperCase()}` : '';
      } else if (detectedEl) {
        detectedEl.textContent = '';
      }

      translatorHistory.unshift({ orig: text, result: translated, from, to });
      if (translatorHistory.length > 8) translatorHistory.pop();

    } catch (e) {
      outputEl.className = 'translator-result-box';
      outputEl.innerHTML = '<span class="translator-placeholder">Erro ao traduzir. Verifique sua conexão.</span>';
    }
  }

  function translatorUpdateUrl() {
    const outputEl = document.getElementById('translator-output');
    if (outputEl && !outputEl.querySelector('.translator-placeholder') && !outputEl.querySelector('.loading')) {
      translatorTranslate();
    }
  }

  function translatorSwap() {
    const fromSel = document.getElementById('translator-from');
    const toSel = document.getElementById('translator-to');
    if (!fromSel || !toSel || fromSel.value === 'auto') return;
    const tmp = fromSel.value;
    fromSel.value = toSel.value;
    toSel.value = tmp;
    const inputEl = document.getElementById('translator-input');
    const outputEl = document.getElementById('translator-output');
    if (inputEl && outputEl && outputEl.textContent && !outputEl.querySelector('.translator-placeholder')) {
      const prev = outputEl.textContent;
      inputEl.value = prev;
      document.getElementById('translator-char-count').textContent = prev.length + ' caracteres';
      outputEl.innerHTML = '<span class="translator-placeholder">A tradução aparecerá aqui...</span>';
      document.getElementById('translator-copy-btn').style.display = 'none';
    }
    translatorTranslate();
  }

  function translatorClear() {
    const inputEl = document.getElementById('translator-input');
    const outputEl = document.getElementById('translator-output');
    if (inputEl) inputEl.value = '';
    if (outputEl) outputEl.innerHTML = '<span class="translator-placeholder">A tradução aparecerá aqui...</span>';
    const charCount = document.getElementById('translator-char-count');
    const copyBtn = document.getElementById('translator-copy-btn');
    const detected = document.getElementById('translator-detected');
    if (charCount) charCount.textContent = '0 caracteres';
    if (copyBtn) copyBtn.style.display = 'none';
    if (detected) detected.textContent = '';
  }

  function translatorCopy() {
    const outputEl = document.getElementById('translator-output');
    if (!outputEl || outputEl.querySelector('.translator-placeholder')) return;
    navigator.clipboard.writeText(outputEl.textContent).then(() => toast('Copiado!', 'success'));
  }



  async function showTurmas() {
    if (!state.user || !state.user.id || state.user.id === "") {
      toast('Sessão inválida. Faça login novamente.', 'error');
      localStorage.removeItem('studysync_user');
      showScreen('login');
      return;
    }
    showScreen('turmas');
    await loadTurmas();
    updateTurmasHeader();
  }

  function updateTurmasHeader() {
    if (!state.user || !state.user.id || state.user.id === "") return;
    const avatarEl = document.getElementById('turmas-header-avatar');
    const nameEl = document.getElementById('turmas-header-name');
    
    if (avatarEl) {
      if (state.profileEmoji && state.profileEmoji !== '🧑') {
        avatarEl.style.background = '';
        avatarEl.textContent = state.profileEmoji;
      } else {
        const [bg] = avatarColor(state.user.username);
        avatarEl.style.background = bg;
        avatarEl.textContent = state.user.username[0].toUpperCase();
      }
    }
    if (nameEl) nameEl.textContent = state.user.username;
  }

  async function loadTurmas() {
    let userId = state.user?.id || '';
    if (!userId) {
      const storedUser = localStorage.getItem('studysync_user');
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          userId = parsed?.id || '';
          if (userId && !state.user) {
            state.user = parsed;
          }
        } catch (err) {
          console.error('Erro ao ler usuário do localStorage:', err);
        }
      }
    }

    if (!userId || userId === "") return;
    
    try {
      const res = await fetch(`${API}/api/turmas?user_id=${userId}`);
      if (!res.ok) throw new Error('Erro ao carregar turmas');
      const data = await res.json();
      state.turmas = data.turmas || [];
      renderTurmas();
    } catch (e) {
      console.error('Erro ao carregar turmas:', e);
      toast('Erro ao carregar turmas.', 'error');
    }
  }

  function renderTurmas() {
    const container = document.getElementById('turmas-list');
    if (!container) return;
    
    const isProfessor = state.user?.role === 'professor';
    const subtitle = document.getElementById('turmas-subtitle');
    if (subtitle) {
      subtitle.textContent = isProfessor 
        ? 'Gerencie suas turmas e convide alunos.' 
        : 'Entre em uma turma usando o código fornecido pelo professor.';
    }
    
    const actions = document.getElementById('turmas-actions');
    if (actions) {
      actions.innerHTML = isProfessor
        ? `<button class="btn-primary" onclick="App.openCriarTurmaModal()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Nova Turma
           </button>`
        : `<button class="btn-primary" onclick="App.openEntrarTurmaModal()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            Entrar em Turma
           </button>`;
    }
    
    if (!state.turmas.length) {
      container.innerHTML = `
        <div class="empty-state" style="text-align:center;padding:60px 20px;">
          <div style="font-size:48px;margin-bottom:16px;">🏫</div>
          <p style="color:var(--text-2);margin-bottom:8px;">${isProfessor ? 'Nenhuma turma criada ainda.' : 'Você ainda não entrou em nenhuma turma.'}</p>
          <p style="color:var(--text-3);font-size:13px;">${isProfessor ? 'Clique em "Nova Turma" para começar.' : 'Peça o código da turma ao seu professor.'}</p>
        </div>
      `;
      return;
    }
    
    container.innerHTML = state.turmas.map(turma => `
      <div class="turma-card improved-layout">
        <div class="turma-card-header">
          <div class="turma-icon">${turma.icon || '🏫'}</div>
          <div class="turma-info">
            <div class="turma-name">${escHtml(turma.name)}</div>
            <div class="turma-desc">${escHtml(turma.description || 'Sem descrição')}</div>
            ${turma.professor_name ? `<div class="turma-professor">👨‍🏫 ${escHtml(turma.professor_name)}</div>` : ''}
          </div>
          <div class="turma-code" onclick="event.stopPropagation()">
            <span class="code-label">Código:</span>
            <span class="code-value" onclick="App.copyTurmaCode('${turma.code}')">${turma.code}</span>
            <button class="copy-code-btn" onclick="App.copyTurmaCode('${turma.code}')" title="Copiar código">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
              </svg>
            </button>
          </div>
        </div>
        <div class="turma-card-stats">
          <div class="stat-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            <span>${turma.students?.length || 0} alunos</span>
          </div>
          <div class="stat-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
            </svg>
            <span>${turma.materias?.length || 0} matérias</span>
          </div>
          <div class="stat-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 8v4l3 3M12 22a10 10 0 1 1 0-20 10 10 0 0 1 0 20z"/>
            </svg>
            <span>${new Date(turma.createdAt).toLocaleDateString('pt-BR')}</span>
          </div>
        </div>
        <div class="turma-card-actions">
          <button class="btn-secondary open-turma-btn" onclick="App.abrirTurma('${turma.id}')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
              <polyline points="10,17 15,12 10,7"/>
              <line x1="15" y1="12" x2="3" y2="12"/>
            </svg>
            Abrir Turma
          </button>
        </div>
      </div>
    `).join('');
  }

  function copyTurmaCode(code) {
    navigator.clipboard.writeText(code);
    toast('✅ Código da turma copiado!', 'success');
  }


  function openCriarTurmaModal() {
    let modal = document.getElementById('modal-criar-turma');
    
    if (!modal) {
      const modalHtml = `
        <div id="modal-criar-turma" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.8);z-index:1000;align-items:center;justify-content:center;">
          <div style="background:var(--bg-2);border-radius:20px;padding:32px;width:100%;max-width:440px;margin:20px;position:relative;">
            <button onclick="App.fecharModalTurma()" style="position:absolute;top:16px;right:16px;background:none;border:none;color:var(--text-2);font-size:20px;cursor:pointer;">✕</button>
            <h3 style="font-family:var(--font-display);font-size:24px;margin-bottom:20px;">Nova Turma</h2>
            <div class="field-group" style="margin-bottom:16px;">
              <label style="font-size:12px;font-weight:600;color:var(--text-2);margin-bottom:6px;display:block;">Nome da turma</label>
              <input id="nova-turma-nome" type="text" placeholder="Ex: Matemática - 3º Ano" maxlength="80" style="width:100%;padding:12px;background:var(--bg-3);border:1px solid var(--border);border-radius:12px;color:var(--text-0);" />
            </div>
            <div class="field-group" style="margin-bottom:20px;">
              <label style="font-size:12px;font-weight:600;color:var(--text-2);margin-bottom:6px;display:block;">Descrição (opcional)</label>
              <textarea id="nova-turma-desc" rows="3" placeholder="Descreva o objetivo da turma..." style="width:100%;padding:12px;background:var(--bg-3);border:1px solid var(--border);border-radius:12px;color:var(--text-0);resize:vertical;"></textarea>
            </div>
            <button class="btn-primary" onclick="App.criarTurma()" style="width:100%;padding:14px;">Criar Turma</button>
          </div>
        </div>
      `;
      document.body.insertAdjacentHTML('beforeend', modalHtml);
      modal = document.getElementById('modal-criar-turma');
    }
    
    const nameInput = document.getElementById('nova-turma-nome');
    const descInput = document.getElementById('nova-turma-desc');
    if (nameInput) nameInput.value = '';
    if (descInput) descInput.value = '';
    
    if (modal) {
      modal.style.display = 'flex';
      setTimeout(() => nameInput?.focus(), 100);
    }
  }

  function fecharModalTurma() {
    const modal = document.getElementById('modal-criar-turma');
    if (modal) modal.style.display = 'none';
  }

  async function criarTurma() {
    const nameInput = document.getElementById('nova-turma-nome');
    if (!nameInput) {
      toast('Formulário não encontrado.', 'error');
      return;
    }
    
    const name = nameInput.value.trim();
    const description = document.getElementById('nova-turma-desc')?.value.trim() || '';
    
    if (!name) {
      toast('Digite um nome para a turma.', 'error');
      return;
    }
    
    const btn = document.querySelector('#modal-criar-turma .btn-primary');
    const originalText = btn?.textContent || 'Criar';
    if (btn) {
      btn.disabled = true;
      btn.textContent = '⏳ Criando...';
    }
    
    try {
      const requestBody = {
        name: name,
        description: description,
        professor_id: state.user?.id,
        professor_name: state.user?.username
      };
      
      const res = await fetch(`${API}/api/turmas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.detail || 'Erro ao criar turma');
      }
      
      toast('✅ Turma criada com sucesso!', 'success');
      fecharModalTurma();
      
      if (data.turma?.code) {
        setTimeout(() => {
          navigator.clipboard.writeText(data.turma.code);
          toast(`📋 Código: ${data.turma.code} (copiado!)`, 'success');
        }, 500);
      }
      
      await loadTurmas();
      
    } catch (e) {
      console.error('Erro ao criar turma:', e);
      toast(e.message, 'error');
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.textContent = originalText;
      }
    }
  }


  function openEntrarTurmaModal() {
    if (!state.user || !state.user.id || state.user.id === "") {
      toast('Sessão inválida. Faça login novamente.', 'error');
      localStorage.removeItem('studysync_user');
      showScreen('login');
      return;
    }
    
    let modal = document.getElementById('modal-entrar-turma');
    if (!modal) {
      const modalHtml = `
        <div id="modal-entrar-turma" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.8);z-index:1000;align-items:center;justify-content:center;">
          <div style="background:var(--bg-2);border-radius:20px;padding:32px;width:100%;max-width:400px;margin:20px;position:relative;">
            <button onclick="App.fecharModalEntrar()" style="position:absolute;top:16px;right:16px;background:none;border:none;color:var(--text-2);font-size:20px;cursor:pointer;">✕</button>
            <h3 style="font-family:var(--font-display);font-size:24px;margin-bottom:8px;">Entrar na Turma</h3>
            <p style="color:var(--text-2);margin-bottom:20px;">Digite o código fornecido pelo professor.</p>
            <input id="codigo-turma" type="text" placeholder="Ex: ABC123" maxlength="10" style="width:100%;padding:14px;background:var(--bg-3);border:1px solid var(--border);border-radius:12px;color:var(--text-0);font-size:18px;text-align:center;letter-spacing:2px;text-transform:uppercase;margin-bottom:16px;" />
            <div id="entrar-turma-err" style="color:#e07060;font-size:13px;margin-bottom:12px;display:none;"></div>
            <button class="btn-primary" onclick="App.entrarTurma()" style="width:100%;padding:14px;">Entrar na Turma</button>
          </div>
        </div>
      `;
      document.body.insertAdjacentHTML('beforeend', modalHtml);
      modal = document.getElementById('modal-entrar-turma');
    }
    
    const input = document.getElementById('codigo-turma');
    if (input) {
      input.value = '';
      input.focus();
    }
    
    const errDiv = document.getElementById('entrar-turma-err');
    if (errDiv) {
      errDiv.style.display = 'none';
      errDiv.textContent = '';
    }
    
    if (modal) {
      modal.style.display = 'flex';
    }
  }

  function fecharModalEntrar() {
    const modal = document.getElementById('modal-entrar-turma');
    if (modal) modal.style.display = 'none';
  }

  async function entrarTurma() {
    let userId = state.user?.id || '';
    if (!userId) {
      const storedUser = localStorage.getItem('studysync_user');
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          userId = parsed?.id || '';
          if (userId && !state.user) {
            state.user = parsed;
          }
        } catch (err) {
          console.error('Erro ao ler usuário do localStorage:', err);
        }
      }
    }

    if (!userId || userId === "") {
      toast('Sessão inválida. Faça login novamente.', 'error');
      localStorage.removeItem('studysync_user');
      showScreen('login');
      return;
    }
    
    const codeInput = document.getElementById('codigo-turma');
    if (!codeInput) {
      toast('Campo de código não encontrado.', 'error');
      return;
    }
    
    const code = codeInput.value.trim().toUpperCase();
    
    if (!code) {
      toast('Digite o código da turma.', 'error');
      return;
    }
    
    const errDiv = document.getElementById('entrar-turma-err');
    if (errDiv) {
      errDiv.style.display = 'none';
      errDiv.textContent = '';
    }
    
    const btn = document.querySelector('#modal-entrar-turma .btn-primary');
    const originalText = btn?.textContent || 'Entrar';
    if (btn) {
      btn.disabled = true;
      btn.textContent = '⏳ Entrando...';
    }
    
    try {
      const requestBody = {
        code: code,
        user_id: userId || "test_user_id"
      };
      console.log('Entrando na turma:', requestBody);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 seconds timeout
      
      const res = await fetch(`${API}/api/turmas/entrar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      const data = await res.json();
      
      if (!res.ok) {
        const message = parseApiError(data.detail || data) || 'Código inválido ou turma não encontrada';
        throw new Error(message);
      }
      
      toast(`✅ Você entrou na turma: ${data.turma?.name || 'Turma' }!`, 'success');
      fecharModalEntrar();
      await loadTurmas();
      
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : parseApiError(e);
      console.error('Erro ao entrar na turma:', e);
      if (errDiv) {
        errDiv.textContent = errMsg;
        errDiv.style.display = 'block';
      }
      toast(errMsg, 'error');
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.textContent = originalText;
      }
    }
  }

  async function abrirTurma(turmaId) {
    if (!state.user || !state.user.id) {
      toast('Sessão inválida. Faça login novamente.', 'error');
      return;
    }
    try {
      const res = await fetch(`${API}/api/turmas/${turmaId}`);
      if (!res.ok) {
        console.error('Erro na resposta da API:', res.status, res.statusText);
        throw new Error(`Erro ao carregar turma: ${res.status} ${res.statusText}`);
      }
      const data = await res.json();
      if (!data.turma) {
        throw new Error('Dados da turma não encontrados na resposta.');
      }
      state.currentTurma = data.turma;
      
      if (!document.getElementById('screen-turma-detail')) {
        const screen = document.createElement('div');
        screen.id = 'screen-turma-detail';
        screen.className = 'screen';
        screen.innerHTML = `
          <header class="app-header">
            <div class="header-brand"><span class="logo-icon small">⬡</span><span class="logo-text small">StudySync</span></div>
            <nav class="header-nav">
              <button class="nav-btn" onclick="App.showRoomsScreen()">Salas</button>
              <button class="nav-btn" onclick="App.showDashboard()">Dashboard</button>
              <button class="nav-btn" onclick="App.showCalendar()">Agenda</button>
              <button class="nav-btn" onclick="App.showRanking()">Ranking</button>
              <button class="nav-btn" onclick="App.showForum()">Fórum</button>
              <button class="nav-btn" onclick="App.showTarefas()">Tarefas</button>
              <button class="nav-btn" onclick="DigitalReader.abrir()">Biblioteca</button>
              <button class="nav-btn" onclick="App.showTurmas()">Turmas</button>
              <button class="nav-btn" onclick="App.toggleMindMap()">Mapa</button>
              <button class="nav-btn" onclick="App.openAIHelp()">Ajuda IA</button>
            </nav>
            <div class="header-user" style="cursor:pointer" onclick="App.showProfile()">
              <div id="turma-detail-avatar" class="user-avatar">🧑</div>
              <span id="turma-detail-name"></span>
            </div>
          </header>
          <main id="turma-detail-container" style="flex:1;overflow-y:auto;padding:32px 48px;max-width:1200px;margin:0 auto;width:100%;"></main>
        `;
        document.body.appendChild(screen);
      }
      
      const _activeTab = document.querySelector('.turma-tab-pill.active')?.dataset?.tab || 'materias';
      renderTurmaDetail();
      showScreen('turma-detail');
      switchTurmaTab(_activeTab);
      showScreen('turma-detail');
    } catch (e) {
      console.error('Erro em abrirTurma:', e);
      toast(`Erro ao abrir turma: ${e.message}`, 'error');
    }
  }

  function renderTurmaDetail() {
    if (!state.currentTurma) return;
    
    const isProfessor = state.user?.role === 'professor' && state.currentTurma.professor_id === state.user?.id;
    const container = document.getElementById('turma-detail-container');
    if (!container) return;
    
    const avatarEl = document.getElementById('turma-detail-avatar');
    const nameEl = document.getElementById('turma-detail-name');
    if (avatarEl && state.user) {
      if (state.profileEmoji !== '🧑') {
        avatarEl.textContent = state.profileEmoji;
      } else {
        const [bg] = avatarColor(state.user.username);
        avatarEl.style.background = bg;
        avatarEl.textContent = state.user.username[0].toUpperCase();
      }
    }
    if (nameEl && state.user) nameEl.textContent = state.user.username;
    
    container.innerHTML = `
      <!-- Hero banner -->
      <div class="turma-hero">
        <div class="turma-hero-top">
          <button class="turma-hero-back" onclick="App.showTurmas()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
            Voltar
          </button>
          <div class="turma-hero-identity">
            <div class="turma-hero-emoji">${state.currentTurma.icon || '🏫'}</div>
            <div class="turma-hero-text">
              <h1>${escHtml(state.currentTurma.name)}</h1>
              <div class="turma-hero-meta">
                <span class="turma-hero-code">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  ${escHtml(state.currentTurma.code)}
                </span>
                <span class="turma-hero-prof">👨‍🏫 ${escHtml(state.currentTurma.professor_name || '—')}</span>
              </div>
            </div>
          </div>
        </div>
        ${isProfessor ? `
          <div class="turma-action-bar">
            <span class="turma-action-bar-label">Adicionar</span>
            <button class="btn-turma-action" onclick="App.openAddMateriaModal()">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Matéria
            </button>
            <button class="btn-turma-action" onclick="App.openAddVideoModal()">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="23 7 16 12 23 17 23 7"/>
                <rect x="1" y="5" width="15" height="14" rx="2"/>
              </svg>
              Vídeo
            </button>
            <button class="btn-turma-action" onclick="App.openAddAvisoModal()">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14,2 14,8 20,8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
              Aviso
            </button>
            <button class="btn-turma-action" onclick="App.openAddExercicioModal()">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 11l3 3L22 4"/>
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
              </svg>
              Exercício
            </button>
            <button class="btn-turma-action" id="btn-chamada-turma" onclick="Chamada && Chamada.abrir(App.getState().currentTurma)" style="background:rgba(122,196,127,0.1);border-color:rgba(122,196,127,0.35);color:#7bc47f;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 11l3 3L22 4"/>
                <rect x="3" y="3" width="18" height="18" rx="2"/>
              </svg>
              📋 Chamada
            </button>
          </div>
        ` : `
          <div class="turma-action-bar">
            <button class="btn-turma-action" id="btn-chamada-turma" onclick="Chamada && Chamada.abrir(App.getState().currentTurma)" style="background:rgba(122,196,127,0.1);border-color:rgba(122,196,127,0.35);color:#7bc47f;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 11l3 3L22 4"/>
                <rect x="3" y="3" width="18" height="18" rx="2"/>
              </svg>
              📋 Ver Chamadas
            </button>
          </div>
        `}
      </div>

    
      <div class="turma-tabs-row">
        <button class="turma-tab-pill active" data-tab="materias" onclick="App.switchTurmaTab('materias')">📚 Matérias</button>
        <button class="turma-tab-pill" data-tab="videos" onclick="App.switchTurmaTab('videos')">🎬 Vídeos</button>
        <button class="turma-tab-pill" data-tab="avisos" onclick="App.switchTurmaTab('avisos')">📢 Avisos</button>
        <button class="turma-tab-pill" data-tab="exercicios" onclick="App.switchTurmaTab('exercicios')">📝 Exercícios</button>
        <button class="turma-tab-pill" data-tab="alunos" onclick="App.switchTurmaTab('alunos')">👥 Alunos</button>
      </div>

      <!-- Tab panels -->
      <div id="turma-tab-materias" class="turma-tab-panel">
        ${renderMateriasTab()}
      </div>
      <div id="turma-tab-videos" class="turma-tab-panel" style="display:none">
        ${renderVideosTab()}
      </div>
      <div id="turma-tab-avisos" class="turma-tab-panel" style="display:none">
        ${renderAvisosTab()}
      </div>
      <div id="turma-tab-exercicios" class="turma-tab-panel" style="display:none">
        ${renderExerciciosTab()}
      </div>
      <div id="turma-tab-alunos" class="turma-tab-panel" style="display:none">
        ${renderAlunosTab()}
      </div>
    `;
  }

  function renderMateriasTab() {
    const materias = state.currentTurma.materias || [];
    if (!materias.length) {
      return `<div class="turma-empty"><div class="turma-empty-icon">📚</div><div>Nenhuma matéria cadastrada ainda.</div></div>`;
    }
    return `
      <div class="materias-grid-new">
        ${materias.map(materia => `
          <div class="materia-card-new">
            <div class="mc-icon">${materia.icon || '📖'}</div>
            <div class="mc-name">${escHtml(materia.name)}</div>
          </div>
        `).join('')}
      </div>
    `;
  }

  function renderVideosTab() {
    const videos = state.currentTurma.videos || [];
    if (!videos.length) {
      return `<div class="turma-empty"><div class="turma-empty-icon">🎬</div><div>Nenhum vídeo-aula disponível.</div></div>`;
    }
    return `
      <div class="videos-grid-new">
        ${videos.map(video => `
          <div class="video-card-new" onclick="App.abrirVideo('${video.id}')">
            <div class="video-thumb-new">
              ${video.type === 'youtube' && video.url
                ? `<img src="https://img.youtube.com/vi/${getYoutubeId(video.url)}/mqdefault.jpg" alt="${escHtml(video.title)}">`
                : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:36px;opacity:0.4;">🎬</div>`
              }
              <div class="video-play-overlay">
                <div class="video-play-btn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--bg-0)"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                </div>
              </div>
            </div>
            <div class="video-info-new">
              <div class="video-title-new">${escHtml(video.title)}</div>
              ${video.description ? `<div class="video-desc-new">${escHtml(video.description)}</div>` : ''}
              <div class="video-date-new">📅 ${new Date(video.createdAt).toLocaleDateString('pt-BR')}</div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  function renderAvisosTab() {
    const avisos = state.currentTurma.avisos || [];
    if (!avisos.length) {
      return `<div class="turma-empty"><div class="turma-empty-icon">📢</div><div>Nenhum aviso publicado ainda.</div></div>`;
    }
    return `
      <div class="avisos-list-new">
        ${avisos.map(aviso => `
          <div class="aviso-card-new">
            <div class="aviso-header-new">
              <div class="aviso-title-new">${escHtml(aviso.title)}</div>
              <div class="aviso-date-new">📅 ${new Date(aviso.createdAt).toLocaleDateString('pt-BR')}</div>
            </div>
            <div class="aviso-content-new">${escHtml(aviso.content)}</div>
          </div>
        `).join('')}
      </div>
    `;
  }

  function renderExerciciosTab() {
    const exercicios = state.currentTurma.exercicios || [];
    if (!exercicios.length) {
      return `<div class="turma-empty"><div class="turma-empty-icon">📝</div><div>Nenhum exercício disponível ainda.</div></div>`;
    }
    return `
      <div class="exercicios-list-new">
        ${exercicios.map((exercicio, i) => `
          <div class="exercicio-card-new">
            <div class="exercicio-num">${i + 1}</div>
            <div class="exercicio-body">
              <div class="exercicio-title-new">${escHtml(exercicio.title)}</div>
              ${exercicio.description ? `<div class="exercicio-desc-new">${escHtml(exercicio.description)}</div>` : ''}
              <div class="exercicio-date-new">📅 ${new Date(exercicio.createdAt).toLocaleDateString('pt-BR')}</div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  function getYoutubeId(url) {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2]?.length === 11) ? match[2] : null;
  }

  function renderAlunosTab() {
    const alunos = state.currentTurma.students || [];
    const isProfessor = state.user?.role === 'professor' && state.currentTurma.professor_id === state.user?.id;

    if (!alunos.length) {
      return `<div class="turma-empty">
        <div class="turma-empty-icon">👥</div>
        <div>${isProfessor
          ? `Nenhum aluno matriculado ainda. Compartilhe o código <strong>${escHtml(state.currentTurma.code)}</strong> com seus alunos.`
          : 'Nenhum aluno matriculado ainda.'}</div>
      </div>`;
    }

    return `
      <div class="alunos-count-badge">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        ${alunos.length} aluno${alunos.length !== 1 ? 's' : ''} matriculado${alunos.length !== 1 ? 's' : ''}
      </div>
      <div class="alunos-grid-new">
        ${alunos.map(aluno => `
          <div class="aluno-card-new" onclick="App.showUserProfile('${aluno.id}')" title="Ver perfil de ${escHtml(aluno.username || 'Aluno')}">
            <div class="aluno-avatar-new">${escHtml((aluno.username || 'A')[0].toUpperCase())}</div>
            <div class="aluno-info-new">
              <div class="aluno-name-new">${escHtml(aluno.username || 'Aluno')}</div>
              ${aluno.joinedAt ? `<div class="aluno-joined-new">Entrou ${new Date(aluno.joinedAt).toLocaleDateString('pt-BR')}</div>` : ''}
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  function openAddMateriaModal() {
    const name = prompt('Digite o nome da matéria:');
    if (!name || !name.trim()) return;
    
    fetch(`${API}/api/turmas/${state.currentTurma.id}/materias`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim() })
    })
    .then(res => res.json())
    .then(() => {
      toast('✅ Matéria adicionada!', 'success');
      abrirTurma(state.currentTurma.id);
    })
    .catch(() => toast('Erro ao adicionar matéria.', 'error'));
  }

  function openAddExercicioModal() {
    if (typeof ExSys !== 'undefined') {
      ExSys.openCreateExercicio();
    } else {
      console.warn('ExSys não carregado. Verifique se exercicio-system.js está incluído no HTML.');
      toast('Sistema de exercícios não carregado.', 'error');
    }
  }

  function openAddAvisoModal() {
    if (typeof ExSys !== 'undefined') {
      ExSys.openCreateAviso();
    } else {
      toast('Sistema não carregado.', 'error');
    }
  }

  function openAddExercicioModal() {
    if (typeof ExSys !== 'undefined') {
      ExSys.openCreateExercicio(state.currentTurma?.id);
    } else {
      toast('Sistema de exercícios não carregado.', 'error');
    }
  }

  function openAddVideoModal() {
    let modal = document.getElementById('modal-add-video');
    
    if (!modal) {
      const modalHtml = `
        <div id="modal-add-video" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.8);z-index:1000;align-items:center;justify-content:center;">
          <div style="background:var(--bg-2);border-radius:20px;padding:32px;width:100%;max-width:480px;margin:20px;position:relative;">
            <button onclick="App.fecharModalVideo()" style="position:absolute;top:16px;right:16px;background:none;border:none;color:var(--text-2);font-size:20px;cursor:pointer;">✕</button>
            <h3 style="font-family:var(--font-display);font-size:24px;margin-bottom:20px;">Adicionar Vídeo-Aula</h3>
            
            <div style="display:flex;gap:8px;margin-bottom:20px;">
              <button id="tab-link" class="btn-secondary" style="flex:1;" onclick="App.setVideoTab('link')">🔗 Link (YouTube)</button>
              <button id="tab-upload" class="btn-secondary" style="flex:1;" onclick="App.setVideoTab('upload')">📁 Upload</button>
            </div>
            
            <div id="video-link-field">
              <div class="field-group" style="margin-bottom:16px;">
                <label style="font-size:12px;font-weight:600;color:var(--text-2);margin-bottom:6px;display:block;">URL do vídeo</label>
                <input id="video-url" type="text" placeholder="https://youtube.com/watch?v=..." style="width:100%;padding:12px;background:var(--bg-3);border:1px solid var(--border);border-radius:12px;color:var(--text-0);" />
              </div>
            </div>
            
            <div id="video-upload-field" style="display:none;">
              <div class="field-group" style="margin-bottom:16px;">
                <label style="font-size:12px;font-weight:600;color:var(--text-2);margin-bottom:6px;display:block;">Arquivo de vídeo</label>
                <input type="file" id="video-file" accept="video/*" style="width:100%;padding:12px;background:var(--bg-3);border:1px solid var(--border);border-radius:12px;color:var(--text-0);" />
              </div>
            </div>
            
            <div class="field-group" style="margin-bottom:16px;">
              <label style="font-size:12px;font-weight:600;color:var(--text-2);margin-bottom:6px;display:block;">Título</label>
              <input id="video-titulo" type="text" placeholder="Título da aula" style="width:100%;padding:12px;background:var(--bg-3);border:1px solid var(--border);border-radius:12px;color:var(--text-0);" />
            </div>
            
            <div class="field-group" style="margin-bottom:20px;">
              <label style="font-size:12px;font-weight:600;color:var(--text-2);margin-bottom:6px;display:block;">Descrição (opcional)</label>
              <input id="video-desc" type="text" placeholder="Sobre este vídeo..." style="width:100%;padding:12px;background:var(--bg-3);border:1px solid var(--border);border-radius:12px;color:var(--text-0);" />
            </div>
            
            <div id="video-err" style="color:#e07060;font-size:13px;margin-bottom:12px;display:none;"></div>
            
            <button class="btn-primary" onclick="App.salvarVideo()" style="width:100%;padding:14px;">Publicar Vídeo-Aula</button>
          </div>
        </div>
      `;
      document.body.insertAdjacentHTML('beforeend', modalHtml);
      modal = document.getElementById('modal-add-video');
    }
    
    const linkField = document.getElementById('video-link-field');
    const uploadField = document.getElementById('video-upload-field');
    const tabLink = document.getElementById('tab-link');
    const tabUpload = document.getElementById('tab-upload');
    
    if (linkField) linkField.style.display = 'block';
    if (uploadField) uploadField.style.display = 'none';
    if (tabLink) {
      tabLink.style.background = 'var(--accent)';
      tabLink.style.color = 'var(--bg-0)';
    }
    if (tabUpload) {
      tabUpload.style.background = 'transparent';
      tabUpload.style.color = 'var(--text-2)';
    }
    
    const titleInput = document.getElementById('video-titulo');
    const descInput = document.getElementById('video-desc');
    const urlInput = document.getElementById('video-url');
    const fileInput = document.getElementById('video-file');
    const errDiv = document.getElementById('video-err');
    
    if (titleInput) titleInput.value = '';
    if (descInput) descInput.value = '';
    if (urlInput) urlInput.value = '';
    if (fileInput) fileInput.value = '';
    if (errDiv) {
      errDiv.style.display = 'none';
      errDiv.textContent = '';
    }
    
    if (modal) {
      modal.style.display = 'flex';
      setTimeout(() => titleInput?.focus(), 100);
    }
  }

  function setVideoTab(tab) {
    const linkField = document.getElementById('video-link-field');
    const uploadField = document.getElementById('video-upload-field');
    const tabLink = document.getElementById('tab-link');
    const tabUpload = document.getElementById('tab-upload');
    
    if (tab === 'link') {
      if (linkField) linkField.style.display = 'block';
      if (uploadField) uploadField.style.display = 'none';
      if (tabLink) {
        tabLink.style.background = 'var(--accent)';
        tabLink.style.color = 'var(--bg-0)';
      }
      if (tabUpload) {
        tabUpload.style.background = 'transparent';
        tabUpload.style.color = 'var(--text-2)';
      }
    } else {
      if (linkField) linkField.style.display = 'none';
      if (uploadField) uploadField.style.display = 'block';
      if (tabLink) {
        tabLink.style.background = 'transparent';
        tabLink.style.color = 'var(--text-2)';
      }
      if (tabUpload) {
        tabUpload.style.background = 'var(--accent)';
        tabUpload.style.color = 'var(--bg-0)';
      }
    }
  }

  function fecharModalVideo() {
    const modal = document.getElementById('modal-add-video');
    if (modal) modal.style.display = 'none';
  }

  async function salvarVideo() {
    const title = document.getElementById('video-titulo')?.value.trim();
    const description = document.getElementById('video-desc')?.value.trim();
    const isLink = document.getElementById('video-link-field')?.style.display !== 'none';
    
    if (!title) {
      toast('Digite um título para o vídeo.', 'error');
      return;
    }
    
    const errDiv = document.getElementById('video-err');
    if (errDiv) {
      errDiv.style.display = 'none';
      errDiv.textContent = '';
    }
    
    const btn = document.querySelector('#modal-add-video .btn-primary');
    const originalText = btn?.textContent || 'Publicar';
    if (btn) {
      btn.disabled = true;
      btn.textContent = '⏳ Publicando...';
    }
    
    try {
      let videoData;
      
      if (isLink) {
        const url = document.getElementById('video-url')?.value.trim();
        if (!url) {
          throw new Error('Digite a URL do vídeo.');
        }
        videoData = { title, description, url, type: 'youtube' };
      } else {
        const fileInput = document.getElementById('video-file');
        const file = fileInput?.files[0];
        if (!file) {
          throw new Error('Selecione um arquivo de vídeo.');
        }
        if (file.size > 100 * 1024 * 1024) {
          throw new Error('Arquivo muito grande (máx 100MB).');
        }
        
        const reader = new FileReader();
        const fileData = await new Promise((resolve) => {
          reader.onload = (e) => resolve(e.target.result);
          reader.readAsDataURL(file);
        });
        
        videoData = {
          title,
          description,
          fileData,
          fileName: file.name,
          type: 'upload',
          mimeType: file.type
        };
      }
      
      const res = await fetch(`${API}/api/turmas/${state.currentTurma.id}/videos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(videoData)
      });
      
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Erro ao adicionar vídeo');
      }
      
      toast('✅ Vídeo adicionado com sucesso!', 'success');
      fecharModalVideo();
      abrirTurma(state.currentTurma.id);
      
    } catch (e) {
      if (errDiv) {
        errDiv.textContent = e.message;
        errDiv.style.display = 'block';
      }
      toast(e.message, 'error');
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.textContent = originalText;
      }
    }
  }

  function abrirVideo(videoId) {
    const video = state.currentTurma.videos?.find(v => v.id === videoId);
    if (!video) return;
    
    if (video.type === 'youtube' && video.url) {
      window.open(video.url, '_blank');
    } else if (video.fileData) {
      const win = window.open();
      win.document.write(`
        <html>
          <head><title>${video.title}</title></head>
          <body style="margin:0;display:flex;justify-content:center;align-items:center;min-height:100vh;background:#000;">
            <video controls autoplay style="max-width:100%;max-height:100vh;">
              <source src="${video.fileData}" type="${video.mimeType || 'video/mp4'}">
            </video>
          </body>
        </html>
      `);
    }
  }

  async function showProfessorDashboard(turmaId) {
    try {
      const res = await fetch(`${API}/api/turmas/${turmaId}/student-stats`);
      const data = await res.json();
      
      const html = `
        <h2 class="modal-title">📊 Acompanhamento de Alunos</h2>
        <div style="overflow-x: auto;">
          <table style="width:100%; border-collapse: collapse; font-size:13px;">
            <thead>
              <tr style="text-align:left; border-bottom: 2px solid var(--border);">
                <th style="padding:10px;">Estudante</th>
                <th style="padding:10px;">Total</th>
                <th style="padding:10px;">Hoje</th>
                <th style="padding:10px;">Streak</th>
                <th style="padding:10px;">Sessões</th>
              </tr>
            </thead>
            <tbody>
              ${data.students.map(s => `
                <tr style="border-bottom: 1px solid var(--border-subtle);">
                  <td style="padding:10px; font-weight:600;">${escHtml(s.username)}</td>
                  <td style="padding:10px;">${s.stats.total_hours}h</td>
                  <td style="padding:10px;">${s.stats.today_minutes}m</td>
                  <td style="padding:10px;">${s.stats.streak_days}d 🔥</td>
                  <td style="padding:10px;">${s.stats.total_sessions}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        <button class="btn-secondary" onclick="App.closeModal()" style="margin-top:20px; width:100%;">Fechar</button>
      `;
      openModal(html);
    } catch (e) {
      toast('Erro ao carregar relatório de alunos.', 'error');
    }
  }

  function switchTurmaTab(tab) {
    document.querySelectorAll('.turma-tab-pill').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.turma-tab-panel').forEach(content => content.style.display = 'none');
    
    const activeBtn = document.querySelector(`.turma-tab-pill[data-tab="${tab}"]`);
    if (activeBtn) activeBtn.classList.add('active');
    
    const activeContent = document.getElementById(`turma-tab-${tab}`);
    if (activeContent) activeContent.style.display = 'block';
    
    if (tab === 'avisos' && typeof ExSys !== 'undefined') {
      ExSys.renderAvisosTabContent();
    } else if (tab === 'exercicios' && typeof ExSys !== 'undefined') {
      ExSys.renderExerciciosTabContent(state.currentTurma?.id);
    }
  }


  document.addEventListener('click', e => {
    if (state.notifOpen && !e.target.closest('#notif-panel') && !e.target.closest('.notif-bell')) {
      state.notifOpen = false;
      document.getElementById('notif-panel')?.classList.remove('open');
    }
    if (!e.target.closest('#profile-avatar-lg') && !e.target.closest('#profile-emoji-picker')) {
      document.getElementById('profile-emoji-picker')?.classList.remove('open');
    }
  });

  window.addEventListener('resize', () => {
    if (callWbState.active) initCallCanvas();
  });


  function init() {
    const style = document.createElement('style');
    style.textContent = `
      .prejoin-container { display: flex; flex-direction: column; align-items: center; width: 100%; max-width: 400px; margin: 0 auto; }
      .prejoin-preview-box { 
        position: relative; width: 100%; aspect-ratio: 16/9; background: #000; border-radius: 12px; overflow: hidden; 
        display: flex; align-items: center; justify-content: center; border: 1px solid var(--border);
      }
      .prejoin-video { width: 100%; height: 100%; object-fit: cover; }
      .prejoin-avatar { 
        width: 80px; height: 80px; border-radius: 50%; display: flex; align-items: center; 
        justify-content: center; font-size: 32px; font-weight: bold; color: var(--bg-0);
      }
      .prejoin-controls { 
        position: absolute; bottom: 16px; left: 0; right: 0; display: flex; justify-content: center; gap: 12px; 
      }
      .prejoin-btn {
        width: 42px; height: 42px; border-radius: 50%; border: none; background: rgba(255,255,255,0.2);
        color: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center;
        transition: all 0.2s; backdrop-filter: blur(4px);
      }
      .prejoin-btn:hover { background: rgba(255,255,255,0.3); transform: scale(1.05); }
      .prejoin-btn.disabled { background: #e07060; color: #fff; }
    `;
  
    style.textContent += `
      #modal-overlay.active { backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); }
    `;
    document.head.appendChild(style);

    const storedUser = localStorage.getItem('studysync_user');
    if (storedUser) {
      try {
        const u = JSON.parse(storedUser);
        if (u && u.id && u.id !== "") {
          loginWithUser(u);
          return;
        }
      } catch (e) {
        console.error('Erro ao carregar usuário do localStorage:', e);
      }
    }
    showScreen('login');
  }

  return {
    state,
    getState: () => state,
    init,
    loginWithUser,
    logout,
    showRoomsScreen, showDashboard, showCalendar, showProfile, showRanking, showForum, showTarefas, showTurmas,
    joinRoom, leaveRoom, filterRooms, openCreateRoom, createRoom,
    sendMessage, handleChatKey, autoResize, openImageInput, sendImage, chatAskAI,
    startFocus, stopFocus,
    toggleCall, toggleMic, toggleCam, toggleScreenShare, toggleCallMinimize,
    selectCalDay, calPrev, calNext, openAddEvent, saveEvent, deleteEvent,
    openModal, closeModal, toast,
    toggleWhiteboard, wbSetTool, wbSetColor, wbSetSize,
    wbPointerDown, wbPointerMove, wbPointerUp, wbClear, wbUndo, wbRedo, wbDownload,
    toggleFlashcards, switchFcTab, fcFlip, fcNext, fcPrev, fcAdd, fcDelete,
    quizAnswer, startQuiz,
    toggleNotifPanel, clearNotifs,
    toggleBioEdit, toggleEmojiPicker, setProfileEmoji, toggleTheme,
    addFriend, addFriendByName, removeFriend,
    copyFriendId, sendFriendInvite, acceptInvite, declineInvite,
    switchRankTab,
    toggleDoc, docInput, docKeyDown, docExecCmd, docSetFont,
    docToggleBold, docToggleItalic, docToggleUnderline, docToggleStrike,
    docToggleUL, docToggleOL, docSetColor, docAlign,
    docHighlight, docClearHighlight, docPickColor, docPickHighlight, docInsertImage, docPrint, docRemoveFormat,
    docUndo, docRedo, docClear, docCopy, docExportTxt,
    docUpdateToolbarState,
    toggleCallWb, callWbSetTool, callWbSetColor, callWbSetSize,
    callWbDown, callWbMove, callWbUp, callWbClear, callWbUndo,
    forumShowList, forumShowNew, forumShowDetail,
    forumFilter, forumSort, forumSubmitQuestion,
    forumUpvote, forumSubmitAnswer, forumMarkBest,
    tarefasSetFilter, tarefasSetSort, tarefasSearch,
    tarefasOpenAdd, tarefasCloseAdd, tarefasAddKey, tarefasSubmit,
    tarefasToggle, tarefasDelete, tarefasOpenEdit, tarefasCloseEdit, tarefasSaveEdit,
    tarefasSwitchMode,
    kanbanDragOver, kanbanDragLeave, kanbanDrop,
    kanbanOpenAdd, kanbanOpenEdit, kanbanCloseModal, kanbanSaveCard, kanbanDeleteCard,
    uploadFile, downloadFile, deleteFile, openFileInPdf,
    togglePinBoard, addPin, deletePin, selectPinColor, onMuralClick, updatePinContent, clearPins,
    toggleMindMap, addNode, deleteNode, selectNodeColor, onMindMapClick, updateNodeContent, clearNodes, setNodeShape, toggleNodeLinkMode,
    openAIHelp, askAI,
    editDailyNote, saveDailyNote,
    toggleCodeEditor, codeInput, codeKeyDown, codeSyncScroll, codeChangeLanguage,
    codeRun, codeCopy, codeClear, codeConsoleClear, codeConsoleAddLine,
    togglePdfReader, pdfLoadFile, pdfNextPage, pdfPrevPage, pdfZoomIn, pdfZoomOut, pdfChangePdf,
    toggleTranslator, translatorTranslate, translatorOnInput, translatorSwap,
    translatorClear, translatorCopy,
   
    showTurmas,
    loadTurmas,
    abrirTurma,
    openPreJoinModal,
    openCriarTurmaModal,
    fecharModalTurma,
    criarTurma,
    openEntrarTurmaModal,
    fecharModalEntrar,
    entrarTurma,
    copyTurmaCode,
    openAddVideoModal,
    setVideoTab,
    fecharModalVideo,
    salvarVideo,
    openAddMateriaModal,
    openAddAvisoModal,
    openAddExercicioModal,
    abrirVideo,
    switchTurmaTab,
    showUserProfile,
    openPrivateChat,
    closePrivateChat,
    sendPrivateMessage,
    handlePrivateChatKey,
    openRecentChatsModal,
    startChatWithFriend,
    openFlashcardsReview,
    submitSrsReview,
    toggleReaction, pickReactionEmoji, openEmojiPicker,
    exportDashboardData,
    exportMonthlyReportPDF, updateSubjectGoal, saveSubjectGoals, pickSubject, pickSubjectCustom,
    generateAIQuizFromDoc
  };
})();


window.App = App;

document.addEventListener('DOMContentLoaded', () => App.init());