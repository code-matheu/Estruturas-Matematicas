// jogo3_funcoes_lineares.js
import { ctx, drawText, drawAxes, canvas } from './common.js';

let pontuacao3 = 0;
let rodada3 = 0;
let funcaoCorreta = null;
let opcoesFuncao = [];
let jogoGanho = false;
let confetes = [];
const GRID_SIZE = 40; // Each square = 1 unit
const ORIGIN_X = Math.floor(canvas.width / 2 / GRID_SIZE) * GRID_SIZE;
const ORIGIN_Y = Math.floor(canvas.height / 2 / GRID_SIZE) * GRID_SIZE;
const MAX_X = Math.floor((canvas.width - ORIGIN_X) / GRID_SIZE);
const MAX_Y = Math.floor(ORIGIN_Y / GRID_SIZE);

// Confetti colors and shapes
const CORES_CONFETE = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ff9900', '#9900ff'];
const FORMAS_CONFETE = ['retangulo', 'circulo', 'triangulo', 'linha'];

class Confete {
  constructor() {
    this.reset();
    this.y = Math.random() * -canvas.height;
  }

  reset() {
    this.x = Math.random() * canvas.width;
    this.y = -10;
    this.size = Math.random() * 12 + 6;
    this.color = CORES_CONFETE[Math.floor(Math.random() * CORES_CONFETE.length)];
    this.speedY = Math.random() * 3 + 2;
    this.speedX = Math.random() * 4 - 2;
    this.rotation = Math.random() * 360;
    this.rotationSpeed = Math.random() * 10 - 5;
    this.forma = FORMAS_CONFETE[Math.floor(Math.random() * FORMAS_CONFETE.length)];
    this.oscillation = Math.random() * 5;
    this.oscillationSpeed = Math.random() * 0.1;
    this.time = 0;
  }

  update() {
    this.y += this.speedY;
    this.x += this.speedX + Math.sin(this.time) * this.oscillation;
    this.rotation += this.rotationSpeed;
    this.time += this.oscillationSpeed;
    
    if (this.y > canvas.height + this.size) {
      this.reset();
    }
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation * Math.PI / 180);
    
    ctx.fillStyle = this.color;
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 2;

    switch(this.forma) {
      case 'retangulo':
        ctx.fillRect(-this.size/2, -this.size/2, this.size, this.size);
        break;
      case 'circulo':
        ctx.beginPath();
        ctx.arc(0, 0, this.size/2, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'triangulo':
        ctx.beginPath();
        ctx.moveTo(0, -this.size/2);
        ctx.lineTo(this.size/2, this.size/2);
        ctx.lineTo(-this.size/2, this.size/2);
        ctx.closePath();
        ctx.fill();
        break;
      case 'linha':
        ctx.beginPath();
        ctx.moveTo(-this.size, 0);
        ctx.lineTo(this.size, 0);
        ctx.stroke();
        break;
    }
    
    ctx.restore();
  }
}

export function iniciar() {
  pontuacao3 = 0;
  rodada3 = 0;
  jogoGanho = false;
  confetes = [];
  novaRodadaJogo3();
}

export function desenhar() {
  if (jogoGanho) {
    desenharVitoria();
  }
}

export function tratarEvento(tecla) {
  if (jogoGanho && tecla === "Enter") {
    iniciar();
  } else if (["1", "2", "3"].includes(tecla)) {
    verificarRespostaJogo3(parseInt(tecla) - 1);
  }
}

function gerarFuncaoLinear() {
  let m, b;
  let valida = false;
  
  while (!valida) {
    m = parseFloat((Math.random() * 4 - 2).toFixed(1));
    b = parseFloat((Math.random() * (MAX_Y * 0.8) * 2 - MAX_Y * 0.8).toFixed(1));
    
    const y1 = m * -MAX_X + b;
    const y2 = m * MAX_X + b;
    
    valida = (Math.abs(y1) <= MAX_Y * 0.8) && 
             (Math.abs(y2) <= MAX_Y * 0.8) &&
             (Math.abs(m) >= 0.3);
  }
  
  return { m, b };
}

function verificarVisibilidade(funcao) {
  const y1 = funcao.m * -MAX_X + funcao.b;
  const y2 = funcao.m * MAX_X + funcao.b;
  
  return y1 >= -MAX_Y && y1 <= MAX_Y && 
         y2 >= -MAX_Y && y2 <= MAX_Y;
}

function gerarOpcoes(correta) {
  const opcoes = [correta];
  let tentativas = 0;
  
  while (opcoes.length < 3 && tentativas < 100) {
    tentativas++;
    let f;
    
    if (Math.random() > 0.5) {
      f = {
        m: parseFloat((correta.m + (Math.random() * 2 - 1)).toFixed(1)),
        b: correta.b
      };
    } else {
      f = {
        m: correta.m,
        b: parseFloat((correta.b + (Math.random() * 4 - 2)).toFixed(1))
      };
    }
    
    if (!opcoes.some(o => o.m === f.m && o.b === f.b) && 
        verificarVisibilidade(f) &&
        Math.abs(f.m) >= 0.3) {
      opcoes.push(f);
    }
  }
  
  while (opcoes.length < 3) {
    const f = gerarFuncaoLinear();
    if (!opcoes.some(o => o.m === f.m && o.b === f.b)) {
      opcoes.push(f);
    }
  }
  
  return opcoes.sort(() => Math.random() - 0.5);
}

function desenharGraficoFuncao(f) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Draw grid
  ctx.strokeStyle = "#e0e0e0";
  ctx.lineWidth = 1;
  
  for (let x = 0; x <= canvas.width; x += GRID_SIZE) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  
  for (let y = 0; y <= canvas.height; y += GRID_SIZE) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
  
  // Draw axes
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, ORIGIN_Y);
  ctx.lineTo(canvas.width, ORIGIN_Y);
  ctx.moveTo(ORIGIN_X, 0);
  ctx.lineTo(ORIGIN_X, canvas.height);
  ctx.stroke();
  
  // Draw function - CORRECTED HANDLING OF NEGATIVE b VALUES
  ctx.beginPath();
  ctx.strokeStyle = "#cc0000";
  ctx.lineWidth = 3;
  
  // Calculate two points on the line
  const x1 = -MAX_X;
  const y1 = f.m * x1 + f.b;
  const px1 = ORIGIN_X + x1 * GRID_SIZE;
  const py1 = ORIGIN_Y - y1 * GRID_SIZE;
  
  const x2 = MAX_X;
  const y2 = f.m * x2 + f.b;
  const px2 = ORIGIN_X + x2 * GRID_SIZE;
  const py2 = ORIGIN_Y - y2 * GRID_SIZE;
  
  ctx.moveTo(px1, py1);
  ctx.lineTo(px2, py2);
  ctx.stroke();
  
  // Draw axis labels
  ctx.fillStyle = "#000";
  ctx.font = "12px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  
  // X axis labels
  for (let x = 1; x <= MAX_X; x++) {
    const px = ORIGIN_X + x * GRID_SIZE;
    ctx.fillText(x.toString(), px, ORIGIN_Y + 15);
  }
  
  for (let x = -1; x >= -MAX_X; x--) {
    const px = ORIGIN_X + x * GRID_SIZE;
    ctx.fillText(x.toString(), px, ORIGIN_Y + 15);
  }
  
  // Y axis labels
  for (let y = 1; y <= MAX_Y; y++) {
    const py = ORIGIN_Y - y * GRID_SIZE;
    ctx.fillText(y.toString(), ORIGIN_X - 15, py);
  }
  
  for (let y = -1; y >= -MAX_Y; y--) {
    const py = ORIGIN_Y - y * GRID_SIZE;
    ctx.fillText(y.toString(), ORIGIN_X - 15, py);
  }
  
  // Origin
  ctx.fillText("0", ORIGIN_X - 15, ORIGIN_Y + 15);
}

function criarConfetes() {
  confetes = [];
  for (let i = 0; i < 300; i++) {
    setTimeout(() => {
      confetes.push(new Confete());
    }, Math.random() * 2000);
  }
}

function desenharVitoria() {
  // Semi-transparent overlay
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Draw all confetti
  confetes.forEach(confete => {
    confete.update();
    confete.draw();
  });

  // Victory message
  ctx.fillStyle = '#000';
  ctx.font = 'bold 36px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('PARABÉNS! VOCÊ VENCEU!', canvas.width/2, canvas.height/2 - 40);
  
  ctx.font = '24px Arial';
  ctx.fillText(`Pontuação final: ${pontuacao3}`, canvas.width/2, canvas.height/2 + 20);
  
  ctx.font = '18px Arial';
  ctx.fillText('Pressione Enter para jogar novamente', canvas.width/2, canvas.height/2 + 70);
}

function novaRodadaJogo3() {
  if (pontuacao3 >= 100 && !jogoGanho) {
    jogoGanho = true;
    criarConfetes();
    
    const animar = () => {
      if (!jogoGanho) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      desenharVitoria();
      requestAnimationFrame(animar);
    };
    
    animar();
    return;
  }

  rodada3++;
  let funcaoValida = false;
  while (!funcaoValida) {
    funcaoCorreta = gerarFuncaoLinear();
    opcoesFuncao = gerarOpcoes(funcaoCorreta);
    
    funcaoValida = opcoesFuncao.every(f => verificarVisibilidade(f)) &&
                   new Set(opcoesFuncao.map(f => `${f.m},${f.b}`)).size === 3;
  }

  desenharGraficoFuncao(funcaoCorreta);
  
  // Draw question interface
  ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
  ctx.fillRect(20, 20, canvas.width - 40, 150);
  
  drawText("Qual é a função desta reta?", canvas.width/2, 50, "#000", 18, "center");
  
  opcoesFuncao.forEach((f, i) => {
    const sinalB = f.b >= 0 ? '+' : '-';
    drawText(`[${i + 1}] f(x) = ${f.m.toFixed(1)}x ${sinalB} ${Math.abs(f.b).toFixed(1)}`, 
             canvas.width/2, 90 + i * 30, "#000", 16, "center");
  });
  
  drawText(`Pontuação: ${pontuacao3}`, canvas.width - 100, 30, "#000", 14);
}

function verificarRespostaJogo3(opcao) {
  if (jogoGanho) return;

  const resposta = opcoesFuncao[opcao];
  const correta = funcaoCorreta;
  
  const acertou = Math.abs(resposta.m - correta.m) < 0.05 && 
                  Math.abs(resposta.b - correta.b) < 0.05;

  if (acertou) {
    pontuacao3 += 10;
    drawText("✓ Correto! +10 pontos", canvas.width/2, 180, "#0a0", 16, "center");
    setTimeout(() => novaRodadaJogo3(), 1000);
  } else {
    pontuacao3 = Math.max(0, pontuacao3 - 5);
    drawText("✗ Errado! -5 pontos", canvas.width/2, 180, "#a00", 16, "center");
    setTimeout(() => novaRodadaJogo3(), 1000);
  }
  localStorage.setItem("pontuacao3", pontuacao3);
}