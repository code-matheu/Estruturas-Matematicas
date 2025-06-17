import { gameBoard, infoPanel, gameInfo } from './common.js';

let board = [];
let pontuacao = 0;
let record = 0;
let gameOver = false;
let animationQueue = [];

export function iniciar() {
  // Carregar recorde salvo
  record = parseInt(localStorage.getItem('2048_record')) || 0;
  
  board = Array(4).fill().map(() => Array(4).fill(0));
  pontuacao = 0;
  gameOver = false;
  animationQueue = [];
  addNewTile();
  addNewTile();
  desenhar();
  atualizarPainelInfo();
}

export function desenhar() {
  draw2048();
}

export function tratarEvento(tecla) {
  if (gameOver) return;
  
  let moved = false;
  
  switch(tecla) {
    case "ArrowUp": moved = move('up'); break;
    case "ArrowDown": moved = move('down'); break;
    case "ArrowLeft": moved = move('left'); break;
    case "ArrowRight": moved = move('right'); break;
  }
  
  if (moved) {
    setTimeout(() => {
      addNewTile();
      desenhar();
      atualizarPainelInfo();
      checkGameOver();
    }, 150); // Pequeno delay para animação
  }
}

function atualizarPainelInfo() {
  // Atualizar recorde se necessário
  if (pontuacao > record) {
    record = pontuacao;
    localStorage.setItem('2048_record', record);
  }
  
  infoPanel.style.display = "block";
  gameInfo.innerHTML = `
    <strong>INSTRUÇÕES:</strong><br><br>
    <strong>SETAS</strong>: Mover blocos<br>
    <strong>ESC</strong>: Voltar ao menu<br>
    <button id="restart-btn" style="font-family: 'Press Start 2P', monospace; padding: 10px; margin-top: 10px; cursor: pointer;">REINICIAR</button>
    <br><br>
    <strong>OBJETIVO:</strong><br>
    Combine blocos iguais para formar o 2048!<br><br>
    <strong>Pontuação:</strong> ${pontuacao}<br>
    <strong>Recorde:</strong> ${record}<br><br>
    <strong>REGRAS:</strong><br>
    - Blocos com mesmo valor se combinam<br>
    - Cada combinação soma pontos<br>
    - Jogo termina quando não há mais movimentos
  `;
  
  // Adicionar evento ao botão de reinício
  document.getElementById('restart-btn').addEventListener('click', () => {
    iniciar();
  });
}

function addNewTile() {
  const emptyCells = [];
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      if (board[i][j] === 0) {
        emptyCells.push({i, j});
      }
    }
  }
  
  if (emptyCells.length > 0) {
    const {i, j} = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    board[i][j] = Math.random() < 0.9 ? 2 : 4;
    
    // Animação para novo tile
    animationQueue.push({
      type: 'new',
      i, j,
      value: board[i][j]
    });
  }
}

function move(direction) {
  let moved = false;
  const oldBoard = JSON.parse(JSON.stringify(board));
  const moves = [];
  
  switch(direction) {
    case 'up':
      for (let j = 0; j < 4; j++) {
        for (let i = 1; i < 4; i++) {
          if (board[i][j] !== 0) {
            moved = moveTile(i, j, -1, 0, moves) || moved;
          }
        }
      }
      break;
      
    case 'down':
      for (let j = 0; j < 4; j++) {
        for (let i = 2; i >= 0; i--) {
          if (board[i][j] !== 0) {
            moved = moveTile(i, j, 1, 0, moves) || moved;
          }
        }
      }
      break;
      
    case 'left':
      for (let i = 0; i < 4; i++) {
        for (let j = 1; j < 4; j++) {
          if (board[i][j] !== 0) {
            moved = moveTile(i, j, 0, -1, moves) || moved;
          }
        }
      }
      break;
      
    case 'right':
      for (let i = 0; i < 4; i++) {
        for (let j = 2; j >= 0; j--) {
          if (board[i][j] !== 0) {
            moved = moveTile(i, j, 0, 1, moves) || moved;
          }
        }
      }
      break;
  }
  
  // Adicionar animações
  if (moved) {
    animationQueue = moves;
    desenhar(); // Desenha com animações
  }
  
  return moved;
}

function moveTile(i, j, di, dj, moves) {
  let moved = false;
  let newI = i;
  let newJ = j;
  
  while (true) {
    const nextI = newI + di;
    const nextJ = newJ + dj;
    
    // Verificar limites
    if (nextI < 0 || nextI >= 4 || nextJ < 0 || nextJ >= 4) break;
    
    // Caso célula vazia
    if (board[nextI][nextJ] === 0) {
      board[nextI][nextJ] = board[newI][newJ];
      board[newI][newJ] = 0;
      newI = nextI;
      newJ = nextJ;
      moved = true;
      continue;
    }
    
    // Caso combinação
    if (board[nextI][nextJ] === board[newI][newJ]) {
      const newValue = board[newI][newJ] * 2;
      board[nextI][nextJ] = newValue;
      board[newI][newJ] = 0;
      pontuacao += newValue;
      
      // Registrar animação de combinação
      moves.push({
        type: 'merge',
        from: {i: newI, j: newJ},
        to: {i: nextI, j: nextJ},
        value: newValue
      });
      
      moved = true;
    }
    
    break;
  }
  
  // Registrar animação de movimento
  if (moved && (newI !== i || newJ !== j)) {
    moves.push({
      type: 'move',
      from: {i, j},
      to: {i: newI, j: newJ},
      value: board[newI][newJ]
    });
  }
  
  return moved;
}

function checkGameOver() {
  // Verificar células vazias
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      if (board[i][j] === 0) return false;
    }
  }
  
  // Verificar movimentos possíveis
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      if (i < 3 && board[i][j] === board[i + 1][j]) return false;
      if (j < 3 && board[i][j] === board[i][j + 1]) return false;
    }
  }
  
  gameOver = true;
  const gameOverMsg = document.createElement("div");
  gameOverMsg.style.position = "absolute";
  gameOverMsg.style.top = "0";
  gameOverMsg.style.left = "0";
  gameOverMsg.style.width = "100%";
  gameOverMsg.style.height = "100%";
  gameOverMsg.style.backgroundColor = "rgba(238, 228, 218, 0.73)";
  gameOverMsg.style.display = "flex";
  gameOverMsg.style.flexDirection = "column";
  gameOverMsg.style.alignItems = "center";
  gameOverMsg.style.justifyContent = "center";
  gameOverMsg.style.color = "#776e65";
  gameOverMsg.innerHTML = `
    <strong style="font-size: 24px;">FIM DE JOGO!</strong>
    <p style="font-size: 16px; margin: 10px 0;">Pontuação final: ${pontuacao}</p>
    <button id="play-again-btn" style="font-family: 'Press Start 2P', monospace; padding: 10px; cursor: pointer;">JOGAR NOVAMENTE</button>
  `;
  
  gameBoard.parentElement.appendChild(gameOverMsg);
  
  document.getElementById('play-again-btn').addEventListener('click', () => {
    gameOverMsg.remove();
    iniciar();
  });
  
  return true;
}

function draw2048() {
  gameBoard.innerHTML = "";
  
  // Cores para diferentes valores
  const colors = {
    0: "#cdc1b4",
    2: "#eee4da",
    4: "#ede0c8",
    8: "#f2b179",
    16: "#f59563",
    32: "#f67c5f",
    64: "#f65e3b",
    128: "#edcf72",
    256: "#edcc61",
    512: "#edc850",
    1024: "#edc53f",
    2048: "#edc22e",
    4096: "#3c3a32"
  };
  
  // Aplicar animações
  const animatedTiles = {};
  for (const anim of animationQueue) {
    if (anim.type === 'move' || anim.type === 'merge') {
      const key = `${anim.from.i}-${anim.from.j}`;
      animatedTiles[key] = anim;
    }
  }
  
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      const tile = document.createElement("div");
      tile.classList.add("tile");
      
      // Verificar se este tile está sendo animado
      const animKey = `${i}-${j}`;
      const anim = animatedTiles[animKey];
      
      if (anim && (anim.type === 'move' || anim.type === 'merge')) {
        // Posição original para animação
        tile.style.transform = `translate(${(anim.from.j - j) * 70}px, ${(anim.from.i - i) * 70}px)`;
        tile.style.transition = 'none';
        tile.style.zIndex = '10';
        
        // Forçar reflow para aplicar transform inicial
        tile.offsetHeight;
        
        // Animação para posição final
        setTimeout(() => {
          tile.style.transform = 'translate(0, 0)';
          tile.style.transition = 'transform 0.15s ease';
          
          // Adicionar efeito de combinação
          if (anim.type === 'merge') {
            setTimeout(() => {
              tile.classList.add('merge-effect');
              setTimeout(() => tile.classList.remove('merge-effect'), 150);
            }, 150);
          }
        }, 10);
      }
      
      // Configurar tile normal
      tile.textContent = board[i][j] === 0 ? "" : board[i][j];
      tile.style.backgroundColor = colors[board[i][j]] || "#3c3a32";
      tile.style.color = board[i][j] > 4 ? "#f9f6f2" : "#776e65";
      tile.style.fontSize = board[i][j] > 512 ? "12px" : board[i][j] > 64 ? "14px" : "16px";
      
      gameBoard.appendChild(tile);
    }
  }
  
  // Resetar fila de animações
  animationQueue = [];
}

// Adicionar evento para touch (mobile)
export function setupTouchControls() {
  let startX, startY;
  
  gameBoard.addEventListener('touchstart', e => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    e.preventDefault();
  });
  
  gameBoard.addEventListener('touchend', e => {
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    
    const diffX = endX - startX;
    const diffY = endY - startY;
    
    if (Math.abs(diffX) > 50 || Math.abs(diffY) > 50) {
      if (Math.abs(diffX) > Math.abs(diffY)) {
        tratarEvento(diffX > 0 ? "ArrowRight" : "ArrowLeft");
      } else {
        tratarEvento(diffY > 0 ? "ArrowDown" : "ArrowUp");
      }
    }
    
    e.preventDefault();
  });
}

// Inicializar controles touch ao carregar
window.addEventListener('load', () => {
  setupTouchControls();
});