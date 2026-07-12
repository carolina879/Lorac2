const DigitalReader = (() => {
  const MODAL_ID = 'digital-reader-modal';
  const PDFJS_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
  const PDFJS_WORKER_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  const EPUBJS_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/epub.js/0.3.93/epub.min.js';

  const LIBRARY_KEY = 'dr_library';
  const DB_NAME = 'dr-books-db';
  const DB_STORE = 'files';

  function _openFilesDB() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => {
        if (!req.result.objectStoreNames.contains(DB_STORE)) {
          req.result.createObjectStore(DB_STORE, { keyPath: 'id' });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async function _dbSaveFile(id, file) {
    if (!id || !file) return;
    const db = await _openFilesDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(DB_STORE, 'readwrite');
      tx.objectStore(DB_STORE).put({ id, blob: file, name: file.name, type: file.type });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async function _dbGetFile(id) {
    const db = await _openFilesDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(DB_STORE, 'readonly');
      const req = tx.objectStore(DB_STORE).get(id);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  }

  let _state = {
    book: null,
    currentPage: 0,
    totalPages: 0,
    readerMode: 'default',
    pageColor: null,
    fontSize: 16,
    fontFamily: 'var(--font-body)',
    brightness: 100,
    zoom: 1,
    fullscreen: false,
    highlights: {},
    notes: {},
    bookmarks: {},
    readerInstance: null,
    fileType: null,
    loading: false,
    pageTurning: false,
    turnAnimation: 'slide',
    estimatedTime: '—',
    readingSpeed: 200,
    lastReadTime: Date.now(),
    timerDuration: 0,
    timerRemaining: 0,
    timerRunning: false,
    timerInterval: null,
  };

  function _esc(str) {
    return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function _toast(msg, type = 'info') {
    if (typeof App !== 'undefined' && App.toast) {
      App.toast(msg, type);
    } else {
      console.log(`[Toast ${type.toUpperCase()}]: ${msg}`);
    }
  }

  function _loadScript(src) {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function _loadStyle(href) {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`link[href="${href}"]`)) {
        resolve();
        return;
      }
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      link.onload = resolve;
      link.onerror = reject;
      document.head.appendChild(link);
    });
  }

  function _renderModalShell() {
    return `
      <div id="${MODAL_ID}" class="dr-overlay">
        <div class="dr-modal">
          <div class="dr-header">
            <div class="dr-header-left">
              <button class="dr-btn-icon" onclick="DigitalReader.fechar()">✕</button>
              <span class="dr-book-title" id="dr-book-title"></span>
            </div>
            <div class="dr-header-right">
              <button class="dr-btn-icon" onclick="DigitalReader.abrirBiblioteca()" title="Biblioteca">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
              </button>
              <button class="dr-btn-icon" onclick="DigitalReader.toggleFullscreen()">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3m-18 0v3a2 2 0 0 0 2 2h3"/></svg>
              </button>
              <button class="dr-btn-icon" onclick="DigitalReader.toggleSidebar('settings')">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V15h.09z"/></svg>
              </button>
              <button class="dr-btn-icon" onclick="DigitalReader.toggleSidebar('ai')">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
              </button>
            </div>

          </div>
          <div class="dr-content-area">
            <button class="dr-nav-arrow dr-nav-arrow-left" onclick="event.stopPropagation(); DigitalReader._turnPage('prev')" title="Página anterior">‹</button>
            <button class="dr-nav-arrow dr-nav-arrow-right" onclick="event.stopPropagation(); DigitalReader._turnPage('next')" title="Próxima página">›</button>
            <div class="dr-page-container" id="dr-page-left"></div>
            <div class="dr-page-container" id="dr-page-right"></div>
            <div class="dr-page-turn-overlay dr-page-turn-left" id="dr-page-turn-left"></div>
            <div class="dr-page-turn-overlay dr-page-turn-right" id="dr-page-turn-right"></div>
            
            <div id="dr-welcome-screen" class="dr-welcome-overlay" style="display:none">
              <div class="dr-welcome-card">
                <div class="dr-welcome-icon">📖</div>
                <h3>Sua Biblioteca Digital</h3>
                <p>Arraste um PDF, EPUB ou arquivo de texto para começar a leitura ou selecione abaixo.</p>
                <button class="dr-welcome-btn" onclick="document.getElementById('dr-upload-input').click()">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  Selecionar Arquivo
                </button>
                <div class="dr-welcome-formats">
                  <span class="dr-format-badge">PDF</span>
                  <span class="dr-format-badge">EPUB</span>
                  <span class="dr-format-badge">TXT</span>
                </div>
                <input type="file" id="dr-upload-input" hidden accept=".pdf,.epub,.txt" onchange="DigitalReader.abrir(this.files[0])">
              </div>
            </div>
          </div>
          <div class="dr-footer">
            <input type="range" class="dr-page-slider" id="dr-page-slider" min="1" value="1" title="Arraste para ir direto a uma página" oninput="DigitalReader.goToPage(this.value)">
            <div class="dr-progress-bar-wrap">
              <div class="dr-progress-bar" id="dr-progress-bar"></div>
            </div>
            <span class="dr-percent-info" id="dr-percent-info">0% lido</span>
            <span class="dr-page-info" id="dr-page-info"></span>
            <span class="dr-time-info" id="dr-time-info"></span>
          </div>
          <div class="dr-sidebar dr-sidebar-settings" id="dr-sidebar-settings">
            <div class="dr-sidebar-header">
              <h3>Configurações de Leitura</h3>
              <button class="dr-btn-icon" onclick="DigitalReader.toggleSidebar('settings')">✕</button>
            </div>
            <div class="dr-sidebar-content">
              <div class="dr-setting-group">
                <h4>Modo de Leitura</h4>
                <div class="dr-option-buttons">
                  <button class="dr-option-btn" data-mode="default" onclick="DigitalReader.setReaderMode('default')">Padrão</button>
                  <button class="dr-option-btn" data-mode="sepia" onclick="DigitalReader.setReaderMode('sepia')">Sépia</button>
                  <button class="dr-option-btn" data-mode="dark" onclick="DigitalReader.setReaderMode('dark')">Escuro</button>
                </div>
              </div>
              <div class="dr-setting-group">
                <h4>Tamanho da Fonte</h4>
                <input type="range" min="12" max="24" value="${_state.fontSize}" oninput="DigitalReader.setFontSize(this.value)">
                <span>${_state.fontSize}px</span>
              </div>
              <div class="dr-setting-group">
                <h4>Fonte</h4>
                <select onchange="DigitalReader.setFontFamily(this.value)">
                  <option value="var(--font-body)">Padrão</option>
                  <option value="serif">Serif</option>
                  <option value="monospace">Monospace</option>
                </select>
              </div>
              <div class="dr-setting-group">
                <h4>Brilho</h4>
                <input type="range" min="50" max="150" value="${_state.brightness}" oninput="DigitalReader.setBrightness(this.value)">
                <span>${_state.brightness}%</span>
              </div>
              <div class="dr-setting-group">
                <h4>Zoom</h4>
                <input type="range" min="0.5" max="2" step="0.1" value="${_state.zoom}" oninput="DigitalReader.setZoom(this.value)">
                <span>${Math.round(_state.zoom * 100)}%</span>
              </div>
              <div class="dr-setting-group">
                <h4>Cor da Página</h4>
                <input type="color" class="dr-color-input" value="${_state.pageColor || '#151210'}" oninput="DigitalReader.setPageColor(this.value)">
              </div>
              <div class="dr-setting-group">
                <h4>Tempo de Leitura</h4>
                <div class="dr-option-buttons">
                  <button class="dr-timer-preset" data-minutes="15" onclick="DigitalReader.setTimerDuration(15)">15min</button>
                  <button class="dr-timer-preset" data-minutes="30" onclick="DigitalReader.setTimerDuration(30)">30min</button>
                  <button class="dr-timer-preset" data-minutes="45" onclick="DigitalReader.setTimerDuration(45)">45min</button>
                  <button class="dr-timer-preset" data-minutes="60" onclick="DigitalReader.setTimerDuration(60)">60min</button>
                </div>
                <div class="dr-timer-controls">
                  <span class="dr-timer-display" id="dr-timer-display">--:--</span>
                  <button class="dr-timer-btn" id="dr-timer-start" onclick="DigitalReader.toggleTimer()">Iniciar</button>
                  <button class="dr-timer-btn" onclick="DigitalReader.resetTimer()">Zerar</button>
                </div>
              </div>
            </div>
          </div>
          <div class="dr-sidebar dr-sidebar-ai" id="dr-sidebar-ai">
            <div class="dr-sidebar-header">
              <h3>IA Educacional</h3>
              <button class="dr-btn-icon" onclick="DigitalReader.toggleSidebar('ai')">✕</button>
            </div>
            <div class="dr-sidebar-content">
              <button class="dr-ai-btn" onclick="DigitalReader.callAI('summarize')">Resumir Página</button>
              <button class="dr-ai-btn" onclick="DigitalReader.callAI('explain')">Explicar Trecho</button>
              <button class="dr-ai-btn" onclick="DigitalReader.callAI('flashcards')">Gerar Flashcards</button>
              <button class="dr-ai-btn" onclick="DigitalReader.callAI('quiz')">Criar Quiz do Capítulo</button>
              <button class="dr-ai-btn" onclick="DigitalReader.callAI('highlights')">Destacar Pontos Importantes</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function _renderLoading() {
    return `
      <div class="dr-loading-overlay">
        <div class="dr-spinner"></div>
        <p>Carregando livro...</p>
      </div>
    `;
  }

  function _updateUI() {
    const modal = document.getElementById(MODAL_ID);
    if (!modal) return;

    document.getElementById('dr-book-title').textContent = _state.book?.title || 'Livro Digital';
    document.getElementById('dr-page-info').textContent = `Página ${_state.currentPage + 1} de ${_state.totalPages}`;
    document.getElementById('dr-time-info').textContent = _computeEstimatedTimeLabel();

    const progress = _state.totalPages > 0 ? Math.min(100, ((_state.currentPage + 1) / _state.totalPages) * 100) : 0;
    const progressBar = document.getElementById('dr-progress-bar');
    if (progressBar) {
      progressBar.style.width = `${progress}%`;
    }
    const percentInfo = document.getElementById('dr-percent-info');
    if (percentInfo) percentInfo.textContent = `${Math.round(progress)}% lido`;

    const pageSlider = document.getElementById('dr-page-slider');
    if (pageSlider) {
      pageSlider.max = Math.max(1, _state.totalPages);
      pageSlider.value = _state.currentPage + 1;
    }

    _updateTimerUI();

    if (!_state.pageColor) {
      modal.classList.remove('dr-mode-default', 'dr-mode-sepia', 'dr-mode-dark', 'dr-mode-custom');
      modal.classList.add(`dr-mode-${_state.readerMode}`);
    }

    modal.style.setProperty('--dr-brightness', `${_state.brightness}%`);

    modal.style.setProperty('--dr-font-size', `${_state.fontSize}px`);

    modal.style.setProperty('--dr-font-family', _state.fontFamily);

    document.getElementById('dr-page-left').style.transform = `scale(${_state.zoom})`;
    document.getElementById('dr-page-right').style.transform = `scale(${_state.zoom})`;

    document.querySelectorAll('.dr-option-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mode === _state.readerMode);
    });
    document.querySelector('input[type="range"][oninput*="setFontSize"]').value = _state.fontSize;
    document.querySelector('input[type="range"][oninput*="setBrightness"]').value = _state.brightness;
    document.querySelector('input[type="range"][oninput*="setZoom"]').value = _state.zoom;
    document.querySelector('select[onchange*="setFontFamily"]').value = _state.fontFamily;
  }

  function _computeEstimatedTimeLabel() {
    if (!_state.book || !_state.totalPages) return '';
    const remainingPages = Math.max(0, _state.totalPages - (_state.currentPage + 1));
    if (remainingPages === 0) return 'Concluído';

    let minutesPerPage;
    if (_state.fileType && _state.fileType.includes('text')) {
      // ~250 palavras por página, na velocidade de leitura configurada (palavras/min)
      minutesPerPage = 250 / (_state.readingSpeed || 200);
    } else {
      minutesPerPage = 1.5; // estimativa média para PDF/EPUB
    }

    const totalMinutes = Math.ceil(remainingPages * minutesPerPage);
    if (totalMinutes < 1) return 'menos de 1min restante';
    if (totalMinutes < 60) return `~${totalMinutes}min restantes`;
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    return mins > 0 ? `~${hours}h ${mins}min restantes` : `~${hours}h restantes`;
  }

  function _setupDropZone() {
    const zone = document.getElementById('dr-welcome-screen');
    if (!zone || zone.dataset.dropReady) return;
    zone.dataset.dropReady = '1';

    ['dragenter', 'dragover'].forEach(evt => {
      zone.addEventListener(evt, (e) => {
        e.preventDefault();
        e.stopPropagation();
        zone.classList.add('dr-dragging');
      });
    });
    ['dragleave', 'drop'].forEach(evt => {
      zone.addEventListener(evt, (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (evt === 'dragleave' && zone.contains(e.relatedTarget)) return;
        zone.classList.remove('dr-dragging');
      });
    });
    zone.addEventListener('drop', (e) => {
      const file = e.dataTransfer?.files?.[0];
      if (file) abrir(file);
    });
  }

  async function abrir(bookFile = null) {
    if (_state.loading) {
      _toast('Já carregando um livro...', 'info');
      return;
    }

    // O botão "Biblioteca" (index.html e app.js) chama abrir() sem arquivo.
    // Nesse caso mostramos a tela da biblioteca (livros lidos/em andamento +
    // opção de carregar um novo) em vez do leitor vazio.
    if (!bookFile) {
      abrirBiblioteca();
      return;
    }

    // Se já existe um modal do leitor no DOM (ex: usuário clicou em "Abrir no
    // Leitor" mais de uma vez, ou abriu o leitor vazio antes), remove-o antes
    // de criar um novo. Sem isso, ficam DOIS elementos com o mesmo ID no DOM,
    // e document.getElementById() sempre pega o primeiro (antigo/vazio) —
    // então o PDF é carregado corretamente, mas atualiza um modal escondido
    // atrás do que está realmente visível na tela.
    const existingModal = document.getElementById(MODAL_ID);
    if (existingModal) existingModal.remove();

    _state.loading = !!bookFile;
    _state.book = {
      id: `book_${Date.now()}`,
      title: bookFile?.name || 'Livro Digital',
      type: bookFile?.type || null,
      data: null,
      currentPage: 0,
      totalPages: 0,
      metadata: {},
    };
    _state.fileType = bookFile?.type || null;
    _dbSaveFile(_state.book.id, bookFile).catch(() => {});

    const modal = document.createElement('div');
    modal.innerHTML = _renderModalShell();
    document.body.appendChild(modal.firstElementChild);
    _injectStyles();
    _setupDropZone();

    if (!bookFile) {
      document.getElementById('dr-welcome-screen').style.display = 'flex';
      _updateUI();
      return;
    }

    // Um livro foi selecionado: garante que a tela de boas-vindas (que pode
    // ter ficado visível de uma abertura anterior sem arquivo) seja escondida,
    // senão ela fica por cima do conteúdo renderizado e parece "não abre nada".
    const welcomeScreen = document.getElementById('dr-welcome-screen');
    if (welcomeScreen) welcomeScreen.style.display = 'none';

    _updateUI();

    // Antes: `modal.innerHTML += _renderLoading()` destruía e recriava todos os
    // elementos filhos do modal. Agora criamos o overlay separadamente e o
    // anexamos, sem tocar no resto do DOM.
    const loadingWrapper = document.createElement('div');
    loadingWrapper.innerHTML = _renderLoading();
    document.getElementById(MODAL_ID).appendChild(loadingWrapper.firstElementChild);

    const removeLoadingOverlay = () => {
      const overlay = document.querySelector('.dr-loading-overlay');
      if (overlay) overlay.remove();
    };

    const showLoadError = (error) => {
      console.error('Erro ao carregar o livro:', error);
      _toast(`Erro ao carregar o livro: ${error.message || error}`, 'error');
      const pageLeftEl = document.getElementById('dr-page-left');
      const pageRightEl = document.getElementById('dr-page-right');
      if (pageLeftEl) {
        pageLeftEl.innerHTML = `
          <div style="text-align:center; padding:20px; color:var(--text-1,#c0b0a0);">
            <p style="font-size:15px; font-weight:600; margin-bottom:8px;">Não foi possível abrir o arquivo</p>
            <p style="font-size:13px; opacity:0.8;">${_esc(error?.message || String(error))}</p>
          </div>
        `;
      }
      if (pageRightEl) pageRightEl.innerHTML = '';
    };

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          _state.book.data = e.target.result;
          await _loadBookContent();
          _state.loading = false;
          removeLoadingOverlay();
          _updateUI();
          _loadProgress();
          await _renderPages();
          _setupPageTurnEvents();
        } catch (error) {
          _state.loading = false;
          removeLoadingOverlay();
          showLoadError(error);
        }
      };
      reader.onerror = () => {
        _state.loading = false;
        removeLoadingOverlay();
        showLoadError(reader.error || new Error('Falha ao ler o arquivo.'));
      };
      reader.readAsArrayBuffer(bookFile);
    } catch (error) {
      _state.loading = false;
      removeLoadingOverlay();
      _toast(`Erro ao ler arquivo: ${error.message}`, 'error');
      console.error('Erro ao ler arquivo:', error);
      showLoadError(error);
    }
  }

  async function _loadBookContent() {
    if (_state.fileType.includes('pdf')) {
      await _loadScript(PDFJS_CDN);
      pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_CDN;
      const pdf = await pdfjsLib.getDocument({ data: _state.book.data }).promise;
      _state.readerInstance = pdf;
      _state.totalPages = pdf.numPages;
    } else if (_state.fileType.includes('epub') || _state.fileType.includes('opf')) {
      await _loadScript(EPUBJS_CDN);
      const book = Epub(_state.book.data);
      _state.readerInstance = book;
      await book.ready;
      const rendition = book.renderTo(document.getElementById('dr-page-left'), {
        width: '100%',
        height: '100%',
        flow: 'paginated',
        manager: 'continuous',
        snap: true,
        spread: 'always',
      });
      await rendition.display();
      _state.totalPages = book.navigation.toc.length;
      _state.readerInstance.rendition = rendition;
      rendition.on('relocated', (location) => {
        const cfi = location.start.cfi;
        const chapterIndex = book.navigation.toc.findIndex(item => cfi.startsWith(item.cfi));
        _state.currentPage = chapterIndex !== -1 ? chapterIndex : 0;
        _saveProgress();
        _updateUI();
      });
    } else if (_state.fileType.includes('text')) {
      const text = new TextDecoder().decode(_state.book.data);
      _state.book.data = text;
      _paginateText(text);
    } else {
      _toast('Formato de arquivo não suportado.', 'error');
      fechar();
    }
  }

  async function _renderPages() {
    if (_state.fileType.includes('pdf')) {
      const pageLeftEl = document.getElementById('dr-page-left');
      const pageRightEl = document.getElementById('dr-page-right');
      pageLeftEl.innerHTML = '';
      pageRightEl.innerHTML = '';

      const renderPdfPage = async (pageNumber, targetElement) => {
        if (pageNumber < 1 || pageNumber > _state.totalPages) return;
        const page = await _state.readerInstance.getPage(pageNumber);

        // Calcula a escala com base no espaço REAL disponível no container.
        // Não confiar em `canvas.style.width/height = '100%'`: dentro de um
        // flex container com align-items:center o item não estica, então a
        // porcentagem não resolve como esperado e o canvas fica pequeno,
        // deixando o fundo escuro do container visível ao redor (parece
        // "tela preta" mesmo com o PDF renderizado corretamente).
        const availableWidth = targetElement.clientWidth || 600;
        const availableHeight = targetElement.clientHeight || 800;
        const padding = 40; // respiro dentro do container
        const baseViewport = page.getViewport({ scale: 1 });
        const scale = Math.min(
          (availableWidth - padding) / baseViewport.width,
          (availableHeight - padding) / baseViewport.height
        );
        const viewport = page.getViewport({ scale: Math.max(scale, 0.1) });

        // Renderiza em resolução mais alta em telas de alta densidade (retina)
        // para o texto não ficar borrado, mas exibe no tamanho calculado acima.
        const dpr = window.devicePixelRatio || 1;
        const canvas = document.createElement('canvas');
        canvas.className = 'dr-pdf-canvas';
        const context = canvas.getContext('2d');
        canvas.width = Math.floor(viewport.width * dpr);
        canvas.height = Math.floor(viewport.height * dpr);
        canvas.style.width = `${Math.floor(viewport.width)}px`;
        canvas.style.height = `${Math.floor(viewport.height)}px`;
        targetElement.appendChild(canvas);

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
          transform: dpr !== 1 ? [dpr, 0, 0, dpr, 0, 0] : undefined,
        };
        await page.render(renderContext).promise;
      };

      await renderPdfPage(_state.currentPage + 1, pageLeftEl);
      if (_state.currentPage + 2 <= _state.totalPages) {
        await renderPdfPage(_state.currentPage + 2, pageRightEl);
      }
    } else if (_state.fileType.includes('epub')) {

    } else if (_state.fileType.includes('text')) {
      const pageLeftEl = document.getElementById('dr-page-left');
      const pageRightEl = document.getElementById('dr-page-right');
      pageLeftEl.innerHTML = `<div class="dr-text-page">${_state.book.data.pages[_state.currentPage]}</div>`;
      pageRightEl.innerHTML = `<div class="dr-text-page">${_state.book.data.pages[_state.currentPage + 1] || ''}</div>`;
    }
    _updateUI();
    _saveProgress();
  }

  function _paginateText(text) {
    const words = text.split(/\s+/);
    const pages = [];
    let currentPageWords = [];
    let currentPageLength = 0;
    const maxPageLength = 1500;

    words.forEach(word => {
      if (currentPageLength + word.length + 1 > maxPageLength) {
        pages.push(currentPageWords.join(' '));
        currentPageWords = [word];
        currentPageLength = word.length;
      } else {
        currentPageWords.push(word);
        currentPageLength += word.length + 1;
      }
    });
    if (currentPageWords.length > 0) {
      pages.push(currentPageWords.join(' '));
    }
    _state.book.data = { text: text, pages: pages };
    _state.totalPages = pages.length;
    _state.estimatedTime = Math.ceil(words.length / _state.readingSpeed);
  }

  function _setupPageTurnEvents() {
    const contentArea = document.querySelector('.dr-content-area');
    if (!contentArea) return;

    let startX = 0;
    let isDragging = false;

    const handlePageTurn = (direction) => {
      if (_state.pageTurning) return;
      _state.pageTurning = true;
      _playSound('page_turn');

      const pageLeft = document.getElementById('dr-page-left');
      const pageRight = document.getElementById('dr-page-right');

      if (direction === 'next') {
        if (_state.currentPage + 2 >= _state.totalPages) {
          _state.pageTurning = false;
          return;
        }
        pageLeft.classList.add('dr-page-turn-left-anim');
        pageRight.classList.add('dr-page-turn-right-anim');
      } else {
        if (_state.currentPage === 0) {
          _state.pageTurning = false;
          return;
        }
        pageLeft.classList.add('dr-page-turn-left-anim-reverse');
        pageRight.classList.add('dr-page-turn-right-anim-reverse');
      }

      const onAnimationEnd = () => {
        pageLeft.classList.remove('dr-page-turn-left-anim', 'dr-page-turn-left-anim-reverse');
        pageRight.classList.remove('dr-page-turn-right-anim', 'dr-page-turn-right-anim-reverse');
        if (direction === 'next') {
          _state.currentPage += 2;
        } else {
          _state.currentPage -= 2;
        }
        _renderPages();
        _state.pageTurning = false;
        pageLeft.removeEventListener('animationend', onAnimationEnd);
        pageRight.removeEventListener('animationend', onAnimationEnd);
      };

      pageLeft.addEventListener('animationend', onAnimationEnd);
      pageRight.addEventListener('animationend', onAnimationEnd);
    };

    contentArea.addEventListener('click', (e) => {
      if (_state.pageTurning) return;
      const rect = contentArea.getBoundingClientRect();
      if (e.clientX < rect.left + rect.width / 2) {
        _turnPage('prev');
      } else {
        _turnPage('next');
      }
    });

    contentArea.addEventListener('mousedown', (e) => {
      if (_state.pageTurning) return;
      isDragging = true;
      startX = e.clientX;
      contentArea.style.cursor = 'grabbing';
    });

    contentArea.addEventListener('mousemove', (e) => {
      if (!isDragging || _state.pageTurning) return;
      const diffX = e.clientX - startX;
    });

    contentArea.addEventListener('mouseup', (e) => {
      if (!isDragging || _state.pageTurning) return;
      isDragging = false;
      contentArea.style.cursor = 'grab';
      const diffX = e.clientX - startX;
      if (Math.abs(diffX) > 50) {
        if (diffX > 0) {
          _turnPage('prev');
        } else {
          _turnPage('next');
        }
      }
    });

    contentArea.addEventListener('mouseleave', () => {
      isDragging = false;
      contentArea.style.cursor = 'grab';
    });

    contentArea.addEventListener('touchstart', (e) => {
      if (_state.pageTurning) return;
      isDragging = true;
      startX = e.touches[0].clientX;
    }, { passive: true });

    contentArea.addEventListener('touchmove', (e) => {
      if (!isDragging || _state.pageTurning) return;
      if (Math.abs(e.touches[0].clientX - startX) > 10) {
        e.preventDefault();
      }
    }, { passive: false });

    contentArea.addEventListener('touchend', (e) => {
      if (!isDragging || _state.pageTurning) return;
      isDragging = false;
      const diffX = e.changedTouches[0].clientX - startX;
      if (Math.abs(diffX) > 50) {
        if (diffX > 0) {
          _turnPage('prev');
        } else {
          _turnPage('next');
        }
      }
    });
  }

  function _turnPage(direction) {
    if (_state.fileType.includes('epub')) {
      if (direction === 'next') {
        _state.readerInstance.rendition.next();
      } else {
        _state.readerInstance.rendition.prev();
      }
      _playSound('page_turn');
      return;
    }

    if (_state.pageTurning) return;
    _state.pageTurning = true;
    _playSound('page_turn');

    const pageLeftEl = document.getElementById('dr-page-left');
    const pageRightEl = document.getElementById('dr-page-right');
    const turnLeftOverlay = document.getElementById('dr-page-turn-left');
    const turnRightOverlay = document.getElementById('dr-page-turn-right');

    const onAnimationEnd = () => {
      pageLeftEl.classList.remove('dr-page-turn-anim-left', 'dr-page-turn-anim-left-reverse');
      pageRightEl.classList.remove('dr-page-turn-anim-right', 'dr-page-turn-anim-right-reverse');
      turnLeftOverlay.classList.remove('dr-page-turn-overlay-active');
      turnRightOverlay.classList.remove('dr-page-turn-overlay-active');

      if (direction === 'next') {
        _state.currentPage += 2;
      } else {
        _state.currentPage -= 2;
      }
      _state.currentPage = Math.max(0, Math.min(_state.currentPage, _state.totalPages - (_state.totalPages % 2 === 0 ? 2 : 1)));
      _renderPages();
      _state.pageTurning = false;

      pageLeftEl.removeEventListener('animationend', onAnimationEnd);
      pageRightEl.removeEventListener('animationend', onAnimationEnd);
    };

    pageLeftEl.addEventListener('animationend', onAnimationEnd);
    pageRightEl.addEventListener('animationend', onAnimationEnd);

    if (direction === 'next') {
      if (_state.currentPage + 2 >= _state.totalPages) {
        _state.pageTurning = false;
        return;
      }
      pageLeftEl.classList.add('dr-page-turn-anim-left');
      pageRightEl.classList.add('dr-page-turn-anim-right');
      turnRightOverlay.classList.add('dr-page-turn-overlay-active');
    } else {
      if (_state.currentPage === 0) {
        _state.pageTurning = false;
        return;
      }
      pageLeftEl.classList.add('dr-page-turn-anim-left-reverse');
      pageRightEl.classList.add('dr-page-turn-anim-right-reverse');
      turnLeftOverlay.classList.add('dr-page-turn-overlay-active');
    }
  }

  function _saveProgress() {
    if (!_state.book || !_state.book.id) return;
    const progress = {
      currentPage: _state.currentPage,
      timestamp: Date.now(),
    };
    localStorage.setItem(`dr_progress_${_state.book.id}`, JSON.stringify(progress));
    _updateLibraryEntry({ id: _state.book.id, title: _state.book.title, totalPages: _state.totalPages, currentPage: _state.currentPage });
  }

  function _loadProgress() {
    if (!_state.book || !_state.book.id) return;
    const savedProgress = localStorage.getItem(`dr_progress_${_state.book.id}`);
    if (savedProgress) {
      const progress = JSON.parse(savedProgress);
      _state.currentPage = progress.currentPage;
    }
  }

  function _playSound(effect) {
    const audio = new Audio();
    if (effect === 'page_turn') {
      audio.src = 'https://assets.mixkit.co/sfx/preview/mixkit-page-turn-1100.mp3';
      audio.volume = 0.3;
    }
    audio.play().catch(() => {});
  }

  function fechar() {
    _saveProgress();
    _stopTimer();
    const bookRead = _state.book ? { ..._state.book, totalPages: _state.totalPages, currentPage: _state.currentPage } : null;
    const modal = document.getElementById(MODAL_ID);
    if (modal) modal.remove();
    _state = {
      book: null, currentPage: 0, totalPages: 0, readerMode: 'default', pageColor: null,
      fontSize: 16, fontFamily: 'var(--font-body)', brightness: 100, zoom: 1,
      fullscreen: false, highlights: {}, notes: {}, bookmarks: {},
      readerInstance: null, fileType: null, loading: false, pageTurning: false,
      turnAnimation: 'slide', estimatedTime: '—', readingSpeed: 200, lastReadTime: Date.now(),
      timerDuration: 0, timerRemaining: 0, timerRunning: false, timerInterval: null,
    };
    document.body.classList.remove('dr-fullscreen');
    if (bookRead) abrirBiblioteca();
  }

  function toggleFullscreen() {
    _state.fullscreen = !_state.fullscreen;
    document.body.classList.toggle('dr-fullscreen', _state.fullscreen);
  }

  function toggleSidebar(type) {
    const settingsSidebar = document.getElementById('dr-sidebar-settings');
    const aiSidebar = document.getElementById('dr-sidebar-ai');

    if (type === 'settings') {
      settingsSidebar.classList.toggle('active');
      aiSidebar.classList.remove('active');
    } else if (type === 'ai') {
      aiSidebar.classList.toggle('active');
      settingsSidebar.classList.remove('active');
    }
  }

  function setReaderMode(mode) {
    _state.readerMode = mode;
    _state.pageColor = null;
    const modal = document.getElementById(MODAL_ID);
    if (modal) {
      modal.style.removeProperty('--dr-page-bg');
      modal.style.removeProperty('--dr-page-color');
    }
    _updateUI();
  }

  function setFontSize(size) {
    _state.fontSize = parseInt(size);
    _updateUI();
  }

  function setFontFamily(family) {
    _state.fontFamily = family;
    _updateUI();
  }

  function setBrightness(value) {
    _state.brightness = parseInt(value);
    _updateUI();
  }

  function setZoom(value) {
    _state.zoom = parseFloat(value);
    _updateUI();
  }

  function setPageColor(color) {
    _state.pageColor = color;
    const modal = document.getElementById(MODAL_ID);
    if (modal) {
      modal.classList.remove('dr-mode-default', 'dr-mode-sepia', 'dr-mode-dark');
      modal.style.setProperty('--dr-page-bg', color);
      const dark = _isColorDark(color);
      modal.style.setProperty('--dr-page-color', dark ? '#f0e8df' : '#2a2118');
      // Aproximação: como o PDF é desenhado em canvas (imagem), não dá pra
      // recolorir com precisão — usamos um filtro CSS parecido com "modo
      // escuro"/"sépia" de leitores de PDF, escolhido pela luminosidade da
      // cor escolhida.
      modal.style.setProperty('--dr-pdf-filter', dark
        ? 'invert(0.88) hue-rotate(180deg) brightness(0.9) contrast(0.9)'
        : 'sepia(0.35) brightness(0.97) contrast(0.95)');
      modal.classList.add('dr-mode-custom');
    }
    document.querySelectorAll('.dr-option-btn').forEach(btn => btn.classList.remove('active'));
    _updateUI();
  }

  function _isColorDark(hex) {
    const c = hex.replace('#', '');
    if (c.length !== 6) return true;
    const r = parseInt(c.substr(0, 2), 16);
    const g = parseInt(c.substr(2, 2), 16);
    const b = parseInt(c.substr(4, 2), 16);
    return (r * 299 + g * 587 + b * 114) / 1000 < 140;
  }

  function goToPage(value) {
    if (!_state.book) return;
    let target = parseInt(value, 10) - 1;
    target = Math.max(0, Math.min(target, _state.totalPages - 1));
    // mantém o padrão de páginas em par (esquerda/direita) já usado no leitor
    if (target % 2 !== 0) target -= 1;

    if (_state.fileType && _state.fileType.includes('epub')) {
      const item = _state.readerInstance?.navigation?.toc?.[target];
      if (item) _state.readerInstance.rendition.display(item.href);
      return;
    }

    _state.currentPage = Math.max(0, target);
    _renderPages();
  }

  // ---------------------------------------------------------------------
  // Timer de leitura: o usuário escolhe uma duração e acompanha o tempo
  // restante enquanto lê; ao zerar, avisa que o tempo acabou.
  // ---------------------------------------------------------------------
  function setTimerDuration(minutes) {
    minutes = parseInt(minutes, 10) || 0;
    _state.timerDuration = minutes;
    _state.timerRemaining = minutes * 60;
    _updateTimerUI();
  }

  function startTimer() {
    if (_state.timerRunning || _state.timerRemaining <= 0) return;
    _state.timerRunning = true;
    _state.timerInterval = setInterval(() => {
      _state.timerRemaining -= 1;
      if (_state.timerRemaining <= 0) {
        _state.timerRemaining = 0;
        _stopTimer();
        _toast('⏰ Tempo de leitura encerrado!', 'info');
        _playSound('page_turn');
      }
      _updateTimerUI();
    }, 1000);
    _updateTimerUI();
  }

  function toggleTimer() {
    if (_state.timerRunning) {
      pauseTimer();
    } else {
      startTimer();
    }
  }

  function pauseTimer() {
    if (!_state.timerRunning) return;
    clearInterval(_state.timerInterval);
    _state.timerInterval = null;
    _state.timerRunning = false;
    _updateTimerUI();
  }

  function _stopTimer() {
    if (_state.timerInterval) clearInterval(_state.timerInterval);
    _state.timerInterval = null;
    _state.timerRunning = false;
  }

  function resetTimer() {
    _stopTimer();
    _state.timerRemaining = _state.timerDuration * 60;
    _updateTimerUI();
  }

  function _formatTime(totalSeconds) {
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const s = Math.floor(totalSeconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  function _updateTimerUI() {
    const display = document.getElementById('dr-timer-display');
    if (display) display.textContent = _state.timerDuration > 0 ? _formatTime(_state.timerRemaining) : '--:--';
    const startBtn = document.getElementById('dr-timer-start');
    if (startBtn) startBtn.textContent = _state.timerRunning ? 'Pausar' : 'Iniciar';
    document.querySelectorAll('.dr-timer-preset').forEach(btn => {
      btn.classList.toggle('active', parseInt(btn.dataset.minutes, 10) === _state.timerDuration);
    });
  }

  // ---------------------------------------------------------------------
  // Biblioteca: guarda o progresso de cada livro aberto em localStorage e
  // mostra uma tela com todos os livros e o quanto já foi lido de cada um.
  // ---------------------------------------------------------------------
  function _readLibrary() {
    try {
      return JSON.parse(localStorage.getItem(LIBRARY_KEY)) || {};
    } catch {
      return {};
    }
  }

  function _writeLibrary(lib) {
    localStorage.setItem(LIBRARY_KEY, JSON.stringify(lib));
  }

  function _updateLibraryEntry(book) {
    if (!book || !book.id) return;
    const lib = _readLibrary();
    const totalPages = book.totalPages || 0;
    const percent = totalPages > 0 ? Math.min(100, Math.round(((book.currentPage + 1) / totalPages) * 100)) : 0;
    lib[book.id] = {
      id: book.id,
      title: book.title,
      totalPages,
      currentPage: book.currentPage,
      percent,
      completed: percent >= 100,
      lastRead: Date.now(),
    };
    _writeLibrary(lib);
    return lib[book.id];
  }

  function abrirBiblioteca() {
    const existing = document.getElementById('dr-library-modal');
    if (existing) existing.remove();

    const lib = _readLibrary();
    const livros = Object.values(lib).sort((a, b) => b.lastRead - a.lastRead);

    const cardsHtml = livros.length ? livros.map(l => `
      <div class="dr-lib-card" onclick="DigitalReader.abrirLivroDaBiblioteca('${l.id}')">
        <div class="dr-lib-card-top">
          <span class="dr-lib-icon">${l.completed ? '✅' : '📖'}</span>
          <span class="dr-lib-title">${_esc(l.title)}</span>
        </div>
        <div class="dr-lib-progress-wrap">
          <div class="dr-lib-progress" style="width:${l.percent}%"></div>
        </div>
        <div class="dr-lib-meta">
          <span>${l.percent}% lido</span>
          <span>${l.completed ? 'Concluído' : `Pág. ${l.currentPage + 1}/${l.totalPages}`}</span>
        </div>
      </div>
    `).join('') : `<p class="dr-lib-empty">Nenhum livro lido ainda.</p>`;

    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
      <div id="dr-library-modal" class="dr-overlay">
        <div class="dr-modal dr-library-modal">
          <div class="dr-header">
            <div class="dr-header-left">
              <button class="dr-btn-icon" onclick="DigitalReader.fecharBiblioteca()">✕</button>
              <span class="dr-book-title">Sua Biblioteca</span>
            </div>
            <div class="dr-header-right">
              <button class="dr-lib-upload-btn" onclick="document.getElementById('dr-lib-upload-input').click()">+ Carregar PDF</button>
              <input type="file" id="dr-lib-upload-input" hidden accept=".pdf,.epub,.txt" onchange="DigitalReader.fecharBiblioteca(); DigitalReader.abrir(this.files[0]);">
            </div>
          </div>
          <div class="dr-lib-grid">${cardsHtml}</div>
        </div>
      </div>
    `;
    document.body.appendChild(wrapper.firstElementChild);
    _injectStyles();
  }

  async function abrirLivroDaBiblioteca(id) {
    const lib = _readLibrary();
    const entry = lib[id];
    if (!entry) {
      _toast('Livro não encontrado na biblioteca.', 'error');
      return;
    }
    try {
      const record = await _dbGetFile(id);
      if (!record || !record.blob) {
        _toast('Arquivo original não está mais disponível. Selecione-o novamente.', 'error');
        return;
      }
      const file = new File([record.blob], record.name || entry.title, { type: record.type || '' });
      fecharBiblioteca();
      await abrir(file);
    } catch (err) {
      console.error('Erro ao reabrir livro da biblioteca:', err);
      _toast('Erro ao reabrir o livro.', 'error');
    }
  }

  function fecharBiblioteca() {
    const modal = document.getElementById('dr-library-modal');
    if (modal) modal.remove();
  }

  async function callAI(action) {
    const currentPageContent = _getCurrentPageContent();
    if (!currentPageContent) {
      _toast('Nenhum conteúdo na página para analisar.', 'error');
      return;
    }

    let prompt = '';
    let context = 'Você é um assistente educacional focado em leitura digital.';

    switch (action) {
      case 'summarize':
        prompt = `Resuma o seguinte conteúdo da página de um livro: "${currentPageContent}"`;
        break;
      case 'explain':
        const selectedText = window.getSelection().toString();
        if (selectedText) {
          prompt = `Explique o trecho selecionado: "${selectedText}" no contexto da página: "${currentPageContent}"`;
        } else {
          prompt = `Explique os conceitos chave da página: "${currentPageContent}"`;
        }
        break;
      case 'flashcards':
        prompt = `Gere 3 flashcards (pergunta/resposta) com base no conteúdo da página: "${currentPageContent}"`;
        context = 'Você é um gerador de flashcards para estudo.';
        break;
      case 'quiz':
        prompt = `Crie 3 perguntas de múltipla escolha com base no conteúdo da página: "${currentPageContent}"`;
        context = 'Você é um criador de quizzes para livros.';
        break;
      case 'highlights':
        prompt = `Destacar os 5 pontos mais importantes do conteúdo da página: "${currentPageContent}"`;
        break;
      default:
        _toast('Ação de IA desconhecida.', 'error');
        return;
    }

    _toast('🤖 IA está processando...', 'info');
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: prompt, context: context })
      });
      
      if (!res.ok) throw new Error('Falha na API');
      
      const data = await res.json();
      const response = data.response || 'Sem resposta.';
      
      App.openModal(`
        <h2 class="modal-title">🤖 Insight da IA</h2>
        <div style="font-size:14px; line-height:1.6; color:var(--text-1); white-space:pre-wrap;">${response}</div>
        <button class="btn-primary" style="width:100%; margin-top:20px" onclick="App.closeModal()">Entendido</button>
      `);
      
    } catch (error) {
      _toast(`Erro na chamada da IA: ${error.message}`, 'error');
      console.error('Erro na chamada da IA:', error);
    }
  }

  function _getCurrentPageContent() {
    if (_state.fileType.includes('pdf')) {
      const selectedText = window.getSelection().toString();
      if (selectedText) return selectedText;
      return 'Conteúdo PDF (selecione um trecho para análise mais precisa)';
    } else if (_state.fileType.includes('epub')) {
      const iframe = document.querySelector('#dr-page-left iframe');
      if (iframe && iframe.contentDocument) {
        return iframe.contentDocument.body.innerText;
      }
      return 'Conteúdo EPUB';
    } else if (_state.fileType.includes('text')) {
      return _state.book.data.pages[_state.currentPage];
    }
    return '';
  }

  function _setupMarkingEvents() {
    const contentArea = document.querySelector('.dr-content-area');
    if (!contentArea) return;

    contentArea.addEventListener('mouseup', (e) => {
      const selection = window.getSelection();
      const selectedText = selection.toString().trim();
      if (selectedText.length > 0) {
        _showMarkingToolbar(e.clientX, e.clientY, selectedText, selection);
      } else {
        _hideMarkingToolbar();
      }
    });
  }

  function _showMarkingToolbar(x, y, text, selection) {
    let toolbar = document.getElementById('dr-marking-toolbar');
    if (!toolbar) {
      toolbar = document.createElement('div');
      toolbar.id = 'dr-marking-toolbar';
      toolbar.className = 'dr-marking-toolbar';
      toolbar.innerHTML = `
        <button onclick="DigitalReader.addHighlight('yellow')">Grifar</button>
        <button onclick="DigitalReader.addNote()">Nota</button>
        <button onclick="DigitalReader.addBookmark()">Bookmark</button>
      `;
      document.body.appendChild(toolbar);
    }
    toolbar.style.left = `${x}px`;
    toolbar.style.top = `${y - 40}px`;
    toolbar.style.display = 'flex';

    _state.currentSelection = { text, selection };
  }

  function _hideMarkingToolbar() {
    const toolbar = document.getElementById('dr-marking-toolbar');
    if (toolbar) toolbar.style.display = 'none';
    _state.currentSelection = null;
  }

  function addHighlight(color) {
    if (!_state.currentSelection || !_state.book) return;
    const { text, selection } = _state.currentSelection;
    const page = _state.currentPage;

    if (!_state.highlights[page]) _state.highlights[page] = [];
    _state.highlights[page].push({ text, color, range: _getSelectionRange(selection) });
    _applyHighlightsToPage(page);
    _hideMarkingToolbar();
    _toast('Texto grifado!', 'success');
  }

  function addNote() {
    if (!_state.currentSelection || !_state.book) return;
    const { text, selection } = _state.currentSelection;
    const page = _state.currentPage;
    const noteContent = prompt('Adicionar nota:', text);
    if (noteContent) {
      if (!_state.notes[page]) _state.notes[page] = [];
      _state.notes[page].push({ text, note: noteContent, range: _getSelectionRange(selection) });
      _hideMarkingToolbar();
      _toast('Nota adicionada!', 'success');
    }
  }

  function addBookmark() {
    if (!_state.book) return;
    const page = _state.currentPage;
    _state.bookmarks[page] = true;
    _toast(`Página ${page + 1} marcada!`, 'success');
    _hideMarkingToolbar();
  }

  function _getSelectionRange(selection) {
    const range = selection.getRangeAt(0);
    return {
      startContainerPath: _getNodePath(range.startContainer),
      startOffset: range.startOffset,
      endContainerPath: _getNodePath(range.endContainer),
      endOffset: range.endOffset,
    };
  }

  function _getNodePath(node) {
    const path = [];
    let current = node;
    while (current && current !== document.body && current !== document.getElementById('dr-page-left') && current !== document.getElementById('dr-page-right')) {
      let sibling = current.previousSibling;
      let index = 0;
      while (sibling) {
        if (sibling.nodeType === 1 && sibling.nodeName === current.nodeName) {
          index++;
        }
        sibling = sibling.previousSibling;
      }
      path.unshift(`${current.nodeName.toLowerCase()}[${index}]`);
      current = current.parentNode;
    }
    return path.join('>');
  }

  function _applyHighlightsToPage(page) {
    console.log(`Applying highlights for page ${page}:`, _state.highlights[page]);
  }

  function _injectStyles() {
    if (document.getElementById('digital-reader-styles')) return;
    const style = document.createElement('style');
    style.id = 'digital-reader-styles';
    style.textContent = `
      .dr-overlay {
        position: fixed; inset: 0; z-index: 99999;
        background: rgba(6, 5, 4, 0.72);
        backdrop-filter: blur(6px);
        display: flex; align-items: center; justify-content: center;
        animation: dr-fade-in 0.4s ease-out forwards;
        font-family: var(--font-body, 'DM Sans', sans-serif);
        color: var(--text-0, #f0e8df);
        --dr-brightness: 100%;
        --dr-font-size: 16px;
        --dr-font-family: var(--font-body);
      }
      @keyframes dr-fade-in {
        from { opacity: 0; transform: scale(0.98) translateY(10px); }
        to { opacity: 1; transform: scale(1) translateY(0); }
      }

      .dr-overlay ::selection { background: var(--accent-soft, rgba(232,160,74,0.25)); color: var(--text-0, #f0e8df); }
      .dr-overlay button:focus-visible,
      .dr-overlay input:focus-visible,
      .dr-overlay select:focus-visible {
        outline: 2px solid var(--accent, #e8a04a);
        outline-offset: 2px;
      }
      .dr-overlay button:active { transform: translateY(1px); }
      .dr-overlay *::-webkit-scrollbar { width: 4px; height: 4px; }
      .dr-overlay *::-webkit-scrollbar-track { background: transparent; }
      .dr-overlay *::-webkit-scrollbar-thumb { background: var(--accent-soft, rgba(232,160,74,0.2)); border-radius: 2px; }

      body.dr-fullscreen .dr-modal {
        width: 100vw; height: 100vh;
        border-radius: 0;
        box-shadow: none;
      }
      body.dr-fullscreen .dr-header,
      body.dr-fullscreen .dr-footer {
        background: rgba(var(--bg-rgb-0), 0.8);
        backdrop-filter: blur(8px);
      }

      .dr-mode-sepia .dr-modal {
        background: #fbf0d9;
        color: #5a4a3a;
      }
      .dr-mode-dark .dr-modal {
        background: #1a1a1a;
        color: #e0e0e0;
      }
      .dr-mode-sepia .dr-header, .dr-mode-sepia .dr-footer { background: rgba(251, 240, 217, 0.8); color: #5a4a3a; }
      .dr-mode-dark .dr-header, .dr-mode-dark .dr-footer { background: rgba(26, 26, 26, 0.8); color: #e0e0e0; }

      .dr-modal {
        width: 95vw; max-width: 1200px;
        height: 90vh; max-height: 800px;
        background: var(--bg-0, #0f0d0a);
        border: 1px solid var(--border, rgba(255,220,170,0.07));
        border-radius: 18px;
        box-shadow: var(--shadow-lg, 0 20px 60px rgba(0,0,0,0.8));
        display: flex; flex-direction: column;
        overflow: hidden;
        position: relative;
        filter: brightness(var(--dr-brightness));
        transition: all 0.3s ease;
      }

      .dr-header {
        display: flex; justify-content: space-between; align-items: center;
        padding: 12px 20px;
        background: var(--bg-0, #0f0d0a);
        border-bottom: 1px solid var(--border, #3a3228);
        flex-shrink: 0;
        transition: background 0.3s ease;
      }
      .dr-header-left, .dr-header-right { display: flex; align-items: center; gap: 10px; }
      .dr-btn-icon {
        background: none; border: none; color: var(--text-2, #8a7a6a);
        font-size: 20px; cursor: pointer; padding: 6px; border-radius: 8px;
        transition: all 0.2s;
        display: inline-flex; align-items: center; justify-content: center;
      }
      .dr-btn-icon svg { width: 20px; height: 20px; flex-shrink: 0; }
      .dr-btn-icon:hover { background: var(--bg-2, #1a1612); color: var(--text-0, #f0e8df); }
      .dr-book-title {
        font-size: 16px; font-weight: 600; color: var(--text-0, #f0e8df);
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        max-width: 300px;
      }

      .dr-content-area {
        flex: 1; display: flex;
        position: relative;
        overflow: hidden;
        cursor: grab;
      }
      .dr-nav-arrow {
        position: absolute; top: 50%; transform: translateY(-50%);
        width: 40px; height: 40px; border-radius: 50%;
        background: rgba(0,0,0,0.35); border: 1px solid rgba(255,255,255,0.15);
        color: var(--text-0, #f0e8df); font-size: 22px; line-height: 1;
        display: flex; align-items: center; justify-content: center;
        cursor: pointer; z-index: 20; transition: background 0.2s, opacity 0.2s;
        opacity: 0.6;
      }
      .dr-nav-arrow:hover { background: var(--accent, #e8a04a); color: var(--bg-0, #0f0d0a); opacity: 1; }
      .dr-nav-arrow-left { left: 14px; }
      .dr-nav-arrow-right { right: 14px; }
      .dr-page-container {
        flex: 1;
        padding: 20px;
        display: flex; flex-direction: column; justify-content: center; align-items: center;
        position: relative;
        overflow: hidden;
        background: var(--bg-1, #151210);
        border-right: 1px solid var(--border, #3a3228);
        font-size: var(--dr-font-size);
        font-family: var(--dr-font-family);
        line-height: 1.6;
        transition: transform 0.3s ease-out;
      }
      .dr-page-container:last-child { border-right: none; }
      .dr-text-page {
        max-width: 600px;
        text-align: justify;
        user-select: text;
      }
      .dr-page-container canvas {
        max-width: 100%; max-height: 100%;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      }
      .dr-page-container canvas.dr-pdf-canvas {
        background: #ffffff;
        border-radius: 2px;
        transition: filter 0.3s ease;
      }
      .dr-mode-sepia canvas.dr-pdf-canvas {
        filter: sepia(0.4) brightness(0.97) contrast(0.95);
      }
      .dr-mode-dark canvas.dr-pdf-canvas {
        filter: invert(0.88) hue-rotate(180deg) brightness(0.9) contrast(0.9);
      }
      .dr-mode-custom canvas.dr-pdf-canvas {
        filter: var(--dr-pdf-filter, none);
      }
      .dr-text-page, .dr-page-container iframe {
        transition: filter 0.3s ease;
      }
      .dr-page-container iframe {
        width: 100%; height: 100%; border: none;
        background: transparent;
      }

      .dr-page-turn-overlay {
        position: absolute; inset: 0;
        background: rgba(0,0,0,0.5);
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.3s ease;
      }
      .dr-page-turn-overlay.dr-page-turn-overlay-active {
        opacity: 1;
      }

      .dr-page-turn-anim-left {
        animation: dr-page-flip-left 0.6s ease-in-out forwards;
        transform-origin: right center;
      }
      .dr-page-turn-anim-right {
        animation: dr-page-flip-right 0.6s ease-in-out forwards;
        transform-origin: left center;
      }
      .dr-page-turn-anim-left-reverse {
        animation: dr-page-flip-left-reverse 0.6s ease-in-out forwards;
        transform-origin: right center;
      }
      .dr-page-turn-anim-right-reverse {
        animation: dr-page-flip-right-reverse 0.6s ease-in-out forwards;
        transform-origin: left center;
      }

      @keyframes dr-page-flip-left {
        0% { transform: rotateY(0deg) translateX(0); box-shadow: 0 0 0 rgba(0,0,0,0); }
        50% { transform: rotateY(-90deg) translateX(-50%); box-shadow: -10px 0 30px rgba(0,0,0,0.5); }
        100% { transform: rotateY(-180deg) translateX(-100%); box-shadow: -20px 0 60px rgba(0,0,0,0.8); }
      }
      @keyframes dr-page-flip-right {
        0% { transform: rotateY(0deg) translateX(0); box-shadow: 0 0 0 rgba(0,0,0,0); }
        50% { transform: rotateY(90deg) translateX(50%); box-shadow: 10px 0 30px rgba(0,0,0,0.5); }
        100% { transform: rotateY(180deg) translateX(100%); box-shadow: 20px 0 60px rgba(0,0,0,0.8); }
      }
      @keyframes dr-page-flip-left-reverse {
        0% { transform: rotateY(-180deg) translateX(-100%); box-shadow: -20px 0 60px rgba(0,0,0,0.8); }
        50% { transform: rotateY(-90deg) translateX(-50%); box-shadow: -10px 0 30px rgba(0,0,0,0.5); }
        100% { transform: rotateY(0deg) translateX(0); box-shadow: 0 0 0 rgba(0,0,0,0); }
      }
      @keyframes dr-page-flip-right-reverse {
        0% { transform: rotateY(180deg) translateX(100%); box-shadow: 20px 0 60px rgba(0,0,0,0.8); }
        50% { transform: rotateY(90deg) translateX(50%); box-shadow: 10px 0 30px rgba(0,0,0,0.5); }
        100% { transform: rotateY(0deg) translateX(0); box-shadow: 0 0 0 rgba(0,0,0,0); }
      }

      .dr-footer {
        position: relative;
        display: flex; justify-content: space-between; align-items: center;
        gap: 14px;
        padding: 10px 20px;
        background: var(--bg-0, #0f0d0a);
        border-top: 1px solid var(--border, #3a3228);
        flex-shrink: 0;
        font-size: 12px; color: var(--text-2, #8a7a6a);
        transition: background 0.3s ease;
      }
      .dr-footer .dr-percent-info,
      .dr-footer .dr-page-info,
      .dr-footer .dr-time-info {
        white-space: nowrap;
        flex-shrink: 0;
      }
      .dr-progress-bar-wrap {
        flex: 1; height: 6px; background: var(--bg-2, #1a1612);
        border-radius: 3px; overflow: hidden; margin-right: 10px;
      }
      .dr-progress-bar {
        height: 100%; width: 0%; background: var(--accent, #e8a04a);
        border-radius: 3px; transition: width 0.3s ease;
      }
      .dr-percent-info {
        margin-right: 12px; font-weight: 600; color: var(--accent, #e8a04a);
        white-space: nowrap;
      }
      .dr-page-slider {
        position: absolute; left: 20px; right: 20px; bottom: 100%;
        width: calc(100% - 40px); margin-bottom: 10px;
        height: 14px;
        -webkit-appearance: none; appearance: none;
        background: transparent; cursor: pointer; z-index: 5;
      }
      .dr-page-slider::-webkit-slider-runnable-track {
        height: 4px; border-radius: 2px; background: var(--bg-2, #1a1612);
      }
      .dr-page-slider::-webkit-slider-thumb {
        -webkit-appearance: none; appearance: none;
        width: 14px; height: 14px; border-radius: 50%; margin-top: -5px;
        background: var(--accent, #e8a04a);
        box-shadow: 0 0 0 4px rgba(232,160,74,0.18);
      }
      .dr-page-slider::-moz-range-track {
        height: 4px; border-radius: 2px; background: var(--bg-2, #1a1612);
      }
      .dr-page-slider::-moz-range-thumb {
        width: 14px; height: 14px; border-radius: 50%; border: none;
        background: var(--accent, #e8a04a);
        box-shadow: 0 0 0 4px rgba(232,160,74,0.18);
      }

      .dr-mode-custom .dr-modal { background: var(--dr-page-bg, #151210); color: var(--dr-page-color, #f0e8df); }
      .dr-mode-custom .dr-header, .dr-mode-custom .dr-footer { background: var(--dr-page-bg, #151210); color: var(--dr-page-color, #f0e8df); }
      .dr-color-input {
        width: 100%; height: 36px; border: 1px solid var(--border, #3a3228);
        border-radius: 8px; background: none; cursor: pointer; padding: 2px;
      }

      .dr-timer-controls {
        display: flex; align-items: center; gap: 8px; margin-top: 6px;
      }
      .dr-timer-display {
        flex: 1; font-family: var(--font-mono, 'DM Mono', monospace);
        font-size: 18px; font-weight: 700; color: var(--text-0, #f0e8df);
        text-align: center; background: var(--bg-2, #1a1612);
        border-radius: 8px; padding: 6px 0;
      }
      .dr-timer-btn {
        padding: 8px 12px; border-radius: 8px; border: 1px solid var(--border, #3a3228);
        background: var(--bg-2, #1a1612); color: var(--text-1, #c8b89a);
        font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s;
      }
      .dr-timer-btn:hover { background: var(--accent, #e8a04a); color: var(--bg-0, #0f0d0a); border-color: var(--accent, #e8a04a); }
      .dr-timer-preset.active {
        background: var(--accent, #e8a04a); color: var(--bg-0, #0f0d0a); border-color: var(--accent, #e8a04a);
      }

      .dr-library-modal { max-width: 900px; overflow-y: auto; }
      .dr-lib-grid {
        display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
        gap: 16px; padding: 24px; overflow-y: auto;
      }
      .dr-lib-card {
        background: var(--bg-1, #151210); border: 1px solid var(--border, #3a3228);
        border-radius: 12px; padding: 16px; display: flex; flex-direction: column; gap: 10px;
        cursor: pointer; transition: border-color 0.2s, transform 0.2s;
      }
      .dr-lib-card:hover { border-color: var(--accent, #e8a04a); transform: translateY(-2px); }
      .dr-lib-card-top { display: flex; align-items: center; gap: 8px; }
      .dr-lib-icon { font-size: 18px; }
      .dr-lib-title {
        font-size: 14px; font-weight: 600; color: var(--text-0, #f0e8df);
        overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
      }
      .dr-lib-progress-wrap {
        height: 6px; background: var(--bg-2, #1a1612); border-radius: 3px; overflow: hidden;
      }
      .dr-lib-progress { height: 100%; background: var(--accent, #e8a04a); border-radius: 3px; }
      .dr-lib-meta {
        display: flex; justify-content: space-between; font-size: 12px; color: var(--text-2, #8a7a6a);
      }
      .dr-lib-empty { padding: 40px; text-align: center; color: var(--text-2, #8a7a6a); grid-column: 1 / -1; }
      .dr-lib-upload-btn {
        background: var(--accent, #e8a04a); color: var(--bg-0, #0f0d0a);
        border: none; border-radius: 8px; padding: 8px 14px;
        font-size: 13px; font-weight: 700; cursor: pointer; transition: opacity 0.2s;
      }
      .dr-lib-upload-btn:hover { opacity: 0.9; }

      .dr-sidebar {
        position: absolute; top: 0; bottom: 0; right: 0;
        width: 300px;
        background: var(--bg-0, #0f0d0a);
        border-left: 1px solid var(--border, #3a3228);
        box-shadow: -10px 0 30px rgba(0,0,0,0.5);
        transform: translateX(100%);
        transition: transform 0.3s ease-out;
        display: flex; flex-direction: column;
        z-index: 100;
      }
      .dr-sidebar.active { transform: translateX(0); }
      .dr-sidebar-header {
        display: flex; justify-content: space-between; align-items: center;
        padding: 12px 20px;
        border-bottom: 1px solid var(--border, #3a3228);
        flex-shrink: 0;
      }
      .dr-sidebar-header h3 {
        font-size: 16px; font-weight: 600; color: var(--text-0, #f0e8df);
        margin: 0;
      }
      .dr-sidebar-content { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 15px; }

      .dr-setting-group { display: flex; flex-direction: column; gap: 8px; }
      .dr-setting-group h4 { font-size: 14px; color: var(--text-1, #c8b89a); margin: 0; }
      .dr-option-buttons { display: flex; gap: 8px; }
      .dr-option-btn {
        flex: 1; padding: 8px 12px; border-radius: 8px;
        background: var(--bg-2, #1a1612); border: 1px solid var(--border, #3a3228);
        color: var(--text-2, #8a7a6a); font-size: 12px; cursor: pointer;
        transition: all 0.2s;
      }
      .dr-option-btn.active {
        background: var(--accent, #e8a04a); color: var(--bg-0, #0f0d0a);
        border-color: var(--accent, #e8a04a);
      }
      .dr-setting-group input[type="range"] {
        width: 100%; accent-color: var(--accent, #e8a04a);
      }
      .dr-setting-group select {
        width: 100%; padding: 8px 12px; border-radius: 8px;
        background: var(--bg-2, #1a1612); border: 1px solid var(--border, #3a3228);
        color: var(--text-0, #f0e8df); font-size: 13px; outline: none;
      }

      .dr-ai-btn {
        width: 100%; padding: 12px; border-radius: 10px;
        background: var(--bg-2, #1a1612); border: 1px solid var(--border, #3a3228);
        color: var(--text-0, #f0e8df); font-size: 14px; font-weight: 500;
        cursor: pointer; transition: all 0.2s;
      }
      .dr-ai-btn:hover { background: var(--accent-light, rgba(232,160,74,0.1)); border-color: var(--accent, #e8a04a); color: var(--accent, #e8a04a); }

      .dr-welcome-overlay {
        position: absolute;
        inset: 0;
        z-index: 30;
        display: none;
        align-items: center;
        justify-content: center;
        padding: 32px;
        background: var(--bg-1, #161310);
      }
      .dr-welcome-overlay.dr-dragging {
        background: var(--accent-dim, rgba(232,160,74,0.06));
      }
      .dr-welcome-card {
        width: 100%;
        max-width: 380px;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        gap: 6px;
        padding: 40px 32px 32px;
        border: 1.5px dashed var(--border-warm, rgba(232,160,74,0.22));
        border-radius: var(--radius-lg, 22px);
        background: var(--bg-2, #1e1a15);
        box-shadow: var(--shadow-lg, 0 12px 40px rgba(0,0,0,0.6));
        transition: border-color var(--t-base, 0.22s) ease, background var(--t-base, 0.22s) ease, transform var(--t-base, 0.22s) ease;
      }
      .dr-welcome-overlay.dr-dragging .dr-welcome-card {
        border-color: var(--accent, #e8a04a);
        background: var(--accent-dim, rgba(232,160,74,0.08));
        transform: scale(1.015);
      }
      .dr-welcome-icon {
        width: 60px; height: 60px;
        display: flex; align-items: center; justify-content: center;
        font-size: 26px;
        border-radius: 50%;
        background: var(--accent-soft, rgba(232,160,74,0.12));
        border: 1px solid var(--border-warm, rgba(232,160,74,0.22));
        margin-bottom: 14px;
      }
      .dr-welcome-card h3 {
        font-family: var(--font-display, 'DM Serif Display', Georgia, serif);
        font-style: italic;
        font-weight: 400;
        font-size: 22px;
        color: var(--text-0, #f0e8df);
        margin: 0 0 8px;
      }
      .dr-welcome-card p {
        font-size: 13px;
        font-weight: 300;
        line-height: 1.6;
        color: var(--text-2, #7a6e65);
        margin: 0 0 22px;
        max-width: 300px;
      }
      .dr-welcome-btn {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        border: none;
        border-radius: var(--radius-sm, 8px);
        padding: 11px 22px;
        background: linear-gradient(135deg, var(--accent, #e8a04a), #f0ad55);
        color: var(--bg-0, #0f0d0a);
        font-family: var(--font-body, 'DM Sans', sans-serif);
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.03em;
        text-transform: uppercase;
        cursor: pointer;
        transition: transform var(--t-fast, 0.12s) ease, box-shadow var(--t-fast, 0.12s) ease;
      }
      .dr-welcome-btn:hover { transform: translateY(-1px); box-shadow: var(--accent-glow, 0 0 32px rgba(232,160,74,0.25)); }
      .dr-welcome-btn:active { transform: translateY(0) scale(0.98); }
      .dr-welcome-formats {
        display: flex;
        gap: 8px;
        margin-top: 18px;
      }
      .dr-format-badge {
        font-family: var(--font-mono, 'DM Mono', monospace);
        font-size: 10px;
        letter-spacing: 0.06em;
        color: var(--text-2, #7a6e65);
        border: 1px solid var(--border, rgba(255,220,170,0.07));
        border-radius: var(--radius-xs, 4px);
        padding: 3px 9px;
      }

      .dr-loading-overlay {
        position: absolute; inset: 0;
        background: rgba(var(--bg-rgb-0), 0.95);
        display: flex; flex-direction: column; align-items: center; justify-content: center;
        gap: 15px;
        color: var(--text-1, #c8b89a);
        font-size: 16px;
        z-index: 101;
      }
      .dr-spinner {
        width: 40px; height: 40px; border-radius: 50%;
        border: 4px solid rgba(var(--text-rgb-1), 0.2);
        border-top-color: var(--accent, #e8a04a);
        animation: dr-spin 1s linear infinite;
      }
      @keyframes dr-spin { to { transform: rotate(360deg); } }

      .dr-marking-toolbar {
        position: absolute;
        background: var(--bg-2, #1a1612);
        border: 1px solid var(--border, #3a3228);
        border-radius: 8px;
        padding: 5px;
        display: none;
        gap: 5px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.4);
        z-index: 102;
      }
      .dr-marking-toolbar button {
        background: none; border: none; color: var(--text-0, #f0e8df);
        padding: 5px 10px; border-radius: 6px;
        font-size: 12px; cursor: pointer;
        transition: background 0.2s;
      }
      .dr-marking-toolbar button:hover { background: var(--bg-3, #211d18); }

      @media (max-width: 768px) {
        .dr-modal {
          width: 100vw; height: 100vh;
          border-radius: 0;
          max-width: none; max-height: none;
        }
        .dr-header, .dr-footer {
          padding: 10px 15px;
        }
        .dr-book-title {
          max-width: 150px;
          font-size: 14px;
        }
        .dr-page-container {
          padding: 15px;
        }
        .dr-sidebar {
          width: 100%;
          border-left: none;
          box-shadow: none;
        }
        .dr-content-area {
          flex-direction: column;
        }
        .dr-page-container:first-child { border-right: none; border-bottom: 1px solid var(--border); }
        .dr-page-turn-anim-left, .dr-page-turn-anim-right,
        .dr-page-turn-anim-left-reverse, .dr-page-turn-anim-right-reverse {
          animation: none;
        }
      }
    `;
    document.head.appendChild(style);
  }

  return {
    abrir,
    fechar,
    toggleFullscreen,
    toggleSidebar,
    setReaderMode,
    setFontSize,
    setFontFamily,
    setBrightness,
    setZoom,
    setPageColor,
    goToPage,
    setTimerDuration,
    startTimer,
    pauseTimer,
    toggleTimer,
    resetTimer,
    abrirBiblioteca,
    abrirLivroDaBiblioteca,
    fecharBiblioteca,
    _turnPage,
    callAI,
    addHighlight,
    addNote,
    addBookmark,
  };
})();

window.DigitalReader = DigitalReader;
window.BibliotecaVirtual = DigitalReader;

(function() {
  if (typeof MateriaModal === 'undefined') return;

  const originalSalvar = MateriaModal.salvar;

  MateriaModal.salvar = function() {
    const nome = document.getElementById('mat-nome')?.value.trim();
    const icon = document.getElementById('mat-icon-display')?.textContent || '📚';
    const turmaId = window.__currentTurmaId__;

    if (!nome) {
      MateriaModal._showErr('Digite o nome da matéria.');
      document.getElementById('mat-nome')?.focus();
      return;
    }

    const errEl = document.getElementById('mat-err');
    if (errEl) errEl.style.display = 'none';

    const materia = {
      id: 'mat_' + Date.now(),
      name: nome,
      icon,
      createdAt: new Date().toISOString(),
      arquivos: [],
      textos: [],
    };

    if (MateriaModal._s.tab === 'arquivo') {
      if (!MateriaModal._s.file) {
        MateriaModal._showErr('Selecione um arquivo para enviar.');
        return;
      }
      const desc = document.getElementById('mat-arquivo-desc')?.value.trim() || '';
      materia.arquivos.push({
        id: 'arq_' + Date.now(),
        name: MateriaModal._s.file.name,
        size: MateriaModal._s.file.size,
        data: MateriaModal._s.fileData,
        desc,
        type: MateriaModal._s.file.type,
        ...MateriaModal.extInfo(MateriaModal._s.file.name),
      });
    } else {
      const conteudo = document.getElementById('mat-texto-conteudo')?.value.trim();
      if (!conteudo) {
        MateriaModal._showErr('Escreva algum conteúdo para a matéria.');
        return;
      }
      materia.textos.push({
        id: 'txt_' + Date.now(),
        conteudo,
        createdAt: new Date().toISOString(),
      });
    }

    if (!turmaId) {
      MateriaModal._showErr('Turma não identificada. Tente novamente.');
      return;
    }
    if (!MateriaModal._localMaterias[turmaId]) MateriaModal._localMaterias[turmaId] = [];
    MateriaModal._localMaterias[turmaId].push(materia);

    try {
      const container = document.getElementById('turma-tab-materias');
      if (container) {
        container.innerHTML = MateriaModal._renderMateriasTab(turmaId);
      }
    } catch (err) {
      console.warn('MateriaModal: Não foi possível re-renderizar tab:', err);
    }

    MateriaModal.fechar();
    MateriaModal.toast('✅ Matéria publicada com sucesso!', 'success');
  };

  const originalAbrirMateria = MateriaModal.abrirMateria;
  MateriaModal.abrirMateria = function(materiaId) {
    const turmaId = window.__currentTurmaId__;
    if (!turmaId) return;
    const materias = MateriaModal._localMaterias[turmaId] || [];
    const m = materias.find(x => x.id === materiaId);
    if (!m) return;

    if (m.arquivos && m.arquivos.length > 0) {
      const file = m.arquivos[0];
      const byteCharacters = atob(file.data.split(',')[1]);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: file.type });
      const bookFile = new File([blob], file.name, { type: file.type });
      DigitalReader.abrir(bookFile);
    } else if (m.textos && m.textos.length > 0) {
      const textContent = m.textos[0].conteudo;
      const textBlob = new Blob([textContent], { type: 'text/plain' });
      const bookFile = new File([textBlob], `${m.name}.txt`, { type: 'text/plain' });
      DigitalReader.abrir(bookFile);
    } else {
      originalAbrirMateria(materiaId);
    }
  };

  const originalRenderMateriasTab = MateriaModal._renderMateriasTab;
  MateriaModal._renderMateriasTab = function(turmaId) {
    const originalHtml = originalRenderMateriasTab(turmaId);
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = originalHtml;

    tempDiv.querySelectorAll('.materia-card-new').forEach(card => {
      const materiaId = card.getAttribute('onclick').match(/'([^']+)'/)[1];
      const m = MateriaModal._localMaterias[turmaId].find(x => x.id === materiaId);

      if ((m.arquivos && m.arquivos.length > 0) || (m.textos && m.textos.length > 0)) {
        const openButton = document.createElement('button');
        openButton.textContent = 'Abrir no Leitor';
        openButton.className = 'dr-open-reader-btn';
        openButton.onclick = (e) => {
          e.stopPropagation();
          MateriaModal.abrirMateria(materiaId);
        };
        card.appendChild(openButton);
      }
    });
    return tempDiv.innerHTML;
  };

  const readerButtonStyles = document.createElement('style');
  readerButtonStyles.textContent = `
    .dr-open-reader-btn {
      background: var(--accent, #e8a04a);
      color: var(--bg-0, #0f0d0a);
      border: none;
      padding: 8px 12px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      margin-top: 10px;
      width: 100%;
      transition: opacity 0.2s;
    }
    .dr-open-reader-btn:hover {
      opacity: 0.9;
    }
  `;
  document.head.appendChild(readerButtonStyles);

})();