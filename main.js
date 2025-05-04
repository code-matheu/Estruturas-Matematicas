const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const controls = document.getElementById("controls");
const canvasWrapper = document.getElementById("canvasWrapper");
const menu = document.querySelector(".menu");

let a = 1.0, b = 0.0, c = 0.0;
let currentGame = 0;
let conjuntoPergunta = null;
let pontuacao = 0;
let pontuacao3 = 0;
let opcoesRespostas = [];
let fireworks = [];
let funcaoCorreta = null;
let opcoesFuncao = [];
let rodada3 = 0;

const botoes = [
  { id: 1, label: "Jogo 1: Parábolas" },
  { id: 2, label: "Jogo 2: Conjuntos" },
  { id: 3, label: "Jogo 3: Funções Lineares" }
];

window.addEventListener("load", () => {
  menu.innerHTML = "";
  botoes.forEach(botao => {
    const el = document.createElement("button");
    el.textContent = botao.label;
    el.style.margin = "10px";
    el.onclick = () => startGame(botao.id);
    menu.appendChild(el);
  });
  if (localStorage.getItem("pontuacao2")) pontuacao = parseInt(localStorage.getItem("pontuacao2"));
  if (localStorage.getItem("pontuacao3")) pontuacao3 = parseInt(localStorage.getItem("pontuacao3"));
});

function drawText(text, x, y, color = "#000", size = 16) {
  ctx.fillStyle = color;
  ctx.font = `${size}px 'Press Start 2P'`;
  ctx.fillText(text, x, y);
}

function drawParabola() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "#888";
  ctx.beginPath();
  ctx.moveTo(0, canvas.height / 2); ctx.lineTo(canvas.width, canvas.height / 2);
  ctx.moveTo(canvas.width / 2, 0); ctx.lineTo(canvas.width / 2, canvas.height);
  ctx.stroke();
  ctx.beginPath();
  ctx.strokeStyle = "#0000cc";
  ctx.lineWidth = 2;
  let first = true;
  for (let px = 0; px < canvas.width; px++) {
    let x = (px - canvas.width / 2) / 40;
    let y = a * x * x + b * x + c;
    let py = canvas.height / 2 - y * 40;
    if (first) { ctx.moveTo(px, py); first = false; } else { ctx.lineTo(px, py); }
  }
  ctx.stroke();
  drawText(`f(x) = ${a.toFixed(1)}x² + ${b.toFixed(1)}x + ${c.toFixed(1)}`, 20, 40, "#0000cc", 12);
}

function gerarConjuntoAleatorio() {
  const elementos = ["🍎", "🍌", "🍇", "🍉", "🍒", "🍍", "🥝", "🍓"];
  const A = [], B = [];
  while (A.length < 4) {
    const item = elementos[Math.floor(Math.random() * elementos.length)];
    if (!A.includes(item)) A.push(item);
  }
  while (B.length < 4) {
    const item = elementos[Math.floor(Math.random() * elementos.length)];
    if (!B.includes(item)) B.push(item);
  }
  return { A, B };
}

function novaRodadaJogo2() {
  conjuntoPergunta = gerarConjuntoAleatorio();
  const intersecao = conjuntoPergunta.A.filter(e => conjuntoPergunta.B.includes(e));
  const todas = [...new Set([...conjuntoPergunta.A, ...conjuntoPergunta.B])];
  opcoesRespostas = [intersecao];
  while (opcoesRespostas.length < 3) {
    const falsa = [];
    while (falsa.length < intersecao.length) {
      const e = todas[Math.floor(Math.random() * todas.length)];
      if (!intersecao.includes(e) && !falsa.includes(e)) falsa.push(e);
    }
    if (!opcoesRespostas.some(o => o.join() === falsa.join())) opcoesRespostas.push(falsa);
  }
  opcoesRespostas = opcoesRespostas.sort(() => Math.random() - 0.5);
  drawGame2();
}

function drawGame2() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawText("Conjunto A:", 40, 60, "#000", 16);
  drawText(conjuntoPergunta.A.join(" "), 40, 100, "#007700", 16);
  drawText("Conjunto B:", 40, 160, "#000", 16);
  drawText(conjuntoPergunta.B.join(" "), 40, 200, "#770000", 16);
  drawText("A ∩ B é:", 40, 260, "#000", 16);
  opcoesRespostas.forEach((r, i) => drawText(`[${i + 1}] ${r.join(" ")}`, 60, 320 + i * 40, "#000", 14));
  drawText(`Pontos: ${pontuacao}`, 600, 40, "#000", 14);
}

function novaRodadaJogo3() {
  rodada3++;
  const dificuldade = rodada3 > 6;
  funcaoCorreta = gerarFuncaoLinear(dificuldade);
  opcoesFuncao = gerarOpcoes(funcaoCorreta);
  desenharGraficoFuncao(funcaoCorreta);
  drawText("Qual é a função da reta?", 40, 60, "#000", 16);
  opcoesFuncao.forEach((f, i) => drawText(`[${i + 1}] f(x) = ${f.m.toFixed(1)}x + ${f.b.toFixed(1)}`, 40, 120 + i * 40, "#000", 14));
  drawText(`Pontos: ${pontuacao3}`, 600, 40, "#000", 14);
}

function gerarFuncaoLinear(dif = false) {
  return {
    m: parseFloat((Math.random() * (dif ? 4 : 2) - (dif ? 2 : 1)).toFixed(1)),
    b: parseFloat((Math.random() * (dif ? 10 : 6) - (dif ? 5 : 3)).toFixed(1))
  };
}

function gerarOpcoes(correta) {
  const opcoes = [correta];
  while (opcoes.length < 3) {
    const f = gerarFuncaoLinear(rodada3 > 6);
    if (!opcoes.some(o => o.m === f.m && o.b === f.b)) opcoes.push(f);
  }
  return opcoes.sort(() => Math.random() - 0.5);
}

function desenharGraficoFuncao(f) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "#ccc";
  ctx.beginPath();
  ctx.moveTo(0, canvas.height / 2); ctx.lineTo(canvas.width, canvas.height / 2);
  ctx.moveTo(canvas.width / 2, 0); ctx.lineTo(canvas.width / 2, canvas.height);
  ctx.stroke();
  ctx.beginPath(); ctx.strokeStyle = "#cc0000"; ctx.lineWidth = 2;
  let first = true;
  for (let px = 0; px < canvas.width; px++) {
    let x = (px - canvas.width / 2) / 40;
    let y = f.m * x + f.b;
    let py = canvas.height / 2 - y * 40;
    if (first) { ctx.moveTo(px, py); first = false; } else { ctx.lineTo(px, py); }
  }
  ctx.stroke();
}

function mostrarVitoria() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawText("VOCÊ VENCEU!", 200, 280, "#CC0000", 18);
  fireworks = Array.from({ length: 50 }, () => ({
    x: Math.random() * canvas.width,
    y: canvas.height,
    vx: (Math.random() - 0.5) * 5,
    vy: -Math.random() * 10 - 5,
    color: `hsl(${Math.random() * 360}, 100%, 50%)`
  }));
  animateFireworks();
}

function animateFireworks() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let f of fireworks) {
    ctx.fillStyle = f.color;
    ctx.beginPath(); ctx.arc(f.x, f.y, 3, 0, Math.PI * 2); ctx.fill();
    f.x += f.vx; f.y += f.vy; f.vy += 0.2;
  }
  requestAnimationFrame(animateFireworks);
}

function startGame(n) {
  currentGame = n;
  canvas.style.display = "block";
  controls.style.display = "block";
  canvasWrapper.style.display = "flex";
  menu.style.display = "none";
  if (n === 1) drawParabola();
  if (n === 2) { pontuacao = 0; novaRodadaJogo2(); }
  if (n === 3) { pontuacao3 = 0; rodada3 = 0; novaRodadaJogo3(); }
}

function returnToMenu() {
  currentGame = 0;
  canvas.style.display = "none";
  controls.style.display = "none";
  canvasWrapper.style.display = "none";
  menu.style.display = "block";
  conjuntoPergunta = null;
}

window.addEventListener("keydown", (e) => {
  if (currentGame === 0) return;
  if (e.key === "Escape") returnToMenu();
  if (currentGame === 1) {
    if (e.key === "q") a += 0.1;
    if (e.key === "a") a -= 0.1;
    if (e.key === "w") b += 0.1;
    if (e.key === "s") b -= 0.1;
    if (e.key === "e") c += 0.1;
    if (e.key === "d") c -= 0.1;
    drawParabola();
  }
  if (currentGame === 2 && ["1", "2", "3"].includes(e.key)) {
    verificarRespostaJogo2(parseInt(e.key) - 1);
  }
  if (currentGame === 3 && ["1", "2", "3"].includes(e.key)) {
    verificarRespostaJogo3(parseInt(e.key) - 1);
  }
});