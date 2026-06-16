/* 
🧪 TESTE RÁPIDO: Validar que exercícios aparecem após salvar

Cole isso no DevTools Console (F12) enquanto está criando um exercício:
*/

// 1. Verificar que o painel existe
console.log('Painel exercícios existe?', !!document.getElementById('turma-tab-exercicios'));

// 2. Checar estado global
console.log('ExercicioState:', window._ExercicioState);

// 3. Listar exercícios em localStorage
console.log('localStorage:', JSON.parse(localStorage.getItem('ss_exercicios') || '{}'));

// 4. Teste manual - renderizar
console.log('Renderizando...');
ExSys.renderExerciciosTabContent();

// 5. Verificar API
fetch('http://localhost:8000/api/turmas/turma-id/exercicios')
  .then(r => r.json())
  .then(d => console.log('Backend retorna:', d))
  .catch(e => console.error('Erro backend:', e));
