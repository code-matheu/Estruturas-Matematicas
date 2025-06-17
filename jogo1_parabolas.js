import { canvas, ctx, drawText, infoPanel, gameInfo } from './common.js';

// Constantes
const GRID_SIZE = 40; // Cada quadrado = 1 unidade

// Variáveis para cálculo dinâmico
let ORIGIN_X, ORIGIN_Y, MAX_X, MAX_Y;

// Variáveis do jogo
let a = 1.0;
let b = 0.0;
let c = 0.0;
let showVertex = false;
let showRoots = false;
let showYIntercept = false;

export function iniciar() {
  // Calcular dinamicamente ao iniciar
  ORIGIN_X = Math.round(canvas.width / 2 / GRID_SIZE) * GRID_SIZE;
  ORIGIN_Y = Math.round(canvas.height / 2 / GRID_SIZE) * GRID_SIZE;
  MAX_X = Math.floor((canvas.width - ORIGIN_X) / GRID_SIZE);
  MAX_Y = Math.floor(ORIGIN_Y / GRID_SIZE);
  
  // Resetar todas as variáveis de estado
  a = 1.0;
  b = 0.0;
  c = 0.0;
  showVertex = false;
  showRoots = false;
  showYIntercept = false;
  
  // Limpar canvas completamente
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  atualizarPainelInfo();
  desenhar();
}

export function desenhar() {
  drawParabola();
}

export function tratarEvento(tecla) {
  if (tecla === "q") a += 0.1;
  if (tecla === "a") a -= 0.1;
  if (tecla === "w") b += 0.1;
  if (tecla === "s") b -= 0.1;
  if (tecla === "e") c += 0.1;
  if (tecla === "d") c -= 0.1;
  if (tecla === "v") showVertex = !showVertex;
  if (tecla === "r") showRoots = !showRoots;
  if (tecla === "y") showYIntercept = !showYIntercept;
  atualizarPainelInfo();
  desenhar();
}

function atualizarPainelInfo() {
  infoPanel.style.display = "block";
  gameInfo.innerHTML = `
    <strong>INSTRUÇÕES:</strong><br><br>
    <strong>Q/A</strong>: Alterar coeficiente 'a'<br>
    <strong>W/S</strong>: Alterar coeficiente 'b'<br>
    <strong>E/D</strong>: Alterar coeficiente 'c'<br><br>
    <strong>VISUALIZAÇÃO:</strong><br>
    <strong>V</strong>: ${showVertex ? "✔" : "✖"} Mostrar vértice<br>
    <strong>R</strong>: ${showRoots ? "✔" : "✖"} Mostrar raízes<br>
    <strong>Y</strong>: ${showYIntercept ? "✔" : "✖"} Mostrar intercepto Y<br><br>
    <strong>EQUAÇÃO ATUAL:</strong><br>
    f(x) = ${a.toFixed(1)}x² + ${b.toFixed(1)}x + ${c.toFixed(1)}
  `;
}

function drawGrid() {
  ctx.strokeStyle = "#888";
  ctx.lineWidth = 1;
  
  // Linhas verticais
  for (let x = ORIGIN_X - 10*GRID_SIZE; x <= ORIGIN_X + 10*GRID_SIZE; x += GRID_SIZE) {
    if (x >= 0 && x <= canvas.width) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
  }
  
  // Linhas horizontais
  for (let y = ORIGIN_Y - 7*GRID_SIZE; y <= ORIGIN_Y + 7*GRID_SIZE; y += GRID_SIZE) {
    if (y >= 0 && y <= canvas.height) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
  }
}

function drawAxes() {
  // Eixos principais
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 2;
  
  // Eixo X
  ctx.beginPath();
  ctx.moveTo(0, ORIGIN_Y);
  ctx.lineTo(canvas.width, ORIGIN_Y);
  ctx.stroke();
  
  // Eixo Y
  ctx.beginPath();
  ctx.moveTo(ORIGIN_X, 0);
  ctx.lineTo(ORIGIN_X, canvas.height);
  ctx.stroke();
  
  // Marcadores numéricos
  ctx.fillStyle = "#000";
  ctx.font = "10px 'Press Start 2P'";
  
  // Eixo X
  for (let x = -10; x <= 10; x++) {
    if (x !== 0) {
      const px = ORIGIN_X + x * GRID_SIZE;
      ctx.fillText(x.toString(), px - 5, ORIGIN_Y + 15);
    }
  }
  
  // Eixo Y
  for (let y = -7; y <= 7; y++) {
    if (y !== 0) {
      const py = ORIGIN_Y - y * GRID_SIZE;
      ctx.fillText(y.toString(), ORIGIN_X + 5, py + 3);
    }
  }
}

function drawParabola() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Desenha grade e eixos
  drawGrid();
  drawAxes();
  
  // Desenha a parábola
  ctx.beginPath();
  ctx.strokeStyle = "#0000cc";
  ctx.lineWidth = 3;
  let first = true;
  
  for (let px = 0; px < canvas.width; px++) {
    // Converter coordenada de tela para matemática
    const x = (px - ORIGIN_X) / GRID_SIZE;
    const y = a * x * x + b * x + c;
    
    // Converter coordenada matemática para tela
    const py = ORIGIN_Y - y * GRID_SIZE;
    
    if (first) {
      ctx.moveTo(px, py);
      first = false;
    } else {
      ctx.lineTo(px, py);
    }
  }
  ctx.stroke();

  // Calcular elementos importantes
  const vertex = calculateVertex();
  const roots = calculateRoots();
  const yIntercept = c;

  // Desenhar vértice se ativado
  if (showVertex) {
    const vx = ORIGIN_X + vertex.x * GRID_SIZE;
    const vy = ORIGIN_Y - vertex.y * GRID_SIZE;
    
    ctx.beginPath();
    ctx.arc(vx, vy, 8, 0, Math.PI * 2);
    ctx.fillStyle = "#ff0000";
    ctx.fill();
    
    // Garantir que o texto fique dentro do canvas
    const labelX = Math.max(20, Math.min(vx + 15, canvas.width - 200));
    const labelY = Math.max(40, Math.min(vy - 15, canvas.height - 20));
    
    drawText(`Vértice (${vertex.x.toFixed(1)}, ${vertex.y.toFixed(1)})`, 
             labelX, labelY, "#ff0000", 12);
  }

  // Desenhar raízes se ativado
  if (showRoots && roots) {
    roots.forEach(root => {
      const rx = ORIGIN_X + root * GRID_SIZE;
      const ry = ORIGIN_Y;
      
      ctx.beginPath();
      ctx.arc(rx, ry, 8, 0, Math.PI * 2);
      ctx.fillStyle = "#00aa00";
      ctx.fill();
      
      // Garantir que o texto fique dentro do canvas
      const labelX = Math.max(20, Math.min(rx + 15, canvas.width - 150));
      const labelY = Math.max(40, Math.min(ry - 15, canvas.height - 20));
      
      drawText(`Raiz (${root.toFixed(1)}, 0)`, labelX, labelY, "#00aa00", 12);
    });
    
    if (roots.length === 0) {
      // Posição fixa segura para "Sem raízes reais"
      drawText("Sem raízes reais", 40, 100, "#00aa00", 12);
    }
  }

  // Desenhar intercepto Y se ativado
  if (showYIntercept) {
    const ix = ORIGIN_X;
    const iy = ORIGIN_Y - yIntercept * GRID_SIZE;
    
    ctx.beginPath();
    ctx.arc(ix, iy, 8, 0, Math.PI * 2);
    ctx.fillStyle = "#aa00aa";
    ctx.fill();
    
    // Garantir que o texto fique dentro do canvas
    const labelX = Math.max(20, Math.min(ix + 15, canvas.width - 200));
    const labelY = Math.max(40, Math.min(iy - 15, canvas.height - 20));
    
    drawText(`Intercepto Y (0, ${yIntercept.toFixed(1)})`, 
             labelX, labelY, "#aa00aa", 12);
  }

  // Mostrar equação e controles
  drawText(`f(x) = ${a.toFixed(1)}x² + ${b.toFixed(1)}x + ${c.toFixed(1)}`, 20, 40, "#0000cc", 14);
}

function calculateVertex() {
  const x = -b / (2 * a);
  const y = a * x * x + b * x + c;
  return { x, y };
}

function calculateRoots() {
  const delta = b * b - 4 * a * c;
  
  if (delta < 0) return [];
  if (delta === 0) return [-b / (2 * a)];
  
  const x1 = (-b + Math.sqrt(delta)) / (2 * a);
  const x2 = (-b - Math.sqrt(delta)) / (2 * a);
  return [x1, x2].sort();
}