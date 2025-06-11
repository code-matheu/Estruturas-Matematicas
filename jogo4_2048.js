// jogo4_2048.js
import { gameBoard } from './common.js';

let board = [];

export function iniciar() {
  board = Array.from({ length: 4 }, () => [0, 0, 0, 0]);
  addNewTile();
  addNewTile();
  desenhar();
}

export function desenhar() {
  draw2048();
}

export function tratarEvento(tecla) {
  if (tecla === "ArrowLeft") moveLeft();
  if (tecla === "ArrowRight") moveRight();
  if (tecla === "ArrowUp") moveUp();
  if (tecla === "ArrowDown") moveDown();
}

function addNewTile() {
  const empty = [];
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      if (board[i][j] === 0) empty.push({ x: i, y: j });
    }
  }
  if (empty.length > 0) {
    const r = empty[Math.floor(Math.random() * empty.length)];
    board[r.x][r.y] = 2;
  }
}

function moveLeft() {
  for (let i = 0; i < 4; i++) {
    let row = board[i].filter(n => n !== 0);
    for (let j = 0; j < row.length - 1; j++) {
      if (row[j] === row[j + 1]) {
        row[j] *= 2;
        row[j + 1] = 0;
      }
    }
    row = row.filter(n => n !== 0);
    while (row.length < 4) row.push(0);
    board[i] = row;
  }
  addNewTile();
  desenhar();
}

function moveRight() {
  for (let i = 0; i < 4; i++) {
    let row = board[i].filter(n => n !== 0);
    for (let j = row.length - 1; j > 0; j--) {
      if (row[j] === row[j - 1]) {
        row[j] *= 2;
        row[j - 1] = 0;
      }
    }
    row = row.filter(n => n !== 0);
    while (row.length < 4) row.unshift(0);
    board[i] = row;
  }
  addNewTile();
  desenhar();
}

function moveUp() {
  for (let j = 0; j < 4; j++) {
    let col = [];
    for (let i = 0; i < 4; i++) if (board[i][j] !== 0) col.push(board[i][j]);
    for (let i = 0; i < col.length - 1; i++) {
      if (col[i] === col[i + 1]) {
        col[i] *= 2;
        col[i + 1] = 0;
      }
    }
    col = col.filter(n => n !== 0);
    while (col.length < 4) col.push(0);
    for (let i = 0; i < 4; i++) board[i][j] = col[i];
  }
  addNewTile();
  desenhar();
}

function moveDown() {
  for (let j = 0; j < 4; j++) {
    let col = [];
    for (let i = 0; i < 4; i++) if (board[i][j] !== 0) col.push(board[i][j]);
    for (let i = col.length - 1; i > 0; i--) {
      if (col[i] === col[i - 1]) {
        col[i] *= 2;
        col[i - 1] = 0;
      }
    }
    col = col.filter(n => n !== 0);
    while (col.length < 4) col.unshift(0);
    for (let i = 0; i < 4; i++) board[i][j] = col[i];
  }
  addNewTile();
  desenhar();
}

function draw2048() {
  gameBoard.innerHTML = "";
  gameBoard.style.display = "grid";
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      const tile = document.createElement("div");
      tile.classList.add("tile");
      if (board[i][j] !== 0) {
        tile.textContent = board[i][j];
        tile.style.backgroundColor = "#f39c12";
      }
      gameBoard.appendChild(tile);
    }
  }
}