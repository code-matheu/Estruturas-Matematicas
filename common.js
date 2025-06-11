// Elementos DOM compartilhados
export const canvas = document.getElementById("gameCanvas");
export const ctx = canvas.getContext("2d");
export const controls = document.getElementById("controls");
export const canvasWrapper = document.getElementById("canvasWrapper");
export const menu = document.querySelector(".menu");
export const gameBoard = document.getElementById("game-board");
export const infoPanel = document.getElementById("info-panel");
export const gameInfo = document.getElementById("game-info");

// Funções de desenho compartilhadas
export function drawText(text, x, y, color = "#000", size = 16) {
  ctx.fillStyle = color;
  ctx.font = `${size}px 'Press Start 2P'`;
  ctx.fillText(text, x, y);
}

export function drawAxes() {
  ctx.strokeStyle = "#888";
  ctx.lineWidth = 1;
  const step = 40;
  const w = canvas.width;
  const h = canvas.height;

  // Grade
  ctx.beginPath();
  for (let x = 0; x <= w; x += step) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
  }
  for (let y = 0; y <= h; y += step) {
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
  }
  ctx.stroke();

  // Eixos principais
  ctx.strokeStyle = "#000";
  ctx.beginPath();
  ctx.moveTo(0, h / 2);
  ctx.lineTo(w, h / 2);
  ctx.moveTo(w / 2, 0);
  ctx.lineTo(w / 2, h);
  ctx.stroke();

  // Marcadores nos eixos (opcional)
  ctx.fillStyle = "#000";
  ctx.font = "10px 'Press Start 2P'";
  for (let x = -10; x <= 10; x++) {
    if (x !== 0) {
      const px = w / 2 + x * 40;
      ctx.fillText(x.toString(), px - 5, h / 2 + 15);
    }
  }
  for (let y = -7; y <= 7; y++) {
    if (y !== 0) {
      const py = h / 2 - y * 40;
      ctx.fillText(y.toString(), w / 2 + 5, py + 3);
    }
  }
}