// jogo2_conjuntos.js
import { ctx, drawText, canvas, controls, infoPanel, gameInfo } from './common.js';

let conjuntoPergunta = null;
let pontuacao = 0;
let opcoesRespostas = [];
let operacaoAtual = "∩"; // Inicia com interseção
const operacoes = {
  "∩": "Interseção (A ∩ B)",
  "∪": "União (A ∪ B)",
  "-": "Diferença (A - B)",
  "c": "Complemento (A')"
};

export function iniciar() {
  pontuacao = 0;
  operacaoAtual = "∩";
  controls.innerHTML = `CONJUNTOS | 1/2/3: selecionar | N: mudar operação | ESC: voltar`;
  atualizarPainelInfo();
  novaRodadaJogo2();
}

export function desenhar() {
  drawGame2();
}

export function tratarEvento(tecla) {
  if (["1", "2", "3"].includes(tecla)) {
    verificarRespostaJogo2(parseInt(tecla) - 1);
  }
  if (tecla === "n") {
    // Cicla entre as operações: ∩ → ∪ → - → c → ∩...
    const ops = Object.keys(operacoes);
    const index = ops.indexOf(operacaoAtual);
    operacaoAtual = ops[(index + 1) % ops.length];
    atualizarPainelInfo();
    novaRodadaJogo2();
  }
}

function atualizarPainelInfo() {
  infoPanel.style.display = "block";
  gameInfo.innerHTML = `
    <strong>INSTRUÇÕES:</strong><br><br>
    <strong>1/2/3</strong>: Selecionar resposta<br>
    <strong>N</strong>: Mudar operação<br><br>
    <strong>Operação Atual:</strong><br>
    ${operacoes[operacaoAtual]}<br><br>
    <strong>Pontuação:</strong> ${pontuacao}<br><br>
    <strong>Operações:</strong><br>
    - ∩: Interseção (itens em ambos)<br>
    - ∪: União (todos os itens)<br>
    - -: Diferença (A - B)<br>
    - c: Complemento (não em A)
  `;
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

function calcularOperacao(A, B) {
  switch(operacaoAtual) {
    case "∩": // Interseção
      return A.filter(e => B.includes(e));
    case "∪": // União
      return [...new Set([...A, ...B])];
    case "-": // Diferença A - B
      return A.filter(e => !B.includes(e));
    case "c": // Complemento de A (considerando universo A ∪ B)
      const universo = [...new Set([...A, ...B])];
      return universo.filter(e => !A.includes(e));
    default:
      return [];
  }
}

function novaRodadaJogo2() {
  conjuntoPergunta = gerarConjuntoAleatorio();
  const resultadoCorreto = calcularOperacao(conjuntoPergunta.A, conjuntoPergunta.B);
  const todas = [...new Set([...conjuntoPergunta.A, ...conjuntoPergunta.B])];
  
  opcoesRespostas = [resultadoCorreto];
  
  // Gerar opções incorretas
  while (opcoesRespostas.length < 3) {
    let falsa = [];
    const tamanhoAlvo = resultadoCorreto.length > 0 ? resultadoCorreto.length : 2;
    
    while (falsa.length < tamanhoAlvo) {
      const e = todas[Math.floor(Math.random() * todas.length)];
      if (!resultadoCorreto.includes(e) && !falsa.includes(e)) {
        falsa.push(e);
      }
    }
    
    // Garante que não há opções iguais
    if (!opcoesRespostas.some(o => o.join() === falsa.join())) {
      opcoesRespostas.push(falsa);
    }
  }
  
  opcoesRespostas = opcoesRespostas.sort(() => Math.random() - 0.5);
  drawGame2();
}

function drawGame2() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Título da operação atual
  drawText(`Operação: ${operacoes[operacaoAtual]}`, 40, 40, "#000", 14);
  
  // Conjunto A
  drawText("Conjunto A:", 40, 80, "#000", 16);
  drawText(conjuntoPergunta.A.join(" "), 40, 120, "#007700", 16);
  
  // Conjunto B
  drawText("Conjunto B:", 40, 180, "#000", 16);
  drawText(conjuntoPergunta.B.join(" "), 40, 220, "#770000", 16);
  
  // Pergunta baseada na operação
  let pergunta = "";
  switch(operacaoAtual) {
    case "∩": pergunta = "A ∩ B é:"; break;
    case "∪": pergunta = "A ∪ B é:"; break;
    case "-": pergunta = "A - B é:"; break;
    case "c": pergunta = "Complemento de A é:"; break;
  }
  drawText(pergunta, 40, 280, "#000", 16);
  
  // Opções de resposta
  opcoesRespostas.forEach((r, i) => {
    drawText(`[${i + 1}] ${r.join(" ")}`, 60, 340 + i * 40, "#000", 14);
  });
  
  // Pontuação
  drawText(`Pontos: ${pontuacao}`, 600, 40, "#000", 14);
}

function verificarRespostaJogo2(opcao) {
  const resultadoCorreto = calcularOperacao(conjuntoPergunta.A, conjuntoPergunta.B);
  
  if (opcoesRespostas[opcao].join() === resultadoCorreto.join()) {
    pontuacao += 10;
    drawText("Correto! +10 pontos", 40, 460, "#0a0", 14);
    setTimeout(() => novaRodadaJogo2(), 1000);
  } else {
    pontuacao = Math.max(0, pontuacao - 5);
    drawText("Errado! -5 pontos", 40, 460, "#a00", 14);
    setTimeout(() => novaRodadaJogo2(), 1000);
  }
  
  // Atualiza o painel de informações
  atualizarPainelInfo();
  localStorage.setItem("pontuacao2", pontuacao);
}