import { ctx, drawText, canvas, controls, infoPanel, gameInfo } from './common.js';

// Variáveis para cálculo dinâmico
let ORIGIN_X, ORIGIN_Y, MAX_X, MAX_Y;
const GRID_SIZE = 40; // Cada quadrado = 1 unidade

// Variáveis de estado
let pontuacao3 = 0;
let rodada3 = 0;
let funcaoCorreta = null;
let opcoesFuncao = [];
let jogoGanho = false;
let confetes = [];

// Cores e formas dos confetes
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
  pontuacao3 = parseInt(localStorage.getItem("pontuacao3")) || 0;
  rodada3 = 0;
  funcaoCorreta = null;
  opcoesFuncao = [];
  jogoGanho = false;
  confetes = [];
  
  // Calcular dinamicamente ao iniciar
  ORIGIN_X = Math.round(canvas.width / 2 / GRID_SIZE) * GRID_SIZE;
  ORIGIN_Y = Math.round(canvas.height / 2 / GRID_SIZE) * GRID_SIZE;
  MAX_X = Math.floor((canvas.width - ORIGIN_X) / GRID_SIZE);
  MAX_Y = Math.floor(ORIGIN_Y / GRID_SIZE);
  
  // Limpar canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  controls.innerHTML = `FUNÇÕES LINEARES | 1/2/3: selecionar | ESC: voltar`;
  novaRodadaJogo3();
  atualizarPainelInfo();
}

export function desenhar() {
  if (jogoGanho) {
    desenharVitoria();
  } else {
    desenharGraficoFuncao(funcaoCorreta);
    desenharInterface();
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
  
  // Desenhar grade - corrigido para centralizar com os eixos
  ctx.strokeStyle = "#e0e0e0";
  ctx.lineWidth = 1;
  
  // Linhas verticais alinhadas com a grade
  for (let x = ORIGIN_X % GRID_SIZE; x <= canvas.width; x += GRID_SIZE) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  
  // Linhas horizontais alinhadas com a grade
  for (let y = ORIGIN_Y % GRID_SIZE; y <= canvas.height; y += GRID_SIZE) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
  
  // Desenhar eixos
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 2;
  
  // Eixo X - agora centralizado com a grade
  ctx.beginPath();
  ctx.moveTo(0, ORIGIN_Y);
  ctx.lineTo(canvas.width, ORIGIN_Y);
  ctx.stroke();
  
  // Eixo Y - agora centralizado com a grade
  ctx.beginPath();
  ctx.moveTo(ORIGIN_X, 0);
  ctx.lineTo(ORIGIN_X, canvas.height);
  ctx.stroke();
  
  // Desenhar a função
  ctx.beginPath();
  ctx.strokeStyle = "#cc0000";
  ctx.lineWidth = 3;
  
  // Calcular dois pontos na reta: x = -MAX_X e x = MAX_X
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
  
  // Desenhar rótulos dos eixos
  ctx.fillStyle = "#000";
  ctx.font = "12px 'Press Start 2P'";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  
  // Rótulos do eixo X
  for (let x = -MAX_X; x <= MAX_X; x++) {
    if (x !== 0) {
      const px = ORIGIN_X + x * GRID_SIZE;
      ctx.fillText(x.toString(), px, ORIGIN_Y + 15);
    }
  }
  
  // Rótulos do eixo Y
  for (let y = -MAX_Y; y <= MAX_Y; y++) {
    if (y !== 0) {
      const py = ORIGIN_Y - y * GRID_SIZE;
      ctx.fillText(y.toString(), ORIGIN_X - 15, py);
    }
  }
  
  // Origem
  ctx.fillText("0", ORIGIN_X - 15, ORIGIN_Y + 15);
}

function desenharInterface() {
  // Reposicionar as perguntas para a parte inferior direita
  const boxWidth = Math.min(350, canvas.width * 0.75); // Largura um pouco maior
  const boxHeight = 170;
  const boxX = canvas.width - boxWidth - 20; // 20px de margem direita
  const boxY = canvas.height - boxHeight - 20; // 20px de margem inferior
  
  // Fundo semi-transparente com borda
  ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
  ctx.strokeStyle = "#333";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(boxX, boxY, boxWidth, boxHeight, 10);
  ctx.fill();
  ctx.stroke();
  
  // Título da pergunta
  const titulo = "Qual é a função desta reta?";
  drawText(titulo, boxX + boxWidth/2, boxY + 25, "#000", 13, "center");
  
  // Opções de resposta em linha única
  opcoesFuncao.forEach((f, i) => {
    const sinalB = f.b >= 0 ? '+' : '-';
    const texto = `[${i + 1}] f(x) = ${f.m.toFixed(1)}x ${sinalB} ${Math.abs(f.b).toFixed(1)}`;
    
    // Posição vertical baseada no índice
    const posY = boxY + 55 + i * 30;
    
    // Desenha o texto da opção
    drawText(texto, boxX + boxWidth/2, posY, "#000", 14, "center");
  });
  
  // Pontuação - mantido no canto superior direito
  drawText(`Pontuação: ${pontuacao3}`, canvas.width - 100, 30, "#000", 14);
}

function criarConfetes() {
  confetes = [];
  for (let i = 0; i < 300; i++) {
    confetes.push(new Confete());
  }
}

function desenharVitoria() {
  // Fundo semi-transparente
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Desenhar confetes
  confetes.forEach(confete => {
    confete.update();
    confete.draw();
  });

  // Mensagem de vitória
  ctx.fillStyle = '#000';
  ctx.font = 'bold 36px "Press Start 2P"';
  ctx.textAlign = 'center';
  ctx.fillText('PARABÉNS! VOCÊ VENCEU!', canvas.width/2, canvas.height/2 - 40);
  
  ctx.font = '24px "Press Start 2P"';
  ctx.fillText(`Pontuação final: ${pontuacao3}`, canvas.width/2, canvas.height/2 + 20);
  
  ctx.font = '18px "Press Start 2P"';
  ctx.fillText('Pressione Enter para jogar novamente', canvas.width/2, canvas.height/2 + 70);
}

function novaRodadaJogo3() {
  if (pontuacao3 >= 100 && !jogoGanho) {
    jogoGanho = true;
    criarConfetes();
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

  desenhar();
  atualizarPainelInfo();
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
  } else {
    pontuacao3 = Math.max(0, pontuacao3 - 5);
    drawText("✗ Errado! -5 pontos", canvas.width/2, 180, "#a00", 16, "center");
  }
  localStorage.setItem("pontuacao3", pontuacao3);
  
  atualizarPainelInfo();
  
  // Aguarda 1 segundo e passa para a próxima rodada
  setTimeout(() => {
    if (!jogoGanho) {
      novaRodadaJogo3();
    }
  }, 1000);
}

function atualizarPainelInfo() {
  infoPanel.style.display = "block";
  
  gameInfo.innerHTML = `
    <strong>INSTRUÇÕES:</strong><br><br>
    <strong>1/2/3</strong>: Selecionar a função correspondente ao gráfico<br>
    <strong>Enter</strong>: Reiniciar após vencer<br><br>
    <strong>OBJETIVO:</strong><br>
    Identifique a função linear (f(x) = mx + b) que corresponde ao gráfico em vermelho.<br><br>
    <strong>REGRAS:</strong><br>
    - Acerto: +10 pontos<br>
    - Erro: -5 pontos<br>
    - Vença ao atingir 100 pontos<br><br>
    <strong>PONTUAÇÃO ATUAL:</strong> ${pontuacao3}<br>
    <strong>RODADA:</strong> ${rodada3}
  `;
}

// Adiciona suporte para retângulos arredondados
CanvasRenderingContext2D.prototype.roundRect = function(x, y, width, height, radius) {
  if (width < 2 * radius) radius = width / 2;
  if (height < 2 * radius) radius = height / 2;
  
  this.beginPath();
  this.moveTo(x + radius, y);
  this.arcTo(x + width, y, x + width, y + height, radius);
  this.arcTo(x + width, y + height, x, y + height, radius);
  this.arcTo(x, y + height, x, y, radius);
  this.arcTo(x, y, x + width, y, radius);
  this.closePath();
  return this;
};