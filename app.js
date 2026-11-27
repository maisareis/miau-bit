'use strict';
const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];
const main = $('#main');
const adventures = [
  {id:'scratch', tag:'SCRATCH · PRIMEIROS COMANDOS', title:'A estrela que caiu', description:'Bit precisa da sua ajuda para devolver uma estrela ao céu.', time:'5 min', skill:'Caminhos e lógica', medal:'Inventor de caminhos', symbol:'↗', filter:'logica'},
  {id:'python', tag:'PYTHON · REPETIÇÕES', title:'O piquenique das luzes', description:'Uma ideia brilhante para acender o quintal inteirinho!', time:'3 min', skill:'Criar e repetir', medal:'Acendedor de ideias', symbol:'☀', filter:'criar'},
  {id:'sql', tag:'SQL · DESCOBERTAS', title:'Cadê a peça amarela?', description:'A caixa de invenções está uma bagunça. Vamos procurar?', time:'3 min', skill:'Buscar e encontrar', medal:'Detetive das peças', symbol:'⌕', filter:'descobrir'},
  {id:'safety', tag:'SEGURANÇA DIGITAL · CUIDADO', title:'O convite misterioso', description:'Uma surpresa apareceu na tela. Será que dá para confiar?', time:'5 min', skill:'Cuidar e proteger', medal:'Guardião do quintal', symbol:'♧', filter:'proteger'},
  ...awarenessAdventures,
  ...bonusAdventures
];
let discovered = new Set();
try { discovered = new Set(JSON.parse(localStorage.getItem('miau-bit-stars-v1') || '[]').filter(id => adventures.some(a => a.id === id))); } catch (_) {}
let visit = 0;
let speech = null;
const motionReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
function toast(message) { $('#toast').textContent = message; $('#toast').classList.add('show'); setTimeout(() => $('#toast').classList.remove('show'), 3200); }
function updateProgress() {
  const n = collectedStars();
  $('#progress-count').textContent = Math.min(15,unlockStars()) + '/15';
  $('.pocket').setAttribute('aria-label','Minhas descobertas: ' + n + ' de 15 estrelas');
  $('.pocket').classList.toggle('journey-done', unlockStars() >= 15);
}
function award(id) { const fresh = !discovered.has(id), newPhase = rememberPhase(id); discovered.add(id); try { localStorage.setItem('miau-bit-stars-v1', JSON.stringify([...discovered])); } catch (_) {} updateProgress(); const a = adventures.find(item => item.id === id), nav = $('.phase-navigation'); if (a && nav) nav.outerHTML = phaseNavigation(a); if (fresh) toast('Uma estrela para a sua coleção! ✦'); else if (newPhase) toast('Mais uma fase descoberta! Sua ideia brilhou. ✦'); maybeCelebrateJourney(); }
function robotSVG(cls = '') { return `<svg class="${cls}" viewBox="0 0 160 180" aria-hidden="true"><path d="M81 30L91 13" stroke="#315a50" stroke-width="7" stroke-linecap="round"/><circle cx="94" cy="11" r="10" fill="#ef8550"/><path d="M25 114L13 135M135 114L147 135" stroke="#3b8c7a" stroke-width="14" stroke-linecap="round"/><rect x="35" y="104" width="91" height="52" rx="23" fill="#358d7d"/><path d="M52 155v13M108 155v13" stroke="#334c48" stroke-width="12"/><ellipse cx="46" cy="170" rx="21" ry="9" fill="#ed854b"/><ellipse cx="112" cy="170" rx="21" ry="9" fill="#ed854b"/><rect x="19" y="31" width="124" height="90" rx="37" fill="#348e80"/><rect x="30" y="44" width="103" height="65" rx="26" fill="#fcf0d2"/><ellipse cx="59" cy="72" rx="6" ry="10" fill="#264b4a"/><ellipse cx="106" cy="72" rx="6" ry="10" fill="#264b4a"/><path d="M72 91q10 11 20 0" fill="none" stroke="#264b4a" stroke-width="4" stroke-linecap="round"/><circle cx="82" cy="135" r="13" fill="#f9d47a"/><path d="M81 128v14M75 135h14" stroke="#db8c3b" stroke-width="4" stroke-linecap="round"/></svg>`; }
function catSVG() { return `<svg viewBox="0 0 180 210" aria-hidden="true"><path d="M135 155q54 6 26-39" fill="none" stroke="#e98641" stroke-width="19" stroke-linecap="round"/><path d="M40 190l10-52h76l11 52" fill="#665885"/><path d="M67 184v16M109 184v16" stroke="#e8964b" stroke-width="24" stroke-linecap="round"/><path d="M44 137L24 155M127 136L149 153" stroke="#f0a14e" stroke-width="16" stroke-linecap="round"/><path d="M31 67L28 13l43 26M110 37l43-24-6 61" fill="#e98d44"/><path d="M41 48l-2-19 17 15M126 44l17-15-2 21" fill="#efb78a"/><ellipse cx="89" cy="85" rx="69" ry="59" fill="#f3aa51"/><ellipse cx="89" cy="112" rx="34" ry="22" fill="#ffe5ae"/><path d="M73 109q15 22 31 0" fill="#694138"/><path d="M80 98h18l-9 8" fill="#d57259"/><ellipse cx="59" cy="82" rx="7" ry="11" fill="#503b36"/><ellipse cx="118" cy="82" rx="7" ry="11" fill="#503b36"/><path d="M80 44l9 13 9-13M26 88l13 3M139 90l12-3" stroke="#c97533" stroke-width="6" stroke-linecap="round"/><path d="M41 58q47-36 94 0" stroke="#384c4d" stroke-width="12" fill="none"/><ellipse cx="62" cy="48" rx="25" ry="21" fill="#428b7e" stroke="#205c56" stroke-width="5"/><ellipse cx="116" cy="48" rx="25" ry="21" fill="#428b7e" stroke="#205c56" stroke-width="5"/><path d="M48 49l18-11M104 49l18-11" stroke="#a2c5b6" stroke-width="5" stroke-linecap="round"/><path d="M55 139v33h66v-33" fill="#665885"/><rect x="78" y="155" width="24" height="23" rx="3" fill="#f4cb66" transform="rotate(6 90 166)"/></svg>`; }
function cardArt(id) {
  if (awarenessAdventures.some(a=>a.id===id)) return awarenessCardArt(id);
  const start = '<svg class="art-svg" viewBox="0 0 250 160" aria-hidden="true">';
  if (id === 'scratch') return start + '<path d="M30 128h51V83h53V39h56" stroke="#fff5d9" stroke-width="31" fill="none" stroke-linejoin="round"/><path d="M30 128h51V83h53V39h56" stroke="#c08c4b" stroke-width="2" stroke-dasharray="5 7" fill="none"/><path d="M197 13l8 17 19 3-14 13 3 19-16-9-17 9 3-19-14-13 19-3z" fill="#fff4bd" stroke="#bd853e" stroke-width="2"/><rect x="19" y="100" width="43" height="37" rx="12" fill="#377f70"/><rect x="25" y="106" width="31" height="22" rx="7" fill="#fdf0d0"/><circle cx="35" cy="116" r="2.5" fill="#244d45"/><circle cx="47" cy="116" r="2.5" fill="#244d45"/><path d="M40 100v-7" stroke="#377f70" stroke-width="3"/><circle cx="40" cy="90" r="4" fill="#ec7546"/><path d="M106 128l12-14M107 128h12M107 128v-12" stroke="#a56f3d" stroke-width="3" fill="none" stroke-linecap="round"/></svg>';
  if (id === 'python') return start + '<path d="M14 38Q125 68 236 38" fill="none" stroke="#477968" stroke-width="3"/><path d="M52 49v15M101 56v20M151 56v20M200 49v15" stroke="#477968" stroke-width="2"/><g fill="#f9d176" stroke="#c99f44" stroke-width="2"><rect x="37" y="64" width="30" height="43" rx="11"/><rect x="86" y="76" width="30" height="43" rx="11"/><rect x="136" y="76" width="30" height="43" rx="11"/><rect x="185" y="64" width="30" height="43" rx="11"/></g><path d="M52 74v23M101 86v23M151 86v23M200 74v23" stroke="#fff5ce" stroke-width="6" stroke-linecap="round"/><path d="M13 137q90-22 224 0" stroke="#8eae94" stroke-width="20" stroke-linecap="round"/><path d="M123 25v10M118 30h10M27 19v8M23 23h8M218 121v9M214 125h8" stroke="#ed9a51" stroke-width="3" stroke-linecap="round"/></svg>';
  if (id === 'sql') return start + '<rect x="32" y="32" width="153" height="108" rx="8" fill="#c5ae8d"/><path d="M43 70h131M43 112h131" stroke="#a98b70" stroke-width="7"/><path d="M50 43h25v24H50zM91 43h25v24H91z" fill="#efc865"/><circle cx="148" cy="55" r="12" fill="#7aaa9d"/><path d="M53 85h24v24H53z" fill="#8099b4"/><path d="M96 83l15 26H81z" fill="#e4ac6c"/><circle cx="148" cy="96" r="13" fill="#efc865"/><circle cx="174" cy="96" r="26" fill="#fff5da80" stroke="#6b5e8d" stroke-width="7"/><path d="M191 117l21 23" stroke="#6b5e8d" stroke-width="10" stroke-linecap="round"/><path d="M210 27v14M203 34h14" stroke="#9b86b3" stroke-width="3" stroke-linecap="round"/></svg>';
  return start + '<rect x="41" y="26" width="145" height="100" rx="14" fill="#fff5df" stroke="#7897a5" stroke-width="3"/><path d="M98 126v12M77 140h75" stroke="#7897a5" stroke-width="6" stroke-linecap="round"/><path d="M50 44h128" stroke="#c6d9dc" stroke-width="2"/><circle cx="54" cy="35" r="3" fill="#e58f65"/><circle cx="65" cy="35" r="3" fill="#e9c979"/><circle cx="76" cy="35" r="3" fill="#8dae9c"/><path d="M114 58l30 11v20q0 26-30 36-30-10-30-36V69z" fill="#397d70"/><path d="M102 88l9 9 17-21" fill="none" stroke="#fff1bc" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/><path d="M200 50v14M193 57h14M30 102v10M25 107h10" stroke="#eca066" stroke-width="3" stroke-linecap="round"/></svg>';
}
function card(a) { return journeyCard(a); }
const channelURL = 'https://www.youtube.com/@MiauBit-j4z';
const firstEpisode = {
  title: 'O robô que não sabia fazer um sanduíche!',
  series: 'PEQUENOS PROGRAMADORES · EPISÓDIO 1',
  duration: '1 min e 36 s',
  url: 'https://youtu.be/VwPWm9z73RA',
  image: 'assets/episodio-sanduiche.jpg',
  alt: 'Miau e Bit com um pacote de pão inteiro no prato: Assim? Assim?',
  description: 'Miau pediu um sanduíche ao Bit… mas o robozinho levou as instruções ao pé da letra! Uma confusão deliciosa em que cada passo tem sua vez.',
  gameURL: '#aventura/scratch',
  gameLabel: 'Brincar com os comandos'
};
const guardianEpisode = {
  title: 'A foto que viajou pelo mundo',
  series: 'GUARDIÕES DO MUNDO DIGITAL · PRIVACIDADE',
  duration: '48 s',
  url: 'https://www.youtube.com/watch?v=OSTldiPm5cU',
  image: 'assets/episodio-foto.jpg',
  alt: 'Miau e Bit observam no computador a foto de um foguete, com uma mochila ao fundo.',
  description: 'Miau quer mostrar a foto do seu foguete, mas Bit percebe um detalhe no fundo da imagem! Com ajuda de um adulto, os amigos descobrem o que merece cuidado antes de compartilhar.',
  gameURL: '#aventura/mochila',
  gameLabel: 'Brincar de cuidar dos segredos'
};
const lumaEpisode = {
  title: 'Luma chegou!',
  series: 'PEQUENOS PROGRAMADORES · UMA NOVA AMIGA',
  duration: '30 s',
  url: 'https://youtu.be/zpPNoeEGfYc',
  image: 'assets/episodio-luma.jpg',
  alt: 'Miau e Bit recebem Luma, uma gatinha cinza de jardineira lilás e mochila amarela, na oficina.',
  description: 'Uma nova amiga chegou ao quintal! Luma conhece Miau e Bit, mas um pedido para passear vira uma pequena confusão quando o robozinho entende tudo ao pé da letra. Uma história sobre amizade e instruções claras.',
  gameURL: '#aventura/scratch',
  gameLabel: 'Brincar com os comandos'
};
const brincadeiraEpisode = {
  title: 'A brincadeira que não teve graça',
  series: 'GUARDIÕES DO MUNDO DIGITAL · RESPEITO NA INTERNET',
  duration: '55 s',
  url: 'https://www.youtube.com/watch?v=kIbC512rTNg',
  image: 'assets/episodio-brincadeira.jpg',
  fallbackImage: 'assets/episodio-brincadeira.svg',
  alt: 'Miniatura do vídeo A brincadeira que não teve graça no YouTube.',
  description: 'Uma história para conversar sobre respeito, empatia e o que fazer quando uma brincadeira machuca alguém.',
  gameURL: '#aventuras',
  gameLabel: 'Explorar as aventuras'
};
const nicoEpisode = {
  title: 'Nico e o Jogador Misterioso',
  series: 'GUARDIÕES DO MUNDO DIGITAL · JOGOS ONLINE',
  duration: '3 min e 25 s',
  url: 'https://youtu.be/q0HkjPpdj0U',
  image: 'assets/episodio-nico.jpg',
  alt: 'Nico, Miau, Bit e Luma investigam uma mensagem no tablet.',
  description: 'Um jogador desconhecido sabe o nome de Nico, sua cor favorita e até seus pontos no jogo! A turma investiga as pistas e descobre a importância de pedir ajuda a um adulto de confiança.',
  gameURL: '#aventuras',
  gameLabel: 'Explorar as aventuras'
};
const ticoEpisode = {
  title: 'Tico, o Robô que Guardava Tudo',
  series: 'PEQUENOS PROGRAMADORES · INSTRUÇÕES CLARAS',
  duration: '1 min e 28 s',
  url: 'https://youtu.be/0vo0BqKoHls',
  image: 'assets/episodio-tico.jpg',
  alt: 'Miau apresenta Tico, o robozinho que começa a guardar os brinquedos da oficina.',
  description: 'Miau apresenta sua nova invenção! Tico começa a guardar tudo que está no chão e acaba levando até o tênis da Luma. Uma confusão divertida sobre dar instruções claras.',
  gameURL: '#aventura/receita',
  gameLabel: 'Brincar com as instruções'
};
const portinhaEpisode = {
  title: 'A Portinha que Apareceu do Nada',
  series: 'PEQUENOS PROGRAMADORES · PADRÕES E DESCOBERTAS',
  duration: '1 min e 43 s',
  url: 'https://youtu.be/oEoTZtdmUjg',
  image: 'assets/episodio-portinha.jpg',
  alt: 'Miau, Bit e Luma encontram uma portinha misteriosa na oficina.',
  description: 'Uma portinha apareceu na oficina! Entre pistas, desenhos e padrões, Miau, Bit e Luma testam ideias para descobrir o que existe do outro lado.',
  gameURL: '#aventura/padroes',
  gameLabel: 'Descobrir os padrões'
};
const senhaEpisode = {
  title: 'A senha do quintal',
  series: 'GUARDIÕES DO MUNDO DIGITAL · SENHAS',
  duration: '35 s',
  url: 'https://youtu.be/D89i45o4kk4',
  image: 'assets/episodio-senha.jpg',
  alt: 'Miau, Bit e Luma conversam sobre os segredos do quintal.',
  description: 'Uma pista inesperada faz Bit achar que tem superpoderes! Com Luma e a ajuda de um adulto, a turma descobre por que uma senha merece cuidado.',
  gameURL: '#aventura/senhas',
  gameLabel: 'Cuidar das senhas do quintal'
};
const presenteEpisode = {
  title: 'O presente misterioso',
  series: 'GUARDIÕES DO MUNDO DIGITAL · MENSAGENS E CUIDADO',
  duration: '1 min e 6 s',
  url: 'https://youtu.be/eHS82L7CWmw',
  image: 'assets/episodio-presente.jpg',
  alt: 'Miau e Bit encontram uma mensagem sobre um presente no computador.',
  description: 'Um presente misterioso apareceu no computador, mas a mensagem pede um segredo. Miau e Bit descobrem como cuidar das informações e pedir ajuda antes de continuar.',
  gameURL: '#aventura/safety',
  gameLabel: 'Brincar de cuidar do quintal'
};
const episodes = [nicoEpisode, ticoEpisode, portinhaEpisode, senhaEpisode, brincadeiraEpisode, guardianEpisode, lumaEpisode, presenteEpisode, firstEpisode];
function lumaSVG() {
  return `<svg viewBox="0 0 180 210" aria-hidden="true"><path d="M137 156q40-3 20-39" fill="none" stroke="#a7a8b2" stroke-width="17" stroke-linecap="round"/><path d="M147 126l8 8m0 10 7 5" stroke="#858695" stroke-width="5" stroke-linecap="round"/><rect x="43" y="121" width="94" height="65" rx="20" fill="#e6b64e"/><path d="M52 148l-19 19m94-19 19 19" stroke="#a7a8b2" stroke-width="15" stroke-linecap="round"/><circle cx="30" cy="169" r="9" fill="#f9f5eb"/><circle cx="149" cy="169" r="9" fill="#f9f5eb"/><path d="M58 183v16m63-16v16" stroke="#a7a8b2" stroke-width="18" stroke-linecap="round"/><path d="M47 200h24m39 0h25" stroke="#9180b4" stroke-width="13" stroke-linecap="round"/><path d="M54 133q35-19 72 0l8 37H46z" fill="#fff3dc"/><path d="M61 130v22h56v-22m-62 19h69v36H55z" fill="#a694c3"/><path d="M60 137v15m59-15v15" stroke="#8572a4" stroke-width="6"/><circle cx="61" cy="152" r="4" fill="#f5cf65"/><circle cx="118" cy="152" r="4" fill="#f5cf65"/><path d="M30 68 28 15l43 27m39-2 42-25-5 56" fill="#a7a8b2"/><path d="M40 49 38 30l18 16m70 0 16-16-2 22" fill="#eab9ba"/><ellipse cx="89" cy="84" rx="68" ry="59" fill="#b9bac3"/><path d="M72 30 83 17l5 16 13-13 1 17" fill="#b9bac3"/><path d="m76 43 7 12m15-12-6 12M26 85l12 4m102 0 12-4" stroke="#8d8e9d" stroke-width="5" stroke-linecap="round"/><ellipse cx="89" cy="111" rx="36" ry="25" fill="#f9f5eb"/><ellipse cx="59" cy="82" rx="9" ry="12" fill="#477b5c"/><ellipse cx="118" cy="82" rx="9" ry="12" fill="#477b5c"/><ellipse cx="59" cy="83" rx="4" ry="8" fill="#253e36"/><ellipse cx="118" cy="83" rx="4" ry="8" fill="#253e36"/><circle cx="56" cy="78" r="3" fill="#fff"/><circle cx="115" cy="78" r="3" fill="#fff"/><path d="M81 100h16l-8 8" fill="#cf8e98"/><path d="M76 113q13 16 26 0" fill="none" stroke="#6d535c" stroke-width="3" stroke-linecap="round"/><path d="M47 104l-19-4m18 12-19 3m105-11 18-4m-18 12 19 3" stroke="#8d8e9d" stroke-width="2" stroke-linecap="round"/></svg>`;
}
function featuredNicoEpisode() {
  return `<section class="luma-arrival featured-episode featured-nico" aria-labelledby="featured-nico-title">
    <a class="episode-cover-link" href="${nicoEpisode.url}" target="_blank" rel="noopener noreferrer" data-watch-video aria-label="Assistir a Nico e o Jogador Misterioso no YouTube, em outra aba">
      <img src="${nicoEpisode.image}" alt="${nicoEpisode.alt}" width="960" height="540" loading="lazy">
      <span class="episode-play-badge" aria-hidden="true">▶</span>
    </a>
    <div><span class="eyebrow">NOVIDADE NO QUINTAL · JOGOS ONLINE</span><h2 id="featured-nico-title">${nicoEpisode.title}</h2><p>Um jogador desconhecido sabe até a cor favorita do Nico! Miau, Bit e Luma ajudam o novo amigo a seguir as pistas e a pedir ajuda quando a conversa fica estranha.</p>
      <div class="episode-actions"><a class="button primary" href="${nicoEpisode.url}" target="_blank" rel="noopener noreferrer" data-watch-video>Assistir à história do Nico <span aria-hidden="true">↗</span></a><a class="text-link" href="#turma">Conhecer os amigos ↗</a></div>
    </div>
  </section>`;
}
function featuredTicoEpisode() {
  return `<section class="episode-home featured-episode featured-tico" aria-labelledby="featured-tico-title">
    <a class="episode-cover-link" href="${ticoEpisode.url}" target="_blank" rel="noopener noreferrer" data-watch-video aria-label="Assistir a Tico, o Robô que Guardava Tudo no YouTube, em outra aba">
      <img src="${ticoEpisode.image}" alt="${ticoEpisode.alt}" width="960" height="540" loading="lazy">
      <span class="episode-play-badge" aria-hidden="true">▶</span>
    </a>
    <div class="episode-home-copy">
      <span class="eyebrow">UMA INVENÇÃO DO MIAU · INSTRUÇÕES CLARAS</span>
      <h2 id="featured-tico-title">${ticoEpisode.title}</h2>
      <p>Tico chegou para ajudar a organizar a oficina. Mas guardar tudo inclui até o tênis da Luma? Uma confusão divertida sobre explicar direitinho o que queremos.</p>
      <div class="episode-actions"><a class="button primary" href="${ticoEpisode.url}" target="_blank" rel="noopener noreferrer" data-watch-video>Assistir à história do Tico <span aria-hidden="true">↗</span></a><a class="text-link" href="#turma">Conhecer os amigos ↗</a></div>
    </div>
  </section>`;
}
function episodeCard(episode) {
  return `<article class="episode-card">
    <a class="episode-cover-link" href="${episode.url}" target="_blank" rel="noopener noreferrer" data-watch-video aria-label="Assistir a ${episode.title} no YouTube, em outra aba">
      <img src="${episode.image}" alt="${episode.alt}" width="960" height="540" loading="lazy"${episode.fallbackImage ? ` onerror="this.onerror=null;this.src='${episode.fallbackImage}'"` : ''}>
      <span class="episode-play-badge" aria-hidden="true">▶</span>
    </a>
    <div class="episode-card-copy">
      <span class="eyebrow">${episode.series}</span>
      <h2>${episode.title}</h2>
      <p>${episode.description}</p>
      <div class="episode-meta"><span>◷ ${episode.duration}</span><span>✦ Para curiosos de 6 anos ou mais</span></div>
      <div class="episode-actions">
        <a class="button primary" href="${episode.url}" target="_blank" rel="noopener noreferrer" data-watch-video aria-label="Assistir a ${episode.title} no YouTube, em outra aba">Assistir no YouTube <span aria-hidden="true">↗</span></a>
        <a class="text-link" href="${episode.gameURL}">${episode.gameLabel} ↗</a>
      </div>
      <p class="episode-online-note">O vídeo abre no YouTube, em outra aba, e precisa de internet. Os jogos preparados continuam funcionando offline.</p>
    </div>
  </article>`;
}
function episodePage() {
  main.innerHTML = `<section class="page-heading episode-heading"><span class="eyebrow">PEQUENAS AVENTURAS, GRANDES DESCOBERTAS</span><h1>Histórias esperam por você!</h1><p>Miau, Bit e Luma também vivem aventuras em vídeo. Prepare a curiosidade e venha assistir!</p></section><section class="episode-library">${episodes.map(episodeCard).join('')}<div class="episode-after"><span aria-hidden="true">✦</span><div><h2>Agora é a sua vez de descobrir!</h2><p>Escolha uma aventura para brincar com as ideias das histórias.</p></div><a class="button secondary" href="#aventuras">Escolher uma aventura <span aria-hidden="true">↗</span></a></div></section>`;
}

function bindEpisodeLinks() {
  $$('[data-watch-video]').forEach(link => link.addEventListener('click', event => {
    if (!navigator.onLine) {
      event.preventDefault();
      toast('Para assistir ao vídeo, conecte à internet. Os jogos do quintal continuam aqui!');
    }
  }));
}

function home() {
  main.innerHTML = `<section class="hero"><div class="hero-copy"><div class="eyebrow"><span class="little-star" aria-hidden="true">✦</span> UM MUNDO DE IDEIAS ESPERA POR VOCÊ</div><h1>Brincar, inventar<br>e <em>descobrir.</em></h1><p>No quintal de Miau e Bit, uma pequena ideia pode virar uma grande aventura. Vamos nessa?</p><div class="hero-actions"><a class="button primary" href="#aventura/scratch">Começar a aventura <span aria-hidden="true">↗</span></a><a class="text-link" href="#turma">Conhecer a turma</a></div><div class="hero-foot"><span>✦ Para pequenos curiosos de 6 anos ou mais</span><span>No seu ritmo</span></div></div><div class="hero-picture"><img class="hero-art" src="assets/quintal.webp" alt="Miau, um gatinho laranja inventor, segura uma estrela brilhante ao lado de Bit, seu amigo robozinho verde, no quintal de uma oficina." width="768" height="512" fetchpriority="high"><span class="picture-star" aria-hidden="true">✦</span><span class="handwritten">Uma ideia. Dois amigos. Mil possibilidades!</span><span class="picture-orbit" aria-hidden="true">imaginar<br>é só o<br>começo ↗</span></div></section><section class="welcome-strip"><span class="line"></span><span class="flower" aria-hidden="true">✳</span> Aqui a gente aprende fazendo… e se diverte descobrindo! <span class="flower" aria-hidden="true">✳</span><span class="line"></span></section>${featuredNicoEpisode()}${featuredTicoEpisode()}<section class="adventure-section"><div class="section-heading"><div><div class="eyebrow">ESCOLHA UMA HISTÓRIA. LEVE SUA CURIOSIDADE.</div><h2>Qual vai ser a aventura de hoje?</h2><p>Cada descoberta começa com um “e se…?”</p></div><a class="text-link" href="#aventuras">Explorar o quintal ↗</a></div><div class="adventure-grid">${adventures.slice(0,4).map(card).join('')}</div></section><section class="adventure-section aw-new-section"><div class="section-heading"><div><div class="eyebrow">MAIS JEITOS DE CUIDAR DO NOSSO MUNDO DIGITAL</div><h2>Pequenas atitudes, grandes cuidados.</h2><p>Cinco histórias para cuidar da turma e descobrir novas pistas.</p></div></div><div class="adventure-grid">${awarenessAdventures.map(card).join('')}</div></section><aside class="story-teaser"><span class="teaser-doodle" aria-hidden="true">✧</span><div><h2>O melhor ingrediente? A sua imaginação.</h2><p>Miau tem muitas ideias. Bit adora experimentar. Luma traz novas perguntas. E você é a peça que faltava nessa turma!</p></div><a class="button yellow" href="#turma">Conhecer nossa turma <span aria-hidden="true">↗</span></a></aside>`;
}
function ticoSVG() {
  return `<svg class="friend-art" viewBox="0 0 180 210" role="img" aria-label="Tico, robozinho branco e amarelo com dois olhos azuis e duas esteiras"><ellipse cx="90" cy="199" rx="65" ry="8" fill="#dbeade"/><path d="M90 36l5-16" stroke="#6c8179" stroke-width="5" stroke-linecap="round"/><circle cx="98" cy="15" r="9" fill="#6bcdd0"/><circle cx="98" cy="15" r="4" fill="#fff5da"/><path d="M49 119l-20 19m100-18 20-18" stroke="#6c8179" stroke-width="11" stroke-linecap="round"/><circle cx="27" cy="140" r="11" fill="#e9ba55"/><circle cx="151" cy="98" r="11" fill="#e9ba55"/><rect x="43" y="99" width="94" height="64" rx="22" fill="#fff5da" stroke="#6c8179" stroke-width="3"/><rect x="66" y="111" width="48" height="37" rx="11" fill="#6bc1b9"/><circle cx="90" cy="136" r="8" fill="#f1ca69"/><circle cx="76" cy="122" r="4" fill="#f1ca69"/><circle cx="88" cy="119" r="4" fill="#f1ca69"/><circle cx="101" cy="122" r="4" fill="#f1ca69"/><rect x="34" y="153" width="35" height="43" rx="15" fill="#344b46"/><rect x="111" y="153" width="35" height="43" rx="15" fill="#344b46"/><path d="M39 161h9m-10 26h10m79-26h12m-12 26h12" stroke="#6c8179" stroke-width="3" stroke-linecap="round"/><circle cx="54" cy="175" r="11" fill="#e9ba55"/><circle cx="126" cy="175" r="11" fill="#e9ba55"/><circle cx="54" cy="175" r="4" fill="#fff5da"/><circle cx="126" cy="175" r="4" fill="#fff5da"/><path d="M72 163h36" stroke="#e9ba55" stroke-width="11"/><circle cx="30" cy="70" r="12" fill="#e9ba55"/><circle cx="150" cy="70" r="12" fill="#e9ba55"/><rect x="36" y="35" width="108" height="73" rx="26" fill="#fff5da" stroke="#6c8179" stroke-width="3"/><path d="M66 36h48" stroke="#e9ba55" stroke-width="7" stroke-linecap="round"/><rect x="47" y="47" width="86" height="49" rx="17" fill="#243e36"/><ellipse cx="68" cy="67" rx="8" ry="10" fill="#73d8d8"/><ellipse cx="112" cy="67" rx="8" ry="10" fill="#73d8d8"/><path d="M79 83q11 10 22 0" fill="none" stroke="#73d8d8" stroke-width="3" stroke-linecap="round"/></svg>`;
}
function nicoSVG() {
  return `<svg class="friend-art" viewBox="0 0 180 210" role="img" aria-label="Nico, cachorrinho caramelo de camiseta azul com um raio amarelo e controle verde"><path d="M132 157q42 3 24-28" fill="none" stroke="#dba15d" stroke-width="14" stroke-linecap="round"/><ellipse cx="90" cy="204" rx="60" ry="5" fill="#dbeade"/><path d="M65 184v15m49-15v15" stroke="#dba15d" stroke-width="14" stroke-linecap="round"/><path d="M52 201h28m22 0h28" stroke="#d98a49" stroke-width="13" stroke-linecap="round"/><rect x="52" y="157" width="34" height="34" rx="8" fill="#536e7e"/><rect x="96" y="157" width="34" height="34" rx="8" fill="#536e7e"/><path d="M47 128l-15 27m101-27 14 27" stroke="#dba15d" stroke-width="16" stroke-linecap="round"/><path d="M56 114q34-16 68 0l13 53H45z" fill="#4a90ad"/><path d="M94 119l-14 20h12l-8 18 22-25H94l8-13z" fill="#f6d073"/><ellipse cx="42" cy="70" rx="22" ry="41" fill="#b98149" transform="rotate(9 42 70)"/><ellipse cx="138" cy="70" rx="22" ry="41" fill="#b98149" transform="rotate(-9 138 70)"/><ellipse cx="90" cy="71" rx="53" ry="52" fill="#dfab6b"/><path d="M65 28q1-18 21-17l-7 10q17-13 29-4l-13 8" fill="#e8bb7d"/><path d="M53 68q10-8 19-3m35 0q10-6 20 3" fill="none" stroke="#ad7846" stroke-width="3" stroke-linecap="round"/><ellipse cx="68" cy="77" rx="6" ry="9" fill="#634e39"/><ellipse cx="113" cy="77" rx="6" ry="9" fill="#634e39"/><circle cx="66" cy="74" r="2" fill="#fff5da"/><circle cx="111" cy="74" r="2" fill="#fff5da"/><ellipse cx="90" cy="100" rx="29" ry="22" fill="#fff0d4"/><ellipse cx="90" cy="91" rx="10" ry="7" fill="#344b46"/><path d="M78 104q12 12 25 0" fill="none" stroke="#87623f" stroke-width="3" stroke-linecap="round"/><path d="M51 145h78q11 0 14 16 1 13-11 9l-13-6H62l-14 6q-12 4-10-9 2-16 13-16z" fill="#50836f" stroke="#344b46" stroke-width="3"/><path d="M59 151v12m-6-6h12" stroke="#fff5da" stroke-width="3" stroke-linecap="round"/><circle cx="119" cy="153" r="3" fill="#f6d073"/><circle cx="129" cy="160" r="3" fill="#f6d073"/><circle cx="38" cy="153" r="9" fill="#dfab6b"/><circle cx="143" cy="153" r="9" fill="#dfab6b"/></svg>`;
}
function friendsOfTheYard() {
  return `<section class="friends-section" aria-labelledby="friends-title"><div class="section-heading"><div><span class="eyebrow">NOVOS AMIGOS, NOVAS DESCOBERTAS</span><h2 id="friends-title">Amigos do quintal</h2><p>Tico e Nico chegaram para brincar e descobrir com a turma.</p></div></div><div class="friends-grid"><article class="friend-card friend-tico">${ticoSVG()}<div class="friend-copy"><span class="eyebrow">A INVENÇÃO DO MIAU</span><h3>Tico</h3><p>Um robozinho cheio de vontade de ajudar! Adora organizar as coisas e aprende com Miau a seguir instruções bem claras.</p><a class="button secondary small" href="${ticoEpisode.url}" target="_blank" rel="noopener noreferrer" data-watch-video>Ver a história do Tico <span aria-hidden="true">↗</span></a></div></article><article class="friend-card friend-nico">${nicoSVG()}<div class="friend-copy"><span class="eyebrow">O AMIGO QUE ADORA JOGAR</span><h3>Nico</h3><p>Um cachorrinho curioso que chegou com seu controle na pata. Descobriu que jogar com os amigos deixa a aventura ainda melhor!</p><a class="button secondary small" href="${nicoEpisode.url}" target="_blank" rel="noopener noreferrer" data-watch-video>Ver a história do Nico <span aria-hidden="true">↗</span></a></div></article></div></section>`;
}
function characters() {
  main.innerHTML = `<section class="page-heading"><div class="eyebrow">AMIGOS, IDEIAS E UM QUINTAL INTEIRINHO.</div><h1>Prazer, sua nova turma!</h1><p>Miau inventa, Bit experimenta e Luma quer explorar. Falta só você para a próxima história começar.</p></section><section class="character-section"><article class="character-card">${catSVG()}<div><span class="eyebrow">O GATINHO INVENTOR</span><h2>Miau</h2><p>Tem ideias até de ponta-cabeça! Guarda parafusos no bolso e adora perguntar: “E se a gente tentasse de outro jeito?”</p><blockquote>“Errar também faz parte de inventar!”</blockquote></div></article><article class="character-card robot">${robotSVG()}<div><span class="eyebrow">O ROBOZINHO CURIOSO</span><h2>Bit</h2><p>É pequeno, gentil e cheio de perguntas. Gosta de seguir pistas, organizar peças e cuidar dos amigos no mundo digital.</p><blockquote>“Bip-bip! Vamos descobrir juntos?”</blockquote></div></article><article class="character-card luma">${lumaSVG()}<div><span class="eyebrow">A GATINHA EXPLORADORA</span><h2>Luma</h2><p>Chegou de mochila nas costas e cheia de perguntas! Adora explorar, seguir pistas e convidar os amigos para descobrir o que vem depois.</p><blockquote>“Vamos descobrir o que tem por lá?”</blockquote><a class="text-link" href="${lumaEpisode.url}" target="_blank" rel="noopener noreferrer" data-watch-video aria-label="Assistir à primeira aventura da Luma no YouTube, em outra aba">Ver sua primeira aventura ↗</a></div></article></section>${friendsOfTheYard()}<section class="team-banner"><img src="assets/quintal.webp" alt="Miau e Bit brincando de inventar no quintal." width="768" height="512"><div><span class="eyebrow">O NOSSO COMBINADO</span><h2>Aqui, toda ideia tem espaço.</h2><p>Você pode tentar, mudar de ideia e começar de novo. Sem corrida e sem nota: a diversão é descobrir junto.</p><a class="button primary" href="#aventuras">Vamos brincar? <span aria-hidden="true">↗</span></a></div></section>`;
}
function adventureList() { renderAdventureCatalogue(); }
function accomplishments() { renderDiscoveries(); }
function gameShell(a, story, stage, panel, note) {
  main.innerHTML=`<section class="breadcrumb"><a href="#aventuras">← Todas as aventuras</a><span aria-hidden="true"> / </span>${a.filter==='proteger'?'Segurança digital':a.category==='LÓGICA'?'Lógica':a.id==='sql'?'SQL':a.id.charAt(0).toUpperCase()+a.id.slice(1)}</section><section class="game-layout"><div class="game-title"><div><div class="eyebrow">${a.tag}<span class="story-tag">◷ ${a.time}</span></div><h1>${a.title}</h1><p id="story-text">${story}</p></div><button class="button secondary small" id="read-story"><span aria-hidden="true">♫</span> Ouvir história</button></div><div class="game-stage" id="game-stage">${stage}</div><div class="game-panel" id="game-panel">${panel}</div><aside class="learning-note"><span aria-hidden="true">✦</span><div><h3>Uma descoberta escondida na brincadeira</h3><p>${note}</p></div></aside></section>`;
  $('.game-title').insertAdjacentHTML('afterend', phaseNavigation(a));
  const readButton=$('#read-story');
  if (!('speechSynthesis' in window)) { readButton.hidden=true; } else {readButton.onclick=()=>{ if(window.speechSynthesis.speaking){window.speechSynthesis.cancel();readButton.innerHTML='<span aria-hidden="true">♫</span> Ouvir história';return;} speech=new SpeechSynthesisUtterance($('#story-text').textContent);speech.lang='pt-BR';speech.rate=.9;speech.onend=()=>{if(readButton.isConnected)readButton.innerHTML='<span aria-hidden="true">♫</span> Ouvir história';};speech.onerror=()=>{if(readButton.isConnected){readButton.innerHTML='<span aria-hidden="true">♫</span> Ouvir história';toast('A voz não ficou disponível. Vamos ler com alguém?');}};window.speechSynthesis.speak(speech);readButton.innerHTML='<span aria-hidden="true">■</span> Parar leitura';}; }
}
const nextLinks = () => phaseNextLinks();
function scratchGame(a) { phasePathGame(a); }
function pythonGame(a) { phaseLightsGame(a); }
function sqlGame(a) { phaseSearchGame(a); }
const safetyStories=[
  {from:'Uma mensagem de alguém desconhecido',avatar:'?',text:'“Você ganhou um foguete! Toque aqui e escreva sua senha para receber!”',link:'Resgatar meu foguete',story:'Bip-bip! Chegou uma mensagem com um presente. Mas ela pede uma senha… Ajude Bit a escolher o próximo passo.',choices:[{icon:'↗',text:'Tocar e escrever a senha.',correct:false},{icon:'♡',text:'Não tocar e chamar um adulto de confiança.',correct:true}],good:'Boa ideia! Um presente não precisa da sua senha. Bit deixa a mensagem quietinha e chama um adulto de confiança.',bad:'Opa! Senhas são segredos. Quando uma mensagem pede a sua, não toque no link. Chame um adulto de confiança.'},
  {from:'Um pedido dentro de um joguinho',avatar:'★',text:'“Para liberar o planeta secreto, escreva o endereço da sua casa.”',link:'Liberar planeta',story:'Agora, um joguinho pediu o endereço da casa de Miau. Será que toda pergunta da tela precisa de resposta?',choices:[{icon:'♡',text:'Parar e pedir ajuda a um adulto de confiança.',correct:true},{icon:'⌂',text:'Contar onde Miau mora.',correct:false}],good:'Isso! O endereço de casa é uma informação pessoal. Miau pode pedir ajuda antes de compartilhar qualquer dado.',bad:'Melhor guardar esse segredo! O endereço é uma informação pessoal. Vamos pedir ajuda a um adulto antes de contar?'},
  {from:'Uma conversa na tela',avatar:'…',text:'“Mande uma foto sua e não conte para ninguém. Vai ser nosso segredo!”',link:'Enviar foto',story:'A última mensagem deixou Bit com uma pulguinha atrás da antena. Alguém pediu uma foto em segredo. O que a turma pode fazer?',choices:[{icon:'▧',text:'Enviar uma foto e guardar segredo.',correct:false},{icon:'♡',text:'Não enviar e contar a um adulto de confiança.',correct:true}],good:'Você cuidou da turma! Bit não envia a foto e conta o que aconteceu. Quando algo assusta ou pede segredo, sempre podemos pedir ajuda.',bad:'Você pode pedir ajuda! Não envie a foto. Conte a um adulto de confiança: você não precisa guardar um segredo que deixa você desconfortável.'}
];
function safetyGame(a) {
  let index=0,answered=false;
  gameShell(a,safetyStories[0].story,'','','Quando algo na internet pede senha, dados ou segredo, você pode parar e conversar com um adulto de confiança. Pedir ajuda é um superpoder!');
  function show(){answered=false;const s=safetyStories[index];$('#story-text').textContent=s.story;$('#game-stage').innerHTML=`<div class="stage-label"><span>UMA SURPRESA NA TELA</span><span>${index+1} DE 3</span></div><div class="safety-message"><div class="message-from"><span class="message-avatar" aria-hidden="true">${s.avatar}</span>${s.from}</div><p>${s.text}</p><span class="mock-link" aria-label="Botão de faz de conta da mensagem">${s.link} ↗</span></div><div class="safety-progress" aria-label="Mensagem ${index+1} de 3">${[0,1,2].map(n=>`<span class="${n<index?'done':''}"></span>`).join('')}</div>`;$('#game-panel').innerHTML=`<h2>O que vamos fazer?</h2><p>Ajude a turma a cuidar do quintal digital.</p><div class="choices">${s.choices.map((c,i)=>`<button class="choice" data-choice="${i}"><span aria-hidden="true">${c.icon}</span>${c.text}</button>`).join('')}</div><div class="feedback" id="safe-feedback" role="status" aria-live="polite">Pode pensar com calma. Miau e Bit estão com você.</div><div id="safe-next"></div>`;$$('[data-choice]').forEach(b=>b.onclick=()=>{if(answered)return;const c=s.choices[Number(b.dataset.choice)];const f=$('#safe-feedback');$$('[data-choice]').forEach(x=>x.classList.remove('bad','selected'));b.classList.add(c.correct?'selected':'bad');f.className=`feedback ${c.correct?'success':'error'}`;f.textContent=c.correct?s.good:s.bad;if(c.correct){answered=true;$('#safe-next').innerHTML=`<button class="button primary run" id="next-message">${index===2?'Abrir minha surpresa':'Próxima pista'} <span aria-hidden="true">→</span></button>`;$('#next-message').onclick=()=>{index++;if(index<3){show();$('#story-text').scrollIntoView({behavior:'instant',block:'center'});}else finish();};}}); }
  function finish(){award('safety');$('#story-text').textContent='Miau e Bit aprenderam que cuidar dos amigos também é uma grande aventura. Você ajudou a turma a encontrar escolhas seguras!';$('#game-stage').innerHTML='<div class="safety-celebrate"><span class="big-star" aria-hidden="true">✦</span><h2>Guardião do quintal!</h2><p>Uma estrela para quem cuida de si e dos amigos.</p></div>';$('#game-panel').innerHTML='<h2>Seu superpoder é pedir ajuda.</h2><p>Uma senha fica em segredo. Seus dados merecem cuidado. E um adulto de confiança pode ajudar quando algo parece estranho.</p><div class="feedback success" role="status">Você encontrou a estrela do cuidado! ✦</div>'+nextLinks()+'<button class="text-button" id="play-safety-again">↶ Brincar de novo</button>';$('#play-safety-again').onclick=()=>{index=0;show();};}
  show();
}
function novaAventuraArt(id) {
  const farol = '<path d="M25 110h51q12-2 8-14-4-9-15-7-2-16-18-16-17 0-20 17-13-1-14 10-1 10 8 10z" fill="#fff5da"/><path d="M89 145h89q16 0 16-12t-17-12q-3-20-23-18-17 1-20 17-17-9-27 7-26-4-25 9 0 9 7 9z" fill="#a8c5af"/><path d="M110 134l8-65h29l9 65z" fill="#fff5da" stroke="#397d70" stroke-width="4" stroke-linejoin="round"/><path d="M115 90h35l3 16h-40z" fill="#397d70"/><rect x="115" y="45" width="36" height="26" rx="5" fill="#e7bb5f" stroke="#397d70" stroke-width="4"/><path d="M109 44l24-22 24 22z" fill="#397d70"/><path d="M127 51h12v12h-12z" fill="#fff5da"/><path d="M162 49l42-13m-42 28 42 13" fill="none" stroke="#e6b84f" stroke-width="5" stroke-linecap="round"/><path d="M77 38v15M70 45h14M209 112v13M203 118h13" stroke="#e99b61" stroke-width="4"/>';
  const circuito = '<path d="M48 106h39v-19h28m51 0h35v26h20" fill="none" stroke="#8cad70" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/><rect x="22" y="81" width="34" height="47" rx="8" fill="#fff5da" stroke="#397d70" stroke-width="4"/><path d="M33 76h12M39 93v16m-8-8h16" stroke="#397d70" stroke-width="4" stroke-linecap="round"/><circle cx="221" cy="113" r="11" fill="#e7bb5f" stroke="#397d70" stroke-width="4"/><path d="M125 38V25" stroke="#397d70" stroke-width="5"/><circle cx="125" cy="21" r="6" fill="#e99b61"/><rect x="86" y="40" width="80" height="61" rx="19" fill="#397d70"/><rect x="96" y="50" width="60" height="39" rx="12" fill="#fff5da"/><circle cx="111" cy="66" r="5" fill="#397d70"/><circle cx="141" cy="66" r="5" fill="#397d70"/><path d="M119 78q7 7 14 0" fill="none" stroke="#397d70" stroke-width="3" stroke-linecap="round"/><rect x="101" y="99" width="50" height="37" rx="11" fill="#397d70"/><path d="M115 115h22" stroke="#e7bb5f" stroke-width="6" stroke-linecap="round"/><path d="M110 137v8m32-8v8" stroke="#397d70" stroke-width="7" stroke-linecap="round"/><path d="M65 35v14M58 42h14M191 31v12M185 37h12" stroke="#e99b61" stroke-width="4"/>';
  const luma = '<path d="M30 137q85 26 190-7" fill="none" stroke="#a6c5bc" stroke-width="13" stroke-linecap="round" stroke-dasharray="2 17"/><rect x="29" y="126" width="59" height="18" rx="7" fill="#397d70"/><rect x="153" y="127" width="64" height="18" rx="7" fill="#9ab6a0"/><path d="M198 125v-22m0 10q-15-11-20-1 12 12 20 1" fill="none" stroke="#397d70" stroke-width="4" stroke-linecap="round"/><circle cx="198" cy="92" r="16" fill="#a694c3"/><circle cx="198" cy="92" r="6" fill="#fff5da"/><path d="M41 51v15M34 58h14M221 42v12M215 48h12" stroke="#e99b61" stroke-width="4"/>' + lumaSVG().replace('<svg ', '<svg x="81" y="0" width="102" height="133" ');
  const drawings = {farol: farol, circuito: circuito, travessia: luma};
  return '<svg class="art-svg" viewBox="0 0 250 160" aria-hidden="true">' + drawings[id] + '</svg>';
}
function novasAventurasSection() {
  const jogos = [
    {id:'farol',titulo:'O Farol das Nuvens',desc:'Salte entre plataformas, encontre estrelas e acenda o farol mágico.',link:'novas-aventuras/farol-das-nuvens/index.html',categoria:'AVENTURA'},
    {id:'circuito',titulo:'O Circuito do Bit',desc:'Empurre as baterias até os terminais e faça o circuito funcionar.',link:'novas-aventuras/circuito-do-bit/index.html',categoria:'LÓGICA'},
    {id:'travessia',titulo:'A Travessia da Luma',desc:'Atravesse ilhas flutuantes e chegue ao jardim com a gatinha cinza.',link:'novas-aventuras/travessia-da-luma/index.html',categoria:'EXPLORAÇÃO'}
  ];
  return `<section class="novas-aventuras-section" aria-labelledby="novas-aventuras-title"><div class="section-heading"><div><span class="eyebrow">TRÊS NOVAS BRINCADEIRAS</span><h2 id="novas-aventuras-title">Mais aventuras para descobrir!</h2><p>Escolha sua aventura e divirta-se!</p></div></div><div class="adventure-grid novas-aventuras-grid">${jogos.map(j=>`<a class="adventure-card nova-aventura-card" href="${j.link}" aria-label="Jogar ${j.titulo}"><div class="adventure-illustration nova-aventura-arte ${j.id}">${novaAventuraArt(j.id)}</div><div class="card-content"><div class="card-label"><span>${j.categoria}</span></div><h3>${j.titulo}</h3><p>${j.desc}</p><div class="card-cta">Jogar agora <span aria-hidden="true">↗</span></div></div></a>`).join('')}</div></section>`;
}
function route() {
  visit++; if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  const hash = location.hash.replace(/^#/,'') || 'inicio';
  const gameId = hash.startsWith('aventura/') ? hash.split('/')[1] : null;
  const a = adventures.find(item => item.id === gameId);
  const nav = gameId || hash === 'novidades' ? 'aventuras' : hash;
  $$('[data-nav]').forEach(link => { link.classList.toggle('active',link.dataset.nav === nav); if (link.dataset.nav === nav) link.setAttribute('aria-current','page'); else link.removeAttribute('aria-current'); });
  if (hash === 'episodios') episodePage();
  else if (hash === 'turma') characters();
  else if (hash === 'aventuras') adventureList();
  else if (hash === 'conquistas') accomplishments();
  else if (hash === 'novidades') bonusHub();
  else if (a && !adventureUnlocked(a)) bonusHub();
  else if (a && requestedPhase(a.id) > completedPhases(a.id) + 1) phaseGate(a);
  else if (a) ({scratch:scratchGame,python:pythonGame,sql:sqlGame,safety:safetyGame,...awarenessGames,...bonusGames})[a.id](a);
  else { home(); decorateJourneyHome(); }
  if (hash === 'inicio' || hash === 'aventuras') {
    main.insertAdjacentHTML('beforeend', novasAventurasSection());
  }
  const titles = {episodios:'Histórias para assistir',inicio:'O quintal das ideias',turma:'Conheça a turma',aventuras:'Escolha sua aventura',conquistas:'Minhas descobertas',novidades:'As surpresas da Luma'};
  document.title = (a ? a.title + (phaseCount(a.id) > 1 ? ' · Fase ' + requestedPhase(a.id) : '') : titles[hash] || titles.inicio) + ' · Miau & Bit';
  window.scrollTo({top:0,behavior:'instant'}); main.focus({preventScroll:true}); updateProgress(); bindEpisodeLinks(); maybeCelebrateJourney(); window.dispatchEvent(new Event('miau:pagechange'));
}

$('#grownups').onclick=()=>$('#grownups-dialog').showModal();
$('#close-grownups').onclick=()=>$('#grownups-dialog').close();
$('#grownups-episodes').onclick=()=>$('#grownups-dialog').close();
$('.close-dialog').onclick=()=>$('#grownups-dialog').close();
$('#grownups-dialog').addEventListener('click',e=>{if(e.target===$('#grownups-dialog')){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close();}});
$('.skip').onclick=e=>{e.preventDefault();main.focus({preventScroll:true});main.scrollIntoView({behavior:'instant'});};
window.addEventListener('hashchange',route);route();
