// Termos usados nos dois jogos (12 palavras) e suas pistas
const PALAVRAS = [
  { t: "CPU", p: "Cérebro do computador: busca, entende e executa as instruções dos programas." },
  { t: "ULA", p: "Parte da CPU que faz as contas e as operações lógicas." },
  { t: "REGISTRADORES", p: "Memórias minúsculas dentro da CPU, as mais rápidas de todas." },
  { t: "RAM", p: "Memória de trabalho: guarda programas em uso, mas apaga ao desligar." },
  { t: "ROM", p: "Memória só de leitura que guarda dados fixos e não apaga ao desligar." },
  { t: "EEPROM", p: "Memória que guarda dados sem energia e permite regravar byte a byte com pulso elétrico." },
  { t: "FLASH", p: "Memória sem energia, regravada em blocos, usada em pen drives e SSDs." },
  { t: "CACHE", p: "Memória pequena e veloz perto da CPU que guarda o que é usado com frequência." },
  { t: "DMA", p: "Permite que dispositivos troquem informações com a memória sem passar pela CPU." },
  { t: "DATABUS", p: "Fios que transportam o conteúdo lido ou gravado entre CPU e memória." },
  { t: "DUALCORE", p: "Um só chip com dois processadores completos trabalhando em conjunto." },
  { t: "QUADCORE", p: "Um só chip com quatro processadores completos trabalhando em conjunto." }
];
const N = PALAVRAS.length;
const $ = (id) => document.getElementById(id);

function embaralhar(lista) {
  const a = [...lista];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ---------- Abas ----------
function mostrar(jogo) {
  $("jogo-anagrama").hidden = jogo !== "anagrama";
  $("jogo-ligar").hidden = jogo !== "ligar";
  $("aba-anagrama").classList.toggle("ativa", jogo === "anagrama");
  $("aba-ligar").classList.toggle("ativa", jogo === "ligar");
}
$("aba-anagrama").onclick = () => mostrar("anagrama");
$("aba-ligar").onclick = () => mostrar("ligar");

// ---------- Jogo 1: palavra embaralhada ----------
function montarAnagrama() {
  const lista = $("a-lista");
  lista.innerHTML = "";
  embaralhar(PALAVRAS).forEach((w) => {
    let letras = w.t.split("");
    do { letras = embaralhar(letras); } while (letras.join("") === w.t);
    const item = document.createElement("div");
    item.className = "item";
    item.dataset.resposta = w.t;
    item.innerHTML = `<p class="pista"></p><div class="letras"></div>
      <input type="text" maxlength="${w.t.length}" autocomplete="off" aria-label="Sua resposta">`;
    item.querySelector(".pista").textContent = w.p;
    item.querySelector(".letras").innerHTML = letras.map((l) => `<span>${l}</span>`).join("");
    lista.appendChild(item);
  });
  $("a-placar").textContent = `0 de ${N} palavras`;
}

$("a-conferir").onclick = () => {
  let acertos = 0;
  document.querySelectorAll("#a-lista .item").forEach((item) => {
    const digitado = item.querySelector("input").value.trim().toUpperCase();
    const certo = digitado === item.dataset.resposta;
    item.classList.toggle("certo", certo);
    item.classList.toggle("errado", !certo);
    if (certo) acertos++;
  });
  $("a-placar").textContent = `${acertos} de ${N} palavras`;
};
$("a-reiniciar").onclick = montarAnagrama;

// ---------- Jogo 2: ligar pistas e termos ----------
let ordemTermos, ordemPistas, pares, selecionado, conferido;

function iniciarLigar() {
  ordemTermos = embaralhar(PALAVRAS.map((_, i) => i));
  ordemPistas = embaralhar(PALAVRAS.map((_, i) => i));
  pares = {}; // índice do termo -> índice da pista escolhida
  selecionado = null;
  conferido = false;
  desenharLigar();
  $("l-placar").textContent = `0 de ${N} pares`;
}

function desenharLigar() {
  const termos = $("l-termos");
  const pistas = $("l-pistas");
  termos.innerHTML = "";
  pistas.innerHTML = "";
  ordemTermos.forEach((i) => {
    const b = document.createElement("button");
    b.className = "cel" + (selecionado === i ? " sel" : "") + (i in pares ? " lig" : "");
    b.textContent = PALAVRAS[i].t;
    if (conferido && i in pares) b.classList.add(pares[i] === i ? "certo" : "errado");
    b.onclick = () => clicarTermo(i);
    termos.appendChild(b);
  });
  ordemPistas.forEach((j) => {
    const dono = Object.keys(pares).find((k) => pares[k] === j);
    const b = document.createElement("button");
    b.className = "cel" + (dono !== undefined ? " lig" : "");
    b.textContent = PALAVRAS[j].p;
    if (dono !== undefined) {
      const tag = document.createElement("small");
      tag.textContent = PALAVRAS[dono].t;
      b.prepend(tag);
      if (conferido) b.classList.add(Number(dono) === j ? "certo" : "errado");
    }
    b.onclick = () => clicarPista(j, dono);
    pistas.appendChild(b);
  });
}

function clicarTermo(i) {
  conferido = false;
  if (i in pares) { delete pares[i]; selecionado = null; }
  else selecionado = selecionado === i ? null : i;
  desenharLigar();
}

function clicarPista(j, dono) {
  conferido = false;
  if (dono !== undefined) { delete pares[dono]; }
  else if (selecionado !== null) { pares[selecionado] = j; selecionado = null; }
  desenharLigar();
}

$("l-conferir").onclick = () => {
  conferido = true;
  desenharLigar();
  const acertos = Object.keys(pares).filter((k) => pares[k] === Number(k)).length;
  $("l-placar").textContent = `${acertos} de ${N} pares`;
};
$("l-reiniciar").onclick = iniciarLigar;

montarAnagrama();
iniciarLigar();
