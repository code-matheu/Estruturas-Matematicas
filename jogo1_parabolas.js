import { canvas, ctx, drawText, drawAxes } from './common.js';

let a = 1.0, b = 0.0, c = 0.0;
let showVertex = false;
let showRoots = false;
let showYIntercept = false;

export function iniciar() {
  a = 1.0;
  b = 0.0;
  c = 0.0;
  showVertex = false;
  showRoots = false;
  showYIntercept = false;
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
  desenhar();
}

function drawParabola() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawAxes();
  
  // Desenhar a parábola
  ctx.beginPath();
  ctx.strokeStyle = "#0000cc";
  ctx.lineWidth = 3;
  let first = true;
  for (let px = 0; px < canvas.width; px++) {
    let x = (px - canvas.width / 2) / 40;
    let y = a * x * x + b * x + c;
    let py = canvas.height / 2 - y * 40;
    if (first) {
      ctx.moveTo(px, py);
      first = false;
    } else {
      ctx.lineTo(px, py);
    }
  }
  ctx.stroke();

  // Calcular e mostrar elementos importantes
  const vertex = calculateVertex();
  const roots = calculateRoots();
  const yIntercept = c;

  // Desenhar vértice se ativado
  if (showVertex) {
    const vx = canvas.width / 2 + vertex.x * 40;
    const vy = canvas.height / 2 - vertex.y * 40;
    
    ctx.beginPath();
    ctx.arc(vx, vy, 8, 0, Math.PI * 2);
    ctx.fillStyle = "#ff0000";
    ctx.fill();
    drawText(`Vértice (${vertex.x.toFixed(1)}, ${vertex.y.toFixed(1)})`, 
             vx + 15, vy - 15, "#ff0000", 12);
  }

  // Desenhar raízes se ativado
  if (showRoots && roots) {
    roots.forEach(root => {
      const rx = canvas.width / 2 + root * 40;
      const ry = canvas.height / 2;
      
      ctx.beginPath();
      ctx.arc(rx, ry, 8, 0, Math.PI * 2);
      ctx.fillStyle = "#00aa00";
      ctx.fill();
      drawText(`Raiz (${root.toFixed(1)}, 0)`, rx + 15, ry - 15, "#00aa00", 12);
    });
    
    if (roots.length === 0) {
      drawText("Sem raízes reais", 40, 100, "#00aa00", 12);
    }
  }

  // Desenhar intercepto Y se ativado
  if (showYIntercept) {
    const iy = canvas.height / 2 - yIntercept * 40;
    
    ctx.beginPath();
    ctx.arc(canvas.width / 2, iy, 8, 0, Math.PI * 2);
    ctx.fillStyle = "#aa00aa";
    ctx.fill();
    drawText(`Intercepto Y (0, ${yIntercept.toFixed(1)})`, 
             canvas.width / 2 + 15, iy - 15, "#aa00aa", 12);
  }

  // Mostrar equação e controles
  drawText(`f(x) = ${a.toFixed(1)}x² + ${b.toFixed(1)}x + ${c.toFixed(1)}`, 20, 40, "#0000cc", 14);
  
  // Legenda interativa
  drawText("Controles:", 20, canvas.height - 120, "#000", 12);
  drawText("Q/A: alterar 'a'", 40, canvas.height - 90, "#000", 10);
  drawText("W/S: alterar 'b'", 40, canvas.height - 70, "#000", 10);
  drawText("E/D: alterar 'c'", 40, canvas.height - 50, "#000", 10);
  drawText("V: mostrar vértice", 40, canvas.height - 30, "#000", 10);
  drawText("R: mostrar raízes", 40, canvas.height - 10, "#000", 10);
  drawText("Y: mostrar intercepto Y", 200, canvas.height - 30, "#000", 10);
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