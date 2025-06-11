import { canvas, controls, canvasWrapper, menu, gameBoard, infoPanel } from './common.js';
import * as jogo1 from './jogo1_parabolas.js';
import * as jogo2 from './jogo2_conjuntos.js';
import * as jogo3 from './jogo3_funcoes_lineares.js';
import * as jogo4 from './jogo4_2048.js';

let currentGame = 0;

// Carregar pontuações salvas
window.addEventListener("load", () => {
  if (localStorage.getItem("pontuacao2")) jogo2.pontuacao = parseInt(localStorage.getItem("pontuacao2"));
  if (localStorage.getItem("pontuacao3")) jogo3.pontuacao3 = parseInt(localStorage.getItem("pontuacao3"));
});

// Função para iniciar um jogo
export function startGame(n) {
  currentGame = n;
  canvas.style.display = "block";
  controls.style.display = "block";
  canvasWrapper.style.display = "flex";
  gameBoard.style.display = "none";
  menu.style.display = "none";
  infoPanel.style.display = "none"; // Oculta por padrão
  
  switch(n) {
    case 1: 
      jogo1.iniciar(); 
      infoPanel.style.display = "block"; // Mostra apenas para o Jogo 1
      break;
    case 2: 
      jogo2.iniciar();
      controls.innerHTML = `CONJUNTOS | 1/2/3: selecionar resposta | ESC: voltar`;
      break;
    case 3: 
      jogo3.iniciar();
      controls.innerHTML = `FUNÇÕES LINEARES | 1/2/3: selecionar resposta | ESC: voltar`;
      break;
    case 4: 
      jogo4.iniciar(); 
      canvas.style.display = "none";
      gameBoard.style.display = "grid";
      controls.innerHTML = `2048 | SETAS: mover blocos | ESC: voltar`;
      break;
  }
}

// Função para voltar ao menu
function returnToMenu() {
  currentGame = 0;
  canvas.style.display = "none";
  controls.style.display = "none";
  canvasWrapper.style.display = "none";
  gameBoard.style.display = "none";
  menu.style.display = "block";
  infoPanel.style.display = "none";
}

// Torna a função startGame global para ser chamada pelos botões
window.startGame = startGame;

// Gerenciador de eventos de teclado
window.addEventListener("keydown", (e) => {
  if (currentGame === 0) return;
  if (e.key === "Escape") return returnToMenu();
  
  switch(currentGame) {
    case 1: jogo1.tratarEvento(e.key); break;
    case 2: jogo2.tratarEvento(e.key); break;
    case 3: jogo3.tratarEvento(e.key); break;
    case 4: jogo4.tratarEvento(e.key); break;
  }
});